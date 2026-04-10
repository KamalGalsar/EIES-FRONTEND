// src/pages/users/Permissions.tsx
import { MOCK_AI_EXPLANATIONS } from "../../types/users";

export default function Permissions() {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Toxic Permissions</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {MOCK_AI_EXPLANATIONS.map((exp) => (
          <div key={exp.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${exp.severity === "critical" ? "bg-red-500" : "bg-yellow-500"}`}></span>
              <h3 className="text-gray-900 dark:text-white font-medium">{exp.title}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}