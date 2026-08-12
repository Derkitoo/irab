import { allLessons, allQuestions, curriculum } from './curriculum.js'
import { dateKey, isDue, scheduleCard } from './srs.js'
import { createBackup, parseBackup } from './backup.js'
import { computeAnalytics } from './analytics.js'
import { createCoach } from './coach.js'
import { countMastered, isMastered } from './mastery.js'
import { topicLabel, topicOf } from './question-topics.js'
import { buildQuickSession } from './session.js'
import { secondExplanation } from './explanations.js'
import { GLOSSARY_GROUPS, buildGlossary } from './glossary.js'
import { normalizeArabic } from './glossary-index.js'
import { buildSearchIndex, searchContent } from './search.js'
import { migrateProgress } from './progress-schema.js'
import { describeCloudError } from './cloud-errors.js'
import { publish, synchronize } from './sync.js'
import { currentSession, deleteAccount, deleteCloudProgress, initializeCloud, isCloudConfigured, loadCloudProgress, onAuthChange, saveCloudProgress, signIn, signOut, signUp } from './cloud.js'

let installPrompt = null
let online = navigator.onLine

const STORAGE_KEY = 'irab-fr:progress'
let state = { view:'home', lesson:null, stage:'learn', qi:0, selected:null, built:[], checked:false, review:false, glossaryQuery:'', searchQuery:'', progress:loadProgress(), cloud:{configured:isCloudConfigured(),session:null,status:'idle',error:'',retryable:false,retry:null} }
const app = document.querySelector('#app')
let cloudSaveTimer = null

// La progression lue sur l'appareil passe toujours par les migrations de format.
function loadProgress(){ try { return migrateProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) } catch { return migrateProgress({}) } }
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)) }
function save(){ persist(); queueCloudSave() }
function completed(id){ return state.progress.lessons.includes(id) }
function reviewQuestions(){ return allQuestions.filter(question => state.progress.wrongs[question.id] > 0 || isDue(state.progress.cards[question.id])) }
function masteredTotal(){ return countMastered(state.progress, allQuestions.map(question => question.id)) }

// Point de reprise : seules les vraies leçons sont mémorisées. Une révision ou
// une session rapide se rejoue à la demande, il n'y a rien à y reprendre.
function rememberPosition(){
  if(state.review||!state.lesson||state.stage!=='practice')return
  state.progress.resume={ lessonId:state.lesson.id, index:state.qi, at:new Date().toISOString() }
}
function forgetPosition(){ state.progress.resume=null }
function resumeTarget(){
  const resume=state.progress.resume
  if(!resume)return null
  const lesson=allLessons.find(item=>item.id===resume.lessonId)
  if(!lesson||completed(lesson.id))return null
  const index=Math.min(resume.index,lesson.questions.length-1)
  return index>0?{ lesson, index }:null
}
function schedule(questionId, correct){
  state.progress.activity.push({ id:globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, at:new Date().toISOString(), questionId, correct })
  state.progress.activity=state.progress.activity.slice(-1000)
  state.progress.cards[questionId]=scheduleCard(state.progress.cards[questionId],correct)
  if(!correct){ state.progress.wrongs[questionId]=(state.progress.wrongs[questionId]||0)+1; return }
  delete state.progress.wrongs[questionId]
}
function speakArabic(text){ if(!('speechSynthesis' in window))return; speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(text); utterance.lang='ar-SA'; utterance.rate=.78; const voice=speechSynthesis.getVoices().find(item=>item.lang.toLowerCase().startsWith('ar')); if(voice)utterance.voice=voice; speechSynthesis.speak(utterance) }
// L'application se redessine entièrement à chaque interaction. Sans précaution
// le focus retombe sur le corps de page, ce qui rend la navigation au clavier
// impraticable : chaque clic renverrait l'utilisateur au début du document.
// On retient donc ce qui était focalisé, et on le retrouve après le rendu.
const FOCUS_KEYS = ['choice', 'lesson', 'action', 'topic', 'goal', 'token', 'remove', 'authMode', 'speak']
function focusKey(element = document.activeElement){
  if(!element||element===document.body||!app.contains(element))return null
  if(element.id)return `#${CSS.escape(element.id)}`
  for(const key of FOCUS_KEYS){
    const value=element.dataset[key]
    if(value!==undefined)return `[data-${key.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)}="${CSS.escape(value)}"]`
  }
  return null
}
function restoreFocus(key){
  if(!key)return
  const target=app.querySelector(key)
  if(target)target.focus({ preventScroll:true })
}

// Zone d'annonce pour les lecteurs d'écran : elle vit hors de #app, donc elle
// survit aux rendus et son contenu est bien lu.
function announce(message){
  const region=document.querySelector('#live-region')
  if(!region)return
  region.textContent=''
  setTimeout(()=>{ region.textContent=message },50)
}

function viewMarkup(){
  switch(state.view){
    case 'home': return homeView()
    case 'account': return accountView()
    case 'privacy': return privacyView()
    case 'glossary': return glossaryView()
    case 'search': return searchView()
    case 'stats': return statsView()
    default: return lessonView()
  }
}
function render(){
  const previous=focusKey()
  app.innerHTML=viewMarkup()
  // Les lecteurs d'écran doivent changer de langue sur l'arabe, sinon la
  // translittération est lue avec la prononciation française.
  app.querySelectorAll('.ar').forEach(element=>{ element.setAttribute('lang','ar'); element.setAttribute('dir','rtl') })
  const main=app.querySelector('main')
  if(main){ main.id='main-content'; main.tabIndex=-1 }
  bind()
  restoreFocus(previous)
}
function header(back=false){ const accountLabel=state.cloud.session?.user?.email?'Synchronisé':'Compte'; return `<header class="topbar">${back?'<button class="ghost back" data-action="home">← <span class="hide-mobile">Parcours</span></button>':''}<div class="brand"><span class="brand-mark ar">إ</span><span>Iʿrāb</span></div><span class="top-spacer"></span>${!online?'<span class="offline-badge">Hors ligne</span>':''}${installPrompt?'<button class="install-button" data-action="install">Installer</button>':''}<button class="account-button" data-action="search" aria-label="Chercher dans le contenu"><span aria-hidden="true">⌕</span><span class="hide-mobile" aria-hidden="true"> Chercher</span></button><button class="account-button" data-action="stats">Bilan</button><button class="account-button" data-action="account">${accountLabel}</button><span class="ar hide-mobile">نَحْوٌ وَإِعْرَابٌ</span></header>` }

