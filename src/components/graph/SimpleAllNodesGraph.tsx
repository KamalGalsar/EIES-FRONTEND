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
}

// ---------------------------------------------------------------------------
// Layout constants — adjust these to taste
// ---------------------------------------------------------------------------

const NODE_WIDTH    = 160;
const NODE_HEIGHT   = 50;
const TENANT_WIDTH  = 200;
const LEVEL_HEIGHT  = 200;   // vertical gap between levels
const TOP_PADDING   = 80;    // y offset for root node

// Horizontal gap between siblings — grows with crowd
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

function detectAndNormaliseEdges(
  rawEdges: GraphEdge[],
  rootId: string
): GraphEdge[] {
  const tenantAsParent = rawEdges.filter((e) => e.to === rootId).length;
  const tenantAsChild  = rawEdges.filter((e) => e.from === rootId).length;
  if (tenantAsParent === 0 && tenantAsChild > 0) {
    console.warn("Edge direction inverted — swapping all edges.");
    return rawEdges.map((e) => ({ from: e.to, to: e.from, type: e.type }));
  }
  return rawEdges;
}

// ---------------------------------------------------------------------------
// Step 2 — Single-parent deduplication
// ---------------------------------------------------------------------------

function buildSingleParentEdges(normalisedRaw: GraphEdge[]): {
  edges: NormalisedEdge[];
  parentOf: Map<string, string>;
  childrenOf: Map<string, string[]>;
} {
  const parentOf   = new Map<string, string>();
  const childrenOf = new Map<string, string[]>();
  const edges: NormalisedEdge[] = [];

  for (const e of normalisedRaw) {
    const parent = e.to;
    const child  = e.from;
    if (parentOf.has(child)) {
      console.warn(
        `Duplicate parent for "${child}": already "${parentOf.get(child)}", ` +
        `ignoring "${parent}".`
      );
      continue;
    }
    parentOf.set(child, parent);
    if (!childrenOf.has(parent)) childrenOf.set(parent, []);
    childrenOf.get(parent)!.push(child);
    edges.push({ source: parent, target: child, rawType: e.type });
  }

  return { edges, parentOf, childrenOf };
}

// ---------------------------------------------------------------------------
// Step 3 — BFS depths + cycle guard
// ---------------------------------------------------------------------------

function bfsDepths(
  rootId: string,
  childrenOf: Map<string, string[]>
): { depth: Map<string, number>; visited: Set<string> } {
  const depth   = new Map<string, number>();
  const visited = new Set<string>();
  const queue   = [rootId];
  depth.set(rootId, 0);
  visited.add(rootId);

  while (queue.length > 0) {
    const current      = queue.shift()!;
    const currentDepth = depth.get(current)!;
    for (const child of childrenOf.get(current) ?? []) {
      if (visited.has(child)) {
        console.warn(`Cycle: ${current} -> ${child} skipped.`);
        continue;
      }
      visited.add(child);
      depth.set(child, currentDepth + 1);
      queue.push(child);
    }
  }

  return { depth, visited };
}

// ---------------------------------------------------------------------------
// Step 4 — Orphan adoption (only truly parentless nodes)
// ---------------------------------------------------------------------------

function adoptOrphans(
  allNodeIds: Set<string>,
  rootId: string,
  parentOf: Map<string, string>,
  childrenOf: Map<string, string[]>,
  edges: NormalisedEdge[],
  depth: Map<string, number>,
  visited: Set<string>
): Set<string> {
  const syntheticEdges = new Set<string>();

  for (const nodeId of allNodeIds) {
    if (visited.has(nodeId) || nodeId === rootId) continue;
    if (parentOf.has(nodeId)) continue; // has a parent — skip

    console.warn(`Orphan "${nodeId}" — attaching to tenant.`);
    edges.push({ source: rootId, target: nodeId, rawType: "synthetic" });
    parentOf.set(nodeId, rootId);
    if (!childrenOf.has(rootId)) childrenOf.set(rootId, []);
    childrenOf.get(rootId)!.push(nodeId);
    depth.set(nodeId, 1);
    visited.add(nodeId);
    syntheticEdges.add(`${rootId}->${nodeId}`);

    // BFS subtree of newly adopted node
    const sub = [nodeId];
    while (sub.length > 0) {
      const cur  = sub.shift()!;
      const curD = depth.get(cur)!;
      for (const child of childrenOf.get(cur) ?? []) {
        if (!visited.has(child)) {
          visited.add(child);
          depth.set(child, curD + 1);
          sub.push(child);
        }
      }
    }
  }

  return syntheticEdges;
}

// ---------------------------------------------------------------------------
// Step 5 — Subtree max-depth (memoised)
// ---------------------------------------------------------------------------

function computeSubtreeDepth(
  nodeId: string,
  childrenOf: Map<string, string[]>,
  memo = new Map<string, number>()
): number {
  if (memo.has(nodeId)) return memo.get(nodeId)!;
  const children = childrenOf.get(nodeId) ?? [];
  if (children.length === 0) { memo.set(nodeId, 0); return 0; }
  const result =
    Math.max(...children.map((c) => computeSubtreeDepth(c, childrenOf, memo))) + 1;
  memo.set(nodeId, result);
  return result;
}

