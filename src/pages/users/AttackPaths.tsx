// src/pages/users/AttackPaths.tsx
import { useState } from "react";
import { PathDetailsModal } from "../../components/users/Modals";

export default function AttackPaths() {
  const [showPathModal, setShowPathModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState("");

  const paths = [
    { name: "Nested Group Escalation", risk: 92, steps: 6, target: "Production Workloads" },
    { name: "Service Principal Backdoor", risk: 89, steps: 4, target: "Tenant-wide" },
    { name: "MFA Bypass Chain", risk: 87, steps: 5, target: "VIP Accounts" },
  ];

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Attack Path Analysis</h2>
      <div className="grid grid-cols-1 gap-4">
        {paths.map((path, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium">{path.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{path.steps} steps • Target: {path.target}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-red-600">{path.risk}%</span>
                <button
                  onClick={() => {
                    setSelectedPath(path.name);
                    setShowPathModal(true);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PathDetailsModal
        isOpen={showPathModal}
        onClose={() => setShowPathModal(false)}
        pathName={selectedPath}
      />
    </div>
  );
}