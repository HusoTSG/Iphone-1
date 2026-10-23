// Données de départ : bibliothèque d'exercices, aliments courants, programme et habitudes.
// Valeurs nutritionnelles moyennes pour 100 g (kcal, protéines, glucides, lipides).

const MUSCLES = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Ischios', 'Fessiers', 'Mollets', 'Abdos', 'Cardio'];

const EXERCISES = [
  // Pectoraux
  { id: 'bench', name: 'Développé couché', muscle: 'Pectoraux', equip: 'Barre' },
  { id: 'incline-db', name: 'Développé incliné haltères', muscle: 'Pectoraux', equip: 'Haltères' },
  { id: 'incline-bench', name: 'Développé incliné barre', muscle: 'Pectoraux', equip: 'Barre' },
  { id: 'db-bench', name: 'Développé couché haltères', muscle: 'Pectoraux', equip: 'Haltères' },
  { id: 'chest-press', name: 'Chest press machine', muscle: 'Pectoraux', equip: 'Machine' },
  { id: 'cable-fly', name: 'Écartés poulie vis-à-vis', muscle: 'Pectoraux', equip: 'Poulie' },
  { id: 'pec-deck', name: 'Pec deck', muscle: 'Pectoraux', equip: 'Machine' },
  { id: 'dips', name: 'Dips', muscle: 'Pectoraux', equip: 'Poids du corps' },
  { id: 'pushup', name: 'Pompes', muscle: 'Pectoraux', equip: 'Poids du corps' },
  // Dos
  { id: 'pullup', name: 'Tractions', muscle: 'Dos', equip: 'Poids du corps' },
  { id: 'lat-pulldown', name: 'Tirage vertical', muscle: 'Dos', equip: 'Poulie' },
  { id: 'barbell-row', name: 'Rowing barre', muscle: 'Dos', equip: 'Barre' },
  { id: 'db-row', name: 'Rowing haltère un bras', muscle: 'Dos', equip: 'Haltères' },
  { id: 'seated-row', name: 'Tirage horizontal', muscle: 'Dos', equip: 'Poulie' },
  { id: 'tbar-row', name: 'Rowing T-bar', muscle: 'Dos', equip: 'Barre' },
  { id: 'deadlift', name: 'Soulevé de terre', muscle: 'Dos', equip: 'Barre' },
  { id: 'pullover', name: 'Pull-over poulie', muscle: 'Dos', equip: 'Poulie' },
  // Épaules
  { id: 'ohp', name: 'Développé militaire', muscle: 'Épaules', equip: 'Barre' },
  { id: 'db-shoulder', name: 'Développé épaules haltères', muscle: 'Épaules', equip: 'Haltères' },
  { id: 'lateral-raise', name: 'Élévations latérales', muscle: 'Épaules', equip: 'Haltères' },
  { id: 'cable-lateral', name: 'Élévations latérales poulie', muscle: 'Épaules', equip: 'Poulie' },
  { id: 'rear-delt', name: 'Oiseau (deltoïde arrière)', muscle: 'Épaules', equip: 'Haltères' },
  { id: 'face-pull', name: 'Face pull', muscle: 'Épaules', equip: 'Poulie' },
  { id: 'shrug', name: 'Shrugs', muscle: 'Épaules', equip: 'Haltères' },
  // Biceps
  { id: 'barbell-curl', name: 'Curl barre', muscle: 'Biceps', equip: 'Barre' },
  { id: 'db-curl', name: 'Curl haltères', muscle: 'Biceps', equip: 'Haltères' },
  { id: 'hammer-curl', name: 'Curl marteau', muscle: 'Biceps', equip: 'Haltères' },
  { id: 'incline-curl', name: 'Curl incliné', muscle: 'Biceps', equip: 'Haltères' },
  { id: 'cable-curl', name: 'Curl poulie', muscle: 'Biceps', equip: 'Poulie' },
  { id: 'preacher-curl', name: 'Curl pupitre', muscle: 'Biceps', equip: 'Machine' },
  // Triceps
  { id: 'triceps-pushdown', name: 'Extensions triceps poulie', muscle: 'Triceps', equip: 'Poulie' },
  { id: 'overhead-ext', name: 'Extensions au-dessus de la tête', muscle: 'Triceps', equip: 'Poulie' },
  { id: 'skullcrusher', name: 'Barre au front', muscle: 'Triceps', equip: 'Barre' },
  { id: 'close-grip', name: 'Développé couché prise serrée', muscle: 'Triceps', equip: 'Barre' },
  // Jambes
  { id: 'squat', name: 'Squat', muscle: 'Quadriceps', equip: 'Barre' },
  { id: 'front-squat', name: 'Squat avant', muscle: 'Quadriceps', equip: 'Barre' },
  { id: 'hack-squat', name: 'Hack squat', muscle: 'Quadriceps', equip: 'Machine' },
  { id: 'leg-press', name: 'Presse à cuisses', muscle: 'Quadriceps', equip: 'Machine' },
  { id: 'leg-ext', name: 'Leg extension', muscle: 'Quadriceps', equip: 'Machine' },
  { id: 'bulgarian', name: 'Fentes bulgares', muscle: 'Quadriceps', equip: 'Haltères' },
  { id: 'lunge', name: 'Fentes marchées', muscle: 'Quadriceps', equip: 'Haltères' },
  { id: 'rdl', name: 'Soulevé de terre roumain', muscle: 'Ischios', equip: 'Barre' },
  { id: 'leg-curl', name: 'Leg curl', muscle: 'Ischios', equip: 'Machine' },
  { id: 'seated-leg-curl', name: 'Leg curl assis', muscle: 'Ischios', equip: 'Machine' },
  { id: 'hip-thrust', name: 'Hip thrust', muscle: 'Fessiers', equip: 'Barre' },
  { id: 'glute-kickback', name: 'Kickback fessier poulie', muscle: 'Fessiers', equip: 'Poulie' },
  { id: 'abduction', name: 'Abduction machine', muscle: 'Fessiers', equip: 'Machine' },
  { id: 'calf-standing', name: 'Mollets debout', muscle: 'Mollets', equip: 'Machine' },
  { id: 'calf-seated', name: 'Mollets assis', muscle: 'Mollets', equip: 'Machine' },
  // Abdos
  { id: 'plank', name: 'Gainage', muscle: 'Abdos', equip: 'Poids du corps' },
  { id: 'crunch-cable', name: 'Crunch poulie', muscle: 'Abdos', equip: 'Poulie' },
  { id: 'leg-raise', name: 'Relevés de jambes suspendu', muscle: 'Abdos', equip: 'Poids du corps' },
  { id: 'ab-wheel', name: 'Roue abdominale', muscle: 'Abdos', equip: 'Accessoire' },
  // Cardio
  { id: 'treadmill', name: 'Tapis de course', muscle: 'Cardio', equip: 'Machine' },
  { id: 'bike', name: 'Vélo', muscle: 'Cardio', equip: 'Machine' },
  { id: 'rower', name: 'Rameur', muscle: 'Cardio', equip: 'Machine' },
  { id: 'stairs', name: 'Stairmaster', muscle: 'Cardio', equip: 'Machine' },
];

