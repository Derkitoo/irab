// Normalisation unique du texte, partagée par la recherche et le glossaire.
//
// Les deux avaient leur propre version, subtilement différentes. Celle de la
// recherche décomposait tout en Unicode puis retirait les marques : pratique
// pour les accents français, destructeur pour l'arabe, car ئ et ؤ se
// décomposent en leur support suivi du hamza, et نائب devenait نايب.
//
// L'ordre importe donc : on décompose, on retire les seules marques latines,
// on recompose — ce qui reforme ئ, ؤ et أ — puis on traite l'arabe
// explicitement.

const LATIN_MARKS = /[̀-ͯ]/g
const ARABIC_MARKS = /[ً-ْٰـ]/g
const TRANSLITERATION = /[ʿʾʼ'’`]/g

export function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(LATIN_MARKS, '')
    .normalize('NFC')
    .replace(ARABIC_MARKS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(TRANSLITERATION, '')
    .replace(/\s+/g, ' ')
    .trim()
}
