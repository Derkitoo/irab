// Jalons du parcours. Pas de points, pas de niveaux, pas de classement : six
// étapes qui marquent quelque chose de réel dans l'apprentissage.
//
// Deux règles de conception.
//
// Un jalon est calculé à partir de la progression, jamais enregistré : rien de
// nouveau à synchroniser, et deux appareils ne peuvent pas afficher des acquis
// différents.
//
// Un jalon obtenu ne se reprend pas. Chaque condition ne porte donc que sur
// l'historique — `questions`, qui garde trace de ce qui a été réussi au moins
// une fois, et le journal d'activité — jamais sur la maîtrise courante, qui est
// révocable depuis qu'un exercice raté cesse de compter.

import { localDayKey } from './day.js'

function historyOf(progress) {
  return {
    succeeded: new Set(Array.isArray(progress?.questions) ? progress.questions : []),
    lessons: new Set(Array.isArray(progress?.lessons) ? progress.lessons : []),
    activity: Array.isArray(progress?.activity) ? progress.activity : [],
  }
}

function activeDays(activity) {
  return [...new Set(activity.map(event => localDayKey(event?.at)).filter(Boolean))].sort()
}

function dayGap(from, to) {
  return Math.round((Date.parse(`${to}T12:00:00`) - Date.parse(`${from}T12:00:00`)) / 86400000)
}

// La plus longue série de jours consécutifs, et non la série en cours : un jalon
// ne doit pas disparaître parce que l'apprenant a pris un dimanche.
function longestRun(days) {
  let best = 0
  let run = 0
  let previous = null
  for (const day of days) {
    run = previous && dayGap(previous, day) === 1 ? run + 1 : 1
    previous = day
    best = Math.max(best, run)
  }
  return best
}

function longestPause(days) {
  let best = 0
  for (let index = 1; index < days.length; index += 1) {
    best = Math.max(best, dayGap(days[index - 1], days[index]))
  }
  return best
}

export const BADGES = [
  {
    id: 'first-analysis',
    label: 'Première analyse complète',
    detail: 'Tu as construit un iʿrāb entier, bloc par bloc, sans te faire souffler l’ordre.',
    hint: 'Réussis une construction par blocs à la fin d’une leçon.',
    earned: progress => [...historyOf(progress).succeeded].some(id => id.endsWith('-builder')),
  },
  {
    id: 'error-turned',
    label: 'Erreur retournée',
    detail: 'Tu as repris un exercice que tu avais raté, et cette fois il est tombé juste. C’est là que se joue l’essentiel.',
    hint: 'Réussis un exercice sur lequel tu t’étais trompé.',
    earned: progress => {
      const { succeeded, activity } = historyOf(progress)
      const failed = new Set(activity.filter(event => event && event.correct === false).map(event => event.questionId))
      return [...failed].some(id => succeeded.has(id))
    },
  },
  {
    id: 'module-mastered',
    label: 'Module bouclé',
    detail: 'Tous les exercices d’un module sont passés au moins une fois du bon côté.',
    hint: 'Réussis tous les exercices d’un même module.',
    earned: (progress, curriculum = []) => {
      const { succeeded } = historyOf(progress)
      return curriculum.some(module => {
        const ids = (module.lessons ?? []).flatMap(lesson => (lesson.questions ?? []).map(question => question.id))
        return ids.length > 0 && ids.every(id => succeeded.has(id))
      })
    },
  },
  {
    id: 'regular-week',
    label: 'Semaine régulière',
    detail: 'Sept jours de suite avec au moins un exercice. La régularité fait plus que les longues séances.',
    hint: 'Travaille sept jours consécutifs, même brièvement.',
    earned: progress => longestRun(activeDays(historyOf(progress).activity)) >= 7,
  },
  {
    id: 'comeback',
    label: 'Retour tenu',
    detail: 'Tu es revenu après plusieurs jours d’absence. En autodidacte, c’est le pas le plus difficile.',
    hint: 'Reviens travailler après une interruption de trois jours ou plus.',
    earned: progress => longestPause(activeDays(historyOf(progress).activity)) >= 4,
  },
  {
    id: 'course-complete',
    label: 'Parcours terminé',
    detail: 'Les vingt-cinq leçons sont derrière toi. Les révisions espacées prennent le relais.',
    hint: 'Termine les vingt-cinq leçons.',
    earned: (progress, curriculum = []) => {
      const { lessons } = historyOf(progress)
      const all = curriculum.flatMap(module => (module.lessons ?? []).map(lesson => lesson.id))
      return all.length > 0 && all.every(id => lessons.has(id))
    },
  },
]

export function earnedBadges(progress = {}, curriculum = []) {
  return BADGES.filter(badge => badge.earned(progress, curriculum)).map(badge => badge.id)
}

export function badgeById(id) {
  return BADGES.find(badge => badge.id === id) ?? null
}

// Ce que la dernière action vient de débloquer, pour l'annoncer une seule fois.
export function newlyEarned(before = [], after = []) {
  return after.filter(id => !before.includes(id))
}
