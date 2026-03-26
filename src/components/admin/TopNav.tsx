import { useState } from 'react';
import { Search, Bell, User, LogOut, Settings } from 'lucide-react';
import { type CurrentUser } from '../../types/admin';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface TopNavProps {
  currentUser: CurrentUser;
  onLogout: () => void;
  lockdown: boolean;
  setLockdown: (value: boolean) => void;
}

export default function TopNav({ currentUser, onLogout, lockdown }: TopNavProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully', 'success');
    navigate('/');
  };

  return (
    <header className={`fixed top-0 right-0 left-64 h-16 bg-[#0F172A] border-b border-gray-800 z-40 ${lockdown ? 'mt-8' : ''}`}>
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search governance, roles, audits..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
              disabled={lockdown}
            />
          </div>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] border border-gray-800 rounded-lg shadow-xl py-1">
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                onClick={() => { navigate('/admin/profile'); setShowProfileMenu(false); }}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <hr className="my-1 border-gray-800" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}