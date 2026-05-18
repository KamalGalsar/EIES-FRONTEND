// Frontend/src/context/AuthModalContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';

type AuthMode = 'signin' | 'signup' | 'verification' | null;

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthMode;
  openModal: (mode: AuthMode) => void;
  closeModal: () => void;
  verificationDismissed: boolean;
  dismissVerification: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>(null);
  const [verificationDismissed, setVerificationDismissed] = useState(false);

  const openModal = useCallback(
    (modalMode: AuthMode) => {
      setMode(modalMode);
      setIsOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setMode(null);
  }, []);

  const dismissVerification = useCallback(() => {
    setVerificationDismissed(true);
    setIsOpen(false);
    setMode(null);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        openModal,
        closeModal,
        verificationDismissed,
        dismissVerification,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};