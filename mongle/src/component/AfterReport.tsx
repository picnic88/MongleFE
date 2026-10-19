import {
  Activity,
  AudioLines,
  Sparkles,
  Thermometer,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type { SleepReport, SleepTrendPoint } from '../types/report'
import api from '../api/api'

type AfterReportProps = {
  report: SleepReport
}

function evaluation(
  value: number | null | undefined,
  kind:
    | 'score'
    | 'satisfaction'
    | 'rem'
    | 'snoring'
    | 'temperature'
    | 'humidity'
) {
  if (value === null || value === undefined) {
    return '측정 데이터 없음'
  }

  if (kind === 'score') {
    return value >= 85
      ? '매우 좋음'
      : value >= 70
        ? '양호'
        : '관리 필요'
  }

  if (kind === 'satisfaction') {
    return value >= 4
      ? '높음'
      : value >= 3
        ? '보통'
        : '낮음'
  }

  if (kind === 'rem') {
    return value >= 20 && value <= 25
      ? '적정'
      : '확인 필요'
  }

  if (kind === 'snoring') {
    return value < 5
      ? '낮음'
      : value < 10
        ? '보통'
        : '관리 필요'
  }

  if (kind === 'temperature') {
    return value >= 18 && value <= 22
      ? '적정'
      : '조절 권장'
  }

  return value >= 40 && value <= 60
    ? '적정'
    : '조절 권장'
}

function dateLabel(value?: string | null) {
  if (!value) return ''

  const [year, month, day] = value
    .slice(0, 10)
    .split('-')

  return year && month && day
    ? `${year}.${month}.${day}`
    : value
}

export function AfterReport({ report }: AfterReportProps) {
  const [reports, setReports] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      const userId = sessionStorage.getItem('user_id')

      if (!userId) {
        console.error(
          'sessionStorage에 user_id가 없습니다.'
        )

        setLoadError(
          '사용자 정보를 확인할 수 없습니다.'
        )

        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError(null)

        console.log(
          '최신 리포트 조회 userId:',
          userId
        )

        const latestReportResponse =
          await api.get(
            `/report/latest/${userId}`
          )

        console.log(
          '최신 리포트 응답:',
          latestReportResponse.data
        )

        const reportId =
          latestReportResponse.data?.id

        if (!reportId) {
          console.error(
            '최신 reportId가 없습니다.'
          )

          setLoadError(
            '생성된 리포트를 찾을 수 없습니다.'
          )

          return
        }

        console.log(
          '최신 reportId:',
          reportId
        )

        const reportDataResponse =
          await api.get(
            `/report/${reportId}`
          )

        console.log(
          '리포트 상세 응답:',
          reportDataResponse.data
        )

        if (!reportDataResponse.data) {
          setLoadError(
            '리포트 데이터를 불러올 수 없습니다.'
          )

          return
        }

        setReports(
          reportDataResponse.data
        )
      } catch (error: any) {
        console.error(
          '리포트를 가져오지 못했습니다.',
          error
        )

        console.error(
          'status:',
          error.response?.status
        )

        console.error(
          'data:',
          error.response?.data
        )

        setLoadError(
          '리포트를 불러오지 못했습니다.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [])

  const reportData =
    reports?.report_data ?? {}

  const keyMetrics =
    reportData?.key_metrics ?? {}

  const sleepScore =
    keyMetrics?.sleep_score ?? null

  const sleepSatisfaction =
    keyMetrics?.sleep_satisfaction ?? null

  const averageRem =
    keyMetrics?.average_rem ?? null

  const averageSnoring =
    keyMetrics?.average_snoring ?? null

  const averageTemperature =
    keyMetrics?.average_temperature ?? null

  const averageHumidity =
    keyMetrics?.average_humidity ?? null

  const metrics: Array<{
    title: string
    value: string | number
    evaluation: string
    icon: ReactNode
  }> = [
      {
        title: '평균 수면 점수',
        value:
          sleepScore !== null
            ? sleepScore
            : '-',
        evaluation: evaluation(
          sleepScore,
          'score'
        ),
        icon: (
          <Sparkles className="size-6" />
        ),
      },
      {
        title: '수면 만족도',
        value:
          sleepSatisfaction !== null
            ? sleepSatisfaction
            : '-',
        evaluation: evaluation(
          sleepSatisfaction,
          'satisfaction'
        ),
        icon: (
          <img
            src="/figma/after-img-smile.svg"
            alt=""
            className="size-7"
          />
        ),
      },
      {
        title: '평균 REM',
        value:
          averageRem !== null
            ? averageRem
            : '-',
        evaluation: evaluation(
          averageRem,
          'rem'
        ),
        icon: (
          <Activity className="size-7" />
        ),
      },
      {
        title: '평균 코골이',
        value:
          averageSnoring !== null
            ? averageSnoring
            : '-',
        evaluation: evaluation(
          averageSnoring,
          'snoring'
        ),
        icon: (
          <AudioLines className="size-7" />
        ),
      },
      {
        title: '평균 온도',
        value:
          averageTemperature !== null
            ? averageTemperature
            : '-',
        evaluation: evaluation(
          averageTemperature,
          'temperature'
        ),
        icon: (
          <Thermometer className="size-7" />
        ),
      },
      {
        title: '평균 습도',
        value:
          averageHumidity !== null
            ? averageHumidity
            : '-',
        evaluation: evaluation(
          averageHumidity,
          'humidity'
        ),
        icon: (
          <img
            src="/figma/after-img-drop.svg"
            alt=""
            className="size-7"
          />
        ),
      },
    ]

  /*
   * 현재 부모 report에 trends가 없는 경우가 있으므로
   * 반드시 빈 배열로 방어
   */
  const trends: SleepTrendPoint[] =
    Array.isArray(report?.trends)
      ? report.trends
      : []

  const periodStart =
    report?.periodStart ?? ''

  const periodEnd =
    report?.periodEnd ?? ''

  const recordCount =
    report?.recordCount ?? 0

  if (isLoading) {
    return (
      <section className="flex min-h-[360px] items-center justify-center rounded-[18px] border border-[#e3e8f0] bg-white px-6 text-center shadow-[0_4px_14px_rgba(31,46,77,0.06)]">
        <p className="text-[15px] text-[#616978]">
          수면 리포트를 불러오는 중이에요...
        </p>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="flex min-h-[360px] items-center justify-center rounded-[18px] border border-[#e3e8f0] bg-white px-6 text-center shadow-[0_4px_14px_rgba(31,46,77,0.06)]">
        <p className="text-[15px] text-[#d04444]">
          {loadError}
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#616978]">
        <span className="rounded-full bg-[#eef3ff] px-3 py-1 font-semibold text-[#4578fa]">
          AI 수면 리포트
        </span>

        {(periodStart ||
          periodEnd ||
          recordCount > 0) && (
            <span>
              {periodStart &&
                dateLabel(periodStart)}

              {periodEnd &&
                ` - ${dateLabel(periodEnd)}`}

              {recordCount > 0 &&
                ` · ${recordCount}일 분석`}
            </span>
          )}
      </div>

      <section
        aria-label="수면 리포트 핵심 지표"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 3xl:grid-cols-6"
      >
        {metrics.map((metric) => (
          <article
            key={metric.title}
            className="flex min-h-[142px] flex-col rounded-[14px] border border-[#e3e8f0] bg-white px-4 py-4 shadow-[0_4px_14px_rgba(31,46,77,0.05)]"
          >
            <div className="flex items-center gap-2 text-[#4578fa]">
              <span className="flex size-7 shrink-0 items-center justify-center">
                {metric.icon}
              </span>

              <h2 className="text-[13px] font-medium text-[#1f242e]">
                {metric.title}
              </h2>
            </div>

            <p className="mt-5 text-center text-[23px] font-bold leading-none">
              {metric.value}
            </p>

            <p className="mt-4 text-center text-[12px] text-[#616978]">
              평가: {metric.evaluation}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[#e3e8f0] bg-white px-6 py-4 shadow-[0_4px_14px_rgba(31,46,77,0.05)]">
        <h2 className="flex items-center gap-3 text-[21px] font-bold">
          <img
            src="/figma/after-img-spark.svg"
            alt=""
            className="size-7"
          />

          AI 종합 분석
        </h2>

        <div className="mt-[8px] flex flex-col gap-[20px] text-[15px]">
          {reportData?.ai_summary?.text ? (
            <p>
              {reportData.ai_summary.text}
            </p>
          ) : (
            <p className="text-[#8c94a3]">
              AI 종합 분석 데이터가 없습니다.
            </p>
          )}
        </div>
      </section>

      {/* <section className="rounded-2xl border border-[#e3e8f0] bg-white px-4 py-4 shadow-[0_4px_14px_rgba(31,46,77,0.05)] sm:px-5">
        <h2 className="px-1 text-[21px] font-bold">
          수면 데이터 트렌드
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 3xl:grid-cols-[252px_252px_252px_320px]">
          <LineChartCard
            title="수면 점수 (일별)"
            data={trends}
            valueKey="score"
            suffix="점"
            color="#4578fa"
          />

          <LineChartCard
            title="REM 비율 (%)"
            data={trends}
            valueKey="remPercentage"
            suffix="%"
            color="#7f67d9"
          />

          <SnoreChartCard
            data={trends}
          />

          <EnvironmentChartCard
            data={trends}
          />
        </div>
      </section> */}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e3e8f0] bg-white px-6 py-5 shadow-[0_4px_14px_rgba(31,46,77,0.05)]">
          <h2 className="text-[21px] font-bold">
            패턴 분석
          </h2>

          <div className="mt-[8px] flex flex-col gap-[14px]">
            {Array.isArray(
              reportData?.pattern_analysis
            ) &&
              reportData.pattern_analysis
                .length > 0 ? (
              reportData.pattern_analysis.map(
                (
                  item: any,
                  index: number
                ) => (
                  <div
                    key={index}
                    className="flex flex-col gap-[5px]"
                  >
                    <p className="tracking-tighter">
                      •{' '}
                      {item?.condition ??
                        '조건 정보 없음'}{' '}
                      →{' '}
                      {item?.result ??
                        '결과 정보 없음'}
                    </p>

                    {item?.description && (
                      <p className="tracking-tighter text-[#616978]">
                        AI 의견 :{' '}
                        {item.description}
                      </p>
                    )}
                  </div>
                )
              )
            ) : (
              <p className="text-[15px] text-[#8c94a3]">
                패턴 분석 데이터가 없습니다.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e3e8f0] bg-white px-6 py-5 shadow-[0_4px_14px_rgba(31,46,77,0.05)]">
          <h2 className="text-[21px] font-bold">
            맞춤 개선 제안
          </h2>

          <div className="mt-[8px]">
            {Array.isArray(
              reportData?.improvement_suggestions
            ) &&
              reportData
                .improvement_suggestions
                .length > 0 ? (
              reportData.improvement_suggestions.map(
                (
                  item: string,
                  index: number
                ) => (
                  <p
                    key={index}
                    className="text-[15px] tracking-tighter"
                  >
                    • {item}
                  </p>
                )
              )
            ) : (
              <p className="text-[15px] text-[#8c94a3]">
                맞춤 개선 제안 데이터가 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function ChartShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <article className="relative h-[218px] overflow-hidden rounded-xl border border-[#e3e8f0] bg-white px-3 pb-3 pt-2">
      <h3 className="text-center text-[12px] font-medium">
        {title}
      </h3>

      {children}
    </article>
  )
}

function chartDates(
  data: SleepTrendPoint[]
) {
  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return []
  }

  const indexes = [
    ...new Set([
      0,
      Math.floor(
        (data.length - 1) / 2
      ),
      data.length - 1,
    ]),
  ]

  return indexes
    .map((index) => {
      const date = data[index]?.date

      if (!date) {
        return null
      }

      const [, month, day] = date
        .slice(0, 10)
        .split('-')

      if (!month || !day) {
        return null
      }

      return `${month}/${day}`
    })
    .filter(
      (date): date is string =>
        date !== null
    )
}

function DateAxis({
  data,
}: {
  data: SleepTrendPoint[]
}) {
  const dates = chartDates(data)

  return (
    <div className="absolute inset-x-7 bottom-2 flex justify-between text-[8px] text-[#616978]">
      {dates.map((date, index) => (
        <span
          key={`${date}-${index}`}
        >
          {date}
        </span>
      ))}
    </div>
  )
}

function GridLines() {
  return (
    <div
      className="absolute inset-x-7 bottom-7 top-11 flex flex-col justify-between"
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map(
        (line) => (
          <span
            key={line}
            className="block border-t border-[#e9eef6]"
          />
        )
      )}
    </div>
  )
}

function seriesPoints(
  values: Array<number | null>,
  width = 240,
  height = 110
) {
  if (!Array.isArray(values)) {
    return ''
  }

  const valid = values.filter(
    (value): value is number =>
      typeof value === 'number'
  )

  if (valid.length === 0) {
    return ''
  }

  const min = Math.min(...valid)
  const max = Math.max(...valid)

  const range =
    max - min || 1

  const denominator = Math.max(
    values.length - 1,
    1
  )

  return values
    .map((value, index) =>
      value === null ||
        value === undefined
        ? null
        : `${(index / denominator) *
        width
        },${height -
        ((value - min) / range) *
        (height - 20) -
        10
        }`
    )
    .filter(Boolean)
    .join(' ')
}

function NoChartData() {
  return (
    <p className="absolute inset-0 flex items-center justify-center pt-7 text-[12px] text-[#8c94a3]">
      측정 데이터 없음
    </p>
  )
}

function LineChartCard({
  title,
  data = [],
  valueKey,
  suffix,
  color,
}: {
  title: string
  data?: SleepTrendPoint[]
  valueKey:
  | 'score'
  | 'remPercentage'
  suffix: string
  color: string
}) {
  const safeData =
    Array.isArray(data)
      ? data
      : []

  const values = safeData.map(
    (item) =>
      item?.[valueKey] ?? null
  )

  const valid = values.filter(
    (value): value is number =>
      typeof value === 'number'
  )

  return (
    <ChartShell title={title}>
      <GridLines />

      {valid.length === 0 ? (
        <NoChartData />
      ) : (
        <>
          <span className="absolute left-1 top-[39px] text-[8px] text-[#616978]">
            {Math.max(...valid)}
            {suffix}
          </span>

          <span className="absolute bottom-[24px] left-1 text-[8px] text-[#616978]">
            {Math.min(...valid)}
            {suffix}
          </span>

          <svg
            viewBox="0 0 240 110"
            preserveAspectRatio="none"
            className="absolute inset-x-7 bottom-7 top-12 h-[132px] w-[calc(100%-56px)]"
            aria-label={`${title} 추이`}
          >
            <polyline
              points={seriesPoints(values)}
              fill="none"
              stroke={color}
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <DateAxis
            data={safeData}
          />
        </>
      )}
    </ChartShell>
  )
}

function SnoreChartCard({
  data = [],
}: {
  data?: SleepTrendPoint[]
}) {
  const safeData =
    Array.isArray(data)
      ? data
      : []

  const values = safeData.map(
    (item) =>
      item?.snoringCount ?? null
  )

  const valid = values.filter(
    (value): value is number =>
      typeof value === 'number'
  )

  const max = valid.length
    ? Math.max(...valid, 1)
    : 1

  return (
    <ChartShell title="코골이 감지 (회/일)">
      <GridLines />

      {valid.length === 0 ? (
        <NoChartData />
      ) : (
        <>
          <span className="absolute left-1 top-[39px] text-[8px] text-[#616978]">
            {Math.max(...valid)}회
          </span>

          <span className="absolute bottom-[24px] left-1 text-[8px] text-[#616978]">
            0회
          </span>

          <div
            className="absolute inset-x-7 bottom-7 top-[50px] flex items-end justify-around gap-1"
            aria-label="일별 코골이 횟수 막대 차트"
          >
            {values.map(
              (value, index) => (
                <span
                  key={`${safeData[index]
                    ?.date ??
                    index
                    }-${index}`}
                  className="min-w-1 flex-1 rounded-t-sm bg-[#9cbcff]"
                  style={{
                    height: `${value === null
                      ? 0
                      : Math.max(
                        (value /
                          max) *
                        100,
                        value === 0
                          ? 2
                          : 5
                      )
                      }%`,
                  }}
                  title={`${safeData[index]
                    ?.date ?? ''
                    }: ${value ?? '-'
                    }회`}
                />
              )
            )}
          </div>

          <DateAxis
            data={safeData}
          />
        </>
      )}
    </ChartShell>
  )
}

function EnvironmentChartCard({
  data = [],
}: {
  data?: SleepTrendPoint[]
}) {
  const safeData =
    Array.isArray(data)
      ? data
      : []

  const temperatures =
    safeData.map(
      (item) =>
        item?.temperature ?? null
    )

  const humidity =
    safeData.map(
      (item) =>
        item?.humidity ?? null
    )

  const hasTemperature =
    temperatures.some(
      (value) =>
        typeof value === 'number'
    )

  const hasHumidity =
    humidity.some(
      (value) =>
        typeof value === 'number'
    )

  return (
    <ChartShell title="온도(℃) / 습도(%)">
      <div className="mt-1 flex justify-center gap-5 text-[8px]">
        <span className="text-[#4578fa]">
          ● 온도(℃)
        </span>

        <span className="text-[#43a65d]">
          ● 습도(%)
        </span>
      </div>

      <GridLines />

      {!hasTemperature &&
        !hasHumidity ? (
        <NoChartData />
      ) : (
        <>
          <svg
            viewBox="0 0 240 110"
            preserveAspectRatio="none"
            className="absolute inset-x-7 bottom-7 top-14 h-[124px] w-[calc(100%-56px)]"
            aria-label="온도와 습도 추이"
          >
            {hasTemperature && (
              <polyline
                points={seriesPoints(
                  temperatures
                )}
                fill="none"
                stroke="#4578fa"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {hasHumidity && (
              <polyline
                points={seriesPoints(
                  humidity
                )}
                fill="none"
                stroke="#43a65d"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          <DateAxis
            data={safeData}
          />
        </>
      )}
    </ChartShell>
  )
}