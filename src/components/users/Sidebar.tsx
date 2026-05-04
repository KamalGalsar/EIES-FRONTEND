// components/users/Sidebar.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  GitBranch,
  Key,
  Settings,
  Users,
  Shield,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.name || user?.email?.split("@")[0] || "Guest";
  const userRole = user?.role || "Member";

  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(true);

  const token = localStorage.getItem("accessToken") || "";

  useEffect(() => {
    const fetchRiskScore = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Risk/average-blast-radius`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch risk score: ${response.status}`);
        const data = await response.json();
        const avgBlastFraction = data.averageBlastRadius;
        const computedScore = avgBlastFraction * 10;
        setRiskScore(computedScore);
      } catch (err) {
        console.error("Error fetching risk score for sidebar:", err);
        setRiskScore(null);
      } finally {
        setLoadingRisk(false);
      }
    };
    fetchRiskScore();
  }, [token]);

  const getInitials = (name: string) => {
    if (!name || name === "Guest") return "G";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const userInitials = getInitials(displayName);

  // Alerts and History removed
  const menuItems = [
    { path: "/users", label: "Risk Overview", icon: Activity },
    { path: "/users/directory", label: "Entra Directory", icon: Users },
    { path: "/users/attack-paths", label: "Attack Paths", icon: GitBranch },
    { path: "/users/permissions", label: "Permissions", icon: Key },
    { path: "/users/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/users") return location.pathname === "/users";
    return location.pathname.startsWith(path);
  };

  const riskScoreDisplay = loadingRisk
    ? "Loading..."
    : riskScore !== null
    ? `${riskScore.toFixed(1)}/10`
    : "Unavailable";

  const riskScoreColor =
    riskScore !== null
      ? riskScore >= 7
        ? "text-red-600 dark:text-red-400"
        : riskScore >= 4
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-green-600 dark:text-green-400"
      : "text-gray-500";

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl md:shadow-none`}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div
          onClick={() => {
            navigate("/");
            onClose();
          }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">EIES Risk</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
            {userInitials}
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-medium">{displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
            <p className={`text-xs font-bold ${riskScoreColor}`}>
              Risk Score: {riskScoreDisplay}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Analysis</p>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </p>
          <div className="mt-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Live Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}