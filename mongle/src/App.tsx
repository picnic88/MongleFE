import { useState, useEffect, useRef } from "react";
import { Header } from "./component/Header";
import { Footer } from "./component/Footer";
import brand from "./assets/brandBear.png";
import reportImg from "./assets/report.png";

/**
 * Mongle 대시보드 – 1920px 기준 픽셀 단위 레이아웃
 * 원본 디자인 이미지(1590x1226)를 1920px 폭 기준으로 스케일링(x1.2075)하여
 * 모든 요소를 절대좌표(absolute)로 배치했습니다.
 */

const PAST_REPORTS = [
  { title: "첫 번째 수면 리포트", date: "2026.07.21", left: 161 },
  { title: "두 번째 수면 리포트", date: "2026.07.14", left: 610 },
  { title: "세 번째 수면 리포트", date: "2026.07.07", left: 1060 },
];

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1500;

export default function App() {
  const userName = "임세미";
  const sleepScore = 82;

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
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    // 화면 폭에 맞춰 1920px 디자인을 비율 그대로 축소/확대해서 보여주는 래퍼
    <div
      ref={wrapperRef}
      className="w-full overflow-hidden"
      style={{ height: DESIGN_HEIGHT * scale }}
    >
      <Header target="home" />
      {/* 1920px 고정 캔버스 (transform으로 화면 폭에 맞게 스케일링) */}
      <div
        className="min-h-[1404px] relative origin-top-left px-[130px]"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        {/* ===== 헤더 ===== */}

        <main className="mt-[100px]">
          {/**상단 컨텐츠 묶음 */}
          <div className="flex items-center justify-between leading-[66px]">

            <div className="">
              {/**인삿말 텍스트 + 이미지 */}
              <div className="mt-[16px] flex items-center justify-between gap-[100px]">
                {/* ===== 인사말 영역 ===== */}
                <div className="flex flex-col leading-[56px]">
                  <h1
                    className="absolute font-extrabold text-slate-900 text-[32px] "
                  >
                    안녕하세요 {userName} 님 !
                  </h1>
                  <br />
                  <h1
                    className="font-extrabold text-slate-900 text-[32px]"
                  >
                    수면은 충분히 이루어지고 있나요?
                  </h1>
                </div>
                <img src={brand} className="w-[164px] h-[164px]"
                />
              </div>
              {/**-----------인삿말 텍스트 및 이미지 */}
              <p
                className="mt-[114px] font-bold text-slate-800 text-[24px]"
              >
                수면 분석 리포트를 통해 최적화된 자신의 수면 환경을 알아봐요!
              </p>

              <button
                className="w-[415px] h-[64px] mt-[20px] rounded-lg bg-[#C9D6F5] font-semibold text-[18px] text-slate-800 hover:brightness-95 transition"
              >
                나만의 수면 리포트 받아보기
              </button>
            </div>

            {/* ===== 이번달 수면 점수 카드 ===== */}
            <div
              className="w-[490px] h-[490px] mt-[20px] rounded-[20px] border-[2px] border-[#E2E4EA] flex flex-col gap-[32px] justify-center items-center"
            >
              <h2
                className="w-full mt-[-50px] text-center font-extrabold text-slate-900 text-[30px]"
              >
                이번달 수면 점수
              </h2>
              <div
                className="w-[232px] h-[232px] rounded-full border-2 flex items-center justify-center border-[#CBD8F7]"
              >
                <span className="font-extrabold text-[28px] text-[#A9BCF0]">
                  {sleepScore}점
                </span>
              </div>
            </div>
          </div>

          {/* ===== 지난 수면 리포트 다시보기 ===== */}
          <div
            className="w-full h-[340px] mt-[100px] pt-[28px] pb-[38px] flex flex-col gap-[28px] rounded-[20px] "
          >
            <div className="flex items-center justify-between">
              <h2
                className="font-extrabold text-slate-900 text-[24px]"
              >
                지난 수면 리포트 다시보기
              </h2>
              <div className="flex items-center gap-[14px]  w-[100px]">
                <button
                  aria-label="이전"
                  className="w-[40px] h-[40px] rounded-full border-[2px] flex items-center justify-center text-slate-400 hover:bg-slate-50 border-[#E4E4E7]"
                >
                  ‹
                </button>
                <button
                  aria-label="다음"
                  className="w-[40px] h-[40px] rounded-full border-[2px] flex items-center justify-center text-slate-400 hover:bg-slate-50 border-[#E4E4E7]"
                >
                  ›
                </button>
              </div>
            </div>
            {/**리포트 리스트 */}
            <div className="flex gap-[28px]">
              {PAST_REPORTS.map((report) => (
                <div
                  key={report.title}
                  className={`w-[456px] h-[220px] px-[31px] flex items-center justify-between rounded-[14px] border-[2px] border-[#E4E4E7] `}
                >
                  <div>
                    <h3
                      className="text-[22px] font-bold text-slate-800"
                    >
                      {report.title}
                    </h3>
                    <p
                      className="text-[18px] text-slate-400"
                    >
                      {report.date}
                    </p>
                    <button
                      className="mt-[40px] w-[110px] h-[40px] bg-[#C9D6F5] text-[18px] rounded-md font-semibold text-slate-800 hover:brightness-95 transition"
                    >
                      다운로드
                    </button>
                  </div>
                  <img src={reportImg} className="w-[102px] h-[108px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </main>

      </div >
      {/* ===== 푸터 ===== */}
      < Footer />
    </div >
  );
}
