import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchTodayChallenge,
  fetchTodayResult,
  resubmitCodeRequest,
  submitCodeRequest,
} from '@/services/challenge.service'
import type { SubmitCodeResponse, TodayChallenge } from '@/types/challenge'
import type { SubmissionAnswer, SubmissionDetail } from '@/types/submission'

export const useChallengeStore = defineStore('challenge', () => {
  const today = ref<TodayChallenge | null>(null)
  const todayResult = ref<SubmissionDetail | null>(null)
  const isLoading = ref(false)
  const isLoadingResult = ref(false)
  const isSubmitting = ref(false)
  const loadFailed = ref(false)
  const lastFeedback = ref<'correct' | 'wrong' | null>(null)

  const progressPercent = computed(() => {
    if (!today.value || today.value.totalCodes === 0) return 0
    return Math.round((today.value.submitted / today.value.totalCodes) * 100)
  })

  const isCompleted = computed(
    () => today.value?.status === 'completed',
  )

  async function loadToday() {
    isLoading.value = true
    loadFailed.value = false

    try {
      today.value = await fetchTodayChallenge()

      if (today.value.submitted > 0) {
        await loadTodayResult()
      } else {
        todayResult.value = null
      }
    } catch {
      loadFailed.value = true
      today.value = null
      throw new Error('load failed')
    } finally {
      isLoading.value = false
    }
  }

  async function loadTodayResult() {
    isLoadingResult.value = true

    try {
      todayResult.value = await fetchTodayResult()
    } catch {
      todayResult.value = null
    } finally {
      isLoadingResult.value = false
    }
  }

  async function submitCode(code: string) {
    isSubmitting.value = true
    lastFeedback.value = null

    try {
      const result = await submitCodeRequest(code)
      lastFeedback.value = result.isCorrect ? 'correct' : 'wrong'

      if (today.value) {
        today.value = {
          ...today.value,
          submitted: result.submitted,
          correct: result.correct,
          wrong: result.wrong,
          status: result.completed ? 'completed' : 'in_progress',
        }
        if (!todayResult.value && result.submitted > 1) {
          await loadTodayResult()
        } else {
          rememberAnswer(code, result)
        }
      } else {
        await loadToday()
      }

      return result
    } finally {
      isSubmitting.value = false
    }
  }

  function clearFeedback() {
    lastFeedback.value = null
  }

  async function resubmitCode(order: number, code: string) {
    isSubmitting.value = true
    lastFeedback.value = null

    try {
      const result = await resubmitCodeRequest(order, code)
      lastFeedback.value = result.isCorrect ? 'correct' : 'wrong'

      if (today.value) {
        today.value = {
          ...today.value,
          correct: result.correct,
          wrong: result.wrong,
        }
      }

      if (!todayResult.value && result.submitted > 1) {
        await loadTodayResult()
      } else {
        rememberAnswer(code, result)
      }

      return result
    } finally {
      isSubmitting.value = false
    }
  }

  function rememberAnswer(code: string, result: SubmitCodeResponse) {
    const answer: SubmissionAnswer = {
      order: result.order,
      inputCode: (result.inputCode || code).trim().toUpperCase(),
      isCorrect: result.isCorrect,
      submittedAt: result.submittedAt || new Date().toISOString(),
      orderPreview: result.orderPreview,
    }

    if (!todayResult.value) {
      todayResult.value = {
        date: today.value?.date ?? '',
        totalCodes: today.value?.totalCodes ?? result.submitted,
        submitted: result.submitted,
        correct: result.correct,
        wrong: result.wrong,
        accuracy: result.accuracy ?? 0,
        status: result.completed ? 'completed' : 'in_progress',
        startedAt: today.value?.startedAt,
        answers: [answer],
      }
      return
    }

    const answers = todayResult.value.answers.slice()
    const index = answers.findIndex((item) => item.order === result.order)
    if (index >= 0) {
      answers[index] = { ...answers[index], ...answer }
    } else {
      answers.push(answer)
    }

    todayResult.value = {
      ...todayResult.value,
      submitted: result.submitted,
      correct: result.correct,
      wrong: result.wrong,
      accuracy: result.accuracy ?? todayResult.value.accuracy,
      status: result.completed ? 'completed' : todayResult.value.status,
      answers,
    }
  }

  return {
    today,
    todayResult,
    isLoading,
    isLoadingResult,
    isSubmitting,
    loadFailed,
    lastFeedback,
    progressPercent,
    isCompleted,
    loadToday,
    loadTodayResult,
    submitCode,
    resubmitCode,
    clearFeedback,
  }
})
