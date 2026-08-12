import assert from 'node:assert/strict'
import { curriculum } from './curriculum.js'
import { buildGlossary } from './glossary.js'
import { buildSearchIndex, searchContent } from './search.js'
import { normalizeText } from './normalize.js'

// La normalisation gomme accents, voyelles brèves et signes de translittération.
assert.equal(normalizeText('État'), 'etat')
assert.equal(normalizeText('iʿrāb'), 'irab')
assert.equal(normalizeText('الْحَالَةُ'), 'الحالة')
assert.equal(normalizeText('أَقْسَام'), 'اقسام')
assert.equal(normalizeText('  DEUX   mots '), 'deux mots')

const index = buildSearchIndex(curriculum, buildGlossary(curriculum))
const find = (query, limit) => searchContent(query, index, limit)
const kinds = results => new Set(results.map(result => result.kind))

assert.ok(index.length > 100, `index trop petit : ${index.length}`)
// Les passes de consolidation ne sont pas indexées : elles dupliqueraient tout.
assert.equal(index.filter(item => item.id.endsWith('-c')).length, 0)

// Une requête trop courte ne renvoie rien plutôt que tout.
assert.deepEqual(find('a'), [])
assert.deepEqual(find(''), [])
assert.deepEqual(find('   '), [])
assert.deepEqual(find('zzzzz'), [])

// Recherche en français, avec et sans accent.
const accented = find('génitif')
const plain = find('genitif')
assert.ok(accented.length > 0)
assert.deepEqual(accented.map(r => r.id), plain.map(r => r.id))

// Recherche en translittération, telle qu'on la tape vraiment.
assert.ok(find('irab').length > 0)
assert.ok(find('mubtada').some(result => result.kind === 'term'))

// Recherche en arabe, vocalisé ou non.
const vocalised = find('الْمُبْتَدَأُ')
const bare = find('المبتدا')
assert.ok(vocalised.length > 0, 'arabe vocalisé non trouvé')
assert.ok(bare.length > 0, 'arabe nu non trouvé')

// Un mot arabe copié depuis une leçon porte son article ; le glossaire le range
// sans. Les deux formes doivent mener au même terme.
const withArticle = find('المبتدا')
assert.ok(withArticle.some(result => result.kind === 'term'), 'le terme du glossaire est manqué avec l’article')
assert.ok(find('مبتدا').some(result => result.kind === 'term'))

// Les trois familles de contenu sont atteignables.
assert.ok(kinds(find('khabar')).has('term'))
assert.ok(find('annexion').some(result => result.kind === 'lesson'))
assert.ok(find('quelle est la nature').some(result => result.kind === 'exercise'))

// Un terme du glossaire passe devant une mention noyée dans une explication.
const inna = find('inna')
assert.equal(inna[0].kind, 'term', `attendu un terme en tête, reçu ${inna[0].kind}`)

// Tous les mots de la requête doivent apparaître.
assert.deepEqual(find('génitif zzzzz'), [])
assert.ok(find('pluriel féminin').length > 0)

// Chaque résultat sait où mener.
for (const result of find('duel')) {
  assert.ok(result.title?.length > 0, 'résultat sans titre')
  assert.ok(result.snippet?.length > 0, `résultat sans extrait : ${result.id}`)
  if (result.kind === 'lesson') assert.ok(result.lessonId, 'leçon sans identifiant')
  if (result.kind === 'exercise') assert.equal(typeof result.questionIndex, 'number')
}

// L'extrait privilégie la phrase qui contient le mot cherché…
const withToken = find('génitif').find(result => normalizeText(result.snippet).includes('genitif'))
assert.ok(withToken, 'aucun extrait ne contient le mot cherché')

// …et retombe sur le début du texte quand le mot est ailleurs, par exemple
// trouvé dans le titre du terme plutôt que dans sa définition.
const kasra = find('kasra').find(result => result.kind === 'term' && result.title.includes('Kasra'))
assert.ok(kasra, 'terme kasra introuvable')
assert.ok(kasra.snippet.startsWith('Voyelle brève'), `extrait inattendu : ${kasra.snippet}`)

// La limite est respectée et le classement est stable.
assert.ok(find('le', 5).length <= 5)
assert.deepEqual(find('marque', 8).map(r => r.id), find('marque', 8).map(r => r.id))

// Un index vide ne fait pas planter la recherche.
assert.deepEqual(searchContent('duel', []), [])
assert.deepEqual(buildSearchIndex(), [])

console.log('Search tests passed')
