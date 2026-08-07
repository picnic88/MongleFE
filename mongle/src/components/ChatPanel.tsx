import { Info, Minus, SendHorizontal } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReportStatus } from '../types/report'

type ChatMessage = {
  id: string
  role: 'ai' | 'user'
  lines: string[]
}

type ChatPanelProps = {
  reportStatus: ReportStatus
}

const beforeMessages: ChatMessage[] = [
  {
    id: 'before-1',
    role: 'ai',
    lines: [
      '안녕하세요! 이달의 수면 리포트를 생성하면',
      '더 정확한 상담이 가능해요.',
      '먼저 리포트를 생성해볼까요?',
    ],
  },
  {
    id: 'before-2',
    role: 'ai',
    lines: [
      '리포트 생성 전에도 수면 습관이나',
      '환경에 대해 질문할 수 있어요.',
      '무엇이든 편하게 물어보세요!',
    ],
  },
]

const afterMessages: ChatMessage[] = [
  {
    id: 'after-1',
    role: 'ai',
    lines: ['안녕하세요! 저는 몽글 AI 수면 코치입니다.', '오늘의 수면 리포트를 바탕으로 도와드릴게요.'],
  },
  { id: 'after-2', role: 'user', lines: ['제 수면 점수는 어떻게 나오나요?'] },
  {
    id: 'after-3',
    role: 'ai',
    lines: ['오늘의 AI 수면 점수는 82점으로 양호 수준이에요.', '최근 7일 평균보다 3점 상승했어요!'],
  },
  { id: 'after-4', role: 'user', lines: ['코골이 시간이 많은 편인가요?'] },
  {
    id: 'after-5',
    role: 'ai',
    lines: ['오늘 평균 코골이 시간은 18분으로 보통 수준이에요.', '40분 이상인 날은 수면 점수가 낮아지는 경향이 있어요.'],
  },
  { id: 'after-6', role: 'user', lines: ['습도는 적정한가요?'] },
  {
    id: 'after-7',
    role: 'ai',
    lines: ['오늘 평균 습도는 53%로 적정 범위(40~60%)를', '잘 유지하고 있어요.'],
  },
  { id: 'after-8', role: 'user', lines: ['REM 비율을 높이려면 어떻게 해야 하나요?'] },
  {
    id: 'after-9',
    role: 'ai',
    lines: [
      'REM 비율을 높이려면 아래를 실천해보세요.',
      '• 취침 전 2시간 전 무거운 식사 피하기',
      '• 규칙적인 운동과 일정한 취침 시간 유지',
      '• 스트레스 관리하기',
    ],
  },
]

const beforeQuestions = [
  '리포트는 어떻게 생성되나요?',
  '수면 점수는 무엇으로 계산되나요?',
  '코골이 데이터는 어떻게 반영되나요?',
  'REM 비율은 왜 중요한가요?',
]

const afterQuestions = [
  '수면 점수는 어떻게 계산되나요?',
  '온도와 습도는 어떻게 관리해야 하나요?',
  '코골이를 줄이는 방법이 있을까요?',
  'REM 비율이 낮으면 어떤 영향이 있나요?',
]

