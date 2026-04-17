// Frontend/src/components/users/SsoButtons.tsx

import { useState, useEffect, useRef } from "react";

interface SsoButtonsProps {
  mode?: "signin" | "signup";
}

const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

export default function SsoButtons({ mode = "signin" }: SsoButtonsProps) {
  const action = mode === "signin" ? "Sign in" : "Sign up";
  const [loading, setLoading] = useState<string | null>(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [enterpriseDomain, setEnterpriseDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const modalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showEnterpriseModal && modalInputRef.current) {
      modalInputRef.current.focus();
    }
  }, [showEnterpriseModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showEnterpriseModal) {
        setShowEnterpriseModal(false);
        setEnterpriseDomain("");
        setDomainError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showEnterpriseModal]);

  const redirect = (provider: string) => {
    setLoading(provider);
    window.location.href = `${BACKEND}/auth/${mode}/${provider}`;
  };

  const openEnterpriseModal = () => {
    setShowEnterpriseModal(true);
    setEnterpriseDomain("");
    setDomainError("");
  };

  const submitEnterpriseDomain = () => {
    const domain = enterpriseDomain.trim();
    if (!domain) {
      setDomainError("Domain cannot be empty");
      return;
    }
    setLoading("enterprise");
    setShowEnterpriseModal(false);
    window.location.href = `${BACKEND}/auth/${mode}/enterprise?domain=${encodeURIComponent(domain)}`;
  };

  const closeModal = () => {
    setShowEnterpriseModal(false);
    setEnterpriseDomain("");
    setDomainError("");
  };

  const base =
    "w-full inline-flex items-center justify-center gap-3 rounded-lg px-4 py-3 font-medium " +
    "transition-all duration-200 focus:outline-none focus:ring-4 text-sm sm:text-base " +
    "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed " +
    "transform hover:scale-[1.02] shadow-lg hover:shadow-xl";
  const icon = "h-5 w-5 flex-shrink-0";

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* Google */}
      <button
        onClick={() => redirect("google")}
        disabled={loading !== null}
        className={`${base} bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-400/40 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700`}
        type="button"
      >
        {loading === "google" ? (
          <svg
            className={`${icon} animate-spin`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg className={icon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span>
          {loading === "google" ? "Redirecting…" : `${action} with Google`}
        </span>
      </button>

      {/* GitHub */}
      <button
        onClick={() => redirect("github")}
        disabled={loading !== null}
        className={`${base} bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700/40 dark:bg-black dark:hover:bg-gray-900`}
        type="button"
      >
        {loading === "github" ? (
          <svg
            className={`${icon} animate-spin`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg className={icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.5v-2c-3.4.7-4.1-1.6-4.1-1.6-.6-1.5-1.4-1.9-1.4-1.9-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.3 1.8 1.3 1.1 1.8 3 1.3 3.7 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.6-1.4-5.6-6.3 0-1.4.5-2.5 1.3-3.4-.1-.3-.6-1.7.1-3.5 0 0 1-.3 3.5 1.3a12.1 12.1 0 0 1 6.4 0c2.5-1.6 3.5-1.3 3.5-1.3.7 1.8.2 3.2.1 3.5.8.9 1.3 2 1.3 3.4 0 5-2.9 6-5.6 6.3.4.4.8 1 .8 2v3c0 .3.2.6.8.5A12 12 0 0 0 12 .5z" />
          </svg>
        )}
        <span>
          {loading === "github" ? "Redirecting…" : `${action} with GitHub`}
        </span>
      </button>

      {/* Microsoft */}
      <button
        onClick={() => redirect("microsoft")}
        disabled={loading !== null}
        className={`${base} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400/40`}
        type="button"
      >
        {loading === "microsoft" ? (
          <svg
            className={`${icon} animate-spin`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg className={icon} viewBox="0 0 24 24">
            <rect width="12" height="12" x="0" y="0" fill="#F35325" />
            <rect width="12" height="12" x="12" y="0" fill="#81BC06" />
            <rect width="12" height="12" x="0" y="12" fill="#05A6F0" />
            <rect width="12" height="12" x="12" y="12" fill="#FFBA08" />
          </svg>
        )}
        <span>
          {loading === "microsoft"
            ? "Redirecting…"
            : `${action} with Microsoft`}
        </span>
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/10 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white dark:bg-gray-900 text-black/50 dark:text-white/50">
            Enterprise options
          </span>
        </div>
      </div>

      {/* Enterprise SSO */}
      <button
        onClick={openEnterpriseModal}
        disabled={loading !== null}
        className={`${base} bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-400/40`}
        type="button"
      >
        {loading === "enterprise" ? (
          <svg
            className={`${icon} animate-spin`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg className={icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93C9.33 17.79 7 14.5 7 11V7.18L12 5z" />
          </svg>
        )}
        <span>
          {loading === "enterprise"
            ? "Redirecting…"
            : "Enterprise SSO (SAML / OIDC)"}
        </span>
      </button>

      {showEnterpriseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with icon and close button */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93C9.33 17.79 7 14.5 7 11V7.18L12 5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Enterprise SSO
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter your organisation domain to continue with SAML or OIDC
                single sign-on.
              </p>

              <label
                htmlFor="domain"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Domain
              </label>
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                  https://
                </span>
                <input
                  ref={modalInputRef}
                  type="text"
                  id="domain"
                  value={enterpriseDomain}
                  onChange={(e) => {
                    setEnterpriseDomain(e.target.value);
                    setDomainError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitEnterpriseDomain();
                  }}
                  placeholder="example.com"
                  className="w-full pl-20 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
              {domainError && (
                <p className="mb-4 text-sm text-red-600 dark:text-red-400">
                  {domainError}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={submitEnterpriseDomain}
                  disabled={loading !== null}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400/40 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
                <button
                  onClick={closeModal}
                  disabled={loading !== null}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-400/40 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}