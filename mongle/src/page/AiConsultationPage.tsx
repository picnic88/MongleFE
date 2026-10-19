import { useEffect, useMemo, useState } from 'react'
import { Footer } from '../component/Footer'
import { Header } from '../component/Header'
import { AfterReport } from '../component/AfterReport'
import { BeforeReport } from '../component/BeforeReport'
import { ChatPanel } from '../component/ChatPanel'
import { mongleApi, resolveUserId } from '../lib/api'
import type { ReportStatus, SleepReport } from '../types/report'
import api from '../api/api'

function getReportStatus(): ReportStatus {
  return new URLSearchParams(window.location.search).get('report') === 'after'
    ? 'after'
    : 'before'
}

export default function AiConsultationPage() {
  const [reportStatus, setReportStatus] = useState<ReportStatus>(getReportStatus)
  const [report, setReport] = useState<SleepReport | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nickname, setNickname] = useState<string | null>(null)

  const userId = useMemo(resolveUserId, [])

  useEffect(() => {
    const syncFromUrl = () => {
      setReportStatus(getReportStatus())
    }

    window.addEventListener('popstate', syncFromUrl)

    return () => {
      window.removeEventListener('popstate', syncFromUrl)
    }
  }, [])

  useEffect(() => {
    const checkIsReport = async () => {
      const sessionUserId = sessionStorage.getItem('user_id')

      if (!sessionUserId) {
        console.error('sessionStorage에 user_id가 없습니다.')
        setReport(null)
        setReportStatus('before')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        /*
         * 1. 사용자의 리포트 목록 확인
         *
         * /report/{userId}
         * [
         *   {...},
         *   {...}
         * ]
         * 형태의 배열을 반환한다고 가정
         */
        const reportListResponse = await api.get(
          `/report/user/${sessionUserId}`
        )

        const reportList = reportListResponse.data

        console.log('사용자 리포트 목록:', reportList)

        /*
         * 리포트가 하나도 없는 경우
         * → BeforeReport
         */
        if (!Array.isArray(reportList) || reportList.length === 0) {
          console.log('생성된 리포트가 없습니다.')

          setReport(null)
          setReportStatus('before')

          return
        }

        /*
         * 리포트가 하나 이상 존재
         */
        console.log('생성된 리포트가 존재합니다.')

        /*
         * 2. 최신 리포트 ID 조회
         *
         * AfterReport에서도 현재 같은 API를 사용하고 있음
         */
        const latestReportResponse = await api.get(
          `/report/latest/${sessionUserId}`
        )

        const latestReportId = latestReportResponse.data?.id

        console.log('최신 리포트 ID:', latestReportId)

        if (!latestReportId) {
          console.error('최신 리포트 ID가 없습니다.')

          setReport(null)
          setReportStatus('before')

          return
        }

        /*
         * 3. 최신 리포트 상세 조회
         */
        const latestReportDetailResponse = await api.get(
          `/report/${latestReportId}`
        )

        const latestReport = latestReportDetailResponse.data

        console.log('최신 리포트:', latestReport)

        /*
         * report에는 배열이 아니라
         * 최신 리포트 하나만 저장
         */
        setReport(latestReport)
        setReportStatus('after')
      } catch (loadError) {
        console.error('리포트를 불러오지 못했습니다.', loadError)

        setReport(null)
        setReportStatus('before')

        setError(
          loadError instanceof Error
            ? loadError.message
            : '수면 리포트를 불러오지 못했습니다.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    checkIsReport()
  }, [])

  const changeReportStatus = (status: ReportStatus) => {
    const url = new URL(window.location.href)

    url.searchParams.set('report', status)

    window.history.pushState({}, '', url)

    setReportStatus(status)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const generateReport = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      /*
       * AI 리포트 생성
       */
      const generatedReport = await mongleApi.generateReport(userId)

      console.log('생성된 리포트:', generatedReport)

      /*
       * 생성된 리포트를 report에 저장
       */
      setReport(generatedReport)

      /*
       * AfterReport 화면으로 전환
       */
      changeReportStatus('after')
    } catch (generateError) {
      console.error('리포트 생성 실패:', generateError)

      setError(
        generateError instanceof Error
          ? generateError.message
          : '수면 리포트를 생성하지 못했습니다.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const getUserName = async () => {
      const sessionUserId = sessionStorage.getItem('user_id')

      if (!sessionUserId) {
        return
      }

      try {
        const response = await api.get(
          `/profile/${sessionUserId}`
        )

        console.log('사용자 프로필:', response.data)

        setNickname(response.data.name)
      } catch (profileError) {
        console.error(
          '사용자 정보를 불러오지 못했습니다.',
          profileError
        )
      }
    }

    getUserName()
  }, [])

  return (
    <div className="min-h-screen bg-[#fefeff] pb-[84px] text-[#1f242e]">
      <Header target="ai" />

      <main className="mx-auto grid w-full max-w-[1840px] grid-cols-1 gap-6 px-4 pb-5 pt-[91px] sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-7 3xl:grid-cols-[1170px_548px] 3xl:gap-[64px] 3xl:px-4">
        <section className="min-w-0">
          <div className="mb-5 pt-1">
            <h1 className="text-[24px] font-bold leading-[1.4] sm:text-[26px]">
              안녕하세요 {nickname} 님!
            </h1>

            <p className="mt-1 text-[14px] leading-6 text-[#616978] sm:text-[16px]">
              AI 수면 리포트와 상담을 통해 나에게 맞는 수면 환경을 알아보세요.
            </p>
          </div>

          {isLoading ? (
            <ReportState message="수면 리포트를 불러오는 중이에요..." />
          ) : reportStatus === 'after' && report ? (
            <AfterReport report={report} />
          ) : (
            <BeforeReport
              onGenerate={generateReport}
              isGenerating={isGenerating}
              error={error}
            />
          )}
        </section>

        <aside className="min-w-0 lg:sticky lg:top-[91px] lg:h-[calc(100vh-167px)] lg:min-h-[440px] lg:max-h-[760px]">
          <ChatPanel
            key={`${reportStatus}-${report?.id ?? 'empty'}`}
            reportStatus={reportStatus}
            report={
              reportStatus === 'after'
                ? report
                : null
            }
            userId={userId}
          />
        </aside>
      </main>

      <Footer />
    </div>
  )
}

function ReportState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => Promise<void>
}) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[18px] border border-[#e3e8f0] bg-white px-6 text-center shadow-[0_4px_14px_rgba(31,46,77,0.06)]">
      <p className="text-[15px] text-[#616978]">
        {message}
      </p>

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