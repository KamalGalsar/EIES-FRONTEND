// src/pages/users/Permissions.tsx
import { useEffect, useState } from "react";

interface Finding {
  severity: string;
  title: string;
  description: string;
  blastRadius: string;
  remediation: string;
  affectedEntityId: string;
  affectedEntityName: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

export default function Permissions() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/Toxic/findings`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setFindings(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch findings:", err);
        setError("Unable to load permissions data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFindings();
  }, []);

  // Separate findings into two groups
  const orphanedSPs = findings.filter((f) => f.title === "Orphaned service principal");
  const toxicPermissions = findings.filter((f) => f.title === "Dangerous app permission combination");

  // Helper to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Helper to format description for toxic permissions (extract permission list)
  const formatToxicDescription = (description: string) => {
    // description format: "SP 'Name' has Permission1, Permission2."
    const match = description.match(/has (.+?)\.$/);
    if (match && match[1]) {
      return match[1];
    }
    return description;
  };

  return (
    <div className="w-full space-y-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Permissions Governance</h2>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading findings...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Partition 1: Orphaned Service Principals */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Orphaned Service Principals (No Owner)
              </h3>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                {orphanedSPs.length}
              </span>
            </div>
            {orphanedSPs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
                No orphaned service principals found. All service principals have an owner.
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
                {orphanedSPs.map((sp) => (
                  <div key={sp.affectedEntityId} className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getSeverityColor(sp.severity)}`}></span>
                      <h4 className="text-gray-900 dark:text-white font-medium">{sp.affectedEntityName}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">
                      {sp.description} {/* e.g., "SP '...' has no owner." */}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-4">
                      💡 Remediation: {sp.remediation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Partition 2: Toxic Permissions (Dangerous combinations) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Toxic Permissions (Dangerous Combinations)
              </h3>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                {toxicPermissions.length}
              </span>
            </div>
            {toxicPermissions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
                No dangerous permission combinations detected.
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
                {toxicPermissions.map((perm) => (
                  <div key={perm.affectedEntityId} className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getSeverityColor(perm.severity)}`}></span>
                      <h4 className="text-gray-900 dark:text-white font-medium">{perm.affectedEntityName}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">
                      <span className="font-mono text-xs break-all">
                        {formatToxicDescription(perm.description)}
                      </span>
                    </p>
                    {perm.blastRadius && perm.blastRadius !== "N/A" && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-4">
                        💥 Blast radius: {perm.blastRadius}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4">
                      🔧 Remediation: {perm.remediation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}