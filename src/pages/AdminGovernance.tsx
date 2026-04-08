// Frontend/src/pages/AdminGovernance.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Search,
  Bell,
  User,
  LogOut,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  Eye,
  Server,
  Activity,
  Filter,
  Download,
  ChevronLeft
} from 'lucide-react';

// Types
const ROLE_LEVELS = {
  CEO: 1,
  CTO: 2,
  DIRECTOR: 3,
  DIRECTORUK: 3,
  SrVP: 4,
  BU_HEAD: 4,
  VPTECH: 4,
  ADMIN_MANAGER: 5,
  SECURITY_ADMIN: 6,
  ANALYST: 7
} as const;

type RoleType = keyof typeof ROLE_LEVELS;

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: RoleType;
  roleLevel: number;
  scope: string;
  status: 'active' | 'inactive' | 'locked';
  createdBy: string;
  immutable?: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: RoleType;
  roleLevel: number;
}

// Mock data
const MOCK_ADMINS: AdminUser[] = [
  {
    id: 1,
    name: "Bhavesh Goswami",
    email: "bhavesh@cloudthat.com",
    role: "CEO",
    roleLevel: 1,
    scope: "Global",
    status: "active",
    createdBy: "System",
    immutable: true,
    riskLevel: "low"
  },
  {
    id: 2,
    name: "Prarthit Mehta",
    email: "prarthit@cloudthat.com",
    role: "CTO",
    roleLevel: 2,
    scope: "Consulting",
    status: "active",
    createdBy: "Bhavesh Goswami",
    riskLevel: "low"
  },
  {
    id: 3,
    name: "Sachin Chokshi",
    email: "sachinc@cloudthat.com",
    role: "DIRECTORUK", 
    roleLevel: 3,
    scope: "General",
    status: "active",
    createdBy: "Prarthit Mehta",
    riskLevel: "medium"
  },
  {
    id: 4,
    name: "Nanda Kishore",
    email: "nanda@cloudthat.com",
    role: "SrVP",
    roleLevel: 3,
    scope: "General",
    status: "active",
    createdBy: "Prarthit Mehta",
    riskLevel: "low"
  },
  {
    id: 5,
    name: "Lakhan Kriplani",
    email: "lakhan@cloudthat.com",
    role: "VPTECH",
    roleLevel: 4,
    scope: "General",
    status: "active",
    createdBy: "Bhavesh Goswami",
    riskLevel: "medium"
  }
];

// Mock current user
const CURRENT_USER: CurrentUser = {
  id: 1,
  name: "Bhavesh Goswami",
  email: "bhavesh@cloudthat.com",
  role: "CEO",
  roleLevel: 1
};

// Permission checker
const canModify = (currentUser: CurrentUser, targetUser: AdminUser): boolean => {
  if (targetUser.immutable) return false;
  if (targetUser.role === 'CEO') return false;
  return currentUser.roleLevel < targetUser.roleLevel;
};

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin-management', label: 'Admin Management', icon: Users },
    { id: 'role-hierarchy', label: 'Role Hierarchy', icon: GitBranch },
    { id: 'governance', label: 'Governance Controls', icon: Shield },
    { id: 'ai-controls', label: 'AI Controls', icon: Brain },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'compliance', label: 'Compliance', icon: Scale },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-screen fixed left-0 top-0 text-gray-700 dark:text-gray-300 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">EIES Admin</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
            {CURRENT_USER.name.charAt(0)}
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-medium">{CURRENT_USER.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{CURRENT_USER.role}</p>
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
                  ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
    </div>
  );
};

const TopNav = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search governance, roles, audits..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                {CURRENT_USER.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{CURRENT_USER.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{CURRENT_USER.role}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => { navigate('/admin/profile'); setShowProfileMenu(false); }}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
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
};

