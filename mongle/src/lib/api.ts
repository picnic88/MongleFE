import type { AiSleepReportData, SleepReport, SleepTrendPoint } from '../types/report'

type JsonRecord = Record<string, unknown>

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as JsonRecord
    : null
}

function unwrap(value: unknown): unknown {
  let current = value
  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof current === 'string') {
      try { current = JSON.parse(current) } catch { break }
    }
    const record = asRecord(current)
    if (!record) break
    const next = record.data ?? record.report ?? record.report_data ?? record.result
    if (next === undefined) break
    current = next
  }
  return current
}

function pick(record: JsonRecord | null, keys: string[]): unknown {
  if (!record) return undefined
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key]
  }
  return undefined
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'number' && typeof value !== 'string') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === 'string'
        ? item
        : String(pick(asRecord(item), ['text', 'content', 'message']) ?? ''))
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (typeof value !== 'string') return []
  return value
    .split(/\r?\n|(?=\s*[•*-]\s+)/)
    .map((line) => line.replace(/^\s*[•*-]\s*/, '').trim())
    .filter(Boolean)
}

function average(values: Array<number | null>, digits = 1) {
  const valid = values.filter((value): value is number => value !== null)
  if (valid.length === 0) return null
  const scale = 10 ** digits
  return Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * scale) / scale
}

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
    ?? localStorage.getItem('accessToken')
    ?? localStorage.getItem('authToken')
    ?? localStorage.getItem('access_token')
}

async function request(path: string, init?: RequestInit) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal: AbortSignal.timeout(20000),
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  const raw = await response.text()
  let body: unknown = null
  if (raw) {
    try {
      body = JSON.parse(raw)
    } catch {
      body = raw
    }
  }

  if (!response.ok) {
    const detail = pick(asRecord(body), ['detail', 'message', 'error'])
    throw new ApiError(
      typeof detail === 'string' ? detail : `서버 요청에 실패했습니다. (${response.status})`,
      response.status,
    )
  }

  return body
}

function normalizeTrendPoint(value: unknown, index: number): SleepTrendPoint {
  const record = asRecord(value)
  return {
    date: String(pick(record, ['date', 'day', 'created_at', 'createdAt']) ?? index + 1),
    score: toNumber(pick(record, ['score', 'sleep_score', 'sleepScore'])),
    satisfaction: toNumber(pick(record, ['sleep_satisfaction', 'satisfaction'])),
    remPercentage: toNumber(pick(record, ['rem_percentage', 'rem_percent', 'rem', 'remPercentage'])),
    snoringCount: toNumber(pick(record, ['snoring_count', 'snore_count', 'snoring', 'snoringCount'])),
    temperature: toNumber(pick(record, ['temperature', 'temp_avg', 'temp', 'temperature_avg'])),
    humidity: toNumber(pick(record, ['humidity', 'hum_avg', 'hum', 'humidity_avg'])),
    durationMinutes: toNumber(pick(record, ['duration', 'duration_minutes', 'sleep_duration'])),
  }
}

function hasReportContent(report: SleepReport) {
  return Object.values(report.metrics).some((value) => value !== null)
    || report.summary.length > 0
    || report.trends.length > 0
}

