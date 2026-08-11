import { advancedModules } from './content-advanced.js'
import { dateKey, isDue, scheduleCard } from './srs.js'
import { createBackup, parseBackup } from './backup.js'
import { mergeProgress } from './merge.js'
import { currentSession, initializeCloud, isCloudConfigured, loadCloudProgress, onAuthChange, saveCloudProgress, signIn, signOut, signUp } from './cloud.js'

let installPrompt = null
let online = navigator.onLine

const curriculum = [
  {
    id: 'words', title: 'Les trois familles de mots', ar: 'أَقْسَامُ الْكَلِمَةِ',
    description: 'Reconnaître la nature d’un mot avant toute analyse grammaticale.',
    lessons: [
      lesson('types', 'Nom, verbe ou particule ?', 'اِسْمٌ، فِعْلٌ أَمْ حَرْفٌ؟', 'Toute analyse commence par la nature du mot.', 'Le nom désigne une personne, une chose ou une qualité. Le verbe porte une action et un temps. La particule relie les mots ou modifie leur analyse.', 'فِي الْبَيْتِ كِتَابٌ', 'Dans la maison, il y a un livre.', 'فِي : حرف جر — الْبَيْتِ : اسم — كِتَابٌ : اسم', [
        q('types-1', 'Quelle est la nature de فِي ?', 'فِي', [['Nom — اسم','n'],['Verbe — فعل','v'],['Particule — حرف','p']], 'p', 'فِي signifie « dans ». C’est une préposition, donc une particule.', 'فِي : حرف جر مبني لا محل له من الإعراب'),
        q('types-2', 'Quelle est la nature de كَتَبَ ?', 'كَتَبَ', [['Nom — اسم','n'],['Verbe — فعل','v'],['Particule — حرف','p']], 'v', 'كَتَبَ exprime l’action d’écrire au passé.', 'كَتَبَ : فعل ماضٍ مبني على الفتح'),
        q('types-3', 'Quelle est la nature de الطَّالِبُ ?', 'الطَّالِبُ', [['Nom — اسم','n'],['Verbe — فعل','v'],['Particule — حرف','p']], 'n', 'الطَّالِبُ désigne une personne : l’étudiant.', 'الطَّالِبُ : اسم')
      ]),
      lesson('built', 'Variable ou invariable', 'الْمُعْرَبُ وَالْمَبْنِيُّ', 'Certains mots changent de terminaison, d’autres gardent toujours la même forme.', 'Un mot مُعْرَب change de terminaison selon sa fonction. Un mot مَبْنِيّ est invariable. Les particules, le passé et l’impératif sont normalement invariables.', 'كَتَبَ الطَّالِبُ', 'L’étudiant a écrit.', 'كَتَبَ est invariable ; الطَّالِبُ est au nominatif selon sa fonction.', [
        q('built-1', 'Une particule est généralement…', 'حَرْفٌ', [['Variable — مُعْرَب','var'],['Invariable — مَبْنِيّ','built']], 'built', 'Les particules sont invariables.', 'الحروف كلها مبنية'),
        q('built-2', 'Quel élément peut changer selon sa fonction ?', 'الطَّالِبُ / الطَّالِبَ / الطَّالِبِ', [['Le nom — الاسم','n'],['La particule — الحرف','p']], 'n', 'Le nom peut recevoir la ḍamma, la fatḥa ou la kasra.', 'الاسم معرب: مرفوع أو منصوب أو مجرور')
      ])
    ]
  },
  {
    id: 'cases', title: 'Les quatre états', ar: 'أَقْسَامُ الْإِعْرَابِ',
    description: 'Comprendre rafʿ, naṣb, jarr et jazm ainsi que leurs marques.',
    lessons: [
      lesson('states', 'Les états grammaticaux', 'الرَّفْعُ وَالنَّصْبُ وَالْجَرُّ وَالْجَزْمُ', 'La fonction du mot détermine son état grammatical.', 'Le nom accepte rafʿ, naṣb et jarr. Le présent accepte rafʿ, naṣb et jazm. Un nom n’est jamais majzūm et un verbe n’est jamais majrūr.', 'يَكْتُبُ الطَّالِبُ الدَّرْسَ فِي الدَّفْتَرِ', 'L’étudiant écrit la leçon dans le cahier.', 'الطَّالِبُ مرفوع — الدَّرْسَ منصوب — الدَّفْتَرِ مجرور', [
        q('states-1', 'Quel est l’état du sujet الطَّالِبُ ?', 'كَتَبَ الطَّالِبُ', caseChoices(), 'raf', 'Le sujet du verbe est au nominatif.', 'الطَّالِبُ فاعل مرفوع وعلامة رفعه الضمة'),
        q('states-2', 'Quel est l’état du complément الدَّرْسَ ?', 'كَتَبَ الطَّالِبُ الدَّرْسَ', caseChoices(), 'nasb', 'Le complément d’objet est à l’accusatif.', 'الدَّرْسَ مفعول به منصوب وعلامة نصبه الفتحة'),
        q('states-3', 'Quel est l’état du nom après فِي ?', 'فِي الْبَيْتِ', caseChoices(), 'jarr', 'Une préposition place le nom suivant au génitif.', 'الْبَيْتِ اسم مجرور بفي وعلامة جره الكسرة')
      ]),
      lesson('marks', 'Les marques principales', 'الْعَلَامَاتُ الْأَصْلِيَّةُ', 'Ḍamma, fatḥa, kasra et sukūn rendent l’état visible.', 'La ḍamma marque principalement le rafʿ, la fatḥa le naṣb, la kasra le jarr et le sukūn le jazm.', 'لَمْ يَكْتُبْ', 'Il n’a pas écrit.', 'يَكْتُبْ : فعل مضارع مجزوم بلم وعلامة جزمه السكون', [
        q('marks-1', 'Quelle marque indique normalement le nominatif ?', 'ـُ', [['Ḍamma — الضمة','d'],['Fatḥa — الفتحة','f'],['Kasra — الكسرة','k']], 'd', 'La ḍamma est la marque principale du rafʿ.'),
        q('marks-2', 'Quelle marque termine يَكْتُبْ après لَمْ ?', 'لَمْ يَكْتُبْ', [['Sukūn — السكون','s'],['Ḍamma — الضمة','d']], 's', 'لَمْ rend le présent majzūm, ici marqué par le sukūn.', 'فعل مضارع مجزوم وعلامة جزمه السكون')
      ])
    ]
  },
  {
    id: 'nominal', title: 'La phrase nominale', ar: 'الْجُمْلَةُ الِاسْمِيَّةُ',
    description: 'Identifier le mubtadaʾ et les différentes formes du khabar.',
    lessons: [
      lesson('mubtada', 'Mubtadaʾ et khabar', 'الْمُبْتَدَأُ وَالْخَبَرُ', 'La phrase nominale commence normalement par un nom.', 'Le mubtadaʾ est le thème dont on parle. Le khabar apporte l’information. Tous deux sont normalement marfūʿ.', 'الْبَيْتُ كَبِيرٌ', 'La maison est grande.', 'الْبَيْتُ مبتدأ مرفوع — كَبِيرٌ خبر مرفوع', [
        q('mub-1', 'Quelle est la fonction de الْبَيْتُ ?', 'الْبَيْتُ كَبِيرٌ', [['Mubtadaʾ — مبتدأ','m'],['Khabar — خبر','k'],['Fāʿil — فاعل','f']], 'm', 'C’est le thème de la phrase nominale.', 'الْبَيْتُ مبتدأ مرفوع وعلامة رفعه الضمة'),
        q('mub-2', 'Quelle est la fonction de كَبِيرٌ ?', 'الْبَيْتُ كَبِيرٌ', [['Khabar — خبر','k'],['Objet — مفعول به','o']], 'k', 'كَبِيرٌ donne l’information sur la maison.', 'كَبِيرٌ خبر مرفوع وعلامة رفعه الضمة')
      ]),
      lesson('khabar', 'Les formes du khabar', 'أَنْوَاعُ الْخَبَرِ', 'Le khabar peut être un mot, une phrase ou un groupe.', 'Les cinq formes à reconnaître sont : mot simple, phrase nominale, phrase verbale, groupe جار ومجرور et ظرف.', 'الْكِتَابُ عَلَى الْمَكْتَبِ', 'Le livre est sur le bureau.', 'عَلَى الْمَكْتَبِ : جار ومجرور في محل رفع خبر', [
        q('khab-1', 'Quelle est la forme du khabar ?', 'الطَّالِبُ يَدْرُسُ', [['Phrase verbale — جملة فعلية','v'],['Mot simple — مفرد','s'],['Groupe prépositionnel — جار ومجرور','p']], 'v', 'يَدْرُسُ est un verbe : la phrase verbale sert de khabar.', 'جملة يدرس في محل رفع خبر'),
        q('khab-2', 'Quelle est la forme du khabar ?', 'الْكِتَابُ عَلَى الْمَكْتَبِ', [['Groupe prépositionnel — جار ومجرور','p'],['Mot simple — مفرد','s']], 'p', 'عَلَى est une préposition suivie d’un nom au génitif.', 'عَلَى الْمَكْتَبِ جار ومجرور في محل رفع خبر')
      ])
    ]
  },
  {
    id: 'verbal', title: 'La phrase verbale', ar: 'الْجُمْلَةُ الْفِعْلِيَّةُ',
    description: 'Analyser le verbe, son sujet et son éventuel complément d’objet.',
    lessons: [
      lesson('pillars', 'Les piliers de la phrase verbale', 'الْفِعْلُ وَالْفَاعِلُ وَالْمَفْعُولُ بِهِ', 'Le sujet est marfūʿ ; le complément d’objet est manṣūb.', 'La structure fréquente est verbe + fāʿil + mafʿūl bihi. Le fāʿil accomplit l’action et le mafʿūl bihi la reçoit.', 'كَتَبَ الطَّالِبُ الدَّرْسَ', 'L’étudiant a écrit la leçon.', 'كَتَبَ فعل — الطَّالِبُ فاعل مرفوع — الدَّرْسَ مفعول به منصوب', [
        q('pill-1', 'Quel mot accomplit l’action ?', 'فَتَحَ الْوَلَدُ الْبَابَ', [['الْوَلَدُ','boy'],['الْبَابَ','door'],['فَتَحَ','verb']], 'boy', 'Le garçon accomplit l’action : il est fāʿil.', 'الْوَلَدُ فاعل مرفوع وعلامة رفعه الضمة'),
        q('pill-2', 'Quel mot reçoit l’action ?', 'فَتَحَ الْوَلَدُ الْبَابَ', [['الْبَابَ','door'],['الْوَلَدُ','boy']], 'door', 'La porte reçoit l’action : elle est mafʿūl bihi.', 'الْبَابَ مفعول به منصوب وعلامة نصبه الفتحة')
      ]),
      lesson('subject', 'Les trois formes du fāʿil', 'أَنْوَاعُ الْفَاعِلِ', 'Le sujet peut être visible, attaché au verbe ou sous-entendu.', 'Le fāʿil est soit un nom apparent, soit un pronom attaché, soit un pronom caché dont on indique l’estimation.', 'كَتَبْتُ — يَكْتُبُ — كَتَبَ الطَّالِبُ', 'J’ai écrit — il écrit — l’étudiant a écrit.', 'تُ ضمير متصل — هو ضمير مستتر — الطَّالِبُ اسم ظاهر', [
        q('sub-1', 'Quelle est la forme du sujet dans كَتَبْتُ ?', 'كَتَبْتُ', [['Pronom attaché — ضمير متصل','a'],['Nom apparent — اسم ظاهر','v'],['Pronom caché — ضمير مستتر','h']], 'a', 'Le تُ est attaché au verbe et signifie « je ».', 'التاء ضمير متصل مبني في محل رفع فاعل'),
        q('sub-2', 'Où est le sujet de يَكْتُبُ ?', 'يَكْتُبُ', [['Il est caché : هُوَ','h'],['Il n’y a aucun sujet','n']], 'h', 'Toute phrase verbale possède un sujet. Ici, il est sous-entendu.', 'الفاعل ضمير مستتر تقديره هو')
      ]),
      lesson('method', 'La méthode complète', 'خُطُوَاتُ الْإِعْرَابِ', 'Nature, fonction, état, marque : toujours dans cet ordre.', 'Pour chaque mot, identifie sa nature, sa fonction, l’état imposé par cette fonction, puis la marque visible ou estimée.', 'يَقْرَأُ الطَّالِبُ الْكِتَابَ فِي الْبَيْتِ', 'L’étudiant lit le livre dans la maison.', 'يَقْرَأُ فعل مضارع مرفوع — الطَّالِبُ فاعل مرفوع — الْكِتَابَ مفعول به منصوب — فِي حرف جر — الْبَيْتِ اسم مجرور', [
        q('method-1', 'Choisis l’analyse correcte de الْكِتَابَ.', 'يَقْرَأُ الطَّالِبُ الْكِتَابَ', [['مفعول به منصوب وعلامة نصبه الفتحة','ok'],['فاعل مرفوع وعلامة رفعه الضمة','f'],['اسم مجرور وعلامة جره الكسرة','j']], 'ok', 'Le livre reçoit l’action de lire : c’est le complément d’objet direct.'),
        q('method-2', 'Quelle étape vient après la fonction ?', 'النَّوْعُ ← الْوَظِيفَةُ ← ؟ ← الْعَلَامَةُ', [['L’état — الحالة الإعرابية','state'],['La traduction — الترجمة','tr']], 'state', 'La méthode est : nature, fonction, état, puis marque.')
      ])
    ]
  },
  ...advancedModules
]

