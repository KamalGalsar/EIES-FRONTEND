// src/services/profileService.ts

const API_BASE_URL = "http://localhost:5268";

export interface ProfileData {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  provider: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  async getProfile(accessToken: string): Promise<ProfileData> {
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Failed to load profile");
    return res.json();
  },

  async updateProfile(accessToken: string, payload: ProfileUpdatePayload): Promise<ProfileData> {
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update profile");
    }
    return res.json();
  },

  async changePassword(accessToken: string, payload: PasswordChangePayload): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/profile/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to change password");
    }
  },
};
