// components/users/Modals.tsx
import { useState } from 'react';
import { X, AlertTriangle, GitBranch, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface RemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  severity: string;
  status?: string | null;
  onConfirm?: () => Promise<void>; 
}

export function RemediationModal({ 
  isOpen, 
  onClose, 
  action, 
  severity,
  status = null,
  onConfirm
}: RemediationModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [remediationResult, setRemediationResult] = useState<{success: boolean; message: string} | null>(null);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (onConfirm) {
      setIsApplying(true);
      try {
        await onConfirm();
        setRemediationResult({ success: true, message: 'Remediation applied successfully!' });
      } catch (error) {
        setRemediationResult({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Failed to apply remediation' 
        });
      } finally {
        setIsApplying(false);
      }
    } else {
      // Fallback if no onConfirm provided
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Confirm Remediation</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-400 disabled:opacity-50"
            disabled={isApplying}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className={`p-4 rounded-lg mb-4 ${
          severity === 'critical' ? 'bg-red-600/20 border border-red-600/30' : 'bg-yellow-600/20 border border-yellow-600/30'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
            <span className={`font-medium ${severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}>
              {severity.toUpperCase()} RISK
            </span>
          </div>
        </div>

        {/* Status Message */}
        {status && !remediationResult && (
          <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <p className="text-sm text-blue-400">{status}</p>
            </div>
          </div>
        )}

        {/* Result Message */}
        {remediationResult && (
          <div className={`rounded-lg p-3 mb-4 ${
            remediationResult.success 
              ? 'bg-green-600/20 border border-green-600/30' 
              : 'bg-red-600/20 border border-red-600/30'
          }`}>
            <div className="flex items-center gap-2">
              {remediationResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <p className={`text-sm ${
                remediationResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {remediationResult.message}
              </p>
            </div>
          </div>
        )}

        {!remediationResult && (
          <>
            <p className="text-gray-300 mb-6">
              Are you sure you want to apply: <span className="text-white font-medium">"{action}"</span>?
              This will modify permissions and may impact access.
            </p>

            <div className="bg-gray-800/50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-400">AI Impact Analysis:</p>
              <p className="text-sm text-white mt-1">This action will reduce blast radius by 65% and remove 2 critical attack paths.</p>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
            disabled={isApplying}
          >
            {remediationResult ? 'Close' : 'Cancel'}
          </button>
          
          {!remediationResult && (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                severity === 'critical' 
                  ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-800' 
                  : 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800'
              }`}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply Remediation'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PathDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathName: string;
}

export function PathDetailsModal({ isOpen, onClose, pathName }: PathDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-500" />
            {pathName}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Attack Path</h4>
            <div className="flex items-center gap-2 text-sm text-white flex-wrap">
              <span className="px-2 py-1 bg-blue-600/20 rounded">OpsEngineer1</span>
              <span className="text-gray-600">→</span>
              <span className="px-2 py-1 bg-cyan-600/20 rounded">Group A</span>
              <span className="text-gray-600">→</span>
              <span className="px-2 py-1 bg-cyan-600/20 rounded">Group B</span>
              <span className="text-gray-600">→</span>
              <span className="px-2 py-1 bg-cyan-600/20 rounded">Group C</span>
              <span className="text-gray-600">→</span>
              <span className="px-2 py-1 bg-orange-600/20 rounded">Sub Owner</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Risk Score</p>
              <p className="text-2xl font-bold text-red-500">92</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Blast Radius</p>
              <p className="text-2xl font-bold text-white">140+</p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">AI Analysis</h4>
            <p className="text-sm text-white">
              Deep privilege inheritance chain through 4 nested groups leading to Subscription Owner access. 
              This path enables lateral movement to production workloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}