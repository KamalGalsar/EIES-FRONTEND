// Frontend/src/App.tsx

// Frontend/src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ModalProvider } from "./components/ModalContext";
import { ToastProvider } from "./context/ToastContext";
import { RemediationProvider } from "./context/RemediationContext";
import Layout from "./components/Layout";
import AuthCallback from "./pages/AuthCallback";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Solutions from "./pages/Solutions";
import Pricing from "./pages/Pricing";
import Resources from "./pages/Resources";
import Company from "./pages/Company";
import Contact from "./pages/Contact";
import BackendTest from "./pages/BackendTest";
import SimpleAllNodesGraph from "./components/graph/SimpleAllNodesGraph";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import AdminProfile from "./pages/AdminProfile";
import UserProfile from "./pages/UserProfile";
import { AdminRoute } from "./routes/AdminRoute";
import { AuthModalProvider } from "./context/AuthModalContext";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import AdminManagement from "./pages/admin/AdminManagement";
import RoleHierarchy from "./pages/admin/RoleHierarchy";
import Alerts from "./pages/admin/Alerts";            // admin version
import AuditLogs from "./pages/admin/AuditLogs";      // was History
import AIControls from "./pages/admin/AiControls";
import Compliance from "./pages/admin/Compliance";
import SystemSettings from "./pages/admin/SystemSettings";

// User pages (excluding Alerts and History)
import UserLayout from "./components/users/UserLayout";
import UserOverview from "./pages/users/Overview";
import Directory from "./pages/users/Directory";
import AttackPaths from "./pages/users/AttackPaths";
import Permissions from "./pages/users/Permissions";
import SettingsPage from "./pages/users/Settings";

// Protected Route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthModalProvider>
          <AuthProvider>
            <ModalProvider>
              <RemediationProvider>
                <Routes>
                  {/* PUBLIC ROUTES WITH LAYOUT */}
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/product" element={<Product />} />
                    <Route path="/solutions" element={<Solutions />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/company" element={<Company />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/auth-callback" element={<AuthCallback />} />
                    <Route path="/backend-test" element={<BackendTest />} />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* ADMIN PANEL */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<Navigate to="/admin/admin-management" replace />} />
                    <Route path="admin-management" element={<AdminManagement />} />
                    <Route path="role-hierarchy" element={<RoleHierarchy />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                    <Route path="ai-controls" element={<AIControls />} />
                    <Route path="compliance" element={<Compliance />} />
                    <Route path="settings" element={<SystemSettings />} />
                  </Route>

                  <Route
                    path="/admin/profile"
                    element={
                      <AdminRoute>
                        <AdminProfile />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/user/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Dynamic Graph Route */}
                  <Route path="/DynamicGraph" element={<SimpleAllNodesGraph />} />

                  {/* GRANULAR USER PAGES (protected) – NO alerts or history */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <UserLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/users" element={<UserOverview />} />
                    <Route path="/users/directory" element={<Directory />} />
                    <Route path="/users/attack-paths" element={<AttackPaths />} />
                    <Route path="/users/permissions" element={<Permissions />} />
                    <Route path="/users/settings" element={<SettingsPage />} />
                  </Route>

                  {/* Old /users/:userId redirect */}
                  <Route
                    path="/users/:userId"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/users" replace />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </RemediationProvider>
            </ModalProvider>
          </AuthProvider>
        </AuthModalProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}