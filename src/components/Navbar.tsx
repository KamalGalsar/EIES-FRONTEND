// components/Navbar.tsx
import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // changed from Link to NavLink
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAuthModal } from '../context/AuthModalContext'; // Blur

function ThemeToggle() {
  const getIsDark = () => {
    if (typeof document === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isDark, setIsDark] = useState(getIsDark());

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setIsDark(getIsDark());
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const toggle = () => setIsDark(!isDark);

  return (
    <button
      onClick={toggle}
      className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/40"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      type="button"
    >
      <span className={`absolute inset-0 rounded-full transition-colors ${
        isDark 
          ? "bg-indigo-600 dark:bg-indigo-500" 
          : "bg-amber-400"
      }`} />
      
      <span className={`absolute top-0.5 left-0.5 inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white transition-transform duration-200 ease-in-out ${
        isDark ? "translate-x-7" : "translate-x-0"
      }`}>
        {isDark ? (
          <svg className="h-4 w-4 text-indigo-700" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M21.64 13A9 9 0 1111 2.36 7 7 0 0021.64 13z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </span>
    </button>
  );
}

function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const { openModal } = useAuthModal();
  const handleAuthClick = (mode: 'signin' | 'signup') => {
    openModal(mode);
    setIsOpen(false);
  };

 const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showToast('Signed out successfully', 'error');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Logout failed', 'error');
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleDashboardClick = () => {
    if (user?.role === 'Admin') {
      navigate('/admin');
    } else {
      navigate('/users/opsengineer1');
    }
    setIsOpen(false);
  };

  const handleDemoClick = () => {
    navigate('/demo');
    setIsOpen(false);
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };

 return (
    <div className="relative ml-2" ref={menuRef}>
      <button
        onClick={() => !isLoggingOut && setIsOpen(!isOpen)} // disable while logging out
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
          isAuthenticated 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
        } ${isLoggingOut ? 'opacity-70 cursor-wait' : ''}`}
        aria-label="Profile menu"
        title="Profile menu"
        type="button"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          // Loading spinner
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" fill="none" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : isAuthenticated ? (
          <span className="text-sm font-semibold">{getInitials()}</span>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 z-50">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25" />
          
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-4 py-4 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <p className="text-xs text-black/60 dark:text-white/60">
                {isAuthenticated ? 'Signed in as' : 'Not signed in'}
              </p>
              <p className="text-sm font-semibold text-black dark:text-white mt-0.5 flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                    Guest User
                  </>
                )}
              </p>
              {isAuthenticated && user?.email && (
                <p className="text-xs text-black/50 dark:text-white/50 mt-1 truncate">
                  {user.email}
                </p>
              )}
            </div>
            
            <div className="p-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleDashboardClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50 transition-all group"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="9" />
                        <rect x="14" y="3" width="7" height="5" />
                        <rect x="14" y="12" width="7" height="9" />
                        <rect x="3" y="16" width="7" height="5" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Dashboard</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">View your analytics</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/50 dark:hover:to-pink-950/50 transition-all group mt-1"
                  >
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Profile</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Manage your account</span>
                    </div>
                  </button>

                  <div className="border-t border-black/10 dark:border-white/10 my-2"></div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-950/50 dark:hover:to-orange-950/50 transition-all group"
                  >
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="h-4 w-4 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Sign Out</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">End your session</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50 transition-all group"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Sign In</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Access your dashboard</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/50 dark:hover:to-pink-950/50 transition-all group mt-1"
                  >
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Create Account</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Join EIES today</span>
                    </div>
                  </button>
                </>
              )}
            </div>
            
            {!isAuthenticated && (
              <div className="border-t border-black/10 dark:border-white/10 p-3 bg-gray-50/50 dark:bg-gray-800/50">
                <button
                  onClick={handleDemoClick}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-md"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Try Demo without account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// For active page styling 
export default function Navbar() {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `transition-colors pb-1 ${
      isActive
        ? 'text-blue-600 dark:text-blue-300 font-medium'
        : 'text-black/70 dark:text-white/80 hover:text-black dark:hover:text-white'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-gray-900/60 border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-black dark:text-white">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center dark:from-blue-500 dark:to-indigo-500">
            <span className="text-white font-black text-lg">E</span>
          </div>
          <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            EIES
          </span>
        </NavLink>

        {/* Navigation Links using NavLink */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/product" className={getNavLinkClass}>
            Product
          </NavLink>
          <NavLink to="/solutions" className={getNavLinkClass}>
            Solutions
          </NavLink>
          <NavLink to="/resources" className={getNavLinkClass}>
            Resources
          </NavLink>
          <NavLink to="/company" className={getNavLinkClass}>
            Company
          </NavLink>
        </nav>

        {/* Right side - Theme Toggle & Profile */}
        <div className="flex items-center">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}