// Frontend/src/pages/users/IdentityGraph.tsx

import { useEffect, useState } from "react";
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
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Download, Search, X } from "lucide-react";
import { exportGraphAsPng } from "../utils/graphExport";

type NodeType = Node & {
  data: {
    label: string;
    type: string;
    risk?: string;
    severity?: string;
  };
};

type EdgeType = Edge & {
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
  markerEnd?: {
    type: MarkerType;
    color?: string;
  };
};

export default function IdentityGraph() {
  return (
    <ReactFlowProvider>
      <IdentityGraphContent />
    </ReactFlowProvider>
  );
}

function IdentityGraphContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeType>([]);
  const [riskCounts, setRiskCounts] = useState({ high: 0, medium: 0, low: 0 });
  const [isLocked, setIsLocked] = useState(true); // true = nodes locked (cannot be dragged)

  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());

  const { setCenter, fitView } = useReactFlow();
  const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

  // Pathfinding logic
  const findPathToRoot = (startNodeId: string) => {
    const pathNodes = new Set<string>([startNodeId]);
    const pathEdges = new Set<string>();
    const queue = [startNodeId];
    const visited = new Set<string>([startNodeId]);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
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
    fetch(`${BACKEND}/api/entra/graph`)
      .then(res => res.json())
      .then(data => {
        // Define all nodes with clear IDs
        const tenant = { id: "tenant-1", label: "Default Directory", type: "tenant" };
        const level1Group = { id: "group-1", label: "Level-1-Group", type: "group" };
        const level2Group = { id: "group-2", label: "Level-2-Group", type: "group" };
        console.log('Graph data loaded:', data);//for error fix
        // Users
        const admin = { id: "user-3", label: "Admin User", type: "user", isRisky: false };
        const risky = { id: "user-4", label: "Risky User", type: "user", isRisky: true };
        const cloudAdmin = { id: "user-6", label: "Cloud Admin", type: "user", isIsolated: true };
        const kamal = { id: "user-1", label: "Kamal Galsar", type: "user" };
        const dev = { id: "user-2", label: "Dev User", type: "user" };
        const basic = { id: "user-5", label: "Basic User", type: "user" };

        const newNodes: NodeType[] = [];
        const newEdges: EdgeType[] = [];

        // Track risk counts
        let highRisk = 0;
        let mediumRisk = 0;
        let lowRisk = 0;

        // VERTICAL LAYOUT

        // 1. TENANT - Top center
        newNodes.push({
          id: tenant.id,
          data: {
            label: tenant.label,
            type: 'Tenant',
            risk: '92%',
            severity: 'High'
          },
          position: { x: 500, y: 50 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: '#1E3A8A',
            color: 'white',
            border: '2px solid #3B82F6',
            boxShadow: '0 0 15px #3B82F6',
            borderRadius: '8px',
            padding: '15px 25px',
            width: 200,
            fontSize: '14px',
            fontWeight: 'bold',
          },
        });

        // 2. LEFT BRANCH - Group Hierarchy (Left side, vertical)
        // Level-1-Group
        newNodes.push({
          id: level1Group.id,
          data: {
            label: level1Group.label,
            type: 'Group',
            risk: '67%'
          },
          position: { x: 200, y: 180 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: '#0E7490',
            color: 'white',
            border: '2px solid #06B6D4',
            boxShadow: '0 0 10px #06B6D4',
            borderRadius: '8px',
            padding: '12px 20px',
            width: 160,
            fontSize: '13px',
          },
        });

        // Connect Tenant to Level-1-Group
        newEdges.push({
          id: `tenant-to-level1`,
          source: tenant.id,
          target: level1Group.id,
          animated: true,
          style: {
            stroke: '#3B82F6',
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3B82F6'
          },
        });

        // Admin User (positioned left of Level-1-Group)
        newNodes.push({
          id: admin.id,
          data: {
            label: admin.label,
            type: 'User',
            risk: '34%'
          },
          position: { x: 50, y: 300 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: '#1E3A8A',
            color: 'white',
            border: '2px solid #3B82F6',
            borderRadius: '20px',
            padding: '8px 15px',
            width: 140,
            fontSize: '12px',
          },
        });

        newEdges.push({
          id: `level1-to-admin`,
          source: level1Group.id,
          target: admin.id,
          animated: true,
          style: {
            stroke: '#3B82F6',
            strokeWidth: 1.5
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3B82F6'
          },
        });

        // Level-2-Group
        newNodes.push({
          id: level2Group.id,
          data: {
            label: level2Group.label,
            type: 'Group',
            risk: '78%'
          },
          position: { x: 250, y: 320 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: '#0E7490',
            color: 'white',
            border: '2px solid #06B6D4',
            boxShadow: '0 0 10px #06B6D4',
            borderRadius: '8px',
            padding: '12px 20px',
            width: 160,
            fontSize: '13px',
          },
        });

        newEdges.push({
          id: `level1-to-level2`,
          source: level1Group.id,
          target: level2Group.id,
          animated: true,
          style: {
            stroke: '#06B6D4',
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#06B6D4'
          },
        });

        // Risky User
        newNodes.push({
          id: risky.id,
          data: {
            label: risky.label,
            type: 'User',
            risk: '96%',
            severity: 'Critical'
          },
          position: { x: 250, y: 470 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: '#7F1D1D',
            color: 'white',
            border: '2px solid #EF4444',
            boxShadow: '0 0 15px #EF4444',
            borderRadius: '20px',
            padding: '8px 15px',
            width: 140,
            fontSize: '12px',
          },
        });

        newEdges.push({
          id: `level2-to-risky`,
          source: level2Group.id,
          target: risky.id,
          animated: true,
          style: {
            stroke: '#EF4444',
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#EF4444'
          },
        });

        // 3. MIDDLE BRANCH - Isolated Cloud Admin
        newNodes.push({
          id: cloudAdmin.id,
          data: {
            label: cloudAdmin.label,
            type: 'User (Isolated)',
            risk: '45%'
          },
          position: { x: 500, y: 300 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: '#B45309',
            color: 'white',
            border: '2px solid #F59E0B',
            boxShadow: '0 0 10px #F59E0B',
            borderRadius: '20px',
            padding: '8px 15px',
            width: 160,
            fontSize: '12px',
          },
        });

        newEdges.push({
          id: `tenant-to-cloud-admin`,
          source: tenant.id,
          target: cloudAdmin.id,
          animated: true,
          style: {
            stroke: '#F59E0B',
            strokeWidth: 2,
            strokeDasharray: '5,5'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#F59E0B'
          },
        });

        // 4. RIGHT BRANCH - Direct users
        // Kamal Galsar
        newNodes.push({
          id: kamal.id,
          data: {
            label: kamal.label,
            type: 'User',
            risk: '23%'
          },
          position: { x: 750, y: 180 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: '#1E3A8A',
            color: 'white',
            border: '2px solid #3B82F6',
            borderRadius: '20px',
            padding: '8px 15px',
            width: 140,
            fontSize: '12px',
          },
        });

        newEdges.push({
          id: `tenant-to-kamal`,
          source: tenant.id,
          target: kamal.id,
          animated: true,
          style: {
            stroke: '#3B82F6',
            strokeWidth: 1.5
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3B82F6'
          },
        });

        // Dev User
        newNodes.push({
          id: dev.id,
          data: {
            label: dev.label,
            type: 'User',
            risk: '45%'
          },
          position: { x: 750, y: 320 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: '#1E3A8A',
            color: 'white',
            border: '2px solid #3B82F6',
            borderRadius: '20px',
            padding: '8px 15px',
            width: 140,
            fontSize: '12px',
          },
        });

        newEdges.push({
          id: `tenant-to-dev`,
          source: tenant.id,
          target: dev.id,
          animated: true,
          style: {
            stroke: '#3B82F6',
            strokeWidth: 1.5
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3B82F6'
          },
        });

        // Basic User
        newNodes.push({
          id: basic.id,
          data: {
            label: basic.label,
            type: 'User',
            risk: '12%'
          },
          position: { x: 750, y: 460 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: '#1E3A8A',
            color: 'white',
            border: '2px solid #3B82F6',
            borderRadius: '20px',
            padding: '8px 15px',
            width: 140,
            fontSize: '12px',
          },
        });

        newEdges.push({
          id: `tenant-to-basic`,
          source: tenant.id,
          target: basic.id,
          animated: true,
          style: {
            stroke: '#3B82F6',
            strokeWidth: 1.5
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3B82F6'
          },
        });

        setNodes(newNodes);

        // Calculate risk counts based on actual node data
        newNodes.forEach(node => {
          if (node.data.risk) {
            const riskValue = parseInt(node.data.risk.replace('%', ''));
            if (riskValue >= 70) {
              highRisk++;
            } else if (riskValue >= 40) {
              mediumRisk++;
            } else {
              lowRisk++;
            }
          }
        });

        setRiskCounts({
          high: highRisk,
          medium: mediumRisk,
          low: lowRisk
        });

        setEdges(newEdges);
      });
  }, []);

  return (
    <div className="h-[90vh] w-full bg-[#0B1220] rounded-lg overflow-hidden border border-gray-700 relative">
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
                    <div className={`w-2 h-2 rounded-full ${n.data.type === 'user' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                    {(n.data as any).label}
                    <span className="text-[10px] text-gray-500 ml-auto uppercase tracking-wider">{(n.data as any).type}</span>
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
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        nodesDraggable={!isLocked}
        nodesFocusable={!isLocked}
        style={{ background: '#0B1220', height: '100%' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E293B" gap={16} />
        <Controls
          style={{
            background: '#1E293B',
            color: 'white',
            border: '1px solid #334155',
            bottom: '20px',
            right: '20px',
            left: 'auto',
          }}
          showInteractive={false}
        >
          <ControlButton
            onClick={() => setIsLocked(prev => !prev)}
            title={isLocked ? 'Unlock nodes — drag to reposition' : 'Lock node positions'}
          >
            <span style={{ fontSize: '11px' }}>{isLocked ? '🔒' : '🔓'}</span>
          </ControlButton>
          <ControlButton
            onClick={() => exportGraphAsPng(nodes, 'EIES-Identity-Graph.png')}
            title="Export as PNG"
          >
            <Download style={{ width: 12, height: 12, color: '#94a3b8' }} />
          </ControlButton>
        </Controls>
      </ReactFlow>

      {/* Legend - Matching Users page theme */}
      <div className="absolute bottom-5 left-5 bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg border border-gray-700 shadow-xl z-10">
        <div className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Legend
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1E3A8A] border border-[#3B82F6] rounded shadow-lg shadow-blue-500/20"></div>
            <span className="text-gray-300">Default Directory (Tenant)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#0E7490] border border-[#06B6D4] rounded shadow-lg shadow-cyan-500/20"></div>
            <span className="text-gray-300">Level-1-Group</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#0E7490] border border-[#06B6D4] rounded shadow-lg shadow-cyan-500/20"></div>
            <span className="text-gray-300">Level-2-Group</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1E3A8A] border border-[#3B82F6] rounded-full shadow-lg shadow-blue-500/20"></div>
            <span className="text-gray-300">Regular User</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#7F1D1D] border border-[#EF4444] rounded-full shadow-lg shadow-red-500/20"></div>
            <span className="text-gray-300">Risky User</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#B45309] border border-[#F59E0B] rounded-full shadow-lg shadow-orange-500/20"></div>
            <span className="text-gray-300">Isolated User (Cloud Admin)</span>
          </div>
        </div>
      </div>

      {/* Risk Summary - Now shows accurate counts based on actual node data */}
      <div className="absolute top-5 right-5 bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700 z-10">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">High Risk (≥70%):</span>
            <span className="text-red-400 font-bold">{riskCounts.high}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Medium (40-69%):</span>
            <span className="text-yellow-400 font-bold">{riskCounts.medium}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Low (&lt;40%):</span>
            <span className="text-green-400 font-bold">{riskCounts.low}</span>
          </div>
        </div>
      </div>
    </div>
  );
}