// « Maîtrisé » signifie : la dernière réponse connue à cet exercice est une
// réussite. La carte de répétition espacée porte déjà cette information, car
// `reps` repasse à zéro à chaque échec — la maîtrise est donc révocable.
//
// `progress.questions` continue d'enregistrer ce qui a été réussi au moins une
// fois. Cette liste ne décroît jamais : elle sert d'historique et de base à la
// fusion entre appareils, plus de compteur de maîtrise.

export function isMastered(progress, questionId) {
  return ((progress?.cards ?? {})[questionId]?.reps ?? 0) > 0
}

export function countMastered(progress, questionIds = []) {
  return questionIds.filter(id => isMastered(progress, id)).length
}

export function masteredSet(progress, questionIds = []) {
  return new Set(questionIds.filter(id => isMastered(progress, id)))
}
