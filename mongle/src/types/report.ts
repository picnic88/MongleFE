export type ReportStatus = 'before' | 'after'

export type ChatRole = 'ai' | 'user'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
}

export type SleepReportMetrics = {
  score: number | null
  satisfaction: number | null
  remPercentage: number | null
  snoringCount: number | null
  temperature: number | null
  humidity: number | null
  durationMinutes: number | null
}

export type SleepTrendPoint = {
  date: string
  score: number | null
  remPercentage: number | null
  snoringCount: number | null
  temperature: number | null
  humidity: number | null
  durationMinutes: number | null
}

export type SleepReport = {
  id?: string
  source: 'server' | 'sleep-records'
  recordCount: number
  metrics: SleepReportMetrics
  summary: string[]
  patterns: string[]
  suggestions: string[]
  trends: SleepTrendPoint[]
  periodStart?: string
  periodEnd?: string
  createdAt?: string
}
