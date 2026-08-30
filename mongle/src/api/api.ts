import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    }
});


export type LoginRequest = {
    email: string;
    password: string;
};

export type SignupRequest = {
    email: string;
    password: string;
    nickname: string;
};

export type LoginResponse = {
    accessToken: string;
    refreshToken?: string;
};

export async function login(data: LoginRequest) {
    const response = await api.post<LoginResponse>("/login", data);

    localStorage.setItem("accessToken", response.data.accessToken);

    if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
    }

    return response.data;
}

export async function signup(data: SignupRequest) {
    const response = await api.post("/signup", data);

    return response.data;
}

export function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    window.location.assign("/");
}

export function isLoggedIn() {
    return !!localStorage.getItem("accessToken");
}


export default api;