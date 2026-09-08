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
  satisfaction?: number | null
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
  notice?: string
  serverSnoringAverage?: number | null
  abnormalPatterns?: { date: string; observation: string; opinion: string }[]
}

export type AiSleepReportData = {
  ai_summary: { text: string; sleep_score: number; evaluation: string }
  key_metrics: {
    sleep_score: number
    sleep_satisfaction: number
    average_rem: number
    average_snoring: number
    average_temperature: number
    average_humidity: number
  }
  pattern_analysis: { condition: string; result: string; description: string }[]
  abnormal_patterns: { date: string; observation: string; opinion: string }[]
  improvement_suggestions: string[]
}
