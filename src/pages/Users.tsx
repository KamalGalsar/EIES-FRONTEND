// Frontend/src/pages/users/Users.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * This component is kept for backward compatibility.
 * It immediately redirects to the overview page (/users).
 */
export default function Users() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/users", { replace: true });
  }, [navigate]);

  // Show a loading spinner while redirecting (optional)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to Risk Overview...</p>
      </div>
    </div>
  );
}