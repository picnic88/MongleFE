import {
  AudioLines,
  Check,
  Sparkles,
} from 'lucide-react'

type BeforeReportProps = {
  onGenerate: () => void
}

const reportItems = [
  {
    title: '수면 점수',
    description: '수면의 질을 종합하여 점수로 제공해요.',
    icon: '/figma/before-img-star.svg',
  },
  {
    title: '수면 만족도',
    description: '어젯밤 수면에 대한 만족도를 분석해요.',
    icon: '/figma/before-img-smile.svg',
  },
  {
    title: 'REM 분석',
    description: 'REM 비율과 패턴을 상세히 분석해요.',
    icon: '/figma/before-img-wave.svg',
  },
  {
    title: '코골이 분석',
    description: '코골이 시간과 빈도를 분석해요.',
    iconNode: <AudioLines aria-hidden="true" className="size-7 text-[#4578fa]" strokeWidth={1.8} />,
  },
  {
    title: '온도/습도 환경',
    description: '수면 중 환경의 영향을 분석해요.',
    icon: '/figma/before-img-drop.svg',
  },
  {
    title: 'AI 개선 제안',
    description: '맞춤형 수면 개선 방법을 제안해요.',
    iconNode: <Sparkles aria-hidden="true" className="size-7 text-[#4578fa]" strokeWidth={1.8} />,
  },
]

const checks = [
  '최소 2주간의 수면 기록이 저장되어 있어야 해요.',
  '온습도 데이터가 있을수록 더 정확해요.',
  '리포트 생성에는 잠시 시간이 걸릴 수 있어요.',
  '생성 후 AI 상담에서 자세히 질문할 수 있어요.',
]

export function BeforeReport({ onGenerate }: BeforeReportProps) {
  return (
    <div className="space-y-9">
      <article className="grid min-h-[325px] overflow-hidden rounded-[18px] border border-[#e3e8f0] bg-white px-8 py-10 shadow-[0_4px_14px_rgba(31,46,77,0.06)] md:grid-cols-[280px_1fr] md:items-center md:px-8 md:py-8">
        <div className="relative mx-auto flex size-[220px] items-center justify-center">
          <img src="/figma/before-img2.svg" alt="" className="absolute inset-0 size-full" />
          <img src="/figma/before-img-doc.svg" alt="수면 리포트 문서" className="relative h-[86px] w-[82px]" />
        </div>

        <div className="mt-8 text-center md:mt-0 md:text-left">
          <h2 className="text-[25px] font-bold leading-[1.45] sm:text-[29px]">
            이달의 수면 리포트가 아직 생성되지 않았어요
          </h2>
          <p className="mt-5 max-w-[690px] text-[15px] leading-7 text-[#616978] sm:text-[17px]">
            지난 밤의 수면 기록을 바탕으로 AI가 온도, 습도, 수면 만족도,
            <br className="hidden lg:block" /> 수면 점수, 코골이, REM 수면 데이터를 분석해 맞춤 리포트를 만들어드려요.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="mt-8 min-h-[58px] rounded-xl bg-[#4578fa] px-8 text-[17px] font-bold text-white shadow-sm transition hover:bg-[#3769e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4578fa]"
          >
            AI 수면 리포트 생성하기
          </button>
        </div>
      </article>

      <section className="rounded-[18px] border border-[#e3e8f0] bg-white p-6 shadow-[0_4px_14px_rgba(31,46,77,0.06)] sm:p-8">
        <h2 className="text-[21px] font-bold sm:text-[23px]">리포트에 포함되는 내용</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6">
          {reportItems.map((item) => (
            <article
              key={item.title}
              className="flex min-h-[142px] flex-col items-center justify-center rounded-[14px] border border-[#e3e8f0] bg-white px-4 py-4 text-center shadow-[0_4px_12px_rgba(31,46,77,0.05)]"
            >
              <div className="flex h-8 items-center justify-center">
                {item.icon ? <img src={item.icon} alt="" className="size-[29px]" /> : item.iconNode}
              </div>
              <h3 className="mt-3 text-[14px] font-bold">{item.title}</h3>
              <p className="mt-2 text-[12px] leading-[1.55] text-[#616978]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[18px] border border-[#e3e8f0] bg-white px-6 py-6 shadow-[0_4px_14px_rgba(31,46,77,0.06)] sm:px-8">
        <h2 className="text-[21px] font-bold sm:text-[23px]">생성 전 확인 사항</h2>
        <ul className="mt-4 space-y-2.5">
          {checks.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[15px] leading-6 text-[#616978]">
              <span className="mt-0.5 flex size-[21px] shrink-0 items-center justify-center rounded-full border border-[#4578fa] text-[#4578fa]">
                <Check aria-hidden="true" className="size-3.5" strokeWidth={2} />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
