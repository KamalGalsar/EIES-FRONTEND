// Frontend/src/pages/users/AdminProfile.tsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileService, type ProfileData } from "../services/profileService";
import {
  Shield,
  User,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  FileText,
  Lock,
  Save,
  X,
  ChevronLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Calendar,
  Key,
  Loader2,
  Activity,
  Camera,
} from "lucide-react";

// Validation helpers
function validatePhone(phone: string): string | null {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
    return 'Phone must be exactly 10 digits';
  }
  return null;
}

function validateNoNumbers(value: string, fieldName: string): string | null {
  if (/\d/.test(value)) {
    return `${fieldName} cannot contain numbers`;
  }
  return null;
}

type ValidationErrors = {
  phone?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
};

// Toast (responsive + full dark mode)
type ToastType = "success" | "error";
function Toast({
  message,
  type,
  onDone,
}: {
  message: string;
  type: ToastType;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`fixed top-4 right-4 left-4 sm:left-auto z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium max-w-md sm:right-6
        ${
          type === "success"
            ? "bg-white dark:bg-gray-800 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-emerald-100 dark:shadow-emerald-950/30"
            : "bg-white dark:bg-gray-800 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 shadow-red-100 dark:shadow-red-950/30"
        }`}
      style={{ animation: "slideIn 0.25s ease-out" }}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
    </div>
  );
}

// Card (dark borders & accents)
function Card({
  title,
  icon: Icon,
  children,
  accent = "blue",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent?: "blue" | "red";
}) {
  const accentMap = {
    blue: "text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40",
    red: "text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-950/40",
  };
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentMap[accent]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">
          {title}
        </h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

// Field (dark mode for read-only/editing)
function Field({
  label,
  value,
  editing,
  name,
  placeholder,
  onChange,
  readOnly,
  textarea,
  error,
}: {
  label: string;
  value: string;
  editing: boolean;
  name: string;
  placeholder?: string;
  onChange: (name: string, val: string) => void;
  readOnly?: boolean;
  textarea?: boolean;
  error?: string | null;
}) {
  const base =
    "w-full border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all";
  const activeClass =
    "border-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 bg-white dark:bg-gray-800";
  const readOnlyClass =
    "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 cursor-not-allowed";
  const errorClass = error ? "border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30" : "";

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          disabled={!editing || readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${base} resize-none ${editing && !readOnly ? activeClass : readOnlyClass} ${errorClass}`}
        />
      ) : (
        <input
          type={name === "phone" ? "tel" : "text"}
          value={value}
          disabled={!editing || readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${base} ${editing && !readOnly ? activeClass : readOnlyClass} ${errorClass}`}
        />
      )}
      {error && editing && !readOnly && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}

