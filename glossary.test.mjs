import assert from 'node:assert/strict'
import { curriculum } from './curriculum.js'
import { GLOSSARY_GROUPS, buildGlossary, glossaryEntries } from './glossary.js'
import { lessonText, lessonsUsing } from './glossary-index.js'
import { normalizeText } from './normalize.js'

const entries = glossaryEntries()
assert.ok(entries.length >= 55, `glossaire trop court : ${entries.length}`)

const groups = new Set(GLOSSARY_GROUPS.map(group => group.id))
const arabicTerms = entries.map(entry => entry.ar)
const translitterations = entries.map(entry => entry.tr)
assert.equal(new Set(arabicTerms).size, arabicTerms.length, 'terme arabe en double')
assert.equal(new Set(translitterations).size, translitterations.length, 'translittération en double')

for (const entry of entries) {
  assert.match(entry.ar, /[؀-ۿ]/, `${entry.tr} : terme arabe manquant`)
  assert.ok(entry.fr?.length > 0, `${entry.tr} : traduction manquante`)
  assert.ok(entry.def?.length > 20, `${entry.tr} : définition trop courte`)
  assert.ok(groups.has(entry.group), `${entry.tr} : groupe inconnu ${entry.group}`)
  // Chaque groupe déclaré doit être affichable.
  assert.doesNotMatch(entry.fr, /[؀-ۿ]/, `${entry.tr} : la traduction ne doit pas être en arabe`)
}
for (const group of GLOSSARY_GROUPS) {
  assert.ok(entries.some(entry => entry.group === group.id), `groupe vide : ${group.id}`)
}

assert.equal(normalizeText('الْمُبْتَدَأُ'), 'المبتدا')
assert.equal(normalizeText('  فِي   الْبَيْتِ '), 'في البيت')

// Le lien vers les leçons est calculé, donc il ne peut pas pointer dans le vide.
const linked = buildGlossary(curriculum)
const lessonIds = new Set(curriculum.flatMap(module => module.lessons.map(lesson => lesson.id)))
for (const entry of linked) {
  for (const lesson of entry.lessons) {
    assert.ok(lessonIds.has(lesson.id), `${entry.tr} pointe vers une leçon inconnue : ${lesson.id}`)
  }
}
// Tout terme du glossaire doit être travaillé quelque part : un terme que le
// parcours n'emploie jamais en arabe est une notion promise et non enseignée.
// Pour en ajouter un, le nommer en arabe dans la règle de la leçon concernée.
const unused = linked.filter(entry => !entry.lessons.length).map(entry => entry.tr)
assert.deepEqual(unused, [], `termes absents du parcours : ${unused.join(', ')}`)

// Reconnaissance d'un terme porté par l'article, une lettre soudée ou un suffixe.
const fake = [{ ar: '', title: 'Module', lessons: [{ id: 'l1', title: 'Leçon', ar: 'النَّعْتُ وَالْمَنْعُوتُ', rule: '', example: 'وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ', analysis: 'الْمُبْتَدَأُ مَرْفُوعٌ', questions: [] }] }]
assert.equal(lessonsUsing({ ar: 'مَنْعُوت' }, fake).length, 1, 'terme précédé de la conjonction non reconnu')
assert.equal(lessonsUsing({ ar: 'نَصْب' }, fake).length, 1, 'terme suivi d’un pronom suffixe non reconnu')
assert.equal(lessonsUsing({ ar: 'مُبْتَدَأ' }, fake).length, 1, 'terme porté par l’article non reconnu')

// Pas de déclenchement à l'intérieur d'un mot plus long.
const ismOnly = [{ ar: '', lessons: [{ id: 'l2', title: 'Leçon', ar: 'الْجُمْلَةُ الِاسْمِيَّةُ', questions: [] }] }]
assert.equal(lessonsUsing({ ar: 'اِسْم' }, ismOnly).length, 0, '« اسم » ne doit pas matcher dans « الاسمية »')
assert.equal(lessonsUsing({ ar: '' }, curriculum).length, 0)

assert.match(lessonText({ ar: 'بَاب', questions: [{ arabic: 'كِتَاب', choices: [['خَبَر', 'k']] }] }, 'مَوَاقِع'), /مواقع باب كتاب خبر/)

console.log('Glossary tests passed')
