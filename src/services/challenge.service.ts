import type { SubmitCodeResponse, TodayChallenge } from '@/types/challenge'
import { api } from './api'

export async function fetchTodayChallenge() {
  const { data } = await api.get<TodayChallenge>('/user/challenges/today')
  return data
}

export async function submitCodeRequest(code: string) {
  const { data } = await api.post<SubmitCodeResponse>(
    '/user/challenges/today/submit',
    { code },
  )
  return data
}
