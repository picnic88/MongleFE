import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import html2pdf from "html2pdf.js";
import api from "../api/api";

interface SleepReportProps {
    reportId?: string | number | null;
    onReady?: () => void; // 데이터 로딩 완료 시 부모에 알림
}

export interface SleepReportHandle {
    downloadPDF: () => Promise<void>;
}

const SleepReport = forwardRef<SleepReportHandle, SleepReportProps>(
    ({ reportId, onReady }, ref) => {


        const [report, setReport] = useState<any>(null);
        const reportRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const fetchReport = async () => {
                try {
                    if (!reportId) {
                        console.error("reportId가 없습니다.");
                        return;
                    }

                    setReport(null);
                    console.log("가져올 reportId: ", reportId);


                    console.log(reportId);
                    const reportData = await api.get(`/report/${reportId}`);
                    setReport(reportData.data);
                } catch (error: any) {
                    console.error('리포트를 가져오지 못했습니다. ', error);
                    console.error("status:", error.response?.status);
                    console.error("data:", error.response?.data);

                }
            }
            fetchReport();
        }, [reportId]);

        useEffect(() => {
            if (report) onReady?.();
        }, [report]);


        useImperativeHandle(ref, () => ({
            downloadPDF: async () => {
                console.log("downloadPDF 실행", reportId);
                if (!reportRef.current) {
                    console.log("reportRef.current 없음");
                    return;
                }
                await document.fonts.ready; // 폰트 로딩 보장
                await html2pdf()
                    .set({
                        margin: 0,
                        filename: "AI_수면_분석_리포트.pdf",
                        image: { type: "jpeg", quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                    } as const)
                    .from(reportRef.current)
                    .save();

                console.log("PDF 저장 완료", reportId);
            },
        }));

        return (
            <div
                ref={reportRef}
                className="w-[210mm] min-h-[297mm] p-[20mm_18mm] box-border mx-auto flex flex-col items-center gap-[40px]">
                <div className="w-full flex flex-col items-start gap-[10px]">
                    <p className="w-full text-center text-2xl">AI 수면 분석 리포트 (예시)</p>
                    <p className="text-[14px]">분석 기간: 2026.06.20 ~ 2026.07.20 (30일)</p>
                </div>
                <div className="w-full flex flex-col gap-[40px]">
                    <div className="flex flex-col gap-[8px]">
                        <p className="text-xl">1. AI 종합 분석</p>
                        <p className="text-[15px]">
                            {report?.report_data.ai_summary?.text}
                        </p>
                    </div>
                    <div className="flex flex-col gap-[8px]">
                        <p className="text-xl">2. 핵심 지표</p>

                        {report && (
                            <table className="mt-[8px] text-[15px] w-[600px] ml-[30px] border-collapse border border-[#D1D5DB]">
                                <thead className="bg-[#5246D8] text-white">
                                    <tr>
                                        <th className="border border-[#D1D5DB] px-3 py-1 text-center">
                                            <div className="flex items-center justify-center">
                                                항목
                                            </div>
                                        </th>
                                        <th className="border border-[#D1D5DB] px-3 py-1 text-center">
                                            <div className="flex items-center justify-center">
                                                결과
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">수면 점수</div>
                                        </td>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">{report.report_data.key_metrics.sleep_score}점</div></td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">수면 만족도</div>
                                        </td>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">{report.report_data.key_metrics.sleep_satisfaction}점</div>
                                        </td>
                                    </tr>
                                    {/* <tr>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">평균 REM</div>
                                        </td>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">{report.report_data.key_metrics.average_rem}%</div>
                                        </td>
                                    </tr> */}
                                    <tr>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">평균 코골이</div>
                                        </td>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">{report.report_data.key_metrics.average_snoring}분</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">평균 온도</div>
                                        </td>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">{report.report_data.key_metrics.average_temperature}℃</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">평균 습도
                                            </div>
                                        </td>
                                        <td className="border border-[#D1D5DB] px-4 py-[4px] text-center">
                                            <div className="flex items-center justify-center">{report.report_data.key_metrics.average_humidity}%</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-[8px]">
                    <p className="text-xl">3. AI 패턴 분석</p>
                    <div className="mt-[8px] flex flex-col gap-[20px] text-[15px]">
                        {report?.report_data.pattern_analysis?.map(
                            (item: any, index: number) => (
                                <div key={index} className="flex flex-col gap-[5px]">
                                    <p className="tracking-tighter">
                                        • {item.condition} → {item.result}
                                    </p>

                                    <p className="tracking-tighter">
                                        AI 의견 : {item.description}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-[5px] w-full">
                    <p className="text-xl">4. 이상 패턴 탐지</p>
                    <table className="mt-[8px] text-[15px] w-[600px] ml-[30px] border-collapse border border-[#D1D5DB]">
                        <thead className="bg-[#5246D8] text-white">
                            <tr>
                                <th className="border border-[#D1D5DB] px-3 py-1 text-center">
                                    <div className="flex items-center justify-center">날짜</div>
                                </th>
                                <th className="border border-[#D1D5DB] px-3 py-1 text-center">
                                    <div className="flex items-center justify-center">관찰 내용</div>
                                </th>
                                <th className="border border-[#D1D5DB] px-3 py-1 text-center">
                                    <div className="flex items-center justify-center">AI 의견</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {report?.report_data.abnormal_patterns?.map(
                                (item: any, index: number) => (

                                    <tr key={index} className="tracking-tighter">
                                        <td className="border border-[#D1D5DB] px-4 py-1 text-center">
                                            <div className="flex items-center justify-center">{item.date}</div>
                                        </td>
                                        <td className="border border-[#D1D5DB] px-4 py-1 text-center">
                                            <div className="flex items-center justify-center">{item.observation}</div>
                                        </td>
                                        <td className="border border-[#D1D5DB] px-4 py-1 text-center">
                                            <div className="flex items-center justify-center">{item.opinion}</div>
                                        </td>
                                    </tr>

                                )
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-col gap-[5px] w-full">
                    <p className="text-xl">5. AI 개선 제안</p>
                    <div className="mt-[8px]">
                        {report?.report_data.improvement_suggestions?.map(
                            (item: string, index: number) => (
                                <p key={index} className="text-[15px] tracking-tighter">
                                    • {item}
                                </p>
                            )
                        )}
                    </div>
                </div>
            </div >
        )
    }
);

export default SleepReport;