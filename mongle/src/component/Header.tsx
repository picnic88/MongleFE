import { useState } from "react";
import { useNavigate } from "react-router-dom";
export function Header(props: { target: string }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isHovered1, setIsHovered1] = useState(false);
    const [isHovered2, setIsHovered2] = useState(false);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(
        () => sessionStorage.getItem("isLoggedIn") === "true"
    )
    const handleAuthClick = () => {
        if (isLoggedIn) {
            sessionStorage.removeItem("isLoggedIn");
            setIsLoggedIn(false);
            navigate("/");
            return;
        }

        navigate("/login");
    };
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
                        className={`cursor-pointer hover:font-bold hover:text-[15px] hover:text-black text-[14px] ${props.target == "home" ? "font-semibold text-slate-900" : "font-normal text-[#CBD0D8]"} `}
                        onMouseOver={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{ fontFamily: 'Pretendard', fontWeight: isHovered ? '700' : '500', }}>

                        홈
                    </button>
                    <button
                        type="button"
                        className={`cursor-pointer hover:font-bold hover:text-black hover:text-[15px] text-[14px] ${props.target == "ai" ? "font-semibold text-slate-900" : "font-normal text-[#CBD0D8]"}`}
                        onClick={() => window.location.assign('/aiConsult')}
                        onMouseOver={() => setIsHovered1(true)}
                        onMouseLeave={() => setIsHovered1(false)}
                        style={{ fontFamily: 'Pretendard', fontWeight: isHovered1 ? '700' : '500', }}
                    >
                        ai와 상담하기
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.assign('/SleepContent')}
                        className={`cursor-pointer hover:font-bold hover:text-black hover:text-[15px] text-[14px] ${props.target == "sleep" ? "font-semibold text-slate-900" : "font-normal text-[#CBD0D8]"}`}
                        onMouseOver={() => setIsHovered2(true)}
                        onMouseLeave={() => setIsHovered2(false)}
                        style={{ fontFamily: 'Pretendard', fontWeight: isHovered2 ? '700' : '500', }}
                    >
                        잠 잘오는 컨텐츠 추천
                    </button>
                </div>
                <div className="ml-auto mr-[96px]">
                    <button type="button" onClick={handleAuthClick}>
                        {isLoggedIn ? "로그아웃" : "로그인"}
                    </button>
                </div>
            </div>
        </>
    )
}
