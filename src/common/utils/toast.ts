import { toast, type ExternalToast } from 'vue-sonner'
import i18n from '@/i18n'

const { t } = i18n.global

const DEFAULT_TOAST_OPTIONS: ExternalToast = {
  duration: 3000,
}

export function showSuccess(message: string, options?: ExternalToast) {
  toast.success(message, { ...DEFAULT_TOAST_OPTIONS, ...options })
}

export function showError(message: string, options?: ExternalToast) {
  toast.error(message, { ...DEFAULT_TOAST_OPTIONS, ...options })
}

export function showInfo(message: string) {
  toast.info(message)
}

export function showWarning(message: string) {
  toast.warning(message)
}

export function showLoginSuccess() {
  showSuccess(t('auth.loginSuccess'))
}

export function showLoginFailed(message?: string) {
  showError(message ?? t('auth.loginFailed'))
}

export function showMissingCredentials() {
  showError(t('auth.missingCredentials'))
}

export function showLogoutSuccess() {
  showSuccess(t('auth.logoutSuccess'))
}

export function showSessionExpired() {
  showError(t('auth.sessionExpired'))
}

export function showChallengeLoadFailed() {
  showError(t('challenge.loadFailed'))
}

export function showSubmitFailed(message?: string) {
  showError(message ?? t('challenge.submitFailed'))
}

export function showSubmitResult(isCorrect: boolean) {
  if (isCorrect) {
    showSuccess(t('challenge.correct'))
    return
  }

  showError(t('challenge.wrong'))
}

export function showChallengeCompleted() {
  showSuccess(t('challenge.completed'))
}

export function showHistoryLoadFailed() {
  showError(t('history.loadFailed'))
}

export function showHistoryDetailFailed() {
  showError(t('history.detailFailed'))
}

export function showRequestFailed(message?: string) {
  showError(message ?? t('common.requestFailed'))
}
