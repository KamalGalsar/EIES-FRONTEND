// Frontend/src/components/graph/DynamicGraph.tsx
import { useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  ControlButton,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type ReactFlowInstance,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Download, Search, X, Lock, Unlock } from "lucide-react";
import { exportGraphAsPng } from "../../utils/graphExport";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

interface GraphNode {
  id: string;
  label: string;
  type: "user" | "group" | "tenant" | "azureRole" | "subscription" | "resourceGroup" | "crossTenant" | string;
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
  label?: string;
  affected?: boolean;
}

interface NormalisedEdge {
  source: string;
  target: string;
  rawType: string;
  label?: string;
  affected?: boolean;
}

interface HierarchyResult {
  edges: NormalisedEdge[];
  depth: Map<string, number>;
  syntheticEdges: Set<string>;
  childrenOf: Map<string, string[]>;
  parentOf: Map<string, string[]>;
  subtreeDepth: Map<string, number>;
  subtreeSize: Map<string, number>;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 50;
const TENANT_WIDTH = 200;
const SUBSCRIPTION_WIDTH = 200;
const LEVEL_HEIGHT = 220; 
const TOP_PADDING = 80;


const nodeTypes = {};
const edgeTypes = {};

const getNodeStyle = (type: string) => {
  const base = {
    color: "white",
    border: "2px solid",
    padding: "10px 15px",
    textAlign: "center" as const,
    fontSize: "11px",
    fontWeight: "700",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40px',
    width: 'max-content',
    minWidth: '160px',
    whiteSpace: 'nowrap'
  };
  switch (type) {
    case "tenant":
      return {
        ...base,
        background: "#5B21B6",
        borderColor: "#8B5CF6",
        width: TENANT_WIDTH,
        fontSize: "14px",
        fontWeight: "bold",
        borderRadius: "8px",
      };
    case "group":
      return {
        ...base,
        background: "#0E7490",
        borderColor: "#06B6D4",
        width: NODE_WIDTH,
        borderRadius: "8px",
      };
    case "user":
      return {
        ...base,
        background: "#1E3A8A",
        borderColor: "#3B82F6",
        width: NODE_WIDTH,
        borderRadius: "20px",
      };
    case "azureRole":
      return {
        ...base,
        background: "#B45309",
        borderColor: "#F59E0B",
        width: NODE_WIDTH,
        borderRadius: "8px",
      };
    case "subscription":
      return {
        ...base,
        background: "#047857",
        borderColor: "#10B981",
        width: SUBSCRIPTION_WIDTH,
        borderRadius: "4px",
        fontSize: "13px",
      };
    case "resourceGroup":
      return {
        ...base,
        background: "#6D28D9",
        borderColor: "#A78BFA",
        width: NODE_WIDTH,
        borderRadius: "6px",
      };
    case "crossTenant":
      return {
        ...base,
        background: "#991B1B",
        borderColor: "#F87171",
        width: NODE_WIDTH,
        borderRadius: "4px",
        fontSize: "11px",
      };
    default:
      return { ...base, width: 'max-content', minWidth: NODE_WIDTH, background: "#374151", borderColor: "#6B7280" };
  }
};

const getNodeDimensions = (label: string, type: string): { width: number; height: number } => {
  const charWidth = 8; 
  const padding = 40;
  const estimatedWidth = Math.max(type === 'tenant' ? TENANT_WIDTH : NODE_WIDTH, (label?.length || 0) * charWidth + padding);

  if (type === "tenant") return { width: Math.max(TENANT_WIDTH, estimatedWidth), height: NODE_HEIGHT };
  if (type === "subscription") return { width: Math.max(SUBSCRIPTION_WIDTH, estimatedWidth), height: NODE_HEIGHT };
  if (type === "resourceGroup") return { width: Math.max(140, estimatedWidth), height: 44 };
  if (type === "crossTenant") return { width: Math.max(140, estimatedWidth), height: 40 };
  return { width: estimatedWidth, height: NODE_HEIGHT };
};

// Step 1 — Detect and normalise edge direction

function detectAndNormaliseEdges(rawEdges: GraphEdge[]): GraphEdge[] {
  return rawEdges.map(e => ({
    ...e,
    from: e.to,
    to: e.from,
  }));
}

// Step 2 — Build edges with multiple parents

function buildMultiParentEdges(normalisedRaw: GraphEdge[]): {
  edges: NormalisedEdge[];
  parentOf: Map<string, string[]>;
  childrenOf: Map<string, string[]>;
} {
  const parentOf = new Map<string, string[]>();   // child -> parents
  const childrenOf = new Map<string, string[]>(); // parent -> children
  const edges: NormalisedEdge[] = [];

  for (const e of normalisedRaw) {
    const source = e.from; // now a parent (group/tenant)
    const target = e.to;   // now a child (member)

    // parentOf: for a child, list its parents
    if (!parentOf.has(target)) parentOf.set(target, []);
    parentOf.get(target)!.push(source);

    // childrenOf: for a parent, list its children
    if (!childrenOf.has(source)) childrenOf.set(source, []);
    childrenOf.get(source)!.push(target);

    edges.push({ source, target, rawType: e.type, label: e.label, affected: e.affected });
  }
  return { edges, parentOf, childrenOf };
}

// Step 3 — Depth calculation (max over all parents)

function computeDepths(rootId: string, parentOf: Map<string, string[]>): Map<string, number> {
  const depth = new Map<string, number>();
  const queue: string[] = [rootId];
  depth.set(rootId, 0);
  while (queue.length) {
    const cur = queue.shift()!;
    const curDepth = depth.get(cur)!;
    const children = Array.from(parentOf.entries())
      .filter(([, parents]) => parents.includes(cur))
      .map(([child]) => child);
    for (const child of children) {
      const newDepth = curDepth + 1;
      if (!depth.has(child) || depth.get(child)! < newDepth) {
        depth.set(child, newDepth);
        queue.push(child);
      }
    }
  }
  return depth;
}

// Step 4 — Orphan adoption

function adoptOrphans(
  allNodeIds: Set<string>,
  rootId: string,
  parentOf: Map<string, string[]>,
  childrenOf: Map<string, string[]>,
  edges: NormalisedEdge[]
): Set<string> {
  const syntheticEdges = new Set<string>();
  const reachable = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const node = stack.pop()!;
    if (reachable.has(node)) continue;
    reachable.add(node);
    const children = childrenOf.get(node) ?? [];
    stack.push(...children);
  }
  for (const nodeId of allNodeIds) {
    if (reachable.has(nodeId) || nodeId === rootId) continue;
    console.warn(`Orphan "${nodeId}" — attaching to tenant.`);
    edges.push({ source: rootId, target: nodeId, rawType: "synthetic" });
    if (!parentOf.has(nodeId)) parentOf.set(nodeId, []);
    parentOf.get(nodeId)!.push(rootId);
    if (!childrenOf.has(rootId)) childrenOf.set(rootId, []);
    childrenOf.get(rootId)!.push(nodeId);
    syntheticEdges.add(`${rootId}->${nodeId}`);
  }
  return syntheticEdges;
}