function homeView(){
  const pct = Math.round(state.progress.lessons.length / allLessons.length * 100)
  const reviews = reviewQuestions().length
  const coach = createCoach(state.progress,curriculum,reviewQuestions().map(question=>question.id))
  const resume = resumeTarget()
  const quick = buildQuickSession(state.progress,curriculum,reviewQuestions().map(question=>question.id))
  return `<div class="shell">${header()}<main class="container">${cloudBanner()}
    <section class="hero"><div class="hero-copy"><span class="eyebrow">Grammaire arabe · Français</span><h1>Lis la fonction.<br>Comprends la terminaison.</h1><p>Un parcours progressif pour apprendre le iʿrāb, analyser chaque mot et construire une réponse grammaticale complète.</p><div class="hero-arabic ar">الإِعْرَابُ خُطْوَةً خُطْوَةً</div><div class="hero-actions"><button class="primary" data-action="continue">${state.progress.lessons.length ? 'Continuer mon parcours' : 'Commencer le parcours'}</button>${reviews?`<button class="review-button" data-action="review">Révision du jour <span>${reviews}</span></button>`:''}</div>${resume?`<button class="resume-line" data-action="resume"><span class="resume-mark">↩</span><span><strong>Reprendre où tu t’es arrêté</strong><small>${escapeHtml(resume.lesson.title)} · question ${resume.index+1} sur ${resume.lesson.questions.length}</small></span></button>`:''}</div>
    <aside class="hero-card"><div><span class="eyebrow">Ta progression</span><div class="ring" style="--progress:${pct}%"><div class="ring-content"><strong>${pct}%</strong><span>du parcours</span></div></div></div><div class="stats"><div class="stat"><strong>${state.progress.lessons.length}/${allLessons.length}</strong><span>leçons terminées</span></div><div class="stat"><strong>${masteredTotal()}/${allQuestions.length}</strong><span>exercices maîtrisés</span></div></div></aside></section>
    <section class="coach-card"><div class="coach-goal"><span class="eyebrow">Objectif du jour</span><div class="coach-goal-line"><strong>${coach.daily.attempts}/${coach.daily.goal}</strong><span>${coach.daily.remaining?`${coach.daily.remaining} tentative${coach.daily.remaining>1?'s':''} restante${coach.daily.remaining>1?'s':''}`:'Objectif atteint ✓'}</span></div><div class="coach-progress" role="progressbar" aria-label="Objectif quotidien" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${coach.daily.percent}"><i style="width:${coach.daily.percent}%"></i></div><div class="goal-options"><span id="goal-rhythm-label">Mon rythme</span><div class="goal-buttons" role="group" aria-labelledby="goal-rhythm-label">${[5,10,15].map(goal=>`<button class="${coach.daily.goal===goal?'active':''}" data-goal="${goal}" aria-pressed="${coach.daily.goal===goal}">${goal}</button>`).join('')}</div></div><div class="goal-reset"><label for="goal-reset-hour">Ma journée commence à</label><select id="goal-reset-hour">${Array.from({length:24},(_,hour)=>`<option value="${hour}" ${coach.daily.resetHour===hour?'selected':''}>${String(hour).padStart(2,'0')} h</option>`).join('')}</select></div></div><div class="coach-recommendation"><span class="eyebrow">Conseil personnalisé</span><h2>${coach.recommendation.title}</h2><p>${coach.recommendation.reason}</p>${coach.recommendation.type!=='complete'?`<button class="primary" data-action="coach">${coach.recommendation.type==='review'?'Lancer la révision':'Ouvrir la leçon'}</button>`:''}${quick.questionIds.length?`<button class="quick-button" data-action="quick">Session rapide · ${quick.questionIds.length} exercice${quick.questionIds.length>1?'s':''}<small>${quickComposition(quick)}</small></button>`:''}</div></section>
    <section class="portable"><div><span class="eyebrow">Progression portable</span><h2>Emporte tes résultats</h2><p>Exporte une sauvegarde puis restaure-la sur un autre appareil.</p></div><div class="portable-actions"><button data-action="export">Exporter</button><button data-action="choose-import">Restaurer</button><button data-action="glossary">Glossaire</button><button data-action="privacy">Confidentialité</button><input id="progress-import" type="file" accept="application/json,.json" hidden></div></section>
    <div class="section-title"><div><h2>Maîtrise par compétence</h2><p>Les résultats sont calculés à partir des exercices réussis.</p></div></div><section class="competencies">${curriculum.map(competenceCard).join('')}</section>
    <div class="section-title"><div><h2>Le parcours</h2><p>Douze modules, des fondations jusqu’à l’analyse complète.</p></div></div><section class="modules">${curriculum.map(moduleCard).join('')}</section>
  </main></div>`
}

function quickComposition(quick){
  const parts=[]
  if(quick.composition.due)parts.push(`${quick.composition.due} à revoir`)
  if(quick.composition.weak)parts.push(`${quick.composition.weak} sur tes points faibles`)
  if(quick.composition.fresh)parts.push(`${quick.composition.fresh} nouveau${quick.composition.fresh>1?'x':''}`)
  return parts.join(' · ')
}

function moduleCard(m,i){ const done=m.lessons.filter(l=>completed(l.id)).length; return `<article class="module"><div class="module-head"><span class="module-number">${i+1}</span><div><h3>${m.title}</h3><p class="module-ar ar">${m.ar}</p></div><span class="badge">${done}/${m.lessons.length}</span></div><p class="module-description">${m.description}</p><div class="lesson-list">${m.lessons.map(l=>`<button class="lesson-row" data-lesson="${l.id}"><span class="lesson-status ${completed(l.id)?'done':''}">${completed(l.id)?'✓':'○'}</span><span><strong>${l.title}</strong><small class="ar">${l.ar}</small></span><span>›</span></button>`).join('')}</div></article>` }