export function normalizeReport(value: unknown): SleepReport {
  const envelope = asRecord(value)
  const root = asRecord(unwrap(value))
  if (!root) throw new Error('수면 리포트 응답 형식을 확인할 수 없습니다.')

  const metrics = asRecord(pick(root, ['key_metrics', 'metrics', 'averages', 'summary_metrics'])) ?? root
  const summary = asRecord(root.ai_summary)
  const patternSource = root.pattern_analysis
  const abnormalSource = root.abnormal_patterns
  const metadata = { ...envelope, ...root }
  const trendSource = pick(root, ['trends', 'trend', 'daily_data', 'records', 'sleep_records'])
  const trends = Array.isArray(trendSource) ? trendSource.map(normalizeTrendPoint) : []
  const report: SleepReport = {
    id: String(pick(metadata, ['report_id', 'reportId', 'id']) ?? '') || undefined,
    source: 'server',
    recordCount: toNumber(pick(root, ['record_count', 'recordCount', 'count'])) ?? trends.length,
    metrics: {
      score: toNumber(pick(metrics, ['score', 'sleep_score', 'ai_sleep_score']) ?? summary?.sleep_score),
      satisfaction: toNumber(pick(metrics, ['satisfaction', 'sleep_satisfaction', 'satisfaction_avg'])),
      remPercentage: toNumber(pick(metrics, ['average_rem', 'rem_percentage', 'rem_percent', 'rem', 'rem_avg'])),
      snoringCount: toNumber(pick(metrics, ['snoring_count', 'snore_count', 'snoring', 'snoring_avg'])),
      temperature: toNumber(pick(metrics, ['average_temperature', 'temperature', 'temp_avg', 'temperature_avg'])),
      humidity: toNumber(pick(metrics, ['average_humidity', 'humidity', 'hum_avg', 'humidity_avg'])),
      durationMinutes: toNumber(pick(metrics, ['duration', 'duration_minutes', 'sleep_duration'])),
    },
    summary: summary ? toStringList(summary.text) : toStringList(pick(root, ['summary', 'analysis', 'overall_analysis', 'ai_summary'])),
    patterns: Array.isArray(patternSource)
      ? patternSource.map((item) => {
        const pattern = asRecord(item)
        return pattern ? [pattern.condition, pattern.result, pattern.description].filter((part) => typeof part === 'string' && part).join(' · ') : String(item)
      })
      : toStringList(pick(root, ['patterns', 'ai_patterns'])),
    abnormalPatterns: Array.isArray(abnormalSource) ? abnormalSource.flatMap((item) => {
      const abnormal = asRecord(item)
      return abnormal && typeof abnormal.date === 'string' && typeof abnormal.observation === 'string' && typeof abnormal.opinion === 'string'
        ? [{ date: abnormal.date, observation: abnormal.observation, opinion: abnormal.opinion }]
        : []
    }) : [],
    serverSnoringAverage: toNumber(metrics.average_snoring),
    suggestions: toStringList(pick(root, ['improvement_suggestions', 'suggestions', 'recommendations', 'improvements', 'advice'])),
    trends,
    periodStart: String(pick(root, ['start_date', 'period_start', 'periodStart']) ?? '') || undefined,
    periodEnd: String(pick(root, ['end_date', 'period_end', 'periodEnd']) ?? '') || undefined,
    createdAt: String(pick(metadata, ['created_at', 'createdAt', 'generated_at']) ?? '') || undefined,
  }

  if (!hasReportContent(report)) throw new Error('수면 리포트 응답에 표시할 데이터가 없습니다.')
  return report
}

