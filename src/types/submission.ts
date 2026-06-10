export type SubmissionStatus = 'in_progress' | 'completed'

export interface SubmissionHistoryItem {
  date: string
  correct: number
  wrong: number
  accuracy: number
  status: SubmissionStatus
  completedAt?: string
}

export interface SubmissionAnswer {
  order: number
  inputCode: string
  isCorrect: boolean
  submittedAt: string
}

export interface SubmissionDetail {
  date: string
  totalCodes: number
  submitted: number
  correct: number
  wrong: number
  accuracy: number
  status: SubmissionStatus
  startedAt?: string
  completedAt?: string
  answers: SubmissionAnswer[]
}

export interface SubmissionHistoryResponse {
  items: SubmissionHistoryItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