// ---------------------------------------------------------------------------
// Step 6 — Center-priority ordering for Level-1 nodes
//
// Sort descending by subtree depth, then interleave from the middle outward:
//   sorted = [G1(4), G3(3), G2(2)]
//   mid = 1  →  slots: 1, 2, 0
//   result = [G3, G1, G2]   (G1 is deepest → center index 1)
// ---------------------------------------------------------------------------

function centerBySubtreeDepth(
  children: string[],
  childrenOf: Map<string, string[]>
): string[] {
  if (children.length <= 1) return children;

  const memo = new Map<string, number>();
  const withDepth = children
    .map((id) => ({ id, d: computeSubtreeDepth(id, childrenOf, memo) }))
    .sort((a, b) => b.d - a.d);

  const result  = new Array<string | null>(withDepth.length).fill(null);
  const mid     = Math.floor(withDepth.length / 2);

  // i=0 → mid (deepest goes to center)
  // i=1 → mid+1, i=2 → mid-1, i=3 → mid+2, i=4 → mid-2 …
  withDepth.forEach(({ id }, i) => {
    if (i === 0) {
      result[mid] = id;
      return;
    }
    const offset    = Math.ceil(i / 2);
    const direction = i % 2 !== 0 ? 1 : -1;  // odd i → right, even i → left
    const idx       = Math.max(0, Math.min(result.length - 1, mid + direction * offset));
    // If slot taken (edge case: length 1 or heavy collision), find nearest free slot
    if (result[idx] === null) {
      result[idx] = id;
    } else {
      const free = result.findIndex((v) => v === null);
      if (free !== -1) result[free] = id;
    }
  });

  return result.filter(Boolean) as string[];
}

// ---------------------------------------------------------------------------
// Step 7 — Master hierarchy builder
// ---------------------------------------------------------------------------

function buildHierarchy(
  nodes: GraphNode[],
  rawEdges: GraphEdge[]
): HierarchyResult {
  const tenantNode = nodes.find((n) => n.type === "tenant");
  if (!tenantNode) {
    console.error("No tenant node found.");
    return { edges: [], depth: new Map(), syntheticEdges: new Set(), childrenOf: new Map() };
  }
  const rootId = tenantNode.id;

  const normalisedRaw                   = detectAndNormaliseEdges(rawEdges, rootId);
  const { edges, parentOf, childrenOf } = buildSingleParentEdges(normalisedRaw);
  const { depth, visited }              = bfsDepths(rootId, childrenOf);

  const syntheticEdges = adoptOrphans(
    new Set(nodes.map((n) => n.id)),
    rootId, parentOf, childrenOf, edges, depth, visited
  );

  // Apply center-priority ordering to Level-1 children
  const lvl1 = childrenOf.get(rootId) ?? [];
  childrenOf.set(rootId, centerBySubtreeDepth(lvl1, childrenOf));

  console.log(
    `Hierarchy: ${visited.size}/${nodes.length} nodes, ` +
    `max depth ${Math.max(0, ...depth.values())}, ` +
    `${syntheticEdges.size} synthetic edges.`
  );

  return { edges, depth, syntheticEdges, childrenOf };
}

// ---------------------------------------------------------------------------
// Step 8 — Pure formula-based positioning (no Dagre)
//
// Y = TOP_PADDING + level * LEVEL_HEIGHT       (uniform per level)
// X = centerX ± evenly spaced slots            (formula, adaptive gap)
//
// Sibling sort: group by parent, order parents left-to-right by their X,
// then within same parent preserve childrenOf insertion order.
// ---------------------------------------------------------------------------

function buildParentOf(edges: NormalisedEdge[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const e of edges) m.set(e.target, e.source);
  return m;
}

function computePositions(
  nodes: Node[],
  depthMap: Map<string, number>,
  childrenOf: Map<string, string[]>,
  parentOf: Map<string, string>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // Group by level
  const byLevel = new Map<number, string[]>();
  for (const node of nodes) {
    const lvl = depthMap.get(node.id) ?? 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(node.id);
  }

  const maxLevel = Math.max(0, ...byLevel.keys());

  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const ids = byLevel.get(lvl) ?? [];
    if (ids.length === 0) continue;

    const y = TOP_PADDING + lvl * LEVEL_HEIGHT;

    if (lvl === 0) {
      // Tenant dead-center
      positions.set(ids[0], { x: 0, y });
      continue;
    }

    // Sort: primary by parent's x (left parent → left child),
    //       secondary by index within parent's children list
    ids.sort((a, b) => {
      const pa  = parentOf.get(a);
      const pb  = parentOf.get(b);
      const xpa = pa ? (positions.get(pa)?.x ?? 0) : 0;
      const xpb = pb ? (positions.get(pb)?.x ?? 0) : 0;
      if (xpa !== xpb) return xpa - xpb;
      // same parent x → use sibling order from childrenOf
      const siblings = pa ? (childrenOf.get(pa) ?? []) : [];
      return siblings.indexOf(a) - siblings.indexOf(b);
    });

    const gap        = getGapForCount(ids.length);
    const totalWidth = (ids.length - 1) * gap;
    const startX     = -(totalWidth / 2);

    ids.forEach((id, i) => {
      positions.set(id, { x: startX + i * gap, y });
    });
  }

  return positions;
}

