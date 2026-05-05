// Frontend/src/components/graph/BlastRadiusGraph.tsx

import { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ControlButton,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState
} from 'reactflow';
// Import types separately for Vite compatibility
import type { Node, Edge, ReactFlowInstance } from 'reactflow';
import 'reactflow/dist/style.css';
import { ShieldAlert, Info, RotateCcw, Lock, UserMinus, AlertTriangle, Zap, CheckCircle2, RefreshCw, X, Download, Settings2 } from 'lucide-react';
import { exportGraphAsPng } from '../../utils/graphExport';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';



function getNodeStyle(type: string, riskClass: number, isStart: boolean) {
  const base = {
    padding: '10px 15px',
    borderRadius: '8px',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    border: '2px solid',
    width: 'max-content',
    minWidth: '160px',
    whiteSpace: 'nowrap'
  };

  const isCritical = riskClass >= 4;

  switch (type.toLowerCase()) {
    case 'user':
      return {
        ...base,
        background: '#1E3A8A',
        borderColor: isStart ? '#00f2ff' : '#3B82F6',
        borderRadius: '20px',
        boxShadow: isStart ? '0 0 20px rgba(0, 242, 255, 0.4)' : base.boxShadow
      };
    case 'group':
      return { ...base, background: '#0E7490', borderColor: '#06B6D4' };
    case 'azurerole':
    case 'role':
      return { ...base, background: '#B45309', borderColor: '#F59E0B' };
    case 'subscription':
      return { ...base, background: '#047857', borderColor: '#10B981', width: 200 };
    case 'tenant':
      return { ...base, background: '#5B21B6', borderColor: '#8B5CF6' };
    default:
      return { ...base, background: '#1E293B', borderColor: '#475569' };
  }
}