// Step 5 — Compute subtree depth and size (for all nodes)

function computeSubtreeMetrics(childrenOf: Map<string, string[]>): {
  subtreeDepth: Map<string, number>;
  subtreeSize: Map<string, number>;
} {
  const memoDepth = new Map<string, number>();
  const memoSize = new Map<string, number>();

  function dfs(node: string): { depth: number; size: number } {
    if (memoDepth.has(node) && memoSize.has(node)) {
      return { depth: memoDepth.get(node)!, size: memoSize.get(node)! };
    }
    const kids = childrenOf.get(node) ?? [];
    if (kids.length === 0) {
      memoDepth.set(node, 0);
      memoSize.set(node, 1);
      return { depth: 0, size: 1 };
    }
    let maxDepth = 0;
    let totalSize = 1; 
    for (const child of kids) {
      const childMetrics = dfs(child);
      maxDepth = Math.max(maxDepth, childMetrics.depth + 1);
      totalSize += childMetrics.size;
    }
    memoDepth.set(node, maxDepth);
    memoSize.set(node, totalSize);
    return { depth: maxDepth, size: totalSize };
  }

  for (const node of childrenOf.keys()) dfs(node);
  return { subtreeDepth: memoDepth, subtreeSize: memoSize };
}

// Step 6 — Center‑priority ordering for Level‑1 children

function centerBySubtreeSize(children: string[], subtreeSize: Map<string, number>): string[] {
  if (children.length <= 1) return children;

  const withSize = children
    .map(id => ({ id, size: subtreeSize.get(id) ?? 1 }))
    .sort((a, b) => b.size - a.size);

  const result = new Array<string | null>(children.length).fill(null);
  const mid = Math.floor(children.length / 2);

  withSize.forEach(({ id }, i) => {
    if (i === 0) {
      result[mid] = id;
      return;
    }
    const offset = Math.ceil(i / 2);
    const direction = i % 2 === 0 ? -1 : 1;
    let idx = mid + direction * offset;
    idx = Math.max(0, Math.min(result.length - 1, idx));
    if (result[idx] === null) {
      result[idx] = id;
    } else {
      const free = result.findIndex(v => v === null);
      if (free !== -1) result[free] = id;
    }
  });

  return result.filter(Boolean) as string[];
}