function statsView(){
  const stats=computeAnalytics(state.progress,curriculum)
  const reviews=reviewQuestions().length
  const maxDay=Math.max(1,...stats.days.map(day=>day.attempts))
  const mastered=stats.mastered
  const empty=stats.attempts===0
  const practisedTopics=stats.topics.filter(topic=>topic.attempts>0)
  return `<div class="shell">${header(true)}<main class="stats-shell">
    <header class="stats-title"><span class="eyebrow">Bilan pédagogique</span><h1>Ta progression en détail</h1><p>Les nouvelles tentatives sont enregistrées sur cet appareil et synchronisées avec ton compte.</p></header>
    <section class="metric-grid">
      <article class="metric"><span>Maîtrise</span><strong>${mastered}/${allQuestions.length}</strong><small>réussis et pas ratés depuis</small></article>
      <article class="metric"><span>Réussite</span><strong>${empty?'—':`${stats.accuracy}%`}</strong><small>${stats.attempts} tentative${stats.attempts>1?'s':''} suivie${stats.attempts>1?'s':''}</small></article>
      <article class="metric"><span>Série active</span><strong>${stats.streak}</strong><small>jour${stats.streak>1?'s':''} consécutif${stats.streak>1?'s':''}</small></article>
      <article class="metric"><span>À revoir</span><strong>${reviews}</strong><small>exercices ciblés</small></article>
    </section>
    ${empty?'<p class="stats-notice">L’historique commence aujourd’hui. Réponds à quelques exercices pour voir apparaître ton taux de réussite et tes erreurs fréquentes.</p>':''}
    <section class="stats-panel"><div class="stats-panel-head"><div><span class="eyebrow">Régularité</span><h2>Activité sur 7 jours</h2></div><strong>${stats.attempts} au total</strong></div><div class="activity-chart">${stats.days.map(day=>`<div class="activity-day"><span class="activity-value">${day.attempts||''}</span><i style="height:${Math.max(day.attempts?12:3,Math.round(day.attempts/maxDay*100))}%"></i><small>${day.label}</small></div>`).join('')}</div></section>
    <section class="stats-panel"><div class="stats-panel-head"><div><span class="eyebrow">Compétences</span><h2>Maîtrise par thème</h2></div></div><div class="topic-list">${stats.modules.map(module=>`<article class="topic-row"><div><strong>${module.title}</strong><span>${module.mastered}/${module.total} maîtrisés${module.attempts?` · ${module.accuracy}% de réussite`:''}</span></div><div class="topic-bar"><i style="width:${module.mastery}%"></i></div><b>${module.mastery}%</b></article>`).join('')}</div></section>
    ${practisedTopics.length?`<section class="stats-panel"><div class="stats-panel-head"><div><span class="eyebrow">Types d’erreurs</span><h2>Sur quoi tu butes</h2></div></div><p class="panel-lead">Chaque exercice teste une étape de la méthode. Cible directement celle qui te résiste.</p><div class="topic-kinds">${practisedTopics.map(topic=>`<article class="topic-kind ${topic.errors&&topic.accuracy<70?'weak':''}"><div><strong>${topic.label}</strong><span>${topic.errors?`${topic.errors} erreur${topic.errors>1?'s':''} sur ${topic.attempts} tentative${topic.attempts>1?'s':''}`:`${topic.attempts} tentative${topic.attempts>1?'s':''}, aucune erreur`}</span></div><div class="topic-bar"><i style="width:${topic.accuracy}%"></i></div><b>${topic.accuracy}%</b>${topicReviewCount(topic.id)?`<button class="topic-review" data-topic="${topic.id}">Réviser ${topicReviewCount(topic.id)}</button>`:'<span class="topic-clear">à jour</span>'}</article>`).join('')}</div></section>`:''}
    <section class="stats-panel"><div class="stats-panel-head"><div><span class="eyebrow">Révision ciblée</span><h2>Erreurs fréquentes</h2></div>${reviews?'<button class="review-button" data-action="review">Réviser maintenant</button>':''}</div>${stats.trouble.length?`<div class="trouble-list">${stats.trouble.map(item=>`<article><span>${item.moduleTitle}${item.topic?` · ${topicLabel(item.topic)}`:''}</span><strong>${escapeHtml(item.prompt)}</strong><small>${item.errors} erreur${item.errors>1?'s':''} sur ${item.attempts} tentative${item.attempts>1?'s':''}</small></article>`).join('')}</div>`:'<p class="empty-note">Aucune erreur enregistrée pour le moment.</p>'}</section>
  </main></div>`
}

