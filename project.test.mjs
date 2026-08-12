import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

// Trois listes se tenaient à jour à la main : le cache du service worker, les
// contrôles de syntaxe du workflow et ses suites de tests. Neuf sprints sans
// oubli, mais l'oubli est silencieux — un module absent du cache casse le mode
// hors ligne, une suite absente du workflow cesse d'être exécutée.

const root = new URL('./', import.meta.url)
const read = name => readFileSync(new URL(name, root), 'utf8')
const files = readdirSync(root)

const modules = files.filter(name => name.endsWith('.js') && !name.endsWith('.test.mjs') && name !== 'sw.js')
const suites = files.filter(name => name.endsWith('.test.mjs'))
const serviceWorker = read('sw.js')
const workflow = read('.github/workflows/pages.yml')

assert.ok(modules.length > 20, `trop peu de modules trouvés : ${modules.length}`)
assert.ok(suites.length > 15, `trop peu de suites trouvées : ${suites.length}`)

// Tout module servi au navigateur doit être mis en cache, sinon l'application
// installée se casse dès la première coupure de réseau.
const uncached = modules.filter(name => !serviceWorker.includes(`'./${name}'`))
assert.deepEqual(uncached, [], `modules absents du cache de sw.js : ${uncached.join(', ')}`)

// Aucun fichier listé dans le cache ne doit avoir disparu.
const cached = [...serviceWorker.matchAll(/'\.\/([\w-]+\.js)'/g)].map(match => match[1])
const ghosts = cached.filter(name => !files.includes(name))
assert.deepEqual(ghosts, [], `fichiers cachés mais absents du dépôt : ${ghosts.join(', ')}`)

// Chaque suite doit être exécutée par la validation, et chaque module vérifié.
const unrun = suites.filter(name => !workflow.includes(`node ${name}`))
assert.deepEqual(unrun, [], `suites absentes du workflow : ${unrun.join(', ')}`)
const unchecked = modules.filter(name => !workflow.includes(`node --check ${name}`))
assert.deepEqual(unchecked, [], `modules sans contrôle de syntaxe : ${unchecked.join(', ')}`)

// Le service worker doit annoncer une version, seul moyen de renouveler le cache.
assert.match(serviceWorker, /const CACHE = 'irab-fr-v\d+'/, 'sw.js sans version de cache')

// Une seule implémentation de la normalisation du texte, une seule du jour
// local. Les deux avaient fini en double exemplaire, avec des comportements
// divergents. `normalizeProgress` de merge.js est un autre sujet.
const normalizers = modules.filter(name => /export function normalize(Text|Arabic|Search)\b/.test(read(name)))
assert.deepEqual(normalizers, ['normalize.js'], `normalisation du texte dupliquée : ${normalizers.join(', ')}`)
const dayKeys = modules.filter(name => /export function (localDayKey|dateKey)\b/.test(read(name)))
assert.deepEqual(dayKeys, ['day.js'], `calcul du jour dupliqué : ${dayKeys.join(', ')}`)

console.log('Project consistency tests passed')
