/**
 * One-shot migration: inserts the 12 static quotes into Firestore.
 * Run once: node scripts/seed-quotes.mjs
 *
 * NOTE: superseded by seed-firestore.mjs which also inserts articles.
 * WARNING: running this again will create duplicate documents.
 */

const PROJECT_ID = 'tilportofoliov2';
const API_KEY    = 'AIzaSyBKIvfW6bzn74oKQZ3hEJa0lyfZ2m5-1bg';
const BASE_URL   = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/quotes`;

const QUOTES = [
  {
    text: 'Learning makes perfect.',
    author: 'Israel Tientcheu',
    date: '2024-05-19',
    likes: 2,
    category: 'Growth',
    tags: ['apprentissage', 'croissance', 'excellence', 'pratique'],
    explanation: "On dit souvent \"practice makes perfect\", mais c'est l'apprentissage conscient qui précède toute pratique utile. Ce n'est pas le simple fait de répéter qui rend parfait — c'est comprendre pourquoi on le fait, absorber les retours, et s'améliorer intentionnellement. Cette citation rappelle que l'acte d'apprendre est lui-même le vecteur de la perfection.",
  },
  {
    text: "Je suis TILStack et TILStack c'est moi.",
    author: 'Israel Tientcheu',
    date: '2024-01-01',
    likes: 1,
    category: 'Identité',
    tags: ['identité', 'marque personnelle', 'authenticité'],
    explanation: "Une déclaration d'identité totale. TILStack n'est pas un pseudonyme ou un masque — c'est une extension de ce que je suis profondément. Dire \"c'est moi\" c'est affirmer que ce que je crée, ce que je partage et ce que je représente est indissociable de ma personne. Une façon de revendiquer l'authenticité dans un monde où beaucoup créent des personnages distincts de leur vraie nature.",
  },
  {
    text: "Courtois avec les grands et tu deviendras grand. Sois frustré et tu auras à frustrer les autres. C'est ma philosophie.",
    author: 'Israel Tientcheu',
    date: '2024-05-17',
    likes: 1,
    category: 'Philosophie',
    tags: ['relations humaines', 'attitude', 'philosophie', 'leadership'],
    explanation: "Ce que tu envoies dans l'univers te revient. La courtoisie n'est pas de la faiblesse — c'est une posture stratégique et éthique à la fois. En traitant les personnes influentes avec respect, on crée des ponts. En laissant la frustration guider ses interactions, on empoisonne progressivement son propre environnement. La philosophie ici est simple : sème ce que tu veux récolter.",
  },
  {
    text: 'La conséquence corrige. Le conseil prévient.',
    author: 'Israel Tientcheu',
    date: '2024-05-09',
    likes: 2,
    category: 'Sagesse',
    tags: ['sagesse', 'prévention', 'erreurs', 'conseil'],
    explanation: "Deux chemins pour apprendre : l'un douloureux, l'autre élégant. La conséquence — l'échec, la peine, la perte — t'oblige à corriger ta trajectoire après coup. Le conseil, lui, t'offre la correction avant l'impact. L'intelligence consiste à choisir d'écouter avant de subir. Mais ceux qui n'écoutent pas les conseils reçoivent toujours les leçons — juste plus tard, et plus cher.",
  },
  {
    text: 'Le juge ne juge pas car il aime juger. Le juge juge car il est juste. Mais où donc sont ses juges justes qui ne jugent que pour la justice ?',
    author: 'Israel Tientcheu',
    date: '2024-05-06',
    likes: 2,
    category: 'Justice',
    tags: ['justice', 'société', 'éthique', 'philosophie', 'institutions'],
    explanation: "Une réflexion sur la légitimité du jugement. L'idéal du juge est celui qui agit par devoir de justice, non par plaisir du pouvoir ou du verdict. La vraie question posée est systémique : qui contrôle ceux qui jugent ? Qui garantit que les gardiens de la justice ne soient pas eux-mêmes corrompus par la fonction ? C'est une invitation à questionner les institutions plutôt qu'à s'y soumettre aveuglément.",
  },
  {
    text: "Il est impossible de connaître sa position dans le cœur d'autrui. Mais il est possible de la ressentir par les actes.",
    author: 'Israel Tientcheu',
    date: '2024-04-25',
    likes: 2,
    category: 'Relations',
    tags: ['relations humaines', 'empathie', 'amour', 'confiance', 'actes'],
    explanation: "Les mots peuvent mentir. Les actes, rarement. On ne peut pas sonder directement l'intérieur d'un autre être — ses pensées, ses émotions profondes restent opaques. Mais le comportement est une fenêtre. La fréquence des appels, la qualité de la présence, les sacrifices consentis : ces signaux disent plus sur ta place dans la vie de quelqu'un que n'importe quelle déclaration. Observe les actes, pas les promesses.",
  },
  {
    text: "Apprécie le bonheur qui s'épanouit dans tout ce que tu as autour de toi.",
    author: 'Israel Tientcheu',
    date: '2024-04-25',
    likes: 2,
    category: 'Bonheur',
    tags: ['bonheur', 'gratitude', 'présent', 'pleine conscience', 'contentement'],
    explanation: "Le bonheur n'est pas une destination lointaine — il est déjà là, diffus dans les petites choses du quotidien. Le problème n'est pas son absence mais notre incapacité à le percevoir. Cette citation est un appel à la pleine conscience et à la gratitude : regarder autour de soi avec des yeux neufs, et reconnaître la richesse invisible de ce qu'on possède déjà.",
  },
  {
    text: "L'arrogance précède la ruine et l'orgueil précède la chute. Mais l'humilité précède la gloire.",
    author: 'Israel Tientcheu',
    date: '2024-04-22',
    likes: 1,
    category: 'Sagesse',
    tags: ['humilité', 'orgueil', 'caractère', 'sagesse', 'succès'],
    explanation: "Une loi immuable de la vie humaine. L'arrogance ferme les yeux sur les angles morts et mène droit à l'erreur fatale. L'orgueil refuse d'apprendre et finit par s'effondrer sous son propre poids. L'humilité, elle, garde l'esprit ouvert, les oreilles dressées et les pieds sur terre — ce qui permet de construire en durée. Les plus grands — en sport, en business, en art — partagent tous cette qualité invisible.",
  },
  {
    text: 'Toute vérité est bonne à dire.',
    author: 'Israel Tientcheu',
    date: '2024-02-15',
    likes: 1,
    category: 'Vérité',
    tags: ['vérité', 'honnêteté', 'communication', 'courage'],
    explanation: "Contre la culture du silence et du politiquement correct à outrance. Parfois, taire la vérité par peur de blesser cause bien plus de dégâts que de l'énoncer clairement. Une vérité dite avec bienveillance — même difficile — respecte davantage l'autre qu'un mensonge confortable. Le courage de la vérité est l'un des plus nobles que l'on puisse exercer.",
  },
  {
    text: "N'attends pas d'être heureux pour sourire. Souris plutôt pour être heureux. Je souris pour rendre heureux.",
    author: 'Rev. Minyem Philippe',
    date: '2024-03-28',
    likes: 1,
    category: 'Bonheur',
    tags: ['bonheur', 'sourire', 'positivité', 'altruisme', 'mindset'],
    explanation: "Une inversion magnifique de la causalité. On pense souvent que le bonheur produit le sourire — mais la science (et la sagesse populaire) montrent l'inverse : sourire déclenche des émotions positives dans le cerveau. Et l'ajout \"je souris pour rendre heureux\" élève encore le propos : le sourire devient un acte de don, une façon d'offrir de la lumière autour de soi indépendamment de son propre état intérieur.",
  },
  {
    text: "Certaines relations n'ont pour vocation que de te diluer.",
    author: 'Israel Tientcheu',
    date: '2024-03-24',
    likes: 2,
    category: 'Relations',
    tags: ['relations humaines', 'frontières', 'énergie', 'sélection', 'croissance'],
    explanation: "Toutes les relations ne sont pas bénéfiques. Certaines, subtillement, effacent qui tu es : elles minimisent tes ambitions, vampirisent ton énergie, relativisent tes valeurs. \"Diluer\" est le mot parfait — ça ne détruit pas frontalement, ça affaiblit progressivement. Cette prise de conscience est la première étape pour protéger son identité et n'investir que dans des liens qui t'élèvent.",
  },
  {
    text: "L'expérience est une lanterne qui n'éclaire que celui qui l'a portée.",
    author: 'Israel Tientcheu',
    date: '2024-02-19',
    likes: 1,
    category: 'Sagesse',
    tags: ['expérience', 'sagesse', 'apprentissage', 'transmission', 'connaissance'],
    explanation: "L'expérience est personnelle et non-transférable dans toute sa profondeur. Tu peux raconter ce que tu as vécu, mais l'autre ne ressentira jamais exactement ce que tu as ressenti — et donc ne tirera pas les mêmes leçons. C'est pourquoi le conseil échoue souvent : l'interlocuteur n'a pas porté la même lanterne. Cela explique aussi pourquoi les humains répètent les mêmes erreurs génération après génération : chaque lanterne doit être allumée individuellement.",
  },
];

/** Convert a JS value to Firestore REST API field format */
function toField(value) {
  if (typeof value === 'string')  return { stringValue: value };
  if (typeof value === 'number')  return { integerValue: String(value) };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value instanceof Date)      return { timestampValue: value.toISOString() };
  if (Array.isArray(value))       return { arrayValue: { values: value.map(toField) } };
  if (value === null)             return { nullValue: null };
  // plain object
  const fields = {};
  for (const [k, v] of Object.entries(value)) fields[k] = toField(v);
  return { mapValue: { fields } };
}

async function insertQuote(quote) {
  const fields = {
    text:        toField(quote.text),
    author:      toField(quote.author),
    date:        toField(new Date(quote.date)),
    likes:       toField(quote.likes),
    category:    toField(quote.category),
    tags:        toField(quote.tags),
    explanation: toField(quote.explanation),
  };

  const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  const data = await res.json();
  const docId = data.name.split('/').pop();
  return docId;
}

import { writeFileSync } from 'fs';
const log = [];
const out = (msg) => { log.push(msg); };

out(`Seeding ${QUOTES.length} quotes into Firestore (project: ${PROJECT_ID})…`);

let ok = 0;
for (const quote of QUOTES) {
  try {
    const id = await insertQuote(quote);
    out(`  OK  "${quote.text.slice(0, 45)}" → ${id}`);
    ok++;
  } catch (e) {
    out(`  FAIL "${quote.text.slice(0, 45)}" → ${e instanceof Error ? e.message : String(e)}`);
  }
}

out(`\nDone: ${ok}/${QUOTES.length} inserted.`);
writeFileSync('/tmp/seed-result.txt', log.join('\n'));
