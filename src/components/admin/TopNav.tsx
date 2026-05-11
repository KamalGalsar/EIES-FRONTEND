// Frontend/src/components/admin/TopNav.tsx
import { useState, useRef, useEffect } from "react";
import { Search, Bell, User, LogOut, Settings, ChevronLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

interface TopNavProps {
  lockdown: boolean;
  onMenuClick: () => void;
}

export default function TopNav({ lockdown, onMenuClick }: TopNavProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showProfileMenu) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showProfileMenu]);

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully', 'success');
    navigate('/');
  };

  // Dynamic user data
  const displayName = user?.name || user?.email?.split('@')[0] || 'Admin';
  const userRole = user?.role || 'ADMIN_MANAGER';

  // Get initials: first letter of first name + first letter of last name
  const getInitials = (name: string) => {
    if (!name || name === 'Admin') return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return (first + last).toUpperCase();
  };

  const userInitials = getInitials(displayName);

  return (
    <header className={`fixed top-0 right-0 left-0 md:left-64 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ${lockdown ? 'mt-8' : ''}`}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left section: Menu button (mobile) + Back button + search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>

          <div className="flex-1 max-w-xl hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search governance, roles, audits..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
                disabled={lockdown}
              />
            </div>
          </div>
        </div>

        {/* Right section: Profile */}
        <div className="flex items-center gap-2 sm:gap-4">

          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-medium overflow-hidden">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50"
              >
                <button
                  onClick={() => { navigate('/admin/profile'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => { navigate('/admin/settings'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="px-4 pb-2 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={lockdown}
          />
        </div>
      </div>
    </header>
  );
}