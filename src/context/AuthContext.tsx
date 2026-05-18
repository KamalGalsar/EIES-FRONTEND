// Frontend/src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthUser {
  id?: number;
  email: string;
  name: string;
  alias: string;
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
    id?: number;
    accessToken: string;
    refreshToken: string;
    email: string;
    name: string;
    alias: string;
    provider?: string;
    role: string; 
    profilePicture?: string;
    isVerified: boolean;
  }) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  markVerified: () => void;
  privacyMode: boolean;
  togglePrivacy: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [privacyMode, setPrivacyMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");
    const storedIdVal = localStorage.getItem("userId");
    const storedId = (storedIdVal && storedIdVal !== "undefined") ? parseInt(storedIdVal, 10) : 0;
    
    const storedEmail = localStorage.getItem("userEmail") || "";
    const storedName = localStorage.getItem("userName") || "";
    const storedAlias = localStorage.getItem("userAlias") || "";
    const storedProvider = localStorage.getItem("userProvider") || "";
    const storedRole = localStorage.getItem("userRole") || "User";
    const storedPhoto = localStorage.getItem("userPhoto") || "";
    const storedVerified = localStorage.getItem("userIsVerified") === "true";
    const storedPrivacy = localStorage.getItem("privacyMode");
    
    // Default privacyMode to true if not set
    if (storedPrivacy !== null) {
      setPrivacyMode(storedPrivacy === "true");
    } else {
      localStorage.setItem("privacyMode", "true");
      setPrivacyMode(true);
    }

    if (storedAccess && storedRefresh) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      setUser({
        id: storedId,
        email: storedEmail,
        name: storedName,
        alias: storedAlias,
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

      // Fetch global settings
      fetch(`${BACKEND}/api/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          localStorage.setItem("sessionTimeout", String(data.sessionTimeoutMinutes));
        }
      })
      .catch(err => console.error("Settings fetch error:", err));
    } else {
      // Even if no user is logged in, fetch settings to prepare for login
      fetch(`${BACKEND}/api/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          localStorage.setItem("sessionTimeout", String(data.sessionTimeoutMinutes));
        }
      })
      .catch(err => console.error("Settings fetch error:", err));
    }

    setIsLoading(false);
  }, []);


  // Inactivity Timeout Effect
  useEffect(() => {
    if (!accessToken) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      const sessionTimeoutMinutes = parseInt(localStorage.getItem("sessionTimeout") || "30", 10);
      const timeoutMs = sessionTimeoutMinutes * 60 * 1000;
      
      timeoutId = setTimeout(() => {
        console.log("Session timed out due to inactivity");
        // We use the logout function from below, but we need to reference it
        // Since logout is defined below, we'll implement the core logout logic here
        // or we can wrap the logout in a useCallback, but for simplicity we'll just force the logout
        logoutInternal();
      }, timeoutMs);
    };

    const logoutInternal = async () => {
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
        console.error("Timeout logout error:", error);
      }
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      navigate("/signin");
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimeout();

    events.forEach(event => document.addEventListener(event, handleActivity));
    resetTimeout();

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      clearTimeout(timeoutId);
    };
  }, [accessToken, navigate]);

  // LOGIN — stores tokens and updates state.
  const login = (data: {
    id?: number;
    accessToken: string;
    refreshToken: string;
    email: string;
    name: string;
    alias: string;
    provider?: string;
    role: string;
    profilePicture?: string;
    isVerified: boolean;
  }) => {
    localStorage.setItem("userId", (data.id || 0).toString());
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userEmail", data.email || "");
    localStorage.setItem("userName", data.name || "");
    localStorage.setItem("userAlias", data.alias || "");
    localStorage.setItem("userProvider", data.provider || "");
    localStorage.setItem("userRole", data.role || "User");
    localStorage.setItem("userPhoto", data.profilePicture || "");
    localStorage.setItem("userIsVerified", data.isVerified ? "true" : "false");

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      alias: data.alias,
      provider: data.provider,
      role: data.role,
      profilePicture: data.profilePicture,
      isVerified: data.isVerified,
    });

    fetch(`${BACKEND}/api/profile`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    })
    .then(res => res.ok ? res.json() : null)
    .then(profileData => {
      if (profileData) {
        localStorage.setItem("userName", profileData.name || data.name || "");
        localStorage.setItem("userAlias", profileData.alias || data.alias || "");
        localStorage.setItem("userPhoto", profileData.profilePicture || "");
        setUser(prev => prev ? {
          ...prev,
          name: profileData.name || prev.name,
          alias: profileData.alias || prev.alias,
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
    localStorage.removeItem("userAlias");
    localStorage.removeItem("userProvider");
    localStorage.removeItem("userRole"); 
    localStorage.removeItem("userId");
    sessionStorage.clear();

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("userPhoto");
 
    navigate("/signin");
  };

  const togglePrivacy = (enabled: boolean) => {
    localStorage.setItem("privacyMode", String(enabled));
    setPrivacyMode(enabled);
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
        localStorage.setItem("userAlias", data.alias || "");
        localStorage.setItem("userPhoto", data.profilePicture || "");
        setUser(prev => prev ? {
          ...prev,
          name: data.name,
          alias: data.alias,
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
        privacyMode,
        togglePrivacy,
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