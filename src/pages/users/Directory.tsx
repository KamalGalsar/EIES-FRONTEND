// src/pages/users/Directory.tsx
import { useEffect, useState } from "react";
import { type GraphUser } from "../../types/users";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

export default function Directory() {
  const [users, setUsers] = useState<GraphUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/entra/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-600 dark:text-gray-400">Loading users...</div>;

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Users ({users.length})
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Display Name</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User Principal Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 sm:px-6 py-4 text-gray-900 dark:text-white whitespace-nowrap">{user.displayName}</td>
                <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400">{user.userPrincipalName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}