// portion = grammes d'une unité (œuf, banane…) quand c'est pratique
const FOODS = [
  { id: 'f-chicken', name: 'Blanc de poulet cuit', kcal: 165, p: 31, c: 0, f: 3.6 },
  { id: 'f-turkey', name: 'Escalope de dinde cuite', kcal: 135, p: 29, c: 0, f: 1.7 },
  { id: 'f-beef5', name: 'Steak haché 5 %', kcal: 125, p: 21, c: 0, f: 4.5 },
  { id: 'f-beef15', name: 'Steak haché 15 %', kcal: 215, p: 18.5, c: 0, f: 15.5 },
  { id: 'f-ham', name: 'Jambon blanc', kcal: 115, p: 21, c: 1, f: 3, portion: 40, unit: 'tranche' },
  { id: 'f-salmon', name: 'Saumon', kcal: 208, p: 20, c: 0, f: 13 },
  { id: 'f-cod', name: 'Cabillaud', kcal: 82, p: 18, c: 0, f: 0.7 },
  { id: 'f-tuna', name: 'Thon au naturel (conserve)', kcal: 116, p: 26, c: 0, f: 1 },
  { id: 'f-shrimp', name: 'Crevettes cuites', kcal: 99, p: 24, c: 0.2, f: 0.3 },
  { id: 'f-egg', name: 'Œuf entier', kcal: 143, p: 12.6, c: 0.7, f: 9.5, portion: 55, unit: 'œuf' },
  { id: 'f-eggwhite', name: "Blanc d'œuf", kcal: 52, p: 10.9, c: 0.7, f: 0.2 },
  { id: 'f-tofu', name: 'Tofu ferme', kcal: 144, p: 15, c: 3, f: 9 },
  { id: 'f-whey', name: 'Whey protéine', kcal: 380, p: 78, c: 8, f: 6, portion: 30, unit: 'dose' },
  { id: 'f-skyr', name: 'Skyr nature', kcal: 63, p: 11, c: 4, f: 0.2 },
  { id: 'f-fb0', name: 'Fromage blanc 0 %', kcal: 46, p: 7.5, c: 4, f: 0.1 },
  { id: 'f-greek', name: 'Yaourt grec', kcal: 97, p: 9, c: 4, f: 5 },
  { id: 'f-milk', name: 'Lait demi-écrémé', kcal: 46, p: 3.3, c: 4.8, f: 1.6 },
  { id: 'f-emmental', name: 'Emmental', kcal: 380, p: 28, c: 0, f: 30 },
  { id: 'f-mozza', name: 'Mozzarella', kcal: 250, p: 18, c: 2, f: 19 },
  { id: 'f-rice', name: 'Riz blanc cuit', kcal: 130, p: 2.7, c: 28, f: 0.3 },
  { id: 'f-rice-raw', name: 'Riz basmati cru', kcal: 350, p: 8, c: 77, f: 1 },
  { id: 'f-pasta', name: 'Pâtes cuites', kcal: 131, p: 5, c: 25, f: 1.1 },
  { id: 'f-pasta-raw', name: 'Pâtes crues', kcal: 359, p: 12.5, c: 72, f: 1.5 },
  { id: 'f-quinoa', name: 'Quinoa cuit', kcal: 120, p: 4.4, c: 21, f: 1.9 },
  { id: 'f-oats', name: "Flocons d'avoine", kcal: 372, p: 13.5, c: 58.7, f: 7 },
  { id: 'f-bread', name: 'Pain complet', kcal: 247, p: 13, c: 41, f: 3.4, portion: 35, unit: 'tranche' },
  { id: 'f-baguette', name: 'Baguette', kcal: 270, p: 9, c: 56, f: 1.3 },
  { id: 'f-ricecake', name: 'Galette de riz', kcal: 387, p: 8, c: 81, f: 3, portion: 9, unit: 'galette' },
  { id: 'f-potato', name: 'Pomme de terre cuite', kcal: 87, p: 1.9, c: 20, f: 0.1 },
  { id: 'f-sweetpotato', name: 'Patate douce cuite', kcal: 90, p: 2, c: 21, f: 0.1 },
  { id: 'f-lentils', name: 'Lentilles cuites', kcal: 116, p: 9, c: 20, f: 0.4 },
  { id: 'f-chickpeas', name: 'Pois chiches cuits', kcal: 164, p: 8.9, c: 27, f: 2.6 },
  { id: 'f-banana', name: 'Banane', kcal: 89, p: 1.1, c: 23, f: 0.3, portion: 120, unit: 'banane' },
  { id: 'f-apple', name: 'Pomme', kcal: 52, p: 0.3, c: 14, f: 0.2, portion: 150, unit: 'pomme' },
  { id: 'f-berries', name: 'Fruits rouges', kcal: 50, p: 1, c: 11, f: 0.3 },
  { id: 'f-broccoli', name: 'Brocoli', kcal: 34, p: 2.8, c: 7, f: 0.4 },
  { id: 'f-greenbeans', name: 'Haricots verts', kcal: 31, p: 1.8, c: 7, f: 0.1 },
  { id: 'f-tomato', name: 'Tomate', kcal: 18, p: 0.9, c: 3.9, f: 0.2 },
  { id: 'f-salad', name: 'Salade verte', kcal: 15, p: 1.4, c: 2.9, f: 0.2 },
  { id: 'f-avocado', name: 'Avocat', kcal: 160, p: 2, c: 9, f: 15, portion: 140, unit: 'avocat' },
  { id: 'f-almonds', name: 'Amandes', kcal: 579, p: 21, c: 22, f: 50 },
  { id: 'f-pb', name: 'Beurre de cacahuète', kcal: 588, p: 25, c: 20, f: 50, portion: 15, unit: 'c. à s.' },
  { id: 'f-olive', name: "Huile d'olive", kcal: 884, p: 0, c: 0, f: 100, portion: 10, unit: 'c. à s.' },
  { id: 'f-honey', name: 'Miel', kcal: 304, p: 0.3, c: 82, f: 0, portion: 10, unit: 'c. à c.' },
  { id: 'f-darkchoc', name: 'Chocolat noir 70 %', kcal: 600, p: 8, c: 34, f: 43, portion: 10, unit: 'carré' },
  { id: 'f-cola', name: 'Soda type cola', kcal: 42, p: 0, c: 10.6, f: 0 },
];

