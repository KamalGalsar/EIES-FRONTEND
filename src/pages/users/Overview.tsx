// src/pages/users/Overview.tsx
import { useEffect, useState, useCallback } from "react";
import { Users, AlertTriangle, Shield, Eye, Server, Activity, RefreshCw } from "lucide-react";
import { useRemediation } from "../../context/RemediationContext";
import { MOCK_AI_EXPLANATIONS, MOCK_REMEDIATIONS } from "../../types/users";
import DynamicGraph from "../../components/graph/DynamicGraph";

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

interface CachedDashboardData {
  totalUsers: number;
  highRiskCount: number;
  unhealthyPermsCount: number;
  orphanedSPCount: number;
  averageBlast: number | null;
  topBlastRadius: BlastRadiusItem[];
  timestamp: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";
const CACHE_KEY = "admin_dashboard_cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const baseStats = [
  { label: 'Total Users', value: '0', change: '+5.2%', icon: Users, color: 'blue' },
  { label: 'High Risk Identities', value: '0', change: '-12%', icon: AlertTriangle, color: 'red' },
  { label: 'Unhealthy Permissions', value: '111', change: '+3', icon: Shield, color: 'orange' },
  { label: 'Shadow Admins', value: '2', change: '-2', icon: Eye, color: 'purple' },
  { label: 'Service Principal Without Owner', value: '0', change: '+1', icon: Server, color: 'yellow' },
  { label: 'Risk Score', value: '0.0/10', change: '-0.3', icon: Activity, color: 'green' }
];

const loadFromCache = (): CachedDashboardData | null => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

