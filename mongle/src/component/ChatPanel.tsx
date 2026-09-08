import { Maximize2, Minus, SendHorizontal } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createReportCoachReply } from '../lib/api'
import {
  createChatCacheKey,
  readChatCache,
  removeExpiredChatCaches,
  writeChatCache,
} from '../lib/chatCache'
import type { ChatMessage, ReportStatus, SleepReport } from '../types/report'

type ChatPanelProps = {
  reportStatus: ReportStatus
  report: SleepReport | null
  userId: string
}

const beforeQuestions = [
  '리포트는 어떻게 생성되나요?',
  '수면 점수는 무엇으로 계산되나요?',
  '코골이 데이터는 어떻게 반영되나요?',
  'REM 비율은 왜 중요한가요?',
]

const afterQuestions = [
  '수면 점수는 어떻게 나왔나요?',
  '온도와 습도는 적정한가요?',
  '코골이를 줄이는 방법이 있을까요?',
  '평균 수면 시간은 얼마인가요?',
]

export function ChatPanel({ reportStatus, report, userId }: ChatPanelProps) {
  const questions = reportStatus === 'before' ? beforeQuestions : afterQuestions
  const cacheKey = useMemo(
    () => createChatCacheKey(userId, reportStatus, report?.id),
    [report?.id, reportStatus, userId],
  )
  const initialMessages = useMemo<ChatMessage[]>(() => [{
    id: `${reportStatus}-welcome`,
    role: 'ai',
    content: reportStatus === 'before'
      ? '안녕하세요! 수면 습관이나 환경에 대해 궁금한 점을 물어보세요. 리포트를 생성하면 저장된 기록을 바탕으로 더 구체적으로 답변할 수 있어요.'
      : report
        ? '안녕하세요! 수면 리포트를 바탕으로 도와드릴게요. 점수, 코골이, 온도와 습도에 대해 물어보세요.'
        : '수면 리포트를 불러오는 중이에요. 잠시 후 궁금한 점을 물어보세요.',
  }], [report, reportStatus])
  const [draft, setDraft] = useState('')
  const [sentMessages, setSentMessages] = useState<ChatMessage[]>(() => {
    removeExpiredChatCaches()
    return readChatCache(cacheKey)
  })
  const [isResponding, setIsResponding] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messageListRef = useRef<HTMLDivElement>(null)
  const messageContentRef = useRef<HTMLDivElement>(null)

  const messages = useMemo(
    () => [...initialMessages, ...sentMessages],
    [initialMessages, sentMessages],
  )
  const hasStarted = sentMessages.some((message) => message.role === 'user')

  useEffect(() => {
    writeChatCache(cacheKey, sentMessages)
  }, [cacheKey, sentMessages])

  const scrollToLatestMessage = useCallback(() => {
    const messageList = messageListRef.current
    if (messageList) messageList.scrollTop = messageList.scrollHeight
  }, [])

  useLayoutEffect(() => {
    if (isMinimized) return
    scrollToLatestMessage()
    const nextFrame = window.requestAnimationFrame(scrollToLatestMessage)
    return () => window.cancelAnimationFrame(nextFrame)
  }, [isMinimized, messages, scrollToLatestMessage])

  useEffect(() => {
    const messageList = messageListRef.current
    const messageContent = messageContentRef.current
    if (!messageList || !messageContent || !('ResizeObserver' in window)) return

    const resizeObserver = new ResizeObserver(scrollToLatestMessage)
    resizeObserver.observe(messageList)
    resizeObserver.observe(messageContent)
    return () => resizeObserver.disconnect()
  }, [scrollToLatestMessage])

  const sendMessage = async (suggestedMessage?: string) => {
    const message = (suggestedMessage ?? draft).trim()
    if (!message || isResponding) return

    const now = Date.now()
    setSentMessages((current) => [
      ...current,
      { id: `user-${now}`, role: 'user', content: message },
    ])
    setDraft('')
    setIsResponding(true)

    await new Promise((resolve) => window.setTimeout(resolve, 220))
    const reply = createReportCoachReply(message, report)
    setSentMessages((current) => [
      ...current,
      { id: `ai-${now}`, role: 'ai', content: reply },
    ])
    setIsResponding(false)
  }

  if (isMinimized) {
    return (
      <section className="overflow-hidden rounded-[16px] border border-[#e3e8f0] bg-white shadow-[0_4px_14px_rgba(31,46,77,0.06)]">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          aria-label="상담창 펼치기"
          aria-expanded="false"
          className="flex min-h-14 w-full items-center px-5 text-left transition hover:bg-[#f8faff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4578fa]"
        >
          <span className="text-[18px] font-bold">AI와 상담하기</span>
          <Maximize2 aria-hidden="true" className="ml-auto size-5 text-[#616978]" strokeWidth={1.6} />
        </button>
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-[440px] flex-col overflow-hidden rounded-[16px] border border-[#e3e8f0] bg-white shadow-[0_4px_14px_rgba(31,46,77,0.06)]">
      <header className="px-5 pt-3">
        <div className="flex items-center">
          <h2 className="text-[18px] font-bold sm:text-[19px]">AI와 상담하기</h2>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            aria-label="상담창 최소화"
            aria-expanded="true"
            className="ml-auto flex size-8 items-center justify-center rounded-full text-[#616978] transition hover:bg-[#f3f6fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4578fa]"
          >
            <Minus aria-hidden="true" className="size-5" strokeWidth={1.6} />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-3 border-b border-[#e3e8f0] pb-2">
          <div className="relative size-11 shrink-0">
            <img
              src={reportStatus === 'before' ? '/figma/before-img-ai.svg' : '/figma/after-img-ai.svg'}
              alt=""
              className="size-full"
            />
            <span className="absolute inset-0 flex items-center justify-center text-[14px] font-bold text-white">AI</span>
          </div>
          <div>
            <h3 className="text-[14px] font-bold">AI 수면 코치</h3>
            <p className="mt-0.5 text-[12px] text-[#616978]">
              {report ? '수면 리포트 기반 자동 안내' : '수면 기록을 확인하면 더 자세히 안내해요.'}
            </p>
          </div>
        </div>
      </header>

      <div
        ref={messageListRef}
        data-testid="chat-message-list"
        aria-live="polite"
        className="min-h-[96px] flex-1 overflow-y-auto px-5 py-3"
      >
        <div ref={messageContentRef} className="space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} reportStatus={reportStatus} />
          ))}
          {isResponding && (
            <div className="flex items-center gap-2 pl-11 text-[12px] text-[#8c94a3]" role="status">
              <span className="size-1.5 animate-pulse rounded-full bg-[#8c94a3]" />
              답변을 정리하고 있어요
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-transparent px-5 pb-4 pt-2">
        {!hasStarted && (
          <div data-testid="recommended-questions">
            <h3 className="text-[14px] font-bold">추천 질문</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {questions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => void sendMessage(question)}
                  disabled={isResponding}
                  className="min-h-9 rounded-full border border-[#bdd1ff] bg-white px-3 py-1.5 text-[11px] font-medium leading-4 text-[#4578fa] transition hover:bg-[#f4f7ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4578fa] disabled:opacity-60"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`relative rounded-[10px] border border-[#e3e8f0] bg-white px-3 pb-2 pt-2 focus-within:border-[#8eaeff] ${!hasStarted ? 'mt-3' : ''}`}>
          <textarea
            value={draft}
            maxLength={500}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void sendMessage()
              }
            }}
            placeholder="메시지를 입력하세요..."
            aria-label="AI 상담 메시지"
            className="h-[34px] w-[calc(100%-50px)] resize-none border-0 bg-transparent p-0 text-[13px] leading-5 text-[#1f242e] outline-none placeholder:text-[#8c94a3]"
          />
          <span className="block text-[12px] text-[#8c94a3]">{draft.length}/500</span>
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!draft.trim() || isResponding}
            aria-label="메시지 보내기"
            className="absolute bottom-2 right-2 flex size-10 items-center justify-center rounded-lg bg-[#4578fa] text-white transition hover:bg-[#3769e8] disabled:bg-[#ededed] disabled:text-[#1f242e]"
          >
            <SendHorizontal aria-hidden="true" className="size-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  )
}

function ChatBubble({ message, reportStatus }: { message: ChatMessage; reportStatus: ReportStatus }) {
  const isAi = message.role === 'ai'
  return (
    <div className={`flex items-start gap-3 ${isAi ? '' : 'justify-end'}`}>
      {isAi && (
        <div className="relative mt-2 size-8 shrink-0">
          <img
            src={reportStatus === 'before' ? '/figma/before-img-ai1.svg' : '/figma/after-img-ai0.svg'}
            alt=""
            className="size-full"
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#2e8f78]">AI</span>
        </div>
      )}
      <p
        className={`max-w-[82%] whitespace-pre-wrap rounded-[12px] border px-3 py-2.5 text-[12px] leading-[1.55] ${
          isAi
            ? 'border-[#e3e8f0] bg-[#fbfcfe] text-[#1f242e]'
            : 'border-[#bdd1ff] bg-[#e7f0ff] text-[#1f242e]'
        }`}
      >
        {message.content}
      </p>
    </div>
  )
}
