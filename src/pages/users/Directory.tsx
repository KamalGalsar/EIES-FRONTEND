// components/users/Directory.tsx
import { useState, useEffect } from "react";
import { Search, Users, Shield, Filter } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

type User = {
  id: string;
  displayName: string;
  userPrincipalName: string;
  deletedDateTime?: string | null;
};

type Group = {
  id: string;
  displayName: string;
};

type ViewMode = "users" | "groups";

export default function DirectoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, groupsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/Entra/users`),
          fetch(`${API_BASE_URL}/api/Entra/groups`),
        ]);
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        if (!groupsRes.ok) throw new Error("Failed to fetch groups");
        const usersData = await usersRes.json();
        const groupsData = await groupsRes.json();
        setUsers(usersData);
        setGroups(groupsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter users (active only – exclude deleted)
  const activeUsers = users.filter((u) => !u.deletedDateTime);
  const filteredUsers = activeUsers.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userPrincipalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentData = viewMode === "users" ? filteredUsers : filteredGroups;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse users and groups from Microsoft Entra ID
          </p>
        </div>
        {/* View toggle */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 w-fit">
          <button
            onClick={() => setViewMode("users")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === "users"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setViewMode("groups")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === "groups"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" />
            Groups
          </button>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${viewMode === "users" ? "users by name or email" : "groups by name"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          <span>
            {currentData.length} {viewMode === "users" ? "users" : "groups"} found
          </span>
        </div>
      </div>

      {/* Results table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-gray-500">Loading directory...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      ) : currentData.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No {viewMode} found matching "{searchTerm}"
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {viewMode === "users" ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email / UPN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Group Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Group ID
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {viewMode === "users" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {(item as User).displayName || "No name"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(item as User).userPrincipalName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {(item as User).deletedDateTime ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Deleted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Active
                            </span>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {(item as Group).displayName || "No name"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {(item as Group).id}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}