import { useState, useEffect, useRef } from "react";
import { Header } from "../component/Header";
import { Footer } from "../component/Footer";
import brand from "../assets/brandBear.png";
import reportImg from "../assets/report.png";
import api from "../api/api";

const PAST_REPORTS = [
    { title: "첫 번째 수면 리포트", date: "2026.07.21", left: 161 },
    { title: "두 번째 수면 리포트", date: "2026.07.14", left: 610 },
    { title: "세 번째 수면 리포트", date: "2026.07.07", left: 1060 },
];

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1500;



export default function HomePage() {
    const [averageSleepScore, setAverageSleepScore] = useState(0);
    console.log("HomePage 실행");
    useEffect(() => {

        const getSleepInfo = async () => {
            console.log("useEffect 실행")
            try {
                console.log("getSleepInfo 실행")
                const userId = sessionStorage.getItem("user_id");

                const response = await api.get("/sleepinfo", {
                    params: {
                        id: userId,
                    }
                });

                const sleepInfos = response.data;
                const today = new Date();
                const MonthDaysAgo = new Date();
                MonthDaysAgo.setDate(today.getDate() - 30);
                // 최근 30일 수면 기록만 필터링
                const recentScores = sleepInfos
                    .filter((item: any) => {
                        const date = new Date(item.day);

                        return date >= MonthDaysAgo && date <= today;
                    })
                    .map((item: any) => item.sleep_score)
                    .filter((score: any) => typeof score === "number");


                if (recentScores.length === 0) {
                    setAverageSleepScore(0);
                    return;
                }

                const average =
                    recentScores.reduce(
                        (sum: number, score: number) => sum + score,
                        0
                    ) / recentScores.length;

                setAverageSleepScore(Math.round(average));

            } catch (error) {
                console.error("수면 점수를 불러오지 못함", error);
            }
        };

        getSleepInfo();
    }, []);

    const userName = "임세미";


    const wrapperRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            const containerWidth = wrapperRef.current
                ? wrapperRef.current.offsetWidth
                : window.innerWidth;

            setScale(containerWidth / DESIGN_WIDTH);
        };

        updateScale();

        window.addEventListener("resize", updateScale);

        return () => {
            window.removeEventListener("resize", updateScale);
        };
    }, []);

    return (
        <div
            ref={wrapperRef}
            className="w-full overflow-hidden bg-[#FFF]"
            style={{
                height: DESIGN_HEIGHT * scale,
                fontFamily: "Pretendard",
            }}
        >
            <Header target="home" />

            {/* 1920px 고정 캔버스 */}
            <div
                className="min-h-[1404px] relative origin-top-left px-[130px]"
                style={{
                    width: DESIGN_WIDTH,
                    height: DESIGN_HEIGHT,
                    transform: `scale(${scale})`,
                }}
            >
                <main className="mt-[140px]">

                    {/* ===== 상단 컨텐츠 ===== */}
                    <div className="flex items-center justify-between leading-[66px]">

                        <div>

                            {/* ===== 인삿말 ===== */}
                            <div className="mt-[16px] flex items-center justify-between gap-[100px]">

                                <div className="flex flex-col leading-[56px]">

                                    <h1
                                        className="
                                            absolute
                                            text-[#1F2937]
                                            text-[32px]
                                            tracking-tight
                                        "
                                        style={{
                                            fontFamily: "Pretendard",
                                            fontWeight: "600",
                                        }}
                                    >
                                        안녕하세요 {userName} 님!
                                    </h1>

                                    <br />

                                    <h1
                                        className="
                                            text-[#1F2937]
                                            text-[32px]
                                            tracking-tight
                                        "
                                        style={{
                                            fontFamily: "Pretendard",
                                            fontWeight: "600",
                                        }}
                                    >
                                        수면은 충분히 이루어지고 있나요?
                                    </h1>

                                </div>

                                <img
                                    src={brand}
                                    className="w-[164px] h-[164px]"
                                />
                            </div>

                            {/* ===== 설명 ===== */}
                            <p
                                className="
                                    mt-[80px]
                                    text-[#4B5563]
                                    text-[26px]
                                "
                                style={{
                                    fontFamily: "Pretendard",
                                    fontWeight: "600",
                                }}
                            >
                                수면 분석 리포트를 통해 최적화된 자신의 수면 환경을 알아봐요!
                            </p>

                            {/* ===== 새 리포트 버튼 ===== */}
                            <div
                                className="
                                    cursor-pointer
                                    w-[455px]
                                    h-[74px]
                                    mt-[20px]
                                    rounded-[10px]
                                    bg-[#C9D6F5]
                                    flex
                                    items-center
                                    justify-center
                                    text-[22px]
                                    text-[#273A67]
                                    transition-all
                                    hover:bg-[#B9C9ED]
                                    hover:text-[#1F3159]
                                    active:bg-[#AFC1E8]
                                "
                                style={{
                                    fontFamily: "Pretendard",
                                    fontWeight: "600",
                                }}
                            >
                                나만의 수면 리포트 받아보기
                            </div>
                        </div>

                        {/* ===== 이번달 수면 점수 카드 ===== */}
                        <div
                            className="
                                w-[490px]
                                h-[490px]
                                mt-[20px]
                                rounded-[20px]
                                border-2
                                border-[#DCE3EF]
                                bg-white
                                flex
                                flex-col
                                gap-[26px]
                                justify-center
                                items-center
                                shadow-[0_4px_20px_rgba(39,58,103,0.04)]
                            "
                        >
                            <h2
                                className="
                                    w-full
                                    text-center
                                    text-[#273A67]
                                    text-[26px]
                                "
                                style={{
                                    fontFamily: "Pretendard",
                                    fontWeight: "600",
                                }}
                            >
                                이번달 수면 점수
                            </h2>

                            {/* 점수 원 */}
                            <div
                                className="
                                    w-[232px]
                                    h-[232px]
                                    rounded-full
                                    border-[7px]
                                    border-[#C9D6F5]
                                    bg-[#F7F9FD]
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <span
                                    className="
                                        text-[30px]
                                        font-bold
                                        text-[#526A9D]
                                    "
                                >
                                    {averageSleepScore !== 0
                                        ? `${averageSleepScore} 점`
                                        : "로딩 중..."}
                                </span>
                            </div>

                            <p className="text-[16px] text-[#8A94A6] mt-[-10px]">
                                이번 달 수면 상태를 확인해보세요
                            </p>
                        </div>
                    </div>

                    {/* ===== 지난 수면 리포트 ===== */}
                    <div
                        className="
                            w-full
                            h-[340px]
                            mt-[100px]
                            pt-[28px]
                            pb-[38px]
                            flex
                            flex-col
                            gap-[28px]
                            rounded-[20px]
                        "
                    >

                        {/* 제목 + 화살표 */}
                        <div className="flex items-center justify-between">

                            <h2
                                className="
                                    text-[#273A67]
                                    text-[26px]
                                "
                                style={{
                                    fontFamily: "Pretendard",
                                    fontWeight: "600",
                                }}
                            >
                                지난 수면 리포트 다시보기
                            </h2>

                            <div className="flex items-center gap-[14px] w-[120px]">

                                <button
                                    aria-label="이전"
                                    className="
                                        w-[50px]
                                        h-[50px]
                                        rounded-full
                                        border-2
                                        border-[#DCE3EF]
                                        bg-white
                                        flex
                                        items-center
                                        justify-center
                                        text-[#7D8BA3]
                                        text-[25px]
                                        cursor-pointer
                                        transition
                                        hover:bg-[#F0F4FB]
                                        hover:border-[#C9D6F5]
                                        hover:text-[#273A67]
                                    "
                                >
                                    ‹
                                </button>

                                <button
                                    aria-label="다음"
                                    className="
                                        w-[50px]
                                        h-[50px]
                                        rounded-full
                                        border-2
                                        border-[#DCE3EF]
                                        bg-white
                                        flex
                                        items-center
                                        justify-center
                                        text-[#7D8BA3]
                                        text-[25px]
                                        cursor-pointer
                                        transition
                                        hover:bg-[#F0F4FB]
                                        hover:border-[#C9D6F5]
                                        hover:text-[#273A67]
                                    "
                                >
                                    ›
                                </button>

                            </div>
                        </div>

                        {/* ===== 리포트 리스트 ===== */}
                        <div className="flex gap-[28px]">

                            {PAST_REPORTS.map((report) => (
                                <div
                                    key={report.title}
                                    className="
                                        w-[456px]
                                        h-[220px]
                                        px-[31px]
                                        flex
                                        items-center
                                        justify-between
                                        rounded-[14px]
                                        border-2
                                        border-[#DCE3EF]
                                        bg-white
                                        shadow-[0_3px_15px_rgba(39,58,103,0.03)]
                                        transition
                                        hover:border-[#C9D6F5]
                                    "
                                >

                                    <div>

                                        <h3
                                            className="
                                                text-[24px]
                                                text-[#27313F]
                                            "
                                            style={{
                                                fontFamily: "Pretendard",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {report.title}
                                        </h3>

                                        <p
                                            className="
                                                text-[17px]
                                                text-[#8A94A6]
                                            "
                                            style={{
                                                fontFamily: "Pretendard",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {report.date}
                                        </p>

                                        <button
                                            type="button"
                                            className="
                                                mt-[40px]
                                                w-[180px]
                                                h-[50px]
                                                bg-[#C9D6F5]
                                                text-[17px]
                                                text-[#273A67]
                                                rounded-[8px]
                                                cursor-pointer
                                                transition
                                                hover:bg-[#B9C9ED]
                                                hover:text-[#1F3159]
                                                active:bg-[#AFC1E8]
                                            "
                                            style={{
                                                fontFamily: "Pretendard",
                                                fontWeight: "600",
                                            }}
                                        >
                                            다운로드
                                        </button>

                                    </div>

                                    <img
                                        src={reportImg}
                                        className="w-[102px] h-[108px]"
                                    />

                                </div>
                            ))}

                        </div>
                    </div>
                </main>
            </div>

            {/* ===== 푸터 ===== */}
            <Footer />
        </div>
    );
}