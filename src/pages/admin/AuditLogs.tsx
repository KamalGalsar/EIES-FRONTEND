// Frontend/src/pages/admin/AuditLogs.tsx
import { Filter, Download } from "lucide-react";

export default function AuditLogs() {
  const logs = [
    { time: '2024-02-23 10:30 AM', admin: 'Admin', action: 'Role Modified', target: 'Sarah Chen', risk: 'low', status: 'success' },
    { time: '2024-02-23 09:45 AM', admin: 'Analyst', action: 'Permission Granted', target: 'ServicePrincipal-API', risk: 'high', status: 'pending' },
    { time: '2024-02-23 08:15 AM', admin: 'Admin', action: 'Access Revoked', target: 'Legacy App', risk: 'medium', status: 'success' },
    { time: '2024-02-22 04:30 PM', admin: 'Admin Manager', action: 'Admin Created', target: 'New BU Head', risk: 'low', status: 'success' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Timestamp</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Admin</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Target</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Risk Level</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map((log, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">{log.time}</td>
                <td className="px-4 sm:px-6 py-4"><p className="font-medium text-gray-900 dark:text-white">{log.admin}</p></td>
                <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400">{log.action}</td>
                <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400">{log.target}</td>
                <td className="px-4 sm:px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                    log.risk === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    log.risk === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                    log.risk === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {log.risk}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <span className={`flex items-center gap-1 text-sm whitespace-nowrap ${
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
}