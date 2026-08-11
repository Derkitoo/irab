import { caseChoices as cases, lesson as L, question as Q } from './content-helpers.js'

// Modules 5 à 12 : particules, fonctions, verbes et synthèse.
export const advancedModules = [
  {
    id: 'particles', title: 'Les particules régissantes', ar: 'الْحُرُوفُ الْعَامِلَةُ',
    description: 'Comprendre comment les prépositions et les particules modifient le mot suivant.',
    lessons: [
      L('prepositions', 'Les prépositions', 'حُرُوفُ الْجَرِّ', 'Une préposition place le nom qui la suit au génitif.', 'Parmi les prépositions fréquentes : مِنْ, إِلَى, عَنْ, عَلَى, فِي, بِـ, لِـ. Le groupe formé est appelé جار ومجرور.', 'ذَهَبْتُ إِلَى الْمَدْرَسَةِ', 'Je suis allé à l’école.', 'إِلَى حرف جر — الْمَدْرَسَةِ اسم مجرور وعلامة جره الكسرة', [
        Q('prep-1', 'Quel mot est au génitif ?', 'جَلَسْتُ فِي الْبَيْتِ', [['جَلَسْتُ', 'v'], ['فِي', 'p'], ['الْبَيْتِ', 'n']], 'n', 'الْبَيْتِ suit la préposition فِي.', 'الْبَيْتِ اسم مجرور بفي وعلامة جره الكسرة'),
        Q('prep-2', 'Quelle marque principale indique le jarr ?', 'مِنَ الْمَسْجِدِ', [['Kasra — الكسرة', 'k'], ['Fatḥa — الفتحة', 'f'], ['Ḍamma — الضمة', 'd']], 'k', 'La kasra est la marque principale du génitif.', 'الْمَسْجِدِ اسم مجرور وعلامة جره الكسرة')
      ]),
      L('nasb-jazm-particles', 'Particules du présent', 'نَوَاصِبُ وَجَوَازِمُ الْمُضَارِعِ', 'Certaines particules rendent le présent manṣūb ou majzūm.', 'أَنْ, لَنْ et كَيْ font partie des particules de naṣb. لَمْ, لَمَّا et لَا الناهية font partie des particules de jazm.', 'لَنْ يَذْهَبَ — لَمْ يَذْهَبْ', 'Il ne partira pas — il n’est pas parti.', 'يَذْهَبَ مضارع منصوب بلن — يَذْهَبْ مضارع مجزوم بلم', [
        Q('part-1', 'Quel est l’état de يَذْهَبَ ?', 'لَنْ يَذْهَبَ', cases(), 'nasb', 'لَنْ place le présent à l’accusatif.', 'فعل مضارع منصوب بلن وعلامة نصبه الفتحة'),
        Q('part-2', 'Quel est l’état de تَكْتُبْ ?', 'لَا تَكْتُبْ', cases(), 'jazm', 'لَا الناهية rend le présent apocopé.', 'فعل مضارع مجزوم بلا الناهية وعلامة جزمه السكون')
      ])
    ]
  },
  {
    id: 'nouns', title: 'Les fonctions du nom', ar: 'مَوَاقِعُ الْأَسْمَاءِ',
    description: 'Distinguer les principaux noms marfūʿ, manṣūb et majrūr.',
    lessons: [
      L('raised-nouns', 'Les noms au nominatif', 'الْمَرْفُوعَاتُ مِنَ الْأَسْمَاءِ', 'Plusieurs fonctions imposent le nominatif.', 'Le mubtadaʾ, le khabar, le fāʿil et le نائب الفاعل sont normalement marfūʿ.', 'كُسِرَ الْبَابُ', 'La porte a été cassée.', 'الْبَابُ نائب فاعل مرفوع وعلامة رفعه الضمة', [
        Q('raised-1', 'Pourquoi الْبَابُ est-il marfūʿ ?', 'كُسِرَ الْبَابُ', [['Sujet du passif — نائب فاعل', 'passive'], ['Objet — مفعول به', 'object']], 'passive', 'Avec un verbe au passif, le patient devient نائب الفاعل.', 'نائب فاعل مرفوع وعلامة رفعه الضمة'),
        Q('raised-2', 'Quelle fonction est toujours marfūʿ ?', 'جَاءَ الطَّالِبُ', [['Fāʿil — فاعل', 'f'], ['Mafʿūl bihi — مفعول به', 'o']], 'f', 'Le sujet du verbe est au nominatif.')
      ]),
      L('accusative-nouns', 'Les noms à l’accusatif', 'الْمَنْصُوبَاتُ مِنَ الْأَسْمَاءِ', 'Le naṣb apparaît dans plusieurs compléments.', 'Le complément d’objet, le complément circonstanciel, le ḥāl et le tamyīz font partie des noms souvent manṣūb.', 'رَجَعَ الطَّالِبُ مُبْتَسِمًا', 'L’étudiant est revenu en souriant.', 'مُبْتَسِمًا حال منصوب وعلامة نصبه الفتحة', [
        Q('acc-1', 'Quelle est la fonction de مُبْتَسِمًا ?', 'رَجَعَ الطَّالِبُ مُبْتَسِمًا', [['État/circonstance — حال', 'hal'], ['Sujet — فاعل', 'f']], 'hal', 'Le mot décrit l’état du sujet pendant l’action.', 'حال منصوب وعلامة نصبه الفتحة'),
        Q('acc-2', 'Quel mot est le complément d’objet ?', 'شَرِبَ الْوَلَدُ الْمَاءَ', [['الْوَلَدُ', 'boy'], ['الْمَاءَ', 'water']], 'water', 'L’eau reçoit l’action de boire.', 'الْمَاءَ مفعول به منصوب وعلامة نصبه الفتحة')
      ])
    ]
  },
  {
    id: 'verbs', title: 'Le iʿrāb des verbes', ar: 'إِعْرَابُ الْأَفْعَالِ',
    description: 'Séparer les verbes invariables du présent normalement variable.',
    lessons: [
      L('past-imperative', 'Passé et impératif', 'الْمَاضِي وَالْأَمْرُ', 'Le passé et l’impératif sont normalement mabnī.', 'Le passé est souvent construit sur la fatḥa. L’impératif peut être construit sur le sukūn, la suppression d’une lettre faible ou la suppression du nūn.', 'كَتَبَ — اُكْتُبْ', 'Il a écrit — écris !', 'كَتَبَ فعل ماض مبني على الفتح — اُكْتُبْ فعل أمر مبني على السكون', [
        Q('past-1', 'Le verbe كَتَبَ est…', 'كَتَبَ', [['Invariable — مبني', 'built'], ['Variable — معرب', 'var']], 'built', 'Le passé est normalement invariable.', 'فعل ماض مبني على الفتح'),
        Q('past-2', 'Sur quoi اُكْتُبْ est-il construit ?', 'اُكْتُبْ', [['Le sukūn — السكون', 's'], ['La fatḥa — الفتحة', 'f']], 's', 'L’impératif régulier est ici construit sur le sukūn.', 'فعل أمر مبني على السكون')
      ]),
      L('present-verb', 'Le présent variable', 'الْفِعْلُ الْمُضَارِعُ الْمُعْرَبُ', 'Le présent est marfūʿ tant qu’aucun régissant ne le modifie.', 'Le présent est normalement marfūʿ. Il devient manṣūb après une particule de naṣb et majzūm après une particule de jazm.', 'يَجْلِسُ — لَنْ يَجْلِسَ — لَمْ يَجْلِسْ', 'Il s’assoit — il ne s’assoira pas — il ne s’est pas assis.', 'مرفوع بالضمة — منصوب بالفتحة — مجزوم بالسكون', [
        Q('present-1', 'Quel est l’état de يَجْلِسُ sans particule ?', 'يَجْلِسُ الطِّفْلُ', cases(), 'raf', 'En l’absence de régissant, le présent est marfūʿ.', 'فعل مضارع مرفوع وعلامة رفعه الضمة'),
        Q('present-2', 'Quelle terminaison convient après لَنْ ?', 'لَنْ يَجْلِس…', [['ـَ : يَجْلِسَ', 'a'], ['ـُ : يَجْلِسُ', 'u'], ['ـْ : يَجْلِسْ', 's']], 'a', 'لَنْ impose le naṣb, marqué ici par la fatḥa.')
      ])
    ]
  },
  {
    id: 'noun-groups', title: 'Les groupes nominaux', ar: 'التَّرْكِيبُ الِاسْمِيُّ',
    description: 'Analyser l’annexion et l’accord entre le nom et son adjectif.',
    lessons: [
      L('idafa', 'L’annexion', 'الْمُضَافُ وَالْمُضَافُ إِلَيْهِ', 'L’iḍāfa relie deux noms pour exprimer l’appartenance ou la précision.', 'Le premier nom est مُضَاف et ne prend ni article ni tanwīn. Le second est مُضَاف إِلَيْهِ et devient toujours majrūr.', 'كِتَابُ الطَّالِبِ', 'Le livre de l’étudiant.', 'كِتَابُ مضاف — الطَّالِبِ مضاف إليه مجرور', [
        Q('idafa-1', 'Quel mot est toujours majrūr ?', 'بَابُ الْمَسْجِدِ', [['Le premier terme — المضاف', 'first'], ['Le second terme — المضاف إليه', 'second']], 'second', 'Le second terme de l’annexion est toujours au génitif.', 'الْمَسْجِدِ مضاف إليه مجرور وعلامة جره الكسرة'),
        Q('idafa-2', 'Quelle construction vois-tu ?', 'كِتَابُ الْمُعَلِّمِ', [['Annexion — إضافة', 'idafa'], ['Phrase verbale — جملة فعلية', 'verb']], 'idafa', 'Deux noms liés sans préposition forment ici une iḍāfa.')
      ]),
      L('adjective', 'Le nom et son adjectif', 'النَّعْتُ وَالْمَنْعُوتُ', 'L’adjectif suit le nom qu’il qualifie.', 'Le naʿt s’accorde avec son manʿūt en état grammatical, définition, genre et nombre.', 'رَأَيْتُ الْبَيْتَ الْكَبِيرَ', 'J’ai vu la grande maison.', 'الْبَيْتَ مفعول به منصوب — الْكَبِيرَ نعت منصوب', [
        Q('adj-1', 'Quel est l’état de الْكَبِيرَ ?', 'رَأَيْتُ الْبَيْتَ الْكَبِيرَ', cases(), 'nasb', 'L’adjectif suit le nom الْبَيْتَ à l’accusatif.', 'نعت منصوب وعلامة نصبه الفتحة'),
        Q('adj-2', 'Quel mot est l’adjectif ?', 'جَاءَ الطَّالِبُ الْمُجْتَهِدُ', [['الطَّالِبُ', 'noun'], ['الْمُجْتَهِدُ', 'adj']], 'adj', 'الْمُجْتَهِدُ décrit l’étudiant et suit son nominatif.', 'نعت مرفوع وعلامة رفعه الضمة')
      ])
    ]
  },
  {
    id: 'inna', title: 'Inna et ses sœurs', ar: 'إِنَّ وَأَخَوَاتُهَا',
    description: 'Observer comment ces particules transforment la phrase nominale.',
    lessons: [
      L('inna-rule', 'L’action de إِنَّ', 'عَمَلُ إِنَّ', 'إِنَّ place son ism au naṣb et maintient son khabar au rafʿ.', 'Après إِنَّ, le mubtadaʾ devient اسم إن منصوب et le khabar devient خبر إن مرفوع.', 'إِنَّ الْعِلْمَ نُورٌ', 'Certes, la science est une lumière.', 'الْعِلْمَ اسم إن منصوب — نُورٌ خبر إن مرفوع', [
        Q('inna-1', 'Quel est l’état de الْعِلْمَ ?', 'إِنَّ الْعِلْمَ نُورٌ', cases(), 'nasb', 'Le ism de إِنَّ est manṣūb.', 'اسم إن منصوب وعلامة نصبه الفتحة'),
        Q('inna-2', 'Quel est l’état de نُورٌ ?', 'إِنَّ الْعِلْمَ نُورٌ', cases(), 'raf', 'Le khabar de إِنَّ reste marfūʿ.', 'خبر إن مرفوع وعلامة رفعه الضمة')
      ]),
      L('inna-sisters', 'Les sœurs de إِنَّ', 'أَخَوَاتُ إِنَّ', 'Plusieurs particules suivent la même règle.', 'أَنَّ, كَأَنَّ, لَكِنَّ, لَيْتَ et لَعَلَّ placent également leur ism au naṣb et leur khabar au rafʿ.', 'لَيْتَ الْجَوَّ جَمِيلٌ', 'Si seulement le temps était beau.', 'الْجَوَّ اسم ليت منصوب — جَمِيلٌ خبر ليت مرفوع', [
        Q('inna-s-1', 'Quelle particule exprime le souhait ?', 'لَيْتَ', [['لَيْتَ', 'layta'], ['لَكِنَّ', 'lakinna']], 'layta', 'لَيْتَ sert à exprimer un souhait.'),
        Q('inna-s-2', 'Quelle fonction porte الْجَوَّ ?', 'لَيْتَ الْجَوَّ جَمِيلٌ', [['اسم ليت', 'ism'], ['خبر ليت', 'khabar']], 'ism', 'Le premier nom après لَيْتَ est son ism manṣūb.', 'اسم ليت منصوب وعلامة نصبه الفتحة')
      ])
    ]
  },
  {
    id: 'kana', title: 'Kāna et ses sœurs', ar: 'كَانَ وَأَخَوَاتُهَا',
    description: 'Analyser les verbes qui modifient les deux piliers de la phrase nominale.',
    lessons: [
      L('kana-rule', 'L’action de كَانَ', 'عَمَلُ كَانَ', 'كَانَ maintient son ism au rafʿ et place son khabar au naṣb.', 'Le mubtadaʾ devient اسم كان مرفوع. Le khabar devient خبر كان منصوب.', 'كَانَ الْجَوُّ جَمِيلًا', 'Le temps était beau.', 'الْجَوُّ اسم كان مرفوع — جَمِيلًا خبر كان منصوب', [
        Q('kana-1', 'Quel est l’état de الْجَوُّ ?', 'كَانَ الْجَوُّ جَمِيلًا', cases(), 'raf', 'Le ism de كَانَ est marfūʿ.', 'اسم كان مرفوع وعلامة رفعه الضمة'),
        Q('kana-2', 'Quel est l’état de جَمِيلًا ?', 'كَانَ الْجَوُّ جَمِيلًا', cases(), 'nasb', 'Le khabar de كَانَ est manṣūb.', 'خبر كان منصوب وعلامة نصبه الفتحة')
      ]),
      L('kana-sisters', 'Les sœurs de كَانَ', 'أَخَوَاتُ كَانَ', 'D’autres verbes incomplets suivent la même structure.', 'أَصْبَحَ, أَمْسَى, صَارَ, لَيْسَ et ظَلَّ font partie de cette famille.', 'أَصْبَحَ الطَّرِيقُ مُزْدَحِمًا', 'La route est devenue encombrée le matin.', 'الطَّرِيقُ اسم أصبح مرفوع — مُزْدَحِمًا خبر أصبح منصوب', [
        Q('kana-s-1', 'Quelle est la fonction de مُزْدَحِمًا ?', 'أَصْبَحَ الطَّرِيقُ مُزْدَحِمًا', [['خبر أصبح', 'khabar'], ['اسم أصبح', 'ism']], 'khabar', 'Le second pilier est le khabar manṣūb.', 'خبر أصبح منصوب وعلامة نصبه الفتحة'),
        Q('kana-s-2', 'Quel verbe exprime la négation ?', 'لَيْسَ', [['لَيْسَ', 'laysa'], ['صَارَ', 'sara']], 'laysa', 'لَيْسَ signifie « ne pas être ».')
      ])
    ]
  },
  {
    id: 'secondary-signs', title: 'Les marques secondaires', ar: 'الْعَلَامَاتُ الْفَرْعِيَّةُ',
    description: 'Dépasser les terminaisons simples avec le duel et les pluriels réguliers.',
    lessons: [
      L('dual', 'Le duel', 'الْمُثَنَّى', 'Le duel possède des marques secondaires.', 'Le duel est marfūʿ avec alif : ـانِ. Il est manṣūb et majrūr avec yāʾ : ـيْنِ.', 'جَاءَ الطَّالِبَانِ — رَأَيْتُ الطَّالِبَيْنِ', 'Les deux étudiants sont venus — j’ai vu les deux étudiants.', 'الطَّالِبَانِ فاعل مرفوع بالألف — الطَّالِبَيْنِ مفعول به منصوب بالياء', [
        Q('dual-1', 'Quelle marque indique le rafʿ du duel ?', 'الطَّالِبَانِ', [['Alif — الألف', 'alif'], ['Yāʾ — الياء', 'ya']], 'alif', 'Le duel est marfūʿ avec alif.', 'مرفوع وعلامة رفعه الألف لأنه مثنى'),
        Q('dual-2', 'Quelle forme convient après رَأَيْتُ ?', 'رَأَيْتُ …', [['الطَّالِبَيْنِ', 'ayn'], ['الطَّالِبَانِ', 'an']], 'ayn', 'Le complément d’objet duel est manṣūb avec yāʾ.')
      ]),
      L('sound-plurals', 'Les pluriels réguliers', 'جَمْعُ الْمُذَكَّرِ وَالْمُؤَنَّثِ السَّالِمُ', 'Les pluriels réguliers possèdent leurs propres marques.', 'Le pluriel masculin régulier est marfūʿ avec wāw et manṣūb/majrūr avec yāʾ. Le pluriel féminin régulier est marfūʿ avec ḍamma et manṣūb/majrūr avec kasra.', 'جَاءَ الْمُعَلِّمُونَ — رَأَيْتُ الْمُعَلِّمِينَ', 'Les professeurs sont venus — j’ai vu les professeurs.', 'الْمُعَلِّمُونَ مرفوع بالواو — الْمُعَلِّمِينَ منصوب بالياء', [
        Q('plural-1', 'Quelle marque indique le rafʿ du pluriel masculin régulier ?', 'الْمُعَلِّمُونَ', [['Wāw — الواو', 'waw'], ['Yāʾ — الياء', 'ya']], 'waw', 'Ce pluriel est marfūʿ avec wāw.', 'مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم'),
        Q('plural-2', 'Quelle forme est majrūr ?', 'سَلَّمْتُ عَلَى …', [['الْمُعَلِّمِينَ', 'in'], ['الْمُعَلِّمُونَ', 'un']], 'in', 'Après عَلَى, le pluriel masculin régulier prend yāʾ.', 'اسم مجرور وعلامة جره الياء')
      ])
    ]
  },
  {
    id: 'synthesis', title: 'Analyse complète', ar: 'التَّحْلِيلُ الْإِعْرَابِيُّ',
    description: 'Combiner toutes les règles dans des phrases progressivement plus riches.',
    lessons: [
      L('nominal-synthesis', 'Synthèse nominale', 'مُرَاجَعَةُ الْجُمْلَةِ الِاسْمِيَّةِ', 'Repérer le régissant avant d’attribuer les fonctions.', 'Commence par identifier les particules ou verbes incomplets. Ils déterminent si les deux piliers seront marfūʿ ou manṣūb.', 'إِنَّ بَابَ الْمَدْرَسَةِ كَبِيرٌ', 'La porte de l’école est assurément grande.', 'بَابَ اسم إن منصوب وهو مضاف — الْمَدْرَسَةِ مضاف إليه مجرور — كَبِيرٌ خبر إن مرفوع', [
        Q('syn-n-1', 'Pourquoi بَابَ est-il manṣūb ?', 'إِنَّ بَابَ الْمَدْرَسَةِ كَبِيرٌ', [['C’est le ism de إِنَّ', 'inna'], ['C’est un objet', 'object']], 'inna', 'إِنَّ place son ism à l’accusatif.', 'اسم إن منصوب وعلامة نصبه الفتحة'),
        Q('syn-n-2', 'Pourquoi الْمَدْرَسَةِ est-il majrūr ?', 'بَابَ الْمَدْرَسَةِ', [['C’est un مضاف إليه', 'idafa'], ['Il suit une préposition', 'prep']], 'idafa', 'Il est le second terme de l’annexion.', 'مضاف إليه مجرور وعلامة جره الكسرة')
      ]),
      L('verbal-synthesis', 'Synthèse verbale', 'مُرَاجَعَةُ الْجُمْلَةِ الْفِعْلِيَّةِ', 'Analyse chaque mot dans l’ordre sans perdre le régissant.', 'Pour une phrase verbale : analyse le verbe, trouve son sujet, cherche l’objet, puis analyse les groupes complémentaires.', 'لَنْ يَكْتُبَ الطَّالِبَانِ الدَّرْسَ فِي الدَّفْتَرِ', 'Les deux étudiants n’écriront pas la leçon dans le cahier.', 'يَكْتُبَ مضارع منصوب — الطَّالِبَانِ فاعل مرفوع بالألف — الدَّرْسَ مفعول به منصوب — الدَّفْتَرِ اسم مجرور', [
        Q('syn-v-1', 'Quelle analyse convient à الطَّالِبَانِ ?', 'لَنْ يَكْتُبَ الطَّالِبَانِ', [['فاعل مرفوع بالألف', 'correct'], ['مفعول به منصوب بالياء', 'wrong']], 'correct', 'C’est le sujet duel du verbe.', 'فاعل مرفوع وعلامة رفعه الألف لأنه مثنى'),
        Q('syn-v-2', 'Quelle analyse convient à يَكْتُبَ ?', 'لَنْ يَكْتُبَ', [['مضارع منصوب بالفتحة', 'nasb'], ['مضارع مجزوم بالسكون', 'jazm']], 'nasb', 'لَنْ est une particule de naṣb.', 'فعل مضارع منصوب بلن وعلامة نصبه الفتحة')
      ])
    ]
  }
]