function lesson(id,title,ar,summary,rule,example,translation,analysis,questions){ return {id,title,ar,summary,rule,example,translation,analysis,questions} }
function q(id,prompt,arabic,choices,answer,explanation,analysis=''){ return {id,prompt,arabic,choices,answer,explanation,analysis} }
function caseChoices(){ return [['Nominatif — مرفوع','raf'],['Accusatif — منصوب','nasb'],['Génitif — مجرور','jarr'],['Apocopé — مجزوم','jazm']] }

// Chaque question possède une seconde passe de consolidation avec un ordre différent.
// L'identifiant séparé permet au moteur SRS de mesurer la restitution, pas seulement la reconnaissance.
for (const module of curriculum) {
  for (const lesson of module.lessons) {
    const consolidation = lesson.questions.map(question => ({
      ...question,
      id: `${question.id}-c`,
      prompt: `Consolidation · ${question.prompt}`,
      choices: [...question.choices.slice(1), question.choices[0]],
      explanation: `À retenir : ${question.explanation}`,
    }))
    const source = lesson.questions.find(question => question.analysis) ?? lesson.questions[0]
    const builderAnalysis = source?.analysis || lesson.analysis
    const tokens = builderAnalysis?.trim().split(/\s+/) ?? []
    const builder = tokens.length > 2 ? [{
      id: `${lesson.id}-builder`,
      type: 'builder',
      prompt: 'Construis l’analyse dans le bon ordre.',
      arabic: source.arabic,
      tokens,
      order: [tokens.length - 1, ...tokens.slice(0, -1).map((_, index) => index)],
      answer: tokens.join(' '),
      explanation: 'L’analyse suit l’ordre : fonction, état grammatical, puis marque et justification.',
      analysis: builderAnalysis,
    }] : []
    lesson.questions = [...lesson.questions, ...consolidation, ...builder]
  }
}

