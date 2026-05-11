// components/users/UserLayout.tsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { Search } from "lucide-react";
import { RemediationModal } from "./Modals";
import { useRemediation } from "../../context/RemediationContext";
import { useAuth } from "../../context/AuthContext";
import { useAuthModal } from "../../context/AuthModalContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

// Risk classification based on score (after multiplying by 10)
// mapping: score < 4 → Low, 4 ≤ score < 6 → Medium, 6 ≤ score < 10 → High, score ≥ 10 → Critical
const getRiskLevel = (score: number): string => {
  if (score >= 10) return "Critical";
  if (score >= 6) return "High";
  if (score >= 4) return "Medium";
  return "Low";
};

export default function UserLayout() {
  const { user } = useAuth();
  const { openModal, isOpen, mode } = useAuthModal();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showRemediationModal, isModalOpen, selectedAction, remediationStatus, closeModal, setRemediationStatus } = useRemediation();
  
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [activeGroups, setActiveGroups] = useState<number | null>(null);
  const [riskScore, setRiskScore] = useState<number | null>(null);        
  const [riskLevel, setRiskLevel] = useState<string>("Loading...");
  const [userName, setUserName] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);

  // Fetch all required data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch users, groups, average blast radius (risk), and current user info in parallel
        const [usersRes, groupsRes, avgBlastRes, currentUserRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/Entra/users`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` }
          }),
          fetch(`${API_BASE_URL}/api/Entra/groups`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` }
          }),
          fetch(`${API_BASE_URL}/api/Risk/average-blast-radius`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` }
          }),
          fetch(`${API_BASE_URL}/api/Entra/me`, {  // Assumes backend provides current user info
            credentials: "include",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` }
          }).catch(() => null) // optional: fallback if endpoint missing
        ]);

        // Users
        if (usersRes.ok) {
          const users = await usersRes.json();
          setTotalUsers(users.length);
        } else {
          console.error("Failed to fetch users");
        }

        // Groups
        if (groupsRes.ok) {
          const groups = await groupsRes.json();
          setActiveGroups(groups.length);
        } else {
          console.error("Failed to fetch groups");
        }

        // Risk score (average blast radius)
        if (avgBlastRes.ok) {
          const avgBlastData = await avgBlastRes.json();
          const avgBlastFraction = avgBlastData.averageBlastRadius; // fraction between 0 and 1
          const computedScore = avgBlastFraction * 10;               // scale to 0-10
          setRiskScore(computedScore);
          setRiskLevel(getRiskLevel(computedScore));
        } else {
          console.error("Failed to fetch risk score");
          setRiskLevel("Unavailable");
        }

        // Current user name (optional, fallback to "Security Admin")
        if (currentUserRes && currentUserRes.ok) {
          const userData = await currentUserRes.json();
          setUserName(userData.displayName || userData.userPrincipalName || "Azure Admin");
        } else {
          setUserName("Security Admin");
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setRiskLevel("Error");
        setUserName("Azure Admin");
      } finally {
        setLoading(false);
      }
    };

    if (user?.isVerified) {
      fetchDashboardData();
    } else {
      setLoading(false);
      if (!isOpen || mode !== 'verification') {
        openModal('verification');
      }
    }
  }, [user?.isVerified, openModal, isOpen, mode]);

  const handleEmergency = () => {
    showRemediationModal("Emergency Remediation Phase");
  };

  const handleRemediationConfirm = async () => {
    setRemediationStatus("Connecting to Azure...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/Remediation/trigger-remediation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: selectedAction,
          timestamp: new Date().toISOString(),
          context: {
            source: "emergency_button",
            user: userName,
            riskScore: riskScore !== null ? `${riskScore.toFixed(1)}/10` : "Unknown",
          },
        }),
      });
      if (!response.ok) throw new Error(`Remediation failed: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setRemediationStatus("Remediation completed successfully!");
      } else {
        throw new Error(result.message || "Remediation failed");
      }
    } catch (err) {
      console.error("Error triggering remediation:", err);
      setRemediationStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      throw err;
    }
  };

  const riskScoreDisplay = riskScore !== null ? `${riskScore.toFixed(1)}/10` : "--/10";
  const riskLevelColor = 
    riskLevel === "Critical" ? "text-red-700 dark:text-red-500" :
    riskLevel === "High" ? "text-red-600 dark:text-red-400" :
    riskLevel === "Medium" ? "text-yellow-600 dark:text-yellow-400" :
    "text-green-600 dark:text-green-400";

  if (!user?.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Unverified</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">
                Your account is currently pending verification. Please complete the setup process to access the dashboard.
              </p>
              <button
                onClick={() => openModal('verification')}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/20"
              >
                Complete Verification
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Need help? Contact <a href="mailto:support@eies.security" className="text-blue-600 dark:text-blue-400 hover:underline">Support</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <TopNav
        userName={userName}
        userRole="Identity"
        onEmergency={handleEmergency}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Top Summary Bar - sticky, with left margin on desktop */}
      <div className="sticky top-16 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm md:ml-64">
        {/* Mobile search bar */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-700 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, groups, risks..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {/* Risk Score */}
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Risk Score</span>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : riskScoreDisplay}
                  </span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Risk Level</span>
                <div className="mt-0.5">
                  <span className={`text-lg sm:text-xl font-bold ${riskLevelColor}`}>
                    {loading ? "..." : riskLevel}
                  </span>
                </div>
              </div>

              {/* Total Users */}
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Total Users</span>
                <div className="mt-0.5">
                  <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                    {loading ? "..." : totalUsers !== null ? totalUsers : "Error"}
                  </span>
                </div>
              </div>

              {/* Active Groups */}
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Active Groups</span>
                <div className="mt-0.5">
                  <span className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
                    {loading ? "..." : activeGroups !== null ? activeGroups : "Error"}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 self-center">Live Microsoft Graph Data</div>
          </div>
        </div>
      </div>

      {/* Main content – increased top padding to clear the sticky bar */}
      <main className="md:ml-64 p-4 sm:p-6 pt-24 md:pt-20 transition-all duration-300">
        <Outlet />
      </main>

      <RemediationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        action={selectedAction}
        severity="critical"
        status={remediationStatus}
        onConfirm={handleRemediationConfirm}
      />
    </div>
  );
}