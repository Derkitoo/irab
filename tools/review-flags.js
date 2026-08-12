// Points dont je sais qu'ils sont discutables, ou que j'ai écrits moi-même.
// Les signaler dans le dossier évite à l'enseignant de chercher où regarder,
// et évite de faire passer un choix personnel pour une évidence.

export const FLAGS = {
  // Classement en catégories : plusieurs cas se défendent des deux côtés.
  'khab-1': 'Classé en « nature du mot » parce que la réponse porte sur le type de constituant (mot, phrase, groupe) ; on peut soutenir « fonction », puisque la leçon travaille le khabar. Analyse également reformulée par moi en « جملة «يَدْرُسُ» الفعلية في محل رفع خبر ».',
  'khab-2': 'Même hésitation que l’exercice précédent entre « nature » et « fonction ».',
  'idafa-1': 'Classé en « fonction » car la réponse attendue est المضاف إليه, alors que la question est formulée en termes d’état.',
  'idafa-2': 'Classé en « nature » : reconnaître un type de construction. « Analyse complète » se défendrait aussi.',
  'sub-1': 'Classé en « nature » : la forme du fāʿil, pronom attaché plutôt que nom apparent. Certains y verraient une question de fonction.',

  // Exercices que j'ai écrits, absents du corpus d'origine.
  'acc-3': 'Exercice ajouté par moi pour combler une lacune : le tamyīz était cité dans la règle et jamais pratiqué. Le choix de عِشْرِينَ كِتَابًا et la règle du singulier après 20 à 99 sont à valider.',
  'plural-3': 'Exercice ajouté par moi : le pluriel féminin régulier était énoncé dans la règle mais absent des exercices et de l’exemple. Le point visé est la kasra au naṣb.',

  // Contenu du corpus modifié lors de la relecture assistée.
  'types-1': 'Analyse complétée par moi : « مبني على السكون » ajouté à la formule.',
  'states-3': 'Analyse reformulée par moi : « مجرور بفي » remplacé par « مجرور بحرف الجر «فِي» ».',
  'prep-1': 'Même reformulation que states-3 pour nommer le régissant.',
  'sub-2': 'Analyse inchangée, mais vérifier que « تقديره هو » est la formulation attendue à ce niveau.',
  'past-1': 'Analyse corrigée par moi : « ماض » sans tanwīn remplacé par « ماضٍ ».',
}

export const LESSON_FLAGS = {
  built: 'L’analyse de cette leçon était rédigée en français, ce qui s’affichait à l’envers dans un panneau droite-à-gauche. Je l’ai remplacée par une analyse arabe : à valider entièrement.',
  pillars: 'L’analyse se contente de « كَتَبَ فعل » là où les autres leçons détaillent l’état et la marque. Volontaire ou à compléter ?',
  'past-imperative': 'Analyse corrigée : « ماضٍ » avec tanwīn. Vérifier aussi la vocalisation de اُكْتُبْ.',
  'sound-plurals': 'Titre arabe remplacé par moi : « جَمْعُ الْمُذَكَّرِ وَالْمُؤَنَّثِ السَّالِمُ » laissait السالم ne qualifier que le second terme. Devenu « الْجَمْعُ السَّالِمُ ». L’exemple montre désormais le féminin.',
  'kana-sisters': 'La traduction « La route est devenue encombrée le matin » rend le sens matinal de أَصْبَحَ mais tombe mal en français. À trancher.',
  'accusative-nouns': 'Règle réécrite par moi pour nommer en arabe le ظَرْف, le حَال et le تَمْيِيز.',
  marks: 'Règle complétée par moi d’une phrase sur le تَنْوِين.',
  dual: 'Règle complétée par moi pour nommer la عَلَامَة فَرْعِيَّة.',
  'raised-nouns': 'Règle et analyse complétées par moi pour nommer le مَبْنِيّ لِلْمَجْهُول.',
  'present-verb': 'Règle complétée par moi pour nommer le عَامِل.',
  'nominal-synthesis': 'Règle réécrite par moi autour de la notion de عَامِل.',
}

export const GENERAL_NOTES = [
  'Les 54 secondes explications de la section 3 ont toutes été rédigées par moi, après la relecture assistée du corpus. C’est la plus grande surface de contenu non validée du projet.',
  'Les 59 définitions du glossaire emploient la terminologie classique mais n’ont pas été relues.',
  'Le découpage des exercices en cinq catégories — nature, fonction, état, marque, analyse complète — est un choix pédagogique de ma part. La section 5 le présente en entier.',
  'Sept corrections ont été appliquées au corpus d’origine : elles sont signalées une par une par le repère ⚑.',
  'Les vocalisations complètes n’ont pas été vérifiées caractère par caractère.',
]
