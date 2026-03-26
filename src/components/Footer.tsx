export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content - 4 column layout matching live site */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {/* Column 1: Logo, Quick Links, Contact */}
          <div>
            <div className="mb-6">
              <a href="/">
                <img 
                  src="/assets/cloudthat-logo.png"
                  alt="CloudThat"
                  width={720}
                  height={300}
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
              </a>
            </div>
            {/* For now links are not working, but we will update them soon. */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 tracking-wide">Quick links</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><a href="#" className="hover:text-white transition-colors">Cloud Computing Courses</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Corporate Training</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cloud Consulting</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Job Assistance Program</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Training calendar</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Test Prep</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">AWS Mastery Pass</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Azure Mastery Pass</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">DevOps Mastery Pass</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Hire From Us</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3 tracking-wide">Contact</h3>
                <address className="not-italic text-sm text-white/70 space-y-1">
                  <p>102, 4th B Cross, 5th Block</p>
                  <p>Koramangala Industrial Area,</p>
                  <p>Bangalore, Karnataka - 560095</p>
                  <p className="mt-2">
                    <a href="mailto:sales@cloudthat.com" className="hover:text-white transition-colors">
                      sales@cloudthat.com
                    </a>
                  </p>
                </address>
              </div>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 tracking-wide">Categories</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">AI & ML Courses</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AWS Certifications and Training</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Microsoft Azure Certifications</a></li>
              <li><a href="#" className="hover:text-white transition-colors">DevOps Certifications</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GCP Certifications and Trainings</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Microsoft Dynamics 365 Certifications</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Microsoft Security Certifications</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Modern Workplace Trainings</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Power BI Course</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Power Platform Certification</a></li>
              <li><a href="#" className="hover:text-white transition-colors">VMware Certifications</a></li>
            </ul>
          </div>

          {/* Column 3: Resources & ISO badges */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 tracking-wide">Resources</h3>
            <ul className="space-y-2 text-sm text-white/70 mb-6">
              <li><a href="#" className="hover:text-white transition-colors">Blogs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">News and Events</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Case Study</a></li>
              <li><a href="#" className="hover:text-white transition-colors">E-Book</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Webinars</a></li>
            </ul>

            {/* ISO Certifications */}
            <div className="space-y-2 text-sm text-white/70">
              <p className="flex items-center gap-2">
                <span className="text-white/90">ISO 27001</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-white/90">ISO 9001</span>
              </p>
            </div>
          </div>

          {/* Column 4: Global Offices */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 tracking-wide">Global Offices</h3>
            <div className="space-y-4 text-sm text-white/70">
              <div>
                <h4 className="font-medium text-white mb-1">India – Headquarter</h4>
                <p>102, 4th B Cross, 5th Block</p>
                <p>Koramangala Industrial Area,</p>
                <p>Bangalore, Karnataka - 560095</p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-1">East India and SAARC</h4>
                <p>RDB Boulevard, Level 8, Plot K-1,</p>
                <p>Block EP & GP, Salt Lake City,</p>
                <p>Sector V, Kolkata – 700 091</p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-1">USA</h4>
                <p>CLOUDTHAT AMERICAS LTD,</p>
                <p>1916 Pike Place, Seattle, WA 98101</p>
                <p>Phone: +1 855 558 8830</p>
                <p>Fax: 206 737-9006</p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-1">UK</h4>
                <p>7B Popin Business Centre</p>
                <p>South Way Wembley, Middlesex – HA9 0HF</p>
                <p>+1 855 558 8830</p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-1">Bangladesh</h4>
                <p>House #107, Road #13, Block #E,</p>
                <p>Banani, Dhaka – 1213</p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-1">Ahmedabad</h4>
                <p>D-509, 5th floor, The First,</p>
                <p>behind ITC Narmada Hotel,</p>
                <p>Vastrapur, Ahmedabad - 380015</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright with links */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <p>© {new Date().getFullYear()} CloudThat. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}