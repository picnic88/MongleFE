import { useMemo, useState } from "react";
import { Header } from "../component/Header";
import { Footer } from "../component/Footer";

/**
 * 잠 잘오는 컨텐츠 추천 페이지
 *
 * - 기본 12개 슬롯으로 시작, 4열 그리드로 무한히 추가 가능
 * - '나만의 꿀잠템 공유하기' → 유튜브 링크 등록 팝업
 *   → oEmbed API로 제목/썸네일 자동 추출 → 회색 박스 자리에 꽉 채워서 표시
 * - 카드를 클릭하면 조회수 +1, 실제 영상은 새 탭에서 재생
 * - 조회수 상위 3개를 1/2/3위로 상단에 노출
 */

// ---------------- 타입 ----------------
type VideoItem = {
    id: string;
    videoId: string | null; // 유튜브 videoId (등록 전 placeholder는 null)
    url: string | null;
    title: string;
    thumbnail: string | null;
    views: number;
};

// ---------------- 유튜브 유틸 ----------------
function extractYoutubeId(rawUrl: string): string | null {
    try {
        const url = new URL(rawUrl.trim());
        const host = url.hostname.replace("www.", "");

        if (host === "youtu.be") {
            return url.pathname.slice(1) || null;
        }
        if (host === "youtube.com" || host === "m.youtube.com") {
            if (url.pathname === "/watch") return url.searchParams.get("v");
            if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1];
            if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/shorts/")[1];
        }
        return null;
    } catch {
        return null;
    }
}

