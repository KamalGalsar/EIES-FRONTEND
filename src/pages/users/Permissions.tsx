import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ShieldCheck, UserX, UserCheck, Search, RefreshCw, LayoutList } from "lucide-react";
import ResolveModal, { type SpAnalysisItem } from "../../components/ResolveModal";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";


// Types
interface SpAnalysisItemLocal extends SpAnalysisItem {}

// Cache management
const CACHE_KEY = "sp_analysis_cache_v4";
const CACHE_TTL_MS = 60 * 60 * 1000;

const loadFromCache = (): SpAnalysisItemLocal[] | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const saveToCache = (data: SpAnalysisItemLocal[]) => {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (e) {
    console.warn("Failed to cache SP analysis", e);
  }
};

const clearCache = () => {
  sessionStorage.removeItem(CACHE_KEY);
};

// Group findings by risk and ownership
function groupFindings(items: SpAnalysisItemLocal[]) {
  const noOwnerToxicHigh: SpAnalysisItemLocal[] = [];
  const withOwnerToxic: SpAnalysisItemLocal[] = [];
  const noOwnerLowMedium: SpAnalysisItemLocal[] = [];

  for (const item of items) {
    const hasOwner = !item.remediation.includes("add an owner");
    const toxic = item.remediation.includes("revoke permissions");
    const isHighCritical = item.risk_class >= 2;

    if (!hasOwner && toxic && isHighCritical) {
      noOwnerToxicHigh.push(item);
    } else if (hasOwner && toxic) {
      withOwnerToxic.push(item);
    } else if (!hasOwner && !toxic && !isHighCritical) {
      noOwnerLowMedium.push(item);
    }
  }
  return { noOwnerToxicHigh, withOwnerToxic, noOwnerLowMedium };
}