const allLessons = curriculum.flatMap(m => m.lessons)
const allQuestions = allLessons.flatMap(l => l.questions)
const saved = loadProgress()
let state = { view:'home', lesson:null, stage:'learn', qi:0, selected:null, built:[], checked:false, review:false, progress:{lessons:saved.lessons||[], questions:saved.questions||[], wrongs:saved.wrongs||{}, cards:saved.cards||{}}, cloud:{configured:isCloudConfigured(),session:null,status:'idle',error:''} }
const app = document.querySelector('#app')
let cloudSaveTimer = null

function loadProgress(){ try { return JSON.parse(localStorage.getItem('irab-fr:progress') || '{}') } catch { return {} } }
function save(){ localStorage.setItem('irab-fr:progress', JSON.stringify(state.progress)); queueCloudSave() }
function completed(id){ return state.progress.lessons.includes(id) }
function reviewQuestions(){ return allQuestions.filter(question => state.progress.wrongs[question.id] > 0 || isDue(state.progress.cards[question.id])) }
function schedule(questionId, correct){
  state.progress.cards[questionId]=scheduleCard(state.progress.cards[questionId],correct)
  if(!correct){ state.progress.wrongs[questionId]=(state.progress.wrongs[questionId]||0)+1; return }
  delete state.progress.wrongs[questionId]
}
function speakArabic(text){ if(!('speechSynthesis' in window))return; speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(text); utterance.lang='ar-SA'; utterance.rate=.78; const voice=speechSynthesis.getVoices().find(item=>item.lang.toLowerCase().startsWith('ar')); if(voice)utterance.voice=voice; speechSynthesis.speak(utterance) }
function render(){ app.innerHTML = state.view === 'home' ? homeView() : state.view === 'account' ? accountView() : lessonView(); bind() }
function header(back=false){ const accountLabel=state.cloud.session?.user?.email?'Synchronisé':'Compte'; return `<header class="topbar">${back?'<button class="ghost back" data-action="home">← <span class="hide-mobile">Parcours</span></button>':''}<div class="brand"><span class="brand-mark ar">إ</span><span>Iʿrāb</span></div><span class="top-spacer"></span>${!online?'<span class="offline-badge">Hors ligne</span>':''}${installPrompt?'<button class="install-button" data-action="install">Installer</button>':''}<button class="account-button" data-action="account">${accountLabel}</button><span class="ar hide-mobile">نَحْوٌ وَإِعْرَابٌ</span></header>` }

