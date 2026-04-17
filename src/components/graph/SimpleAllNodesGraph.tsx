// Frontend/src/components/graph/SimpleAllNodesGraph.tsx
import { useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Position,
  type ReactFlowInstance,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GraphNode {
  id: string;
  label: string;
  type: "user" | "group" | "tenant";
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

interface NormalisedEdge {
  source: string;
  target: string;
  rawType: string;
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

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const NODE_WIDTH    = 160;
const NODE_HEIGHT   = 50;
const TENANT_WIDTH  = 200;
const LEVEL_HEIGHT  = 200;
const TOP_PADDING   = 80;

function getGapForCount(count: number): number {
  if (count <= 2)  return 100;
  if (count <= 4)  return 140;
  if (count <= 8)  return 180;
  if (count <= 14) return 220;
  return 260;
}

// ---------------------------------------------------------------------------
// Styling
// ---------------------------------------------------------------------------

const getNodeStyle = (type: string) => {
  const base = {
    color: "white",
    border: "2px solid",
    padding: "10px 15px",
    textAlign: "center" as const,
    fontSize: "12px",
    fontWeight: "500",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
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
    default:
      return { ...base, width: NODE_WIDTH };
  }
};

const getNodeDimensions = (type: string): { width: number; height: number } => {
  if (type === "tenant") return { width: TENANT_WIDTH, height: NODE_HEIGHT };
  return { width: NODE_WIDTH, height: NODE_HEIGHT };
};

// ---------------------------------------------------------------------------
// Step 1 — Detect and normalise edge direction
// ---------------------------------------------------------------------------

function detectAndNormaliseEdges(rawEdges: GraphEdge[], rootId: string): GraphEdge[] {
  const tenantAsParent = rawEdges.filter((e) => e.to === rootId).length;
  const tenantAsChild  = rawEdges.filter((e) => e.from === rootId).length;
  if (tenantAsParent === 0 && tenantAsChild > 0) {
    console.warn("Edge direction inverted — swapping all edges.");
    return rawEdges.map((e) => ({ from: e.to, to: e.from, type: e.type }));
  }
  return rawEdges;
}

// ---------------------------------------------------------------------------
// Step 2 — Build edges with multiple parents
// ---------------------------------------------------------------------------

function buildMultiParentEdges(normalisedRaw: GraphEdge[]): {
  edges: NormalisedEdge[];
  parentOf: Map<string, string[]>;
  childrenOf: Map<string, string[]>;
} {
  const parentOf   = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();
  const edges: NormalisedEdge[] = [];

  for (const e of normalisedRaw) {
    const parent = e.to;
    const child  = e.from;
    if (!parentOf.has(child)) parentOf.set(child, []);
    parentOf.get(child)!.push(parent);
    if (!childrenOf.has(parent)) childrenOf.set(parent, []);
    childrenOf.get(parent)!.push(child);
    edges.push({ source: parent, target: child, rawType: e.type });
  }
  return { edges, parentOf, childrenOf };
}

// ---------------------------------------------------------------------------
// Step 3 — Depth calculation (max over all parents)
// ---------------------------------------------------------------------------

function computeDepths(rootId: string, parentOf: Map<string, string[]>): Map<string, number> {
  const depth = new Map<string, number>();
  const queue: string[] = [rootId];
  depth.set(rootId, 0);
  while (queue.length) {
    const cur = queue.shift()!;
    const curDepth = depth.get(cur)!;
    const children = Array.from(parentOf.entries())
      .filter(([_, parents]) => parents.includes(cur))
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

// ---------------------------------------------------------------------------
// Step 4 — Orphan adoption
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Step 5 — Compute subtree depth and size (for all nodes, including tenant)
// ---------------------------------------------------------------------------

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
    let totalSize = 1; // self
    for (const child of kids) {
      const childMetrics = dfs(child);
      maxDepth = Math.max(maxDepth, childMetrics.depth + 1);
      totalSize += childMetrics.size;
    }
    memoDepth.set(node, maxDepth);
    memoSize.set(node, totalSize);
    return { depth: maxDepth, size: totalSize };
  }

  // Start from all nodes to ensure everyone is computed
  for (const node of childrenOf.keys()) dfs(node);
  // Also handle nodes that are leaves but may not be keys in childrenOf
  // (they are already covered because leaves have empty children list)

  return { subtreeDepth: memoDepth, subtreeSize: memoSize };
}

// ---------------------------------------------------------------------------
// Step 6 — Center‑priority ordering for Level‑1 children (largest subtree in middle)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Step 7 — Master hierarchy builder
// ---------------------------------------------------------------------------

function buildHierarchy(nodes: GraphNode[], rawEdges: GraphEdge[]): HierarchyResult {
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

  const normalisedRaw = detectAndNormaliseEdges(rawEdges, rootId);
  const { edges, parentOf, childrenOf } = buildMultiParentEdges(normalisedRaw);
  let depth = computeDepths(rootId, parentOf);
  const syntheticEdges = adoptOrphans(new Set(nodes.map(n => n.id)), rootId, parentOf, childrenOf, edges);
  depth = computeDepths(rootId, parentOf);
  const { subtreeDepth, subtreeSize } = computeSubtreeMetrics(childrenOf);

  // Order level‑1 children by subtree size (largest in middle)
  const lvl1 = childrenOf.get(rootId) ?? [];
  const centered = centerBySubtreeSize(lvl1, subtreeSize);
  console.log("Level-1 centered order (by subtree size):", centered.map(id => nodes.find(n => n.id === id)?.label));
  childrenOf.set(rootId, centered);

  console.log(
    `Hierarchy: ${depth.size}/${nodes.length} nodes, max depth ${Math.max(0, ...depth.values())}, ` +
    `${syntheticEdges.size} synthetic edges.`
  );
  return { edges, depth, syntheticEdges, childrenOf, parentOf, subtreeDepth, subtreeSize };
}

// ---------------------------------------------------------------------------
// Step 8 — Positioning for DAG (preserving centered order for level‑1)
// ---------------------------------------------------------------------------

function computePositions(
  nodes: Node[],
  depthMap: Map<string, number>,
  childrenOf: Map<string, string[]>,
  parentOf: Map<string, string[]>,
  rootId: string                    // NEW: tenant ID to get correct order
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const byLevel = new Map<number, string[]>();
  for (const node of nodes) {
    const lvl = depthMap.get(node.id) ?? 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(node.id);
  }
  const maxLevel = Math.max(0, ...byLevel.keys());

  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    let ids = byLevel.get(lvl) ?? [];
    if (ids.length === 0) continue;
    const y = TOP_PADDING + lvl * LEVEL_HEIGHT;

    if (lvl === 0) {
      positions.set(ids[0], { x: 0, y });
      continue;
    }

    // For level 1, enforce the order from childrenOf (which was centered)
    if (lvl === 1 && rootId) {
      const orderedLevel1 = childrenOf.get(rootId) ?? [];
      // Keep only those that are actually in this level (should be all)
      ids = orderedLevel1.filter(id => ids.includes(id));
      console.log("Level-1 positioning order:", ids.map(id => nodes.find(n => n.id === id)?.data?.label));
    } else {
      // For deeper levels, sort by average parent X
      let allParentsSameX = true;
      let firstParentX: number | null = null;
      for (const id of ids) {
        const parents = parentOf.get(id) ?? [];
        for (const p of parents) {
          const px = positions.get(p)?.x ?? 0;
          if (firstParentX === null) firstParentX = px;
          if (px !== firstParentX) {
            allParentsSameX = false;
            break;
          }
        }
        if (!allParentsSameX) break;
      }

      if (!allParentsSameX) {
        ids.sort((a, b) => {
          const parentsA = parentOf.get(a) ?? [];
          const parentsB = parentOf.get(b) ?? [];
          const avgXa = parentsA.length ? parentsA.reduce((s, p) => s + (positions.get(p)?.x ?? 0), 0) / parentsA.length : 0;
          const avgXb = parentsB.length ? parentsB.reduce((s, p) => s + (positions.get(p)?.x ?? 0), 0) / parentsB.length : 0;
          return avgXa - avgXb;
        });
      }
    }

    const gap = getGapForCount(ids.length);
    const totalWidth = (ids.length - 1) * gap;
    const startX = -(totalWidth / 2);
    ids.forEach((id, i) => {
      positions.set(id, { x: startX + i * gap, y });
    });
  }
  return positions;
}

// ---------------------------------------------------------------------------
// Step 9 — Assemble layouted React Flow nodes and edges
// ---------------------------------------------------------------------------

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  normEdges: NormalisedEdge[],
  depthMap: Map<string, number>,
  childrenOf: Map<string, string[]>,
  parentOf: Map<string, string[]>,
  subtreeDepth: Map<string, number>,
  syntheticEdges: Set<string>,
  tenantId: string
): { nodes: Node[]; edges: Edge[] } {
  const positions = computePositions(nodes, depthMap, childrenOf, parentOf, tenantId);
  const layoutedNodes: Node[] = nodes.map(node => {
    const pos = positions.get(node.id) ?? { x: 0, y: 0 };
    const { width } = getNodeDimensions(node.data?.type ?? "user");
    return {
      ...node,
      position: { x: pos.x - width / 2, y: pos.y },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });

  // Debug subtreeDepth values for groups
  console.log("Subtree depths:",
    Array.from(subtreeDepth.entries()).map(([id, d]) => {
      const node = nodes.find(n => n.id === id);
      return `${node?.data?.label ?? id}: ${d}`;
    })
  );

  const enhancedEdges = edges.map(edge => {
    const isSynthetic = syntheticEdges.has(`${edge.source}->${edge.target}`);
    const targetDepth = subtreeDepth.get(edge.target) ?? 0;
    const isDeepSubtree = edge.source === tenantId && targetDepth >= 2;

    if (edge.source === tenantId) {
      console.log(`Edge ${edge.source} → ${edge.target} (depth=${targetDepth}) -> deep? ${isDeepSubtree}`);
    }

    const strokeColor = isSynthetic ? "#F59E0B" : isDeepSubtree ? "#FF8C00" : "#3B82F6";
    const strokeWidth = isSynthetic ? 1.5 : isDeepSubtree ? 2.5 : 2;
    return {
      ...edge,
      style: {
        stroke: strokeColor,
        strokeWidth,
        strokeDasharray: isSynthetic ? "4 4" : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
      },
    };
  });

  return { nodes: layoutedNodes, edges: enhancedEdges };
}

// ---------------------------------------------------------------------------
// Viewport calculation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SimpleAllNodesGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 0.8 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/entra/graph-full`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { nodes: GraphNode[]; edges: GraphEdge[] } = await res.json();
        console.log("Raw API data:", data);

        const hierarchy = buildHierarchy(data.nodes, data.edges);
        const { edges: normEdges, depth, syntheticEdges, childrenOf, parentOf, subtreeDepth, subtreeSize } = hierarchy;

        const tenantId = data.nodes.find(n => n.type === "tenant")?.id ?? "default-directory";

        const flowNodes: Node[] = data.nodes.map(node => ({
          id: node.id,
          type: "default",
          data: { label: node.label, type: node.type },
          position: { x: 0, y: 0 },
          style: getNodeStyle(node.type),
        }));

        let counter = 0;
        const flowEdges: Edge[] = normEdges.map(e => ({
          id: `e${++counter}-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          animated: !syntheticEdges.has(`${e.source}->${e.target}`),
        }));

        const { nodes: ln, edges: le } = getLayoutedElements(
          flowNodes,
          flowEdges,
          normEdges,
          depth,
          childrenOf,
          parentOf,
          subtreeDepth,
          syntheticEdges,
          tenantId
        );

        const cw = containerRef.current?.clientWidth ?? window.innerWidth;
        const ch = containerRef.current?.clientHeight ?? window.innerHeight;
        setViewport(deriveViewport(ln, cw, ch));
        setNodes(ln);
        setEdges(le);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  useEffect(() => {
    if (nodes.length > 0 && rfInstance.current) {
      setTimeout(() => rfInstance.current?.fitView({ padding: 0.1, duration: 400 }), 50);
    }
  }, [nodes]);

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
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={viewport}
        onInit={instance => {
          rfInstance.current = instance;
          setTimeout(() => instance.fitView({ padding: 0.1, duration: 400 }), 50);
        }}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={1.5}
        style={{ background: "#0B1220", height: "100%", width: "100%" }}
      >
        <Background color="#1E293B" gap={16} />
        <Controls style={{ background: "#1E293B", color: "white", border: "1px solid #334155" }} />
      </ReactFlow>
    </div>
  );
}