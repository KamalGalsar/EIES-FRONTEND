// Frontend/src/pages/admin/GovernanceControls.tsx
import { useEffect, useState } from 'react';

interface Finding {
  severity: string;
  title: string;
  description: string;
  blastRadius: string;
  remediation: string;
  affectedEntityId: string;
  affectedEntityName: string;
}

interface QueueItem {
  id: string;
  name: string;
  permissions: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
  blastRadius: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

export default function GovernanceControls() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pimEnabled, setPimEnabled] = useState(true);
  const [dualApprovalEnabled, setDualApprovalEnabled] = useState(false);

  // Fetch findings from API with auth
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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFindings(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch findings:', err);
        setError('Unable to load governance findings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFindings();
  }, []);

  // Separate findings for the two sections (lifted from Permissions page)
  const orphanedSPs = findings.filter((f) => f.title === "Orphaned service principal");
  const toxicPermissions = findings.filter((f) => f.title === "Dangerous app permission combination");

  // Transform findings into queue items (for review queue)
  const queueItems: QueueItem[] = findings.map((finding) => {
    let permissionsText = '';
    let risk: QueueItem['risk'] = 'medium';

    if (finding.severity === 'High') {
      risk = 'critical';
    } else if (finding.severity === 'Medium') {
      risk = 'medium';
    } else {
      risk = 'low';
    }

    if (finding.title === 'Dangerous app permission combination') {
      const match = finding.description.match(/has (.+?)\.$/);
      permissionsText = match && match[1] ? match[1] : 'Dangerous permissions detected';
    } else if (finding.title === 'Orphaned service principal') {
      permissionsText = '⚠️ No owner – assign an owner to ensure accountability';
    } else {
      permissionsText = finding.description;
    }

    return {
      id: finding.affectedEntityId,
      name: finding.affectedEntityName,
      permissions: permissionsText,
      risk,
      remediation: finding.remediation,
      blastRadius: finding.blastRadius,
    };
  });

  // Helper for severity color (from Permissions page)
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

  // Format toxic description (from Permissions page)
  const formatToxicDescription = (description: string) => {
    const match = description.match(/has (.+?)\.$/);
    return match && match[1] ? match[1] : description;
  };

  // Action handlers (replace with real API calls)
  const handleApprove = (item: QueueItem) => {
    console.log(`Approved: ${item.name}`, item);
    alert(`✅ Approved remediation for "${item.name}". (Demo action)`);
  };

  const handleRevoke = (item: QueueItem) => {
    console.log(`Revoke access for: ${item.name}`, item);
    alert(`🔒 Revoked excessive permissions for "${item.name}". (Demo action)`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Governance Controls</h1>

      {/* Privilege Controls Toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privilege Controls</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-900 dark:text-white">Enable PIM Enforcement</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Just-in-time privileged access</p>
            </div>
            <button
              onClick={() => setPimEnabled(!pimEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${pimEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${pimEnabled ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-gray-900 dark:text-white">Require Dual Approval</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Two admins needed for role changes</p>
            </div>
            <button
              onClick={() => setDualApprovalEnabled(!dualApprovalEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${dualApprovalEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${dualApprovalEnabled ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Orphaned Service Principals (lifted from Permissions page) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Orphaned Service Principals (No Owner)
            </h3>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
              {orphanedSPs.length}
            </span>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            Loading findings...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>
        ) : orphanedSPs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No orphaned service principals found. All service principals have an owner.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {orphanedSPs.map((sp) => (
              <div key={sp.affectedEntityId} className="p-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getSeverityColor(sp.severity)}`}></span>
                  <h4 className="text-gray-900 dark:text-white font-medium">{sp.affectedEntityName}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">{sp.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-4">
                  💡 Remediation: {sp.remediation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Toxic Permissions (lifted from Permissions page) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Toxic Permissions (Dangerous Combinations)
            </h3>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
              {toxicPermissions.length}
            </span>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            Loading findings...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>
        ) : toxicPermissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No dangerous permission combinations detected.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {toxicPermissions.map((perm) => (
              <div key={perm.affectedEntityId} className="p-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getSeverityColor(perm.severity)}`}></span>
                  <h4 className="text-gray-900 dark:text-white font-medium">{perm.affectedEntityName}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">
                  <span className="font-mono text-xs break-all">{formatToxicDescription(perm.description)}</span>
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

      {/* Section 3: Unhealthy Permission Review Queue (original from GovernanceControls) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unhealthy Permission Review Queue</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Based on findings from the Toxic API – actions to approve or revoke
          </p>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            Loading findings...
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>
        )}

        {!loading && !error && queueItems.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No unhealthy permissions found. All service principals are compliant.
          </div>
        )}

        {!loading && !error && queueItems.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {queueItems.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-words">{item.permissions}</p>
                  {item.blastRadius && item.blastRadius !== 'N/A' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      💥 Blast radius: {item.blastRadius}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      item.risk === 'critical'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        : item.risk === 'high'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}
                  >
                    {item.risk === 'critical' ? 'Critical' : item.risk === 'high' ? 'High' : 'Medium'}
                  </span>
                  <button
                    onClick={() => handleApprove(item)}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRevoke(item)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}