function escapeHtml(value=''){ return String(value).replace(/[&<>"']/g,character=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[character]) }

// Un seul rendu d'erreur pour toute l'application : message clair et, quand la
// nouvelle tentative a du sens, un bouton qui rejoue exactement l'action échouée.
function cloudFeedback(){ if(!state.cloud.error)return ''; return `<div class="account-error" role="alert"><p>${escapeHtml(state.cloud.error)}</p>${state.cloud.retry?'<button class="retry-button" data-action="retry">Réessayer</button>':''}</div>` }
function cloudBanner(){ if(!state.cloud.error||state.view==='account'||state.view==='privacy')return ''; return `<div class="cloud-banner" role="alert"><span>${escapeHtml(state.cloud.error)}</span>${state.cloud.retry?'<button data-action="retry">Réessayer</button>':''}<button class="ghost-close" data-action="dismiss-error" aria-label="Masquer le message">✕</button></div>` }
function clearCloudError(){ state.cloud.error=''; state.cloud.retryable=false; state.cloud.retry=null }

function privacyView(){
  const email=state.cloud.session?escapeHtml(state.cloud.session.user.email):''
  return `<div class="shell">${header(true)}<main class="account-shell">
    <span class="eyebrow">Confidentialité</span><h1>Tes données</h1>
    <p class="account-lead">Iʿrāb est une application d’apprentissage. Elle n’enregistre que ce qui sert à suivre ta progression, et tu peux tout exporter ou tout supprimer à n’importe quel moment.</p>
    ${cloudFeedback()}
    <section class="account-panel"><h2>Ce qui est enregistré sur cet appareil</h2><p class="privacy-note">Dans le stockage local du navigateur, sous la clé <code>irab-fr:progress</code> :</p><ul class="privacy-list"><li>les leçons terminées et les exercices maîtrisés ;</li><li>les erreurs encore à revoir et les échéances de révision ;</li><li>le journal des 1 000 dernières tentatives, avec leur date et leur résultat ;</li><li>ton objectif quotidien.</li></ul><p class="privacy-note">Aucun de ces éléments ne quitte l’appareil tant que tu n’as pas créé de compte.</p></section>
    <section class="account-panel"><h2>Ce qui est synchronisé avec un compte</h2>${email?`<p class="privacy-note">Compte actuellement connecté : <strong>${email}</strong>.</p>`:''}<ul class="privacy-list"><li>ton adresse e-mail et un mot de passe chiffré, gérés par Supabase ;</li><li>la même progression que ci-dessus, dans une ligne qui t’appartient.</li></ul><p class="privacy-note">Une règle de sécurité au niveau de la base (RLS) empêche tout autre compte de lire ou de modifier ta ligne.</p></section>
    <section class="account-panel"><h2>Ce que l’application ne fait pas</h2><ul class="privacy-list"><li>aucune publicité, aucun traceur, aucune mesure d’audience ;</li><li>aucune revente ni partage de données à des fins commerciales ;</li><li>aucun profilage au-delà des recommandations pédagogiques calculées sur ton appareil.</li></ul></section>
    <section class="account-panel"><h2>Services tiers contactés par ton navigateur</h2><ul class="privacy-list"><li><strong>GitHub Pages</strong> : hébergement du site ;</li><li><strong>Google Fonts</strong> : polices latine et arabe ;</li><li><strong>unpkg</strong> : téléchargement du client Supabase, uniquement si un compte est utilisé ;</li><li><strong>Supabase</strong> : compte et synchronisation.</li></ul><p class="privacy-note">Ces services reçoivent techniquement ton adresse IP. La lecture audio des phrases arabes est confiée au moteur de synthèse vocale de ton système ou de ton navigateur : selon l’appareil, ce moteur peut traiter le texte en ligne.</p></section>
    <section class="account-panel"><h2>Conservation</h2><p class="privacy-note">La progression est conservée tant que tu utilises l’application ou que ton compte existe. Une suppression demandée ici est immédiate et définitive : elle n’est pas récupérable, sauf si tu as exporté une sauvegarde auparavant.</p><div class="privacy-actions"><button data-action="export">Exporter ma progression</button></div></section>
    <section class="account-panel danger-zone"><h2>Effacer mes données</h2><p class="privacy-note">Efface la progression enregistrée dans ce navigateur. Si tu as un compte, la copie synchronisée n’est pas touchée : elle reviendra à la prochaine connexion.</p><button class="danger-button" data-action="wipe-local">Effacer les données de cet appareil</button></section>
    ${state.cloud.session?`<section class="account-panel danger-zone"><h2>Supprimer mon compte</h2><p class="privacy-note">Supprime définitivement le compte <strong>${email}</strong>, sa progression synchronisée et les données de cet appareil. Cette action est irréversible.</p><label class="delete-confirm">Écris <code>SUPPRIMER</code> pour confirmer<input id="delete-confirm" type="text" autocomplete="off" spellcheck="false" placeholder="SUPPRIMER"></label><button class="danger-button danger-button--solid" data-action="delete-account">Supprimer mon compte et toutes mes données</button></section>`:''}
  </main></div>`
}

function accountView(){
  const privacyLink='<p class="privacy-link"><button class="link-button" data-action="privacy">Confidentialité et suppression des données</button></p>'
  if(!state.cloud.configured) return `<div class="shell">${header(true)}<main class="account-shell"><span class="eyebrow">Compte et synchronisation</span><h1>Mode invité actif</h1><p class="account-lead">Ta progression reste sauvegardée sur cet appareil. L’intégration cloud est prête mais attend la configuration d’un projet Supabase.</p><section class="account-panel"><h2>Activer la synchronisation</h2><ol><li>Créer un projet Supabase.</li><li>Exécuter <code>supabase/schema.sql</code> dans l’éditeur SQL.</li><li>Ajouter l’URL et la clé publique dans <code>supabase-config.js</code>.</li></ol><p class="account-note">Ne jamais utiliser une clé <code>service_role</code> dans le navigateur.</p></section><button class="primary" data-action="home">Continuer en invité</button>${privacyLink}</main></div>`
  if(state.cloud.session){ const email=escapeHtml(state.cloud.session.user.email); return `<div class="shell">${header(true)}<main class="account-shell"><span class="eyebrow">Compte synchronisé</span><h1>${email}</h1><p class="account-lead">Ta progression locale et distante est fusionnée sans perdre les leçons ou réponses maîtrisées.</p><section class="account-panel account-status"><div><span>État</span><strong>${cloudStatusLabel()}</strong></div><button data-action="sync" ${state.cloud.status==='syncing'?'disabled':''}>Synchroniser maintenant</button></section>${cloudFeedback()}<button class="danger-button" data-action="signout">Se déconnecter</button>${privacyLink}</main></div>` }
  return `<div class="shell">${header(true)}<main class="account-shell"><span class="eyebrow">Compte et synchronisation</span><h1>Retrouve ta progression partout</h1><p class="account-lead">Connecte-toi ou crée un compte. Ta progression invitée sera fusionnée avec le cloud.</p><section class="account-panel auth-form"><label>Adresse e-mail<input id="auth-email" type="email" autocomplete="email" placeholder="toi@exemple.fr"></label><label>Mot de passe<input id="auth-password" type="password" autocomplete="current-password" minlength="8" placeholder="8 caractères minimum"></label><div class="auth-actions"><button class="primary" data-auth-mode="signin" ${state.cloud.status==='syncing'?'disabled':''}>Se connecter</button><button data-auth-mode="signup" ${state.cloud.status==='syncing'?'disabled':''}>Créer mon compte</button></div></section>${state.cloud.status==='confirmation'?'<p class="account-success">Compte créé. Vérifie ton e-mail pour confirmer l’inscription.</p>':''}${state.cloud.status==='signed-out'?'<p class="account-success">Déconnexion effectuée. La progression de ce compte a été retirée de cet appareil ; elle revient dès la prochaine connexion.</p>':''}${cloudFeedback()}${privacyLink}</main></div>`
}

function cloudStatusLabel(){ return state.cloud.status==='syncing'?'Synchronisation…':state.cloud.status==='synced'?'À jour':state.cloud.status==='blocked'?'Mise à jour requise':state.cloud.status==='error'?'Erreur':'Connecté' }

// Recherche : l'index est bâti une fois, et seule la liste des résultats est
// redessinée à la frappe pour ne pas déplacer le curseur du champ.
// Construit au premier usage : le glossaire dont il dépend est déclaré plus bas,
// et l'index n'a pas à coûter quoi que ce soit tant qu'on ne cherche rien.
let searchIndex = null
function getSearchIndex(){ searchIndex ??= buildSearchIndex(curriculum,glossary); return searchIndex }
const SEARCH_KINDS = { term: 'Glossaire', lesson: 'Leçon', exercise: 'Exercice' }
function searchResultCard(result){
  const target = result.kind==='term' ? 'data-search-term' : result.kind==='exercise' ? 'data-search-exercise' : 'data-search-lesson'
  const value = result.kind==='exercise' ? `${result.lessonId}:${result.questionIndex}` : result.kind==='term' ? result.id : result.lessonId
  return `<button class="result" ${target}="${escapeHtml(value)}"><span class="result-kind">${SEARCH_KINDS[result.kind]}</span><strong>${escapeHtml(result.title)}</strong><span class="result-where">${escapeHtml(result.subtitle)}</span><span class="result-snippet">${escapeHtml(result.snippet)}</span></button>`
}
function searchResults(query){
  if(normalizeArabic(query).length<2&&query.trim().length<2)return '<p class="empty-note">Tape au moins deux caractères. Le français, la translittération et l’arabe fonctionnent tous les trois.</p>'
  const results=searchContent(query,getSearchIndex())
  if(!results.length)return `<p class="empty-note">Rien ne correspond à « ${escapeHtml(query)} ».</p>`
  return `<p class="result-count">${results.length} résultat${results.length>1?'s':''}</p><div class="result-list">${results.map(searchResultCard).join('')}</div>`
}
function searchView(){
  return `<div class="shell">${header(true)}<main class="container">
    <header class="stats-title"><span class="eyebrow">Recherche</span><h1>Trouver une règle</h1><p>Cherche une règle, un mot arabe, une fonction grammaticale ou un terme, en français comme en arabe.</p></header>
    <div class="glossary-search"><label class="sr-only" for="search-query">Chercher dans le contenu</label><input id="search-query" type="search" autocomplete="off" placeholder="مبتدأ, mubtada, thème, annexion…" value="${escapeHtml(state.searchQuery)}"></div>
    <div id="search-results">${searchResults(state.searchQuery)}</div>
  </main></div>`
}
function bindSearchResults(){
  const results=document.querySelector('#search-results')
  if(!results)return
  results.querySelectorAll('[data-search-lesson]').forEach(button=>button.onclick=()=>openLesson(button.dataset.searchLesson))
  results.querySelectorAll('[data-search-exercise]').forEach(button=>button.onclick=()=>{
    const [lessonId,index]=button.dataset.searchExercise.split(':')
    openLesson(lessonId,Number(index))
  })
  results.querySelectorAll('[data-search-term]').forEach(button=>button.onclick=()=>{
    state.view='glossary';state.glossaryQuery=button.dataset.searchTerm;render();scrollTo(0,0)
  })
}

// Glossaire : la liste est construite une fois, la recherche ne refait pas
// tout le rendu pour ne pas voler le focus du champ à chaque frappe.
const glossary = buildGlossary(curriculum)
function matchesGlossaryQuery(entry,query){
  if(!query)return true
  const plain=query.toLowerCase()
  const arabic=normalizeArabic(query)
  return entry.fr.toLowerCase().includes(plain)
    || entry.tr.toLowerCase().includes(plain)
    || entry.def.toLowerCase().includes(plain)
    || (Boolean(arabic)&&normalizeArabic(entry.ar).includes(arabic))
}
function glossaryEntryCard(entry){
  return `<article class="term"><div class="term-head"><span class="term-ar ar">${entry.ar}</span><button class="speak speak--term" data-speak="${encodeURIComponent(entry.ar)}" aria-label="Écouter le terme">◖))</button></div><strong>${escapeHtml(entry.fr)}</strong><span class="term-tr">${escapeHtml(entry.tr)}</span><p>${escapeHtml(entry.def)}</p>${entry.lessons.length?`<div class="term-lessons">${entry.lessons.slice(0,4).map(lesson=>`<button data-lesson="${lesson.id}">${escapeHtml(lesson.title)}</button>`).join('')}</div>`:'<span class="term-orphan">Terme de référence, pas encore travaillé dans une leçon.</span>'}</article>`
}
function glossaryList(query=''){
  const groups=GLOSSARY_GROUPS.map(group=>({ group, entries:glossary.filter(entry=>entry.group===group.id&&matchesGlossaryQuery(entry,query)) })).filter(item=>item.entries.length)
  if(!groups.length)return `<p class="empty-note">Aucun terme ne correspond à « ${escapeHtml(query)} ».</p>`
  return groups.map(({group,entries})=>`<section class="term-group"><div class="section-title"><div><h2>${group.label}</h2><p>${entries.length} terme${entries.length>1?'s':''}</p></div></div><div class="term-grid">${entries.map(glossaryEntryCard).join('')}</div></section>`).join('')
}
function glossaryView(){
  return `<div class="shell">${header(true)}<main class="container">
    <header class="stats-title"><span class="eyebrow">Glossaire français–arabe</span><h1>Les mots de l’analyse</h1><p>${glossary.length} termes de grammaire, avec leur translittération et les leçons où ils apparaissent.</p></header>
    <div class="glossary-search"><input id="glossary-query" type="search" autocomplete="off" placeholder="Chercher un terme, en français ou en arabe…" value="${escapeHtml(state.glossaryQuery)}"></div>
    <div id="glossary-results">${glossaryList(state.glossaryQuery)}</div>
  </main></div>`
}

// Après un filtrage, seuls les nœuds recréés ont besoin d'être reliés.
function bindGlossaryResults(){
  const results=document.querySelector('#glossary-results')
  if(!results)return
  results.querySelectorAll('[data-lesson]').forEach(button=>button.onclick=()=>openLesson(button.dataset.lesson))
  results.querySelectorAll('[data-speak]').forEach(button=>button.onclick=()=>speakArabic(decodeURIComponent(button.dataset.speak)))
}

function topicReviewCount(topicId){ return reviewQuestions().filter(question=>topicOf(question.id)===topicId).length }
function competenceCard(module){ const questions=module.lessons.flatMap(lesson=>lesson.questions); const mastered=questions.filter(question=>isMastered(state.progress,question.id)).length; const pct=Math.round(mastered/questions.length*100); return `<article class="competence"><div><strong>${module.title}</strong><span>${mastered}/${questions.length}</span></div><div class="skill-bar" role="progressbar" aria-label="${module.title}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div></article>` }

function answerIsCorrect(question){ return question.type==='builder' ? state.built.map(index=>question.tokens[index]).join(' ')===question.answer : state.selected===question.answer }
function exerciseReady(question){ return question.type==='builder' ? state.built.length===question.tokens.length : state.selected!==null }
function choiceExercise(question){ const wordMode=question.choices.every(choice=>!/\p{L}/u.test(choice[0].replace(/[\u0600-\u06ff]/g,''))); const endingMode=/terminaison|marque|forme convient/i.test(question.prompt); return `<div class="choices ${wordMode?'choices--words':''} ${endingMode?'choices--endings':''}" role="radiogroup" aria-label="Propositions">${question.choices.map(choice=>`<button class="choice ${state.selected===choice[1]?'selected':''}" data-choice="${choice[1]}" role="radio" aria-checked="${state.selected===choice[1]}" ${state.checked?'disabled':''}>${choice[0]}</button>`).join('')}</div>` }
function builderExercise(question){ const remaining=question.order.filter(index=>!state.built.includes(index)); return `<section class="builder"><span class="builder-label">Ton analyse</span><div class="builder-answer ar">${state.built.length?state.built.map((index,position)=>`<button data-remove="${position}" ${state.checked?'disabled':''}>${question.tokens[index]}</button>`).join(' '):'<span>Choisis les blocs ci-dessous…</span>'}</div><span class="builder-label">Blocs disponibles</span><div class="builder-pool ar">${remaining.map(index=>`<button data-token="${index}" ${state.checked?'disabled':''}>${question.tokens[index]}</button>`).join('')}</div></section>` }
function exerciseBody(question){ return question.type==='builder' ? builderExercise(question) : choiceExercise(question) }

function lessonView(){ const l=state.lesson; if(state.stage==='learn') return `<div class="shell">${header(true)}<main class="lesson-shell"><header class="lesson-title"><span class="eyebrow">Règle essentielle</span><h1>${l.title}</h1><p class="ar">${l.ar}</p></header><p class="lead">${l.summary}</p><div class="lesson-grid"><section class="panel"><span class="panel-label">La règle</span><p>${l.rule}</p></section><section class="panel example"><span class="panel-label">Exemple</span><button class="speak" data-speak="${encodeURIComponent(l.example)}" aria-label="Écouter l’exemple">◖))</button><p class="example-ar ar">${l.example}</p><p>${l.translation}</p></section><section class="panel analysis"><span class="panel-label">Analyse</span><p class="ar">${l.analysis}</p></section></div><div class="method"><span>1 · Nature</span><span>2 · Fonction</span><span>3 · État</span><span>4 · Marque</span></div><div class="lesson-actions"><button class="primary" data-action="practice">Passer aux exercices</button><button class="ghost-link" data-action="glossary">Un terme t’échappe ? Ouvre le glossaire</button></div></main></div>`
  const x=l.questions[state.qi]; const correct=answerIsCorrect(x)
  return `<div class="shell">${header(true)}<main class="lesson-shell"><div class="quiz-head"><span class="counter">Question ${state.qi+1} sur ${l.questions.length}</span><h1>${x.prompt}</h1></div><div class="question-wrap"><div class="question-ar ar">${x.arabic}</div><button class="speak speak--question" data-speak="${encodeURIComponent(x.arabic)}" aria-label="Écouter la phrase">◖))</button></div>${exerciseBody(x)}${state.checked?`<div class="feedback ${correct?'ok':'bad'}" tabindex="-1" role="group" aria-label="Correction"><strong>${correct?'✓ Bien analysé':'Pas encore'}</strong><p>${x.explanation}</p>${x.analysis?`<p class="ar">${x.analysis}</p>`:''}${secondPassBlock(x,correct)}<button class="primary" data-action="next">${state.qi===l.questions.length-1?(l.id==='quick'?'Terminer la session':state.review?'Terminer la révision':'Terminer la leçon'):'Question suivante'}</button></div>`:`<div class="quiz-actions"><button class="primary" data-action="check" ${exerciseReady(x)?'':'disabled'}>Vérifier</button></div>`}</main></div>`
}

function bind(){
  document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>openLesson(b.dataset.lesson))
  document.querySelector('[data-action="continue"]')?.addEventListener('click',()=>{const target=resumeTarget();if(target){openLesson(target.lesson.id,target.index);return}openLesson(allLessons.find(l=>!completed(l.id))?.id||allLessons[0].id)})
  document.querySelectorAll('[data-action="home"]').forEach(b=>b.onclick=()=>{state.view='home';state.review=false;render()})
  document.querySelector('[data-action="review"]')?.addEventListener('click',()=>openReview())
  document.querySelector('[data-action="coach"]')?.addEventListener('click',openCoachRecommendation)
  document.querySelector('[data-action="quick"]')?.addEventListener('click',openQuickSession)
  document.querySelector('[data-action="resume"]')?.addEventListener('click',resumeLesson)
  document.querySelectorAll('[data-topic]').forEach(button=>button.onclick=()=>openReview(button.dataset.topic))
  document.querySelectorAll('[data-goal]').forEach(button=>button.onclick=()=>setDailyGoal(Number(button.dataset.goal)))
  const resetHour=document.querySelector('#goal-reset-hour')
  if(resetHour)resetHour.onchange=()=>setResetHour(Number(resetHour.value))
  document.querySelectorAll('[data-action="account"]').forEach(button=>button.onclick=()=>{state.view='account';render();scrollTo(0,0)})
  document.querySelectorAll('[data-action="stats"]').forEach(button=>button.onclick=()=>{state.view='stats';render();scrollTo(0,0)})
  document.querySelectorAll('[data-action="privacy"]').forEach(button=>button.onclick=()=>{state.view='privacy';render();scrollTo(0,0)})
  document.querySelectorAll('[data-action="glossary"]').forEach(button=>button.onclick=()=>{state.view='glossary';state.glossaryQuery='';render();scrollTo(0,0)})
  document.querySelectorAll('[data-action="search"]').forEach(button=>button.onclick=()=>openSearch())
  const searchInput=document.querySelector('#search-query')
  if(searchInput)searchInput.oninput=()=>{state.searchQuery=searchInput.value;document.querySelector('#search-results').innerHTML=searchResults(state.searchQuery);bindSearchResults()}
  bindSearchResults()
  const glossaryInput=document.querySelector('#glossary-query')
  if(glossaryInput)glossaryInput.oninput=()=>{state.glossaryQuery=glossaryInput.value;const results=document.querySelector('#glossary-results');results.innerHTML=glossaryList(state.glossaryQuery);bindGlossaryResults()}
  document.querySelector('[data-action="retry"]')?.addEventListener('click',()=>{const retry=state.cloud.retry;if(!retry)return;clearCloudError();render();retry()})
  document.querySelector('[data-action="dismiss-error"]')?.addEventListener('click',()=>{clearCloudError();render()})
  document.querySelector('[data-action="wipe-local"]')?.addEventListener('click',wipeLocalData)
  document.querySelector('[data-action="delete-account"]')?.addEventListener('click',deleteEverything)
  document.querySelectorAll('[data-auth-mode]').forEach(button=>button.onclick=()=>handleAuth(button.dataset.authMode))
  document.querySelector('[data-action="sync"]')?.addEventListener('click',()=>syncCloud())
  document.querySelector('[data-action="signout"]')?.addEventListener('click',handleSignOut)
  document.querySelector('[data-action="install"]')?.addEventListener('click',installApp)
  document.querySelector('[data-action="export"]')?.addEventListener('click',exportProgress)
  document.querySelector('[data-action="choose-import"]')?.addEventListener('click',()=>document.querySelector('#progress-import')?.click())
  document.querySelector('#progress-import')?.addEventListener('change',importProgress)
  document.querySelector('[data-action="practice"]')?.addEventListener('click',()=>{state.stage='practice';state.qi=0;rememberPosition();save();render();scrollTo(0,0)})
  document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{state.selected=b.dataset.choice;render()})
  document.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>{state.built=[...state.built,Number(b.dataset.token)];render()})
  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.built=state.built.filter((_,index)=>index!==Number(b.dataset.remove));render()})
  document.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speakArabic(decodeURIComponent(b.dataset.speak)))
  document.querySelector('[data-action="check"]')?.addEventListener('click',checkAnswer)
  bindChoiceKeys()
  document.querySelector('[data-action="next"]')?.addEventListener('click',next)
}