// Icon components
const Icons = {
  ownerMissing: (
    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6m6 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  toxic: (
    <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  riskLow: (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  riskMedium: (
    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  riskHigh: (
    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  riskCritical: (
    <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  remediation: (
    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  reason: (
    <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4 text-blue-500 hover:text-blue-700 flex-shrink-0 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  refresh: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  delete: (
    <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
};

// Risk icon mapping
const riskIcons: Record<number, React.ReactNode> = {
  0: Icons.riskLow,
  1: Icons.riskMedium,
  2: Icons.riskHigh,
  3: Icons.riskCritical,
};

// Badge component
function Badge({ text, className }: { text: string; className: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>{text}</span>;
}

// Collapsible section component
function CollapsibleSection({
  title,
  icon,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sticky top-32 md:top-36 z-20 flex items-center gap-2 w-full text-left mb-2 group bg-gray-50 dark:bg-gray-900 py-2"
      >
        {isOpen ? Icons.chevronDown : Icons.chevronRight}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex-shrink-0">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
          <Badge text={String(count)} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex-shrink-0" />
        </div>
      </button>
      {isOpen && <div className="ml-7">{children}</div>}
    </div>
  );
}

// Permissions list with show more
function PermissionsList({ permissions }: { permissions: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const MAX_VISIBLE = 5;

  if (!permissions || permissions.length === 0) return null;

  const flattened: string[] = permissions.flatMap((p) =>
    p
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  );

  if (flattened.length === 0) return null;

  const visible = showAll ? flattened : flattened.slice(0, MAX_VISIBLE);
  const hiddenCount = flattened.length - MAX_VISIBLE;

  return (
    <div className="mt-2 ml-7">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Permissions:</p>
      <ul className="space-y-0.5">
        {visible.map((perm, i) => (
          <li key={i} className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all">
            {perm}
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
        >
          Show {hiddenCount} more...
        </button>
      )}
      {showAll && flattened.length > MAX_VISIBLE && (
        <button
          onClick={() => setShowAll(false)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
        >
          Show less
        </button>
      )}
    </div>
  );
}

// Reasons list
function ReasonsList({ reasons }: { reasons: string[] }) {
  if (!reasons || reasons.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
        <span className="flex-shrink-0">{Icons.reason}</span>
        Why this is flagged:
      </p>
      <ul className="space-y-1.5">
        {reasons.map((reason, idx) => (
          <li key={idx} className="text-sm text-purple-700 dark:text-purple-300 italic leading-relaxed">
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Empty state message
function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 text-center text-gray-500 dark:text-gray-400 text-sm">
      {text}
    </div>
  );
}

// Individual SP item
function SpItem({
  item,
  showPerms,
  onResolve,
  onDelete,
  isHighlighted = false,
}: {
  item: SpAnalysisItemLocal;
  showPerms: boolean;
  onResolve: (sp: SpAnalysisItem) => void;
  onDelete?: (spId: string) => void;
  isHighlighted?: boolean;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { privacyMode } = useAuth();
  const ownerName = item.owners && item.owners.length > 0 ? item.owners[0] : null;
  const isUnassigned = item.remediation.includes("add an owner");

  // Replace "Critical" with "High" for display
  const displayRiskLabel = item.risk_label === "Critical" ? "High" : item.risk_label;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setDeleteConfirmOpen(false);
    if (onDelete) {
      onDelete(item.spId);
    }
  };

  return (
    <div      id={`sp-item-${item.spId}`}      ref={itemRef}
      className={`p-4 transition-colors ${isHighlighted ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 rounded-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-0.5 flex-shrink-0">{riskIcons[item.risk_class]}</span>
          <div className="min-w-0">
            <h4 className="text-gray-900 dark:text-white font-medium truncate">
              {item.displayName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{item.spId}</p>
            {ownerName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                Owner: {ownerName}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve(item);
                  }}
                  className="inline-flex items-center"
                  title="Change owner"
                >
                  {Icons.edit}
                </button>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            text={displayRiskLabel}
            className={
              item.risk_class <= 1
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : item.risk_class === 2
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            }
          />
          <span className="text-xs text-gray-400">{item.risk_score.toFixed(1)}</span>

          {/* Info button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setInfoOpen(!infoOpen);
            }}
            className="ml-1 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title="Show details"
          >
            {Icons.info}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onResolve(item);
            }}
            className="ml-1 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Resolve
          </button>

          {/* Delete button – only for unassigned SPs */}
          {isUnassigned && onDelete && (
            <button
              onClick={handleDeleteClick}
              className="ml-1 px-3 py-1 text-xs border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors flex items-center gap-1"
            >
              {Icons.delete} Delete
            </button>
          )}
        </div>
      </div>

      {/* Info panel – reasons first, then remediation */}
      {infoOpen && (
        <div className="mt-3 ml-7 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-3">
          {item.reasons && item.reasons.length > 0 && (
            <ReasonsList reasons={item.reasons} />
          )}
          {item.remediation.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                {Icons.remediation}
                Remediation steps:
              </p>
              <ul className="space-y-1">
                {item.remediation.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <span className="capitalize">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Permissions list (unchanged) */}
      {showPerms && item.permissions && item.permissions.length > 0 && (
        <PermissionsList permissions={item.permissions} />
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">Delete Service Principal</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 break-words">
                  Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white break-words">
                    {item.displayName}
                  </span>?
                </p>
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 break-words">
                  This action is irreversible and will permanently remove the service principal.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-1"
              >
                {Icons.delete} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main exported component
export default function Permissions() {
  const [grouped, setGrouped] = useState<ReturnType<typeof groupFindings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolveSp, setResolveSp] = useState<SpAnalysisItem | null>(null);
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "unassigned" | "assigned">("unassigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedSpId, setHighlightedSpId] = useState<string | null>(null);
  const { privacyMode } = useAuth();

  const { showToast } = useToast();

  const fetchAndSet = async (skipCache = false, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    if (!skipCache && !isRefresh) {
      const cached = loadFromCache();
      if (cached) {
        setGrouped(groupFindings(cached));
        setLoading(false);
        return;
      }
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";
      const url = isRefresh
        ? `${baseUrl}/api/SpAnalysis?refresh=true&t=${Date.now()}`
        : `${baseUrl}/api/SpAnalysis`;

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data: SpAnalysisItemLocal[] = await res.json();
      const newGrouped = groupFindings(data);
      setGrouped(newGrouped);
      saveToCache(data);
      setError(null);

      if (isRefresh) {
        showToast("Data refreshed successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to fetch SP analysis:", err);
      setError("Unable to load Permissions data. Please try again later.");
      if (isRefresh) {
        showToast("Refresh failed. Please try again.", "error");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    clearCache();
    fetchAndSet(true, true);
  };

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const targetSpId = params.get("spId");

  useEffect(() => {
    fetchAndSet();
  }, []);

  // Handle URL-based highlighting and filtering
  useEffect(() => {
    if (targetSpId && grouped) {
      const { noOwnerToxicHigh, noOwnerLowMedium } = grouped;
      
      // Determine which filter group contains the target SP
      const isInUnassigned = 
        noOwnerToxicHigh.some(sp => sp.spId === targetSpId) ||
        noOwnerLowMedium.some(sp => sp.spId === targetSpId);
      
      // Switch filter if needed
      if (isInUnassigned && assignmentFilter !== "unassigned") {
        setAssignmentFilter("unassigned");
      } else if (!isInUnassigned && assignmentFilter !== "assigned") {
        setAssignmentFilter("assigned");
      }
      
      // Set highlight and scroll
      setHighlightedSpId(targetSpId);
      
      // Scroll to the element after a small delay to ensure DOM is updated
      setTimeout(() => {
        const element = document.getElementById(`sp-item-${targetSpId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [targetSpId, grouped]);

  const handleCloseModal = () => setResolveSp(null);
  const handleUpdated = () => {
    clearCache();
    showToast("Item resolved – refreshing permissions.", "success");
    fetchAndSet(true, true);
  };

  // Delete service principal
  const handleDeleteSp = async (spId: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";
      const res = await fetch(
        `${baseUrl}/api/entra/service-principals/${encodeURIComponent(spId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Delete failed with status ${res.status}`);
      }

      clearCache();
      showToast("Service principal deleted successfully.", "success");
      fetchAndSet(true, true);
    } catch (err: any) {
      console.error("Failed to delete service principal:", err);
      showToast(
        err.message || "Failed to delete service principal. Please try again.",
        "error"
      );
    }
  };

  // Search filter function
  const filterItems = (items: SpAnalysisItemLocal[]) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (sp) =>
        sp.displayName.toLowerCase().includes(query) ||
        sp.spId.toLowerCase().includes(query)
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading Privilege Governance…</span>
      </div>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!grouped) return null;

  const { noOwnerToxicHigh, withOwnerToxic, noOwnerLowMedium } = grouped;

  // Apply search filter to each group
  const filteredNoOwnerToxicHigh = filterItems(noOwnerToxicHigh);
  const filteredWithOwnerToxic = filterItems(withOwnerToxic);
  const filteredNoOwnerLowMedium = filterItems(noOwnerLowMedium);

  const showUnassigned = assignmentFilter === "unassigned" || assignmentFilter === "all";
  const showAssigned = assignmentFilter === "assigned" || assignmentFilter === "all";
  const unassignedTotal = noOwnerToxicHigh.length + noOwnerLowMedium.length; // original counts
  const assignedTotal = withOwnerToxic.length;
  const total = unassignedTotal + assignedTotal;

  return (
    <>
      {/* Refreshing overlay */}
      {refreshing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-3 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Refreshing data…</p>
          </div>
        </div>
      )}

      {/* Main container with Directory-like spacing */}
      <div className="p-4 sm:p-6 space-y-2 -mt-8 sm:-mt-10">
        {/* Sticky header */}
        <div className="sticky top-16 md:top-20 z-30 bg-gray-50 dark:bg-gray-900 py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 shadow-xs transition-all">
          <div className="absolute left-0 right-0 top-full h-2 bg-gray-50 dark:bg-gray-900 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" />
              <span className="truncate">Privilege Governance</span>
            </h1>

            {/* Right side: filters + search + refresh */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {/* Filter button group */}
              <div className="flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setAssignmentFilter("all")}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-l-lg border ${
                    assignmentFilter === "all"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                  All ({total})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentFilter("unassigned")}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border ${
                    assignmentFilter === "unassigned"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <UserX className="w-4 h-4" />
                  Unassigned ({unassignedTotal})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentFilter("assigned")}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-r-lg border ${
                    assignmentFilter === "assigned"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Assigned ({assignedTotal})
                </button>
              </div>

              {/* Search + Refresh */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Refresh data"
                >
                  {refreshing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        {total === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-10 text-center text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold">All Clear</h3>
            <p className="mt-1">No high‑risk permission issues detected.</p>
            <div className="mt-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Unassigned view */}
            {showUnassigned && (
              <div className="space-y-6">
                <CollapsibleSection
                  title="UnAssigned & High Privileged SPs"
                  icon={Icons.ownerMissing}
                  count={noOwnerToxicHigh.length}
                  defaultOpen={true}
                >
                  {filteredNoOwnerToxicHigh.length === 0 ? (
                    <EmptyMessage text={searchQuery ? "No matching items found." : "No UnAssigned, High Privileged high‑risk principals found."} />
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredNoOwnerToxicHigh.map((sp) => (
                        <SpItem key={sp.spId} item={sp} showPerms={true} onResolve={setResolveSp} onDelete={handleDeleteSp} isHighlighted={highlightedSpId === sp.spId} />
                      ))}
                    </div>
                  )}
                </CollapsibleSection>

                <CollapsibleSection
                  title="UnAssigned & Moderate SPs"
                  icon={Icons.ownerMissing}
                  count={noOwnerLowMedium.length}
                  defaultOpen={false}
                >
                  {filteredNoOwnerLowMedium.length === 0 ? (
                    <EmptyMessage text={searchQuery ? "No matching items found." : "No UnAssigned low/medium risk principals."} />
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredNoOwnerLowMedium.map((sp) => (
                        <SpItem key={sp.spId} item={sp} showPerms={false} onResolve={setResolveSp} onDelete={handleDeleteSp} isHighlighted={highlightedSpId === sp.spId} />
                      ))}
                    </div>
                  )}
                </CollapsibleSection>
              </div>
            )}

            {/* Assigned view */}
            {showAssigned && (
              <CollapsibleSection
                title="Assigned but High Privileged SPs"
                icon={Icons.toxic}
                count={withOwnerToxic.length}
                defaultOpen={true}
              >
                {filteredWithOwnerToxic.length === 0 ? (
                  <EmptyMessage text={searchQuery ? "No matching items found." : "No Assigned principals with high privileged permissions."} />
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredWithOwnerToxic.map((sp) => (
                      <SpItem key={sp.spId} item={sp} showPerms={true} onResolve={setResolveSp} isHighlighted={highlightedSpId === sp.spId} />
                    ))}
                  </div>
                )}
              </CollapsibleSection>
            )}
          </div>
        )}
      </div>

      {resolveSp && (
        <ResolveModal sp={resolveSp} onClose={handleCloseModal} onUpdated={handleUpdated} />
      )}
    </>
  );
}