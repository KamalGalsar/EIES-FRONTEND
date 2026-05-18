import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Clock, 
  ChevronRight, 
  Activity,
  Mail,
  Shield,
  Calendar,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

interface UserDetail {
  id: number;
  alias: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  provider: string;
  profilePicture?: string;
}

interface UserActivity {
  id: number;
  title: string;
  description: string;
  severity: string;
  createdAt: string;
  actionType: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  const { accessToken, user: currentUser } = useAuth();
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND}/api/UserManagement/users`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [accessToken]);

  const fetchUserActivity = async (userId: number) => {
    const targetUser = users.find(u => u.id === userId);
    // Block viewing CEO logs, UNLESS the CEO is viewing their own
    if (targetUser?.role === 'CEO' && userId !== currentUser?.id) {
      showToast('Viewing CEO activity is restricted', 'warning');
      return;
    }

    setLoadingActivity(true);
    try {
      const response = await fetch(`${BACKEND}/api/UserManagement/users/${userId}/activity`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserActivity(data);
        setShowActivityModal(true);
      } else if (response.status === 403) {
        showToast('Access to these logs is restricted', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      showToast('Failed to load user activity', 'error');
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleToggleVerification = async (userId: number) => {
    const targetUser = users.find(u => u.id === userId);
    
    if (userId === currentUser?.id) {
      showToast('You cannot deactivate your own account', 'error');
      return;
    }

    if (targetUser?.role === 'CEO') {
      showToast('The CEO account cannot be deactivated', 'error');
      return;
    }

    const action = targetUser?.isVerified ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${targetUser?.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND}/api/UserManagement/users/${userId}/toggle-verification`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const result = await response.json();
        setUsers(users.map(u => u.id === userId ? { ...u, isVerified: result.isVerified } : u));
        showToast(`User ${result.isVerified ? 'activated' : 'deactivated'} successfully`, 'success');
      } else {
        const err = await response.text();
        showToast(err || 'Failed to update user status', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle verification:', error);
      showToast('Failed to update user status', 'error');
    }
  };

  const openActivity = (user: UserDetail) => {
    setSelectedUser(user);
    fetchUserActivity(user.id);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.alias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage platform access and monitor user activities</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role & Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-40 bg-gray-100 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No users found matching your search
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.name[0]
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-100 dark:border-blue-800/50">
                          <Shield className="w-3 h-3" /> {user.role}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize font-medium">{user.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                        user.isVerified 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30' 
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30'
                      }`}>
                        {user.isVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openActivity(user)}
                          disabled={user.role === 'CEO' && user.id !== currentUser?.id}
                          className={`p-2 rounded-lg transition-all ${
                            user.role === 'CEO' && user.id !== currentUser?.id
                              ? 'text-gray-300 cursor-not-allowed opacity-50' 
                              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }`}
                          title={
                            user.role === 'CEO' && user.id !== currentUser?.id
                              ? 'Activity logs restricted for CEO'
                              : 'View User Activity Logs'
                          }
                        >
                          <Activity className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleVerification(user.id)}
                          disabled={user.id === currentUser?.id || user.role === 'CEO'}
                          className={`p-2 rounded-lg transition-all ${
                            (user.id === currentUser?.id || user.role === 'CEO')
                              ? 'text-gray-300 cursor-not-allowed opacity-50'
                              : user.isVerified 
                                ? 'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          }`}
                          title={
                            user.id === currentUser?.id 
                              ? 'You cannot deactivate yourself' 
                              : user.role === 'CEO' 
                                ? 'CEO cannot be deactivated' 
                                : user.isVerified ? 'Click to Deactivate User' : 'Click to Reactivate User'
                          }
                        >
                          {user.isVerified ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity History</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUser.name}'s system logs</p>
                </div>
              </div>
              <button 
                onClick={() => setShowActivityModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loadingActivity ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : userActivity.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="font-medium">No activity recorded yet</p>
                  <p className="text-xs mt-1">This user hasn't performed any logged actions</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-gray-100 dark:before:bg-gray-800">
                  {userActivity.map((act) => (
                    <div key={act.id} className="relative pl-12">
                      <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl border-4 border-white dark:border-gray-900 flex items-center justify-center z-10 ${
                        act.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                        act.severity === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      }`}>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{act.title}</span>
                          <span className="text-[10px] font-medium text-gray-400">{formatDate(act.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{act.description}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-white dark:bg-gray-800 text-[9px] font-bold text-gray-500 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-700 uppercase tracking-wider">
                            {act.actionType}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 text-right">
              <button 
                onClick={() => setShowActivityModal(false)}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Close Activity Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
