// src/components/users/Sidebar.tsx 

import { 
  Activity, 
  GitBranch, 
  Key, 
  AlertTriangle, 
  FileText, 
  Settings,
  ChevronRight,
  Shield,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  userRole: string;
  riskScore: number;
}

export default function Sidebar({ activeTab, setActiveTab, userName, userRole, riskScore }: SidebarProps) {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'overview', label: 'Risk Overview', icon: Activity },
    { id: 'attack-paths', label: 'Attack Paths', icon: GitBranch },
    { id: 'permissions', label: 'Permissions', icon: Key },
    { id: 'alerts', label: 'Active Alerts', icon: AlertTriangle, badge: '3' },
    { id: 'history', label: 'Risk History', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-screen fixed left-0 top-0 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div 
    onClick={() => window.location.href = '/'} 
    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
  >
    <Shield className="w-8 h-8 text-blue-600" />
    <span className="text-xl font-bold text-gray-900 dark:text-white">EIES Risk</span>
    </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold">
            {userName?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-medium">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
            <p className={`text-xs font-bold ${getRiskColor(riskScore)}`}>
              Risk Score: {riskScore}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
              </div>
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