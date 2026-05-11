// Frontend/src/pages/admin/Overview.tsx

import { useEffect, useState } from "react";
import { Users, AlertTriangle, Shield, Eye, Server, Activity } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

// Types
interface BlastRadiusItem {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  blastRadius: number;
}

interface ToxicFinding {
  severity: string;
  title: string;
  description: string;
  blastRadius: string;
  remediation: string;
  affectedEntityId: string;
  affectedEntityName: string;
}

const baseStats = [
  { label: 'Total Users', value: '0', change: '+5.2%', icon: Users, color: 'blue' },
  { label: 'High Risk Identities', value: '0', change: '-12%', icon: AlertTriangle, color: 'red' },
  { label: 'Unhealthy Permissions', value: '0', change: '+3', icon: Shield, color: 'orange' },
  { label: 'Shadow Admins', value: '11', change: '-2', icon: Eye, color: 'purple' },
  { label: 'Service Principal Without Owner', value: '0', change: '+1', icon: Server, color: 'yellow' },
  { label: 'Risk Score', value: '0.0/10', change: '-0.3', icon: Activity, color: 'green' }
];

export default function Overview() {
  const [stats, setStats] = useState(baseStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topBlastRadius, setTopBlastRadius] = useState<BlastRadiusItem[]>([]);
  const [loadingBlast, setLoadingBlast] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const fetchOptions = {
          headers: {
            'Authorization': `Bearer ${token || ""}`,
            'Content-Type': 'application/json'
          }
        };

        const [usersRes, highRiskRes, toxicRes, blastRadiusRes, avgBlastRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/Entra/users`, fetchOptions),
          fetch(`${API_BASE_URL}/api/Risk/scores/high-risk?threshold=0.7`, fetchOptions),
          fetch(`${API_BASE_URL}/api/Toxic/findings`, fetchOptions),
          fetch(`${API_BASE_URL}/api/Toxic/blast-radius-all`, fetchOptions),
          fetch(`${API_BASE_URL}/api/Risk/average-blast-radius`, fetchOptions)
        ]);

        if (!usersRes.ok) throw new Error(`Failed to fetch users: ${usersRes.status}`);
        if (!highRiskRes.ok) throw new Error(`Failed to fetch high-risk identities: ${highRiskRes.status}`);
        if (!toxicRes.ok) throw new Error(`Failed to fetch toxic findings: ${toxicRes.status}`);
        if (!blastRadiusRes.ok) throw new Error(`Failed to fetch blast radius data: ${blastRadiusRes.status}`);
        if (!avgBlastRes.ok) throw new Error(`Failed to fetch average blast radius: ${avgBlastRes.status}`);

        const users = await usersRes.json();
        const highRiskNodes = await highRiskRes.json();
        const toxicFindings: ToxicFinding[] = await toxicRes.json();
        const blastRadiusData: BlastRadiusItem[] = await blastRadiusRes.json();
        const avgBlastData = await avgBlastRes.json();
        const averageBlast = avgBlastData.averageBlastRadius; // e.g., 0.580248...

        const totalUsers = users.length;
        const highRiskCount = Array.isArray(highRiskNodes) ? highRiskNodes.length : 0;
        const unhealthyPermsCount = toxicFindings.filter(f => f.title === "Dangerous app permission combination").length;
        const orphanedSPCount = toxicFindings.filter(f => f.title === "Orphaned service principal").length;

        setStats(prevStats =>
          prevStats.map(stat => {
            if (stat.label === 'Total Users') return { ...stat, value: totalUsers.toLocaleString() };
            if (stat.label === 'High Risk Identities') return { ...stat, value: highRiskCount.toLocaleString() };
            if (stat.label === 'Unhealthy Permissions') return { ...stat, value: unhealthyPermsCount.toLocaleString() };
            if (stat.label === 'Service Principal Without Owner') return { ...stat, value: orphanedSPCount.toLocaleString() };
            if (stat.label === 'Risk Score') {
              const score = (averageBlast * 10).toFixed(1);
              return { ...stat, value: `${score}/10` };
            }
            return stat;
          })
        );

        // Top 5 blast radius identities
        const top5 = [...blastRadiusData]
          .sort((a, b) => b.blastRadius - a.blastRadius)
          .slice(0, 5);
        setTopBlastRadius(top5);
        setLoadingBlast(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setStats(prevStats =>
          prevStats.map(stat => {
            if (['Total Users', 'High Risk Identities', 'Unhealthy Permissions', 'Service Principal Without Owner', 'Risk Score'].includes(stat.label)) {
              return { ...stat, value: 'Error' };
            }
            return stat;
          })
        );
        setLoadingBlast(false);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getNodeTypeBadge = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'group': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'servicePrincipal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'application': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Governance Overview</h1>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className={`p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <span className={`text-sm ${stat.change.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
              {loading && ['Total Users', 'High Risk Identities', 'Unhealthy Permissions', 'Service Principal Without Owner', 'Risk Score'].includes(stat.label) 
                ? '...' 
                : stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top 5 Blast Radius Identities</h3>
        </div>
        <div className="min-w-[300px] divide-y divide-gray-200 dark:divide-gray-700">
          {loadingBlast ? (
            <div className="p-6 text-center text-gray-500">Loading blast radius data...</div>
          ) : topBlastRadius.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No data available</div>
          ) : (
            topBlastRadius.map((item) => (
              <div key={item.nodeId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.nodeName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getNodeTypeBadge(item.nodeType)}`}>
                      {item.nodeType}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Blast Radius: {item.blastRadius}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.blastRadius} nodes
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}