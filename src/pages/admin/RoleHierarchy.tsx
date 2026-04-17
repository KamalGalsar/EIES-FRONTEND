// Frontend/src/pages/admin/RoleHierarchy.tsx

import { useState } from "react";
import { ChevronDown, ChevronRight, Shield, Users, Briefcase, Globe, ChevronUp } from "lucide-react";

interface RoleNode {
  name: string;
  level: number;
  description: string;
  permissions: string[];
  children?: RoleNode[];
}

const roleTree: RoleNode[] = [
  {
    name: "CEO",
    level: 1,
    description: "Chief Executive Officer",
    permissions: ["Full System Access", "All Admin Rights", "Unrestricted Governance"],
    children: [
      {
        name: "CTO",
        level: 2,
        description: "Chief Technology Officer",
        permissions: ["Technology Strategy", "Infrastructure Oversight", "Security Policies"],
        children: [
          {
            name: "Director",
            level: 3,
            description: "Operations / General Director",
            permissions: ["Operational Controls", "Team Management", "Budget Approvals"],
          },
          {
            name: "Director (UK)",
            level: 3,
            description: "UK Operations Director",
            permissions: ["UK Regional Controls", "Compliance (UK)", "Local Admin"],
          },
        ],
      },
      {
        name: "BU Head",
        level: 2,
        description: "Business Unit Head",
        permissions: ["Regional Operations", "Resource Allocation", "Local Policies"],
        children: [
          {
            name: "Admin Manager",
            level: 3,
            description: "Administrative Manager",
            permissions: ["Admin User Management", "Role Assignments", "Access Reviews"],
            children: [
              {
                name: "Security Admin",
                level: 4,
                description: "Security Administrator",
                permissions: ["Security Configurations", "Incident Response", "Audit Logs"],
              },
              {
                name: "Analyst",
                level: 4,
                description: "Security Analyst",
                permissions: ["Read-only Access", "Report Generation", "Alert Monitoring"],
              },
            ],
          },
        ],
      },
    ],
  },
];

const levelColors: Record<number, { bg: string; border: string; text: string; lightBg: string }> = {
  1: { bg: "bg-yellow-100 dark:bg-yellow-950/50", border: "border-yellow-300 dark:border-yellow-800", text: "text-yellow-800 dark:text-yellow-300", lightBg: "bg-yellow-50 dark:bg-yellow-950/20" },
  2: { bg: "bg-blue-100 dark:bg-blue-950/50", border: "border-blue-300 dark:border-blue-800", text: "text-blue-800 dark:text-blue-300", lightBg: "bg-blue-50 dark:bg-blue-950/20" },
  3: { bg: "bg-purple-100 dark:bg-purple-950/50", border: "border-purple-300 dark:border-purple-800", text: "text-purple-800 dark:text-purple-300", lightBg: "bg-purple-50 dark:bg-purple-950/20" },
  4: { bg: "bg-green-100 dark:bg-green-950/50", border: "border-green-300 dark:border-green-800", text: "text-green-800 dark:text-green-300", lightBg: "bg-green-50 dark:bg-green-950/20" },
  5: { bg: "bg-gray-100 dark:bg-gray-800", border: "border-gray-300 dark:border-gray-700", text: "text-gray-800 dark:text-gray-300", lightBg: "bg-gray-50 dark:bg-gray-800/50" },
};

function RoleNodeItem({ node, level = 1 }: { node: RoleNode; level?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const colors = levelColors[level] || levelColors[5];

  return (
    <div className="relative mb-3">
      <div
        className={`
          relative rounded-xl border-2 overflow-hidden transition-all hover:shadow-md
          ${colors.bg} ${colors.border}
        `}
      >
        {/* Header - always visible */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {hasChildren && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                <Shield className={`w-5 h-5 ${colors.text} flex-shrink-0`} />
                <span className={`font-bold text-base sm:text-lg ${colors.text} truncate`}>{node.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-0.5 rounded-full">
                  Lvl {level}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 ml-6 sm:ml-8">{node.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2 ml-6 sm:ml-8">
                {node.permissions.map((perm, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs text-gray-400 uppercase">Access</span>
              <p className="text-sm font-semibold">{node.permissions.length} perms</p>
            </div>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-4 sm:ml-8 mt-2 pl-2 border-l-2 border-dashed border-gray-300 dark:border-gray-700 space-y-2">
          {node.children!.map((child, idx) => (
            <RoleNodeItem key={idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoleHierarchy() {
  const [showAll, setShowAll] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Hierarchy</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Briefcase className="w-4 h-4" />
          <span>Inheritance Chain • Privilege Levels</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="space-y-2">
          {roleTree.map((root, idx) => (
            <RoleNodeItem key={idx} node={root} level={1} />
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-gray-900 dark:text-white">Role Inheritance Rules</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span> CEO</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> C-Level</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 rounded-full"></span> Director</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Manager</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-500 rounded-full"></span> Analyst</span>
          </div>
        </div>
      </div>
    </div>
  );
}