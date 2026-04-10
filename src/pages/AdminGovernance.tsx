// src/pages/AdminGovernance.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * This component is kept for backward compatibility.
 * It immediately redirects to the new granular admin overview page (/admin).
 */
export default function AdminGovernance() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/admin", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to Admin Dashboard...</p>
      </div>
    </div>
  );
}