function homeView(){
  const pct = Math.round(state.progress.lessons.length / allLessons.length * 100)
  const reviews = reviewQuestions().length
  return `<div class="shell">${header()}<main class="container">
    <section class="hero"><div class="hero-copy"><span class="eyebrow">Grammaire arabe · Français</span><h1>Lis la fonction.<br>Comprends la terminaison.</h1><p>Un parcours progressif pour apprendre le iʿrāb, analyser chaque mot et construire une réponse grammaticale complète.</p><div class="hero-arabic ar">الإِعْرَابُ خُطْوَةً خُطْوَةً</div><div class="hero-actions"><button class="primary" data-action="continue">${state.progress.lessons.length ? 'Continuer mon parcours' : 'Commencer le parcours'}</button>${reviews?`<button class="review-button" data-action="review">Révision du jour <span>${reviews}</span></button>`:''}</div></div>
    <aside class="hero-card"><div><span class="eyebrow">Ta progression</span><div class="ring" style="--progress:${pct}%"><div class="ring-content"><strong>${pct}%</strong><span>du parcours</span></div></div></div><div class="stats"><div class="stat"><strong>${state.progress.lessons.length}/${allLessons.length}</strong><span>leçons terminées</span></div><div class="stat"><strong>${state.progress.questions.length}/${allQuestions.length}</strong><span>réponses maîtrisées</span></div></div></aside></section>
    <section class="portable"><div><span class="eyebrow">Progression portable</span><h2>Emporte tes résultats</h2><p>Exporte une sauvegarde puis restaure-la sur un autre appareil.</p></div><div class="portable-actions"><button data-action="export">Exporter</button><button data-action="choose-import">Restaurer</button><input id="progress-import" type="file" accept="application/json,.json" hidden></div></section>
    <div class="section-title"><div><h2>Maîtrise par compétence</h2><p>Les résultats sont calculés à partir des exercices réussis.</p></div></div><section class="competencies">${curriculum.map(competenceCard).join('')}</section>
    <div class="section-title"><div><h2>Le parcours</h2><p>Douze modules, des fondations jusqu’à l’analyse complète.</p></div></div><section class="modules">${curriculum.map(moduleCard).join('')}</section>
  </main></div>`
}

