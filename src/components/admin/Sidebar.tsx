// components/admin/Sidebar.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  Shield, 
  Brain,
  FileText,
  Scale,
  Settings,
  UserCircle,
  X
} from 'lucide-react';
import { type RoleType, CURRENT_USER } from '../../types/admin';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'overview', path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin-management', path: '/admin/admin-management', label: 'Admin Management', icon: Users },
    { id: 'role-hierarchy', path: '/admin/role-hierarchy', label: 'Role Hierarchy', icon: GitBranch },
    { id: 'governance', path: '/admin/governance', label: 'Governance Controls', icon: Shield },
    { id: 'ai-controls', path: '/admin/ai-controls', label: 'AI Controls', icon: Brain },
    { id: 'audit-logs', path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'compliance', path: '/admin/compliance', label: 'Compliance', icon: Scale },
    { id: 'settings', path: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

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
    return colors[role] || 'bg-gray-500/20 text-gray-500';
  };

  return (
    <>
      {/* Desktop sidebar always visible, mobile drawer */}
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
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">EIES</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              {CURRENT_USER.name.charAt(0)}
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">{CURRENT_USER.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadgeColor(CURRENT_USER.role)}`}>
                  {CURRENT_USER.role}
                </span>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  onClose(); // close sidebar on mobile after navigation
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              navigate('/admin/profile');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-sm">My Profile</span>
          </button>
        </div>
      </div>
    </>
  );
}