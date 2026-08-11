// Relie un terme du glossaire aux leçons où il apparaît réellement.
// Le lien est calculé à partir du texte des leçons, jamais saisi à la main :
// une leçon renommée ou supprimée ne peut donc pas laisser un lien mort.

const DIACRITICS = /[ً-ْٰـ]/g
const ARABIC_LETTER = '[\\u0621-\\u064A]'

export function normalizeArabic(value = '') {
  return String(value)
    .replace(DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Dans une leçon, un terme peut porter l'article défini, une lettre soudée
// devant — la conjonction وَ, les prépositions بِ, لِ, كَ, la reprise فَ — et un
// pronom suffixe : « وَالْمَنْعُوتُ » ou « نَصْبِهِ » contiennent bien le terme.
// Le dernier mot doit finir sur une frontière, pour que « اسم » ne se déclenche
// pas à l'intérieur de « الاسمية ».
const CLITIC = '[وفبكل]?'
const SUFFIX = '(?:ها|هما|هم|هن|كم|ه)?'

function termPattern(term) {
  const words = normalizeArabic(term).split(' ').filter(Boolean)
  if (!words.length) return null
  const body = words
    .map((word, index) => {
      const head = index === 0 ? `(?<!${ARABIC_LETTER})${CLITIC}` : CLITIC
      const tail = index === words.length - 1 ? `${SUFFIX}(?!${ARABIC_LETTER})` : ''
      return `${head}(?:ال)?${escapeRegExp(word)}${tail}`
    })
    .join('\\s+')
  return new RegExp(body)
}

// Le titre arabe du module compte : il nomme souvent le thème que ses leçons
// travaillent sans jamais le réécrire en toutes lettres.
export function lessonText(lesson = {}, moduleTitle = '') {
  const questions = (lesson.questions ?? []).flatMap(question => [
    question.arabic,
    question.analysis,
    ...(question.choices ?? []).map(choice => choice[0]),
  ])
  return normalizeArabic([moduleTitle, lesson.ar, lesson.rule, lesson.example, lesson.analysis, ...questions].filter(Boolean).join(' '))
}

export function lessonsUsing(entry, curriculum = []) {
  const pattern = termPattern(entry?.ar)
  if (!pattern) return []
  const found = []
  for (const module of curriculum) {
    for (const lesson of module.lessons ?? []) {
      if (pattern.test(lessonText(lesson, module.ar))) found.push({ id: lesson.id, title: lesson.title, moduleTitle: module.title })
    }
  }
  return found
}
