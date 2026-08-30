import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import api from "../api/api";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [emailFormErr, setEmailFormErr] = useState(false);

    const validateEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    // useEffect(() => {
    //     if (pw.length > 0 && pw.length < 8) {
    //         setPwNumFail("incorrect");
    //     } else {
    //         setPwNumFail("success");
    //     }
    // }, [pw]);

    const handleLogin = async () => {

        if (!validateEmail(email)) {
            setEmailFormErr(true);
            return;
        }

        setEmailFormErr(false);

        // if (pw.length < 8) {
        //     setPwNumFail("incorrect");
        //     return;
        // }

        try {
            await api.post("/login", {
                email: email,
                pwd: pw,
            });

            sessionStorage.setItem("isLoggedIn", "true");
            navigate("/");
        } catch (error) {

        }
    };

    const googleLogin = () => {
        alert("Google 로그인은 아직 준비 중입니다.");
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#F7F9FD] text-[#374151] text-[18px] pt-[80px]">
            <div className="w-[600px] mb-[10px]">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="
            flex
            items-center
            gap-[6px]
            text-[15px]
            font-medium
            text-[#6B7280]
            hover:text-[#273A67]
            transition-colors
            cursor-pointer
        "
                >
                    <span className="text-[18px]">←</span>
                    <span>홈으로 돌아가기</span>
                </button>
            </div>
            {/* <Header /> */}

            {/* 로그인 박스 */}
            <div className="bg-white w-[600px] min-h-[650px] flex flex-col items-center px-[10px] pt-[39px] mt-[0px] mb-[150px] rounded-[14px] border border-[#E5EAF2] shadow-[0_4px_20px_rgba(39,58,103,0.05)]">

                {/* title */}
                <div className="flex flex-col w-full items-center">
                    <p className="text-[28px] font-bold text-[#1F2937] tracking-tighter">
                        로그인
                    </p>
                </div>

                {/* main content */}
                <div className="flex flex-col gap-[30px]">

                    {/* email */}
                    <div className="flex flex-col mt-[26px] w-[519px]">
                        <p className="text-[20px] text-[#374151]">
                            이메일
                        </p>

                        <div className="mt-[8px]">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailFormErr(false);
                                }}
                                placeholder="you@example.com"
                                className="
                                    w-full
                                    h-[51px]
                                    pl-[20px]
                                    rounded-[8px]
                                    border-2
                                    border-[#D9E0EC]
                                    text-[#273A67]
                                    placeholder:text-[#B3BBC9]
                                    outline-none
                                    transition
                                    focus:border-[#9AAED8]
                                    focus:ring-2
                                    focus:ring-[#C9D6F5]
                                "
                            />

                            {emailFormErr && (
                                <p className="mt-[5px] text-[14px] font-medium text-[#E77B7B]">
                                    유효한 이메일이 아닙니다. 다시 작성해주세요.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* password */}
                    <div className="flex flex-col w-[519px] mt-[-8px]">
                        <p className="text-[20px] text-[#374151]">
                            비밀번호
                        </p>

                        <input
                            type="password"
                            value={pw}
                            onChange={(e) => {
                                setPw(e.target.value);
                            }}
                            placeholder="••••••••"
                            className="
                                h-[51px]
                                flex items-center
                                rounded-[8px]
                                mt-[8px]
                                pl-[20px]
                                border-2
                                border-[#D9E0EC]
                                text-[#273A67]
                                placeholder:text-[#B3BBC9]
                                outline-none
                                transition
                                focus:border-[#9AAED8]
                                focus:ring-2
                                focus:ring-[#C9D6F5]
                            "
                        />


                    </div>

                    {/* login button */}
                    <button
                        type="button"
                        onClick={handleLogin}
                        className="
                            w-[519px]
                            h-[51px]
                            mt-[-4px]
                            flex
                            items-center
                            justify-center
                            rounded-[8px]
                            bg-[#C9D6F5]
                            text-[#273A67]
                            cursor-pointer
                            transition
                            hover:bg-[#B9C9ED]
                            hover:text-[#1F3159]
                            active:bg-[#AFC1E8]
                        "
                    >
                        <span className="text-[22px] font-bold tracking-tighter">
                            로그인
                        </span>
                    </button>
                </div>

                {/* divider */}
                <div className="flex items-center w-[519px] mt-[30px]">
                    <div className="flex-1 h-px bg-[#E5EAF2]" />

                    <span className="mx-[16px] text-[#9AA3B2] text-[14px]">
                        또는
                    </span>

                    <div className="flex-1 h-px bg-[#E5EAF2]" />
                </div>

                {/* Google login */}
                <button
                    type="button"
                    onClick={googleLogin}
                    className="
                        cursor-pointer
                        w-[522px]
                        h-[56px]
                        mt-[28px]
                        flex
                        items-center
                        justify-center
                        gap-[10px]
                        rounded-[8px]
                        border-2
                        border-[#E1E6EF]
                        text-[#374151]
                        bg-white
                        transition
                        hover:bg-[#F7F9FD]
                        hover:border-[#C9D6F5]
                    "
                >
                    <span className="text-[18px] font-bold tracking-tighter">
                        Google 계정으로 계속하기
                    </span>
                </button>

                {/* links */}
                <div className="mb-[3px]">

                    <p className="text-[#6B7280] text-[15px] mt-[20px]">
                        아직 계정이 없으신가요?

                        <button
                            type="button"
                            onClick={() => navigate("/signup")}
                            className="ml-[10px] text-[#526A9D] font-bold hover:text-[#273A67]"
                        >
                            회원가입
                        </button>
                    </p>

                    <p className="text-[#6B7280] text-[15px] mt-[8px]">
                        비밀번호를 잊으셨나요?

                        <button
                            type="button"
                            onClick={() => navigate("/pw-find")}
                            className="ml-[10px] text-[#526A9D] font-bold hover:text-[#273A67]"
                        >
                            비밀번호 찾기
                        </button>
                    </p>

                </div>
            </div>
        </div>
    );
}