function extractSleepRecords(value: unknown) {
  const unwrapped = unwrap(value)
  const root = asRecord(unwrapped)
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : pick(root, ['records', 'sleep_records', 'items'])
  if (!Array.isArray(list)) return []

  const byDay = new Map<string, SleepTrendPoint>()
  list.forEach((item, index) => {
    const point = normalizeTrendPoint(item, index)
    const day = point.date.slice(0, 10)
    byDay.set(day, { ...point, date: day })
  })

  return [...byDay.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
}

function scoreLabel(score: number | null) {
  if (score === null) return '측정 데이터가 부족합니다'
  if (score >= 85) return '매우 좋은 수준입니다'
  if (score >= 70) return '양호한 수준입니다'
  if (score >= 50) return '관리가 필요한 수준입니다'
  return '집중적인 관리가 필요한 수준입니다'
}

function buildPatterns(trends: SleepTrendPoint[], score: number | null) {
  const patterns: string[] = []
  const optimalEnvironment = trends.filter((item) => (
    item.temperature !== null
    && item.humidity !== null
    && item.temperature >= 18
    && item.temperature <= 22
    && item.humidity >= 40
    && item.humidity <= 60
  ))
  const outsideEnvironment = trends.filter((item) => (
    item.temperature !== null
    && item.humidity !== null
    && !optimalEnvironment.includes(item)
  ))
  const optimalScore = average(optimalEnvironment.map((item) => item.score))
  const outsideScore = average(outsideEnvironment.map((item) => item.score))

  if (optimalEnvironment.length >= 2 && outsideEnvironment.length >= 2 && optimalScore !== null && outsideScore !== null) {
    const gap = Math.round(optimalScore - outsideScore)
    patterns.push(gap > 0
      ? `권장 온습도 범위에 있던 날의 수면 점수가 평균 ${gap}점 높았습니다.`
      : '현재 기록에서는 온습도 범위에 따른 뚜렷한 점수 차이가 확인되지 않았습니다.')
  }

  const snoringValues = trends.filter((item) => item.snoringCount !== null)
  const snoringAverage = average(snoringValues.map((item) => item.snoringCount))
  if (snoringAverage !== null) {
    const highSnoring = snoringValues.filter((item) => (item.snoringCount ?? 0) > snoringAverage)
    const lowSnoring = snoringValues.filter((item) => (item.snoringCount ?? 0) <= snoringAverage)
    const highScore = average(highSnoring.map((item) => item.score))
    const lowScore = average(lowSnoring.map((item) => item.score))
    if (highScore !== null && lowScore !== null && highSnoring.length >= 2 && lowSnoring.length >= 2) {
      const gap = Math.round(lowScore - highScore)
      patterns.push(gap > 0
        ? `코골이 횟수가 평균보다 적은 날의 수면 점수가 ${gap}점 높았습니다.`
        : '현재 기록에서는 코골이 횟수와 수면 점수 사이의 뚜렷한 차이가 확인되지 않았습니다.')
    }
  }

  const duration = average(trends.map((item) => item.durationMinutes))
  if (duration !== null) {
    patterns.push(`최근 평균 수면 시간은 ${Math.floor(duration / 60)}시간 ${Math.round(duration % 60)}분입니다.`)
  }
  if (score !== null) patterns.push(`최근 수면 점수 평균은 ${score}점이며 ${scoreLabel(score)}`)
  return patterns.slice(0, 4)
}

export function buildReportFromSleepRecords(value: unknown, userId: string): SleepReport {
  const trends = extractSleepRecords(value)
  if (trends.length === 0) throw new Error('리포트를 만들 수면 기록이 아직 없습니다.')

  const score = average(trends.map((item) => item.score))
  const snoringCount = average(trends.map((item) => item.snoringCount))
  const temperature = average(trends.map((item) => item.temperature))
  const humidity = average(trends.map((item) => item.humidity))
  const durationMinutes = average(trends.map((item) => item.durationMinutes))
  const summary = [
    `최근 ${trends.length}일의 수면 기록을 분석한 결과 평균 수면 점수는 ${score ?? '-'}점으로 ${scoreLabel(score)}`,
    temperature !== null && humidity !== null
      ? `평균 수면 환경은 온도 ${temperature}℃, 습도 ${humidity}%로 기록되었습니다.`
      : '온습도 기록이 충분하지 않아 수면 환경 평가는 제외했습니다.',
    snoringCount !== null
      ? `하루 평균 코골이 감지 횟수는 ${snoringCount}회입니다.`
      : '코골이 횟수 기록이 없어 관련 평가는 제외했습니다.',
  ]
  const suggestions = [
    temperature === null || temperature < 18 || temperature > 22
      ? '수면 중 실내 온도를 18~22℃로 맞춰보세요.'
      : '현재처럼 수면 중 실내 온도를 18~22℃로 유지하세요.',
    humidity === null || humidity < 40 || humidity > 60
      ? '가습기나 환기를 활용해 습도를 40~60%로 조절해보세요.'
      : '현재처럼 수면 중 습도를 40~60%로 유지하세요.',
    snoringCount !== null && snoringCount >= 10
      ? '코골이가 반복되면 옆으로 눕는 자세를 시도하고 전문 상담을 고려하세요.'
      : '규칙적인 취침 시간과 편안한 수면 자세를 유지해보세요.',
    '매일 비슷한 시간에 취침하고 기상해 수면 리듬을 일정하게 유지하세요.',
  ]

  return {
    id: `sleep-records-${userId}-${trends.at(-1)?.date}`,
    source: 'sleep-records',
    recordCount: trends.length,
    metrics: {
      score,
      satisfaction: average(trends.map((item) => item.satisfaction ?? null)),
      remPercentage: average(trends.map((item) => item.remPercentage)),
      snoringCount,
      temperature,
      humidity,
      durationMinutes,
    },
    summary,
    patterns: buildPatterns(trends, score),
    suggestions,
    trends,
    periodStart: trends[0]?.date,
    periodEnd: trends.at(-1)?.date,
    createdAt: new Date().toISOString(),
  }
}

function formatMetric(value: number | null, suffix: string) {
  return value === null ? '측정 데이터 없음' : `${value}${suffix}`
}

export function createReportCoachReply(message: string, report: SleepReport | null) {
  const question = message.replace(/\s/g, '').toLowerCase()
  if (!report) {
    if (question.includes('리포트')) {
      return '수면 리포트는 저장된 수면 점수, 코골이 횟수, 온도와 습도를 모아 생성해요. 먼저 리포트를 생성하면 실제 기록을 바탕으로 더 구체적으로 답변할 수 있어요.'
    }
    return '아직 생성된 수면 리포트가 없어요. 수면 기록을 먼저 분석한 뒤 질문해주시면 점수, 코골이, 온습도 데이터를 바탕으로 답변해드릴게요.'
  }

  const { metrics } = report
  if (question.includes('점수')) {
    return `리포트의 수면 점수는 ${formatMetric(metrics.score, '점')}입니다.`
  }
  if (question.includes('코골')) {
    if (metrics.snoringCount === null && report.serverSnoringAverage != null) {
      return `리포트의 평균 코골이 값은 ${report.serverSnoringAverage}입니다. 단위가 제공되지 않아 횟수나 시간으로 해석할 수는 없어요.`
    }
    const advice = metrics.snoringCount !== null && metrics.snoringCount >= 10
      ? '반복되는 코골이는 수면의 질을 떨어뜨릴 수 있으니 옆으로 눕는 자세를 시도하고, 지속되면 전문 상담을 권장해요.'
      : '현재 기록만으로 심한 수준이라고 단정하기는 어렵지만 날짜별 변화를 함께 확인하는 것이 좋아요.'
    return `하루 평균 코골이 감지 횟수는 ${formatMetric(metrics.snoringCount, '회')}예요. ${advice}`
  }
  if (question.includes('온도') || question.includes('습도') || question.includes('환경')) {
    return `평균 온도는 ${formatMetric(metrics.temperature, '℃')}, 평균 습도는 ${formatMetric(metrics.humidity, '%')}예요. 일반적으로 수면 환경은 온도 18~22℃, 습도 40~60%를 권장해요.`
  }
  if (question.includes('rem') || question.includes('렘')) {
    return metrics.remPercentage === null
      ? '현재 리포트에는 REM 측정값이 없습니다.'
      : `리포트에 기록된 평균 REM 값은 ${metrics.remPercentage}입니다.`
  }
  if (question.includes('만족')) {
    return metrics.satisfaction === null
      ? '현재 리포트에는 수면 만족도 측정값이 없습니다.'
      : `리포트에 기록된 수면 만족도는 ${metrics.satisfaction}입니다.`
  }
  if (question.includes('시간') || question.includes('얼마나')) {
    if (metrics.durationMinutes === null) return '수면 시간 기록이 충분하지 않아요.'
    return `최근 평균 수면 시간은 ${Math.floor(metrics.durationMinutes / 60)}시간 ${Math.round(metrics.durationMinutes % 60)}분이에요. 개인차가 있지만 일정한 취침과 기상 시간을 유지하는 것이 중요해요.`
  }
  if (question.includes('개선') || question.includes('방법') || question.includes('추천')) {
    return report.suggestions.slice(0, 3).join(' ')
  }
  return `${report.summary[0] ?? '수면 리포트를 확인했어요.'} 궁금한 지표를 점수, 코골이, 온도, 습도처럼 구체적으로 물어보면 기록을 기준으로 자세히 알려드릴게요.`
}

export function resolveUserId() {
  const params = new URLSearchParams(window.location.search)
  const queryId = params.get('user_id') ?? params.get('id')
  if (queryId) return queryId

  const direct = localStorage.getItem('user_id') ?? localStorage.getItem('userId')
  if (direct) return direct

  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      const user = asRecord(JSON.parse(savedUser))
      const id = pick(user, ['id', 'user_id', 'userId'])
      if (id !== undefined) return String(id)
    } catch {
      // Legacy local data may not be valid JSON.
    }
  }

  return import.meta.env?.VITE_MONGLE_USER_ID ?? '1'
}

