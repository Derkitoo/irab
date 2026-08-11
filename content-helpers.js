// Constructeurs partagés par les fichiers de contenu.
// Ils n'ont aucune logique : ils nomment les champs pour que les leçons
// restent lisibles ligne à ligne.

export function lesson(id, title, ar, summary, rule, example, translation, analysis, questions) {
  return { id, title, ar, summary, rule, example, translation, analysis, questions }
}

export function question(id, prompt, arabic, choices, answer, explanation, analysis = '') {
  return { id, prompt, arabic, choices, answer, explanation, analysis }
}

export function caseChoices() {
  return [['Nominatif — مرفوع', 'raf'], ['Accusatif — منصوب', 'nasb'], ['Génitif — مجرور', 'jarr'], ['Apocopé — مجزوم', 'jazm']]
}