const MEALS = [
  { id: 'b', name: 'Petit-déjeuner' },
  { id: 'l', name: 'Déjeuner' },
  { id: 's', name: 'Collations' },
  { id: 'd', name: 'Dîner' },
];

const MEASURES = [
  { id: 'waist', name: 'Tour de taille' },
  { id: 'chest', name: 'Poitrine' },
  { id: 'hips', name: 'Hanches' },
  { id: 'arm', name: 'Bras' },
  { id: 'thigh', name: 'Cuisse' },
  { id: 'calf', name: 'Mollet' },
];

const CHECKIN_SCALES = [
  { id: 'sleep', name: 'Sommeil' },
  { id: 'energy', name: 'Énergie' },
  { id: 'stress', name: 'Stress', inverse: true },
  { id: 'hunger', name: 'Faim', inverse: true },
  { id: 'adherence', name: 'Respect du plan' },
];

function seedPrograms() {
  const ex = (exId, sets, reps, rest) => ({ exId, sets, reps, rest });
  return [{
    id: 'ppl',
    name: 'Push Pull Legs',
    days: [
      { id: 'push', name: 'Push', exercises: [
        ex('bench', 4, '6-8', 150), ex('incline-db', 3, '8-10', 120), ex('ohp', 3, '8-10', 120),
        ex('lateral-raise', 3, '12-15', 60), ex('triceps-pushdown', 3, '10-12', 60),
      ] },
      { id: 'pull', name: 'Pull', exercises: [
        ex('pullup', 4, '6-10', 150), ex('barbell-row', 3, '8-10', 120), ex('seated-row', 3, '10-12', 90),
        ex('face-pull', 3, '15', 60), ex('barbell-curl', 3, '8-12', 60),
      ] },
      { id: 'legs', name: 'Legs', exercises: [
        ex('squat', 4, '5-8', 180), ex('rdl', 3, '8-10', 150), ex('leg-press', 3, '10-12', 120),
        ex('leg-curl', 3, '12', 60), ex('calf-standing', 4, '12-15', 60),
      ] },
    ],
  }, {
    id: 'fullbody',
    name: 'Full body 3 jours',
    days: [
      { id: 'fb-a', name: 'Full body A', exercises: [
        ex('squat', 3, '6-8', 150), ex('bench', 3, '6-8', 150), ex('barbell-row', 3, '8-10', 120), ex('plank', 3, '45 s', 60),
      ] },
      { id: 'fb-b', name: 'Full body B', exercises: [
        ex('deadlift', 3, '5', 180), ex('ohp', 3, '8', 120), ex('lat-pulldown', 3, '10', 90), ex('bulgarian', 3, '10', 90),
      ] },
      { id: 'fb-c', name: 'Full body C', exercises: [
        ex('leg-press', 3, '10-12', 120), ex('incline-db', 3, '10', 90), ex('seated-row', 3, '10-12', 90), ex('hammer-curl', 3, '12', 60),
      ] },
    ],
  }];
}

const SEED_HABITS = [
  { id: 'h-creatine', name: 'Prendre ma créatine' },
  { id: 'h-sleep', name: 'Dormir 7 h ou plus' },
  { id: 'h-veg', name: '5 portions de fruits et légumes' },
  { id: 'h-stretch', name: 'Étirements 10 min' },
];
