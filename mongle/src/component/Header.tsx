export function Header(props: { target: string }) {
    return (
        <>
            <div
                className="fixed top-0 w-full h-[77px] border-b-[1.5px] border-[#EAEAED]
                flex items-center pl-[96px] bg-white z-50"
            >
                <div
                    className="absolute font-extrabold tracking-tight text-slate-900 text-[22px]"
                >
                    Mongle

                </div>
                <div className="ml-[180px] flex gap-[60px]">
                    <button
                        type="button"
                        onClick={() => window.location.assign('/')}
                        className={`cursor-pointer hover:font-bold hover:text-[15px] hover:text-black text-[14px] ${props.target == "home" ? "font-semibold text-slate-900" : "font-normal text-[#CBD0D8]"} `}>
                        홈
                    </button>
                    <button
                        type="button"
                        className={`cursor-pointer hover:font-bold hover:text-black hover:text-[15px] text-[14px] ${props.target == "ai" ? "font-semibold text-slate-900" : "font-normal text-[#CBD0D8]"}`}
                        onClick={() => window.location.assign('/ai?report=before')}
                    >
                        ai와 상담하기
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.assign('/sleep-content')}
                        className={`cursor-pointer hover:font-bold hover:text-black hover:text-[15px] text-[14px] ${props.target == "sleep" ? "font-semibold text-slate-900" : "font-normal text-[#CBD0D8]"}`}
                    >
                        잠 잘오는 컨텐츠 추천
                    </button>
                </div>
            </div>
        </>
    )
}
