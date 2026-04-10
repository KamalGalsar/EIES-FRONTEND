// src/pages/users/History.tsx
const riskHistory = [
  { date: "2026-03-03", score: 87, change: "+2", events: 3 },
  { date: "2026-03-09", score: 85, change: "-1", events: 2 },
  { date: "2026-03-10", score: 86, change: "+4", events: 4 },
  { date: "2026-03-11", score: 82, change: "-3", events: 1 },
  { date: "2026-03-16", score: 85, change: "0", events: 2 },
];

export default function History() {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Risk History</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Risk Score</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Change</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Events</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {riskHistory.map((day, i) => (
              <tr key={i}>
                <td className="px-4 sm:px-6 py-4 text-gray-900 dark:text-white whitespace-nowrap">{day.date}</td>
                <td className="px-4 sm:px-6 py-4"><span className="font-bold text-red-600">{day.score}</span></td>
                <td className="px-4 sm:px-6 py-4"><span className={day.change.startsWith("+") ? "text-red-500" : day.change.startsWith("-") ? "text-green-500" : "text-gray-500"}>{day.change}</span></td>
                <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400">{day.events} alerts</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}