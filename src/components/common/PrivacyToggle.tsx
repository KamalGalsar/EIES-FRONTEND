import { Shield, ShieldOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PrivacyToggle() {
  const { privacyMode, togglePrivacy } = useAuth();

  return (
    <button
      onClick={() => togglePrivacy(!privacyMode)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 hover:scale-105"
      aria-label="Toggle Privacy Mode"
      title={privacyMode ? "Privacy Mode On (Masking Active)" : "Privacy Mode Off (Masking Disabled)"}
      type="button"
    >
      <span className={`absolute inset-0 rounded-full transition-colors ${
        privacyMode 
          ? "bg-blue-600 dark:bg-blue-500" 
          : "bg-gray-300 dark:bg-gray-600"
      }`} />
      
      <span className={`absolute top-0.5 left-0.5 inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
        privacyMode ? "translate-x-5" : "translate-x-0"
      }`}>
        {privacyMode ? (
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
        ) : (
          <ShieldOff className="h-4 w-4 text-gray-500" strokeWidth={2.5} />
        )}
      </span>
    </button>
  );
}
