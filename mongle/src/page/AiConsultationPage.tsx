import { useEffect, useState } from 'react'
import { Footer } from '../component/Footer'
import { Header } from '../component/Header'
import { AfterReport } from '../component/AfterReport'
import { BeforeReport } from '../component/BeforeReport'
import { ChatPanel } from '../component/ChatPanel'
import type { ReportStatus } from '../types/report'

function getReportStatus(): ReportStatus {
  return new URLSearchParams(window.location.search).get('report') === 'after'
    ? 'after'
    : 'before'
}

export default function AiConsultationPage() {
  const [reportStatus, setReportStatus] = useState<ReportStatus>(getReportStatus)

  useEffect(() => {
    const syncFromUrl = () => setReportStatus(getReportStatus())
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  const changeReportStatus = (status: ReportStatus) => {
    const url = new URL(window.location.href)
    url.searchParams.set('report', status)
    window.history.pushState({}, '', url)
    setReportStatus(status)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#fefeff] pb-[84px] text-[#1f242e]">
      <Header target="ai" />

      <main className="mx-auto grid w-full max-w-[1840px] grid-cols-1 gap-6 px-4 pb-5 pt-[91px] sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-7 3xl:grid-cols-[1170px_548px] 3xl:gap-[64px] 3xl:px-4">
        <section className="min-w-0">
          <div className="mb-5 pt-1">
            <h1 className="text-[24px] font-bold leading-[1.4] sm:text-[26px]">
              안녕하세요 서정환 님!
            </h1>
            <p className="mt-1 text-[14px] leading-6 text-[#616978] sm:text-[16px]">
              AI 수면 리포트와 상담을 통해 나에게 맞는 수면 환경을 알아보세요.
            </p>
          </div>

          {reportStatus === 'before' ? (
            <BeforeReport onGenerate={() => changeReportStatus('after')} />
          ) : (
            <AfterReport />
          )}
        </section>

        <aside className="min-w-0 lg:sticky lg:top-[91px] lg:h-[calc(100vh-167px)] lg:min-h-[440px] lg:max-h-[760px]">
          <ChatPanel key={reportStatus} reportStatus={reportStatus} />
        </aside>
      </main>

      <Footer />
    </div>
  )
}
