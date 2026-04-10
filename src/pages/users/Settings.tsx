// src/pages/users/Settings.tsx
const settings = [
  { category: "Risk Thresholds", items: [{ name: "Critical Risk Threshold", value: "80%" }, { name: "High Risk Threshold", value: "60%" }, { name: "Medium Risk Threshold", value: "40%" }] },
  { category: "Notification Preferences", items: [{ name: "Email Alerts", value: "Enabled" }, { name: "Slack Integration", value: "Disabled" }, { name: "SMS for Critical", value: "Enabled" }] },
  { category: "Analysis Settings", items: [{ name: "Auto-remediation", value: "Disabled" }, { name: "Deep Scan Frequency", value: "Every 6 hours" }, { name: "Retention Period", value: "90 days" }] },
];

export default function Settings() {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
      <div className="space-y-6">
        {settings.map((section, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{section.category}</h3>
            <div className="space-y-4">
              {section.items.map((item, j) => (
                <div key={j} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{item.name}</span>
                  <span className="text-gray-900 dark:text-white font-medium text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}