// Après vérification, le focus rejoint la correction : un lecteur d'écran la lit
// immédiatement et le bouton suivant est à portée de tabulation.
function checkAnswer(){
  const question=state.lesson.questions[state.qi]
  if(!exerciseReady(question))return
  const correct=answerIsCorrect(question)
  schedule(question.id,correct)
  state.checked=true
  save()
  render()
  const feedback=app.querySelector('.feedback')
  if(feedback)feedback.focus({ preventScroll:true })
  announce(correct?'Bonne réponse.':repeatedFailure(question.id)&&secondExplanation(question.id)?'Réponse incorrecte. Une autre explication est proposée.':'Réponse incorrecte.')
}

// Un groupe de boutons radio se parcourt aux flèches, pas à la tabulation.
function bindChoiceKeys(){
  const group=app.querySelector('.choices')
  if(!group)return
  const choices=[...group.querySelectorAll('[data-choice]:not([disabled])')]
  group.onkeydown=event=>{
    const step={ ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1 }[event.key]
    if(!step)return
    event.preventDefault()
    const current=choices.indexOf(document.activeElement)
    const next=choices[(current+step+choices.length)%choices.length] ?? choices[0]
    next?.focus()
  }
}

// Un apprenant qui rate deux fois le même exercice a besoin d'un autre angle,
// pas de la même phrase répétée. Le bloc n'apparaît donc qu'au deuxième échec.
function repeatedFailure(questionId){ return (state.progress.wrongs[questionId] ?? 0) >= 2 }
function secondPassBlock(question,correct){
  if(correct||!repeatedFailure(question.id))return ''
  const entry=secondExplanation(question.id)
  if(!entry)return ''
  const example=entry.example
    ? `<div class="second-example"><span class="second-label">Un autre exemple</span><p class="second-ar ar">${entry.example.ar}</p><p class="second-fr">${escapeHtml(entry.example.fr)}</p><p class="second-ar ar">${entry.example.analysis}</p></div>`
    : ''
  return `<div class="second-pass"><span class="second-label">Reprenons autrement</span><p>${escapeHtml(entry.again)}</p>${example}</div>`
}

