import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Users,
  UsersRound,
  LayoutList,
  User,
  ShieldCheck,
} from "lucide-react";
import BlastRadiusGraph from "../../components/graph/BlastRadiusGraph";
import api from "../../services/api";

// Types
interface EntraUser {
  id: string;
  displayName: string | null;
  userPrincipalName: string;
  accountEnabled?: boolean;
}

interface EntraGroup {
  id: string;
  displayName: string | null;
  mail: string | null;
}

// Risk score types (commented out for now)
// interface RiskScoreData {
//   nodeId: string;
//   riskScore: number;
//   blastRadius: number;
//   riskLabel: string;
// }

interface DirectoryEntry {
  id: string;
  name: string;
  email: string;
  type: "user" | "group";
  // riskScore?: number;
  status?: string;
}

export default function Directory() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DirectoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "user" | "group">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDirectory();
  }, []);

  useEffect(() => {
    let filtered = [...entries];

    if (filterType !== "all") {
      filtered = filtered.filter((e) => e.type === filterType);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query)
      );
    }

    setFilteredEntries(filtered);
  }, [searchQuery, filterType, entries]);

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const [usersRes, groupsRes] = await Promise.all([
        api.get<EntraUser[]>("/entra/users"),
        api.get<EntraGroup[]>("/entra/groups"),
      ]);

      const users: DirectoryEntry[] = usersRes.data.map((u) => ({
        id: u.id,
        name: u.displayName || u.userPrincipalName || "Unknown",
        email: u.userPrincipalName || "",
        type: "user",
        status: u.accountEnabled ? "Active" : "Disabled",
      }));

      const groups: DirectoryEntry[] = groupsRes.data.map((g) => ({
        id: g.id,
        name: g.displayName || g.id,
        email: g.mail || "",
        type: "group",
        status: "Active",
      }));

      const all = [...users, ...groups];

      // Risk scores temporarily disabled
      // try {
      //   const riskRes = await api.get<RiskScoreData[]>("/risk/scores");
      //   const riskMap = new Map(riskRes.data.map((r) => [r.nodeId, r]));
      //   const enriched = all.map((entry) => ({
      //     ...entry,
      //     riskScore: riskMap.get(entry.id)?.riskScore,
      //   }));
      //   setEntries(enriched);
      // } catch {
      //   setEntries(all);
      // }
      setEntries(all);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to load directory";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const showEmailColumn = filterType !== "group";
  const visibleColumnsCount = 4 + (showEmailColumn ? 1 : 0);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error: {error}
        <button
          onClick={fetchDirectory}
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UsersRound className="w-6 h-6 text-blue-500" />
          Directory
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-l-lg border ${
                filterType === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <LayoutList className="w-4 h-4" />
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType("user")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-t border-b ${
                filterType === "user"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <User className="w-4 h-4" />
              Users
            </button>
            <button
              type="button"
              onClick={() => setFilterType("group")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-r-lg border ${
                filterType === "group"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              Groups
            </button>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="w-8 px-2 py-3"></th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Name
                </th>
                {showEmailColumn && (
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Email / UPN
                  </th>
                )}
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.map((entry) => (
                <React.Fragment key={entry.id}>
                  <tr
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(entry.id)}
                  >
                    <td className="px-2 py-4">
                      {expandedId === entry.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {entry.name}
                    </td>
                    {showEmailColumn && (
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {entry.email || "—"}
                      </td>
                    )}
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {entry.type === "user" ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                          entry.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {entry.status || "Active"}
                      </span>
                    </td>
                  </tr>
                  {expandedId === entry.id && (
                    <tr>
                      <td colSpan={visibleColumnsCount} className="p-0 bg-gray-900">
                        <div className="h-[450px] w-full">
                          <BlastRadiusGraph nodeId={entry.id} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          {filteredEntries.length} entries found
        </div>
      </div>
    </div>
  );
}