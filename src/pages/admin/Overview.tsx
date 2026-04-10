// src/pages/admin/Overview.tsx
import { Users, AlertTriangle, Shield, Eye, Server, Activity } from "lucide-react";
import { MOCK_ADMINS } from "../../types/admin";

const stats = [
  { label: 'Total Identities', value: '12,430', change: '+5.2%', icon: Users, color: 'blue' },
  { label: 'High Risk Identities', value: '184', change: '-12%', icon: AlertTriangle, color: 'red' },
  { label: 'Unhealthy Permissions', value: '23', change: '+3', icon: Shield, color: 'orange' },
  { label: 'Shadow Admins', value: '11', change: '-2', icon: Eye, color: 'purple' },
  { label: 'Service Principal Without Owner', value: '7', change: '+1', icon: Server, color: 'yellow' },
  { label: 'Blast Radius Score', value: '8.7/10', change: '-0.3', icon: Activity, color: 'green' }
];

export default function Overview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Governance Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Trend (Last 30 Days)</h3>
          <div className="min-w-[300px] h-48 flex items-end gap-1 sm:gap-2">
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top 5 Blast Radius Identities</h3>
        </div>
        <div className="min-w-[300px] divide-y divide-gray-200 dark:divide-gray-700">
          {MOCK_ADMINS.slice(0, 5).map((admin) => (
            <div key={admin.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
}