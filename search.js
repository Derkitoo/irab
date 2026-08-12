// Recherche unique sur les leçons, les exercices et le glossaire.
//
// La normalisation gomme d'un coup les accents français, les voyelles brèves
// arabes et les signes de translittération : « etat », « état », « الحالة » et
// « halah » doivent atteindre le même contenu. La décomposition Unicode fait
// l'essentiel, puisque les harakāt comme les accents sont des marques
// combinantes, et que أ إ آ se décomposent en alif suivi d'une marque.

const COMBINING = /\p{M}/gu
const TRANSLITERATION = /[ʿʾʼ'’`]/g

export function normalizeSearch(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING, '')
    .replace(TRANSLITERATION, '')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstSentence(text = '', token = '') {
  const sentences = String(text).split(/(?<=[.!?؟])\s+/).filter(Boolean)
  if (!sentences.length) return String(text)
  const hit = token ? sentences.find(sentence => normalizeSearch(sentence).includes(token)) : null
  return hit ?? sentences[0]
}

function entry({ kind, id, title, subtitle, body, lessonId, questionIndex, fields }) {
  return {
    kind,
    id,
    title,
    subtitle,
    body,
    lessonId,
    questionIndex,
    // Chaque champ est pesé séparément : un mot dans un titre vaut mieux que le
    // même mot noyé dans une explication.
    fields: fields.map(([weight, text]) => [weight, normalizeSearch(text)]),
  }
}

export function buildSearchIndex(curriculum = [], glossary = []) {
  const index = []

  for (const module of curriculum) {
    for (const lesson of module.lessons ?? []) {
      index.push(entry({
        kind: 'lesson',
        id: lesson.id,
        title: lesson.title,
        subtitle: module.title,
        body: lesson.rule ?? lesson.summary ?? '',
        lessonId: lesson.id,
        fields: [
          [8, lesson.title],
          [8, lesson.ar],
          [4, lesson.summary],
          [3, module.title],
          [3, module.ar],
          [2, lesson.rule],
          [2, lesson.example],
          [2, lesson.analysis],
          [1, lesson.translation],
        ],
      }))

      const questions = lesson.questions ?? []
      questions.forEach((question, questionIndex) => {
        // Les passes de consolidation reprennent mot pour mot leur exercice
        // d'origine : les indexer doublerait chaque résultat.
        if (question.id.endsWith('-c')) return
        index.push(entry({
          kind: 'exercise',
          id: question.id,
          title: question.prompt,
          subtitle: `${lesson.title} · ${module.title}`,
          body: question.explanation ?? '',
          lessonId: lesson.id,
          questionIndex,
          fields: [
            [6, question.prompt],
            [6, question.arabic],
            [3, (question.choices ?? []).map(choice => choice[0]).join(' ')],
            [2, question.explanation],
            [2, question.analysis],
            [1, lesson.title],
          ],
        }))
      })
    }
  }

  for (const term of glossary) {
    index.push(entry({
      kind: 'term',
      id: term.tr,
      title: term.fr,
      subtitle: term.tr,
      body: term.def,
      lessonId: term.lessons?.[0]?.id ?? null,
      fields: [
        [9, term.ar],
        [9, term.tr],
        [8, term.fr],
        [2, term.def],
      ],
    }))
  }

  return index
}

// Un mot arabe se copie souvent avec son article depuis une leçon, alors que le
// glossaire le range sans. Chaque mot cherché est donc essayé dans les deux
// formes.
function tokenVariants(token) {
  return token.startsWith('ال') && token.length > 3 ? [token, token.slice(2)] : [token]
}

export function searchContent(query, index = [], limit = 30) {
  const tokens = normalizeSearch(query).split(' ').filter(token => token.length >= 2).map(tokenVariants)
  if (!tokens.length) return []

  const results = []
  for (const item of index) {
    let score = 0
    // Tous les mots de la requête doivent être présents quelque part.
    const matchesAll = tokens.every(variants => {
      let best = 0
      for (const token of variants) {
        for (const [weight, text] of item.fields) {
          if (!text.includes(token)) continue
          // Un mot qui commence une occurrence compte davantage qu'un fragment.
          const exact = new RegExp(`(^|\\s)(ال)?${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text)
          best = Math.max(best, exact ? weight * 2 : weight)
        }
      }
      score += best
      return best > 0
    })
    if (!matchesAll) continue
    results.push({
      kind: item.kind,
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      snippet: firstSentence(item.body, tokens[0][0]),
      lessonId: item.lessonId,
      questionIndex: item.questionIndex,
      score,
    })
  }

  const order = { term: 0, lesson: 1, exercise: 2 }
  return results
    .sort((left, right) => right.score - left.score || order[left.kind] - order[right.kind] || left.title.localeCompare(right.title, 'fr'))
    .slice(0, limit)
}
