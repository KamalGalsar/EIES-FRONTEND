// components/Features.tsx
function Icon({ path }: { path: string }) {
  return (
    <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}

const FEATURES = [
  { 
    title: "Identity Graph Construction", 
    desc: "Builds a multi-level graph of users, groups, roles, apps, and service principals.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" // Network/graph icon
  },
  { 
    title: "GNN-Based Risk Modeling", 
    desc: "Finds hidden privilege paths, shadow admins, lateral movement, and risky overlaps.",
    icon: "M6 4l4 4-4 4-4-4 4-4z M18 4l4 4-4 4-4-4 4-4z M6 16l4 4-4 4-4-4 4-4z M18 16l4 4-4 4-4-4 4-4z M10 8l4 4-4 4-4-4 4-4z M14 8l4 4-4 4-4-4 4-4z M10 12l4 4-4 4-4-4 4-4z" // Complete neural network grid
  },
  { 
    title: "Blast-Radius Forecasting", 
    desc: "Simulates attack paths to predict downstream impact.",
    icon: "M3 12h4l3-9 4 18 3-9h4" // Wave/ripple effect
  },
  { 
    title: "Toxic Permission Detection", 
    desc: "Surfaces dangerous permission combos and legacy roles enabling escalation.",
    icon: "M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" // Warning/exclamation in circle
  },
  { 
    title: "Automated Remediation", 
    desc: "Fixes misconfigurations via Azure Functions + PIM + Conditional Access.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" // Checkmark in circle
  },
  { 
    title: "Observability First", 
    desc: "App Insights & SIEM hooks to track remediation impact.",
    icon: "M4 7h16M4 12h10M4 17h6 M15 17l2 2 4-4" // Bars with check
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 bg-white text-black dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Built for real identity threats
          </h2>
          <p className="mt-3 text-black/70 dark:text-white/70">
            From detection to remediation—Azure‑native, privacy‑first.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div 
              key={f.title} 
              className="group rounded-xl border border-black/10 bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 dark:bg-blue-900/20 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Icon path={f.icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="mt-1 text-sm text-black/70 dark:text-white/70 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}