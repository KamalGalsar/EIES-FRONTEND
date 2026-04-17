// Frontend/src/components/Layout.tsx

import { Outlet, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuthModal } from "../context/AuthModalContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "./AuthModal";

export default function Layout() {
  const { isOpen } = useAuthModal();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      if (error === 'user_not_found') {
         alert('Account not found. Please sign up first.');
      } else if (error === 'user_exists') {
         alert('Account already exists. Please sign in instead.');
      } else {
         alert(`Authentication failed: ${error}`);
      }
      
      searchParams.delete('error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <main
        className={`
          flex-grow transition-all duration-300 ease-in-out
          ${
            isOpen
              ? "blur-sm scale-95 opacity-50 pointer-events-none"
              : ""
          }
        `}
      >
        <Outlet />
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
}