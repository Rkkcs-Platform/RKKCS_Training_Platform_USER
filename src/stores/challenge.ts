import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchTodayChallenge,
  fetchTodayResult,
  submitCodeRequest,
} from '@/services/challenge.service'
import type { TodayChallenge } from '@/types/challenge'
import type { SubmissionDetail } from '@/types/submission'

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
      } else {
        await loadToday()
      }

      await loadTodayResult()

      return result
    } finally {
      isSubmitting.value = false
    }
  }

  function clearFeedback() {
    lastFeedback.value = null
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
    clearFeedback,
  }
})
