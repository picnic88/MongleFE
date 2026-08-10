import {
  Activity,
  AudioLines,
  Check,
  Sparkles,
  Thermometer,
} from 'lucide-react'
import type { ReactNode } from 'react'

const metrics: Array<{
  title: string
  value: string
  evaluation: string
  icon: ReactNode
}> = [
  { title: 'AI 수면 점수', value: '82점', evaluation: '평가: 양호', icon: <Sparkles className="size-6" /> },
  { title: '수면 만족도', value: '4.4 / 5', evaluation: '평가: 높음', icon: <img src="/figma/after-img-smile.svg" alt="" className="size-7" /> },
  { title: '평균 REM', value: '22%', evaluation: '평가: 정상', icon: <Activity className="size-7" /> },
  { title: '평균 코골이', value: '18분', evaluation: '평가: 보통', icon: <AudioLines className="size-7" /> },
  { title: '평균 온도', value: '21.8℃', evaluation: '평가: 적정', icon: <Thermometer className="size-7" /> },
  { title: '평균 습도', value: '53%', evaluation: '평가: 적정', icon: <img src="/figma/after-img-drop.svg" alt="" className="size-7" /> },
]

const patterns = [
  '코골이 40분 이상 발생한 날의 평균 수면 점수는 15점 낮았습니다.',
  'REM 비율이 20% 이하인 날은 평균 만족도가 4.7점으로 높았습니다.',
  '습도 60% 이상에서는 평균 만족도가 3.5점으로 감소했습니다.',
  '온도는 평균 범위(18~22℃)를 유지하면 큰 영향은 확인되지 않았습니다.',
]

const suggestions = [
  { icon: <Thermometer className="size-6" />, text: '실내 온도 18~22℃, 습도 40~60% 유지' },
  { icon: <AudioLines className="size-6" />, text: '코골이가 지속될 경우 수면클리닉 상담 권장' },
  { icon: <Activity className="size-6" />, text: 'REM 감소가 반복될 경우 추가 검진 권장' },
  { icon: <Check className="size-5" />, text: '취침 및 기상 시간을 일정하게 유지' },
]

export function AfterReport() {
  return (
    <div className="space-y-5">
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
            <p className="mt-4 text-center text-[12px] text-[#616978]">{metric.evaluation}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[#e3e8f0] bg-white px-6 py-4 shadow-[0_4px_14px_rgba(31,46,77,0.05)]">
        <h2 className="flex items-center gap-3 text-[21px] font-bold">
          <img src="/figma/after-img-spark.svg" alt="" className="size-7" />
          AI 종합 분석
        </h2>
        <p className="mt-2 text-[14px] leading-[1.55] text-[#616978]">
          최근 30일간의 수면 데이터를 분석한 결과 수면 점수는 82점으로 양호합니다.
          <br />평균 온도와 습도는 적정 범위를 유지하고 있으며, 코골이 시간은 보통 수준입니다.
          <br />REM 비율은 정상 범위로, 전반적인 수면의 질이 균형 있게 유지되고 있습니다.
        </p>
      </section>

      <section className="rounded-2xl border border-[#e3e8f0] bg-white px-4 py-4 shadow-[0_4px_14px_rgba(31,46,77,0.05)] sm:px-5">
        <h2 className="px-1 text-[21px] font-bold">수면 데이터 트렌드</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 3xl:grid-cols-[252px_252px_252px_320px]">
          <LineChartCard title="수면 점수 (일별)" max="90" min="45" image="/figma/after-img5.svg" />
          <LineChartCard title="REM 비율 (%)" max="40%" min="10%" image="/figma/after-img-rem.svg" />
          <SnoreChartCard />
          <EnvironmentChartCard />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e3e8f0] bg-white px-6 py-5 shadow-[0_4px_14px_rgba(31,46,77,0.05)]">
          <h2 className="text-[21px] font-bold">AI 패턴 분석</h2>
          <ul className="mt-4 space-y-3">
            {patterns.map((pattern) => (
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
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.text}
                className="flex min-h-[34px] items-center gap-3 rounded-md border border-[#e3e8f0] px-3 text-[13px] text-[#1f242e]"
              >
                <span className="flex size-7 shrink-0 items-center justify-center text-[#4578fa]">{suggestion.icon}</span>
                <span>{suggestion.text}</span>
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

function GridLines() {
  return (
    <div className="absolute inset-x-7 bottom-7 top-11 flex flex-col justify-between" aria-hidden="true">
      {[0, 1, 2, 3].map((line) => (
        <span key={line} className="block border-t border-[#e9eef6]" />
      ))}
    </div>
  )
}

function ChartLabels({ max, min }: { max: string; min: string }) {
  return (
    <>
      <span className="absolute left-1 top-[39px] text-[8px] text-[#616978]">{max}</span>
      <span className="absolute bottom-[24px] left-1 text-[8px] text-[#616978]">{min}</span>
      <div className="absolute inset-x-3 bottom-1 flex justify-between text-[8px] text-[#616978]">
        <span>6/20</span><span>6/30</span><span>7/10</span><span>7/20</span>
      </div>
    </>
  )
}

function LineChartCard({ title, max, min, image }: { title: string; max: string; min: string; image: string }) {
  return (
    <ChartShell title={title}>
      <GridLines />
      <ChartLabels max={max} min={min} />
      <img src={image} alt={`${title} 추이`} className="absolute inset-x-7 top-[78px] h-[76px] w-[calc(100%-56px)]" />
    </ChartShell>
  )
}

function SnoreChartCard() {
  const bars = [42, 32, 58, 49, 46, 88, 32, 39, 69, 20, 49, 12, 88, 39]
  return (
    <ChartShell title="코골이 (분/일)">
      <GridLines />
      <ChartLabels max="60" min="0" />
      <div className="absolute inset-x-7 bottom-7 top-[50px] flex items-end justify-around gap-1" aria-label="일별 코골이 시간 막대 차트">
        {bars.map((height, index) => (
          <span key={`${height}-${index}`} className="w-2 rounded-t-sm bg-[#9cbcff]" style={{ height: `${height}%` }} />
        ))}
      </div>
    </ChartShell>
  )
}

function EnvironmentChartCard() {
  return (
    <ChartShell title="온도(℃) / 습도(%)">
      <div className="mt-1 flex justify-center gap-5 text-[8px]">
        <span className="text-[#4578fa]">● 온도(℃)</span>
        <span className="text-[#43a65d]">● 습도(%)</span>
      </div>
      <GridLines />
      <div className="absolute inset-x-3 bottom-1 flex justify-between text-[8px] text-[#616978]">
        <span>6/20</span><span>6/30</span><span>7/10</span><span>7/20</span>
      </div>
      <img src="/figma/after-img6.svg" alt="온도 추이" className="absolute inset-x-7 top-[88px] h-[40px] w-[calc(100%-56px)]" />
      <img src="/figma/after-img7.svg" alt="습도 추이" className="absolute inset-x-7 top-[79px] h-[56px] w-[calc(100%-56px)]" />
    </ChartShell>
  )
}
