import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import api from "../api/api";
import { Header } from "../component/Header";

export default function Signup() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!email || !nickname || !password || !passwordConfirm) {
            setError("모든 항목을 입력해주세요.");
            return;
        }

        if (password !== passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            await api.post("/signup", {
                name: nickname,
                email: email,
                pwd: password,
                password,
            });

            setSuccess("회원가입이 완료되었습니다.");

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error: any) {
            console.error("회원가입 실패:", error);

            setError(
                error?.response?.data?.message ||
                "회원가입에 실패했습니다."
            );
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#F7F9FD] text-[#374151]">


            {/* Content */}
            <div className="flex flex-col items-center pt-[65px]">

                {/* 홈으로 돌아가기 */}
                <div className="w-[600px] mb-[10px]">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="
                            flex
                            items-center
                            gap-[4px]
                            text-[15px]
                            font-medium
                            text-[#6B7280]
                            hover:text-[#273A67]
                            transition-colors
                            cursor-pointer
                        "
                    >
                        <ChevronLeft
                            size={18}
                            strokeWidth={1.8}
                        />
                        <span>홈으로 돌아가기</span>
                    </button>
                </div>

                {/* Signup Card */}
                <div className="
                    w-[600px]
                    bg-white
                    rounded-[14px]
                    border
                    border-[#E5EAF2]
                    px-[50px]
                    py-[45px]
                    mb-[150px]
                    shadow-[0_4px_20px_rgba(39,58,103,0.05)]
                ">

                    {/* Title */}
                    <div className="text-center mb-[35px]">
                        <h1 className="
                            text-[28px]
                            font-bold
                            text-[#1F2937]
                            tracking-tighter
                        ">
                            회원가입
                        </h1>

                    </div>

                    <form onSubmit={handleSignup}>

                        {/* Email */}
                        <div className="mb-[18px]">
                            <label className="
                                block
                                mb-[8px]
                                text-[16px]
                                font-medium
                                text-[#374151]
                            ">
                                이메일
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="이메일을 입력해주세요"
                                className="
                                    w-full
                                    h-[51px]
                                    px-[16px]
                                    border-2
                                    border-[#D9E0EC]
                                    rounded-[8px]
                                    outline-none
                                    text-[#273A67]
                                    placeholder:text-[#B3BBC9]
                                    transition
                                    focus:border-[#9AAED8]
                                    focus:ring-2
                                    focus:ring-[#C9D6F5]
                                "
                            />
                        </div>

                        {/* Nickname */}
                        <div className="mb-[18px]">
                            <label className="
                                block
                                mb-[8px]
                                text-[16px]
                                font-medium
                                text-[#374151]
                            ">
                                닉네임
                            </label>

                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) =>
                                    setNickname(e.target.value)
                                }
                                placeholder="닉네임을 입력해주세요"
                                className="
                                    w-full
                                    h-[51px]
                                    px-[16px]
                                    border-2
                                    border-[#D9E0EC]
                                    rounded-[8px]
                                    outline-none
                                    text-[#273A67]
                                    placeholder:text-[#B3BBC9]
                                    transition
                                    focus:border-[#9AAED8]
                                    focus:ring-2
                                    focus:ring-[#C9D6F5]
                                "
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-[18px]">
                            <label className="
                                block
                                mb-[8px]
                                text-[16px]
                                font-medium
                                text-[#374151]
                            ">
                                비밀번호
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="비밀번호를 입력해주세요"
                                className="
                                    w-full
                                    h-[51px]
                                    px-[16px]
                                    border-2
                                    border-[#D9E0EC]
                                    rounded-[8px]
                                    outline-none
                                    text-[#273A67]
                                    placeholder:text-[#B3BBC9]
                                    transition
                                    focus:border-[#9AAED8]
                                    focus:ring-2
                                    focus:ring-[#C9D6F5]
                                "
                            />
                        </div>

                        {/* Password Confirm */}
                        <div className="mb-[10px]">
                            <label className="
                                block
                                mb-[8px]
                                text-[16px]
                                font-medium
                                text-[#374151]
                            ">
                                비밀번호 확인
                            </label>

                            <input
                                type="password"
                                value={passwordConfirm}
                                onChange={(e) =>
                                    setPasswordConfirm(e.target.value)
                                }
                                placeholder="비밀번호를 다시 입력해주세요"
                                className="
                                    w-full
                                    h-[51px]
                                    px-[16px]
                                    border-2
                                    border-[#D9E0EC]
                                    rounded-[8px]
                                    outline-none
                                    text-[#273A67]
                                    placeholder:text-[#B3BBC9]
                                    transition
                                    focus:border-[#9AAED8]
                                    focus:ring-2
                                    focus:ring-[#C9D6F5]
                                "
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="
                                mt-[10px]
                                text-[14px]
                                font-medium
                                text-[#E77B7B]
                            ">
                                {error}
                            </p>
                        )}

                        {/* Success */}
                        {success && (
                            <p className="
                                mt-[10px]
                                text-[14px]
                                font-medium
                                text-[#6B8E72]
                            ">
                                {success}
                            </p>
                        )}

                        {/* Signup Button */}
                        <button
                            type="submit"
                            className="
                                w-full
                                h-[51px]
                                mt-[22px]
                                flex
                                items-center
                                justify-center
                                rounded-[8px]
                                bg-[#C9D6F5]
                                text-[#273A67]
                                text-[20px]
                                font-bold
                                cursor-pointer
                                transition
                                hover:bg-[#B9C9ED]
                                hover:text-[#1F3159]
                                active:bg-[#AFC1E8]
                            "
                        >
                            회원가입
                        </button>
                    </form>

                    {/* Login */}
                    <div className="
                        flex
                        justify-center
                        items-center
                        mt-[25px]
                        text-[15px]
                    ">
                        <span className="text-[#6B7280]">
                            이미 회원이신가요?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="
                                ml-[10px]
                                font-bold
                                text-[#526A9D]
                                hover:text-[#273A67]
                                cursor-pointer
                                transition-colors
                            "
                        >
                            로그인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}