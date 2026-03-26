// src/types/users.ts

export interface UserRiskNode {
  id: string;
  name: string;
  type: 'user' | 'group' | 'role' | 'app' | 'permission' | 'resource' | 'blast';
  risk?: number;
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
  description?: string;
  children?: UserRiskNode[];
}

export interface UserRiskSummary {
  userId: string;
  userName: string;
  riskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  toxicPermissionCount: number;
  blastRadiusImpact: string;
  lastAnalyzed: string;
}

export interface AiExplanation {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface RemediationAction {
  id: string;
  label: string;
  type: 'pim' | 'group' | 'permission' | 'ca';
  severity: 'critical' | 'high' | 'medium';
}

export interface GraphUser {
  id: string;
  displayName: string;
  userPrincipalName: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  risk?: string;
  severity?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  // other properties
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  provider: string;
  createdAt: string;   // ISO date string
}

// Mock Data
export const MOCK_USER_SUMMARY: UserRiskSummary = {
  userId: 'user-123',
  userName: 'OpsEngineer1',
  riskScore: 87,
  riskLevel: 'CRITICAL',
  toxicPermissionCount: 3,
  blastRadiusImpact: '3 Subscriptions, 140+ Resources, Tenant-wide risk',
  lastAnalyzed: '2026-02-23 14:30:22'
};

export const MOCK_RISK_NODES: UserRiskNode[] = [
  {
    id: 'user',
    name: 'OpsEngineer1',
    type: 'user',
    risk: 87,
    severity: 'Critical',
    description: 'Identity with high-risk privileges',
    children: [
      {
        id: 'branch1',
        name: 'Nested Group Escalation',
        type: 'group',
        risk: 78,
        children: [
          { id: 'group-a', name: 'Group A', type: 'group', risk: 45 },
          { id: 'group-b', name: 'Group B', type: 'group', risk: 62 },
          { id: 'group-c', name: 'Group C', type: 'group', risk: 78 },
          { id: 'sub-owner', name: 'Subscription Owner', type: 'role', risk: 92 },
          { id: 'subs', name: '3 Azure Subscriptions', type: 'resource' },
          { id: 'resources', name: '140+ Resources', type: 'resource' },
          { id: 'prod-blast', name: 'Production Workloads', type: 'blast', risk: 96 }
        ]
      },
      {
        id: 'branch2',
        name: 'Toxic Service Principal',
        type: 'app',
        risk: 84,
        children: [
          { id: 'sp-prod', name: 'SP_App_Prod', type: 'app', risk: 84 },
          { id: 'perm-dir', name: 'Directory.ReadWrite.All', type: 'permission' },
          { id: 'perm-app', name: 'AppRoleAssignment.ReadWrite.All', type: 'permission' },
          { id: 'admin-consent', name: 'Admin Consent Capability', type: 'permission', risk: 95 },
          { id: 'tenant-blast', name: 'Tenant-wide Identity Exposure', type: 'blast', risk: 99 }
        ]
      },
      {
        id: 'branch3',
        name: 'MFA Bypass Vector',
        type: 'role',
        risk: 72,
        children: [
          { id: 'helpdesk', name: 'Helpdesk Role', type: 'role', risk: 72 },
          { id: 'mfa-reset', name: 'Reset MFA Permission', type: 'permission' },
          { id: 'modify-attrs', name: 'Modify User Attributes', type: 'permission' },
          { id: 'ceo', name: 'CEO', type: 'user', risk: 91 },
          { id: 'cfo', name: 'CFO', type: 'user', risk: 89 },
          { id: 'cto', name: 'CTO', type: 'user', risk: 88 },
          { id: 'takeover-blast', name: 'Full Identity Takeover', type: 'blast', risk: 97 }
        ]
      }
    ]
  }
];

export const MOCK_AI_EXPLANATIONS: AiExplanation[] = [
  {
    id: '1',
    title: 'Deep Privilege Inheritance Chain',
    description: '4-level nested group escalation path leading to Subscription Owner',
    severity: 'critical'
  },
  {
    id: '2',
    title: 'Toxic Permission Combination',
    description: 'Directory.ReadWrite.All + AppRoleAssignment.ReadWrite.All enables backdoor creation',
    severity: 'critical'
  },
  {
    id: '3',
    title: 'MFA Bypass Vector',
    description: 'Helpdesk role can reset MFA for VIP accounts (CEO, CFO, CTO)',
    severity: 'high'
  }
];

export const MOCK_REMEDIATIONS: RemediationAction[] = [
  { id: '1', label: 'Convert to PIM', type: 'pim', severity: 'critical' },
  { id: '2', label: 'Remove from Group B', type: 'group', severity: 'high' },
  { id: '3', label: 'Revoke High-Risk App Permissions', type: 'permission', severity: 'critical' },
  { id: '4', label: 'Enforce Conditional Access', type: 'ca', severity: 'medium' }
];