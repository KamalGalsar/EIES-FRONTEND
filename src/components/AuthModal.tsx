// components/AuthModal.tsx
// this page is for blur effect of sign in and sign up page

import { useEffect, useRef, useState } from 'react';
import { useAuthModal } from '../context/AuthModalContext';
import SsoButtons from './SsoButtons';

export default function AuthModal() {
  const { isOpen, mode: contextMode, closeModal } = useAuthModal();
  const [mode, setMode] = useState<'signin' | 'signup'>(contextMode || 'signin');
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync internal mode with context when modal opens
  useEffect(() => {
    if (isOpen && contextMode) {
      setMode(contextMode);
    }
  }, [isOpen, contextMode]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeModal();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const title = mode === 'signin' ? 'Welcome Back' : 'Create Account';
  const subtitle =
    mode === 'signin'
      ? 'Sign in to continue your secure identity journey'
      : 'Get started with AI-powered identity security';

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
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

        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-black/60 dark:text-white/60 mt-2">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Body with SsoButtons */}
        <div className="p-6 sm:p-8">
          <SsoButtons mode={mode} />
          <div className="mt-6 text-center">
            <p className="text-sm text-black/60 dark:text-white/60">
              {mode === 'signin'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                onClick={switchMode}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {mode === 'signin' ? 'Create one now' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/50">
          <p className="text-xs text-center text-black/60 dark:text-white/60">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Privacy Policy
            </a>
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
  );
}