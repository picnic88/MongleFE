import { useEffect, useState } from 'react'
import { Footer } from '../component/Footer'
import { Header } from '../component/Header'
import { AfterReport } from '../components/AfterReport'
import { BeforeReport } from '../components/BeforeReport'
import { ChatPanel } from '../components/ChatPanel'
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

      <main className="mx-auto grid w-full max-w-[1840px] grid-cols-1 gap-8 px-5 pb-6 pt-[101px] sm:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(400px,500px)] xl:items-start xl:gap-8 3xl:grid-cols-[1170px_548px] 3xl:gap-[94px] 3xl:px-4">
        <section className="min-w-0">
          <div className="mb-9 pt-3">
            <h1 className="text-[26px] font-bold leading-[1.45] sm:text-[30px]">
              안녕하세요 서정환 님!
            </h1>
            <p className="mt-2 text-[15px] leading-7 text-[#616978] sm:text-lg">
              AI 수면 리포트와 상담을 통해 나에게 맞는 수면 환경을 알아보세요.
            </p>
          </div>

          {reportStatus === 'before' ? (
            <BeforeReport onGenerate={() => changeReportStatus('after')} />
          ) : (
            <AfterReport />
          )}
        </section>

        <aside className="min-w-0 xl:sticky xl:top-[101px] xl:h-[calc(100vh-125px)] xl:min-h-[700px] xl:max-h-[1255px]">
          <ChatPanel key={reportStatus} reportStatus={reportStatus} />
        </aside>
      </main>

      <Footer />
    </div>
  )
}
