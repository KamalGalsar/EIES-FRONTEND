// Frontend/src/components/Footer.tsx

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {/* ── TOP SECTION ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">

          {/* COL A : Brand */}
          <div>
            <a href="/" className="block mb-5">
              <img
                src="/assets/cloudthat-logo.png"
                alt="CloudThat"
                width={720}
                height={300}
                className="h-24 w-auto object-contain brightness-0 invert"
              />
            </a>
            <p className="text-xs text-white/60 leading-relaxed mb-6">
              World's best Cloud Training and Cloud Consulting Services company, offering
              expert solutions in Cloud, DevOps, AI &amp; ML, IoT, Data Analytics, and
              Cloud Security for midsize and enterprise clients across the globe.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {/* Facebook */}
              <a href="https://www.facebook.com/cloudthat" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/user/cloudthat" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                  <polygon fill="#111827" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
              </a>
              {/* X / Twitter */}
              <a href="https://x.com/cloudthat" target="_blank" rel="noopener noreferrer" aria-label="X" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/cloudthat/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/company/cloudthat" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* COL B : Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-widest uppercase">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/65">
              {[
                { label: "Cloud Computing Courses", url: "https://www.cloudthat.com/training/" },
                { label: "Corporate Training", url: "https://www.cloudthat.com/corporate-training/" },
                { label: "Cloud Consulting", url: "https://www.cloudthat.com/consulting/" },
                { label: "Job Assistance Program", url: "https://www.cloudthat.com/training/cloud-and-devops-expert-program/" },
                { label: "Training calendar", url: "https://www.cloudthat.com/training/calendar" },
                { label: "Test Prep", url: "https://testprep.cloudthat.com/" },
                { label: "AWS Mastery Pass", url: "https://www.cloudthat.com/training/aws-mastery-pass/" },
                { label: "Azure Mastery Pass", url: "https://www.cloudthat.com/training/azure-mastery-pass/" },
                { label: "DevOps Mastery Pass", url: "https://www.cloudthat.com/training/devops-mastery-pass/" },
                { label: "Hire From Us", url: "https://www.cloudthat.com/training/hire-from-us/" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL C : Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-widest uppercase">Categories</h3>
            <ul className="space-y-2 text-sm text-white/65">
              {[
                { label: "AI & ML Courses", url: "https://www.cloudthat.com/training/ai-machine-learning-certification-course" },
                { label: "AWS Certifications and Training", url: "https://www.cloudthat.com/training/aws/" },
                { label: "Microsoft Azure Certifications", url: "https://www.cloudthat.com/training/azure/" },
                { label: "DevOps Certifications", url: "https://www.cloudthat.com/training/devops/" },
                { label: "GCP Certifications and Trainings", url: "https://www.cloudthat.com/training/google-cloud-certification" },
                { label: "Microsoft Dynamics 365 Certifications", url: "https://www.cloudthat.com/training/microsoftdynamics/" },
                { label: "Microsoft Security Certifications", url: "https://www.cloudthat.com/training/microsoft-security/" },
                { label: "Modern Workplace Trainings", url: "https://www.cloudthat.com/training/modernworkplace/" },
                { label: "Power BI Course", url: "https://www.cloudthat.com/training/power-platform/pl-300-microsoft-power-bi-data-analyst-training" },
                { label: "Power Platform Certification", url: "https://www.cloudthat.com/training/power-platform/" },
                { label: "VMware Certifications", url: "https://www.cloudthat.com/training/vmware/" },
                { label: "Home", url: "https://www.cloudthat.com/" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL D : Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-widest uppercase">Resources</h3>
            <ul className="space-y-2 text-sm text-white/65">
              {[
                { label: "Blogs", url: "https://www.cloudthat.com/resources/blogs/" },
                { label: "News and Events", url: "https://www.cloudthat.com/resources/news-events" },
                { label: "Case Study", url: "https://www.cloudthat.com/resources/" },
                { label: "E-Book", url: "https://www.cloudthat.com/resources/" },
                { label: "Webinars", url: "https://www.cloudthat.com/resources/" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL E : Contact + ISO Badges */}
          <div className="flex flex-col gap-6">

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 tracking-widest uppercase">Contact</h3>
              <address className="not-italic text-sm text-white/65 space-y-3">
                <p className="flex gap-2 items-start">
                  <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  <span>102, 4th B Cross, 5th Block, Koramangala Industrial Area, Bangalore, Karnataka - 560095</span>
                </p>
                <p className="flex gap-2 items-center">
                  <svg className="w-3.5 h-3.5 shrink-0 text-white/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m2 7 10 7 10-7"/>
                  </svg>
                  <a href="mailto:sales@cloudthat.com" className="hover:text-white transition-colors">sales@cloudthat.com</a>
                </p>
              </address>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* ISO / CMMI Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="w-14 h-14 rounded-full border-2 border-yellow-500/70 bg-yellow-900/20 flex items-center justify-center">
                <span className="text-yellow-400 text-[9px] font-bold text-center leading-tight">CMMI<br/>MATURITY LVL 5</span>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
                <span className="text-white/80 text-[8px] font-bold text-center leading-tight">ISO<br/>27001</span>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
                <span className="text-white/80 text-[8px] font-bold text-center leading-tight">ISO<br/>15010</span>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-yellow-600/60 bg-yellow-900/20 flex items-center justify-center">
                <span className="text-yellow-400 text-[8px] font-bold text-center leading-tight">ISO<br/>27701</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="border-t border-white/10 my-10" />

        {/* ── GLOBAL OFFICES (full width, responsive grid) ── */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-6 tracking-widest uppercase text-center">Global Offices</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              {
                title: "India – Headquarter",
                lines: ["102, 4th B Cross, 5th Block", "Koramangala Industrial Area,", "Bangalore, Karnataka - 560095"],
              },
              {
                title: "East India and SAARC",
                lines: ["RDB Boulevard, Level 8, Plot K-1,", "Block EP & GP, Salt Lake City,", "Sector V, Kolkata – 700 091"],
              },
              {
                title: "USA",
                lines: ["CLOUDTHAT AMERICAS LTD,", "1916 Pike Place, Seattle, WA 98101", "Phone: +1 855 558 8830", "Fax: 206 737-9006"],
              },
              {
                title: "UK",
                lines: ["7B Popin Business Centre", "South Way Wembley,", "Middlesex – HA9 0HF", "+1 855 558 8830"],
              },
              {
                title: "Bangladesh",
                lines: ["House #107, Road #13, Block #E,", "Banani, Dhaka – 1213"],
              },
              {
                title: "Ahmedabad",
                lines: ["D-509, 5th floor, The First,", "behind ITC Narmada Hotel,", "Vastrapur, Ahmedabad - 380015"],
              },
            ].map(({ title, lines }, index, arr) => (
              <div
                key={title}
                className={`text-sm ${index < arr.length - 1 ? "lg:border-r lg:border-white/10 lg:pr-4" : ""}`}
              >
                <h4 className="font-semibold text-white mb-2">{title}</h4>
                {lines.map((l) => (
                  <p key={l} className="text-white/65 leading-relaxed">{l}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs text-white/50 text-center flex-wrap">
            <span>©COPYRIGHT {new Date().getFullYear()} CLOUDTHAT TECHNOLOGIES PRIVATE LIMITED · ALL RIGHTS RESERVED</span>
            <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-1">
              {["Privacy Policy", "Terms of Use", "Disclaimer", "Cancellation and Refund"].map((link) => (
                <span key={link} className="flex items-center gap-1">
                  <span className="text-white/30">·</span>
                  <a href="#" className="hover:text-white transition-colors uppercase tracking-wide">{link}</a>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}