function moduleCard(m,i){ const done=m.lessons.filter(l=>completed(l.id)).length; return `<article class="module"><div class="module-head"><span class="module-number">${i+1}</span><div><h3>${m.title}</h3><p class="module-ar ar">${m.ar}</p></div><span class="badge">${done}/${m.lessons.length}</span></div><p class="module-description">${m.description}</p><div class="lesson-list">${m.lessons.map(l=>`<button class="lesson-row" data-lesson="${l.id}"><span class="lesson-status ${completed(l.id)?'done':''}">${completed(l.id)?'✓':'○'}</span><span><strong>${l.title}</strong><small class="ar">${l.ar}</small></span><span>›</span></button>`).join('')}</div></article>` }

function escapeHtml(value=''){ return String(value).replace(/[&<>"']/g,character=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[character]) }
function accountView(){
  if(!state.cloud.configured) return `<div class="shell">${header(true)}<main class="account-shell"><span class="eyebrow">Compte et synchronisation</span><h1>Mode invité actif</h1><p class="account-lead">Ta progression reste sauvegardée sur cet appareil. L’intégration cloud est prête mais attend la configuration d’un projet Supabase.</p><section class="account-panel"><h2>Activer la synchronisation</h2><ol><li>Créer un projet Supabase.</li><li>Exécuter <code>supabase/schema.sql</code> dans l’éditeur SQL.</li><li>Ajouter l’URL et la clé publique dans <code>supabase-config.js</code>.</li></ol><p class="account-note">Ne jamais utiliser une clé <code>service_role</code> dans le navigateur.</p></section><button class="primary" data-action="home">Continuer en invité</button></main></div>`
  if(state.cloud.session){ const email=escapeHtml(state.cloud.session.user.email); return `<div class="shell">${header(true)}<main class="account-shell"><span class="eyebrow">Compte synchronisé</span><h1>${email}</h1><p class="account-lead">Ta progression locale et distante est fusionnée sans perdre les leçons ou réponses maîtrisées.</p><section class="account-panel account-status"><div><span>État</span><strong>${cloudStatusLabel()}</strong></div><button data-action="sync">Synchroniser maintenant</button></section>${state.cloud.error?`<p class="account-error">${escapeHtml(state.cloud.error)}</p>`:''}<button class="danger-button" data-action="signout">Se déconnecter</button></main></div>` }
  return `<div class="shell">${header(true)}<main class="account-shell"><span class="eyebrow">Compte et synchronisation</span><h1>Retrouve ta progression partout</h1><p class="account-lead">Connecte-toi ou crée un compte. Ta progression invitée sera fusionnée avec le cloud.</p><section class="account-panel auth-form"><label>Adresse e-mail<input id="auth-email" type="email" autocomplete="email" placeholder="toi@exemple.fr"></label><label>Mot de passe<input id="auth-password" type="password" autocomplete="current-password" minlength="8" placeholder="8 caractères minimum"></label><div class="auth-actions"><button class="primary" data-auth-mode="signin">Se connecter</button><button data-auth-mode="signup">Créer mon compte</button></div></section>${state.cloud.status==='confirmation'?'<p class="account-success">Compte créé. Vérifie ton e-mail pour confirmer l’inscription.</p>':''}${state.cloud.error?`<p class="account-error">${escapeHtml(state.cloud.error)}</p>`:''}</main></div>`
}

function cloudStatusLabel(){ return state.cloud.status==='syncing'?'Synchronisation…':state.cloud.status==='synced'?'À jour':state.cloud.status==='error'?'Erreur':'Connecté' }

function competenceCard(module){ const questions=module.lessons.flatMap(lesson=>lesson.questions); const mastered=questions.filter(question=>state.progress.questions.includes(question.id)).length; const pct=Math.round(mastered/questions.length*100); return `<article class="competence"><div><strong>${module.title}</strong><span>${mastered}/${questions.length}</span></div><div class="skill-bar" role="progressbar" aria-label="${module.title}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div></article>` }

function answerIsCorrect(question){ return question.type==='builder' ? state.built.map(index=>question.tokens[index]).join(' ')===question.answer : state.selected===question.answer }
function exerciseReady(question){ return question.type==='builder' ? state.built.length===question.tokens.length : state.selected!==null }
function choiceExercise(question){ const wordMode=question.choices.every(choice=>!/\p{L}/u.test(choice[0].replace(/[\u0600-\u06ff]/g,''))); const endingMode=/terminaison|marque|forme convient/i.test(question.prompt); return `<div class="choices ${wordMode?'choices--words':''} ${endingMode?'choices--endings':''}">${question.choices.map(choice=>`<button class="choice ${state.selected===choice[1]?'selected':''}" data-choice="${choice[1]}" ${state.checked?'disabled':''}>${choice[0]}</button>`).join('')}</div>` }
function builderExercise(question){ const remaining=question.order.filter(index=>!state.built.includes(index)); return `<section class="builder"><span class="builder-label">Ton analyse</span><div class="builder-answer ar">${state.built.length?state.built.map((index,position)=>`<button data-remove="${position}" ${state.checked?'disabled':''}>${question.tokens[index]}</button>`).join(' '):'<span>Choisis les blocs ci-dessous…</span>'}</div><span class="builder-label">Blocs disponibles</span><div class="builder-pool ar">${remaining.map(index=>`<button data-token="${index}" ${state.checked?'disabled':''}>${question.tokens[index]}</button>`).join('')}</div></section>` }
function exerciseBody(question){ return question.type==='builder' ? builderExercise(question) : choiceExercise(question) }

function lessonView(){ const l=state.lesson; if(state.stage==='learn') return `<div class="shell">${header(true)}<main class="lesson-shell"><header class="lesson-title"><span class="eyebrow">Règle essentielle</span><h1>${l.title}</h1><p class="ar">${l.ar}</p></header><p class="lead">${l.summary}</p><div class="lesson-grid"><section class="panel"><span class="panel-label">La règle</span><p>${l.rule}</p></section><section class="panel example"><span class="panel-label">Exemple</span><button class="speak" data-speak="${encodeURIComponent(l.example)}" aria-label="Écouter l’exemple">◖))</button><p class="example-ar ar">${l.example}</p><p>${l.translation}</p></section><section class="panel analysis"><span class="panel-label">Analyse</span><p class="ar">${l.analysis}</p></section></div><div class="method"><span>1 · Nature</span><span>2 · Fonction</span><span>3 · État</span><span>4 · Marque</span></div><div class="lesson-actions"><button class="primary" data-action="practice">Passer aux exercices</button></div></main></div>`
  const x=l.questions[state.qi]; const correct=answerIsCorrect(x)
  return `<div class="shell">${header(true)}<main class="lesson-shell"><div class="quiz-head"><span class="counter">Question ${state.qi+1} sur ${l.questions.length}</span><h1>${x.prompt}</h1></div><div class="question-wrap"><div class="question-ar ar">${x.arabic}</div><button class="speak speak--question" data-speak="${encodeURIComponent(x.arabic)}" aria-label="Écouter la phrase">◖))</button></div>${exerciseBody(x)}${state.checked?`<div class="feedback ${correct?'ok':'bad'}"><strong>${correct?'✓ Bien analysé':'Pas encore'}</strong><p>${x.explanation}</p>${x.analysis?`<p class="ar">${x.analysis}</p>`:''}<button class="primary" data-action="next">${state.qi===l.questions.length-1?(state.review?'Terminer la révision':'Terminer la leçon'):'Question suivante'}</button></div>`:`<div class="quiz-actions"><button class="primary" data-action="check" ${exerciseReady(x)?'':'disabled'}>Vérifier</button></div>`}</main></div>`
}

function bind(){
  document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>openLesson(b.dataset.lesson))
  document.querySelector('[data-action="continue"]')?.addEventListener('click',()=>openLesson(allLessons.find(l=>!completed(l.id))?.id||allLessons[0].id))
  document.querySelectorAll('[data-action="home"]').forEach(b=>b.onclick=()=>{state.view='home';state.review=false;render()})
  document.querySelector('[data-action="review"]')?.addEventListener('click',openReview)
  document.querySelectorAll('[data-action="account"]').forEach(button=>button.onclick=()=>{state.view='account';render();scrollTo(0,0)})
  document.querySelectorAll('[data-auth-mode]').forEach(button=>button.onclick=()=>handleAuth(button.dataset.authMode))
  document.querySelector('[data-action="sync"]')?.addEventListener('click',()=>syncCloud())
  document.querySelector('[data-action="signout"]')?.addEventListener('click',handleSignOut)
  document.querySelector('[data-action="install"]')?.addEventListener('click',installApp)
  document.querySelector('[data-action="export"]')?.addEventListener('click',exportProgress)
  document.querySelector('[data-action="choose-import"]')?.addEventListener('click',()=>document.querySelector('#progress-import')?.click())
  document.querySelector('#progress-import')?.addEventListener('change',importProgress)
  document.querySelector('[data-action="practice"]')?.addEventListener('click',()=>{state.stage='practice';state.qi=0;render();scrollTo(0,0)})
  document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{state.selected=b.dataset.choice;render()})
  document.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>{state.built=[...state.built,Number(b.dataset.token)];render()})
  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.built=state.built.filter((_,index)=>index!==Number(b.dataset.remove));render()})
  document.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speakArabic(decodeURIComponent(b.dataset.speak)))
  document.querySelector('[data-action="check"]')?.addEventListener('click',()=>{const x=state.lesson.questions[state.qi];if(exerciseReady(x)){schedule(x.id,answerIsCorrect(x));state.checked=true;save();render()}})
  document.querySelector('[data-action="next"]')?.addEventListener('click',next)
}

