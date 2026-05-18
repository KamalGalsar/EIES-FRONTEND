import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useAuthModal } from "./context/AuthModalContext";
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
import TestPage from "./pages/TestPage";
import SimpleAllNodesGraph from "./components/graph/SimpleAllNodesGraph";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import AdminProfile from "./pages/AdminProfile";
import UserProfile from "./pages/UserProfile";
import { AdminRoute } from "./routes/AdminRoute";
import { AuthModalProvider } from "./context/AuthModalContext";
import AuthModal from "./components/AuthModal";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import AdminManagement from "./pages/admin/AdminManagement";
import UserManagement from "./pages/admin/UserManagement";
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
import Permissions from "./pages/users/Permissions";
import SettingsPage from "./pages/users/Settings";

// Protected Route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { openModal } = useAuthModal();

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
                Your account is currently pending verification. Please complete the setup process to access this area.
              </p>
              <button
                onClick={() => openModal('verification')}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/20"
              >
                Complete Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Enforces whitelisted paths for unverified users
const VerificationGate = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { openModal, isOpen, verificationDismissed } = useAuthModal();  // ← added flag
  const location = useLocation();

  const whitelistedPaths = [
    '/', 
    '/product', 
    '/solutions', 
    '/resources', 
    '/company', 
    '/signin', 
    '/signup', 
    '/auth-callback',
    '/backend-test',
    '/testpage'
  ];

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.isVerified) {
      if (!whitelistedPaths.includes(location.pathname) && !isOpen && !verificationDismissed) {   // ← respect flag
        openModal('verification');
      }
    }
  }, [isLoading, isAuthenticated, user, location.pathname, openModal, isOpen, verificationDismissed]);

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AuthModalProvider>
            <AuthModal />
            <ModalProvider>
              <RemediationProvider>
                <VerificationGate>
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
                    <Route path="/testpage" element={
                      <ProtectedRoute>
                        <TestPage />
                      </ProtectedRoute>
                    } />
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
                    <Route path="user-management" element={<UserManagement />} />
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
                </VerificationGate>
              </RemediationProvider>
            </ModalProvider>
          </AuthModalProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}