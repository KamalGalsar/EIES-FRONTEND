// Frontend/src/pages/users/Product.tsx
import { CheckCircle2 } from "lucide-react";

export default function Resources() {
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-600/10 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-300 mb-4">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Guides & Documentation
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Resources
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 px-2">
            Everything you need to deploy and manage EIES
          </p>
        </div>

        {/* Quickstart Guide - Featured */}
        <div className="group bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 mb-12 border border-amber-200 dark:border-amber-800/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                EIES Quickstart Guide
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-base sm:text-lg">
                Get up and running in 10 minutes
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Azure Entra ID setup
                </span>
                <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> First identity scan
                </span>
                <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Risk report generation
                </span>
              </div>
            </div>
            <a href="#" className="px-5 py-2.5 sm:px-6 sm:py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 hover:shadow-lg transition-all whitespace-nowrap text-sm sm:text-base">
              Download PDF →
            </a>
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Documentation */}
          <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
              Technical Documentation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              API references, architecture, and deployment guides
            </p>
            <span className="text-amber-600 text-sm font-medium">View docs →</span>
          </div>

          {/* Whitepaper */}
          <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
              Identity Security Whitepaper
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Hidden admin paths and toxic permission patterns in Entra ID
            </p>
            <span className="text-amber-600 text-sm font-medium">Read paper →</span>
          </div>

          {/* Deployment Guide */}
          <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
              Azure Deployment Guide
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Step-by-step ARM template deployment
            </p>
            <span className="text-amber-600 text-sm font-medium">Deploy now →</span>
          </div>

          {/* Video Tutorials */}
          <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
              Video Tutorials
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Watch and learn: setup, configuration, remediation
            </p>
            <span className="text-amber-600 text-sm font-medium">Watch now →</span>
          </div>

          {/* Release Notes */}
          <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
              v2.0 Release Notes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              What's new: GNN models, faster scanning, new APIs
            </p>
            <span className="text-amber-600 text-sm font-medium">Read more →</span>
          </div>

          {/* FAQ */}
          <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
              Frequently Asked Questions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Common questions about EIES and identity security
            </p>
            <span className="text-amber-600 text-sm font-medium">View FAQ →</span>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Case Studies
            </span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Compliance Reports
            </span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              Troubleshooting
            </span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Release Schedule
            </span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Community Forum
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}