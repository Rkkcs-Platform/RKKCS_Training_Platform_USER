import { toast, type ExternalToast } from 'vue-sonner'
import { TOAST_MESSAGES } from '../constants/messages'

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
  showSuccess(TOAST_MESSAGES.auth.loginSuccess)
}

export function showLoginFailed(message?: string) {
  showError(message ?? TOAST_MESSAGES.auth.loginFailed)
}

export function showMissingCredentials() {
  showError(TOAST_MESSAGES.auth.missingCredentials)
}

export function showLogoutSuccess() {
  showSuccess(TOAST_MESSAGES.auth.logoutSuccess)
}

export function showSessionExpired() {
  showError(TOAST_MESSAGES.auth.sessionExpired)
}

export function showChallengeLoadFailed() {
  showError(TOAST_MESSAGES.challenge.loadFailed)
}

export function showSubmitFailed(message?: string) {
  showError(message ?? TOAST_MESSAGES.challenge.submitFailed)
}

export function showSubmitResult(isCorrect: boolean) {
  if (isCorrect) {
    showSuccess(TOAST_MESSAGES.challenge.correct)
    return
  }

  showError(TOAST_MESSAGES.challenge.wrong)
}

export function showChallengeCompleted() {
  showSuccess(TOAST_MESSAGES.challenge.completed)
}

export function showHistoryLoadFailed() {
  showError(TOAST_MESSAGES.history.loadFailed)
}

export function showHistoryDetailFailed() {
  showError(TOAST_MESSAGES.history.detailFailed)
}

export function showRequestFailed(message?: string) {
  showError(message ?? TOAST_MESSAGES.common.requestFailed)
}