function buildLayout(rawNodes: any[], rawEdges: any[]) {
  const childrenOf = new Map<string, string[]>();

  rawEdges.forEach((e) => {
    if (!childrenOf.has(e.from)) childrenOf.set(e.from, []);
    childrenOf.get(e.from)!.push(e.to);
  });

  const rootId = rawNodes.find(n => n.isStartNode)?.id || (rawNodes.length > 0 ? rawNodes[0].id : null);
  const depth = new Map<string, number>();

  if (!rootId) return { nodes: [], edges: [] };

  const queue = [rootId];
  depth.set(rootId, 0);

  while (queue.length) {
    const curr = queue.shift()!;
    const curDepth = depth.get(curr)!;
    const children = childrenOf.get(curr) || [];
    children.forEach((child) => {
      if (!depth.has(child)) {
        depth.set(child, curDepth + 1);
        queue.push(child);
      }
    });
  }

  rawNodes.forEach(n => {
    if (!depth.has(n.id)) {
      depth.set(n.id, 1);
    }
  });

  const byLevel = new Map<number, string[]>();
  rawNodes.forEach((n) => {
    const lvl = depth.get(n.id) ?? 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(n.id);
  });

  const LEVEL_HEIGHT = 200; // Balanced height for organic curves
  const TOP_PADDING = 100;

  const rfNodes: Node[] = rawNodes.map((node) => {
    const lvl = depth.get(node.id) ?? 0;
    const idsAtLvl = byLevel.get(lvl) || [];
    const index = idsAtLvl.indexOf(node.id);

    const charWidth = 8;
    const padding = 40;
    const nodeWidths = idsAtLvl.map(id => {
      const node = rawNodes.find(n => n.id === id);
      const label = node?.label || "";
      return Math.max(160, label.length * charWidth + padding);
    });

    const hGap = 60;
    const totalLevelWidth = nodeWidths.reduce((a, b) => a + b, 0) + (idsAtLvl.length - 1) * hGap;

    let startX = -(totalLevelWidth / 2) + 500;
    for (let i = 0; i < index; i++) {
      startX += nodeWidths[i] + hGap;
    }
    const width = nodeWidths[index];
    const x = startX + (width / 2);
    const y = TOP_PADDING + (lvl * LEVEL_HEIGHT);

    return {
      id: node.id,
      data: {
        label: node.label,
        nodeType: node.type,          // actual node type (user/group/etc)
        riskClass: node.riskClass ?? 0,
        riskScore: node.riskScore ?? 0,
        explanation: node.explanation ?? '',
        isStartNode: node.isStartNode ?? false,
      },
      position: { x: x - width / 2, y: y },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      style: {
        ...getNodeStyle(node.type, node.riskClass, node.isStartNode),
      },
      title: node.label // Add title for hover tooltip
    };
  });

  const rfEdges: Edge[] = rawEdges.map((e, i) => ({
    id: `e${i}-${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    animated: false,
    label: e.type || "memberOf",
    labelStyle: { fill: "#22D3EE", fontSize: "11px", fontWeight: "bold" },
    labelShowBg: true,
    labelBgStyle: { fill: "#0F172A", fillOpacity: 0.9 },
    style: { stroke: e.affected ? "#EF4444" : "#3B82F6", strokeWidth: 2.5 },
  }));

  return { nodes: rfNodes, edges: rfEdges };
}

interface BlastRadiusGraphProps {
  nodeId: string;
}

export default function BlastRadiusGraph({ nodeId }: BlastRadiusGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [impact, setImpact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [remediating, setRemediating] = useState(false);
  const [remediatedNodes, setRemediatedNodes] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ opt: any } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLocked, setIsLocked] = useState(true); // true = nodes are locked (cannot be dragged)
  const { showToast } = useToast();
  const flowInstance = useRef<ReactFlowInstance | null>(null);

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  // Step 1: Show confirmation modal
  const requestRemediation = (opt: any) => {
    setConfirmAction({ opt });
  };

  // Step 2: Execute after user confirms
  const handleRemediate = async () => {
    if (!selectedNode || !confirmAction) return;
    const { opt } = confirmAction;
    setConfirmAction(null);

    try {
      setRemediating(true);
      // Strip non-serializable properties like JSX icons from the context
      const { icon, ...serializableOpt } = opt;

      const response = await api.post('/Remediation/trigger-remediation', {
        action: opt.action,
        timestamp: new Date().toISOString(),
        context: {
          ...serializableOpt,
          nodeId: selectedNode.id,
          nodeType: selectedNode.data?.nodeType,
          nodeLabel: selectedNode.data?.label
        }
      });

      if (response.data.success) {
        // Mark node as remediated visually
        setRemediatedNodes(prev => new Set([...prev, selectedNode.id]));
        showToast(`✓ ${response.data.message || 'Remediation applied successfully'}`, 'success');

        // Re-fetch graph to reflect changes (with a slightly longer delay for Azure to propagate)
        setTimeout(async () => {
          await fetchGraph(true);
        }, 3500);
      } else {
        showToast(response.data.error || 'Remediation failed', 'error');
      }
    } catch (error: any) {
      console.error('Remediation error:', error);
      showToast(error?.response?.data?.error || 'Failed to trigger remediation', 'error');
    } finally {
      setRemediating(false);
    }
  };

  const getRemediationOptions = (node: any) => {
    if (!node) return [];
    // node.data.nodeType holds the actual type (user/group/application/etc)
    // node.type is a ReactFlow internal field ('input'/'default') — do NOT use it here
    const type = (node.data?.nodeType || '').toLowerCase();
    const riskClass: number = node.data?.riskClass ?? 0;

    if (type === 'user') {
      const opts: any[] = [];

      // --- SMART PATH-BREAKING LOGIC ---
      const roleNodes = nodes.filter(n => {
        const t = ((n.data as any)?.nodeType || '').toLowerCase();
        return t === 'role' || t === 'azurerole';
      });
      if (roleNodes.length > 0) {
        // Build adjacency list
        const adj: Record<string, string[]> = {};
        edges.forEach(e => {
          if (!adj[e.source]) adj[e.source] = [];
          adj[e.source].push(e.target);
        });

        // BFS to find shortest path to a role
        const queue: { id: string, path: string[] }[] = [{ id: node.id, path: [node.id] }];
        const visited = new Set<string>([node.id]);

        let shortestPath: string[] | null = null;
        let targetNode: any = null;

        while (queue.length > 0) {
          const { id, path } = queue.shift()!;
          const nodeObj = nodes.find(n => n.id === id);

          if (id !== node.id) {
            const t = ((nodeObj?.data as any)?.nodeType || '').toLowerCase();
            if (t === 'role' || t === 'azurerole') {
              shortestPath = path;
              targetNode = nodeObj;
              break; // Found shortest path to a role
            }
          }

          for (const nbr of (adj[id] || [])) {
            if (!visited.has(nbr)) {
              visited.add(nbr);
              queue.push({ id: nbr, path: [...path, nbr] });
            }
          }
        }

        if (shortestPath && shortestPath.length >= 3) {
          let breakSource: any = null;
          let breakTarget: any = null;

          // Find the first group -> group edge
          for (let i = 0; i < shortestPath.length - 1; i++) {
            const src = nodes.find(n => n.id === shortestPath[i]);
            const tgt = nodes.find(n => n.id === shortestPath[i + 1]);
            if ((src?.data as any)?.nodeType === 'group' && (tgt?.data as any)?.nodeType === 'group') {
              breakSource = src;
              breakTarget = tgt;
              break;
            }
          }

          // If no group->group edge, use user->group edge
          if (!breakSource) {
            const src = nodes.find(n => n.id === shortestPath[0]);
            const tgt = nodes.find(n => n.id === shortestPath[1]);
            if (src && tgt && (tgt.data as any)?.nodeType === 'group') {
              breakSource = src;
              breakTarget = tgt;
            }
          }

          if (breakSource && breakTarget) {
            opts.push({
              id: 'smart-path-break',
              label: `Unnest ${breakSource.data.label}`,
              icon: <ShieldAlert className="w-4 h-4" />,
              action: 'Sever specific attack path',
              reason: `Identity inherits high-risk role (${targetNode?.data?.label || 'Target'}) indirectly via nested group. Removing the role at the endpoint disrupts intended access for others.`,
              benefit: `Breaks the specific attack path by removing ${breakSource.data.label} from ${breakTarget.data.label}, neutralizing risk efficiently.`,
              impact: `Members of ${breakSource.data.label} lose permissions inherited from ${breakTarget.data.label}.`,
              sourceGroupId: breakTarget.id, // Group B (parent)
              memberIdToRemove: breakSource.id // Group A (child)
            });
          }
        }
      }
      // --- END SMART LOGIC ---

      opts.push(
        {
          id: 'revoke',
          label: 'Revoke Sessions',
          icon: <RotateCcw className="w-4 h-4" />,
          action: 'Revoke all active sessions',
          reason: `This user has a risk class of ${riskClass}. Active sessions may already be compromised.`,
          benefit: 'Immediately invalidates all existing login tokens across all devices and apps.',
          impact: 'The user will be signed out everywhere and must re-authenticate. Inform them beforehand if possible.'
        },
        {
          id: 'reset',
          label: 'Reset Password',
          icon: <Lock className="w-4 h-4" />,
          action: 'Reset user password',
          reason: 'Suspected credential exposure or high-risk path detected from this identity.',
          benefit: 'Closes any backdoor opened by leaked credentials.',
          impact: 'User will be forced to set a new password on next login. May cause temporary disruption.'
        }
      );
      return opts;
    } else if (type === 'group') {
      return [
        {
          id: 'remove',
          label: 'Audit Members',
          icon: <UserMinus className="w-4 h-4" />,
          action: 'Remove from privileged groups',
          reason: `This group (risk class ${riskClass}) expands the attack surface through nested membership.`,
          benefit: 'Reduces the blast radius by breaking the privilege chain at this group.',
          impact: 'Users in this group will lose inherited access to admin resources. Review before applying.'
        }
      ];
    } else if (type === 'application' || type === 'serviceprincipal') {
      const options = [];

      // Critical/High risk remediation
      if (riskClass >= 3) {
        options.push({
          id: 'revoke-all',
          label: 'Revoke All Permissions',
          icon: <ShieldAlert className="w-4 h-4" />,
          action: 'RevokeAllPermissions',
          reason: `This application (risk class ${riskClass}) has excessive permissions and no active governance.`,
          benefit: 'Immediately severs all API access granted to this application.',
          impact: 'The application will stop functioning for all users until permissions are re-granted.'
        });
      }

      // Modern Auth / Legacy protocol remediation
      options.push({
        id: 'legacy',
        label: 'Block Legacy Auth',
        icon: <Lock className="w-4 h-4" />,
        action: 'Disable legacy authentication',
        reason: `This application (risk class ${riskClass}) may support legacy protocols that bypass MFA.`,
        benefit: 'Enforcing modern auth blocks credential spray and brute-force attacks on this app.',
        impact: 'Older clients using IMAP/POP3/SMTP basic auth will stop working. Test in staging first.'
      });

      return options;
    } else if (type === 'azurerole' || type === 'role') {
      return [
        {
          id: 'role-review',
          label: 'Remove Role Assignment',
          icon: <AlertTriangle className="w-4 h-4" />,
          action: 'Remove Azure role assignment',
          reason: `Azure role assignments (risk class ${riskClass}) grant broad resource permissions that increase blast radius.`,
          benefit: 'Removing unnecessary role assignments follows least-privilege principle.',
          impact: 'The specific role assignment between this identity and the resource will be deleted in Azure.',
          sourcePrincipalId: nodeId // Pass the root identity being analyzed
        }
      ];
    }
    return [];
  };

  const fetchGraph = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
      // Force key update to ensure ReactFlow re-processes node set
      setRefreshKey(prev => prev + 1);
      // Clear manual remediation markers as we are fetching new source-of-truth
      setRemediatedNodes(new Set());
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get(`/Toxic/blast-radius/${nodeId}${forceRefresh ? '?refresh=true' : ''}`);
      const { nodes: rawNodes, edges: rawEdges, impact: impactData } = response.data;

      const { nodes: rfNodes, edges: rfEdges } = buildLayout(rawNodes, rawEdges);
      setNodes(rfNodes);
      setEdges(rfEdges);
      setImpact(impactData);

      /* REMOVED: Automatic fitView on every fetch that reset manual placement. Initial fitView is still handled by ReactFlow props if needed or can be called once. */

      if (forceRefresh) showToast('Blast radius updated from Azure', 'success');
    } catch (error) {
      console.error('Failed to fetch blast radius:', error);
      showToast('Failed to refresh graph data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [nodeId, showToast]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#0F172A] border border-slate-800 rounded-lg overflow-hidden relative">

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-orange-950/40 border-b border-orange-800/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-orange-300">Confirm Remediation</span>
              </div>
              <button onClick={() => setConfirmAction(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {confirmAction.opt.icon}
                <span className="text-sm font-semibold text-white">{confirmAction.opt.label}</span>
                <span className="text-[10px] text-slate-400">on</span>
                <span className="text-[11px] font-bold text-blue-300 truncate">{selectedNode?.data?.label}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                <div>
                  <div className="text-[9px] text-red-400 uppercase font-bold tracking-wider mb-0.5">⚠ Why?</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{confirmAction.opt.reason}</p>
                </div>
                <div>
                  <div className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider mb-0.5">✓ What happens?</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{confirmAction.opt.impact}</p>
                </div>
              </div>
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-2">
                <p className="text-[10px] text-amber-300">
                  ⚡ The graph will automatically refresh after remediation to reflect the updated risk posture.
                </p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-3 py-2 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRemediate}
                className="flex-1 px-3 py-2 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 active:scale-95 rounded-lg transition-all"
              >
                Apply Remediation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refreshing overlay */}
      {refreshing && (
        <div className="absolute inset-0 z-40 flex items-end justify-center pb-6 pointer-events-none">
          <div className="flex items-center gap-2 bg-blue-950/90 border border-blue-700 px-4 py-2 rounded-full shadow-xl backdrop-blur-sm">
            <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span className="text-[11px] font-semibold text-blue-300">Recalculating blast radius...</span>
          </div>
        </div>
      )}
      {/* Sidebar - wider + scrollable so all content is visible */}
      <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-[#0B1120] overflow-hidden">
        {/* Fixed top: Potential Impact stats */}
        <div className="p-4 border-b border-slate-800/60 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Potential Impact
            </h3>
            <button
              onClick={() => fetchGraph(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-all border border-slate-700 disabled:opacity-50"
              title="Force Refresh from Azure"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-[9px] font-bold uppercase">Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <div className="bg-slate-900/60 border border-slate-800 p-1.5 rounded-lg text-center overflow-hidden">
              <div className="text-[8px] text-slate-500 uppercase mb-0.5 truncate">Users</div>
              <div className="text-sm font-bold text-white truncate">{impact?.users ?? 0}</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-1.5 rounded-lg text-center overflow-hidden">
              <div className="text-[8px] text-slate-500 uppercase mb-0.5 truncate">Groups</div>
              <div className="text-sm font-bold text-white truncate">{impact?.groups ?? 0}</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-1.5 rounded-lg text-center overflow-hidden">
              <div className="text-[8px] text-slate-500 uppercase mb-0.5 truncate">Apps</div>
              <div className="text-sm font-bold text-white truncate">{impact?.apps ?? 0}</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-1.5 rounded-lg text-center overflow-hidden">
              <div className="text-[8px] text-slate-500 uppercase mb-0.5 truncate">Critical</div>
              <div className="text-sm font-bold text-red-400 truncate">{impact?.critical ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Scrollable bottom: Remediation */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-yellow-500" /> Remediation
          </h3>

          {!selectedNode ? (
            <div className="bg-slate-900/30 border border-dashed border-slate-700 p-4 rounded-lg text-center">
              <Info className="w-5 h-5 text-slate-600 mx-auto mb-2" />
              <p className="text-[11px] text-slate-500 leading-relaxed">Click any node in the graph to view its risk details and remediation options.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Node info card */}
              <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {remediatedNodes.has(selectedNode.id) && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <div className="text-[12px] font-bold text-blue-300 truncate" title={selectedNode.data.label}>
                      {selectedNode.data.label}
                    </div>
                  </div>
                  <div className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full uppercase font-bold ${(selectedNode.data.riskClass ?? 0) >= 4 ? 'bg-red-900/70 text-red-300' :
                      (selectedNode.data.riskClass ?? 0) >= 3 ? 'bg-orange-900/70 text-orange-300' :
                        (selectedNode.data.riskClass ?? 0) >= 2 ? 'bg-yellow-900/70 text-yellow-300' :
                          'bg-slate-800 text-slate-400'
                    }`}>
                    {['Safe', 'Low', 'Medium', 'High', 'Critical'][selectedNode.data.riskClass ?? 0] ?? 'Unknown'}
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
                  {selectedNode.data.nodeType || 'Unknown'}
                </div>
                {selectedNode.data.explanation && (
                  <div className="text-[10px] text-amber-300/80 italic leading-relaxed border-l-2 border-amber-600/40 pl-2 break-words">
                    {selectedNode.data.explanation}
                  </div>
                )}
              </div>

              {/* Remediation action cards */}
              <div className="flex flex-col gap-2">
                {getRemediationOptions(selectedNode).map((opt: any) => (
                  <div key={opt.id} className="bg-slate-900/60 border border-slate-700 rounded-lg overflow-hidden">
                    {/* Action header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-white">
                        {opt.icon}
                        {opt.label}
                      </div>
                      <button
                        onClick={() => requestRemediation(opt)}
                        disabled={remediating || remediatedNodes.has(selectedNode?.id)}
                        className="bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[9px] px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap"
                      >
                        {remediating ? '⏳' : remediatedNodes.has(selectedNode?.id) ? '✓ Done' : 'Apply'}
                      </button>
                    </div>
                    {/* Why / How / What — always visible */}
                    <div className="px-3 py-2 flex flex-col gap-2">
                      <div>
                        <div className="text-[8px] text-red-400 uppercase font-bold tracking-wider mb-0.5">⚠ Why?</div>
                        <p className="text-[10px] text-slate-300 leading-relaxed break-words">{opt.reason}</p>
                      </div>
                      <div>
                        <div className="text-[8px] text-emerald-400 uppercase font-bold tracking-wider mb-0.5">✓ How it helps</div>
                        <p className="text-[10px] text-slate-300 leading-relaxed break-words">{opt.benefit}</p>
                      </div>
                      <div>
                        <div className="text-[8px] text-amber-400 uppercase font-bold tracking-wider mb-0.5">→ What happens</div>
                        <p className="text-[10px] text-slate-300 leading-relaxed break-words">{opt.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {getRemediationOptions(selectedNode).length === 0 && (
                  <div className="text-center py-4 bg-slate-900/40 border border-slate-800 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 italic">No automated remediation for this node type.</p>
                    <p className="text-[9px] text-slate-600 mt-1">Review manually in Azure Entra ID.</p>
                  </div>
                )}
              </div>

              {/* Advanced Remediation Link for SPs */}
              {selectedNode && (selectedNode.data.nodeType === 'application' || selectedNode.data.nodeType === 'serviceprincipal') && (
                <div className="mt-2 p-3 bg-slate-900/60 border border-slate-700 rounded-lg text-center">
                  <a
                    href="/users/permissions"
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Advanced Permission Governance
                  </a>
                  <p className="text-[9px] text-slate-500 mt-1 italic leading-tight">
                    Manage owners and granular API scopes in the Permissions section.
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedNode(null)}
                className="text-[10px] text-slate-500 hover:text-slate-300 underline text-center transition-colors"
              >
                ✕ Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-slate-950 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium animate-pulse">Analyzing exposure paths...</p>
            </div>
          </div>
        )}

        <ReactFlow
          key={refreshKey}
          nodes={nodes.map(n => remediatedNodes.has(n.id)
            ? { ...n, style: { ...n.style, opacity: 0.45, filter: 'grayscale(60%)' } }
            : n
          )}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={(inst) => { flowInstance.current = inst; }}
          onNodeClick={handleNodeClick}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          nodesDraggable={!isLocked}
          nodesFocusable={!isLocked}
          style={{ background: '#0B1220' }}
          proOptions={{ hideAttribution: true }}
          className="bg-transparent"
        >
          <Background color="#1E293B" gap={20} size={1} />
          <Controls
            position="bottom-left"
            showInteractive={false}
            className="react-flow-custom-controls"
          >
            <ControlButton
              onClick={() => setIsLocked(prev => !prev)}
              title={isLocked ? 'Unlock nodes — drag to reposition' : 'Lock node positions'}
            >
              <span style={{ fontSize: '11px' }}>{isLocked ? '🔒' : '🔓'}</span>
            </ControlButton>
            <ControlButton
              onClick={() => exportGraphAsPng(nodes, `EIES-Blast-Radius-${nodeId}.png`)}
              title="Export as PNG"
            >
              <Download style={{ width: 12, height: 12, color: '#94a3b8' }} />
            </ControlButton>
          </Controls>
          <style>{`
            .react-flow-custom-controls {
              background: #0f172a !important;
              border: 1px solid #334155 !important;
              border-radius: 8px !important;
              overflow: hidden !important;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            }
            .react-flow-custom-controls button {
              background: #1e293b !important;
              border-bottom: 1px solid #334155 !important;
              fill: #94a3b8 !important;
              transition: all 0.2s !important;
            }
            .react-flow-custom-controls button:hover {
              background: #334155 !important;
              fill: #f8fafc !important;
            }
            .react-flow-custom-controls button:last-child {
              border-bottom: none !important;
            }
            .react-flow__controls-icon svg {
              fill: currentColor !important;
            }
          `}</style>
        </ReactFlow>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#0F172A]/90 border border-slate-700 p-1.5 rounded-full shadow-2xl backdrop-blur-md pointer-events-none z-10">
          <div className="px-3 py-1 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[9px] font-bold text-slate-300 uppercase">User</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <span className="text-[9px] font-bold text-slate-300 uppercase">Group</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[9px] font-bold text-slate-300 uppercase">Role</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[9px] font-bold text-slate-300 uppercase">Subscription</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-[9px] font-bold text-slate-300 uppercase">Tenant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}