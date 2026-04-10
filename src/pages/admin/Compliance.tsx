// src/pages/admin/Compliance.tsx
export default function Compliance() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Separation of Duties</h3>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
              <p className="text-red-700 dark:text-red-400 font-medium">3 Violations Detected</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">User can approve and execute</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privilege Overlap</h3>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">67%</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Global overlap index</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Score</h3>
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">94%</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">GDPR • SOX • HIPAA</p>
        </div>
      </div>
    </div>
  );
}