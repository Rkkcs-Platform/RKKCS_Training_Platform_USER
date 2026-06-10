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
  submitted: number
  correct: number
  wrong: number
  completed: boolean
}
