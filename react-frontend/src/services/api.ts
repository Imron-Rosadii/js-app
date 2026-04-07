import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

import type { ApiResponse, ApiError, User } from "../types";

// ================= BASE URL =================
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// ================= AXIOS INSTANCE =================
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= TOKEN HELPERS =================
const getAccessToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");

const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// ================= REFRESH STATE =================
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// ================= SUBSCRIBERS =================
const onRefreshSuccess = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const onRefreshFailure = () => {
  refreshSubscribers = [];
  clearTokens();

  // 🔥 trigger logout global
  window.dispatchEvent(new Event("auth:logout"));
};

// ================= TYPES =================
interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

type LoginResponse = ApiResponse<LoginResponseData>;
type RegisterResponse = ApiResponse<RegisterResponseData>;
type RefreshTokenResponse = ApiResponse<LoginResponseData>;

// ================= REFRESH TOKEN =================
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  // 🔥 IMPORTANT: pakai axios biasa (tanpa interceptor)
  const res = await axios.post<RefreshTokenResponse>(
    `${API_BASE_URL}/auth/refresh-token`,
    { refreshToken },
  );

  const { accessToken, refreshToken: newRefresh } = res.data.data;

  setTokens(accessToken, newRefresh);

  return accessToken;
};

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) return Promise.reject(error);

    const isAuthRoute = originalRequest.url?.includes("/auth");

    // 🔥 HANDLE 401 (dengan filter)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        onRefreshSuccess(newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch (err) {
        onRefreshFailure();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ================= AUTH API =================

// 🔐 LOGIN
export const login = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);

  const { accessToken, refreshToken } = res.data.data;
  setTokens(accessToken, refreshToken);

  return res.data;
};

// 📝 REGISTER
export const register = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> => {
  const res = await api.post<RegisterResponse>("/auth/register", data);

  const { accessToken, refreshToken } = res.data.data;
  setTokens(accessToken, refreshToken);

  return res.data;
};

// 👤 GET CURRENT USER
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const res = await api.get<ApiResponse<User>>("/auth/me");
  return res.data;
};

// 🚪 LOGOUT
export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error("Logout error:", error);
  }

  clearTokens();
};

// ================= GENERIC METHODS =================

export const get = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  const res = await api.get<ApiResponse<T>>(endpoint);
  return res.data;
};

export const post = async <T>(
  endpoint: string,
  data: unknown,
): Promise<ApiResponse<T>> => {
  const res = await api.post<ApiResponse<T>>(endpoint, data);
  return res.data;
};

export const put = async <T>(
  endpoint: string,
  data: unknown,
): Promise<ApiResponse<T>> => {
  const res = await api.put<ApiResponse<T>>(endpoint, data);
  return res.data;
};

export const remove = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  const res = await api.delete<ApiResponse<T>>(endpoint);
  return res.data;
};

export default api;
