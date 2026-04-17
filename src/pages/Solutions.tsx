// Frontend/src/pages/users/Solutions.tsx

export default function Solutions() {
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-600/10 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-purple-700 dark:bg-purple-400/10 dark:text-purple-300 mb-4 backdrop-blur-sm border border-purple-500/20 hover:scale-105 transition-transform duration-300">
            Use Cases • Industries • Scenarios
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient leading-[1.3] pb-2">
            Solutions by Identity Risk
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2">
            Tailored identity security solutions for every stage of your cloud journey
          </p>
        </div>

        {/* Industry Solutions - Responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {/* Financial Services */}
          <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 border border-blue-500/20 dark:border-blue-500/10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-1 h-6 sm:h-8 bg-blue-600 rounded-full group-hover:h-8 sm:group-hover:h-10 transition-all duration-300"></span>
              <span className="group-hover:text-blue-600 transition-colors text-base sm:text-xl">Financial Services</span>
            </h2>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Prevent privilege escalation in payment processing systems</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Detect shadow admins in trading platforms</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Comply with SOX, PCI-DSS, and financial regulations</span>
              </li>
            </ul>
          </div>

          {/* Healthcare & Life Sciences */}
          <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 border border-green-500/20 dark:border-green-500/10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-1 h-6 sm:h-8 bg-green-600 rounded-full group-hover:h-8 sm:group-hover:h-10 transition-all duration-300"></span>
              <span className="group-hover:text-green-600 transition-colors text-base sm:text-xl">Healthcare & Life Sciences</span>
            </h2>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Protect PHI/PII from lateral movement attacks</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Secure research data access across collaborators</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">HIPAA and HITECH compliance automation</span>
              </li>
            </ul>
          </div>

          {/* Enterprise & Fortune 500 */}
          <div className="group bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 border border-orange-500/20 dark:border-orange-500/10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-1 h-6 sm:h-8 bg-orange-600 rounded-full group-hover:h-8 sm:group-hover:h-10 transition-all duration-300"></span>
              <span className="group-hover:text-orange-600 transition-colors text-base sm:text-xl">Enterprise & Fortune 500</span>
            </h2>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Merger & acquisition identity risk assessment</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Legacy app modernization governance</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Zero Trust architecture enforcement</span>
              </li>
            </ul>
          </div>

          {/* MSSPs & System Integrators */}
          <div className="group bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300 border border-red-500/20 dark:border-red-500/10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-1 h-6 sm:h-8 bg-red-600 rounded-full group-hover:h-8 sm:group-hover:h-10 transition-all duration-300"></span>
              <span className="group-hover:text-red-600 transition-colors text-base sm:text-xl">MSSPs & System Integrators</span>
            </h2>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Multi-tenant identity security monitoring</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">White-labeled risk reporting</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group/item">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Automated remediation playbooks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Technical Solutions */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Technical Solutions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="group bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm sm:text-base">
                Shadow Admin Detection
              </span>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">Find hidden admins in nested groups</p>
            </div>
            <div className="group bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm sm:text-base">
                Toxic Combo Scanner
              </span>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">Dangerous permission pairs</p>
            </div>
            <div className="group bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm sm:text-base">
                Service Principal Hardening
              </span>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">SP with no owner/expiry</p>
            </div>
            <div className="group bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm sm:text-base">
                MFA Bypass Prevention
              </span>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">Helpdesk privilege control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}