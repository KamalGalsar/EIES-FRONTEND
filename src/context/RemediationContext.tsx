import { createContext, useContext, useState, type ReactNode } from "react";

interface RemediationContextType {
  showRemediationModal: (action: string) => void;
  isModalOpen: boolean;
  selectedAction: string;
  remediationStatus: string | null;
  closeModal: () => void;
  setRemediationStatus: (status: string | null) => void;
}

const RemediationContext = createContext<RemediationContextType | undefined>(undefined);

export function RemediationProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [remediationStatus, setRemediationStatus] = useState<string | null>(null);

  const showRemediationModal = (action: string) => {
    setSelectedAction(action);
    setIsModalOpen(true);
    setRemediationStatus(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRemediationStatus(null);
  };

  return (
    <RemediationContext.Provider
      value={{
        showRemediationModal,
        isModalOpen,
        selectedAction,
        remediationStatus,
        closeModal,
        setRemediationStatus,
      }}
    >
      {children}
    </RemediationContext.Provider>
  );
}

export function useRemediation() {
  const context = useContext(RemediationContext);
  if (context === undefined) {
    throw new Error("useRemediation must be used within a RemediationProvider");
  }
  return context;
}