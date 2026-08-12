// Construit le dossier de relecture destiné à un enseignant d'arabe.
//
// Le document est généré depuis les sources, jamais écrit à la main : il ne peut
// donc pas décrire un contenu qui n'est plus celui de l'application. Un test
// vérifie que le fichier publié correspond bien à ce que ce script produit.
//
//   node tools/build-review.mjs           écrit revue.html
//   node tools/build-review.mjs --check   échoue si le fichier est périmé

import { readFileSync, writeFileSync } from 'node:fs'
import { curriculum } from '../curriculum.js'
import { buildGlossary, GLOSSARY_GROUPS } from '../glossary.js'
import { TOPICS, topicLabel, topicOf } from '../question-topics.js'
import { secondExplanation } from '../explanations.js'
import { FLAGS, GENERAL_NOTES, LESSON_FLAGS } from './review-flags.js'

const OUTPUT = new URL('../revue.html', import.meta.url)

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))
}

const ar = text => `<span class="ar" lang="ar" dir="rtl">${escapeHtml(text)}</span>`
const flag = note => (note ? `<p class="flag"><span aria-hidden="true">⚑</span> ${escapeHtml(note)}</p>` : '')

const writtenQuestions = lesson => (lesson.questions ?? []).filter(question => question.type !== 'builder' && !question.id.endsWith('-c'))

function lessonSection(lesson, module, moduleIndex, lessonNumber) {
  const ref = `L-${String(lessonNumber).padStart(2, '0')}`
  return `<article class="item" id="${ref}">
    <header><span class="ref">${ref}</span><h3>${escapeHtml(lesson.title)} — ${ar(lesson.ar)}</h3><p class="where">Module ${moduleIndex + 1} · ${escapeHtml(module.title)} · identifiant <code>${escapeHtml(lesson.id)}</code></p></header>
    <dl>
      <dt>Résumé</dt><dd>${escapeHtml(lesson.summary)}</dd>
      <dt>Règle</dt><dd>${escapeHtml(lesson.rule)}</dd>
      <dt>Exemple</dt><dd>${ar(lesson.example)}<br><em>${escapeHtml(lesson.translation)}</em></dd>
      <dt>Analyse</dt><dd>${ar(lesson.analysis)}</dd>
    </dl>
    ${flag(LESSON_FLAGS[lesson.id])}
    <div class="annotate"><span>Remarques</span></div>
  </article>`
}

function questionSection(question, lesson, questionNumber) {
  const ref = `E-${String(questionNumber).padStart(2, '0')}`
  const second = secondExplanation(question.id)
  const choices = question.choices
    .map(choice => `<li class="${choice[1] === question.answer ? 'right' : ''}">${escapeHtml(choice[0])}${choice[1] === question.answer ? ' <strong>← réponse attendue</strong>' : ''}</li>`)
    .join('')
  return `<article class="item" id="${ref}">
    <header><span class="ref">${ref}</span><h3>${escapeHtml(question.prompt)}</h3><p class="where">Leçon « ${escapeHtml(lesson.title)} » · identifiant <code>${escapeHtml(question.id)}</code> · catégorie <strong>${escapeHtml(topicLabel(topicOf(question.id)))}</strong></p></header>
    <p class="phrase">${ar(question.arabic)}</p>
    <ul class="choices">${choices}</ul>
    <dl>
      <dt>Explication</dt><dd>${escapeHtml(question.explanation)}</dd>
      ${question.analysis ? `<dt>Analyse</dt><dd>${ar(question.analysis)}</dd>` : ''}
      ${second ? `<dt>Seconde explication <span class="mine">rédigée pour ce projet</span></dt><dd>${escapeHtml(second.again)}</dd>` : ''}
      ${second?.example ? `<dt>Exemple supplémentaire <span class="mine">rédigé pour ce projet</span></dt><dd>${ar(second.example.ar)}<br><em>${escapeHtml(second.example.fr)}</em><br>${ar(second.example.analysis)}</dd>` : ''}
    </dl>
    ${flag(FLAGS[question.id])}
    <div class="annotate"><span>Remarques</span></div>
  </article>`
}

