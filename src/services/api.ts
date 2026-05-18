// Frontend/src/services/api.ts

import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5268';
const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if it's a 401 and we haven't retried yet, and avoid looping on the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_ROOT}/api/auth/refresh`, JSON.stringify(refreshToken), {
            headers: { 'Content-Type': 'application/json' }
          });
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          
          // Update tokens in storage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Update authorization header and retry request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear session and force login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("userProvider");
        localStorage.removeItem("userRole"); 
        localStorage.removeItem("userPhoto");
        sessionStorage.clear();
        
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  getAll: () => api.get('/admin/users'),
  getCurrent: () => api.get('/admin/me'),
  getAvailableUsers: () => api.get('/admin/available-users'),
  create: (data: { email: string; role: string; scope: string }) =>
    api.post('/admin/users', data),
  update: (id: number, data: Partial<{ role: string; scope: string; status: string }>) =>
    api.put(`/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/admin/users/${id}`),
};

// Toxic API
export const toxicApi = {
  getBlastRadiusGraph: (nodeId: string) =>
    api.get(`/toxic/blast-radius-graph/${nodeId}`),
};

// GNN API - New endpoints for EIES
export const gnnApi = {
  // Health check
  health: () => api.get('/gnn/health'),

  // Risk prediction
  predict: (graphData?: object) =>
    graphData ? api.post('/gnn/predict', graphData) : api.post('/gnn/predict'),

  // Blast radius with path visualization
  predictBlastRadius: (sourceNodeId: string, graphData?: object) =>
    api.post('/gnn/blast-radius', { sourceNodeId, graph: graphData }),

  // Remediation
  createRemediation: (data: RemediationRequest) =>
    api.post('/gnn/remediate', data),

  getPendingRemediations: () =>
    api.get('/gnn/remediate/pending'),

  approveRemediation: (requestId: string, approvedBy: string) =>
    api.post(`/gnn/remediate/${requestId}/approve?approvedBy=${approvedBy}`),

  executeRemediation: (requestId: string) =>
    api.post(`/gnn/remediate/${requestId}/execute`),

  getRemediationLogs: (limit: number = 100) =>
    api.get(`/gnn/remediate/log?limit=${limit}`),

  simulateRemediation: (data: RemediationRequest) =>
    api.post('/gnn/simulate-remediate', data),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: { sessionTimeoutMinutes: number }) => api.put('/settings', data),
};

export interface RemediationRequest {
  nodeIds: string[];
  actions: string[];
  severity: string;
  reason: string;
  requestedBy: string;
  autoApprove?: boolean;
}

export interface BlastRadiusResult {
  source_node_id: string;
  source_display_name: string;
  source_node_type: string;
  severity_score: number;
  max_hops: number;
  affected_count: number;
  attack_paths: AttackPath[];
  impact: ResourceImpact;
  visualization: VisualizationData;
}

export interface AttackPath {
  path_id: number;
  nodes: string[];
  edge_types: string[];
  risk_score: number;
  hop_count: number;
}

export interface ResourceImpact {
  users: number;
  groups: number;
  roles: number;
  servicePrincipals: number;
  applications: number;
  devices: number;
  total: number;
  critical: number;
  high: number;
}

export interface VisualizationData {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
}

export interface VisualizationNode {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    node_type: string;
    risk_score: number;
    is_source: boolean;
  };
  type: string;
}

export interface VisualizationEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  label: string;
  style?: {
    stroke: string;
    strokeWidth: number;
  };
}

export default api;
