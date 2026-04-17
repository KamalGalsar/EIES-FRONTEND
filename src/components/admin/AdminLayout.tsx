// Frontend/src/components/admin/AdminLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { CURRENT_USER } from "../../types/admin";

export default function AdminLayout() {
  const [lockdown, setLockdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        currentUser={CURRENT_USER}
        onLogout={() => {}}
        lockdown={lockdown}
        setLockdown={setLockdown}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      <main className="md:ml-64 p-4 sm:p-6 pt-24 md:pt-28 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}