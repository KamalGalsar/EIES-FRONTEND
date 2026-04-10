// src/pages/users/Alerts.tsx
const alerts = [
  { id: 1, severity: "critical", title: "Privilege Escalation Detected", time: "5 min ago", description: "Risky User has access to multiple groups" },
  { id: 2, severity: "high", title: "Admin Account Activity", time: "15 min ago", description: "Admin User is a member of Level-1-Group" },
  { id: 3, severity: "medium", title: "Group Membership Alert", time: "1 hour ago", description: "Multiple users in administrative groups" },
];

export default function Alerts() {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Alerts (3)</h2>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <span className={`w-2 h-2 mt-2 rounded-full ${alert.severity === "critical" ? "bg-red-500" : alert.severity === "high" ? "bg-orange-500" : "bg-yellow-500"}`}></span>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-gray-900 dark:text-white font-medium">{alert.title}</h3>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}