async function fetchYoutubeInfo(videoId: string): Promise<{ title: string; thumbnail: string }> {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`
    )}&format=json`;

    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error("영상 정보를 가져오지 못했어요. 링크를 다시 확인해주세요.");
    const data = await res.json();
    return {
        title: data.title as string,
        // hqdefault가 항상 존재하므로 안정적으로 사용 (maxresdefault는 없는 영상도 있음)
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
}

// ---------------- 기본 12개 슬롯 ----------------
function createDefaultVideos(): VideoItem[] {
    return Array.from({ length: 12 }, (_, i) => ({
        id: `default-${i}`,
        videoId: null,
        url: null,
        title: "컨텐츠 제목",
        thumbnail: null,
        views: 0,
    }));
}

// ---------------- 썸네일 박스 (공용) ----------------
function ThumbnailBox({
    item,
    width,
    height,
}: {
    item: VideoItem;
    width: number;
    height: number;
}) {
    return (
        <div
            className="rounded-md bg-[#D9D9D9] overflow-hidden flex items-center justify-center"
            style={{ width, height }}
        >
            {item.thumbnail ? (
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="text-slate-400 text-sm">영상을 등록해주세요</span>
            )}
        </div>
    );
}

// ---------------- 상단 랭킹 카드 ----------------
const RANK_COLORS = ["#FFC94D", "#C7CBD1", "#D79A66"]; // 금/은/동

function RankedCard({
    item,
    rank,
    onClick,
}: {
    item: VideoItem;
    rank: number;
    onClick: () => void;
}) {
    return (
        <button onClick={onClick} className="relative w-[360px] text-left">
            <div
                className="absolute -top-[18px] -left-[18px] w-[42px] h-[42px] rounded-full border-1 border-slate-800 z-10 flex items-center justify-center font-extrabold text-slate-900"
                style={{ backgroundColor: RANK_COLORS[rank - 1] }}
            >
                {rank}
            </div>
            <ThumbnailBox item={item} width={360} height={176} />
            <p className="mt-[16px] text-[17px] text-slate-700 truncate">{item.title}</p>
            <p className="text-[13px] text-slate-400">조회수 {item.views.toLocaleString()}회</p>
        </button>
    );
}

// ---------------- 일반 그리드 카드 ----------------
function GridCard({ item, onClick }: { item: VideoItem; onClick: () => void }) {
    return (
        <button onClick={onClick} className="w-[280px] text-left">
            <ThumbnailBox item={item} width={280} height={166} />
            <p className="mt-[16px] text-[17px] text-slate-700 truncate">{item.title}</p>
            <p className="text-[13px] text-slate-400">조회수 {item.views.toLocaleString()}회</p>
        </button>
    );
}

// ---------------- 유튜브 등록 팝업 ----------------
function AddVideoModal({
    onClose,
    onSubmit,
}: {
    onClose: () => void;
    onSubmit: (url: string) => Promise<void>;
}) {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        const videoId = extractYoutubeId(value);
        if (!videoId) {
            setError("올바른 유튜브 링크를 입력해주세요.");
            return;
        }
        setLoading(true);
        try {
            await onSubmit(value.trim());
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : "등록 중 오류가 발생했어요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="w-[480px] bg-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-[20px] font-extrabold text-slate-900">나만의 꿀잠템 공유하기</h3>
                <p className="mt-[8px] text-[14px] text-slate-400">
                    유튜브 영상 링크를 붙여넣으면 제목과 썸네일이 자동으로 등록돼요.
                </p>

                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="mt-[24px] w-full h-[48px] px-4 border border-slate-200 rounded-lg text-[15px] outline-none focus:border-[#A9BCF0]"
                />

                {error && <p className="mt-[8px] text-[13px] text-red-500">{error}</p>}

                <div className="mt-[28px] flex justify-end gap-[12px]">
                    <button
                        onClick={onClose}
                        className="w-[120px] h-[44px] rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-[120px] h-[44px] rounded-lg bg-[#C9D6F5] font-semibold text-slate-800 hover:brightness-95 transition disabled:opacity-60"
                    >
                        {loading ? "등록 중..." : "등록하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------------- 메인 페이지 ----------------
export default function SleepContentPage() {
    const [videos, setVideos] = useState<VideoItem[]>(createDefaultVideos());
    const [isModalOpen, setModalOpen] = useState(false);

    const topThree = useMemo(
        () => [...videos].sort((a, b) => b.views - a.views).slice(0, 3),
        [videos]
    );

    const handleAddVideo = async (url: string) => {
        const videoId = extractYoutubeId(url);
        if (!videoId) throw new Error("올바른 유튜브 링크를 입력해주세요.");

        const info = await fetchYoutubeInfo(videoId);

        const newItem: VideoItem = {
            id: `${videoId}-${Date.now()}`,
            videoId,
            url,
            title: info.title,
            thumbnail: info.thumbnail,
            views: 0,
        };

        // 등록된 영상은 리스트 맨 앞에 추가 (그리드는 4열, 개수 제한 없음)
        setVideos((prev) => [newItem, ...prev]);
    };

    const handleCardClick = (id: string) => {
        setVideos((prev) =>
            prev.map((v) => (v.id === id ? { ...v, views: v.views + 1 } : v))
        );
        const target = videos.find((v) => v.id === id);
        if (target?.url) {
            window.open(target.url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className="w-full min-h-screen bg-white">
            <Header target="sleep" />

            <main className="px-[130px] mt-[110px]">
                {/* ===== 이달의 꿀잠템 (조회수 TOP 3) ===== */}
                <h2 className="font-extrabold text-slate-900 text-[28px]">이달의 꿀잠템</h2>

                <div className="mt-[44px] flex items-center">
                    <div className="flex gap-[20px]">
                        {topThree.map((item, i) => (
                            <RankedCard
                                key={item.id}
                                item={item}
                                rank={i + 1}
                                onClick={() => handleCardClick(item.id)}
                            />
                        ))}
                    </div>


                </div>

                {/* 구분선 */}
                <div className="mt-[30px] border-t-2 border-slate-800" />
                <button
                    onClick={() => setModalOpen(true)}
                    className="w-[162px] h-[52px] mt-[20px] ml-[990px] rounded-lg bg-[#C9D6F5] font-semibold tracking-tighter text-[15px] text-slate-800 hover:brightness-95 transition self-end"
                >
                    나만의 꿀잠템 공유하기
                </button>
                {/* ===== 전체 컨텐츠 그리드 (4열, 무한 추가) ===== */}
                <div className="mt-[24px] grid grid-cols-4 gap-x-[10px] gap-y-[40px] pb-[120px]">
                    {videos.map((item) => (
                        <GridCard key={item.id} item={item} onClick={() => handleCardClick(item.id)} />
                    ))}
                </div>
            </main>

            <Footer />

            {isModalOpen && (
                <AddVideoModal onClose={() => setModalOpen(false)} onSubmit={handleAddVideo} />
            )}
        </div>
    );
}
