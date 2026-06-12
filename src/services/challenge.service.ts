import type { SubmitCodeResponse, TodayChallenge } from '@/types/challenge'
import type { SubmissionDetail } from '@/types/submission'
import type { UserStatistics } from '@/types/statistics'
import { api } from './api'

export async function fetchTodayChallenge() {
  const { data } = await api.get<TodayChallenge>('/user/challenges/today')
  return data
}

export async function fetchTodayResult() {
  const { data } = await api.get<SubmissionDetail>('/user/challenges/today/result')
  return data
}

export async function fetchUserStatistics() {
  const { data } = await api.get<UserStatistics>('/user/statistics')
  return data
}

export async function submitCodeRequest(code: string) {
  const { data } = await api.post<SubmitCodeResponse>(
    '/user/challenges/today/submit',
    { code },
  )
  return data
}
