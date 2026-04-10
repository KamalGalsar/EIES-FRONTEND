// components/users/Sidebar.tsx
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  GitBranch,
  Key,
  AlertTriangle,
  FileText,
  Settings,
  Users,
  Shield,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/users", label: "Risk Overview", icon: Activity },
    { path: "/users/directory", label: "User Directory", icon: Users },
    { path: "/users/attack-paths", label: "Attack Paths", icon: GitBranch },
    { path: "/users/permissions", label: "Permissions", icon: Key },
    { path: "/users/alerts", label: "Active Alerts", icon: AlertTriangle, badge: "3" },
    { path: "/users/history", label: "Risk History", icon: FileText },
    { path: "/users/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/users") {
      return location.pathname === "/users";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl md:shadow-none
    `}>
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div
          onClick={() => {
            navigate("/");
            onClose();
          }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">EIES Risk</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold">
            O
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-medium">OpsEngineer1</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Identity</p>
            <p className="text-xs font-bold text-red-600">Risk Score: 87</p>
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
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge && !active && (
                <span className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Analysis</p>
          <p className="text-sm text-gray-900 dark:text-white">2026-03-17 14:30</p>
          <div className="mt-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Live Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}