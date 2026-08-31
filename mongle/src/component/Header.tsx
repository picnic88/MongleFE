import { House, LogIn, LogOut, MessageCircle, MoonStar } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type HeaderProps = {
  target: string
}

const menuItems = [
  { target: 'home', label: '홈', path: '/', icon: House },
  { target: 'ai', label: 'AI와 상담하기', path: '/aiConsult?report=before', icon: MessageCircle },
  { target: 'sleep', label: '잠 잘오는 콘텐츠 추천', path: '/sleepContent', icon: MoonStar },
]

export function Header({ target }: HeaderProps) {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(() => (
    Boolean(localStorage.getItem('accessToken'))
    || sessionStorage.getItem('isLoggedIn') === 'true'
  ))

  const handleAuthClick = () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('isLoggedIn')
    setIsLoggedIn(false)
    navigate('/')
  }

  const AuthIcon = isLoggedIn ? LogOut : LogIn
  const authLabel = isLoggedIn ? '로그아웃' : '로그인'

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[77px] border-b-[1.5px] border-[#eaeaed] bg-white">
      <div className="mx-auto flex h-full w-full max-w-[1840px] items-center px-4 sm:px-6 lg:px-24">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="shrink-0 text-[22px] font-extrabold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4578fa]"
        >
          Mongle
        </button>

        <nav aria-label="주요 메뉴" className="ml-auto flex items-center gap-1 sm:ml-16 sm:gap-7 lg:ml-[180px] lg:gap-[60px]">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = target === item.target
            return (
              <button
                type="button"
                key={item.target}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                title={item.label}
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-[14px] transition hover:bg-[#f4f7fb] hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4578fa] sm:h-10 sm:w-auto sm:px-1 ${isActive ? 'font-semibold text-slate-900' : 'font-medium text-[#aeb5c0]'}`}
              >
                <Icon aria-hidden="true" className="size-5 sm:hidden" strokeWidth={1.8} />
                <span className="hidden whitespace-nowrap sm:inline">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={handleAuthClick}
          aria-label={authLabel}
          title={authLabel}
          className="ml-1 flex size-10 shrink-0 items-center justify-center rounded-lg text-[14px] font-medium text-[#616978] transition hover:bg-[#f4f7fb] hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4578fa] sm:ml-auto sm:h-10 sm:w-auto sm:px-2"
        >
          <AuthIcon aria-hidden="true" className="size-5 sm:hidden" strokeWidth={1.8} />
          <span className="hidden whitespace-nowrap sm:inline">{authLabel}</span>
        </button>
      </div>
    </header>
  )
}
