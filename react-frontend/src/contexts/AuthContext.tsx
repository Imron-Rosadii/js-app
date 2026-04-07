import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import type { User, UseAuthReturn, ApiError } from "../types";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from "../services/api";

import axios from "axios";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD USER =================
  useEffect(() => {
    const loadUser = async () => {
      const accessToken = localStorage.getItem("accessToken");

      // 🔥 kalau tidak ada token → stop
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await getCurrentUser();
        const userData = res.data;

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Failed get user:", error);

        // 🔥 token invalid → clear
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ================= LOGIN =================
  const login = async (email: string, password: string) => {
    try {
      const res = await apiLogin({ email, password });

      const { accessToken, refreshToken } = res.data;

      // 🔥 simpan token
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // 🔥 ambil user
      const userRes = await getCurrentUser();
      const userData = userRes.data;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      let message = "Login failed";

      if (axios.isAxiosError<ApiError>(error)) {
        message = error.response?.data?.message || message;
      }

      return { success: false, error: message };
    }
  };

  // ================= REGISTER =================
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await apiRegister({ name, email, password });

      const { accessToken, refreshToken, user } = res.data;

      // 🔥 simpan token
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true };
    } catch (error) {
      let message = "Register failed";

      if (axios.isAxiosError<ApiError>(error)) {
        message = error.response?.data?.message || message;
      }

      return { success: false, error: message };
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 🔥 bersihkan semua
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setUser(null);
    }
  };

  const value: UseAuthReturn = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refreshToken: async () => true, // optional
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
