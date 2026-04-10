// src/pages/users/Overview.tsx
import { useEffect, useState } from "react";
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { type GraphData, type GraphNode, MOCK_AI_EXPLANATIONS, MOCK_REMEDIATIONS } from "../../types/users";
import { useRemediation } from "../../context/RemediationContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

const getNodeStyle = (type: string, severity?: string) => {
  const baseStyle = {
    borderRadius: "8px",
    padding: "12px",
    color: "white",
    border: "2px solid",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
    fontSize: "12px",
    fontWeight: "500",
    textAlign: "center" as const,
  };
  switch (type) {
    case "user": {
      let userColor = "#1E3A8A", userBorder = "#3B82F6", userGlow = "rgba(59, 130, 246, 0.5)";
      if (severity === "Critical") { userColor = "#7F1D1D"; userBorder = "#EF4444"; userGlow = "rgba(239, 68, 68, 0.5)"; }
      else if (severity === "High") { userColor = "#92400E"; userBorder = "#F59E0B"; userGlow = "rgba(245, 158, 11, 0.5)"; }
      else if (severity === "Medium") { userColor = "#1E3A8A"; userBorder = "#3B82F6"; userGlow = "rgba(59, 130, 246, 0.5)"; }
      else if (severity === "Low") { userColor = "#065F46"; userBorder = "#10B981"; userGlow = "rgba(16, 185, 129, 0.5)"; }
      return { ...baseStyle, background: userColor, borderColor: userBorder, boxShadow: `0 4px 6px rgba(0,0,0,0.3), 0 0 10px ${userGlow}`, width: 160 };
    }
    case "group":
      return { ...baseStyle, background: "#0E7490", borderColor: "#06B6D4", boxShadow: "0 4px 6px rgba(0,0,0,0.3), 0 0 10px rgba(6, 182, 212, 0.5)", width: 150, fontWeight: "600" };
    case "tenant":
      return { ...baseStyle, background: "#5B21B6", borderColor: "#8B5CF6", boxShadow: "0 4px 6px rgba(0,0,0,0.3), 0 0 15px rgba(139, 92, 246, 0.5)", width: 180, fontSize: "14px", fontWeight: "bold" };
    default:
      return { ...baseStyle, background: "#6B21A8", borderColor: "#A855F7", boxShadow: "0 4px 6px rgba(0,0,0,0.3), 0 0 10px rgba(168, 85, 247, 0.5)", width: 160 };
  }
};

