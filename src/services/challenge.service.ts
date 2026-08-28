import type { SubmitCodeResponse, TodayChallenge } from '@/types/challenge'
import type { SubmissionDetail } from '@/types/submission'
import type { UserStatistics } from '@/types/statistics'
import { api } from './api'

export async function fetchTodayChallenge() {
  const { data } = await api.get<TodayChallenge>('/batches/today')
  return data
}

export async function fetchTodayResult() {
  const { data } = await api.get<SubmissionDetail>('/batches/today/result')
  return data
}

export async function fetchUserStatistics() {
  const { data } = await api.get<UserStatistics>('/user/statistics')
  return data
}

export async function submitCodeRequest(code: string) {
  const { data } = await api.post<SubmitCodeResponse>(
    '/batches/upload-code',
    { code },
  )
  return data
}

export async function resubmitCodeRequest(order: number, code: string) {
  const { data } = await api.patch<SubmitCodeResponse>(
    '/batches/resubmit-code',
    { order, code },
  )
  return data
}
