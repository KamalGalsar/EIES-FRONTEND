// Frontend/src/pages/users/Profile.tsx 

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const Profile: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (user?.role === "Admin") {
      navigate("/admin/profile", { replace: true }); // For admins
    } else {
      navigate("/user/profile", { replace: true }); // For regular users
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
};

export default Profile;
