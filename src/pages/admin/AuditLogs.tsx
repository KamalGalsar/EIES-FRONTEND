// Frontend/src/pages/admin/AuditLogs.tsx
import { useEffect, useState, useRef } from "react";

const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

interface AuditLog {
  id: string;
  activityDateTime: string;
  activityDisplayName: string;
  category: string;
  service: string;
  status: string;
  statusReason: string;
  targetResources: string[];
  initiatedBy: string;
}

type TimeRange = "24h" | "week" | "month" | "all";
type ActorFilter = "all" | "site" | "azure";

const timeRangeOptions: { value: TimeRange; label: string; icon: JSX.Element }[] = [
  {
    value: "24h",
    label: "Last 24 hours",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "week",
    label: "Last week",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: "month",
    label: "Last month",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: "all",
    label: "All time (30d)",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const actorOptions: { value: ActorFilter; label: string; icon: JSX.Element }[] = [
  {
    value: "all",
    label: "All actors",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    value: "site",
    label: "Our Site (EIES‑Backend)",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: "azure",
    label: "Azure / Others",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

// Custom Dropdown component
function CustomDropdown<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (val: T) => void;
  options: { value: T; label: string; icon: JSX.Element }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-between w-full gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 pl-9 pr-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
      >
        <span className="flex items-center gap-2 truncate">
          <span className="shrink-0 text-gray-500 dark:text-gray-400">
            {selected?.icon}
          </span>
          <span>{selected?.label}</span>
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                option.value === value
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="shrink-0 text-gray-500 dark:text-gray-400">
                {option.icon}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function History() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [actorFilter, setActorFilter] = useState<ActorFilter>("all");

  const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const hoursMap: Record<TimeRange, number> = {
          "24h": 24,
          week: 168,
          month: 720,
          all: 720,
        };
        const hours = hoursMap[timeRange];
        const token = localStorage.getItem("accessToken");  

        const response = await fetch(
          `${BACKEND}/api/AuditLogs/directory?top=1000&hours=${hours}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,             
            },
          }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setLogs(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
        setError("Unable to load audit logs. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

  // Apply actor filter client‑side
  useEffect(() => {
    if (!logs.length) {
      setFilteredLogs([]);
      return;
    }

    let filtered = [...logs];
    if (actorFilter === "site") {
      filtered = filtered.filter((log) => log.initiatedBy === "EIES-Backend");
    } else if (actorFilter === "azure") {
      filtered = filtered.filter((log) => log.initiatedBy !== "EIES-Backend");
    }
    setFilteredLogs(filtered);
  }, [logs, actorFilter]);

  // Refetch when time range changes
  useEffect(() => {
    fetchAuditLogs();
  }, [timeRange]);

  // Auto‑refresh every 30 seconds when tab is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchAuditLogs();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading && logs.length === 0) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Audit Logs
          </h2>
          <div className="animate-pulse h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
          <div className="animate-pulse flex justify-center">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Loading latest logs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Audit Logs
          </h2>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Live Audit Logs
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Dropdown */}
          <CustomDropdown
            value={timeRange}
            onChange={(val) => setTimeRange(val)}
            options={timeRangeOptions}
          />

          {/* Actor Filter Dropdown */}
          <CustomDropdown
            value={actorFilter}
            onChange={(val) => setActorFilter(val)}
            options={actorOptions}
          />

          <button
            onClick={fetchAuditLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table – fluid, no horizontal scroll */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[15%]" />
              <col className="w-[32%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date & Time
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Service
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Activity
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Initiated By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    No audit logs match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-3 text-sm text-gray-900 dark:text-white break-words">
                      {log.activityDateTime
                        ? new Date(log.activityDateTime).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 dark:text-white break-words">
                      {log.service}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <p className="text-gray-900 dark:text-white font-medium break-words">
                        {log.activityDisplayName}
                      </p>
                      {log.targetResources.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">
                          Target: {log.targetResources.join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.status === "Success"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {log.status}
                      </span>
                      {log.statusReason && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">
                          {log.statusReason}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 break-words">
                      {log.initiatedBy === "EIES-Backend" ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <svg
                            className="w-3.5 h-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {log.initiatedBy}
                        </span>
                      ) : (
                        log.initiatedBy
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}