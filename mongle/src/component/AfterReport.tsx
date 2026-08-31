import {
  Activity,
  AudioLines,
  Check,
  Sparkles,
  Thermometer,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { SleepReport, SleepTrendPoint } from '../types/report'

type AfterReportProps = {
  report: SleepReport
}

function displayNumber(value: number | null, suffix: string, digits = 1) {
  if (value === null) return '-'
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(digits)
  return `${formatted}${suffix}`
}

function evaluation(value: number | null, kind: 'score' | 'satisfaction' | 'rem' | 'snoring' | 'temperature' | 'humidity') {
  if (value === null) return '측정 데이터 없음'
  if (kind === 'score') return value >= 85 ? '매우 좋음' : value >= 70 ? '양호' : '관리 필요'
  if (kind === 'satisfaction') return value >= 4 ? '높음' : value >= 3 ? '보통' : '낮음'
  if (kind === 'rem') return value >= 20 && value <= 25 ? '적정' : '확인 필요'
  if (kind === 'snoring') return value < 5 ? '낮음' : value < 10 ? '보통' : '관리 필요'
  if (kind === 'temperature') return value >= 18 && value <= 22 ? '적정' : '조절 권장'
  return value >= 40 && value <= 60 ? '적정' : '조절 권장'
}

function dateLabel(value?: string) {
  if (!value) return ''
  const [year, month, day] = value.slice(0, 10).split('-')
  return year && month && day ? `${year}.${month}.${day}` : value
}

export function AfterReport({ report }: AfterReportProps) {
  const metrics: Array<{
    title: string
    value: string
    evaluation: string
    icon: ReactNode
  }> = [
    {
      title: '평균 수면 점수',
      value: displayNumber(report.metrics.score, '점'),
      evaluation: evaluation(report.metrics.score, 'score'),
      icon: <Sparkles className="size-6" />,
    },
    {
      title: '수면 만족도',
      value: report.metrics.satisfaction === null ? '-' : `${report.metrics.satisfaction} / 5`,
      evaluation: evaluation(report.metrics.satisfaction, 'satisfaction'),
      icon: <img src="/figma/after-img-smile.svg" alt="" className="size-7" />,
    },
    {
      title: '평균 REM',
      value: displayNumber(report.metrics.remPercentage, '%'),
      evaluation: evaluation(report.metrics.remPercentage, 'rem'),
      icon: <Activity className="size-7" />,
    },
    {
      title: '평균 코골이',
      value: displayNumber(report.metrics.snoringCount, '회'),
      evaluation: evaluation(report.metrics.snoringCount, 'snoring'),
      icon: <AudioLines className="size-7" />,
    },
    {
      title: '평균 온도',
      value: displayNumber(report.metrics.temperature, '℃'),
      evaluation: evaluation(report.metrics.temperature, 'temperature'),
      icon: <Thermometer className="size-7" />,
    },
    {
      title: '평균 습도',
      value: displayNumber(report.metrics.humidity, '%'),
      evaluation: evaluation(report.metrics.humidity, 'humidity'),
      icon: <img src="/figma/after-img-drop.svg" alt="" className="size-7" />,
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#616978]">
        <span className="rounded-full bg-[#eef3ff] px-3 py-1 font-semibold text-[#4578fa]">
          {report.source === 'server' ? '서버 AI 리포트' : '서버 수면 기록 기반 리포트'}
        </span>
        <span>
          {dateLabel(report.periodStart)}{report.periodEnd ? ` - ${dateLabel(report.periodEnd)}` : ''} · {report.recordCount}일 분석
        </span>
      </div>

      <section aria-label="수면 리포트 핵심 지표" className="grid grid-cols-2 gap-4 md:grid-cols-3 3xl:grid-cols-6">
        {metrics.map((metric) => (
          <article
            key={metric.title}
            className="flex min-h-[142px] flex-col rounded-[14px] border border-[#e3e8f0] bg-white px-4 py-4 shadow-[0_4px_14px_rgba(31,46,77,0.05)]"
          >
            <div className="flex items-center gap-2 text-[#4578fa]">
              <span className="flex size-7 shrink-0 items-center justify-center">{metric.icon}</span>
              <h2 className="text-[13px] font-medium text-[#1f242e]">{metric.title}</h2>
            </div>
            <p className="mt-5 text-center text-[23px] font-bold leading-none">{metric.value}</p>
            <p className="mt-4 text-center text-[12px] text-[#616978]">평가: {metric.evaluation}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[#e3e8f0] bg-white px-6 py-4 shadow-[0_4px_14px_rgba(31,46,77,0.05)]">
        <h2 className="flex items-center gap-3 text-[21px] font-bold">
          <img src="/figma/after-img-spark.svg" alt="" className="size-7" />
          {report.source === 'server' ? 'AI 종합 분석' : '수면 기록 종합 분석'}
        </h2>
        <div className="mt-2 space-y-1 text-[14px] leading-[1.55] text-[#616978]">
          {report.summary.map((line) => <p key={line}>{line}</p>)}
        </div>
      </section>

      <section className="rounded-2xl border border-[#e3e8f0] bg-white px-4 py-4 shadow-[0_4px_14px_rgba(31,46,77,0.05)] sm:px-5">
        <h2 className="px-1 text-[21px] font-bold">수면 데이터 트렌드</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 3xl:grid-cols-[252px_252px_252px_320px]">
          <LineChartCard title="수면 점수 (일별)" data={report.trends} valueKey="score" suffix="점" color="#4578fa" />
          <LineChartCard title="REM 비율 (%)" data={report.trends} valueKey="remPercentage" suffix="%" color="#7f67d9" />
          <SnoreChartCard data={report.trends} />
          <EnvironmentChartCard data={report.trends} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e3e8f0] bg-white px-6 py-5 shadow-[0_4px_14px_rgba(31,46,77,0.05)]">
          <h2 className="text-[21px] font-bold">패턴 분석</h2>
          <ul className="mt-4 space-y-3">
            {report.patterns.map((pattern) => (
              <li key={pattern} className="flex gap-3 text-[13px] leading-6 text-[#1f242e]">
                <span className="mt-2.5 size-[5px] shrink-0 rounded-full bg-[#1f242e]" />
                <span>{pattern}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#e3e8f0] bg-white px-6 py-5 shadow-[0_4px_14px_rgba(31,46,77,0.05)]">
          <h2 className="text-[21px] font-bold">맞춤 개선 제안</h2>
          <ul className="mt-4 space-y-2">
            {report.suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                className="flex min-h-[38px] items-center gap-3 rounded-md border border-[#e3e8f0] px-3 py-1.5 text-[13px] text-[#1f242e]"
              >
                <span className="flex size-7 shrink-0 items-center justify-center text-[#4578fa]">
                  {index === 0 ? <Thermometer className="size-6" /> : index === 1 ? <Activity className="size-6" /> : index === 2 ? <AudioLines className="size-6" /> : <Check className="size-5" />}
                </span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function ChartShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="relative h-[218px] overflow-hidden rounded-xl border border-[#e3e8f0] bg-white px-3 pb-3 pt-2">
      <h3 className="text-center text-[12px] font-medium">{title}</h3>
      {children}
    </article>
  )
}

function chartDates(data: SleepTrendPoint[]) {
  if (data.length === 0) return []
  const indexes = [...new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])]
  return indexes.map((index) => {
    const [, month, day] = data[index].date.slice(0, 10).split('-')
    return `${month}/${day}`
  })
}

function DateAxis({ data }: { data: SleepTrendPoint[] }) {
  return (
    <div className="absolute inset-x-7 bottom-2 flex justify-between text-[8px] text-[#616978]">
      {chartDates(data).map((date, index) => <span key={`${date}-${index}`}>{date}</span>)}
    </div>
  )
}

function GridLines() {
  return (
    <div className="absolute inset-x-7 bottom-7 top-11 flex flex-col justify-between" aria-hidden="true">
      {[0, 1, 2, 3].map((line) => <span key={line} className="block border-t border-[#e9eef6]" />)}
    </div>
  )
}

function seriesPoints(values: Array<number | null>, width = 240, height = 110) {
  const valid = values.filter((value): value is number => value !== null)
  if (valid.length === 0) return ''
  const min = Math.min(...valid)
  const max = Math.max(...valid)
  const range = max - min || 1
  const denominator = Math.max(values.length - 1, 1)
  return values
    .map((value, index) => value === null
      ? null
      : `${(index / denominator) * width},${height - ((value - min) / range) * (height - 20) - 10}`)
    .filter(Boolean)
    .join(' ')
}

function NoChartData() {
  return <p className="absolute inset-0 flex items-center justify-center pt-7 text-[12px] text-[#8c94a3]">측정 데이터 없음</p>
}

function LineChartCard({
  title,
  data,
  valueKey,
  suffix,
  color,
}: {
  title: string
  data: SleepTrendPoint[]
  valueKey: 'score' | 'remPercentage'
  suffix: string
  color: string
}) {
  const values = data.map((item) => item[valueKey])
  const valid = values.filter((value): value is number => value !== null)
  return (
    <ChartShell title={title}>
      <GridLines />
      {valid.length === 0 ? <NoChartData /> : (
        <>
          <span className="absolute left-1 top-[39px] text-[8px] text-[#616978]">{Math.max(...valid)}{suffix}</span>
          <span className="absolute bottom-[24px] left-1 text-[8px] text-[#616978]">{Math.min(...valid)}{suffix}</span>
          <svg viewBox="0 0 240 110" preserveAspectRatio="none" className="absolute inset-x-7 bottom-7 top-12 h-[132px] w-[calc(100%-56px)]" aria-label={`${title} 추이`}>
            <polyline points={seriesPoints(values)} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>
          <DateAxis data={data} />
        </>
      )}
    </ChartShell>
  )
}

function SnoreChartCard({ data }: { data: SleepTrendPoint[] }) {
  const values = data.map((item) => item.snoringCount)
  const valid = values.filter((value): value is number => value !== null)
  const max = valid.length ? Math.max(...valid, 1) : 1
  return (
    <ChartShell title="코골이 감지 (회/일)">
      <GridLines />
      {valid.length === 0 ? <NoChartData /> : (
        <>
          <span className="absolute left-1 top-[39px] text-[8px] text-[#616978]">{Math.max(...valid)}회</span>
          <span className="absolute bottom-[24px] left-1 text-[8px] text-[#616978]">0회</span>
          <div className="absolute inset-x-7 bottom-7 top-[50px] flex items-end justify-around gap-1" aria-label="일별 코골이 횟수 막대 차트">
            {values.map((value, index) => (
              <span
                key={`${data[index].date}-${index}`}
                className="min-w-1 flex-1 rounded-t-sm bg-[#9cbcff]"
                style={{ height: `${value === null ? 0 : Math.max((value / max) * 100, value === 0 ? 2 : 5)}%` }}
                title={`${data[index].date}: ${value ?? '-'}회`}
              />
            ))}
          </div>
          <DateAxis data={data} />
        </>
      )}
    </ChartShell>
  )
}

function EnvironmentChartCard({ data }: { data: SleepTrendPoint[] }) {
  const temperatures = data.map((item) => item.temperature)
  const humidity = data.map((item) => item.humidity)
  const hasTemperature = temperatures.some((value) => value !== null)
  const hasHumidity = humidity.some((value) => value !== null)
  return (
    <ChartShell title="온도(℃) / 습도(%)">
      <div className="mt-1 flex justify-center gap-5 text-[8px]">
        <span className="text-[#4578fa]">● 온도(℃)</span>
        <span className="text-[#43a65d]">● 습도(%)</span>
      </div>
      <GridLines />
      {!hasTemperature && !hasHumidity ? <NoChartData /> : (
        <>
          <svg viewBox="0 0 240 110" preserveAspectRatio="none" className="absolute inset-x-7 bottom-7 top-14 h-[124px] w-[calc(100%-56px)]" aria-label="온도와 습도 추이">
            {hasTemperature && <polyline points={seriesPoints(temperatures)} fill="none" stroke="#4578fa" strokeWidth="3" vectorEffect="non-scaling-stroke" />}
            {hasHumidity && <polyline points={seriesPoints(humidity)} fill="none" stroke="#43a65d" strokeWidth="3" vectorEffect="non-scaling-stroke" />}
          </svg>
          <DateAxis data={data} />
        </>
      )}
    </ChartShell>
  )
}
