import type {
  SubmissionDetail,
  SubmissionHistoryResponse,
} from '@/types/submission'
import { api } from './api'

export async function fetchSubmissionHistory(page = 1, limit = 30) {
  const { data } = await api.get<SubmissionHistoryResponse>(
    '/user/submissions',
    { params: { page, limit } },
  )
  return data
}

export async function fetchSubmissionByDate(date: string) {
  const { data } = await api.get<SubmissionDetail>(
    `/user/submissions/${date}`,
  )
  return data
}
