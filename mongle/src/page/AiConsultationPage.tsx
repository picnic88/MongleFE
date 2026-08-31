import { useCallback, useEffect, useMemo, useState } from 'react'
import { Footer } from '../component/Footer'
import { Header } from '../component/Header'
import { AfterReport } from '../component/AfterReport'
import { BeforeReport } from '../component/BeforeReport'
import { ChatPanel } from '../component/ChatPanel'
import { mongleApi, resolveUserId } from '../lib/api'
import type { ReportStatus, SleepReport } from '../types/report'

function getReportStatus(): ReportStatus {
  return new URLSearchParams(window.location.search).get('report') === 'after'
    ? 'after'
    : 'before'
}

export default function AiConsultationPage() {
  const [reportStatus, setReportStatus] = useState<ReportStatus>(getReportStatus)
  const [report, setReport] = useState<SleepReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userId = useMemo(resolveUserId, [])

  useEffect(() => {
    const syncFromUrl = () => setReportStatus(getReportStatus())
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setReport(await mongleApi.getLatestReport(userId))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '수면 리포트를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (reportStatus === 'after' && !report) void loadReport()
  }, [loadReport, report, reportStatus])

  const changeReportStatus = (status: ReportStatus) => {
    const url = new URL(window.location.href)
    url.searchParams.set('report', status)
    window.history.pushState({}, '', url)
    setReportStatus(status)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const generateReport = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const generatedReport = await mongleApi.generateReport(userId)
      setReport(generatedReport)
      changeReportStatus('after')
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : '수면 리포트를 생성하지 못했습니다.')
    } finally {
      setIsGenerating(false)
    }
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
            <BeforeReport onGenerate={generateReport} isGenerating={isGenerating} error={error} />
          ) : isLoading ? (
            <ReportState message="서버의 수면 기록을 불러오고 있어요..." />
          ) : report ? (
            <AfterReport report={report} />
          ) : (
            <ReportState message={error ?? '표시할 수면 기록이 없습니다.'} onRetry={loadReport} />
          )}
        </section>

        <aside className="min-w-0 lg:sticky lg:top-[91px] lg:h-[calc(100vh-167px)] lg:min-h-[440px] lg:max-h-[760px]">
          <ChatPanel
            key={`${reportStatus}-${report?.id ?? 'empty'}`}
            reportStatus={reportStatus}
            report={reportStatus === 'after' ? report : null}
            userId={userId}
          />
        </aside>
      </main>

      <Footer />
    </div>
  )
}

function ReportState({ message, onRetry }: { message: string; onRetry?: () => Promise<void> }) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[18px] border border-[#e3e8f0] bg-white px-6 text-center shadow-[0_4px_14px_rgba(31,46,77,0.06)]">
      <p className="text-[15px] text-[#616978]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={() => void onRetry()}
          className="mt-4 min-h-10 rounded-[10px] bg-[#4578fa] px-5 text-[14px] font-bold text-white transition hover:bg-[#3769e8]"
        >
          다시 불러오기
        </button>
      )}
    </section>
  )
}
