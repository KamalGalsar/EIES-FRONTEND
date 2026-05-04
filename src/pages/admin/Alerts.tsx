// Frontend/src/pages/admin/Alerts.tsx
import { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

interface Alert {
  id: number;
  severity: string;
  title: string;
  description: string;
  performedBy: string;
  performedByUserId: string;
  actionType: string;
  target: string;
  createdAt: string;
  isRead: boolean;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("accessToken") || "";

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${BACKEND}/api/Alerts?count=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError("Unable to load alerts. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  // Mark a single alert as read
  const markAsRead = async (id: number) => {
    try {
      await fetch(`${BACKEND}/api/Alerts/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error("Failed to mark alert as read", err);
    }
  };

  // Mark ALL alerts as read
  const markAllAsRead = async () => {
    try {
      await fetch(`${BACKEND}/api/Alerts/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return date.toLocaleString();
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Alerts</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Alerts</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Active Alerts ({alerts.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={fetchAlerts}
            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={markAllAsRead}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Read All
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          No alerts yet. Actions you perform on the site will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 border transition-shadow ${
                alert.isRead
                  ? "border-gray-200 dark:border-gray-700 opacity-60"
                  : "border-gray-300 dark:border-gray-600 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Severity indicator */}
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  alert.severity === "critical" ? "bg-red-500" :
                  alert.severity === "high" ? "bg-orange-500" :
                  alert.severity === "medium" ? "bg-yellow-500" :
                  "bg-blue-500"
                }`} />

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-gray-900 dark:text-white font-medium">
                        {alert.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      {alert.isRead && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                          Read
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(alert.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {alert.performedBy || "Unknown user"}
                    </span>
                    {alert.target && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        {alert.target}
                      </span>
                    )}
                    {/* Mark as Read button */}
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="ml-auto flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}