const saveToCache = (
  totalUsers: number,
  highRiskCount: number,
  unhealthyPermsCount: number,
  orphanedSPCount: number,
  averageBlast: number | null,
  topBlastRadius: BlastRadiusItem[]
) => {
  try {
    const cacheData: CachedDashboardData = {
      totalUsers,
      highRiskCount,
      unhealthyPermsCount,
      orphanedSPCount,
      averageBlast,
      topBlastRadius,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.warn("Failed to cache dashboard data", e);
  }
};

const buildStatsFromData = (data: CachedDashboardData) => {
  return baseStats.map(stat => {
    if (stat.label === 'Total Users') return { ...stat, value: data.totalUsers.toLocaleString() };
    if (stat.label === 'High Risk Identities') return { ...stat, value: data.highRiskCount.toLocaleString() };
    if (stat.label === 'Unhealthy Permissions') return { ...stat, value: data.unhealthyPermsCount.toLocaleString() };
    if (stat.label === 'Service Principal Without Owner') return { ...stat, value: data.orphanedSPCount.toLocaleString() };
    if (stat.label === 'Risk Score' && data.averageBlast !== null) {
      const score = (data.averageBlast * 10).toFixed(1);
      return { ...stat, value: `${score}/10` };
    }
    return stat;
  });
};

export default function Overview() {
  const { showRemediationModal } = useRemediation();

  const [stats, setStats] = useState(baseStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topBlastRadius, setTopBlastRadius] = useState<BlastRadiusItem[]>([]);
  const [loadingBlast, setLoadingBlast] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchDashboardData = useCallback(async (showRetryState = false) => {
    if (showRetryState) setIsRetrying(true);

    const cached = loadFromCache();
    let usedCache = false;

    if (cached) {
      setStats(buildStatsFromData(cached));
      setTopBlastRadius(cached.topBlastRadius);
      setError(null);
      setLoading(false);
      setLoadingBlast(false);
      usedCache = true;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        setLoadingBlast(false);
        return;
      }

      const fetchOptions = {
        credentials: 'include' as RequestCredentials,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const refreshParam = showRetryState ? "refresh=true" : "";
      const getUrl = (path: string) => {
        const joiner = path.includes('?') ? '&' : '?';
        return refreshParam ? `${API_BASE_URL}${path}${joiner}${refreshParam}` : `${API_BASE_URL}${path}`;
      };

      const [usersRes, highRiskRes, spAnalysisRes, toxicRes, blastRadiusRes, avgBlastRes] = await Promise.all([
        fetch(getUrl("/api/Entra/users"), fetchOptions),
        fetch(getUrl("/api/Risk/scores/high-risk?threshold=0.7"), fetchOptions),
        fetch(getUrl("/api/SpAnalysis"), fetchOptions),
        fetch(getUrl("/api/Toxic/findings"), fetchOptions),
        fetch(getUrl("/api/Toxic/blast-radius-all"), fetchOptions),
        fetch(getUrl("/api/Risk/average-blast-radius"), fetchOptions)
      ]);

      if (!usersRes.ok) throw new Error(`Users API: ${usersRes.status}`);
      if (!highRiskRes.ok) throw new Error(`High-risk API: ${highRiskRes.status}`);
      if (!spAnalysisRes.ok) throw new Error(`SpAnalysis API: ${spAnalysisRes.status}`);
      if (!toxicRes.ok) throw new Error(`Toxic findings API: ${toxicRes.status}`);
      if (!blastRadiusRes.ok) throw new Error(`Blast radius API: ${blastRadiusRes.status}`);
      if (!avgBlastRes.ok) throw new Error(`Average blast API: ${avgBlastRes.status}`);

      const users = await usersRes.json();
      const highRiskNodes = await highRiskRes.json();
      const spAnalysisData = await spAnalysisRes.json();
      const toxicFindings: ToxicFinding[] = await toxicRes.json();
      const blastRadiusData: BlastRadiusItem[] = await blastRadiusRes.json();
      const avgBlastData = await avgBlastRes.json();
      const averageBlast = avgBlastData.averageBlastRadius;

      const totalUsers = users.length;
      const highRiskCount = Array.isArray(highRiskNodes) ? highRiskNodes.length : 0;
      const unhealthyPermsCount = Array.isArray(spAnalysisData)
        ? spAnalysisData.filter((item: any) => item.risk_label && item.risk_label !== 'Low').length
        : 0;
      const orphanedSPCount = toxicFindings.filter(f => f.title === "Orphaned service principal").length;

      const top5 = [...blastRadiusData]
        .sort((a, b) => b.blastRadius - a.blastRadius)
        .slice(0, 5);

      const freshStats = baseStats.map(stat => {
        if (stat.label === 'Total Users') return { ...stat, value: totalUsers.toLocaleString() };
        if (stat.label === 'High Risk Identities') return { ...stat, value: highRiskCount.toLocaleString() };
        if (stat.label === 'Unhealthy Permissions') return { ...stat, value: unhealthyPermsCount.toLocaleString() };
        if (stat.label === 'Service Principal Without Owner') return { ...stat, value: orphanedSPCount.toLocaleString() };
        if (stat.label === 'Risk Score') {
          const score = (averageBlast * 10).toFixed(1);
          return { ...stat, value: `${score}/10` };
        }
        return stat;
      });

      setStats(freshStats);
      setTopBlastRadius(top5);
      setError(null);
      saveToCache(totalUsers, highRiskCount, unhealthyPermsCount, orphanedSPCount, averageBlast, top5);
    } catch (err) {
      console.error("Fetch error:", err);
      if (!usedCache) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        const erroredStats = baseStats.map(stat => {
          if (['Total Users', 'High Risk Identities', 'Unhealthy Permissions', 'Service Principal Without Owner', 'Risk Score'].includes(stat.label)) {
            return { ...stat, value: 'Error' };
          }
          return stat;
        });
        setStats(erroredStats);
        setTopBlastRadius([]);
      }
    } finally {
      setLoading(false);
      setLoadingBlast(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
      {/* Graph + Sidebar (unchanged) */}
      {/* Identity Graph - Absolute Fold Submergence Optimized */}
      <div className="w-full">
        <div className="h-[500px] sm:h-[600px] lg:h-[calc(100vh-6.8rem)] bg-[#0B1220] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl">
          <DynamicGraph />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Governance Overview</h2>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRetrying}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            <div className="flex items-center text-red-700 dark:text-red-400">
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
                {loading ? '...' : stat.value}
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
              topBlastRadius.map((item) => {
                const path = item.nodeType === 'servicePrincipal'
                  ? `/users/permissions?spId=${item.nodeId}`
                  : `/users/directory?id=${item.nodeId}`;

                return (
                  <a
                    key={item.nodeId}
                    href={path}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.nodeName}
                      </p>
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
                  </a>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}