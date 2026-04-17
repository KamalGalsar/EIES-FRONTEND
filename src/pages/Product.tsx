// Frontend/src/pages/users/Product.tsx

export default function Product() {
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-300 mb-4 backdrop-blur-sm border border-blue-500/20 hover:scale-105 transition-transform duration-300">
            Azure‑native • Identity Security
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            EIES Product
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2">
            AI-powered identity compromise prediction &amp; blast-radius analysis for Azure Entra ID
          </p>
        </div>

        {/* 5 Major Functions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 sm:mb-20">
          {/* First row - 3 boxes (auto stack on mobile) */}
          <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 border border-gray-200 dark:border-gray-700 hover:-translate-y-1 transition-all duration-300 w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">1. Identity Graph Construction</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Builds a multi-level graph of users, apps, groups, nested groups, and roles. Maps privilege inheritance and trust relationships across your Entra tenant.
            </p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">Graph DB • Entra ID</span>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 border border-gray-200 dark:border-gray-700 hover:-translate-y-1 transition-all duration-300 w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">2. GNN-Based Risk Modelling</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Uses Graph Neural Networks to detect hidden privilege paths, shadow admins, lateral movement opportunities, and toxic permission overlaps.
            </p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">GNN • PyTorch</span>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-red-500/20 border border-gray-200 dark:border-gray-700 hover:-translate-y-1 transition-all duration-300 w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">3. Blast-Radius Forecasting</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Attack-path simulation that answers: "If this identity is compromised, what systems will fall?" Predicts downstream impact across subscriptions and resources.
            </p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-mono bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded">Attack Simulation</span>
            </div>
          </div>

          {/* Second row - 4 & 5 (centered layout on large screens, stack on mobile) */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 dark:hover:shadow-yellow-500/20 border border-gray-200 dark:border-gray-700 hover:-translate-y-1 transition-all duration-300 w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">4. Toxic Permission Detection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Finds accidental privilege escalation, dangerous role combinations, risky app roles, legacy roles, and unmanaged elevated identities.
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs font-mono bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">Risk Scoring</span>
                </div>
              </div>

              <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 dark:hover:shadow-green-500/20 border border-gray-200 dark:border-gray-700 hover:-translate-y-1 transition-all duration-300 w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">5. Automated Remediation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Uses Azure Functions + PIM + Conditional Access to fix misconfigurations, remove dangerous access, and enforce least privilege automatically.
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">Azure Functions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Use Cases Preview */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 sm:p-8 mb-16 sm:mb-20 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Real-World Detection Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="text-xs sm:text-sm font-mono bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 sm:px-3 sm:py-1 rounded-full inline-block mb-3 group-hover:scale-105 transition-transform">
                Critical
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-base sm:text-lg">
                Multi-Nested Groups
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Hidden admin via deep privilege inheritance chain. User → Group A → Group B → Group C → Subscription Owner.
              </p>
            </div>
            <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="text-xs sm:text-sm font-mono bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 sm:px-3 sm:py-1 rounded-full inline-block mb-3 group-hover:scale-105 transition-transform">
                High Risk
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors text-base sm:text-lg">
                Dangerous App Permissions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Legacy SP with Directory.ReadWrite.All + AppRoleAssignment.ReadWrite.All + admin consent + no owner.
              </p>
            </div>
            <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="text-xs sm:text-sm font-mono bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 sm:px-3 sm:py-1 rounded-full inline-block mb-3 group-hover:scale-105 transition-transform">
                MFA Bypass
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors text-base sm:text-lg">
                Helpdesk Privilege Abuse
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Overlapping roles allow MFA reset + attribute modification for VIP accounts (CEO, CFO, CTO).
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a
            href="#"
            className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            Request Demo Access
            <svg
              className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}