// Step 7 — Master hierarchy builder

function buildHierarchy(nodes: GraphNode[], rawEdges: GraphEdge[], createSyntheticEdges = true): HierarchyResult {
  const tenantNode = nodes.find(n => n.type === "tenant");
  if (!tenantNode) {
    console.error("No tenant node found.");
    return {
      edges: [],
      depth: new Map(),
      syntheticEdges: new Set(),
      childrenOf: new Map(),
      parentOf: new Map(),
      subtreeDepth: new Map(),
      subtreeSize: new Map(),
    };
  }
  const rootId = tenantNode.id;
  const normalisedRaw = detectAndNormaliseEdges(rawEdges);
  const { edges, parentOf, childrenOf } = buildMultiParentEdges(normalisedRaw);
  let depth = computeDepths(rootId, parentOf);
  const syntheticEdges = createSyntheticEdges
    ? adoptOrphans(new Set(nodes.map(n => n.id)), rootId, parentOf, childrenOf, edges)
    : new Set<string>();
  if (createSyntheticEdges) {
    depth = computeDepths(rootId, parentOf);
  }
  const { subtreeDepth, subtreeSize } = computeSubtreeMetrics(childrenOf);

  const lvl1 = childrenOf.get(rootId) ?? [];
  const centered = centerBySubtreeSize(lvl1, subtreeSize);
  childrenOf.set(rootId, centered);

  return { edges, depth, syntheticEdges, childrenOf, parentOf, subtreeDepth, subtreeSize };
}

// Step 8 — Positioning for DAG

function computePositions(
  nodes: Node[],
  depthMap: Map<string, number>,
  childrenOf: Map<string, string[]>,
  parentOf: Map<string, string[]>,
  rootId: string
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const byLevel = new Map<number, string[]>();
  for (const node of nodes) {
    const lvl = depthMap.get(node.id) ?? 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(node.id);
  }
  const maxLevel = Math.max(0, ...byLevel.keys());

  // First pass: Calculate required level widths based on dynamic node sizes
  const levelNodeWidths = new Map<number, Map<string, number>>();
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const ids = byLevel.get(lvl) ?? [];
    const nodeWidthMap = new Map<string, number>();
    ids.forEach(id => {
      const node = nodes.find(n => n.id === id);
      const { width } = getNodeDimensions(node?.data?.label, node?.data?.type);
      nodeWidthMap.set(id, width);
    });
    levelNodeWidths.set(lvl, nodeWidthMap);
  }

  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    let ids = byLevel.get(lvl) ?? [];
    if (ids.length === 0) continue;
    const y = TOP_PADDING + lvl * LEVEL_HEIGHT;

    if (lvl === 0) {
      positions.set(ids[0], { x: 0, y });
      continue;
    }

    // Sort nodes to minimize edge crossing
    if (lvl === 1 && rootId) {
      const orderedLevel1 = childrenOf.get(rootId) ?? [];
      ids = orderedLevel1.filter(id => ids.includes(id));
    } else {
      ids.sort((a, b) => {
        const parentsA = parentOf.get(a) ?? [];
        const parentsB = parentOf.get(b) ?? [];
        const avgXa = parentsA.length ? parentsA.reduce((s, p) => s + (positions.get(p)?.x ?? 0), 0) / parentsA.length : 0;
        const avgXb = parentsB.length ? parentsB.reduce((s, p) => s + (positions.get(p)?.x ?? 0), 0) / parentsB.length : 0;
        return avgXa - avgXb;
      });
    }

    const nodeWidths = levelNodeWidths.get(lvl)!;
    const hGap = 60; // minimum buffer between nodes

    const levelWidths = ids.map(id => nodeWidths.get(id) || NODE_WIDTH);
    const totalLevelWidth = levelWidths.reduce((a, b) => a + b, 0) + (ids.length - 1) * hGap;

    let startX = -(totalLevelWidth / 2);
    ids.forEach((id) => {
      const w = nodeWidths.get(id) || NODE_WIDTH;
      const x = startX + (w / 2);
      positions.set(id, { x, y });
      startX += w + hGap;
    });
  }
  return positions;
}

