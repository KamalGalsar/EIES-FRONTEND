// components/admin/Sidebar.tsx
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  Shield, 
  Brain,
  FileText,
  Scale,
  Settings,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RoleType } from '../../types/admin';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { 
    name: string; 
    role: RoleType;    
    roleLevel: number;
  };
}

export default function Sidebar({ activeTab, setActiveTab, currentUser }: SidebarProps) {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: [1,2,3,4,5,6,7] },
    { id: 'admin-management', label: 'Admin Management', icon: Users, roles: [1,2,3,4,5] },
    { id: 'role-hierarchy', label: 'Role Hierarchy', icon: GitBranch, roles: [1,2,3,4,5,6] },
    { id: 'governance', label: 'Governance Controls', icon: Shield, roles: [1,2,3,4] },
    { id: 'ai-controls', label: 'AI Controls', icon: Brain, roles: [1,2] },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText, roles: [1,2,3,4,5,6] },
    { id: 'compliance', label: 'Compliance', icon: Scale, roles: [1,2,3,4] },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: [1,2,5] },
  ];

  // Filter menu items based on user's role level
  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(currentUser.roleLevel)
  );

  // Tailwind classes for each role badge
  const getRoleBadgeColor = (role: RoleType): string => {
    const colors: Record<RoleType, string> = {
      CEO: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      CTO: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      DIRECTOR: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      DIRECTORUK: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30',
      SrVP: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
      BU_HEAD: 'bg-green-500/20 text-green-500 border-green-500/30',
      VPTECH: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
      ADMIN_MANAGER: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      SECURITY_ADMIN: 'bg-red-500/20 text-red-500 border-red-500/30',
      ANALYST: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
    };
    return colors[role] || 'bg-gray-500/20 text-gray-500'; // fallback
  };

  return (
    <div className="w-64 bg-[#0F172A] h-screen fixed left-0 top-0 text-gray-300 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold text-white">EIES</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-medium">{currentUser.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.role}
              </span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500'
                  : 'hover:bg-gray-800/50 text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
            </button>
          );
        })}
      </nav>

      {/* Profile shortcut */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => navigate('/admin/profile')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-colors"
        >
          <UserCircle className="w-5 h-5" />
          <span className="text-sm">My Profile</span>
        </button>
      </div>
    </div>
  );
}