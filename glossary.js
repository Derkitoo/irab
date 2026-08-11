import { lessonsUsing } from './glossary-index.js'

// Glossaire des termes de grammaire employés dans le parcours.
// `lessons` est calculé : chaque entrée pointe vers les leçons où le terme
// arabe apparaît réellement, pour ne jamais renvoyer vers une leçon disparue.
// La terminologie est classique ; elle reste à valider avec un enseignant.

const ENTRIES = [
  { ar: 'إِعْرَاب', tr: 'iʿrāb', fr: 'Analyse grammaticale', def: 'Déterminer pour chaque mot sa nature, sa fonction, son état grammatical et la marque qui le rend visible.', group: 'method' },
  { ar: 'كَلِمَة', tr: 'kalima', fr: 'Mot', def: 'Unité de base de la phrase : elle est nom, verbe ou particule.', group: 'nature' },
  { ar: 'اِسْم', tr: 'ism', fr: 'Nom', def: 'Mot qui désigne une personne, une chose ou une qualité, sans indication de temps.', group: 'nature' },
  { ar: 'فِعْل', tr: 'fiʿl', fr: 'Verbe', def: 'Mot qui exprime une action liée à un temps.', group: 'nature' },
  { ar: 'حَرْف', tr: 'ḥarf', fr: 'Particule', def: 'Mot-outil qui relie ou modifie, et n’a de sens que par ce qu’il accompagne.', group: 'nature' },
  { ar: 'مُعْرَب', tr: 'muʿrab', fr: 'Variable', def: 'Mot dont la terminaison change selon sa fonction dans la phrase.', group: 'nature' },
  { ar: 'مَبْنِيّ', tr: 'mabnī', fr: 'Invariable', def: 'Mot dont la terminaison ne change jamais, quelle que soit sa fonction.', group: 'nature' },
  { ar: 'جُمْلَة اِسْمِيَّة', tr: 'jumla ismiyya', fr: 'Phrase nominale', def: 'Phrase qui commence par un nom et s’articule autour du mubtadaʾ et du khabar.', group: 'nature' },
  { ar: 'جُمْلَة فِعْلِيَّة', tr: 'jumla fiʿliyya', fr: 'Phrase verbale', def: 'Phrase qui commence par un verbe, suivi de son sujet puis de ses compléments.', group: 'nature' },

  { ar: 'رَفْع', tr: 'rafʿ', fr: 'Nominatif', def: 'État du sujet et des deux piliers de la phrase nominale. Marque principale : la ḍamma.', group: 'etat' },
  { ar: 'نَصْب', tr: 'naṣb', fr: 'Accusatif', def: 'État des compléments et du présent après une particule de naṣb. Marque principale : la fatḥa.', group: 'etat' },
  { ar: 'جَرّ', tr: 'jarr', fr: 'Génitif', def: 'État du nom après une préposition ou en second terme d’annexion. Marque principale : la kasra.', group: 'etat' },
  { ar: 'جَزْم', tr: 'jazm', fr: 'Apocopé', def: 'État du présent après une particule de jazm. Marque principale : le sukūn. Un nom n’est jamais majzūm.', group: 'etat' },
  { ar: 'مَرْفُوع', tr: 'marfūʿ', fr: 'Au nominatif', def: 'Se dit d’un mot qui se trouve dans l’état de rafʿ.', group: 'etat' },
  { ar: 'مَنْصُوب', tr: 'manṣūb', fr: 'À l’accusatif', def: 'Se dit d’un mot qui se trouve dans l’état de naṣb.', group: 'etat' },
  { ar: 'مَجْرُور', tr: 'majrūr', fr: 'Au génitif', def: 'Se dit d’un mot qui se trouve dans l’état de jarr.', group: 'etat' },
  { ar: 'مَجْزُوم', tr: 'majzūm', fr: 'Apocopé', def: 'Se dit d’un présent qui se trouve dans l’état de jazm.', group: 'etat' },

  { ar: 'عَلَامَة', tr: 'ʿalāma', fr: 'Marque', def: 'Signe qui rend l’état grammatical visible à la fin du mot.', group: 'marque' },
  { ar: 'ضَمَّة', tr: 'ḍamma', fr: 'Ḍamma', def: 'Voyelle brève « ou », marque principale du nominatif.', group: 'marque' },
  { ar: 'فَتْحَة', tr: 'fatḥa', fr: 'Fatḥa', def: 'Voyelle brève « a », marque principale de l’accusatif.', group: 'marque' },
  { ar: 'كَسْرَة', tr: 'kasra', fr: 'Kasra', def: 'Voyelle brève « i », marque principale du génitif.', group: 'marque' },
  { ar: 'سُكُون', tr: 'sukūn', fr: 'Sukūn', def: 'Absence de voyelle, marque principale de l’apocopé.', group: 'marque' },
  { ar: 'تَنْوِين', tr: 'tanwīn', fr: 'Tanwīn', def: 'Nūn final non écrit qui double la voyelle d’un nom indéfini.', group: 'marque' },
  { ar: 'عَلَامَة فَرْعِيَّة', tr: 'ʿalāma farʿiyya', fr: 'Marque secondaire', def: 'Marque autre qu’une voyelle brève : alif, wāw, yāʾ ou suppression du nūn.', group: 'marque' },
  { ar: 'مُثَنَّى', tr: 'muthannā', fr: 'Duel', def: 'Forme des deux : nominatif en ـانِ, accusatif et génitif en ـيْنِ.', group: 'marque' },
  { ar: 'جَمْع مُذَكَّر سَالِم', tr: 'jamʿ mudhakkar sālim', fr: 'Pluriel masculin régulier', def: 'Nominatif en ـُونَ, accusatif et génitif en ـِينَ.', group: 'marque' },
  { ar: 'جَمْع مُؤَنَّث سَالِم', tr: 'jamʿ muʾannath sālim', fr: 'Pluriel féminin régulier', def: 'Nominatif en ـَاتٌ ; accusatif et génitif en ـَاتٍ, avec kasra et non fatḥa.', group: 'marque' },

  { ar: 'مُبْتَدَأ', tr: 'mubtadaʾ', fr: 'Thème', def: 'Nom qui ouvre la phrase nominale et dont on parle. Normalement marfūʿ.', group: 'fonction' },
  { ar: 'خَبَر', tr: 'khabar', fr: 'Prédicat', def: 'Ce qu’on dit du mubtadaʾ. Normalement marfūʿ. Il peut être un mot, une phrase ou un groupe.', group: 'fonction' },
  { ar: 'فَاعِل', tr: 'fāʿil', fr: 'Sujet', def: 'Celui qui accomplit l’action du verbe. Toujours marfūʿ.', group: 'fonction' },
  { ar: 'نَائِب فَاعِل', tr: 'nāʾib fāʿil', fr: 'Sujet du passif', def: 'Nom qui prend la place du sujet lorsque le verbe est au passif. Marfūʿ.', group: 'fonction' },
  { ar: 'مَفْعُول بِهِ', tr: 'mafʿūl bihi', fr: 'Complément d’objet', def: 'Ce sur quoi porte l’action du verbe. Manṣūb.', group: 'fonction' },
  { ar: 'حَال', tr: 'ḥāl', fr: 'Circonstant d’état', def: 'Décrit l’état du sujet ou de l’objet pendant l’action. Manṣūb.', group: 'fonction' },
  { ar: 'تَمْيِيز', tr: 'tamyīz', fr: 'Spécificatif', def: 'Lève l’ambiguïté d’une quantité ou d’une mesure. Manṣūb.', group: 'fonction' },
  { ar: 'مُضَاف', tr: 'muḍāf', fr: 'Premier terme d’annexion', def: 'Premier nom d’une iḍāfa. Il ne prend ni article ni tanwīn.', group: 'fonction' },
  { ar: 'مُضَاف إِلَيْهِ', tr: 'muḍāf ilayhi', fr: 'Second terme d’annexion', def: 'Second nom d’une iḍāfa. Toujours majrūr.', group: 'fonction' },
  { ar: 'إِضَافَة', tr: 'iḍāfa', fr: 'Annexion', def: 'Groupe de deux noms exprimant l’appartenance ou la précision, sans préposition.', group: 'fonction' },
  { ar: 'نَعْت', tr: 'naʿt', fr: 'Adjectif épithète', def: 'Qualifie un nom et s’accorde avec lui en état, définition, genre et nombre.', group: 'fonction' },
  { ar: 'مَنْعُوت', tr: 'manʿūt', fr: 'Nom qualifié', def: 'Nom auquel se rapporte le naʿt.', group: 'fonction' },
  { ar: 'جَار وَمَجْرُور', tr: 'jārr wa-majrūr', fr: 'Groupe prépositionnel', def: 'Ensemble formé d’une préposition et du nom qu’elle met au génitif.', group: 'fonction' },
  { ar: 'ظَرْف', tr: 'ẓarf', fr: 'Complément de temps ou de lieu', def: 'Situe l’action dans le temps ou l’espace. Manṣūb.', group: 'fonction' },
  { ar: 'اِسْم إِنَّ', tr: 'ism inna', fr: 'Nom de inna', def: 'Premier nom après إِنَّ ou l’une de ses sœurs. Manṣūb.', group: 'fonction' },
  { ar: 'خَبَر إِنَّ', tr: 'khabar inna', fr: 'Prédicat de inna', def: 'Second pilier après إِنَّ. Reste marfūʿ.', group: 'fonction' },
  { ar: 'اِسْم كَانَ', tr: 'ism kāna', fr: 'Nom de kāna', def: 'Premier pilier après كَانَ ou l’une de ses sœurs. Reste marfūʿ.', group: 'fonction' },
  { ar: 'خَبَر كَانَ', tr: 'khabar kāna', fr: 'Prédicat de kāna', def: 'Second pilier après كَانَ. Devient manṣūb.', group: 'fonction' },

  { ar: 'حَرْف جَرّ', tr: 'ḥarf jarr', fr: 'Préposition', def: 'Particule qui met au génitif le nom qui la suit : مِنْ, إِلَى, عَنْ, عَلَى, فِي, بِـ, لِـ.', group: 'particule' },
  { ar: 'نَوَاصِب', tr: 'nawāṣib', fr: 'Particules de naṣb', def: 'Particules qui mettent le présent à l’accusatif : أَنْ, لَنْ, كَيْ.', group: 'particule' },
  { ar: 'جَوَازِم', tr: 'jawāzim', fr: 'Particules de jazm', def: 'Particules qui apocopent le présent : لَمْ, لَمَّا, لَا الناهية.', group: 'particule' },
  { ar: 'لَا النَّاهِيَة', tr: 'lā al-nāhiya', fr: 'Lā de défense', def: 'Particule d’interdiction qui apocope le présent : لَا تَكْتُبْ, « n’écris pas ».', group: 'particule' },
  { ar: 'إِنَّ وَأَخَوَاتُهَا', tr: 'inna wa-akhawātuhā', fr: 'Inna et ses sœurs', def: 'أَنَّ, كَأَنَّ, لَكِنَّ, لَيْتَ, لَعَلَّ : elles mettent leur ism au naṣb et laissent leur khabar au rafʿ.', group: 'particule' },
  { ar: 'كَانَ وَأَخَوَاتُهَا', tr: 'kāna wa-akhawātuhā', fr: 'Kāna et ses sœurs', def: 'أَصْبَحَ, أَمْسَى, صَارَ, لَيْسَ, ظَلَّ : elles laissent leur ism au rafʿ et mettent leur khabar au naṣb.', group: 'particule' },
  { ar: 'عَامِل', tr: 'ʿāmil', fr: 'Régissant', def: 'Élément qui impose son état grammatical à un autre mot.', group: 'particule' },

  { ar: 'مَاضٍ', tr: 'māḍī', fr: 'Passé', def: 'Verbe accompli, normalement invariable, souvent construit sur la fatḥa.', group: 'verbe' },
  { ar: 'مُضَارِع', tr: 'muḍāriʿ', fr: 'Présent', def: 'Verbe inaccompli, seul verbe normalement variable : marfūʿ, manṣūb ou majzūm.', group: 'verbe' },
  { ar: 'أَمْر', tr: 'amr', fr: 'Impératif', def: 'Verbe d’ordre, invariable, souvent construit sur le sukūn.', group: 'verbe' },
  { ar: 'مَبْنِيّ لِلْمَجْهُول', tr: 'mabnī li-l-majhūl', fr: 'Passif', def: 'Verbe dont l’auteur n’est pas nommé ; le patient devient nāʾib fāʿil.', group: 'verbe' },
  { ar: 'ضَمِير مُتَّصِل', tr: 'ḍamīr muttaṣil', fr: 'Pronom attaché', def: 'Pronom soudé au verbe ou au nom, comme le تُ de كَتَبْتُ.', group: 'verbe' },
  { ar: 'ضَمِير مُسْتَتِر', tr: 'ḍamīr mustatir', fr: 'Pronom caché', def: 'Sujet non écrit mais sous-entendu, dont on indique l’estimation : تقديره هو.', group: 'verbe' },
  { ar: 'اِسْم ظَاهِر', tr: 'ism ẓāhir', fr: 'Nom apparent', def: 'Sujet exprimé par un nom visible, par opposition à un pronom.', group: 'verbe' },
]

export const GLOSSARY_GROUPS = [
  { id: 'method', label: 'La méthode' },
  { id: 'nature', label: 'Nature des mots' },
  { id: 'fonction', label: 'Fonctions' },
  { id: 'etat', label: 'États grammaticaux' },
  { id: 'marque', label: 'Marques' },
  { id: 'particule', label: 'Régissants' },
  { id: 'verbe', label: 'Verbes et pronoms' },
]

export function buildGlossary(curriculum = []) {
  return ENTRIES.map(entry => ({ ...entry, lessons: lessonsUsing(entry, curriculum) }))
}

export function glossaryEntries() {
  return ENTRIES.map(entry => ({ ...entry }))
}
