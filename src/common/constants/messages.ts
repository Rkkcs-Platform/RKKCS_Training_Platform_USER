import i18n from '@/i18n'

const { t } = i18n.global

export function getToastMessage(key: string): string {
  return t(key)
}

export const APP_LABELS = {
  get appName() { return t('app.appName') },
  get brandShort() { return t('app.brandShort') },
}

export const PAGE_LABELS = {
  challenge: {
    get submitted() { return t('challenge.submitted') },
    get correct() { return t('challenge.correct') },
    get wrong() { return t('challenge.wrong') },
    get loadFailedTitle() { return t('challenge.loadFailedTitle') },
    get loadFailedHint() { return t('challenge.loadFailedHint') },
    get retry() { return t('common.retry') },
    get completedBanner() { return t('challenge.completedBanner') },
    get todayResultTitle() { return t('challenge.todayResultTitle') },
  },
  statistics: {
    get title() { return t('statistics.title') },
    get description() { return t('statistics.description') },
    get totalDays() { return t('statistics.totalDays') },
    get completedDays() { return t('statistics.completedDays') },
    get totalCorrect() { return t('statistics.totalCorrect') },
    get totalWrong() { return t('statistics.totalWrong') },
    get accuracy() { return t('statistics.accuracy') },
    get loadFailed() { return t('statistics.loadFailed') },
  },
}
