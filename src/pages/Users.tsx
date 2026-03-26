// src/pages/Users.tsx

import { type GraphUser, type GraphData, type GraphNode } from "../types/users";

import { useState, useEffect } from "react";
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
import Sidebar from "../components/users/Sidebar";
import { RemediationModal, PathDetailsModal } from "../components/users/Modals";
import {
  MOCK_USER_SUMMARY,
  MOCK_AI_EXPLANATIONS,
  MOCK_REMEDIATIONS,
} from "../types/users";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bell, Search, User, Settings, LogOut } from "lucide-react";

const API_BASE_URL = "http://localhost:5268";

function TopNavWithBack({ userName, userRole, onEmergency }: { userName: string; userRole: string; onEmergency: () => void }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, groups, risks..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Emergency button */}
          <button
            onClick={onEmergency}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Remediate
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                {userName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Users() {
  const [activeTab, setActiveTab] = useState("overview");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showRemediationModal, setShowRemediationModal] = useState(false);
  const [showPathModal, setShowPathModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<GraphUser[]>([]);
  const [remediationStatus, setRemediationStatus] = useState<string | null>(
    null,
  );

  // Fetch graph data from the backend API
  useEffect(() => {
    const fetchGraphData = async () => {
      if (activeTab !== "overview") return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch both graph and users data
        const [graphResponse, usersResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/entra/graph`),
          fetch(`${API_BASE_URL}/api/entra/users`),
        ]);

        if (!graphResponse.ok) {
          throw new Error(
            `Failed to fetch graph data: ${graphResponse.status}`,
          );
        }

        if (!usersResponse.ok) {
          throw new Error(
            `Failed to fetch users data: ${usersResponse.status}`,
          );
        }

        const graphData: GraphData = await graphResponse.json();
        const usersData: GraphUser[] = await usersResponse.json();

        console.log("Graph data received:", graphData);
        console.log("Users data received:", usersData);

        setUsers(usersData);

        // Transform the data to match ReactFlow's expected format
        if (graphData.nodes && graphData.edges) {
          const userNodes = graphData.nodes.filter(
            (n: GraphNode) => n.type === "user",
          );
          const groupNodes = graphData.nodes.filter(
            (n: GraphNode) => n.type === "group",
          );
          const tenantNodes = graphData.nodes.filter(
            (n: GraphNode) => n.type === "tenant",
          );

          const flowNodes: Node[] = [];
          const flowEdges: Edge[] = [];

          // CENTER X POSITION FOR THE TREE
          const centerX = 600;

          // LEVEL 0: DEFAULT DIRECTORY (TENANT) - TOP
          const tenantId = tenantNodes[0]?.id || "tenant-1";
          flowNodes.push({
            id: tenantId,
            type: "default",
            data: {
              label: "Default Directory",
              type: "tenant",
              risk: "92%",
              severity: "Critical",
            },
            position: { x: centerX, y: 50 },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            style: getNodeStyle("tenant"),
          });

          // LEVEL 1: DIRECT CHILDREN OF DEFAULT DIRECTORY
          const level1Nodes = [
            {
              label: "Level-1-Group",
              type: "group",
              risk: "65%",
              severity: "Medium",
              x: centerX - 400,
              y: 200,
            },
            {
              label: "Cloud Admin",
              type: "user",
              risk: "87%",
              severity: "High",
              x: centerX - 250,
              y: 200,
            },
            {
              label: "Kamal Galsar",
              type: "user",
              risk: "25%",
              severity: "Low",
              x: centerX - 100,
              y: 200,
            },
            {
              label: "Dev User",
              type: "user",
              risk: "68%",
              severity: "Medium",
              x: centerX + 50,
              y: 200,
            },
            {
              label: "Basic User",
              type: "user",
              risk: "35%",
              severity: "Low",
              x: centerX + 200,
              y: 200,
            },
            {
              label: "Puja",
              type: "user",
              risk: "45%",
              severity: "Medium",
              x: centerX + 350,
              y: 200,
            },
            {
              label: "Kishan",
              type: "user",
              risk: "30%",
              severity: "Low",
              x: centerX + 500,
              y: 200,
            },
          ];

          const level1Ids: { [key: string]: string } = {};

          level1Nodes.forEach((nodeInfo) => {
            let nodeId;
            if (nodeInfo.type === "group") {
              const existingNode = groupNodes.find(
                (g: any) => g.label === nodeInfo.label,
              );
              nodeId =
                existingNode?.id ||
                `${nodeInfo.label.toLowerCase().replace(/\s+/g, "-")}`;
            } else {
              const existingNode = userNodes.find(
                (u: any) => u.label === nodeInfo.label,
              );
              nodeId =
                existingNode?.id ||
                `${nodeInfo.label.toLowerCase().replace(/\s+/g, "-")}`;
            }

            level1Ids[nodeInfo.label] = nodeId;

            flowNodes.push({
              id: nodeId,
              type: "default",
              data: {
                label: nodeInfo.label,
                type: nodeInfo.type,
                risk: nodeInfo.risk,
                severity: nodeInfo.severity,
                email:
                  nodeInfo.type === "user"
                    ? `${nodeInfo.label.toLowerCase().replace(/\s+/g, ".")}@example.com`
                    : undefined,
              },
              position: { x: nodeInfo.x, y: nodeInfo.y },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle(nodeInfo.type, nodeInfo.severity),
            });

            if (nodeInfo.label !== "Level-1-Group") {
              flowEdges.push({
                id: `edge-tenant-${nodeInfo.label}`,
                source: tenantId,
                target: nodeId,
                sourceHandle: null,
                targetHandle: null,
                animated: true,
                style: { stroke: "#3B82F6", strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" },
              });
            }
          });

          // LEVEL 2: CHILDREN OF LEVEL-1-GROUP
          const level2Nodes = [
            {
              label: "Level-2-Group",
              type: "group",
              risk: "75%",
              severity: "High",
              x: centerX - 250,
              y: 350,
            },
            {
              label: "Admin User",
              type: "user",
              risk: "72%",
              severity: "Medium",
              x: centerX,
              y: 350,
            },
          ];

          const level2Ids: { [key: string]: string } = {};

          level2Nodes.forEach((nodeInfo) => {
            let nodeId;
            if (nodeInfo.type === "group") {
              const existingNode = groupNodes.find(
                (g: any) => g.label === nodeInfo.label,
              );
              nodeId =
                existingNode?.id ||
                `${nodeInfo.label.toLowerCase().replace(/\s+/g, "-")}`;
            } else {
              const existingNode = userNodes.find(
                (u: any) => u.label === nodeInfo.label,
              );
              nodeId =
                existingNode?.id ||
                `${nodeInfo.label.toLowerCase().replace(/\s+/g, "-")}`;
            }

            level2Ids[nodeInfo.label] = nodeId;

            flowNodes.push({
              id: nodeId,
              type: "default",
              data: {
                label: nodeInfo.label,
                type: nodeInfo.type,
                risk: nodeInfo.risk,
                severity: nodeInfo.severity,
                email:
                  nodeInfo.type === "user"
                    ? `${nodeInfo.label.toLowerCase().replace(/\s+/g, ".")}@example.com`
                    : undefined,
              },
              position: { x: nodeInfo.x, y: nodeInfo.y },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle(nodeInfo.type, nodeInfo.severity),
            });

            // Connect to Level-1-Group (skip blue edge for Level-2-Group)
            if (level1Ids["Level-1-Group"] && nodeInfo.label !== "Level-2-Group") {
              flowEdges.push({
                id: `edge-level1-${nodeInfo.label}`,
                source: level1Ids["Level-1-Group"],
                target: nodeId,
                sourceHandle: null,
                targetHandle: null,
                animated: true,
                style: { stroke: "#3B82F6", strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" },
              });
            }
          });

          // LEVEL 3: CHILDREN OF LEVEL-2-GROUP
          const level3Nodes = [
            {
              label: "Risky User",
              type: "user",
              risk: "94%",
              severity: "Critical",
              x: centerX - 150,
              y: 500,
            },
          ];

          let riskyUserId = ""; // Store the actual node ID for Risky User

          level3Nodes.forEach((nodeInfo) => {
            const existingNode = userNodes.find(
              (u: any) => u.label === nodeInfo.label,
            );
            const nodeId =
              existingNode?.id ||
              `${nodeInfo.label.toLowerCase().replace(/\s+/g, "-")}`;

            // Save the ID for the attack edge
            riskyUserId = nodeId;

            flowNodes.push({
              id: nodeId,
              type: "default",
              data: {
                label: nodeInfo.label,
                type: nodeInfo.type,
                risk: nodeInfo.risk,
                severity: nodeInfo.severity,
                email: `${nodeInfo.label.toLowerCase().replace(/\s+/g, ".")}@example.com`,
              },
              position: { x: nodeInfo.x, y: nodeInfo.y },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle(nodeInfo.type, nodeInfo.severity),
            });

            // Connect to Level-2-Group (skip blue edge for Risky User)
            if (level2Ids["Level-2-Group"] && nodeInfo.label !== "Risky User") {
              flowEdges.push({
                id: `edge-level2-${nodeInfo.label}`,
                source: level2Ids["Level-2-Group"],
                target: nodeId,
                sourceHandle: null,
                targetHandle: null,
                animated: true,
                style: { stroke: "#3B82F6", strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" },
              });
            }
          });

          // Isolated User (Cloud Admin)
          const isolatedUserNode = userNodes.find(
            (u: any) => u.label === "Isolated User (Cloud Admin)",
          );
          if (isolatedUserNode) {
            flowNodes.push({
              id: isolatedUserNode.id,
              type: "default",
              data: {
                label: isolatedUserNode.label,
                type: "user",
                risk: "72%",
                severity: "Medium",
                email: "isolated@example.com",
              },
              position: { x: centerX + 150, y: 500 },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle("user", "Medium"),
            });

            if (level2Ids["Level-2-Group"]) {
              flowEdges.push({
                id: "edge-level2-isolated",
                source: level2Ids["Level-2-Group"],
                target: isolatedUserNode.id,
                sourceHandle: null,
                targetHandle: null,
                animated: true,
                style: { stroke: "#3B82F6", strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" },
              });
            }
          }

          // Regular User
          const regularUserNode = userNodes.find(
            (u: any) => u.label === "Regular User",
          );
          if (regularUserNode) {
            flowNodes.push({
              id: regularUserNode.id,
              type: "default",
              data: {
                label: regularUserNode.label,
                type: "user",
                risk: "45%",
                severity: "Medium",
                email: "regular@example.com",
              },
              position: { x: centerX + 50, y: 500 },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
              style: getNodeStyle("user", "Medium"),
            });

            if (level2Ids["Level-2-Group"]) {
              flowEdges.push({
                id: "edge-level2-regular",
                source: level2Ids["Level-2-Group"],
                target: regularUserNode.id,
                sourceHandle: null,
                targetHandle: null,
                animated: true,
                style: { stroke: "#3B82F6", strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" },
              });
            }
          }

          // ATTACK PATH (DASHED RED LINES) - using the stored riskyUserId
          if (riskyUserId && level2Ids["Level-2-Group"]) {
            flowEdges.push({
              id: "attack-level2-to-risky",
              source: level2Ids["Level-2-Group"],
              target: riskyUserId,
              sourceHandle: null,
              targetHandle: null,
              animated: true,
              style: {
                stroke: "#EF4444",
                strokeWidth: 3,
                strokeDasharray: "5,5",
              },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
            });
          }

          if (level2Ids["Level-2-Group"] && level1Ids["Level-1-Group"]) {
            flowEdges.push({
              id: "attack-level1-to-level2",
              source: level1Ids["Level-1-Group"],
              target: level2Ids["Level-2-Group"],
              sourceHandle: null,
              targetHandle: null,
              animated: true,
              style: {
                stroke: "#EF4444",
                strokeWidth: 3,
                strokeDasharray: "5,5",
              },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
            });
          }

          if (level1Ids["Level-1-Group"] && tenantId) {
            flowEdges.push({
              id: "attack-tenant-to-level1",
              source: tenantId,
              target: level1Ids["Level-1-Group"],
              sourceHandle: null,
              targetHandle: null,
              animated: true,
              style: {
                stroke: "#EF4444",
                strokeWidth: 3,
                strokeDasharray: "5,5",
              },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
            });
          }

          setNodes(flowNodes);
          setEdges(flowEdges);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
  }, [activeTab, setNodes, setEdges]);

  // Helper function to get node styles based on type and severity
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
        let userColor = "#1E3A8A";
        let userBorder = "#3B82F6";
        let userGlow = "rgba(59, 130, 246, 0.5)";

        if (severity === "Critical") {
          userColor = "#7F1D1D";
          userBorder = "#EF4444";
          userGlow = "rgba(239, 68, 68, 0.5)";
        } else if (severity === "High") {
          userColor = "#92400E";
          userBorder = "#F59E0B";
          userGlow = "rgba(245, 158, 11, 0.5)";
        } else if (severity === "Medium") {
          userColor = "#1E3A8A";
          userBorder = "#3B82F6";
          userGlow = "rgba(59, 130, 246, 0.5)";
        } else if (severity === "Low") {
          userColor = "#065F46";
          userBorder = "#10B981";
          userGlow = "rgba(16, 185, 129, 0.5)";
        }

        return {
          ...baseStyle,
          background: userColor,
          borderColor: userBorder,
          boxShadow: `0 4px 6px rgba(0,0,0,0.3), 0 0 10px ${userGlow}`,
          width: 160,
        };
      }

      case "group":
        return {
          ...baseStyle,
          background: "#0E7490",
          borderColor: "#06B6D4",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3), 0 0 10px rgba(6, 182, 212, 0.5)",
          width: 150,
          fontWeight: "600",
        };

      case "tenant":
        return {
          ...baseStyle,
          background: "#5B21B6",
          borderColor: "#8B5CF6",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3), 0 0 15px rgba(139, 92, 246, 0.5)",
          width: 180,
          fontSize: "14px",
          fontWeight: "bold",
        };

      default:
        return {
          ...baseStyle,
          background: "#6B21A8",
          borderColor: "#A855F7",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3), 0 0 10px rgba(168, 85, 247, 0.5)",
          width: 160,
        };
    }
  };

  const handleRemediation = (action: string) => {
    setSelectedAction(action);
    setShowRemediationModal(true);
    setRemediationStatus(null);
  };

  const alerts = [
    {
      id: 1,
      severity: "critical",
      title: "Privilege Escalation Detected",
      time: "5 min ago",
      description: "Risky User has access to multiple groups",
    },
    {
      id: 2,
      severity: "high",
      title: "Admin Account Activity",
      time: "15 min ago",
      description: "Admin User is a member of Level-1-Group",
    },
    {
      id: 3,
      severity: "medium",
      title: "Group Membership Alert",
      time: "1 hour ago",
      description: "Multiple users in administrative groups",
    },
  ];

  const riskHistory = [
    { date: "2026-03-03", score: 87, change: "+2", events: 3 },
    { date: "2026-03-09", score: 85, change: "-1", events: 2 },
    { date: "2026-03-10", score: 86, change: "+4", events: 4 },
    { date: "2026-03-11", score: 82, change: "-3", events: 1 },
    { date: "2026-03-16", score: 85, change: "0", events: 2 },
  ];

  const settings = [
    {
      category: "Risk Thresholds",
      items: [
        { name: "Critical Risk Threshold", value: "80%" },
        { name: "High Risk Threshold", value: "60%" },
        { name: "Medium Risk Threshold", value: "40%" },
      ],
    },
    {
      category: "Notification Preferences",
      items: [
        { name: "Email Alerts", value: "Enabled" },
        { name: "Slack Integration", value: "Disabled" },
        { name: "SMS for Critical", value: "Enabled" },
      ],
    },
    {
      category: "Analysis Settings",
      items: [
        { name: "Auto-remediation", value: "Disabled" },
        { name: "Deep Scan Frequency", value: "Every 6 hours" },
        { name: "Retention Period", value: "90 days" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={MOCK_USER_SUMMARY.userName}
        userRole="Identity"
        riskScore={MOCK_USER_SUMMARY.riskScore}
      />

      <TopNavWithBack
        userName={MOCK_USER_SUMMARY.userName}
        userRole="Identity"
        onEmergency={() => handleRemediation("Emergency Remediation Phase")}
      />

      {/* Top Summary Bar */}
      <div className="fixed top-16 left-64 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                Risk Score
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {MOCK_USER_SUMMARY.riskScore}
                </span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                Risk Level
              </span>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {MOCK_USER_SUMMARY.riskLevel}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                Total Users
              </span>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {users.length}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                Active Groups
              </span>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {nodes.filter((n) => n.data.type === "group").length}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Live Microsoft Graph Data</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-64 pt-40 p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="flex gap-6">
            {/* Graph Area */}
            <div className="flex-1 h-[calc(100vh-12rem)] bg-[#0B1220] rounded-lg overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B1220] bg-opacity-75 z-10">
                  <div className="text-white text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                    <p>Loading Microsoft Graph data...</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Fetching users and groups from Azure AD
                    </p>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B1220] bg-opacity-75 z-10">
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
              )}

              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 50, zoom: 0.7 }}
                style={{ background: "#0B1220", height: "100%" }}
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

            {/* Right sidebar */}
            <div className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 h-fit">
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
                    <p
                      className={`text-sm font-medium ${
                        exp.severity === "critical"
                          ? "text-red-700 dark:text-red-400"
                          : "text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {exp.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {exp.description}
                    </p>
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
                    onClick={() => handleRemediation(action.label)}
                    className="w-full group flex items-center gap-3 px-4 py-3 rounded-lg 
                      bg-gray-50 dark:bg-gray-700/50 
                      hover:bg-gray-100 dark:hover:bg-gray-700 
                      border border-gray-200 dark:border-gray-600 
                      transition-all duration-200 
                      text-left"
                  >
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full 
                        border-2 border-gray-300 dark:border-gray-500 
                        group-hover:border-blue-500 dark:group-hover:border-blue-400
                        group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20
                        transition-colors duration-200
                        flex items-center justify-center"
                    />

                    <span
                      className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 
                        group-hover:text-gray-900 dark:group-hover:text-white"
                    >
                      {action.label}
                    </span>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        action.label.includes("PIM")
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : action.label.includes("group")
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            : action.label.includes("Revoke")
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      }`}
                    >
                      {action.label.includes("PIM")
                        ? "PIM"
                        : action.label.includes("group")
                          ? "Group"
                          : action.label.includes("Revoke")
                            ? "Critical"
                            : "CA"}
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
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="max-w-4xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Users ({users.length})
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Display Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      User Principal Name
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {user.displayName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {user.userPrincipalName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attack Paths Tab */}
        {activeTab === "attack-paths" && (
          <div className="max-w-4xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Attack Path Analysis
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  name: "Nested Group Escalation",
                  risk: 92,
                  steps: 6,
                  target: "Production Workloads",
                },
                {
                  name: "Service Principal Backdoor",
                  risk: 89,
                  steps: 4,
                  target: "Tenant-wide",
                },
                {
                  name: "MFA Bypass Chain",
                  risk: 87,
                  steps: 5,
                  target: "VIP Accounts",
                },
              ].map((path, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-medium">
                        {path.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {path.steps} steps • Target: {path.target}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-red-600">
                        {path.risk}%
                      </span>
                      <button
                        onClick={() => setShowPathModal(true)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === "permissions" && (
          <div className="max-w-4xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Toxic Permissions
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {MOCK_AI_EXPLANATIONS.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        exp.severity === "critical"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    ></span>
                    <h3 className="text-gray-900 dark:text-white font-medium">
                      {exp.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="max-w-4xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Active Alerts (3)
            </h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-2 h-2 mt-2 rounded-full ${
                        alert.severity === "critical"
                          ? "bg-red-500"
                          : alert.severity === "high"
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                      }`}
                    ></span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-900 dark:text-white font-medium">
                          {alert.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk History Tab */}
        {activeTab === "history" && (
          <div className="max-w-4xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Risk History
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Risk Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Events
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {riskHistory.map((day, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {day.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-red-600">
                          {day.score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            day.change.startsWith("+")
                              ? "text-red-500"
                              : day.change.startsWith("-")
                                ? "text-green-500"
                                : "text-gray-500"
                          }
                        >
                          {day.change}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {day.events} alerts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-4xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Settings
            </h2>
            <div className="space-y-6">
              {settings.map((section, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {section.category}
                  </h3>
                  <div className="space-y-4">
                    {section.items.map((item, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.name}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <RemediationModal
        isOpen={showRemediationModal}
        onClose={() => {
          setShowRemediationModal(false);
          setRemediationStatus(null);
        }}
        action={selectedAction}
        severity="critical"
        status={remediationStatus}
        onConfirm={async () => {
          setRemediationStatus("Connecting to Azure...");

          try {
            const response = await fetch(
              `${API_BASE_URL}/api/Remediation/trigger-remediation`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: selectedAction,
                  timestamp: new Date().toISOString(),
                  context: {
                    source: "emergency_button",
                    user: MOCK_USER_SUMMARY.userName,
                    riskScore: MOCK_USER_SUMMARY.riskScore,
                  },
                }),
              },
            );

            if (!response.ok) {
              throw new Error(`Remediation failed: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
              setRemediationStatus("✅ Remediation completed successfully!");
              console.log("Remediation result:", result);
            } else {
              throw new Error(result.message || "Remediation failed");
            }
          } catch (err) {
            console.error("Error triggering remediation:", err);
            setRemediationStatus(
              `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`,
            );
            throw err;
          }
        }}
      />

      <PathDetailsModal
        isOpen={showPathModal}
        onClose={() => setShowPathModal(false)}
        pathName="Nested Group Escalation Path"
      />
    </div>
  );
}