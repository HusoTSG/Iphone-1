// Serveur de notifications HusoFit (Cloudflare Worker).
// L'appli lui dit « préviens-moi à telle heure » et il envoie la notif « Repos terminé » au bon moment.
import { DurableObject } from 'cloudflare:workers';
import { makeVapidKeys, sendPush } from './webpush.js';

const CONTACT = 'https://husotsg.github.io/Iphone-1/';
const PUSH_HOSTS = [/\.push\.apple\.com$/, /^fcm\.googleapis\.com$/, /\.mozilla\.com$/, /\.notify\.windows\.com$/];
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const hub = env.HUB.get(env.HUB.idFromName('main'));
    return hub.fetch(req);
  },
};

export class Hub extends DurableObject {
  async keys() {
    let k = await this.ctx.storage.get('vapid');
    if (!k) { k = await makeVapidKeys(); await this.ctx.storage.put('vapid', k); }
    return k;
  }

  async jobs() { return (await this.ctx.storage.get('jobs')) || {}; }

  async saveJobs(jobs) {
    await this.ctx.storage.put('jobs', jobs);
    const next = Math.min(...Object.values(jobs).map((j) => j.at));
    if (Number.isFinite(next)) await this.ctx.storage.setAlarm(next);
    else await this.ctx.storage.deleteAlarm();
  }

  okEndpoint(ep) {
    try {
      const u = new URL(ep);
      if (this.env.DEV === '1' && u.hostname === '127.0.0.1') return true;
      return u.protocol === 'https:' && PUSH_HOSTS.some((r) => r.test(u.hostname));
    } catch { return false; }
  }

  async fetch(req) {
    const path = new URL(req.url).pathname.replace(/\/+$/, '');
    if (req.method === 'GET' && path === '/key') return json({ key: (await this.keys()).pub });
    if (req.method !== 'POST') return json({ ok: true, name: 'HusoFit notifications' });

    let b;
    try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
    const ep = b.sub ? b.sub.endpoint : b.endpoint;
    if (!ep || !this.okEndpoint(ep)) return json({ error: 'bad endpoint' }, 400);
    const jobs = await this.jobs();

    if (path === '/cancel') { delete jobs[ep]; await this.saveJobs(jobs); return json({ ok: true }); }

    if (path === '/schedule') {
      const s = b.sub;
      if (!s || !s.keys || !s.keys.p256dh || !s.keys.auth) return json({ error: 'bad sub' }, 400);
      const at = Math.max(Number(b.at) || 0, Date.now());
      if (at > Date.now() + 3600 * 1000) return json({ error: 'too far' }, 400);
      jobs[ep] = { sub: { endpoint: ep, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } }, at, msg: { title: String(b.title || 'Repos terminé').slice(0, 80), body: String(b.body || 'C’est reparti !').slice(0, 160) } };
      const list = Object.entries(jobs);
      if (list.length > 20) delete jobs[list.sort((x, y) => x[1].at - y[1].at)[0][0]];
      await this.saveJobs(jobs);
      return json({ ok: true, at });
    }
    return json({ error: 'not found' }, 404);
  }

  async alarm() {
    const jobs = await this.jobs();
    const now = Date.now() + 500;
    const keys = await this.keys();
    for (const [ep, j] of Object.entries(jobs)) {
      if (j.at > now) continue;
      delete jobs[ep];
      try { await sendPush(j.sub, j.msg, keys, CONTACT); } catch (e) { console.log('push error', e && e.message); }
    }
    await this.saveJobs(jobs);
  }
}