// La barre oblique ouvre la recherche, comme partout ailleurs. Le champ prend
// le focus tout de suite : venir chercher, c'est déjà vouloir taper.
function openSearch(){
  state.view='search'
  state.searchQuery=''
  render()
  scrollTo(0,0)
  document.querySelector('#search-query')?.focus()
}

function openLesson(id,index=0){ const lesson=allLessons.find(l=>l.id===id); if(!lesson)return; state={...state,view:'lesson',lesson,stage:index>0?'practice':'learn',qi:Math.min(index,lesson.questions.length-1),selected:null,built:[],checked:false,review:false}; render(); scrollTo(0,0) }
function resumeLesson(){ const target=resumeTarget(); if(!target)return; openLesson(target.lesson.id,target.index) }

// Une révision peut être limitée à un type d'erreur : nature, fonction, état,
// marque ou analyse complète.
function openReview(topicId=null){
  const questions=reviewQuestions().filter(question=>!topicId||topicOf(question.id)===topicId)
  if(!questions.length)return
  const title=topicId?`Révision · ${topicLabel(topicId)}`:'Révision ciblée'
  state={...state,view:'lesson',lesson:{id:'review',title,ar:'مُرَاجَعَةُ الْأَخْطَاءِ',questions},stage:'practice',qi:0,selected:null,built:[],checked:false,review:true};render();scrollTo(0,0)
}