function openLesson(id){ state={...state,view:'lesson',lesson:allLessons.find(l=>l.id===id),stage:'learn',qi:0,selected:null,built:[],checked:false,review:false}; render(); scrollTo(0,0) }
function openReview(){ const questions=reviewQuestions(); if(!questions.length)return; state={...state,view:'lesson',lesson:{id:'review',title:'Révision ciblée',ar:'مُرَاجَعَةُ الْأَخْطَاءِ',questions},stage:'practice',qi:0,selected:null,built:[],checked:false,review:true};render();scrollTo(0,0) }
function next(){ const x=state.lesson.questions[state.qi]; if(answerIsCorrect(x)&&!state.progress.questions.includes(x.id)) state.progress.questions.push(x.id); if(state.qi<state.lesson.questions.length-1){state.qi++;state.selected=null;state.built=[];state.checked=false;save();render();scrollTo(0,0);return} if(!state.review&&!completed(state.lesson.id))state.progress.lessons.push(state.lesson.id);save();state.view='home';state.review=false;state.built=[];render();scrollTo(0,0) }

async function installApp(){ if(!installPrompt)return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt=null; render() }
function exportProgress(){ const payload=createBackup(state.progress); const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download=`irab-progression-${dateKey()}.json`; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000) }
async function importProgress(event){ const file=event.target.files?.[0]; if(!file)return; try{ const progress=parseBackup(await file.text()); localStorage.setItem('irab-fr:progress',JSON.stringify(progress)); location.reload() }catch{ alert('Cette sauvegarde Iʿrāb est invalide ou endommagée.') } }