export function toReportPayload(report: SleepReport): AiSleepReportData {
  const { metrics } = report
  const required = (value: number | null | undefined, label: string, integer = false) => {
    if (value == null || !Number.isFinite(value) || (integer && !Number.isInteger(value))) {
      throw new Error(`${label} 값이 없거나 저장 규격과 맞지 않아 리포트를 저장할 수 없습니다.`)
    }
    return value
  }
  const score = required(metrics.score, '수면 점수', true)
  return {
    ai_summary: { text: report.summary.join('\n'), sleep_score: score, evaluation: '수면 기록 집계' },
    key_metrics: {
      sleep_score: score,
      sleep_satisfaction: required(metrics.satisfaction, '수면 만족도', true),
      average_rem: required(metrics.remPercentage, 'REM'),
      average_snoring: required(report.serverSnoringAverage ?? metrics.snoringCount, '코골이'),
      average_temperature: required(metrics.temperature, '온도'),
      average_humidity: required(metrics.humidity, '습도'),
    },
    pattern_analysis: report.patterns.map((description) => ({ condition: '', result: '', description })),
    abnormal_patterns: report.abnormalPatterns ?? [],
    improvement_suggestions: report.suggestions,
  }
}

async function getSleepReportFallback(userId: string) {
  const records = await request(`/sleepinfo?id=${encodeURIComponent(userId)}`)
  return buildReportFromSleepRecords(records, userId)
}

