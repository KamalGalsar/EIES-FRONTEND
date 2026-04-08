//pages/IdentityGraph.tsx
import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Position,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";

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
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const [riskCounts, setRiskCounts] = useState({ high: 0, medium: 0, low: 0 });
  const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

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
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        style={{ background: '#0B1220', height: '100%' }}
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
        />
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










// Old test code for reference - not part of current implementation
// import { useEffect, useState } from "react";
// import ReactFlow, { Background, Controls } from "reactflow";
// import "reactflow/dist/style.css";

// type NodeType = {
//   id: string;
//   data: { label: string };
//   position: { x: number; y: number };
// };

// type EdgeType = {
//   id: string;
//   source: string;
//   target: string;
// };

// export default function IdentityGraph() {
//   const [nodes, setNodes] = useState<NodeType[]>([]);
//   const [edges, setEdges] = useState<EdgeType[]>([]);

//   useEffect(() => {
//     fetch("http://localhost:5268/api/entra/graph") 
//       .then(res => res.json())
//       .then(data => {
//         const generatedNodes = data.nodes.map((n: any, index: number) => ({
//           id: n.id,
//           data: { label: `${n.label} (${n.type})` },
//           position: {
//             x: (index % 5) * 250,
//             y: Math.floor(index / 5) * 150
//           }
//         }));

//         const generatedEdges = data.edges.map((e: any, index: number) => ({
//           id: `e${index}`,
//           source: e.from,
//           target: e.to
//         }));

//         setNodes(generatedNodes);
//         setEdges(generatedEdges);
//       });
//   }, []);

//   return (
//     <div style={{ height: "90vh" }}>
//       <ReactFlow nodes={nodes} edges={edges}>
//         <Background />
//         <Controls />
//       </ReactFlow>
//     </div>
//   );
// }