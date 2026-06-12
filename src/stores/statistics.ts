import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchUserStatistics } from '@/services/challenge.service'
import type { UserStatistics } from '@/types/statistics'

export const useStatisticsStore = defineStore('statistics', () => {
  const stats = ref<UserStatistics | null>(null)
  const isLoading = ref(false)
  const loadFailed = ref(false)

  async function loadStatistics() {
    isLoading.value = true
    loadFailed.value = false

    try {
      stats.value = await fetchUserStatistics()
    } catch {
      loadFailed.value = true
      throw new Error('load failed')
    } finally {
      isLoading.value = false
    }
  }

  return {
    stats,
    isLoading,
    loadFailed,
    loadStatistics,
  }
})
