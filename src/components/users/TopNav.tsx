// components/users/TopNav.tsx
import { useState, useRef, useEffect } from "react";
import { Search, Bell, User, LogOut, ChevronLeft, Menu, ShieldAlert, Zap, BarChart3, CheckCircle2, Clock, Trash2, TrendingUp, BellRing, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ThemeToggle from "../common/ThemeToggle";
import PrivacyToggle from "../common/PrivacyToggle";

interface TopNavProps {
  onEmergency?: () => void;
  onMenuClick: () => void;
  riskScoreDisplay?: string;
  riskLevel?: string;
  riskLevelColor?: string;
  totalUsers?: number | null;
  activeGroups?: number | null;
  loadingStats?: boolean;
}

export default function TopNav({
  onEmergency,
  onMenuClick,
  riskScoreDisplay = "--/10",
  riskLevel = "Loading...",
  riskLevelColor = "text-green-600 dark:text-green-400",
  totalUsers = null,
  activeGroups = null,
  loadingStats = false
}: TopNavProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = sessionStorage.getItem("session_notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Persist to sessionStorage whenever notifications change
  useEffect(() => {
    sessionStorage.setItem("session_notifications", JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BACKEND}/api/Alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Map backend Alert model to UI Notification structure
        const mapped = data.map((a: any) => {
          let title = a.title;
          let message = a.description;
          let severity = a.severity || 'info';

          // Priority 1: Detect status from message text (Red/Green)
          const lowerMsg = message.toLowerCase();
          const isFailed = lowerMsg.includes("failed") || lowerMsg.includes("success: false") || lowerMsg.includes("error");
          const isSuccess = lowerMsg.includes("succeeded") || lowerMsg.includes("success: true") || lowerMsg.includes("new password:");

          if (isFailed) {
            severity = 'critical';
          } else if (isSuccess) {
            severity = 'success';
          } else if (a.type === 'remediation') {
            severity = 'success'; // Default remediation to success if no failure detected
          } else {
            // Fallback to backend severity or info
            if (severity === 'high' || severity === 'critical') severity = 'critical';
            else if (severity === 'success') severity = 'success';
            else severity = 'info';
          }

          // --- LEGACY CLEANUP LOGIC ---
          // If it follows the old "User performed remediation: Action..." pattern
          if (title === "Remediation executed" || title === "Remediation triggered (mock mode)") {
            const parts = message.split('performed remediation: ');
            if (parts.length > 1) {
              const actionParts = parts[1].split(' – ');
              title = actionParts[0]; // Set Action as title
              message = actionParts[1] || parts[1]; // Set rest as message
            }
          }
          // Remove the "User performed remediation: " prefix if it still exists
          message = message.replace(/.*performed remediation: /i, '');
          // ----------------------------

          return {
            id: a.id,
            severity: severity,
            title: title,
            message: message,
            time: formatTime(a.createdAt),
            read: a.isRead,
            alertType: a.type
          };
        });
        setNotifications(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const fresh = mapped.filter((n: any) => !existingIds.has(n.id));
          if (fresh.length === 0) return prev;
          return [...fresh, ...prev];
        });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();

    // Format for IST display
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const istTime = new Intl.DateTimeFormat('en-IN', options).format(date);

    // Calculate difference in seconds
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // If diff is negative (clock drift), treat as 'Just now'
    if (diffSeconds < 30) return `Just now (${istTime} IST)`;

    const diffMins = Math.floor(diffSeconds / 60);
    if (diffMins < 60) return `${diffMins} mins ago (${istTime} IST)`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago (${istTime} IST)`;

    return `${date.toLocaleDateString()} ${istTime} IST`;
  };

  const getIcon = (severity: string, type: string) => {
    if (severity === 'critical' || severity === 'high') return <ShieldAlert className="w-4 h-4 text-red-500" />;
    if (type === 'remediation' || severity === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    return <Zap className="w-4 h-4 text-amber-500" />;
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${BACKEND}/api/Alerts/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${BACKEND}/api/alerts/mark-all-read`, { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    // Try to extract password if it exists
    let toCopy = text;
    if (text.includes("New Password: ")) {
      const match = text.match(/New Password: ([^\s]+)/);
      if (match) toCopy = match[1];
    }

    navigator.clipboard.writeText(toCopy);
    setCopiedId(id);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Handle Profile Menu
      if (menuRef.current && !menuRef.current.contains(target) && buttonRef.current && !buttonRef.current.contains(target)) {
        setShowProfileMenu(false);
      }

      // Handle Notifications
      if (notificationRef.current && !notificationRef.current.contains(target) && bellRef.current && !bellRef.current.contains(target)) {
        setShowNotifications(false);
      }
    }

    if (showProfileMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showNotifications]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("session_notifications");
    logout();
    navigate("/signin");
  };

  // Dynamic user data
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const userRole = user?.role || 'Member';

  // Get initials: first letter of first name + first letter of last name
  const getInitials = (name: string) => {
    if (!name || name === 'User') return 'U';
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
    <header className="fixed top-0 right-0 left-0 md:left-64 h-auto min-h-[4rem] md:min-h-[5rem] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-[60] transition-all duration-300 flex items-center shadow-xs">
      <div className="flex flex-wrap items-center justify-between w-full px-4 sm:px-6 py-2 gap-y-2">
        {/* Left section */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Back</span>
          </button>
        </div>

        {/* Central Statistics Section */}
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 xl:gap-8 mx-auto order-last w-full lg:w-auto lg:order-none pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700/60">
          {/* Risk Score */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">Risk Score</span>
            <span className="text-base xl:text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">
              {loadingStats ? "..." : riskScoreDisplay}
            </span>
          </div>

          {/* Risk Level */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">Risk Level</span>
            <span className={`text-base xl:text-lg font-extrabold ${riskLevelColor} mt-0.5`}>
              {loadingStats ? "..." : riskLevel}
            </span>
          </div>

          {/* Total Users */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">Total Users</span>
            <span className="text-base xl:text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
              {loadingStats ? "..." : totalUsers !== null ? totalUsers : "Error"}
            </span>
          </div>

          {/* Active Groups */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">Active Groups</span>
            <span className="text-base xl:text-lg font-extrabold text-gray-700 dark:text-gray-300 mt-0.5">
              {loadingStats ? "..." : activeGroups !== null ? activeGroups : "Error"}
            </span>
          </div>

          {/* Live Graph Badge */}
          <div className="flex items-center bg-gray-50 dark:bg-gray-700/40 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-600/50">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1.5" />
            <span className="text-[9px] text-gray-500 dark:text-gray-400 tracking-tight font-semibold">Live Microsoft Graph Data</span>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700/60 mx-1 hidden sm:block"></div>
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-xl transition-all duration-200 ${showNotifications
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm border border-white dark:border-gray-800 animate-fade-in">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div
                ref={notificationRef}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[100] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" /> Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotifications([])}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400"
                      title="Clear all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">All caught up!</p>
                      <p className="text-xs text-gray-400 mt-1">No new security alerts</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                          onClick={() => markAsRead(n.id)}
                        >
                          {!n.read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                          )}
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg shrink-0 h-fit ${n.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                              n.severity === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                'bg-amber-100 dark:bg-amber-900/30'
                              }`}>
                              {getIcon(n.severity, n.alertType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-bold ${n.severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                                  n.severity === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                                    'text-amber-600 dark:text-amber-400'
                                  }`}>
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {n.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed break-words relative group/msg">
                                {n.message.split(/(\bSuccess: True\b|\bStatus: Succeeded\b|\bStatus: Success\b|\bStatus: Failed\b|\bSuccess: False\b)/i).map((part: string, i: number) => {
                                  const lower = part.toLowerCase();
                                  const isStatus = (lower.includes('success') || lower.includes('succeeded') || lower.includes('failed') || lower.includes('false')) && lower.includes('status') || lower.includes('success:');

                                  if (isStatus) {
                                    const isSuccess = (lower.includes('success') || lower.includes('succeeded')) && !lower.includes('failed') && !lower.includes('false');
                                    return (
                                      <span key={i} className="block mb-1">
                                        <span className={isSuccess ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>
                                          {part}
                                        </span>
                                      </span>
                                    );
                                  }
                                  return <span key={i} className="block mt-0.5 opacity-90">{part.replace(/^\. /, '')}</span>;
                                })}

                                {n.message.includes("New Password:") && n.severity === 'success' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(n.message, n.id);
                                    }}
                                    className="absolute right-0 top-0 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover/msg:opacity-100"
                                    title="Copy temporary password"
                                  >
                                    {copiedId === n.id ? (
                                      <Check className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white text-xs font-medium overflow-hidden">
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
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="w-4 h-4" />
                  Profile
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
    </header>
  );
}