// Frontend/src/types/admin.ts

export const ROLE_LEVELS = {
  CEO: 1,
  CTO: 2,
  DIRECTOR: 3,
  DIRECTORUK: 3,
  SrVP: 4,
  BU_HEAD: 4,
  VPTECH: 4,
  ADMIN_MANAGER: 5,
  SECURITY_ADMIN: 6,
  ANALYST: 7
} as const;

export type RoleType = keyof typeof ROLE_LEVELS;

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: RoleType;
  roleLevel: number;
  scope: string;
  status: 'active' | 'inactive' | 'locked';
  createdBy: string;
  immutable?: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: RoleType;
  roleLevel: number;
}

export const MOCK_ADMINS: AdminUser[] = [
  {
    id: 1,
    name: "Bhavesh Goswami",
    email: "bhavesh@cloudthat.com",
    role: "CEO",
    roleLevel: 1,
    scope: "Global",
    status: "active",
    createdBy: "System",
    immutable: true,
    riskLevel: "low"
  },
  {
    id: 2,
    name: "Prarthit Mehta",
    email: "prarthit@cloudthat.com",
    role: "CTO",
    roleLevel: 2,
    scope: "Consulting",
    status: "active",
    createdBy: "Bhavesh Goswami",
    riskLevel: "low"
  },
  {
    id: 3,
    name: "Sachin Chokshi",
    email: "sachinc@cloudthat.com",
    role: "DIRECTORUK",
    roleLevel: 3,
    scope: "General",
    status: "active",
    createdBy: "Prarthit Mehta",
    riskLevel: "medium"
  },
  {
    id: 4,
    name: "Nanda Kishore",
    email: "nanda@cloudthat.com",
    role: "SrVP",
    roleLevel: 4,
    scope: "General",
    status: "active",
    createdBy: "Prarthit Mehta",
    riskLevel: "low"
  },
  {
    id: 5,
    name: "Lakhan Kriplani",
    email: "lakhan@cloudthat.com",
    role: "VPTECH",
    roleLevel: 4,
    scope: "General",
    status: "active",
    createdBy: "Bhavesh Goswami",
    riskLevel: "medium"
  }
];

export const ROLE_HIERARCHY = [
  {
    role: "CEO",
    level: 1,
    children: [
      {
        role: "CTO",
        level: 2,
        children: [
          { role: "DIRECTOR", level: 3, children: [] },
          { role: "DIRECTORUK", level: 3, children: [] }
        ]
      },
      {
        role: "SrVP",
        level: 4,
        children: []
      },
      {
        role: "BU_HEAD",
        level: 4,
        children: []
      },
      {
        role: "VPTECH",
        level: 4,
        children: []
      },
      {
        role: "ADMIN_MANAGER",
        level: 5,
        children: []
      },
      {
        role: "SECURITY_ADMIN",
        level: 6,
        children: []
      },
      {
        role: "ANALYST",
        level: 7,
        children: []
      }
    ]
  }
];

export const CURRENT_USER: CurrentUser = {
  id: 1,
  name: "Bhavesh Goswami",
  email: "bhavesh@cloudthat.com",
  role: "CEO",
  roleLevel: 1
};

export function canModify(currentUser: CurrentUser, targetUser: AdminUser): boolean {
  if (targetUser.immutable) return false;
  if (targetUser.role === 'CEO') return false;
  return currentUser.roleLevel < targetUser.roleLevel;
}