function openQuickSession(){
  const plan=buildQuickSession(state.progress,curriculum,reviewQuestions().map(question=>question.id))
  const questions=plan.questionIds.map(id=>allQuestions.find(question=>question.id===id)).filter(Boolean)
  if(!questions.length)return
  state={...state,view:'lesson',lesson:{id:'quick',title:'Session rapide',ar:'جَلْسَةٌ سَرِيعَةٌ',questions},stage:'practice',qi:0,selected:null,built:[],checked:false,review:true};render();scrollTo(0,0)
}
function openCoachRecommendation(){ const reviews=reviewQuestions();const coach=createCoach(state.progress,curriculum,reviews.map(question=>question.id));if(coach.recommendation.type==='review')openReview();else if(coach.recommendation.lessonId)openLesson(coach.recommendation.lessonId) }
function setDailyGoal(dailyGoal){ if(![5,10,15].includes(dailyGoal))return;state.progress.preferences={...state.progress.preferences,dailyGoal,updatedAt:new Date().toISOString()};save();render();announce(`Objectif quotidien : ${dailyGoal} exercices.`) }
function setResetHour(resetHour){ if(!Number.isInteger(resetHour)||resetHour<0||resetHour>23)return;state.progress.preferences={...state.progress.preferences,resetHour,updatedAt:new Date().toISOString()};save();render();announce(`Ta journée commence à ${String(resetHour).padStart(2,'0')} heures.`) }
function next(){
  const x=state.lesson.questions[state.qi]
  if(answerIsCorrect(x)&&!state.progress.questions.includes(x.id)) state.progress.questions.push(x.id)
  if(state.qi<state.lesson.questions.length-1){state.qi++;state.selected=null;state.built=[];state.checked=false;rememberPosition();save();render();scrollTo(0,0);return}
  if(!state.review&&!completed(state.lesson.id))state.progress.lessons.push(state.lesson.id)
  if(!state.review)forgetPosition()
  announce(state.review?'Session terminée. Retour au parcours.':'Leçon terminée. Retour au parcours.')
  save();state.view='home';state.review=false;state.built=[];render();scrollTo(0,0)
}