// Step 9 — Assemble layouted React Flow nodes and edges

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  normEdges: NormalisedEdge[],
  depthMap: Map<string, number>,
  childrenOf: Map<string, string[]>,
  parentOf: Map<string, string[]>,
  tenantId: string
): { nodes: Node[]; edges: Edge[] } {
  const positions = computePositions(nodes, depthMap, childrenOf, parentOf, tenantId);
  const layoutedNodes: Node[] = nodes.map(node => {
    const pos = positions.get(node.id) ?? { x: 0, y: 0 };
    const { width } = getNodeDimensions(node.data?.label, node.data?.type);
    return {
      ...node,
      position: { x: pos.x - width / 2, y: pos.y },
      style: {
        ...node.style,
        width: 'max-content'
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });

  const enhancedEdges = edges.map((edge, i) => {
    const n = normEdges[i];
    return {
      ...edge,
      style: { stroke: n?.affected ? "#EF4444" : "#3B82F6", strokeWidth: 2.5 },
      label: edge.label || "Member Of",
      labelStyle: { fill: "#00f2ff", fontSize: "14px", fontWeight: 800 },
      labelShowBg: true,
      labelBgStyle: { fill: "#000000", fillOpacity: 1, rx: 4 },
      labelBgPadding: [6, 4] as [number, number],
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: n?.affected ? "#EF4444" : "#3B82F6",
      },
    };
  });

  return { nodes: layoutedNodes, edges: enhancedEdges };
}

// Viewport calculation

function deriveViewport(
  nodes: Node[],
  containerWidth: number,
  containerHeight: number
): { x: number; y: number; zoom: number } {
  if (nodes.length === 0) return { x: 0, y: 0, zoom: 0.8 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const w = (n.style?.width as number) ?? NODE_WIDTH;
    const h = (n.style?.height as number) ?? NODE_HEIGHT;
    minX = Math.min(minX, n.position.x);
    maxX = Math.max(maxX, n.position.x + w);
    minY = Math.min(minY, n.position.y);
    maxY = Math.max(maxY, n.position.y + h);
  }
  const graphW = maxX - minX;
  const graphH = maxY - minY;
  const padding = 40;
  const zoomX = (containerWidth - padding * 2) / graphW;
  const zoomY = (containerHeight - padding * 2) / graphH;
  const zoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.15), 1.5);
  const cx = containerWidth / 2 - (minX + graphW / 2) * zoom;
  const cy = containerHeight / 2 - (minY + graphH / 2) * zoom;
  return { x: cx, y: cy, zoom };
}

// Component

export default function DynamicGraph() {
  return (
    <ReactFlowProvider>
      <DynamicGraphContent />
    </ReactFlowProvider>
  );
}

function DynamicGraphContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 0.8 });
  const [isLocked, setIsLocked] = useState(true); // true = nodes locked (cannot be dragged)

  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());

  const { setCenter, fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  // Pathfinding logic
  const findPathToRoot = (startNodeId: string) => {
    const pathNodes = new Set<string>([startNodeId]);
    const pathEdges = new Set<string>();
    const queue = [startNodeId];
    const visited = new Set<string>([startNodeId]);

    // Simple BFS to find all ancestors
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      // Find all edges where this node is the target (to go up)
      edges.forEach(edge => {
        if (edge.target === currentId && !visited.has(edge.source)) {
          visited.add(edge.source);
          pathNodes.add(edge.source);
          pathEdges.add(edge.id);
          queue.push(edge.source);
        }
      });
    }

    setHighlightedNodes(pathNodes);
    setHighlightedEdges(pathEdges);

    // Zoom to the searched node
    const searchedNode = nodes.find(n => n.id === startNodeId);
    if (searchedNode) {
      setCenter(searchedNode.position.x + 80, searchedNode.position.y + 25, { zoom: 1.2, duration: 800 });
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setHighlightedNodes(new Set());
    setHighlightedEdges(new Set());
    fitView({ duration: 800 });
  };

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/entra/graph-full`, {
          headers: {
            'Authorization': `Bearer ${token || ""}`
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { nodes: GraphNode[]; edges: GraphEdge[] } = await res.json();

        // Filter to only users, groups, and tenant as requested
        const filteredNodes = data.nodes.filter(n => ["user", "group", "tenant"].includes(n.type));
        const nodeIds = new Set(filteredNodes.map(n => n.id));

        // Show only direct membership and role relationships
        const filteredEdges = data.edges.filter(e =>
          nodeIds.has(e.from) && nodeIds.has(e.to) &&
          ["memberOf", "hasRole"].includes(e.type)
        );

        const hierarchy = buildHierarchy(filteredNodes, filteredEdges, false);
        const { edges: normEdges, depth, childrenOf, parentOf, subtreeDepth } = hierarchy;

        const tenantId = filteredNodes.find(n => n.type === "tenant")?.id ?? "default-directory";

        const flowNodes: Node[] = filteredNodes.map(node => ({
          id: node.id,
          type: "default",
          data: { label: node.label, type: node.type },
          position: { x: 0, y: 0 },
          style: getNodeStyle(node.type),
          title: node.label, 
        }));

        const flowEdges: Edge[] = normEdges.map((e, i) => ({
          id: `e${i}-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: false,
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          flowNodes,
          flowEdges,
          normEdges,
          depth,
          childrenOf,
          parentOf,
          tenantId
        );

        const cw = containerRef.current?.clientWidth ?? window.innerWidth;
        const ch = containerRef.current?.clientHeight ?? window.innerHeight;
        setViewport(deriveViewport(layoutedNodes, cw, ch));
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0B1220] rounded-lg">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p>Building hierarchical graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0B1220] rounded-lg">
        <div className="text-white text-center max-w-md p-6 bg-red-900/20 rounded-lg border border-red-500">
          <p className="text-red-400 mb-4">Error loading graph</p>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Search Bar UI */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2.5 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-2xl"
            placeholder="Search users or groups to trace exposure..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const found = nodes.find(n =>
                  (n.data as any).label.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (found) findPathToRoot(found.id);
              }
            }}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Suggestions Dropdown */}
          {searchTerm && !highlightedNodes.size && (
            <div className="absolute mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {nodes
                .filter(n => (n.data as any).label.toLowerCase().includes(searchTerm.toLowerCase()))
                .slice(0, 5)
                .map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setSearchTerm((n.data as any).label);
                      findPathToRoot(n.id);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-blue-600/20 hover:text-white flex items-center gap-3 transition-colors border-b border-gray-800 last:border-0"
                  >
                    <div className={`w-2 h-2 rounded-full ${n.type === 'user' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                    {(n.data as any).label}
                    <span className="text-[10px] text-gray-500 ml-auto uppercase tracking-wider">{n.type}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <ReactFlow
        nodes={nodes.map(n => {
          if (highlightedNodes.size === 0) return n;
          const isHighlighted = highlightedNodes.has(n.id);
          return {
            ...n,
            style: {
              ...n.style,
              opacity: isHighlighted ? 1 : 0.15,
              filter: isHighlighted ? 'none' : 'grayscale(100%)',
              border: isHighlighted ? '2px solid #F97316' : n.style?.border,
              boxShadow: isHighlighted ? '0 0 20px rgba(249, 115, 22, 0.4)' : n.style?.boxShadow,
              transition: 'all 0.5s ease-in-out'
            }
          };
        })}
        edges={edges.map(e => {
          if (highlightedEdges.size === 0) return e;
          const isHighlighted = highlightedEdges.has(e.id);
          return {
            ...e,
            animated: isHighlighted,
            style: {
              ...e.style,
              stroke: isHighlighted ? '#F97316' : '#334155',
              strokeWidth: isHighlighted ? 3 : 1,
              opacity: isHighlighted ? 1 : 0.1,
              transition: 'all 0.5s ease-in-out'
            }
          };
        })}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={instance => {
          rfInstance.current = instance;
          setTimeout(() => instance.fitView({ padding: 0.1, duration: 400 }), 50);
        }}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={1.5}
        nodesDraggable={!isLocked}
        nodesFocusable={!isLocked}
        style={{ background: "#0B1220", height: "100%", width: "100%" }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E293B" gap={16} />
        <Controls
          style={{ background: "#1E293B", color: "white", border: "1px solid #334155" }}
          showInteractive={false}
        >
          <ControlButton
            onClick={() => setIsLocked(prev => !prev)}
            title={isLocked ? 'Unlock nodes — drag to reposition' : 'Lock node positions'}
          >
            {isLocked ? <Lock style={{ width: 14, height: 14, color: '#94a3b8' }} /> : <Unlock style={{ width: 14, height: 14, color: '#94a3b8' }} />}
          </ControlButton>
          <ControlButton
            onClick={() => exportGraphAsPng(nodes, 'EIES-Risk-Overview.png')}
            title="Export as PNG"
          >
            <Download style={{ width: 12, height: 12, color: '#94a3b8' }} />
          </ControlButton>
        </Controls>
      </ReactFlow>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#0F172A]/90 border border-slate-700 p-1.5 rounded-full shadow-2xl backdrop-blur-md z-10 pointer-events-none">
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
  );
}