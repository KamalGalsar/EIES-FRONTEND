// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthUser {
  email: string;
  name: string;
  provider?: string;
  role: string; // For Admin/User
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: {
    accessToken: string;
    refreshToken: string;
    email: string;
    name: string;
    provider?: string;
    role: string; 
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");
    const storedEmail = localStorage.getItem("userEmail") || "";
    const storedName = localStorage.getItem("userName") || "";
    const storedProvider = localStorage.getItem("userProvider") || "";
    const storedRole = localStorage.getItem("userRole") || "User";

    if (storedAccess && storedRefresh) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      setUser({
        email: storedEmail,
        name: storedName,
        provider: storedProvider,
        role: storedRole, // set role from storage
      });
    }

    setIsLoading(false);
  }, []);

  // LOGIN — stores tokens and updates state.
  const login = (data: {
    accessToken: string;
    refreshToken: string;
    email: string;
    name: string;
    provider?: string;
    role: string;
  }) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userEmail", data.email || "");
    localStorage.setItem("userName", data.name || "");
    localStorage.setItem("userProvider", data.provider || "");
    localStorage.setItem("userRole", data.role || "User");

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser({
      email: data.email,
      name: data.name,
      provider: data.provider,
      role: data.role,
    });
  };
  const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";
  // LOGOUT
  const logout = async () => {
    try {
      const storedRefresh = localStorage.getItem("refreshToken");
      if (storedRefresh) {
        await fetch(`${BACKEND}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storedRefresh),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userProvider");
    localStorage.removeItem("userRole"); 
    sessionStorage.clear();

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    navigate("/signin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};