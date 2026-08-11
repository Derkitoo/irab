// Type de compétence testée par chaque exercice, pour orienter la révision.
// Le classement suit la méthode enseignée dans le parcours :
//   nature   — reconnaître la classe d'un mot ou la forme d'un constituant ;
//   fonction — nommer le rôle syntaxique ;
//   etat     — déterminer rafʿ, naṣb, jarr ou jazm ;
//   marque   — déterminer la marque visible ;
//   analyse  — produire ou choisir une analyse complète.
// Ce découpage est un choix pédagogique : il devra être confirmé lors de la
// relecture du corpus par un enseignant d'arabe.

export const TOPICS = [
  { id: 'nature', label: 'Nature du mot', ar: 'نَوْعُ الْكَلِمَةِ' },
  { id: 'fonction', label: 'Fonction syntaxique', ar: 'الْوَظِيفَةُ' },
  { id: 'etat', label: 'État grammatical', ar: 'الْحَالَةُ الْإِعْرَابِيَّةُ' },
  { id: 'marque', label: 'Marque d’iʿrāb', ar: 'الْعَلَامَةُ' },
  { id: 'analyse', label: 'Analyse complète', ar: 'الْإِعْرَابُ الْكَامِلُ' },
]

const BASE_TOPICS = {
  'types-1': 'nature', 'types-2': 'nature', 'types-3': 'nature',
  'built-1': 'nature', 'built-2': 'nature',
  'states-1': 'etat', 'states-2': 'etat', 'states-3': 'etat',
  'marks-1': 'marque', 'marks-2': 'marque',
  'mub-1': 'fonction', 'mub-2': 'fonction',
  'khab-1': 'nature', 'khab-2': 'nature',
  'pill-1': 'fonction', 'pill-2': 'fonction',
  'sub-1': 'nature', 'sub-2': 'fonction',
  'method-1': 'analyse', 'method-2': 'analyse',
  'prep-1': 'etat', 'prep-2': 'marque',
  'part-1': 'etat', 'part-2': 'etat',
  'raised-1': 'fonction', 'raised-2': 'fonction',
  'acc-1': 'fonction', 'acc-2': 'fonction', 'acc-3': 'fonction',
  'past-1': 'nature', 'past-2': 'marque',
  'present-1': 'etat', 'present-2': 'marque',
  'idafa-1': 'fonction', 'idafa-2': 'nature',
  'adj-1': 'etat', 'adj-2': 'fonction',
  'inna-1': 'etat', 'inna-2': 'etat',
  'inna-s-1': 'nature', 'inna-s-2': 'fonction',
  'kana-1': 'etat', 'kana-2': 'etat',
  'kana-s-1': 'fonction', 'kana-s-2': 'nature',
  'dual-1': 'marque', 'dual-2': 'marque',
  'plural-1': 'marque', 'plural-2': 'marque', 'plural-3': 'marque',
  'syn-n-1': 'fonction', 'syn-n-2': 'fonction',
  'syn-v-1': 'analyse', 'syn-v-2': 'analyse',
}

const KNOWN = new Set(TOPICS.map(topic => topic.id))

// Les passes de consolidation (`-c`) héritent de leur question d'origine et
// les constructions par blocs (`-builder`) relèvent toujours de l'analyse.
export function topicOf(questionId = '') {
  const id = String(questionId)
  if (id.endsWith('-builder')) return 'analyse'
  const base = id.endsWith('-c') ? id.slice(0, -2) : id
  return BASE_TOPICS[base] ?? null
}

export function topicLabel(topicId) {
  return TOPICS.find(topic => topic.id === topicId)?.label ?? 'Autre'
}

export function isKnownTopic(topicId) {
  return KNOWN.has(topicId)
}

export function baseTopicIds() {
  return Object.keys(BASE_TOPICS)
}
