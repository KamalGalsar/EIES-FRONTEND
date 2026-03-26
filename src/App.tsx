import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ModalProvider } from "./components/ModalContext";
import { ToastProvider } from "./context/ToastContext"; 
import Layout from "./components/Layout";
import AuthCallback from "./pages/AuthCallback";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Solutions from "./pages/Solutions";
import Pricing from "./pages/Pricing";
import Resources from "./pages/Resources";
import Company from "./pages/Company";
import Contact from "./pages/Contact";
import AdminGovernance from "./pages/AdminGovernance";
import Users from "./pages/Users";
import BackendTest from "./pages/BackendTest";
import IdentityGraph from "./pages/IdentityGraph";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import AdminProfile from "./pages/AdminProfile";
import UserProfile from "./pages/UserProfile";
import { AdminRoute } from './routes/AdminRoute';
import { AuthModalProvider } from './context/AuthModalContext';
// import AuthModal from './components/AuthModal';

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
                {/* not needed now as integrated admin/users dashboard */}
                {/* <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <div className="p-8 text-center text-gray-600 dark:text-gray-300">
                        Dashboard
                      </div>
                    </ProtectedRoute>
                  }
                /> */}
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
                    <AdminGovernance />
                  </AdminRoute>
                }
              />
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
              <Route
                path="/users/:userId"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/identity-graph"
                element={
                  <ProtectedRoute>
                    <IdentityGraph />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ModalProvider>
        </AuthProvider>
       </AuthModalProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}