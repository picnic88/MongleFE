import { useEffect, useMemo, useState } from "react";
import { Header } from "../component/Header";
import { Footer } from "../component/Footer";
import api from "../api/api";

// ---------------- 타입 ----------------
type VideoItem = {
    id: string;
    videoId: string | null;
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
            if (url.pathname === "/watch") {
                return url.searchParams.get("v");
            }

            if (url.pathname.startsWith("/embed/")) {
                return url.pathname.split("/embed/")[1];
            }

            if (url.pathname.startsWith("/shorts/")) {
                return url.pathname.split("/shorts/")[1];
            }
        }

        return null;
    } catch {
        return null;
    }
}

async function fetchYoutubeInfo(
    videoId: string
): Promise<{ title: string; thumbnail: string }> {
    const oembedUrl =
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
            `https://www.youtube.com/watch?v=${videoId}`
        )}&format=json`;

    const res = await fetch(oembedUrl);

    if (!res.ok) {
        throw new Error(
            "영상 정보를 가져오지 못했어요. 링크를 다시 확인해주세요."
        );
    }

    const data = await res.json();

    return {
        title: data.title as string,
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

// ---------------- 썸네일 ----------------
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
            className="
                rounded-[12px]
                bg-[#F1F3F8]
                overflow-hidden
                flex items-center justify-center
                border border-[#E4E8F0]
            "
            style={{ width, height }}
        >
            {item.thumbnail ? (
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span
                    className="text-[14px] text-[#A0A7B5]"
                    style={{
                        fontFamily: "Pretendard",
                        fontWeight: "400",
                    }}
                >
                    영상을 등록해주세요
                </span>
            )}
        </div>
    );
}

// ---------------- TOP 3 카드 ----------------
const RANK_COLORS = [
    "#F3D98B",
    "#D8DCE3",
    "#D6A47A",
];

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
        <button
            onClick={onClick}
            className="
                relative
                w-[360px]
                text-left
                cursor-pointer
                group
            "
            style={{
                fontFamily: "Pretendard",
                fontWeight: "500",
            }}
        >
            {/* 순위 */}
            <div
                className="
                    absolute
                    -top-[18px]
                    -left-[14px]
                    w-[42px]
                    h-[42px]
                    rounded-full
                    border-[2px]
                    border-white
                    shadow-sm
                    z-10
                    flex items-center justify-center
                    font-bold
                    text-[#273A67]
                "
                style={{
                    backgroundColor: RANK_COLORS[rank - 1],
                }}
            >
                {rank}
            </div>

            <div className="overflow-hidden rounded-[12px]">
                <ThumbnailBox
                    item={item}
                    width={360}
                    height={176}
                />
            </div>

            <p
                className="
                    mt-[16px]
                    text-[17px]
                    text-[#273A67]
                    truncate
                    group-hover:text-[#657DB8]
                    transition
                "
            >
                {item.title}
            </p>

            <p className="mt-[4px] text-[13px] text-[#8C94A5]">
                조회수 {item.views.toLocaleString()}회
            </p>
        </button>
    );
}

// ---------------- 일반 카드 ----------------
function GridCard({
    item,
    onClick,
}: {
    item: VideoItem;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="
                w-[280px]
                text-left
                cursor-pointer
                group
            "
            style={{
                fontFamily: "Pretendard",
                fontWeight: "400",
            }}
        >
            <div className="overflow-hidden rounded-[12px]">
                <ThumbnailBox
                    item={item}
                    width={280}
                    height={166}
                />
            </div>

            <p
                className="
                    mt-[14px]
                    text-[17px]
                    text-[#273A67]
                    truncate
                    group-hover:text-[#657DB8]
                    transition
                "
            >
                {item.title}
            </p>

            <p className="mt-[4px] text-[13px] text-[#8C94A5]">
                조회수 {item.views.toLocaleString()}회
            </p>
        </button>
    );
}

// ---------------- 유튜브 등록 모달 ----------------
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
            setError(
                e instanceof Error
                    ? e.message
                    : "등록 중 오류가 발생했어요."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="
                fixed inset-0 z-50
                bg-[#273A67]/30
                backdrop-blur-[2px]
                flex items-center justify-center
            "
        >
            <div
                className="
                    w-[480px]
                    bg-white
                    rounded-[18px]
                    p-[32px]
                    shadow-xl
                "
                style={{
                    fontFamily: "Pretendard",
                    fontWeight: "500",
                }}
            >
                <h3
                    className="
                        text-[22px]
                        font-bold
                        text-[#273A67]
                    "
                >
                    나만의 꿀잠템 공유하기
                </h3>

                <p className="mt-[9px] text-[14px] text-[#8C94A5]">
                    유튜브 영상 링크를 붙여넣으면
                    제목과 썸네일이 자동으로 등록돼요.
                </p>

                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="
                        mt-[24px]
                        w-full
                        h-[50px]
                        px-[16px]
                        border
                        border-[#E1E5ED]
                        rounded-[9px]
                        text-[15px]
                        text-[#273A67]
                        outline-none
                        transition
                        focus:border-[#A9BCF0]
                        focus:ring-2
                        focus:ring-[#C9D6F5]
                    "
                />

                {error && (
                    <p className="mt-[8px] text-[13px] text-[#E47777]">
                        {error}
                    </p>
                )}

                <div className="mt-[28px] flex justify-end gap-[10px]">
                    <button
                        onClick={onClose}
                        className="
                            w-[120px]
                            h-[44px]
                            rounded-[9px]
                            border
                            border-[#E1E5ED]
                            font-semibold
                            text-[#697386]
                            hover:bg-[#F7F8FB]
                            transition
                            cursor-pointer
                        "
                    >
                        취소
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="
                            w-[120px]
                            h-[44px]
                            rounded-[9px]
                            bg-[#C9D6F5]
                            font-semibold
                            text-[#273A67]
                            hover:bg-[#B8C8EE]
                            transition
                            cursor-pointer
                            disabled:opacity-60
                        "
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
    const [videos, setVideos] = useState<VideoItem[]>(
        createDefaultVideos()
    );

    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const topThree = useMemo(
        () =>
            [...videos]
                .sort((a, b) => b.views - a.views)
                .slice(0, 3),
        [videos]
    );

    const handleAddVideo = async (url: string) => {
        const videoId = extractYoutubeId(url);

        if (!videoId) {
            throw new Error(
                "올바른 유튜브 링크를 입력해주세요."
            );
        }

        const info = await fetchYoutubeInfo(videoId);
        try {
            await api.post("/contents", {
                title: info.title,
                thumbnail: info.thumbnail,
                link: url,
            });
            console.log("등록 완료");
        } catch (error) {
            console.log("등록 실패");
            console.log(error);
        }

        const newItem: VideoItem = {
            id: `${videoId}-${Date.now()}`,
            videoId,
            url,
            title: info.title,
            thumbnail: info.thumbnail,
            views: 0,
        };

        setVideos((prev) => [newItem, ...prev]);
    };

    const handleCardClick = (id: string) => {
        setVideos((prev) =>
            prev.map((v) =>
                v.id === id
                    ? { ...v, views: v.views + 1 }
                    : v
            )
        );

        const target = videos.find(
            (v) => v.id === id
        );

        if (target?.url) {
            window.open(
                target.url,
                "_blank",
                "noopener,noreferrer"
            );
        }
    };
    // ---------------- 등록된 영상 불러오기 ----------------
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await api.get("/contents");

                // 서버 응답을 VideoItem 형태로 매핑
                const fetched: VideoItem[] = res.data.map((c: any) => ({
                    id: String(c.id),
                    videoId: extractYoutubeId(c.link) ?? null,
                    url: c.link,
                    title: c.title,
                    thumbnail: c.thumbnail,
                    views: c.views ?? 0,
                }));

                setVideos(fetched.reverse());
            } catch (error) {
                console.log("목록 불러오기 실패");
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);
    return (

        <div
            className="w-full min-h-screen bg-white"
            style={{
                fontFamily: "Pretendard",
            }}
        >
            <Header target="sleep" />

            <main className="px-[130px] mt-[110px]">

                {/* ===== 이달의 꿀잠템 ===== */}
                <section className="mt-[55px]">

                    <div className="flex items-end justify-between">
                        <div>
                            <h2
                                className="
                                    text-[28px]
                                    font-bold
                                    text-[#273A67]
                                "
                            >
                                이달의 꿀잠템
                            </h2>

                            <p className="mt-[7px] text-[14px] text-[#8C94A5]">
                                가장 많은 사랑을 받은 콘텐츠예요.
                            </p>
                        </div>
                    </div>

                    <div className="mt-[42px] flex gap-[20px]">
                        {topThree.map((item, i) => (
                            <RankedCard
                                key={item.id}
                                item={item}
                                rank={i + 1}
                                onClick={() =>
                                    handleCardClick(item.id)
                                }
                            />
                        ))}
                    </div>
                </section>

                {/* ===== 구분선 ===== */}
                <div className="mt-[48px] border-t border-[#E4E8F0]" />

                {/* ===== 콘텐츠 공유 버튼 ===== */}
                <div className="flex justify-end mt-[20px]">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="
                            w-[170px]
                            h-[48px]
                            flex
                            items-center
                            justify-center
                            rounded-[9px]
                            bg-[#C9D6F5]
                            font-semibold
                            text-[14px]
                            text-[#273A67]
                            hover:bg-[#B8C8EE]
                            transition
                            cursor-pointer
                        "
                    >
                        나만의 꿀잠템 공유하기
                    </button>
                </div>

                {/* ===== 전체 콘텐츠 ===== */}
                <section className="mt-[30px] pb-[120px]">

                    <div
                        className="
                            grid
                            grid-cols-4
                            gap-x-[10px]
                            gap-y-[44px]
                        "
                    >
                        {videos.map((item) => (
                            <GridCard
                                key={item.id}
                                item={item}
                                onClick={() =>
                                    handleCardClick(item.id)
                                }
                            />
                        ))}
                    </div>

                </section>
            </main>

            <Footer />

            {isModalOpen && (
                <AddVideoModal
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleAddVideo}
                />
            )}
        </div>
    );
}
