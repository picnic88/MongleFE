import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "../component/Header";
import { Footer } from "../component/Footer";
import brand from "../assets/brandBear.png";
import reportImg from "../assets/report.png";
import api from "../api/api";
import { GoogleGenAI } from "@google/genai";
import SleepReport, { type SleepReportHandle } from "./SleepReport";


const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1500;

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });


export default function HomePage() {
    const hiddenReportRef = useRef<SleepReportHandle>(null);
    const [recentReportId, setRecentReportId] = useState<number | null>(null);

    //리포트 생성
    let [recentSleepInfos, setRecentSlseepInfos] = useState<any[]>([]);
    const [aiReportResponse, setAiReportResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const callGemini = async (userInput: string) => {
        //30일간의 데이터 추출
        const userId = sessionStorage.getItem("user_id");
        const sleepInfoResponse = await api.get('/sleepinfo', {
            params: {
                id: userId,
            }
        })
        const sleepInfo = sleepInfoResponse.data;
        const today = new Date();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const filteredSleepInfos = sleepInfo.filter((item: any) => {
            const data = new Date(item.day);
            return data >= thirtyDaysAgo && data <= today;
        })

        setRecentSlseepInfos(filteredSleepInfos);


        console.log("api 호출 시작");
        setLoading(true);
        try {
            const result = await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: `
다음은 사용자의 최근 30일 수면 데이터입니다.

${JSON.stringify(filteredSleepInfos, null, 2)}

이 데이터를 분석하여 수면 분석 리포트를 작성해주세요.

반드시 아래 JSON 구조를 따라주세요.

{
    "ai_summary": {
        "text": "",
        "sleep_score": 0,
        "evaluation": ""
    },
    "key_metrics": {
        "sleep_score": 0,
        "sleep_satisfaction": 0,
        "average_rem": 0,
        "average_snoring": 0,
        "average_temperature": 0,
        "average_humidity": 0
    },
    "pattern_analysis": [
        {
            "condition": "",
            "result": "",
            "description": ""
        }
    ],
    "abnormal_patterns": [
        {
            "date": "",
            "observation": "",
            "opinion": ""
        }
    ],
    "improvement_suggestions": [
        ""
    ]
}

반드시 JSON 객체 하나만 출력하세요.
마크다운 코드블록을 사용하지 마세요.
JSON 외의 설명이나 문장을 출력하지 마세요.
`,
            });

            const aiResponse = result.text ?? "";
            const cleanResponse = aiResponse
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
            setAiReportResponse(cleanResponse);
            console.log("api 호출 성공");
            // console.log("Gemini 전체 응답:", result);
            // console.log("Gemini 텍스트:", result.text);

            //ai로 리포트 내용 생성
            console.log("aiResponse:", cleanResponse);
            const reportData = JSON.parse(cleanResponse);
            setAiReportResponse(cleanResponse);



            console.log("reportData:", reportData);
            console.log("reportData type:", typeof reportData);
            console.log("userId:", userId);

            //리포트 저장
            await api.post('/report', reportData, {
                params: {
                    user_id: userId,
                }
            })

            const latest_reportId = await api.get(`/report/latest/${userId}`)
            const reportId = latest_reportId.data.id;
            setRecentReportId(reportId);
        }
        catch (err) {
            console.error("Error calling Gemini API:", err);
            console.log("api 호출 실패");
        } finally {
            setLoading(false);
        }
    }


    const isDownloadingRef = useRef(false);
    const handleReportReady = useCallback(async () => {
        console.log("handleReportReady 호출");
        if (isDownloadingRef.current) {
            console.log("이미 다운로드 중");
            return;
        }

        isDownloadingRef.current = true;

        try {
            console.log("PDF 다운로드 실행");

            await hiddenReportRef.current?.downloadPDF();
        } finally {
            setRecentReportId(null);
            setDownloadReportId(null);
            isDownloadingRef.current = false;
        }
    }, []);

    const handlePastReportDownload = (reportId: number) => {
        setDownloadReportId(reportId);
    };


    const [averageSleepScore, setAverageSleepScore] = useState(0);
    // console.log("HomePage 실행");
    useEffect(() => {

        const getSleepInfo = async () => {
            // console.log("useEffect 실행")
            try {
                // console.log("getSleepInfo 실행")
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

    const [nickname, setNickname] = useState(null);
    const userName = async () => {
        const userId = sessionStorage.getItem("user_id");
        const nickname = await api.get(`/profile/${userId}`);
        console.log(nickname);
        setNickname(nickname.data.name);
    };
    useEffect(() => {
        userName();
    }, []);


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

    const [pastReports, setPastReports] = useState<any[]>([]);
    const [downloadReportId, setDownloadReportId] = useState<number | null>(null);
    useEffect(() => {
        const pastReport = async () => {
            const userId = sessionStorage.getItem("user_id");
            try {
                const response = await api.get(`/report/user/${userId}`);
                console.log("조회 성공");
                setPastReports(response.data);
            } catch (error) {
                console.log(error);
            }
        }
        pastReport();
    }, [])
    const [currentPage, setCurrentPage] = useState(0);
    const REPORTS_PER_PAGE = 4;
    const reversedReports = [...pastReports];
    const startIndex = currentPage * REPORTS_PER_PAGE;

    const visibleReports = reversedReports.slice(
        startIndex,
        startIndex + REPORTS_PER_PAGE
    );
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
                                        안녕하세요 {nickname} 님!
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
                                onClick={() => {
                                    callGemini("");
                                    alert("수면 리포트 생성 버튼 클릭")
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
                                    onClick={() => {
                                        setCurrentPage((prev) => Math.max(prev - 1, 0));
                                    }}
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
                                    onClick={() => {
                                        setCurrentPage((prev) => {
                                            const nextPage = prev + 1;
                                            if (nextPage >= Math.ceil(pastReports.length / REPORTS_PER_PAGE)) {
                                                return prev;
                                            }
                                            return nextPage;
                                        })
                                    }}
                                >
                                    ›
                                </button>

                            </div>
                        </div>

                        {/* ===== 리포트 리스트 ===== */}
                        <div className="flex gap-[28px]">

                            {visibleReports.map((report) => (
                                <div
                                    key={report.id}
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
                                            {report.id}번째 리포트
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
                                            {report.created_at.slice(0, 10)}
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
                                            onClick={() => handlePastReportDownload(report.id)}
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
            {(recentReportId || downloadReportId) && (
                <div style={{ position: "fixed", top: 0, left: "-99999px" }}>
                    <SleepReport
                        key={recentReportId || downloadReportId}
                        ref={hiddenReportRef}
                        reportId={recentReportId || downloadReportId!}
                        onReady={handleReportReady}
                    />
                </div>
            )}
            {/* ===== 푸터 ===== */}
            <Footer />
        </div>
    );
}