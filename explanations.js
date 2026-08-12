// Deuxième explication, montrée quand le même exercice est raté plusieurs fois.
// Relire la même phrase ne débloque personne : chaque entrée donne un autre
// angle — un test à appliquer, un contraste, ou une phrase de plus à analyser.
//
// Ce fichier concentre tout le contenu rédigé après la relecture assistée du
// corpus : c'est ici qu'un enseignant doit regarder en priorité.

const SECOND_PASS = {
  'types-1': {
    again: 'Test à appliquer : un mot qui ne veut rien dire tout seul et qui ne peut être ni sujet ni action est une particule. « فِي » isolé ne signifie rien ; « فِي الْبَيْتِ » signifie « dans la maison ».',
    example: { ar: 'عَلَى الْمَكْتَبِ', fr: 'Sur le bureau.', analysis: 'عَلَى حرف جر — الْمَكْتَبِ اسم مجرور' },
  },
  'types-2': {
    again: 'Test du temps : demande « quand ? ». Un verbe répond toujours, un nom jamais. كَتَبَ répond « avant maintenant ».',
    example: { ar: 'يَذْهَبُ الْوَلَدُ', fr: 'Le garçon part.', analysis: 'يَذْهَبُ فعل مضارع — الْوَلَدُ فاعل' },
  },
  'types-3': {
    again: 'Test de l’article : si le mot accepte ال ou le tanwīn, c’est un nom. Ni un verbe ni une particule ne les acceptent.',
    example: { ar: 'كِتَابٌ — الْكِتَابُ', fr: 'Un livre — le livre.', analysis: 'كلاهما اسم' },
  },
  'built-1': {
    again: 'Compare : mets مِنْ au début, au milieu, à la fin d’une phrase. Sa forme ne bouge jamais. Fais la même chose avec un nom : sa terminaison change à chaque fois.',
  },
  'built-2': {
    again: 'La méthode : place le mot en sujet, puis en complément, puis après une préposition. Si la fin du mot change, il est muʿrab. Un nom passe le test, une particule non.',
    example: { ar: 'جَاءَ الطَّالِبُ — رَأَيْتُ الطَّالِبَ — مَعَ الطَّالِبِ', fr: 'L’étudiant est venu — j’ai vu l’étudiant — avec l’étudiant.', analysis: 'مرفوع ثم منصوب ثم مجرور' },
  },
  'states-1': {
    again: 'Cherche d’abord qui accomplit l’action, avant de penser à la terminaison. Cette fonction, le fāʿil, est toujours marfūʿ : la question de l’état est déjà réglée par la fonction.',
    example: { ar: 'نَامَ الطِّفْلُ', fr: 'L’enfant a dormi.', analysis: 'الطِّفْلُ فاعل مرفوع وعلامة رفعه الضمة' },
  },
  'states-2': {
    again: 'Pose la question « il a écrit quoi ? ». Ce qui répond subit l’action, donc c’est un mafʿūl bihi, donc manṣūb. La fonction commande l’état, jamais l’inverse.',
    example: { ar: 'فَتَحَ الْوَلَدُ الْبَابَ', fr: 'Le garçon a ouvert la porte.', analysis: 'الْبَابَ مفعول به منصوب' },
  },
  'states-3': {
    again: 'Réflexe : dès qu’une préposition apparaît, le nom qui suit tombe au génitif. Aucune préposition ne laisse jamais un nom au nominatif.',
    example: { ar: 'خَرَجَ مِنَ الْمَسْجِدِ', fr: 'Il est sorti de la mosquée.', analysis: 'الْمَسْجِدِ اسم مجرور وعلامة جره الكسرة' },
  },
  'marks-1': {
    again: 'Retiens le couple par le son : la ḍamma est le « ou » de رَفْع, et رَفْع veut dire « élévation ». C’est la marque par défaut du sujet.',
  },
  'marks-2': {
    again: 'لَمْ est trompeuse : elle nie au passé mais s’écrit avec un verbe au présent, et elle coupe la voyelle finale. Le verbe reste مُضَارِع, seule sa terminaison change.',
    example: { ar: 'لَمْ يَذْهَبْ', fr: 'Il n’est pas parti.', analysis: 'يَذْهَبْ فعل مضارع مجزوم بلم وعلامة جزمه السكون' },
  },
  'mub-1': {
    again: 'Demande-toi : de quoi parle cette phrase ? Ce dont on parle est le mubtadaʾ, ce qu’on en dit est le khabar. Ici, on parle de la maison.',
    example: { ar: 'الطَّالِبُ مُجْتَهِدٌ', fr: 'L’étudiant est appliqué.', analysis: 'الطَّالِبُ مبتدأ — مُجْتَهِدٌ خبر' },
  },
  'mub-2': {
    again: 'Retire le mot de la phrase. S’il ne reste plus d’information, c’était le khabar : « الْبَيْتُ » seul ne dit rien.',
  },
  'khab-1': {
    again: 'Le khabar n’est pas forcément un seul mot. Regarde ce qui remplit la case : ici c’est un verbe avec son sujet caché, donc une phrase verbale entière qui occupe la place du khabar.',
    example: { ar: 'الْوَلَدُ يَلْعَبُ', fr: 'Le garçon joue.', analysis: 'جملة «يَلْعَبُ» الفعلية في محل رفع خبر' },
  },
  'khab-2': {
    again: 'Compte les mots après le mubtadaʾ. Une préposition suivie de son nom forme un bloc indissociable, le جار ومجرور, et c’est ce bloc entier qui joue le rôle de khabar.',
  },
  'pill-1': {
    again: 'Ne te fie pas à la place du mot, mais au sens : qui a fait l’action ? Le fāʿil peut apparaître après le verbe et rester le sujet.',
    example: { ar: 'شَرِبَ الطِّفْلُ الْمَاءَ', fr: 'L’enfant a bu l’eau.', analysis: 'الطِّفْلُ فاعل مرفوع' },
  },
  'pill-2': {
    again: 'Le mafʿūl bihi subit l’action sans la faire. Vérifie par la terminaison : ici الْبَابَ porte une fatḥa, marque du naṣb, celle du complément.',
  },
  'sub-1': {
    again: 'Sépare le mot en deux : كَتَبْ est le verbe, تُ est le sujet collé à lui. Un sujet peut être une seule lettre soudée au verbe.',
    example: { ar: 'كَتَبْنَا', fr: 'Nous avons écrit.', analysis: 'نَا ضمير متصل في محل رفع فاعل' },
  },
  'sub-2': {
    again: 'Une action sans auteur est impossible. Quand aucun nom n’est visible et qu’aucun pronom n’est collé, le sujet est caché : on l’écrit dans l’analyse sous la forme تقديره هو.',
  },
  'method-1': {
    again: 'Procède dans l’ordre plutôt que de deviner : الْكِتَابَ est un nom, il subit la lecture donc c’est un mafʿūl bihi, cette fonction impose le naṣb, et le naṣb se voit ici à la fatḥa. Les trois réponses proposées ne diffèrent que par ces trois étapes.',
  },
  'method-2': {
    again: 'L’ordre n’est pas arbitraire : tu ne peux pas nommer la marque avant de connaître l’état, et tu ne peux pas connaître l’état avant de savoir à quoi sert le mot. Chaque étape rend la suivante possible.',
  },
  'prep-1': {
    again: 'Écarte d’abord ce qui ne peut pas être majrūr : جَلَسْتُ est un verbe, فِي est la préposition elle-même. Il ne reste qu’un candidat.',
  },
  'prep-2': {
    again: 'Retiens le couple par le son : la kasra est le « i » de جَرّ. Les trois principales marques suivent la même logique sonore que le nom de leur état.',
  },
  'part-1': {
    again: 'Regarde ce qui précède le verbe avant de regarder sa fin. لَنْ annonce un futur nié et impose le naṣb : la fatḥa finale n’est que la conséquence.',
    example: { ar: 'لَنْ أَنْسَى', fr: 'Je n’oublierai pas.', analysis: 'أَنْسَى فعل مضارع منصوب بلن' },
  },
  'part-2': {
    again: 'Attention à لَا : elle a deux emplois. Suivie d’un présent apocopé, c’est une défense, « ne fais pas ». Suivie d’un présent au nominatif, c’est une simple négation.',
    example: { ar: 'لَا تَنْسَ — لَا يَنْسَى', fr: 'N’oublie pas — il n’oublie pas.', analysis: 'الأول مجزوم بلا الناهية — الثاني مرفوع' },
  },
  'raised-1': {
    again: 'Le verbe كُسِرَ ne dit pas qui a cassé. Quand l’auteur disparaît, la place du sujet reste vide et le patient vient la remplir : il devient نائب الفاعل et prend le rafʿ.',
    example: { ar: 'فُتِحَ الْبَابُ', fr: 'La porte a été ouverte.', analysis: 'الْبَابُ نائب فاعل مرفوع' },
  },
  'raised-2': {
    again: 'Le mafʿūl bihi change d’état selon la phrase, le fāʿil non. Cherche la fonction qui ne varie jamais.',
  },
  'acc-1': {
    again: 'Demande « comment est-il revenu ? ». Ce qui décrit la manière d’être pendant l’action est un ḥāl, et le ḥāl est manṣūb. Ne le confonds pas avec un adjectif : le ḥāl décrit un moment, l’adjectif décrit le nom en permanence.',
  },
  'acc-2': {
    again: 'Regarde les terminaisons : الْوَلَدُ porte une ḍamma, الْمَاءَ une fatḥa. La fatḥa signale le naṣb, donc le complément.',
  },
  'acc-3': {
    again: 'Le nombre laisse une question en suspens : vingt quoi ? Le mot qui répond s’appelle تَمْيِيز, littéralement « ce qui distingue », et il est manṣūb. Après 20 à 99, il reste toujours au singulier.',
    example: { ar: 'اِشْتَرَيْتُ ثَلَاثِينَ دَفْتَرًا', fr: 'J’ai acheté trente cahiers.', analysis: 'دَفْتَرًا تمييز منصوب' },
  },
  'past-1': {
    again: 'Conjugue-le : كَتَبَ, كَتَبْتُ, كَتَبُوا. La fin bouge à cause de la personne, pas à cause de la fonction dans la phrase. C’est ce qui distingue mabnī de muʿrab.',
  },
  'past-2': {
    again: 'Prononce le mot à voix haute : il s’arrête net, sans voyelle finale. Cet arrêt est le sukūn, et pour l’impératif régulier c’est une construction, pas un état grammatical.',
  },
  'present-1': {
    again: 'Cherche ce qui précède le verbe. Rien devant lui : aucune particule ne le gouverne, il reste donc dans son état par défaut, le rafʿ.',
  },
  'present-2': {
    again: 'Trois terminaisons, trois situations : ḍamma quand rien ne le gouverne, fatḥa après une particule de naṣb comme لَنْ, sukūn après une particule de jazm comme لَمْ. Identifie la particule et la terminaison suit.',
  },
  'idafa-1': {
    again: 'Traduis avec « de » : « la porte de la mosquée ». Ce qui vient après le « de » français est le second terme, et il est toujours majrūr, quelle que soit la fonction du groupe entier.',
    example: { ar: 'رَأَيْتُ بَابَ الْمَسْجِدِ', fr: 'J’ai vu la porte de la mosquée.', analysis: 'بَابَ مفعول به منصوب وهو مضاف — الْمَسْجِدِ مضاف إليه مجرور' },
  },
  'idafa-2': {
    again: 'Signe distinctif : le premier nom d’une iḍāfa n’a ni article ni tanwīn, alors qu’il est défini par le second. كِتَابُ sans ال veut déjà dire « le livre de ».',
  },
  'adj-1': {
    again: 'L’adjectif ne choisit pas son état : il copie celui du nom qu’il décrit. Analyse d’abord الْبَيْتَ, et l’adjectif suivra.',
    example: { ar: 'مَرَرْتُ بِالْبَيْتِ الْكَبِيرِ', fr: 'Je suis passé près de la grande maison.', analysis: 'الْبَيْتِ مجرور — الْكَبِيرِ نعت مجرور' },
  },
  'adj-2': {
    again: 'Demande-toi lequel des deux décrit l’autre. الْمُجْتَهِدُ ne désigne personne à lui seul : il qualifie l’étudiant, donc c’est le naʿt.',
  },
  'inna-1': {
    again: 'Sans إِنَّ, la phrase serait الْعِلْمُ نُورٌ, deux mots au nominatif. إِنَّ arrive et fait basculer le premier au naṣb : compare les deux phrases pour voir son effet.',
  },
  'inna-2': {
    again: 'إِنَّ n’agit que sur le premier pilier. Le second garde le nominatif qu’il avait déjà avant qu’elle n’arrive.',
  },
  'inna-s-1': {
    again: 'Traduis chacune : لَكِنَّ signifie « mais » et corrige ce qui précède, لَيْتَ exprime un regret ou un désir, « si seulement ». Seule la seconde porte un souhait.',
  },
  'inna-s-2': {
    again: 'La règle vaut pour toute la famille : le premier nom qui suit إِنَّ ou l’une de ses sœurs est son ism, et il est manṣūb. La fatḥa sur الْجَوَّ le confirme.',
  },
  'kana-1': {
    again: 'كَانَ et إِنَّ agissent en sens inverse. إِنَّ met le premier au naṣb ; كَانَ le laisse au rafʿ et déplace le naṣb sur le second. Retiens la paire ensemble.',
  },
  'kana-2': {
    again: 'Repère la fatḥa de جَمِيلًا : elle est la trace du travail de كَانَ. Sans le verbe, la phrase serait الْجَوُّ جَمِيلٌ, avec deux nominatifs.',
  },
  'kana-s-1': {
    again: 'أَصْبَحَ se comporte exactement comme كَانَ. Repère les deux piliers : le premier reste marfūʿ, le second passe au naṣb, et c’est celui-là qu’on appelle khabar.',
  },
  'kana-s-2': {
    again: 'صَارَ marque un changement, « devenir ». لَيْسَ nie une qualité, « ne pas être ». Les deux appartiennent à la famille de كَانَ mais ne disent pas la même chose.',
  },
  'dual-1': {
    again: 'Pour le duel, la marque n’est plus une voyelle mais une lettre. Retiens la paire de formes : ـانِ au nominatif, ـيْنِ dans les deux autres états.',
    example: { ar: 'جَاءَ الْوَلَدَانِ', fr: 'Les deux garçons sont venus.', analysis: 'الْوَلَدَانِ فاعل مرفوع وعلامة رفعه الألف' },
  },
  'dual-2': {
    again: 'رَأَيْتُ demande un complément, donc un mot manṣūb. Pour un duel, le naṣb ne s’écrit pas avec une fatḥa mais avec la yāʾ.',
  },
  'plural-1': {
    again: 'Le pluriel masculin régulier fonctionne comme le duel, avec un autre couple de lettres : la wāw au nominatif, la yāʾ ailleurs. Le ن final ne change pas et n’indique rien.',
  },
  'plural-2': {
    again: 'عَلَى est une préposition, donc le nom qui suit est majrūr. Pour ce pluriel, le jarr s’écrit avec la yāʾ et non avec une kasra.',
  },
  'plural-3': {
    again: 'C’est l’exception à connaître. Là où tous les autres noms prennent la fatḥa au naṣb, le pluriel féminin régulier prend la kasra. Sa forme est donc identique au génitif : الْمُعَلِّمَاتِ dans les deux cas.',
    example: { ar: 'سَلَّمْتُ عَلَى الْمُعَلِّمَاتِ', fr: 'J’ai salué les professeures.', analysis: 'الْمُعَلِّمَاتِ اسم مجرور وعلامة جره الكسرة' },
  },
  'syn-n-1': {
    again: 'Deux régissants pourraient expliquer un naṣb : un verbe qui prendrait un complément, ou إِنَّ. Ici il n’y a aucun verbe dans la phrase, donc c’est إِنَّ qui agit.',
  },
  'syn-n-2': {
    again: 'Deux causes possibles pour un jarr : une préposition, ou une annexion. Cherche la préposition : il n’y en a pas. Reste l’annexion.',
  },
  'syn-v-1': {
    again: 'Décompose : le mot est un duel, donc sa marque est une lettre. Sa fonction est sujet du verbe, donc son état est le rafʿ. Le rafʿ du duel s’écrit avec l’alif, et c’est bien ce que tu vois.',
  },
  'syn-v-2': {
    again: 'Ne regarde pas la fin du verbe en premier : regarde ce qui le précède. لَنْ impose le naṣb, لَمْ imposerait le jazm. La particule décide, la terminaison confirme.',
  },
}

export function secondExplanation(questionId = '') {
  const id = String(questionId)
  if (id.endsWith('-builder')) return null
  const base = id.endsWith('-c') ? id.slice(0, -2) : id
  return SECOND_PASS[base] ?? null
}

export function explainedIds() {
  return Object.keys(SECOND_PASS)
}
