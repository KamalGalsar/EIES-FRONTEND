// Frontend/src/services/authService.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  name: string;
  provider: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  provider: string;
  createdAt?: string;
}

export const authService = {
  // EMAIL LOGIN
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  // EMAIL REGISTER
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  // LOGOUT
  async logout(refreshToken: string) {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken),
    });
  },

  // REFRESH ACCESS TOKEN
  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken),
    });

    if (!response.ok) throw new Error("Failed to refresh token");

    return response.json();
  },

  // GET CURRENT USER
  async getMe(accessToken: string): Promise<UserProfile> {
    let response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
      // Try to refresh
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const newTokens = await this.refreshAccessToken(refreshToken);
      localStorage.setItem("accessToken", newTokens.accessToken);
      localStorage.setItem("refreshToken", newTokens.refreshToken);

      // Retry with new token
      response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${newTokens.accessToken}` },
      });
    }

    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  // SSO URLS (used by SsoButtons)
  getOAuthUrl(
    mode: "signin" | "signup",
    provider: "google" | "github" | "microsoft",
  ): string {
    return `${API_BASE_URL}/auth/${mode}/${provider}`;
  },
};