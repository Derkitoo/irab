export function createBackup(progress, exportedAt = new Date()) {
  return {
    app: 'irab-fr',
    version: 1,
    exportedAt: exportedAt.toISOString(),
    progress,
  }
}

export function parseBackup(text) {
  const payload = JSON.parse(text)
  const progress = payload?.progress
  if (
    payload?.app !== 'irab-fr' ||
    payload?.version !== 1 ||
    !progress ||
    !Array.isArray(progress.lessons) ||
    !Array.isArray(progress.questions)
  ) {
    throw new Error('Invalid Iʿrāb backup')
  }
  return {
    lessons: progress.lessons,
    questions: progress.questions,
    wrongs: progress.wrongs && typeof progress.wrongs === 'object' ? progress.wrongs : {},
    cards: progress.cards && typeof progress.cards === 'object' ? progress.cards : {},
    activity: Array.isArray(progress.activity) ? progress.activity : [],
    preferences: progress.preferences && typeof progress.preferences === 'object' ? progress.preferences : {},
  }
}