export const mongleApi = {
  baseUrl: API_BASE_URL,

  async getSleepRecords(userId: string) {
    return request(`/sleepinfo?id=${encodeURIComponent(userId)}`)
  },

  async getLatestReport(userId: string) {
    try {
      const response = await request(`/report/latest/${encodeURIComponent(userId)}`)
      if (unwrap(response) == null) {
        const preview = await getSleepReportFallback(userId)
        return { ...preview, notice: '저장된 리포트가 없어 수면 기록 미리보기를 표시합니다.' }
      }
      return normalizeReport(response)
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) throw error
      const preview = await getSleepReportFallback(userId)
      return { ...preview, notice: '저장된 리포트를 불러오지 못해 수면 기록 미리보기를 표시합니다.' }
    }
  },

  async saveReport(userId: string, report: SleepReport) {
    const payload = toReportPayload(report)
    const response = await request(`/report?${new URLSearchParams({ user_id: userId })}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    // Some deployments return only the new identifier after saving.
    try {
      return normalizeReport(response)
    } catch {
      const metadata = asRecord(response)
      const id = pick(metadata, ['report_id', 'id'])
      const path = id == null
        ? `/report/latest/${encodeURIComponent(userId)}`
        : `/report/${encodeURIComponent(String(id))}`
      return normalizeReport(await request(path))
    }
  },

  async generateReport(userId: string) {
    const records = await request(`/sleepinfo?id=${encodeURIComponent(userId)}`)
    const fallback = buildReportFromSleepRecords(records, userId)
    try {
      toReportPayload(fallback)
    } catch {
      return { ...fallback, notice: '수면 기록 미리보기입니다. REM·만족도 등 필수 지표가 부족하거나 저장 규격에 맞지 않아 서버에 저장하지 않았습니다.' }
    }
    return mongleApi.saveReport(userId, fallback)
  },
}