// Main Component
export default function AdminProfile() {
  const { accessToken, user: ctxUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<Partial<ProfileData>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
    null
  );

  const [showPwSection, setShowPwSection] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const toastKey = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: ToastType) => {
    toastKey.current++;
    setToast({ msg, type });
  };

  useEffect(() => {
    if (!accessToken) return;
    profileService
      .getProfile(accessToken)
      .then((data) => {
        setProfile(data);
        setForm(data);
      })
      .catch(() => showToast("Failed to load profile", "error"))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const validateField = (name: string, value: string): string | null => {
    if (!editing) return null;
    switch (name) {
      case 'phone':
        return validatePhone(value);
      case 'jobTitle':
        return validateNoNumbers(value, 'Job title');
      case 'department':
        return validateNoNumbers(value, 'Department');
      case 'location':
        return validateNoNumbers(value, 'Location');
      default:
        return null;
    }
  };

  const handleChange = (name: string, val: string) => {
    const processedVal = name === 'phone' ? val.replace(/\D/g, '').slice(0, 10) : val;
    setForm((f) => ({ ...f, [name]: processedVal }));
    const error = validateField(name, processedVal);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const hasErrors = () => {
    return Object.values(errors).some(err => err != null) ||
           validatePhone(form.phone || '') !== null ||
           validateNoNumbers(form.jobTitle || '', 'Job title') !== null ||
           validateNoNumbers(form.department || '', 'Department') !== null ||
           validateNoNumbers(form.location || '', 'Location') !== null;
  };

  const handleSave = async () => {
    if (!accessToken) return;
    if (hasErrors()) {
      showToast("Please fix validation errors", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(accessToken, {
        name: form.name,
        phone: form.phone,
        department: form.department,
        jobTitle: form.jobTitle,
        location: form.location,
        bio: form.bio,
        profilePicture: form.profilePicture,
      });
      setProfile(updated);
      setForm(prev => ({ ...prev, ...updated })); // Merge to ensure we keep the photo in state
      
      // Refresh global user state to update Sidebar/TopNav
      console.log("Profile updated, refreshing user state...", updated);
      await refreshUser();
      setEditing(false);
      setErrors({});
      showToast("Profile updated successfully", "success");
    } catch (e: any) {
      showToast(e.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(profile ?? {});
    setEditing(false);
    setErrors({});
  };
 
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size should be less than 2MB", "error");
      return;
    }
 
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm((f) => ({ ...f, profilePicture: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async () => {
    if (pw.next !== pw.confirm) {
      showToast("New passwords do not match", "error");
      return;
    }
    if (pw.next.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }
    if (!accessToken) return;
    setPwSaving(true);
    try {
      await profileService.changePassword(accessToken, {
        currentPassword: pw.current,
        newPassword: pw.next,
      });
      setPw({ current: "", next: "", confirm: "" });
      setShowPwSection(false);
      showToast("Password changed successfully", "success");
    } catch (e: any) {
      showToast(e.message || "Password change failed", "error");
    } finally {
      setPwSaving(false);
    }
  };

  const providerLabel: Record<string, string> = {
    local: "Email / Password",
    google: "Google SSO",
    github: "GitHub SSO",
    microsoft: "Microsoft SSO",
  };

  const initials = (profile?.name || ctxUser?.name || "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {toast && (
        <Toast
          key={toastKey.current}
          message={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* Top bar - fixed button styles for square appearance on mobile/tablet */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="text-gray-300 dark:text-gray-700 hidden sm:block">|</span>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900 dark:text-white font-semibold text-sm">
                EIES
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap min-w-[36px] min-h-[36px] sm:min-w-0"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || hasErrors()}
                  className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap min-w-[36px] min-h-[36px] sm:min-w-0"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{saving ? "Saving…" : "Save Changes"}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap min-w-[36px] min-h-[36px] sm:min-w-0"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Hero - responsive + dark borders */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 shadow-sm">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-lg overflow-hidden">
              {form.profilePicture ? (
                <img
                  src={form.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}

              {/* Camera Overlay - Only when editing */}
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Change Photo"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full z-10" />
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {profile?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{profile?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800">
                <Shield className="w-3 h-3" />
                Admin
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                <Key className="w-3 h-3" />
                {providerLabel[profile?.provider ?? "local"] ?? profile?.provider}
              </span>
              {profile?.department && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                  <Building2 className="w-3 h-3" />
                  {profile.department}
                </span>
              )}
              {profile?.jobTitle && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800">
                  <Briefcase className="w-3 h-3" />
                  {profile.jobTitle}
                </span>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
              Member since
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </p>
            {profile?.updatedAt && (
              <>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-2 mb-1">
                  Last updated
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal */}
          <Card title="Personal Information" icon={User}>
            <div className="space-y-4">
              <Field
                label="Full Name"
                name="name"
                value={form.name ?? ""}
                editing={editing}
                placeholder="Your full name"
                onChange={handleChange}
              />
              <Field
                label="Email Address"
                name="email"
                value={form.email ?? ""}
                editing={editing}
                readOnly
                onChange={handleChange}
              />
              <Field
                label="Phone Number"
                name="phone"
                value={form.phone ?? ""}
                editing={editing}
                placeholder="10-digit mobile number"
                onChange={handleChange}
                error={errors.phone}
              />
              <Field
                label="Location"
                name="location"
                value={form.location ?? ""}
                editing={editing}
                placeholder="City, Country"
                onChange={handleChange}
                error={errors.location}
              />
            </div>
          </Card>

          {/* Work */}
          <Card title="Work Details" icon={Briefcase}>
            <div className="space-y-4">
              <Field
                label="Job Title"
                name="jobTitle"
                value={form.jobTitle ?? ""}
                editing={editing}
                placeholder="e.g. Security Administrator"
                onChange={handleChange}
                error={errors.jobTitle}
              />
              <Field
                label="Department"
                name="department"
                value={form.department ?? ""}
                editing={editing}
                placeholder="e.g. IT Security"
                onChange={handleChange}
                error={errors.department}
              />

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Account Details
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Joined
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> User ID
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
                    #{profile?.userId}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bio */}
        <Card title="About" icon={FileText}>
          <Field
            label="Bio"
            name="bio"
            value={form.bio ?? ""}
            editing={editing}
            textarea
            placeholder="Tell us a bit about yourself…"
            onChange={handleChange}
          />
        </Card>

        {/* Security */}
        {profile?.provider === "local" && (
          <Card title="Security" icon={Lock} accent="red">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    Password
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Change your login password
                  </p>
                </div>
                <button
                  onClick={() => setShowPwSection((s) => !s)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {showPwSection ? "Cancel" : "Change"}
                </button>
              </div>

              {showPwSection && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={pw.current}
                        onChange={(e) =>
                          setPw((p) => ({ ...p, current: e.target.value }))
                        }
                        placeholder="••••••••"
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        {showCurrent ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={pw.next}
                        onChange={(e) =>
                          setPw((p) => ({ ...p, next: e.target.value }))
                        }
                        placeholder="Min 8 characters"
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        {showNew ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Minimum 8 characters</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={pw.confirm}
                      onChange={(e) =>
                        setPw((p) => ({ ...p, confirm: e.target.value }))
                      }
                      placeholder="Repeat new password"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={pwSaving || !pw.current || !pw.next || !pw.confirm}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {pwSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {pwSaving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}