import { useState, useEffect, useCallback } from "react";

/* ---------- Types (reused from Permissions) ---------- */
export interface OwnerDetail {
  upn: string;
  objectId: string;
  directoryRoles: string[];
}

export interface SpAnalysisItem {
  spId: string;
  displayName: string;
  risk_class: number;
  risk_label: string;
  risk_score: number;
  remediation: string[];
  permissions: string[];
  reasons: string[];
  owners: string[];
  ownerDetails: OwnerDetail[];
}

interface PermissionDto {
  id: string;
  type: string; // "AppRole" or "Delegated"
  permission: string;
}

interface UserDto {
  id: string;
  displayName: string;
  userPrincipalName: string;
  accountEnabled?: boolean;
}

/* ---------- Icons (matching your existing set) ---------- */
const Icons = {
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  spinner: (
    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

/* ---------- Helper: getUserToken ---------- */
function getToken() {
  return localStorage.getItem("token") || "";
}

/* ---------- Component ---------- */
interface Props {
  sp: SpAnalysisItem;
  onClose: () => void;
  onUpdated?: () => void; // callback to refresh main list
}

export default function ResolveModal({ sp, onClose, onUpdated }: Props) {
  // States for API data
  const [users, setUsers] = useState<UserDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(true);

  // UI state
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [ownerActionLoading, setOwnerActionLoading] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Current owners from SP data
  const currentOwners = sp.ownerDetails || [];

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setMessage(null);
    // Fetch users
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/api/Entra/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data: UserDto[] = await res.json();
        setUsers(data.filter(u => u.accountEnabled !== false));
      }
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoadingUsers(false);
    }

    // Fetch permission IDs for this SP
    setLoadingPerms(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/entra/service-principals/${sp.spId}/permissions`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (res.ok) {
        const data: PermissionDto[] = await res.json();
        setPermissions(data);
      }
    } catch (e) {
      console.error("Failed to load permissions", e);
    } finally {
      setLoadingPerms(false);
    }
  }, [sp.spId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Owner operations ──
  const addOwner = async () => {
    if (!selectedOwnerId) return;
    setOwnerActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/entra/service-principals/${sp.spId}/owners`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ userId: selectedOwnerId }),
        }
      );
      if (res.ok) {
        setMessage({ type: "success", text: "Owner added successfully." });
        setSelectedOwnerId("");
        onUpdated?.(); // refresh main list if needed
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to add owner." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setOwnerActionLoading(false);
    }
  };

  const removeOwner = async (userId: string) => {
    setOwnerActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/entra/service-principals/${sp.spId}/owners/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      if (res.ok) {
        setMessage({ type: "success", text: "Owner removed." });
        onUpdated?.();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to remove owner." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setOwnerActionLoading(false);
    }
  };

  // ── Permission revocation ──
  const togglePerm = (id: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const revokeSelected = async () => {
    if (selectedPerms.size === 0) return;
    setRevokeLoading(true);
    setMessage(null);
    let errors = 0;
    for (const perm of permissions) {
      if (selectedPerms.has(perm.id)) {
        try {
          const res = await fetch(
            `${API_BASE}/api/entra/service-principals/${sp.spId}/permissions/${perm.id}?type=${perm.type}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${getToken()}` },
            }
          );
          if (res.ok) {
            // remove from UI list
            setPermissions(prev => prev.filter(p => p.id !== perm.id));
          } else {
            errors++;
          }
        } catch {
          errors++;
        }
      }
    }
    setSelectedPerms(new Set());
    setRevokeLoading(false);
    if (errors > 0) {
      setMessage({ type: "error", text: `Revoked some, but ${errors} failed.` });
    } else {
      setMessage({ type: "success", text: "Selected permissions revoked." });
      onUpdated?.();
    }
  };

  // ── Render ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resolve Issues</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
              {sp.displayName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {Icons.close}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            }`}
          >
            {message.type === "success" ? Icons.check : Icons.warning}
            {message.text}
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* ── Owner Management ── */}
          <section>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Owners</h3>

            {/* Current owners */}
            {currentOwners.length > 0 ? (
              <ul className="space-y-2 mb-3">
                {currentOwners.map(owner => (
                  <li
                    key={owner.objectId}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-3 py-2"
                  >
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white">{owner.upn}</span>
                      {owner.directoryRoles.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({owner.directoryRoles.join(", ")})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeOwner(owner.objectId)}
                      disabled={ownerActionLoading}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No owners assigned.
              </p>
            )}

            {/* Add owner */}
            <div className="flex gap-2">
              <select
                value={selectedOwnerId}
                onChange={e => setSelectedOwnerId(e.target.value)}
                disabled={loadingUsers || ownerActionLoading}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white px-3 py-2 disabled:opacity-50"
              >
                <option value="">-- Select a user --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.userPrincipalName})
                  </option>
                ))}
              </select>
              <button
                onClick={addOwner}
                disabled={!selectedOwnerId || ownerActionLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md disabled:opacity-50 flex items-center gap-1"
              >
                {ownerActionLoading && Icons.spinner}
                Add
              </button>
            </div>
            {loadingUsers && <p className="text-xs text-gray-400 mt-1">Loading users...</p>}
          </section>

          {/* ── Permission Revocation ── */}
          <section>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Permissions</h3>
            {loadingPerms ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {Icons.spinner} Loading permissions...
              </div>
            ) : permissions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No revocable permissions found.
              </p>
            ) : (
              <>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-3 flex items-start gap-2">
                  {Icons.warning}
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    Revoking permissions is <strong>irreversible</strong>. Please ensure you review each selection carefully.
                  </p>
                </div>

                <ul className="space-y-1 mb-3">
                  {permissions.map(p => (
                    <li key={p.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`perm-${p.id}`}
                        checked={selectedPerms.has(p.id)}
                        onChange={() => togglePerm(p.id)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`perm-${p.id}`}
                        className="text-sm text-gray-900 dark:text-white font-mono break-all cursor-pointer"
                      >
                        {p.permission}
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          ({p.type})
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={revokeSelected}
                  disabled={selectedPerms.size === 0 || revokeLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md disabled:opacity-50 flex items-center gap-1"
                >
                  {revokeLoading && Icons.spinner}
                  Revoke Selected ({selectedPerms.size})
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}