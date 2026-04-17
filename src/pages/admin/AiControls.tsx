// Frontend/src/pages/admin/AiControls.tsx
import { CURRENT_USER } from "../../types/admin";

export default function AIControls() {
  return (
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
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
}