// src/pages/admin/AdminManagement.tsx
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { MOCK_ADMINS, CURRENT_USER, canModify, type RoleType } from "../../types/admin";

export default function AdminManagement() {
  const [admins] = useState(MOCK_ADMINS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'ANALYST' as RoleType, scope: '' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scope</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created By</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {admins.map((admin) => {
              const canModifyAdmin = canModify(CURRENT_USER, admin);
              return (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 sm:px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{admin.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      admin.role === 'CEO' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      admin.role === 'CTO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      admin.role === 'DIRECTOR' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400">{admin.scope}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`flex items-center gap-1 text-sm ${
                      admin.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        admin.status === 'active' ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'
                      }`}></span>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400">{admin.createdBy}</td>
                  <td className="px-4 sm:px-6 py-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                <option value="DIRECTORUK">DIRECTOR - UK</option>
                <option value="VPTECH">VP - TECH</option>
                <option value="SrVP">Sr. VP</option>
                <option value="CEO" disabled>CEO (Only one allowed)</option>
              </select>
              <input
                type="text"
                placeholder="Scope"
                value={newAdmin.scope}
                onChange={(e) => setNewAdmin({...newAdmin, scope: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
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
}