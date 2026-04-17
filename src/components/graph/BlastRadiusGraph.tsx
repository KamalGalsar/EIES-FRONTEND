import { useEffect, useState, useRef, useCallback } from "react";
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
import api from "../../services/api";

// ===== Layout utilities (copied from DynamicGraph for self-contained component) =====
const NODE_WIDTH = 160;
const TENANT_WIDTH = 200;
const LEVEL_HEIGHT = 150;
const TOP_PADDING = 50;

interface GraphNode {
  id: string;
  label: string;
  type: string;
  isStartNode?: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
  affected?: boolean;
}

interface NormalisedEdge {
  source: string;
  target: string;
  rawType: string;
}

function buildHierarchy(
  nodes: GraphNode[],
  edges: GraphEdge[],
): {
  normEdges: NormalisedEdge[];
  depth: Map<string, number>;
  childrenOf: Map<string, string[]>;
} {
  // Find root (start node)
  const startNode = nodes.find((n) => n.isStartNode);
  if (!startNode)
    return { normEdges: [], depth: new Map(), childrenOf: new Map() };
  const rootId = startNode.id;

  // Build adjacency
  const childrenOf = new Map<string, string[]>();
  const normEdges: NormalisedEdge[] = [];
  for (const e of edges) {
    const parent = e.from;
    const child = e.to;
    if (!childrenOf.has(parent)) childrenOf.set(parent, []);
    childrenOf.get(parent)!.push(child);
    normEdges.push({ source: parent, target: child, rawType: e.type });
  }

  // BFS depths
  const depth = new Map<string, number>();
  const visited = new Set<string>();
  const queue = [rootId];
  depth.set(rootId, 0);
  visited.add(rootId);

  while (queue.length) {
    const curr = queue.shift()!;
    const currDepth = depth.get(curr)!;
    for (const child of childrenOf.get(curr) || []) {
      if (!visited.has(child)) {
        visited.add(child);
        depth.set(child, currDepth + 1);
        queue.push(child);
      }
    }
  }

  return { normEdges, depth, childrenOf };
}

function computePositions(
  nodeIds: string[],
  depth: Map<string, number>,
  childrenOf: Map<string, string[]>,
  parentOf: Map<string, string>,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const byLevel = new Map<number, string[]>();

  for (const id of nodeIds) {
    const lvl = depth.get(id) ?? 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(id);
  }

  const maxLevel = Math.max(...byLevel.keys());

  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const ids = byLevel.get(lvl) || [];
    if (ids.length === 0) continue;
    const y = TOP_PADDING + lvl * LEVEL_HEIGHT;

    if (lvl === 0) {
      positions.set(ids[0], { x: 0, y });
      continue;
    }

    // Sort by parent x
    ids.sort((a, b) => {
      const pa = parentOf.get(a);
      const pb = parentOf.get(b);
      const xa = pa ? (positions.get(pa)?.x ?? 0) : 0;
      const xb = pb ? (positions.get(pb)?.x ?? 0) : 0;
      if (xa !== xb) return xa - xb;
      const siblings = pa ? childrenOf.get(pa) || [] : [];
      return siblings.indexOf(a) - siblings.indexOf(b);
    });

    const gap = Math.max(120, Math.min(250, 800 / ids.length));
    const totalWidth = (ids.length - 1) * gap;
    const startX = -totalWidth / 2;

    ids.forEach((id, i) => {
      positions.set(id, { x: startX + i * gap, y });
    });
  }

  return positions;
}

function getLayoutedElements(
  rawNodes: GraphNode[],
  rawEdges: GraphEdge[],
): { nodes: Node[]; edges: Edge[] } {
  const { normEdges, depth, childrenOf } = buildHierarchy(rawNodes, rawEdges);

  const parentOf = new Map<string, string>();
  for (const e of normEdges) parentOf.set(e.target, e.source);

  const allIds = rawNodes.map((n) => n.id);
  const positions = computePositions(allIds, depth, childrenOf, parentOf);

  const nodes: Node[] = rawNodes.map((node) => {
    const pos = positions.get(node.id) ?? { x: 0, y: 0 };
    const width = node.type === "tenant" ? TENANT_WIDTH : NODE_WIDTH;
    return {
      id: node.id,
      data: { label: node.label },
      position: { x: pos.x - width / 2, y: pos.y },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      style: {
        background: node.type === "user" ? "#1E3A8A" : "#0E7490",
        color: "white",
        border: node.isStartNode ? "3px solid #F59E0B" : "2px solid #3B82F6",
        borderRadius: node.type === "user" ? "20px" : "8px",
        padding: "8px 15px",
        width,
        fontSize: "12px",
        fontWeight: "500",
      },
    };
  });

  const edges: Edge[] = rawEdges.map((e, i) => ({
    id: `e${i}-${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    animated: true,
    style: {
      stroke: e.affected ? "#EF4444" : "#3B82F6",
      strokeWidth: e.affected ? 3 : 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: e.affected ? "#EF4444" : "#3B82F6",
    },
  }));

  return { nodes, edges };
}
// ===== End layout utilities =====

interface Props {
  nodeId: string;
}

export default function BlastRadiusGraph({ nodeId }: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  const fetchBlastRadiusGraph = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/toxic/blast-radius-graph/${nodeId}`);
      const { nodes: rawNodes, edges: rawEdges } = res.data as {
        nodes: GraphNode[];
        edges: GraphEdge[];
      };

      if (!rawNodes.length) {
        setError("No graph data available for this node.");
        setNodes([]);
        setEdges([]);
        return;
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(rawNodes, rawEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to load graph";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    fetchBlastRadiusGraph();
  }, [fetchBlastRadiusGraph]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>Loading blast radius graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="bg-red-900/30 p-4 rounded-lg max-w-md">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchBlastRadiusGraph}
            className="mt-3 px-3 py-1 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No reachable nodes found.
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onInit={(inst) => {
        rfInstance.current = inst;
      }}
      fitView
      minZoom={0.1}
      maxZoom={1.5}
      style={{ background: "#0B1220", height: "100%", width: "100%" }}
    >
      <Background color="#1E293B" gap={16} />
      <Controls />
    </ReactFlow>
  );
}