export default function AdminGovernance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [admins] = useState(MOCK_ADMINS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'ANALYST' as RoleType, scope: '' });

  // Overview stats
  const stats = [
    { label: 'Total Identities', value: '12,430', change: '+5.2%', icon: Users, color: 'blue' },
    { label: 'High Risk Identities', value: '184', change: '-12%', icon: AlertTriangle, color: 'red' },
    { label: 'Unhealthy Permissions', value: '23', change: '+3', icon: Shield, color: 'orange' },
    { label: 'Shadow Admins', value: '11', change: '-2', icon: Eye, color: 'purple' },
    { label: 'Service Principal Without Owner', value: '7', change: '+1', icon: Server, color: 'yellow' },
    { label: 'Blast Radius Score', value: '8.7/10', change: '-0.3', icon: Activity, color: 'green' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Governance Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className={`p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <span className={`text-sm ${stat.change.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Trend (Last 30 Days)</h3>
          <div className="h-48 flex items-end gap-2">
            {[65, 45, 75, 55, 80, 60, 70, 50, 85, 55, 65, 45].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t h-24 relative">
                  <div className="absolute bottom-0 w-full bg-blue-600 dark:bg-blue-500 rounded-t transition-all" style={{ height: `${height}%` }} />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">D{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Unhealthy Permissions Distribution</h3>
          <div className="space-y-4">
            {[
              { name: 'Privileged Access', value: 45, color: 'red' },
              { name: 'Service Principals', value: 30, color: 'orange' },
              { name: 'Directory Roles', value: 15, color: 'yellow' },
              { name: 'App Permissions', value: 10, color: 'green' }
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  <span className="text-gray-900 dark:text-white">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-${item.color}-600 dark:bg-${item.color}-500 rounded-full`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top 5 Blast Radius Identities</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {admins.slice(0, 5).map((admin) => (
            <div key={admin.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{admin.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{admin.role} • {admin.scope}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  admin.riskLevel === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                  admin.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                  'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {admin.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdminManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
        {CURRENT_USER.role === 'CEO' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-400/40"
          >
            <Plus className="w-4 h-4" />
            Add Admin
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scope</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {admins.map((admin) => {
              const canModifyAdmin = canModify(CURRENT_USER, admin);
              return (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{admin.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      admin.role === 'CEO' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      admin.role === 'CTO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      admin.role === 'DIRECTOR' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{admin.scope}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-sm ${
                      admin.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        admin.status === 'active' ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'
                      }`}></span>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{admin.createdBy}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={!canModifyAdmin}
                        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          canModifyAdmin ? 'text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                        title={!canModifyAdmin ? 'Insufficient privileges' : ''}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        disabled={!canModifyAdmin || admin.immutable}
                        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          canModifyAdmin && !admin.immutable ? 'text-red-600 dark:text-red-400' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                        title={admin.immutable ? 'Cannot delete CEO' : !canModifyAdmin ? 'Insufficient privileges' : ''}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Admin</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value as RoleType})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="ANALYST">Analyst</option>
                <option value="SECURITY_ADMIN">Security Admin</option>
                <option value="ADMIN_MANAGER">Admin Manager</option>
                <option value="BU_HEAD">BU Head</option>
                <option value="DIRECTOR">Director</option>
                <option value="CTO">CTO</option>
                <option value="DIRECTOR - UK">DIRECTOR - UK</option>
                <option value="VP - TECH">VP - TECH</option>
                <option value="Sr. VP">Sr. VP</option>Sr. VP
                <option value="CEO" disabled>CEO (Only one allowed)</option>
              </select>
              <input
                type="text"
                placeholder="Scope"
                value={newAdmin.scope}
                onChange={(e) => setNewAdmin({...newAdmin, scope: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-400/40"
                >
                  Add Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRoleHierarchy = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Hierarchy</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div className="ml-4">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg w-fit">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-semibold text-yellow-700 dark:text-yellow-400">CEO (Level 1)</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">• Full System Access</span>
            </div>
            
            <div className="ml-8 mt-2 space-y-2">
              <div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg w-fit">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">CTO (Level 2)</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">• Technology Strategy</span>
                </div>
                
                <div className="ml-8 mt-2 space-y-2">
                  {[1, 2].map((_, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-lg w-fit">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-semibold text-purple-700 dark:text-purple-400">Director (Level 3)</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">• Oerations / General</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg w-fit">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-green-700 dark:text-green-400">BU Head (Level 4)</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">• Regional Operations</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-lg w-fit">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="font-semibold text-orange-700 dark:text-orange-400">Admin Manager (Level 5)</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">• Administrative Controls</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGovernance = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Governance Controls</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privilege Controls</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-white">Enable PIM Enforcement</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Just-in-time privileged access</p>
            </div>
            <button className={`relative w-12 h-6 rounded-full transition-colors ${true ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${true ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-white">Require Dual Approval</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Two admins needed for role changes</p>
            </div>
            <button className={`relative w-12 h-6 rounded-full transition-colors ${false ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${false ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unhealthy Permission Review Queue</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[
            { id: 1, name: 'ServicePrincipal-Prod', permissions: 'Directory.ReadWrite.All + AppRoleAssignment', risk: 'critical' },
            { id: 2, name: 'LegacyApp-Sales', permissions: 'User.ReadWrite.All + Mail.Send', risk: 'high' },
            { id: 3, name: 'Automation-SP', permissions: 'RoleManagement.ReadWrite.Directory', risk: 'medium' }
          ].map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.permissions}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.risk === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                  item.risk === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {item.risk}
                </span>
                <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Approve</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Revoke</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAIControls = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Controls</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Configuration</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Risk Threshold (1-10)</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                defaultValue="7"
                className="w-full"
                disabled={CURRENT_USER.role !== 'CEO'}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">GNN Sensitivity</label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={CURRENT_USER.role !== 'CEO'}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 dark:text-white">Auto-remediation</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically fix unhealthy permissions</p>
              </div>
              <button className={`relative w-12 h-6 rounded-full transition-colors ${CURRENT_USER.role === 'CEO' && true ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} disabled={CURRENT_USER.role !== 'CEO'}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${true ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Detection Accuracy</span>
                <span className="text-gray-900 dark:text-white">94.2%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 dark:bg-green-500 rounded-full" style={{ width: '94.2%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">False Positive Rate</span>
                <span className="text-gray-900 dark:text-white">2.3%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 dark:bg-red-500 rounded-full" style={{ width: '2.3%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
        <div className="flex gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-medium transition-colors border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-400/40">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              { time: '2024-02-23 10:30 AM', admin: 'Admin', action: 'Role Modified', target: 'Sarah Chen', risk: 'low', status: 'success' },
              { time: '2024-02-23 09:45 AM', admin: 'Analyst', action: 'Permission Granted', target: 'ServicePrincipal-API', risk: 'high', status: 'pending' },
              { time: '2024-02-23 08:15 AM', admin: 'Admin', action: 'Access Revoked', target: 'Legacy App', risk: 'medium', status: 'success' },
              { time: '2024-02-22 04:30 PM', admin: 'Admin Manager', action: 'Admin Created', target: 'New BU Head', risk: 'low', status: 'success' }
            ].map((log, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{log.time}</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900 dark:text-white">{log.admin}</p>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{log.action}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{log.target}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    log.risk === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    log.risk === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                    log.risk === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {log.risk}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 text-sm ${
                    log.status === 'success' ? 'text-green-600 dark:text-green-400' :
                    log.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-600 dark:bg-green-400' :
                      log.status === 'pending' ? 'bg-yellow-600 dark:bg-yellow-400' :
                      'bg-red-600 dark:bg-red-400'
                    }`}></span>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Separation of Duties</h3>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
              <p className="text-red-700 dark:text-red-400 font-medium">3 Violations Detected</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">User can approve and execute</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privilege Overlap</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">67%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Global overlap index</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Score</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">94%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">GDPR • SOX • HIPAA</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white">Session Timeout</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Auto logout after inactivity</p>
                </div>
                <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white">MFA Enforcement</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Require MFA for all admins</p>
                </div>
                <button className={`relative w-12 h-6 rounded-full transition-colors ${true ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${true ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <TopNav />
      
      <main className="ml-64 p-8 pt-24">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'admin-management' && renderAdminManagement()}
        {activeTab === 'role-hierarchy' && renderRoleHierarchy()}
        {activeTab === 'governance' && renderGovernance()}
        {activeTab === 'ai-controls' && renderAIControls()}
        {activeTab === 'audit-logs' && renderAuditLogs()}
        {activeTab === 'compliance' && renderCompliance()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
}