// ---------------------------------------------------------------------------
// Step 9 — Assemble layouted React Flow nodes
// ---------------------------------------------------------------------------

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  normEdges: NormalisedEdge[],
  depthMap: Map<string, number>,
  childrenOf: Map<string, string[]>
): { nodes: Node[]; edges: Edge[] } {
  const parentOf  = buildParentOf(normEdges);
  const positions = computePositions(nodes, depthMap, childrenOf, parentOf);

  const layoutedNodes: Node[] = nodes.map((node) => {
    const pos       = positions.get(node.id) ?? { x: 0, y: 0 };
    const { width } = getNodeDimensions(node.data?.type ?? "user");
    return {
      ...node,
      position: {
        x: pos.x - width / 2,  // center node on its slot coordinate
        y: pos.y,
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });

  return { nodes: layoutedNodes, edges };
}

// ---------------------------------------------------------------------------
// Step 10 — Compute bounding box and derive viewport to center + fit
//
// fitView() is called imperatively via rfInstance.fitView() after nodes load,
// ensuring the graph is properly centered and zoomed on every data refresh.
// ---------------------------------------------------------------------------

function deriveViewport(
  nodes: Node[],
  containerWidth: number,
  containerHeight: number
): { x: number; y: number; zoom: number } {
  if (nodes.length === 0) return { x: 0, y: 0, zoom: 0.8 };

  let minX =  Infinity, maxX = -Infinity;
  let minY =  Infinity, maxY = -Infinity;

  for (const n of nodes) {
    const w = (n.style?.width as number) ?? NODE_WIDTH;
    const h = (n.style?.height as number) ?? NODE_HEIGHT;
    minX = Math.min(minX, n.position.x);
    maxX = Math.max(maxX, n.position.x + w);
    minY = Math.min(minY, n.position.y);
    maxY = Math.max(maxY, n.position.y + h);
  }

  const graphW  = maxX - minX;
  const graphH  = maxY - minY;
  const padding = 40; // reduced from 80

  const zoomX = (containerWidth  - padding * 2) / graphW;
  const zoomY = (containerHeight - padding * 2) / graphH;
  const zoom  = Math.min(Math.max(Math.min(zoomX, zoomY), 0.15), 1.5); // max zoom increased to 1.5

  // Translate so the bounding box center aligns with the container center
  const cx = containerWidth  / 2 - (minX + graphW / 2) * zoom;
  const cy = containerHeight / 2 - (minY + graphH / 2) * zoom;

  return { x: cx, y: cy, zoom };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SimpleAllNodesGraph() {
  const [nodes, setNodes]   = useState<Node[]>([]);
  const [edges, setEdges]   = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [viewport, setViewport] = useState<{ x: number; y: number; zoom: number }>(
    { x: 0, y: 0, zoom: 0.8 }
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const rfInstance   = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/entra/graph-full`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { nodes: GraphNode[]; edges: GraphEdge[] } = await res.json();

        console.log("Raw API data:", data);

        const {
          edges: normEdges,
          depth,
          syntheticEdges,
          childrenOf,
        } = buildHierarchy(data.nodes, data.edges);

        const flowNodes: Node[] = data.nodes.map((node) => ({
          id:       node.id,
          type:     "default",
          data:     { label: node.label, type: node.type },
          position: { x: 0, y: 0 },
          style:    getNodeStyle(node.type),
        }));

        let counter = 0;
        const flowEdges: Edge[] = normEdges.map((e) => {
          const isSynthetic = syntheticEdges.has(`${e.source}->${e.target}`);
          return {
            id:       `e${++counter}-${e.source}-${e.target}`,
            source:   e.source,
            target:   e.target,
            animated: !isSynthetic,
            style: {
              stroke:          isSynthetic ? "#F59E0B" : "#3B82F6",
              strokeWidth:     isSynthetic ? 1.5 : 2,
              strokeDasharray: isSynthetic ? "4 4" : undefined,
            },
            markerEnd: {
              type:  MarkerType.ArrowClosed,
              color: isSynthetic ? "#F59E0B" : "#3B82F6",
            },
          };
        });

        const { nodes: ln, edges: le } = getLayoutedElements(
          flowNodes, flowEdges, normEdges, depth, childrenOf
        );

        // Derive viewport from bounding box before setting state
        const cw = containerRef.current?.clientWidth  ?? window.innerWidth;
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

  // After nodes are painted, call fitView for a pixel-perfect fit
  useEffect(() => {
    if (nodes.length > 0 && rfInstance.current) {
      setTimeout(() => {
        rfInstance.current?.fitView({ padding: 0.1, duration: 400 });
      }, 50);
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
        onInit={(instance) => {
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
        <Controls
          style={{
            background: "#1E293B",
            color: "white",
            border: "1px solid #334155",
          }}
        />
      </ReactFlow>
    </div>
  );
}