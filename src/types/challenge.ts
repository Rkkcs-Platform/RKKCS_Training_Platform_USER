import type { SubmissionOrderPreview } from '@/types/submission'

export type SubmissionStatus = 'in_progress' | 'completed'

export interface TodayChallenge {
  date: string
  totalCodes: number
  submitted: number
  correct: number
  wrong: number
  status: SubmissionStatus
  startedAt: string
}

export interface SubmitCodeResponse {
  isCorrect: boolean
  order: number
  submitted: number
  correct: number
  wrong: number
  accuracy?: number
  completed: boolean
  inputCode?: string
  submittedAt?: string
  orderPreview?: SubmissionOrderPreview
}
