// Frontend/src/components/graph/BlastRadiusGraph.tsx

import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MarkerType, 
  Position
} from 'reactflow';
// Import types separately for Vite compatibility
import type { Node, Edge, ReactFlowInstance } from 'reactflow';
import 'reactflow/dist/style.css';
import { ShieldAlert, Info } from 'lucide-react';
import api from '../../services/api';

const NODE_WIDTH = 180;

function getNodeStyle(type: string, riskClass: number, isStart: boolean) {
  const base = {
    padding: '10px 15px',
    borderRadius: '8px',
    width: NODE_WIDTH,
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    border: '2px solid'
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

  const LEVEL_HEIGHT = 180;
  const TOP_PADDING = 100;

  const rfNodes: Node[] = rawNodes.map((node) => {
    const lvl = depth.get(node.id) ?? 0;
    const idsAtLvl = byLevel.get(lvl) || [];
    const index = idsAtLvl.indexOf(node.id);
    
    const gap = 260;
    const totalWidth = (idsAtLvl.length - 1) * gap;
    const x = (index * gap) - (totalWidth / 2) + 400;
    const y = TOP_PADDING + (lvl * LEVEL_HEIGHT); // Pointing DOWN to the Gain
    
    const width = node.type === 'subscription' ? 200 : NODE_WIDTH;
    return {
      id: node.id,
      data: { label: node.label },
      position: { x: x - width / 2, y: y },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      style: getNodeStyle(node.type, node.riskClass, node.isStartNode),
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
  const [scope, setScope] = useState<"direct" | "transitive">("transitive");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [impact, setImpact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const flowInstance = useRef<ReactFlowInstance | null>(null);

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = scope === "transitive" 
        ? `/Toxic/blast-radius/${nodeId}` 
        : `/Toxic/blast-radius-direct/${nodeId}`;
        
      const response = await api.get(endpoint);
      const { nodes: rawNodes, edges: rawEdges, impact: impactData } = response.data;
      
      const { nodes: rfNodes, edges: rfEdges } = buildLayout(rawNodes, rawEdges);
      setNodes(rfNodes);
      setEdges(rfEdges);
      setImpact(impactData);
      
      setTimeout(() => {
        if (flowInstance.current) {
          flowInstance.current.fitView({ padding: 0.2, duration: 800 });
        }
      }, 100);
    } catch (error) {
      console.error("Failed to fetch blast radius:", error);
    } finally {
      setLoading(false);
    }
  }, [nodeId, scope]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#0F172A] border border-slate-800 rounded-lg overflow-hidden">
      <div className="w-full md:w-64 border-r border-slate-800 p-6 flex flex-col gap-6 bg-[#0B1120]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Potential Impact
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] text-slate-400 mb-1 uppercase">Users</div>
            <div className="text-xl font-bold text-white">{impact?.users ?? 0}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] text-slate-400 mb-1 uppercase">Groups</div>
            <div className="text-xl font-bold text-white">{impact?.groups ?? 0}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] text-slate-400 mb-1 uppercase">Apps</div>
            <div className="text-xl font-bold text-white">{impact?.apps ?? 0}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] text-slate-400 mb-1 uppercase">Critical</div>
            <div className="text-xl font-bold text-red-500">{impact?.critical ?? 0}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Analysis Scope</div>
          <div className="flex bg-slate-900/80 p-1 rounded-md border border-slate-700">
            <button 
              onClick={() => setScope("direct")}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded ${scope === "direct" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Direct
            </button>
            <button 
              onClick={() => setScope("transitive")}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded ${scope === "transitive" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Transitive
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-950">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium animate-pulse">Analyzing exposure paths...</p>
            </div>
          </div>
        )}
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={(inst) => { flowInstance.current = inst; }}
          fitView
          minZoom={0.1}
          maxZoom={2}
          className="bg-transparent"
        >
          <Background color="#1E293B" gap={20} size={1} />
          <Controls 
            position="bottom-left"
            showInteractive={true}
            className="react-flow-custom-controls"
          />
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
        
        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-slate-900/90 border border-slate-700 p-1.5 rounded-full shadow-2xl backdrop-blur-md">
           <div className="px-3 py-1 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase">User/Member</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase">Azure Role</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase">Subscription</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}