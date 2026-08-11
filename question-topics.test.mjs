import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TOPICS, baseTopicIds, isKnownTopic, topicLabel, topicOf } from './question-topics.js'

assert.equal(topicOf('types-1'), 'nature')
assert.equal(topicOf('states-1'), 'etat')
assert.equal(topicOf('marks-1'), 'marque')
assert.equal(topicOf('mub-1'), 'fonction')
assert.equal(topicOf('method-1'), 'analyse')

// Une passe de consolidation hérite de sa question d'origine.
assert.equal(topicOf('states-1-c'), 'etat')
// Une construction par blocs relève toujours de l'analyse complète.
assert.equal(topicOf('types-builder'), 'analyse')
assert.equal(topicOf('inconnue-9'), null)
assert.equal(topicOf(), null)

assert.equal(topicLabel('etat'), 'État grammatical')
assert.equal(topicLabel('inexistant'), 'Autre')
assert.ok(TOPICS.every(topic => isKnownTopic(topic.id)))
assert.ok(baseTopicIds().every(id => isKnownTopic(topicOf(id))))

// Chaque exercice écrit à la main doit porter une catégorie : sans ce contrôle,
// une question ajoutée plus tard disparaîtrait silencieusement du bilan.
const sources = ['app.js', 'content-advanced.js'].map(file => readFileSync(new URL(file, import.meta.url), 'utf8')).join('\n')
const declared = [...sources.matchAll(/\b[qQ]\('([a-z0-9-]+)'/g)].map(match => match[1])
assert.ok(declared.length >= 52, `attendu au moins 52 exercices, trouvé ${declared.length}`)
const untagged = declared.filter(id => !topicOf(id))
assert.deepEqual(untagged, [], `exercices sans catégorie : ${untagged.join(', ')}`)

// À l'inverse, aucune catégorie ne doit pointer vers un exercice supprimé.
const orphans = baseTopicIds().filter(id => !declared.includes(id))
assert.deepEqual(orphans, [], `catégories orphelines : ${orphans.join(', ')}`)

console.log('Question topic tests passed')