export default function Overview() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isGraphLoading, setIsGraphLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showRemediationModal } = useRemediation();

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setIsGraphLoading(true);
        setError(null);
        const [graphResponse, usersResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/entra/graph`),
          fetch(`${API_BASE_URL}/api/entra/users`),
        ]);
        if (!graphResponse.ok || !usersResponse.ok) throw new Error("Failed to fetch data");
        const graphData: GraphData = await graphResponse.json();
        await usersResponse.json();

        if (graphData.nodes && graphData.edges) {
          const userNodes = graphData.nodes.filter((n: GraphNode) => n.type === "user");
          const groupNodes = graphData.nodes.filter((n: GraphNode) => n.type === "group");
          const tenantNodes = graphData.nodes.filter((n: GraphNode) => n.type === "tenant");

          const flowNodes: Node[] = [];
          const flowEdges: Edge[] = [];
          const centerX = 600;
          const tenantId = tenantNodes[0]?.id || "tenant-1";
          flowNodes.push({
            id: tenantId,
            type: "default",
            data: { label: "Default Directory", type: "tenant", risk: "92%", severity: "Critical" },
            position: { x: centerX, y: 50 },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            style: getNodeStyle("tenant"),
          });

          // LEVEL 1
          const level1Nodes = [
            { label: "Level-1-Group", type: "group", risk: "65%", severity: "Medium", x: centerX - 400, y: 200 },
            { label: "Cloud Admin", type: "user", risk: "87%", severity: "High", x: centerX - 250, y: 200 },
            { label: "Kamal Galsar", type: "user", risk: "25%", severity: "Low", x: centerX - 100, y: 200 },
            { label: "Dev User", type: "user", risk: "68%", severity: "Medium", x: centerX + 50, y: 200 },
            { label: "Basic User", type: "user", risk: "35%", severity: "Low", x: centerX + 200, y: 200 },
            { label: "Puja", type: "user", risk: "45%", severity: "Medium", x: centerX + 350, y: 200 },
            { label: "Kishan", type: "user", risk: "30%", severity: "Low", x: centerX + 500, y: 200 },
          ];
          const level1Ids: Record<string, string> = {};
          level1Nodes.forEach((nodeInfo) => {
            let nodeId = `${nodeInfo.label.toLowerCase().replace(/\s+/g, "-")}`;
            level1Ids[nodeInfo.label] = nodeId;
            flowNodes.push({
              id: nodeId,
              type: "default",
              data: { label: nodeInfo.label, type: nodeInfo.type, risk: nodeInfo.risk, severity: nodeInfo.severity, email: nodeInfo.type === "user" ? `${nodeInfo.label.toLowerCase().replace(/\s+/g, ".")}@example.com` : undefined },
              position: { x: nodeInfo.x, y: nodeInfo.y },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle(nodeInfo.type, nodeInfo.severity),
            });
            if (nodeInfo.label !== "Level-1-Group") {
              flowEdges.push({ id: `edge-tenant-${nodeInfo.label}`, source: tenantId, target: nodeId, animated: true, style: { stroke: "#3B82F6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" } });
            }
          });

          // LEVEL 2
          const level2Nodes = [
            { label: "Level-2-Group", type: "group", risk: "75%", severity: "High", x: centerX - 250, y: 350 },
            { label: "Admin User", type: "user", risk: "72%", severity: "Medium", x: centerX, y: 350 },
          ];
          const level2Ids: Record<string, string> = {};
          level2Nodes.forEach((nodeInfo) => {
            let nodeId = `${nodeInfo.label.toLowerCase().replace(/\s+/g, "-")}`;
            level2Ids[nodeInfo.label] = nodeId;
            flowNodes.push({
              id: nodeId,
              type: "default",
              data: { label: nodeInfo.label, type: nodeInfo.type, risk: nodeInfo.risk, severity: nodeInfo.severity, email: nodeInfo.type === "user" ? `${nodeInfo.label.toLowerCase().replace(/\s+/g, ".")}@example.com` : undefined },
              position: { x: nodeInfo.x, y: nodeInfo.y },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle(nodeInfo.type, nodeInfo.severity),
            });
            if (level1Ids["Level-1-Group"] && nodeInfo.label !== "Level-2-Group") {
              flowEdges.push({ id: `edge-level1-${nodeInfo.label}`, source: level1Ids["Level-1-Group"], target: nodeId, animated: true, style: { stroke: "#3B82F6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" } });
            }
          });

          // LEVEL 3
          const level3Nodes = [{ label: "Risky User", type: "user", risk: "94%", severity: "Critical", x: centerX - 150, y: 500 }];
          let riskyUserId = "";
          level3Nodes.forEach((nodeInfo) => {
            const nodeId = `${nodeInfo.label.toLowerCase().replace(/\s+/g, "-")}`;
            riskyUserId = nodeId;
            flowNodes.push({
              id: nodeId,
              type: "default",
              data: { label: nodeInfo.label, type: nodeInfo.type, risk: nodeInfo.risk, severity: nodeInfo.severity, email: `${nodeInfo.label.toLowerCase().replace(/\s+/g, ".")}@example.com` },
              position: { x: nodeInfo.x, y: nodeInfo.y },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle(nodeInfo.type, nodeInfo.severity),
            });
          });

          // Isolated and Regular users
          const isolatedUserNode = userNodes.find((u: any) => u.label === "Isolated User (Cloud Admin)");
          if (isolatedUserNode) {
            flowNodes.push({
              id: isolatedUserNode.id,
              type: "default",
              data: { label: isolatedUserNode.label, type: "user", risk: "72%", severity: "Medium", email: "isolated@example.com" },
              position: { x: centerX + 150, y: 500 },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle("user", "Medium"),
            });
            if (level2Ids["Level-2-Group"]) {
              flowEdges.push({ id: "edge-level2-isolated", source: level2Ids["Level-2-Group"], target: isolatedUserNode.id, animated: true, style: { stroke: "#3B82F6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" } });
            }
          }

          const regularUserNode = userNodes.find((u: any) => u.label === "Regular User");
          if (regularUserNode) {
            flowNodes.push({
              id: regularUserNode.id,
              type: "default",
              data: { label: regularUserNode.label, type: "user", risk: "45%", severity: "Medium", email: "regular@example.com" },
              position: { x: centerX + 50, y: 500 },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle("user", "Medium"),
            });
            if (level2Ids["Level-2-Group"]) {
              flowEdges.push({ id: "edge-level2-regular", source: level2Ids["Level-2-Group"], target: regularUserNode.id, animated: true, style: { stroke: "#3B82F6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" } });
            }
          }

          // Attack paths (dashed red)
          if (riskyUserId && level2Ids["Level-2-Group"]) {
            flowEdges.push({ id: "attack-level2-to-risky", source: level2Ids["Level-2-Group"], target: riskyUserId, animated: true, style: { stroke: "#EF4444", strokeWidth: 3, strokeDasharray: "5,5" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" } });
          }
          if (level2Ids["Level-2-Group"] && level1Ids["Level-1-Group"]) {
            flowEdges.push({ id: "attack-level1-to-level2", source: level1Ids["Level-1-Group"], target: level2Ids["Level-2-Group"], animated: true, style: { stroke: "#EF4444", strokeWidth: 3, strokeDasharray: "5,5" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" } });
          }
          if (level1Ids["Level-1-Group"] && tenantId) {
            flowEdges.push({ id: "attack-tenant-to-level1", source: tenantId, target: level1Ids["Level-1-Group"], animated: true, style: { stroke: "#EF4444", strokeWidth: 3, strokeDasharray: "5,5" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" } });
          }

          setNodes(flowNodes);
          setEdges(flowEdges);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsGraphLoading(false);
      }
    };
    fetchGraphData();
  }, [setNodes, setEdges]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Graph Area - takes full width on mobile, left column on desktop */}
      <div className="flex-1 min-w-0">
        <div className="h-[400px] sm:h-[500px] lg:h-[calc(100vh-12rem)] bg-[#0B1220] rounded-lg overflow-hidden">
          {isGraphLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                <p>Loading Microsoft Graph data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-center max-w-md p-6 bg-red-900/20 rounded-lg border border-red-500">
                <p className="text-red-400 mb-4">Error loading graph</p>
                <p className="text-sm text-gray-400 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              minZoom={0.3}
              maxZoom={1.2}
              defaultViewport={{ x: 0, y: 50, zoom: 0.6 }}
              style={{ background: "#0B1220", height: "100%" }}
            >
              <Background color="#1E293B" gap={16} />
              <Controls style={{ background: "#1E293B", color: "white", border: "1px solid #334155" }} />
            </ReactFlow>
          )}
        </div>
      </div>

      {/* Right sidebar - AI Risk Analysis & Remediation Checklist (always visible) */}
      <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-5 sm:p-6 h-fit">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          AI Risk Analysis
        </h3>

        <div className="space-y-4 mb-6">
          {MOCK_AI_EXPLANATIONS.map((exp) => (
            <div
              key={exp.id}
              className={`p-3 rounded-lg ${
                exp.severity === "critical"
                  ? "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                  : "bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800"
              }`}
            >
              <p className={`text-sm font-medium ${exp.severity === "critical" ? "text-red-700 dark:text-red-400" : "text-yellow-700 dark:text-yellow-400"}`}>
                {exp.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{exp.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 text-right">
          Last analysis: 17-03-2026
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Remediation Checklist
        </h3>

        <div className="space-y-2">
          {MOCK_REMEDIATIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => showRemediationModal(action.label)}
              className="w-full group flex items-center gap-3 px-4 py-3 rounded-lg 
                bg-gray-50 dark:bg-gray-700/50 
                hover:bg-gray-100 dark:hover:bg-gray-700 
                border border-gray-200 dark:border-gray-600 
                transition-all duration-200 
                text-left"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full 
                border-2 border-gray-300 dark:border-gray-500 
                group-hover:border-blue-500 dark:group-hover:border-blue-400
                group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20
                transition-colors duration-200
                flex items-center justify-center"
              />
              <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 
                group-hover:text-gray-900 dark:group-hover:text-white">
                {action.label}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                action.label.includes("PIM")
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : action.label.includes("group")
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    : action.label.includes("Revoke")
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
              }`}>
                {action.label.includes("PIM") ? "PIM" : action.label.includes("group") ? "Group" : action.label.includes("Revoke") ? "Critical" : "CA"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>3 pending actions</span>
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              Apply all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}