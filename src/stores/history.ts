import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchSubmissionByDate,
  fetchSubmissionHistory,
} from '@/services/submission.service'
import type {
  SubmissionDetail,
  SubmissionHistoryItem,
} from '@/types/submission'

export const useHistoryStore = defineStore('history', () => {
  const items = ref<SubmissionHistoryItem[]>([])
  const selectedDate = ref<string | null>(null)
  const detail = ref<SubmissionDetail | null>(null)
  const isLoadingList = ref(false)
  const isLoadingDetail = ref(false)

  async function loadHistory() {
    isLoadingList.value = true

    try {
      const data = await fetchSubmissionHistory()
      items.value = data.items ?? []
    } finally {
      isLoadingList.value = false
    }
  }

  async function selectDate(date: string) {
    selectedDate.value = date
    isLoadingDetail.value = true

    try {
      detail.value = await fetchSubmissionByDate(date)
    } finally {
      isLoadingDetail.value = false
    }
  }

  function clearSelection() {
    selectedDate.value = null
    detail.value = null
  }

  return {
    items,
    selectedDate,
    detail,
    isLoadingList,
    isLoadingDetail,
    loadHistory,
    selectDate,
    clearSelection,
  }
})
