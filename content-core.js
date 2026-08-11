import { caseChoices, lesson, question as q } from './content-helpers.js'

// Modules 1 à 4 : les fondations du parcours.
export const coreModules = [
  {
    id: 'words', title: 'Les trois familles de mots', ar: 'أَقْسَامُ الْكَلِمَةِ',
    description: 'Reconnaître la nature d’un mot avant toute analyse grammaticale.',
    lessons: [
      lesson('types', 'Nom, verbe ou particule ?', 'اِسْمٌ، فِعْلٌ أَمْ حَرْفٌ؟', 'Toute analyse commence par la nature du mot.', 'Le nom désigne une personne, une chose ou une qualité. Le verbe porte une action et un temps. La particule relie les mots ou modifie leur analyse.', 'فِي الْبَيْتِ كِتَابٌ', 'Dans la maison, il y a un livre.', 'فِي : حرف جر — الْبَيْتِ : اسم — كِتَابٌ : اسم', [
        q('types-1', 'Quelle est la nature de فِي ?', 'فِي', [['Nom — اسم','n'],['Verbe — فعل','v'],['Particule — حرف','p']], 'p', 'فِي signifie « dans ». C’est une préposition, donc une particule.', 'فِي : حرف جر مبني على السكون لا محل له من الإعراب'),
        q('types-2', 'Quelle est la nature de كَتَبَ ?', 'كَتَبَ', [['Nom — اسم','n'],['Verbe — فعل','v'],['Particule — حرف','p']], 'v', 'كَتَبَ exprime l’action d’écrire au passé.', 'كَتَبَ : فعل ماضٍ مبني على الفتح'),
        q('types-3', 'Quelle est la nature de الطَّالِبُ ?', 'الطَّالِبُ', [['Nom — اسم','n'],['Verbe — فعل','v'],['Particule — حرف','p']], 'n', 'الطَّالِبُ désigne une personne : l’étudiant.', 'الطَّالِبُ : اسم')
      ]),
      lesson('built', 'Variable ou invariable', 'الْمُعْرَبُ وَالْمَبْنِيُّ', 'Certains mots changent de terminaison, d’autres gardent toujours la même forme.', 'Un mot مُعْرَب change de terminaison selon sa fonction. Un mot مَبْنِيّ est invariable. Les particules, le passé et l’impératif sont normalement invariables.', 'كَتَبَ الطَّالِبُ', 'L’étudiant a écrit.', 'كَتَبَ فعل ماضٍ مبني على الفتح — الطَّالِبُ فاعل مرفوع وعلامة رفعه الضمة', [
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
        q('states-3', 'Quel est l’état du nom après فِي ?', 'فِي الْبَيْتِ', caseChoices(), 'jarr', 'Une préposition place le nom suivant au génitif.', 'الْبَيْتِ اسم مجرور بحرف الجر «فِي» وعلامة جره الكسرة')
      ]),
      lesson('marks', 'Les marques principales', 'الْعَلَامَاتُ الْأَصْلِيَّةُ', 'Ḍamma, fatḥa, kasra et sukūn rendent l’état visible.', 'La ḍamma marque principalement le rafʿ, la fatḥa le naṣb, la kasra le jarr et le sukūn le jazm. Sur un nom indéfini, ces voyelles sont doublées par le تَنْوِين : كِتَابٌ, كِتَابًا, كِتَابٍ.', 'لَمْ يَكْتُبْ', 'Il n’a pas écrit.', 'يَكْتُبْ : فعل مضارع مجزوم بلم وعلامة جزمه السكون', [
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
        q('khab-1', 'Quelle est la forme du khabar ?', 'الطَّالِبُ يَدْرُسُ', [['Phrase verbale — جملة فعلية','v'],['Mot simple — مفرد','s'],['Groupe prépositionnel — جار ومجرور','p']], 'v', 'يَدْرُسُ est un verbe : la phrase verbale sert de khabar.', 'جملة «يَدْرُسُ» الفعلية في محل رفع خبر'),
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
        q('sub-1', 'Quelle est la forme du sujet dans كَتَبْتُ ?', 'كَتَبْتُ', [['Pronom attaché — ضمير متصل','a'],['Nom apparent — اسم ظاهر','v'],['Pronom caché — ضمير مستتر','h']], 'a', 'Le تُ est attaché au verbe et signifie « je ».', 'التاء ضمير متصل مبني على الضم في محل رفع فاعل'),
        q('sub-2', 'Où est le sujet de يَكْتُبُ ?', 'يَكْتُبُ', [['Il est caché : هُوَ','h'],['Il n’y a aucun sujet','n']], 'h', 'Toute phrase verbale possède un sujet. Ici, il est sous-entendu.', 'الفاعل ضمير مستتر تقديره هو')
      ]),
      lesson('method', 'La méthode complète', 'خُطُوَاتُ الْإِعْرَابِ', 'Nature, fonction, état, marque : toujours dans cet ordre.', 'Pour chaque mot, identifie sa nature, sa fonction, l’état imposé par cette fonction, puis la marque visible ou estimée.', 'يَقْرَأُ الطَّالِبُ الْكِتَابَ فِي الْبَيْتِ', 'L’étudiant lit le livre dans la maison.', 'يَقْرَأُ فعل مضارع مرفوع — الطَّالِبُ فاعل مرفوع — الْكِتَابَ مفعول به منصوب — فِي حرف جر — الْبَيْتِ اسم مجرور', [
        q('method-1', 'Choisis l’analyse correcte de الْكِتَابَ.', 'يَقْرَأُ الطَّالِبُ الْكِتَابَ', [['مفعول به منصوب وعلامة نصبه الفتحة','ok'],['فاعل مرفوع وعلامة رفعه الضمة','f'],['اسم مجرور وعلامة جره الكسرة','j']], 'ok', 'Le livre reçoit l’action de lire : c’est le complément d’objet direct.'),
        q('method-2', 'Quelle étape vient après la fonction ?', 'النَّوْعُ ← الْوَظِيفَةُ ← ؟ ← الْعَلَامَةُ', [['L’état — الحالة الإعرابية','state'],['La traduction — الترجمة','tr']], 'state', 'La méthode est : nature, fonction, état, puis marque.')
      ])
    ]
  },
]
