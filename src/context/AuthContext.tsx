// Frontend/src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthUser {
  email: string;
  name: string;
  provider?: string;
  role: string;
  profilePicture?: string;
  isVerified: boolean;
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
    profilePicture?: string;
    isVerified: boolean;
  }) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  markVerified: () => void;
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
    const storedPhoto = localStorage.getItem("userPhoto") || "";
    const storedVerified = localStorage.getItem("userIsVerified") === "true";

    if (storedAccess && storedRefresh) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      setUser({
        email: storedEmail,
        name: storedName,
        provider: storedProvider,
        role: storedRole,
        profilePicture: storedPhoto,
        isVerified: storedVerified,
      });
      
      // Auto-refresh to get latest photo/name from DB
      fetch(`${BACKEND}/api/profile`, {
        headers: { Authorization: `Bearer ${storedAccess}` },
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          localStorage.setItem("userPhoto", data.profilePicture || "");
          setUser(prev => prev ? { ...prev, profilePicture: data.profilePicture } : null);
        }
      })
      .catch(err => console.error("Mount refresh error:", err));
    }

    setIsLoading(false);
  }, []);

  const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";
  // LOGIN — stores tokens and updates state.
  const login = (data: {
    accessToken: string;
    refreshToken: string;
    email: string;
    name: string;
    provider?: string;
    role: string;
    profilePicture?: string;
    isVerified: boolean;
  }) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userEmail", data.email || "");
    localStorage.setItem("userName", data.name || "");
    localStorage.setItem("userProvider", data.provider || "");
    localStorage.setItem("userRole", data.role || "User");
    localStorage.setItem("userPhoto", data.profilePicture || "");
    localStorage.setItem("userIsVerified", data.isVerified ? "true" : "false");

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser({
      email: data.email,
      name: data.name,
      provider: data.provider,
      role: data.role,
      profilePicture: data.profilePicture,
      isVerified: data.isVerified,
    });

    // NEW: Fetch full profile to get photo/details if missing
    fetch(`${BACKEND}/api/profile`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    })
    .then(res => res.ok ? res.json() : null)
    .then(profileData => {
      if (profileData) {
        localStorage.setItem("userName", profileData.name || data.name || "");
        localStorage.setItem("userPhoto", profileData.profilePicture || "");
        setUser(prev => prev ? {
          ...prev,
          name: profileData.name || prev.name,
          profilePicture: profileData.profilePicture
        } : null);
      }
    })
    .catch(err => console.error("Login refresh error:", err));
  };
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
    localStorage.removeItem("userPhoto");
 
    navigate("/signin");
  };

  const refreshUser = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${BACKEND}/api/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("userName", data.name || "");
        localStorage.setItem("userPhoto", data.profilePicture || "");
        setUser(prev => prev ? {
          ...prev,
          name: data.name,
          profilePicture: data.profilePicture
        } : null);
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
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
        refreshUser,
        markVerified: () => {
          localStorage.setItem("userIsVerified", "true");
          setUser(prev => prev ? { ...prev, isVerified: true } : null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};