async function installApp(){ if(!installPrompt)return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt=null; render() }
function exportProgress(){ const payload=createBackup(state.progress); const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download=`irab-progression-${dateKey()}.json`; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000) }
async function importProgress(event){ const file=event.target.files?.[0]; if(!file)return; try{ const progress=parseBackup(await file.text()); localStorage.setItem(STORAGE_KEY,JSON.stringify(progress)); location.reload() }catch{ alert('Cette sauvegarde Iʿrāb est invalide ou endommagée.') } }

// Toute erreur cloud passe par ici : message traduit, et nouvelle tentative
// mémorisée quand elle a une chance d'aboutir.
function reportCloudError(error,retry){ const described=describeCloudError(error,{online}); state.cloud.status='error'; state.cloud.error=described.message; state.cloud.retryable=described.retryable; state.cloud.retry=described.retryable?retry:null }
function applyCloudResult(result,retry){
  if(result.status==='synced'){ state.progress=result.progress; persist(); state.cloud.status='synced'; clearCloudError(); announce('Progression synchronisée.'); return }
  state.cloud.status=result.status==='blocked'?'blocked':'error'
  state.cloud.error=result.error.message
  state.cloud.retryable=result.error.retryable
  state.cloud.retry=result.error.retryable?retry:null
  announce(result.error.message)
}

function queueCloudSave(){ if(!state.cloud.session)return; clearTimeout(cloudSaveTimer); cloudSaveTimer=setTimeout(async()=>{ const session=state.cloud.session; if(!session)return; const result=await publish({userId:session.user.id,progress:state.progress,saveRemote:saveCloudProgress,online}); applyCloudResult(result,()=>syncCloud(session)); if(state.view!=='lesson')render() },800) }

async function syncCloud(session=state.cloud.session){
  if(!session)return
  state.cloud.status='syncing'; clearCloudError(); render()
  const result=await synchronize({userId:session.user.id,local:state.progress,loadRemote:loadCloudProgress,saveRemote:saveCloudProgress,online})
  applyCloudResult(result,()=>syncCloud(session))
  render()
}

async function handleAuth(mode){
  const email=document.querySelector('#auth-email')?.value.trim()
  const password=document.querySelector('#auth-password')?.value
  if(!email||!password){ state.cloud.error='Saisis une adresse e-mail et un mot de passe.'; state.cloud.retryable=false; state.cloud.retry=null; render(); return }
  if(mode==='signup'&&password.length<8){ state.cloud.error='Choisis un mot de passe d’au moins 8 caractères.'; state.cloud.retryable=false; state.cloud.retry=null; render(); return }
  state.cloud.status='syncing'; clearCloudError(); render()
  try{
    const session=mode==='signup'?await signUp(email,password):await signIn(email,password)
    if(session){ state.cloud.session=session; await syncCloud(session) }
    else { state.cloud.status='confirmation'; render() }
  }catch(error){ reportCloudError(error,()=>handleAuth(mode)); render() }
}

// La progression affichée appartient au compte qui vient de se déconnecter :
// la laisser sur l'appareil la ferait fusionner dans le compte suivant.
// Elle est déjà dans le cloud et revient à la prochaine connexion.
async function handleSignOut(){
  try{
    clearTimeout(cloudSaveTimer)
    await signOut()
    state.cloud.session=null
    state.progress=migrateProgress({})
    localStorage.removeItem(STORAGE_KEY)
    state.cloud.status='signed-out'
    clearCloudError()
    render()
  }catch(error){ reportCloudError(error,handleSignOut); render() }
}

function wipeLocalData(){
  if(!confirm('Effacer toute la progression enregistrée dans ce navigateur ? Cette action est irréversible.'))return
  localStorage.removeItem(STORAGE_KEY)
  location.reload()
}

// Suppression définitive : la progression distante part d'abord, puis le compte.
// Si la fonction serveur est absente, on le dit clairement au lieu de laisser
// croire que le compte a disparu.
async function deleteEverything(){
  const confirmation=(document.querySelector('#delete-confirm')?.value||'').trim().toUpperCase()
  if(confirmation!=='SUPPRIMER'){ state.cloud.error='Écris SUPPRIMER en majuscules pour confirmer la suppression.'; state.cloud.retryable=false; state.cloud.retry=null; render(); return }
  const session=state.cloud.session
  if(!session){ wipeLocalData(); return }
  state.cloud.status='syncing'; clearCloudError(); render()
  clearTimeout(cloudSaveTimer)
  try{ await deleteCloudProgress(session.user.id) }
  catch(error){ reportCloudError(error,deleteEverything); render(); return }
  try{ await deleteAccount() }
  catch(error){
    localStorage.removeItem(STORAGE_KEY)
    await signOut().catch(()=>{})
    state.cloud.session=null
    state.cloud.status='error'
    state.cloud.error=`${describeCloudError(error,{online}).message} Ta progression synchronisée a bien été supprimée et tu as été déconnecté.`
    state.cloud.retryable=false
    state.cloud.retry=null
    render()
    return
  }
  localStorage.removeItem(STORAGE_KEY)
  await signOut().catch(()=>{})
  location.reload()
}

async function initializeAccount(){
  if(!state.cloud.configured)return
  try{
    await initializeCloud()
    state.cloud.session=await currentSession()
    onAuthChange(session=>{ state.cloud.session=session; if(session)syncCloud(session); else if(state.view==='account'||state.view==='privacy')render() })
    if(state.cloud.session)await syncCloud(state.cloud.session)
    else render()
  }catch(error){ reportCloudError(error,initializeAccount); render() }
}

window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;if(state.view==='home')render()})
window.addEventListener('appinstalled',()=>{installPrompt=null;if(state.view==='home')render()})
// Échap ramène au parcours depuis n'importe quelle vue secondaire, et le lien
// d'évitement conduit le focus au contenu plutôt que de simplement s'y ancrer.
window.addEventListener('keydown',event=>{
  const typing=document.activeElement?.tagName==='INPUT'||document.activeElement?.tagName==='SELECT'
  if(event.key==='/'&&!typing&&state.view!=='search'){ event.preventDefault(); openSearch(); return }
  if(event.key!=='Escape'||state.view==='home')return
  if(typing)return
  state.view='home'
  state.review=false
  render()
  announce('Retour au parcours.')
})
document.querySelector('.skip-link')?.addEventListener('click',event=>{
  event.preventDefault()
  app.querySelector('main')?.focus()
})

window.addEventListener('online',()=>{online=true;announce('Connexion rétablie.');if(state.cloud.session&&state.cloud.status!=='synced')syncCloud();else render()})
window.addEventListener('offline',()=>{online=false;announce('Tu es hors ligne. Ta progression reste enregistrée sur cet appareil.');render()})

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.error('Service worker:',error))) }

render()
initializeAccount()
