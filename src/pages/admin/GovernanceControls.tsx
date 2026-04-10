// src/pages/admin/GovernanceControls.tsx
export default function GovernanceControls() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Governance Controls</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privilege Controls</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-900 dark:text-white">Enable PIM Enforcement</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Just-in-time privileged access</p>
            </div>
            <button className={`relative w-12 h-6 rounded-full transition-colors ${true ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${true ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
}