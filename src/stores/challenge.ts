import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchTodayChallenge,
  submitCodeRequest,
} from '@/services/challenge.service'
import type { TodayChallenge } from '@/types/challenge'

export const useChallengeStore = defineStore('challenge', () => {
  const today = ref<TodayChallenge | null>(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
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

    try {
      today.value = await fetchTodayChallenge()
    } finally {
      isLoading.value = false
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
    isLoading,
    isSubmitting,
    lastFeedback,
    progressPercent,
    isCompleted,
    loadToday,
    submitCode,
    clearFeedback,
  }
})
