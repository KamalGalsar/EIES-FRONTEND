// src/pages/users/Overview.tsx
import { useRemediation } from "../../context/RemediationContext";
import { MOCK_AI_EXPLANATIONS, MOCK_REMEDIATIONS } from "../../types/users";
import DynamicGraph from "../../components/graph/DynamicGraph";

export default function Overview() {
  const { showRemediationModal } = useRemediation();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Graph Area - fully dynamic, fetches live data from /api/entra/graph */}
      <div className="flex-1 min-w-0">
        <div className="h-[400px] sm:h-[500px] lg:h-[calc(100vh-12rem)] bg-[#0B1220] rounded-lg overflow-hidden">
          <DynamicGraph />
        </div>
      </div>

      {/* Right sidebar - AI Risk Analysis & Remediation Checklist (always visible) */}
      <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-5 sm:p-6 h-fit">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          AI Risk Analysis
        </h3>

        <div className="space-y-4 mb-6">
          {MOCK_AI_EXPLANATIONS.map((exp) => (
            <div
              key={exp.id}
              className={`p-3 rounded-lg ${
                exp.severity === "critical"
                  ? "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                  : "bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800"
              }`}
            >
              <p className={`text-sm font-medium ${exp.severity === "critical" ? "text-red-700 dark:text-red-400" : "text-yellow-700 dark:text-yellow-400"}`}>
                {exp.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{exp.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 text-right">
          Last analysis: 17-03-2026
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Remediation Checklist
        </h3>

        <div className="space-y-2">
          {MOCK_REMEDIATIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => showRemediationModal(action.label)}
              className="w-full group flex items-center gap-3 px-4 py-3 rounded-lg 
                bg-gray-50 dark:bg-gray-700/50 
                hover:bg-gray-100 dark:hover:bg-gray-700 
                border border-gray-200 dark:border-gray-600 
                transition-all duration-200 
                text-left"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full 
                border-2 border-gray-300 dark:border-gray-500 
                group-hover:border-blue-500 dark:group-hover:border-blue-400
                group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20
                transition-colors duration-200
                flex items-center justify-center"
              />
              <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 
                group-hover:text-gray-900 dark:group-hover:text-white">
                {action.label}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                action.label.includes("PIM")
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : action.label.includes("group")
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    : action.label.includes("Revoke")
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
              }`}>
                {action.label.includes("PIM") ? "PIM" : action.label.includes("group") ? "Group" : action.label.includes("Revoke") ? "Critical" : "CA"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>3 pending actions</span>
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              Apply all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}