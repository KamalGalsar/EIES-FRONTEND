// src/pages/SignIn.tsx
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SsoButtons from '../components/SsoButtons';

export default function SignIn() {
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = params.get('redirect') || '/';
      navigate(redirectTo);
      return;
    }

    const error = params.get('error');
    if (error) {
      if (error === 'user_not_found') {
        alert('No account found with this email. Please sign up first.');
      } else if (error === 'auth_failed') {
        alert('Authentication failed. Please try again.');
      }
    }
  }, [params, isAuthenticated, navigate]);

  const handleClose = () => {
    const redirectTo = params.get('redirect');
    if (redirectTo) {
      navigate(redirectTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-2xl">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 animate-pulse" />

          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Close Icon */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-200 group"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 sm:p-8 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome Back to EIES
                </h1>
                <p className="text-sm sm:text-base text-black/60 dark:text-white/60 mt-2">
                  Sign in to continue your secure identity journey
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <SsoButtons mode="signin" />

              <div className="mt-6 text-center">
                <p className="text-sm text-black/60 dark:text-white/60">
                  Don&apos;t have an account?{' '}
                  <Link 
                    to={`/signup${params.get('redirect') ? `?redirect=${params.get('redirect')}` : ''}`} 
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Create one now
                  </Link>
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/50">
              <p className="text-xs text-center text-black/60 dark:text-white/60">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Privacy Policy</a>
              </p>
              <p className="text-xs text-center text-black/40 dark:text-white/40 mt-2 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                </svg>
                Secured by EIES • Azure-native identity security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}