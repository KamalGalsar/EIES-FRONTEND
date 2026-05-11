import { useEffect, useState } from "react";
import ResolveModal, { type SpAnalysisItem } from "../../components/ResolveModal";
import { useToast } from "../../context/ToastContext";

interface SpAnalysisItemLocal extends SpAnalysisItem {}

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
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" />
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
};

const riskIcons: Record<number, React.ReactNode> = {
  0: Icons.riskLow,
  1: Icons.riskMedium,
  2: Icons.riskHigh,
  3: Icons.riskCritical,
};

function Badge({ text, className }: { text: string; className: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>{text}</span>;
}

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
        className="flex items-center gap-2 w-full text-left mb-2 group"
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

function ReasonsList({ reasons }: { reasons: string[] }) {
  if (!reasons || reasons.length === 0) return null;
  return (
    <div className="mt-3 ml-7">
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

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 text-center text-gray-500 dark:text-gray-400 text-sm">
      {text}
    </div>
  );
}

function SpItem({
  item,
  showPerms,
  showReasons,
  onResolve,
}: {
  item: SpAnalysisItemLocal;
  showPerms: boolean;
  showReasons: boolean;
  onResolve: (sp: SpAnalysisItem) => void;
}) {
  const ownerName = item.owners && item.owners.length > 0 ? item.owners[0] : null;

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-0.5 flex-shrink-0">{riskIcons[item.risk_class]}</span>
          <div className="min-w-0">
            <h4 className="text-gray-900 dark:text-white font-medium truncate">{item.displayName}</h4>
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
            text={item.risk_label}
            className={
              item.risk_class <= 1
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : item.risk_class === 2
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            }
          />
          <span className="text-xs text-gray-400">{item.risk_score.toFixed(1)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResolve(item);
            }}
            className="ml-2 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Resolve
          </button>
        </div>
      </div>

      {item.remediation.length > 0 && (
        <div className="mt-2 ml-7">
          <ul className="space-y-1">
            {item.remediation.map((step, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                {Icons.remediation}
                <span className="capitalize">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showPerms && item.permissions && item.permissions.length > 0 && (
        <PermissionsList permissions={item.permissions} />
      )}

      {showReasons && item.reasons && item.reasons.length > 0 && (
        <ReasonsList reasons={item.reasons} />
      )}
    </div>
  );
}
// Main component
export default function Permissions() {
  const [grouped, setGrouped] = useState<ReturnType<typeof groupFindings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolveSp, setResolveSp] = useState<SpAnalysisItem | null>(null);

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
      // Force backend to skip its cache and return fresh data
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
    clearCache();            // Destroy sessionStorage cache
    fetchAndSet(true, true); // Force fresh fetch & show overlay
  };

  useEffect(() => {
    fetchAndSet();
  }, []);

  const handleCloseModal = () => setResolveSp(null);
  const handleUpdated = () => {
    clearCache();
    showToast("Item resolved – refreshing permissions.", "success");
    fetchAndSet(true, true);
  };

  // Initial loading (no overlay)
  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading Privilege Governance…</span>
      </div>
    );
  }

  // Error when not refreshing
  if (error && !refreshing) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!grouped) return null;

  const { noOwnerToxicHigh, withOwnerToxic, noOwnerLowMedium } = grouped;
  const total = noOwnerToxicHigh.length + withOwnerToxic.length + noOwnerLowMedium.length;

  return (
    <>
      {refreshing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-3 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Refreshing data…</p>
          </div>
        </div>
      )}

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
              {Icons.refresh} Refresh Data
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privilege Governance</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 dark:border-gray-200"></div>
              ) : (
                Icons.refresh
              )}
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>

          <CollapsibleSection
            title="UnOwned & Toxic – High/Critical Risk"
            icon={Icons.ownerMissing}
            count={noOwnerToxicHigh.length}
            defaultOpen={true}
          >
            {noOwnerToxicHigh.length === 0 ? (
              <EmptyMessage text="No unowned, toxic high‑risk principals found." />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                {noOwnerToxicHigh.map((sp) => (
                  <SpItem key={sp.spId} item={sp} showPerms={true} showReasons={true} onResolve={setResolveSp} />
                ))}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Owned but Toxic Permissions"
            icon={Icons.toxic}
            count={withOwnerToxic.length}
            defaultOpen={false}
          >
            {withOwnerToxic.length === 0 ? (
              <EmptyMessage text="No owned principals with toxic permissions." />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                {withOwnerToxic.map((sp) => (
                  <SpItem key={sp.spId} item={sp} showPerms={true} showReasons={true} onResolve={setResolveSp} />
                ))}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="UnOwned – Low / Medium Risk"
            icon={Icons.ownerMissing}
            count={noOwnerLowMedium.length}
            defaultOpen={false}
          >
            {noOwnerLowMedium.length === 0 ? (
              <EmptyMessage text="No unowned low/medium risk principals." />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                {noOwnerLowMedium.map((sp) => (
                  <SpItem key={sp.spId} item={sp} showPerms={false} showReasons={true} onResolve={setResolveSp} />
                ))}
              </div>
            )}
          </CollapsibleSection>
        </div>
      )}

      {resolveSp && (
        <ResolveModal sp={resolveSp} onClose={handleCloseModal} onUpdated={handleUpdated} />
      )}
    </>
  );
}