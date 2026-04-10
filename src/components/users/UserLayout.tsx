// components/users/UserLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { Search } from "lucide-react";
import { RemediationModal } from "./Modals";
import { MOCK_USER_SUMMARY } from "../../types/users";
import { useRemediation } from "../../context/RemediationContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showRemediationModal, isModalOpen, selectedAction, remediationStatus, closeModal, setRemediationStatus } = useRemediation();

  const handleEmergency = () => {
    showRemediationModal("Emergency Remediation Phase");
  };

  const handleRemediationConfirm = async () => {
    setRemediationStatus("Connecting to Azure...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/Remediation/trigger-remediation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: selectedAction,
          timestamp: new Date().toISOString(),
          context: {
            source: "emergency_button",
            user: MOCK_USER_SUMMARY.userName,
            riskScore: MOCK_USER_SUMMARY.riskScore,
          },
        }),
      });
      if (!response.ok) throw new Error(`Remediation failed: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setRemediationStatus("✅ Remediation completed successfully!");
      } else {
        throw new Error(result.message || "Remediation failed");
      }
    } catch (err) {
      console.error("Error triggering remediation:", err);
      setRemediationStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <TopNav
        userName={MOCK_USER_SUMMARY.userName}
        userRole="Identity"
        onEmergency={handleEmergency}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Top Summary Bar - sticky, with left margin on desktop */}
      <div className="sticky top-16 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm md:ml-64">
        {/* Search bar - visible on mobile only */}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 sm:gap-8">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Risk Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {MOCK_USER_SUMMARY.riskScore}
                  </span>
                  <span className="text-xs text-gray-500">/100</span>
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Risk Level</span>
                <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                  {MOCK_USER_SUMMARY.riskLevel}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Total Users</span>
                <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                  -
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Active Groups</span>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  -
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Live Microsoft Graph Data</div>
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