function termSection(term, termNumber) {
  const ref = `G-${String(termNumber).padStart(2, '0')}`
  return `<article class="item compact" id="${ref}">
    <header><span class="ref">${ref}</span><h3>${ar(term.ar)} <span class="translit">${escapeHtml(term.tr)}</span></h3><p class="where">${escapeHtml(term.fr)}</p></header>
    <p>${escapeHtml(term.def)}</p>
    <p class="where">Leçons concernées : ${term.lessons.length ? term.lessons.map(lesson => escapeHtml(lesson.title)).join(', ') : '—'}</p>
    <div class="annotate"><span>Remarques</span></div>
  </article>`
}

function build() {
  const lessons = curriculum.flatMap((module, moduleIndex) => (module.lessons ?? []).map(lesson => ({ lesson, module, moduleIndex })))
  const questions = curriculum.flatMap(module => (module.lessons ?? []).flatMap(lesson => writtenQuestions(lesson).map(question => ({ question, lesson }))))
  const glossary = buildGlossary(curriculum)

  let lessonNumber = 0
  let questionNumber = 0
  let termNumber = 0

  const categoryTable = TOPICS.map(topic => {
    const ids = questions.filter(({ question }) => topicOf(question.id) === topic.id)
    return `<tr><th scope="row">${escapeHtml(topic.label)} ${ar(topic.ar)}</th><td>${ids.length}</td><td>${ids.map(({ question }) => `<code>${escapeHtml(question.id)}</code>`).join(' ')}</td></tr>`
  }).join('')

  const glossaryGroups = GLOSSARY_GROUPS.map(group => {
    const terms = glossary.filter(term => term.group === group.id)
    return `<h3 class="group">${escapeHtml(group.label)}</h3>${terms.map(term => termSection(term, ++termNumber)).join('')}`
  }).join('')

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Iʿrāb FR — dossier de relecture</title>
<style>
  :root { --ink:#1a1a18; --muted:#5b6864; --line:#d8d3c8; --paper:#fffdf8; --flag:#8d6620; --right:#1c704e; }
  * { box-sizing:border-box; }
  body { margin:0; padding:0 0 80px; color:var(--ink); background:var(--paper); font-family:"DM Sans",-apple-system,Segoe UI,system-ui,sans-serif; font-size:16px; line-height:1.6; }
  .sheet { width:min(880px,calc(100% - 32px)); margin:0 auto; }
  header.top { padding:48px 0 28px; border-bottom:3px solid var(--ink); }
  h1 { margin:0 0 10px; font-size:34px; line-height:1.15; }
  h2 { margin:52px 0 6px; padding-bottom:8px; border-bottom:1px solid var(--line); font-size:24px; }
  h3 { margin:0; font-size:18px; line-height:1.4; }
  h3.group { margin:34px 0 12px; font-size:15px; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); border:0; }
  .lead { color:var(--muted); }
  .ar { font-family:"Noto Naskh Arabic","Traditional Arabic",serif; font-size:1.22em; line-height:2; unicode-bidi:isolate; }
  .item { margin:20px 0; padding:20px 22px; border:1px solid var(--line); border-radius:10px; background:#fff; break-inside:avoid; }
  .item.compact { padding:16px 18px; }
  .item header { margin-bottom:12px; }
  .ref { display:inline-block; margin-bottom:6px; padding:2px 8px; border-radius:4px; background:#efeadf; font-size:12px; font-weight:700; letter-spacing:.06em; }
  .where { margin:6px 0 0; color:var(--muted); font-size:13px; }
  code { padding:1px 5px; border-radius:3px; background:#f0ece2; font-size:.9em; }
  dl { margin:0; }
  dt { margin-top:12px; color:var(--muted); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; }
  dd { margin:4px 0 0; }
  .mine { color:var(--flag); font-weight:700; text-transform:none; letter-spacing:0; }
  .phrase { margin:10px 0; padding:12px 16px; border-radius:8px; background:#f7f3ea; text-align:right; }
  ul.choices { margin:10px 0 0; padding-left:22px; }
  ul.choices li { margin:3px 0; }
  ul.choices li.right { color:var(--right); }
  .flag { margin:14px 0 0; padding:11px 14px; border-left:4px solid var(--flag); border-radius:0 8px 8px 0; background:#fbf4e6; color:#5f4a17; font-size:14px; }
  .annotate { margin-top:14px; padding-top:10px; border-top:1px dashed var(--line); min-height:52px; }
  .annotate span { color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:.08em; }
  table { width:100%; margin-top:16px; border-collapse:collapse; font-size:14px; }
  th, td { padding:9px 10px; border:1px solid var(--line); text-align:left; vertical-align:top; }
  th[scope=row] { width:34%; }
  ol.notes li { margin:8px 0; }
  .count { color:var(--muted); font-size:14px; }
  @media print {
    body { background:#fff; font-size:11.5pt; }
    .item { border-color:#bbb; break-inside:avoid; }
    h2 { break-before:page; }
    header.top h2 { break-before:auto; }
    .annotate { min-height:60px; }
  }
</style>
</head>
<body>
<div class="sheet">

<header class="top">
  <h1>Iʿrāb FR — dossier de relecture</h1>
  <p class="lead">Tout ce que l’application enseigne en arabe, réuni pour être validé par un enseignant. Document généré depuis le code source : il décrit exactement le contenu servi aux apprenants.</p>
  <p class="lead"><strong>Ce qui est demandé :</strong> confirmer ou corriger. Chaque élément porte un repère stable — ${'<code>L-01</code>'} pour une leçon, ${'<code>E-01</code>'} pour un exercice, ${'<code>G-01</code>'} pour un terme du glossaire — qu’il suffit de citer pour répondre. Le document s’imprime, et chaque bloc laisse une zone « Remarques ».</p>
  <p class="lead">Le repère <strong>⚑</strong> marque les points que je sais discutables ou que j’ai rédigés moi-même. Ce ne sont pas les seuls à vérifier, mais ce sont ceux où je doute.</p>
  <p class="count">${lessons.length} leçons · ${questions.length} exercices écrits · ${glossary.length} termes de glossaire · ${TOPICS.length} catégories</p>
</header>

<h2>1. Ce qui n’est pas garanti</h2>
<ol class="notes">${GENERAL_NOTES.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ol>

<h2>2. Les ${lessons.length} leçons</h2>
<p class="lead">Pour chaque leçon : la règle telle qu’elle est lue par l’apprenant, l’exemple, sa traduction et l’analyse affichée en arabe.</p>
${lessons.map(({ lesson, module, moduleIndex }) => lessonSection(lesson, module, moduleIndex, ++lessonNumber)).join('')}

<h2>3. Les ${questions.length} exercices</h2>
<p class="lead">La réponse attendue est signalée en vert. La seconde explication et l’exemple supplémentaire ont été rédigés pour ce projet et n’ont jamais été relus.</p>
${questions.map(({ question, lesson }) => questionSection(question, lesson, ++questionNumber)).join('')}

<h2>4. Les ${glossary.length} termes du glossaire</h2>
<p class="lead">Définitions écrites pour des francophones débutants. La terminologie est classique, la formulation est à valider.</p>
${glossaryGroups}

<h2>5. Le classement des exercices en catégories</h2>
<p class="lead">Chaque exercice est rangé dans l’une des cinq étapes de la méthode. Ce classement pilote la révision ciblée : un apprenant peut demander à ne réviser que les questions d’état, ou que les questions de marque. C’est un choix pédagogique de ma part, à confirmer dans son ensemble.</p>
<table><thead><tr><th>Catégorie</th><th>Nombre</th><th>Exercices</th></tr></thead><tbody>${categoryTable}</tbody></table>
<div class="annotate"><span>Remarques sur le classement</span></div>

</div>
</body>
</html>
`
}

const html = build()

// Le fichier est écrit en LF mais Git le restitue en CRLF sous Windows : la
// comparaison ignore donc les fins de ligne, sinon le contrôle échouerait selon
// la machine plutôt que selon le contenu.
const sameContent = (left, right) => left.replace(/\r\n/g, '\n') === right.replace(/\r\n/g, '\n')

if (process.argv.includes('--check')) {
  const current = readFileSync(OUTPUT, 'utf8')
  if (!sameContent(current, html)) {
    console.error('revue.html est périmé. Régénère-le : node tools/build-review.mjs')
    process.exit(1)
  }
  console.log('revue.html est à jour')
} else {
  writeFileSync(OUTPUT, html, 'utf8')
  console.log(`revue.html écrit (${Math.round(html.length / 1024)} Ko)`)
}