function queueCloudSave(){ if(!state.cloud.session)return; clearTimeout(cloudSaveTimer); cloudSaveTimer=setTimeout(()=>saveCloudProgress(state.cloud.session.user.id,state.progress).then(()=>{state.cloud.status='synced';if(state.view==='account')render()}).catch(error=>{state.cloud.status='error';state.cloud.error=error.message;if(state.view==='account')render()}),800) }
async function syncCloud(session=state.cloud.session){ if(!session)return; state.cloud.status='syncing';state.cloud.error='';if(state.view==='account')render();try{const remote=await loadCloudProgress(session.user.id);state.progress=mergeProgress(state.progress,remote);localStorage.setItem('irab-fr:progress',JSON.stringify(state.progress));await saveCloudProgress(session.user.id,state.progress);state.cloud.status='synced'}catch(error){state.cloud.status='error';state.cloud.error=error.message}render() }
async function handleAuth(mode){ const email=document.querySelector('#auth-email')?.value.trim();const password=document.querySelector('#auth-password')?.value;if(!email||!password){state.cloud.error='Saisis une adresse e-mail et un mot de passe.';render();return}state.cloud.status='syncing';state.cloud.error='';try{const session=mode==='signup'?await signUp(email,password):await signIn(email,password);if(session){state.cloud.session=session;await syncCloud(session)}else{state.cloud.status='confirmation';render()}}catch(error){state.cloud.status='error';state.cloud.error=error.message;render()} }
async function handleSignOut(){ try{await signOut();state.cloud.session=null;state.cloud.status='idle';state.cloud.error='';render()}catch(error){state.cloud.error=error.message;render()} }
async function initializeAccount(){ if(!state.cloud.configured)return;try{await initializeCloud();state.cloud.session=await currentSession();onAuthChange(session=>{state.cloud.session=session;if(session)syncCloud(session);else if(state.view==='account')render()});if(state.cloud.session)await syncCloud(state.cloud.session);else render()}catch(error){state.cloud.status='error';state.cloud.error=error.message;render()} }

window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;if(state.view==='home')render()})
window.addEventListener('appinstalled',()=>{installPrompt=null;if(state.view==='home')render()})
window.addEventListener('online',()=>{online=true;render()})
window.addEventListener('offline',()=>{online=false;render()})

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.error('Service worker:',error))) }

render()
initializeAccount()
