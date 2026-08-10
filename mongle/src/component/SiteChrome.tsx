export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-[79px] border-b border-[#e3e8f0] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1840px] items-center px-5 sm:px-8 3xl:px-0">
        <a href="/" className="flex shrink-0 items-center gap-4 text-[#1f242e] no-underline">
          <span className="flex size-12 items-center justify-center overflow-hidden rounded-md bg-[#edf3ff]">
            <img src="/mongle-logo.png" alt="" className="size-11 object-contain" />
          </span>
          <span className="text-[27px] font-bold leading-none sm:text-[31px]">Mongle</span>
        </a>

        <nav aria-label="주요 메뉴" className="ml-12 hidden h-full items-center gap-10 md:flex xl:ml-24">
          <a href="#home" className="flex h-full items-center text-[16px] font-medium text-[#1f242e] no-underline">
            홈
          </a>
          <a
            href="/?report=before"
            aria-current="page"
            className="relative flex h-full items-center text-[16px] font-bold text-[#4578fa] no-underline after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-[#4578fa]"
          >
            AI와 상담하기
          </a>
          <a href="#content" className="flex h-full items-center text-[16px] font-medium text-[#1f242e] no-underline">
            잠 잘오는 콘텐츠 추천
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <img src="/figma/after-img.svg" alt="" className="size-[38px] shrink-0" />
          <span className="hidden text-[15px] font-medium text-[#1f242e] sm:inline">서정환 님</span>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-6 border-t border-[#e3e8f0] bg-white">
      <div className="mx-auto flex h-[78px] max-w-[1840px] items-center gap-3 px-5 sm:px-8 3xl:px-0">
        <span className="flex size-[34px] items-center justify-center overflow-hidden rounded bg-[#edf3ff]">
          <img src="/mongle-logo.png" alt="" className="size-8 object-contain" />
        </span>
        <span className="text-lg font-bold">Mongle</span>
      </div>
    </footer>
  )
}