export function ChatPanel({ reportStatus }: ChatPanelProps) {
  const initialMessages = reportStatus === 'before' ? beforeMessages : afterMessages
  const questions = reportStatus === 'before' ? beforeQuestions : afterQuestions
  const [draft, setDraft] = useState('')
  const [sentMessages, setSentMessages] = useState<ChatMessage[]>([])
  const messageListRef = useRef<HTMLDivElement>(null)

  const messages = useMemo(
    () => [...initialMessages, ...sentMessages],
    [initialMessages, sentMessages],
  )

  useLayoutEffect(() => {
    const messageList = messageListRef.current
    if (messageList) messageList.scrollTop = messageList.scrollHeight
  }, [messages.length])

  const sendMessage = () => {
    const message = draft.trim()
    if (!message) return
    setSentMessages((current) => [
      ...current,
      { id: `sent-${Date.now()}`, role: 'user', lines: [message] },
    ])
    setDraft('')
  }

  return (
    <section className="flex h-full min-h-[700px] flex-col overflow-hidden rounded-[18px] border border-[#e3e8f0] bg-white shadow-[0_4px_14px_rgba(31,46,77,0.06)]">
      <header className="px-7 pt-4">
        <div className="flex items-center">
          <h2 className="text-[20px] font-bold sm:text-[21px]">AI와 상담하기</h2>
          <div className="ml-auto flex items-center gap-2 text-[#616978]">
            <button type="button" aria-label="상담 안내" className="flex size-7 items-center justify-center rounded-full hover:bg-[#f3f6fb]">
              <Info aria-hidden="true" className="size-4" strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="상담창 최소화" className="flex size-7 items-center justify-center rounded-full hover:bg-[#f3f6fb]">
              <Minus aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 border-b border-[#e3e8f0] pb-3">
          <div className="relative size-12 shrink-0">
            <img
              src={reportStatus === 'before' ? '/figma/before-img-ai.svg' : '/figma/after-img-ai.svg'}
              alt=""
              className="size-full"
            />
            <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold text-white">AI</span>
          </div>
          <div>
            <h3 className="text-[15px] font-bold">AI 수면 코치</h3>
            <p className="mt-0.5 text-[12px] text-[#616978]">수면에 대한 궁금한 점을 물어보세요.</p>
          </div>
        </div>
      </header>

      <div
        ref={messageListRef}
        data-testid="chat-message-list"
        aria-live="polite"
        className="min-h-[260px] flex-1 overflow-y-auto px-7 py-5"
      >
        <div className="space-y-5">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} reportStatus={reportStatus} />
          ))}
        </div>
      </div>

      <div className="border-t border-transparent px-7 pb-7 pt-3">
        {sentMessages.length === 0 && (
          <div data-testid="recommended-questions">
            <h3 className="text-[14px] font-bold">추천 질문</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 min-[1500px]:grid-cols-2">
              {questions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => setDraft(question)}
                  className="min-h-10 rounded-full border border-[#bdd1ff] bg-white px-3 py-2 text-[12px] font-medium leading-5 text-[#4578fa] transition hover:bg-[#f4f7ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4578fa]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`relative rounded-xl border border-[#e3e8f0] bg-white px-4 pb-3 pt-3 focus-within:border-[#8eaeff] ${sentMessages.length === 0 ? 'mt-4' : ''}`}>
          <textarea
            value={draft}
            maxLength={500}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                sendMessage()
              }
            }}
            placeholder="메시지를 입력하세요..."
            aria-label="AI 상담 메시지"
            className="h-[43px] w-[calc(100%-58px)] resize-none border-0 bg-transparent p-0 text-[14px] leading-5 text-[#1f242e] outline-none placeholder:text-[#8c94a3]"
          />
          <span className="block text-[12px] text-[#8c94a3]">{draft.length}/500</span>
          <button
            type="button"
            onClick={sendMessage}
            disabled={!draft.trim()}
            aria-label="메시지 보내기"
            className="absolute bottom-3 right-3 flex size-11 items-center justify-center rounded-[10px] bg-[#4578fa] text-white transition hover:bg-[#3769e8] disabled:bg-[#ededed] disabled:text-[#1f242e]"
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
    <div className={`flex items-start gap-4 ${isAi ? '' : 'justify-end'}`}>
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
      <div
        className={`max-w-[78%] rounded-[14px] border px-4 py-3 text-[13px] leading-5 ${
          isAi
            ? 'border-[#e3e8f0] bg-[#fbfcfe] text-[#1f242e]'
            : 'border-[#bdd1ff] bg-[#e7f0ff] text-[#1f242e]'
        }`}
      >
        {message.lines.map((line) => (
          <p key={line} className="whitespace-pre-wrap">{line}</p>
        ))}
      </div>
    </div>
  )
}
