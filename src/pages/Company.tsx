export default function Company() {
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-300 mb-4">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 3h18v4M5 21h14M9 7v10m6-10v10M3 7h18M5 21a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5z" />
            </svg>
            Since 2012 • Award-Winning
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CloudThat
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
            Your trusted partner in cloud training & consulting
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 mb-12 sm:mb-16">
          {/* Main Achievement */}
          <div className="text-center mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-3 sm:mb-4">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Unprecedented Achievement
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white px-2">
              First & only company worldwide with awards from AWS, Microsoft & Google Cloud in the same year (2025)
            </h2>
          </div>

          {/* Awards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* AWS Award */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4.5 12.8C8 16.5 16 16.5 19.2 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 12.2L20.2 12.8L19.6 11.1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">AWS</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Three-time <span className="font-semibold text-orange-600 dark:text-orange-400">APJ Training Partner of the Year</span> (2023–2025)
              </p>
            </div>

            {/* Microsoft Award */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="9" height="9" />
                    <rect x="13" y="2" width="9" height="9" />
                    <rect x="2" y="13" width="9" height="9" />
                    <rect x="13" y="13" width="9" height="9" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Microsoft</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Training Services Partner of the Year</span> (2024)
              </p>
            </div>

            {/* Google Cloud Award */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Google Cloud</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <span className="font-semibold text-green-600 dark:text-green-400">New Partner of the Year</span> (2025)
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 mb-16 sm:mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center shadow-lg">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">13+</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Years in Business</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center shadow-lg">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">250+</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Corporates Trained</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center shadow-lg">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">500+</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Projects Delivered</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center shadow-lg">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">850k+</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Professionals Trained</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center shadow-lg col-span-2 sm:col-span-3 md:col-span-1">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">30+</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Countries Served</div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white">Our Mission</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Empower individuals and organizations through transformative training and expert consulting in cloud and niche technologies. Be the catalyst for positive change and future success.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white">Our Vision</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Be the trusted partner empowering individuals and organizations to thrive in a dynamic world. Foster resilient, future-ready individuals and businesses that create lasting impact.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-900 dark:text-white">Our Core Values</h2>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {["Proprietorship", "Commitment to Client", "Innovativeness", "Process Thinking", "Relentless Learning", "Proactiveness"].map((value, i) => (
              <span key={i} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
                {value}
              </span>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-900 dark:text-white">Meet Our Leadership</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">BG</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Bhavesh Goswami</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">SC</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Sachin Chokshi</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">Director - UK Operations</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">NK</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Nanda Kishore</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">Sr. VP - Consulting Sales</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">SJ</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Susil Kumar Jena</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">Associate Director - Marketing</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">RS</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Renu Singh</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">Head of Training Operations</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">PM</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Prarthit Mehta</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">CTO, Consulting</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">LK</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Lakhan Kriplani</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">Sr. Business Unit Head - AWS</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">SC</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Saurabh Chouhan</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">Head - Projects and Alliances</p>
            </div>
          </div>
        </div>

        {/* Global Presence */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Global Offices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="font-semibold text-blue-600 mb-2 flex items-center text-sm sm:text-base">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                India - Headquarters
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">102, 4th B Cross, 5th Block Koramangala, Bangalore - 560095</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2 flex items-center text-sm sm:text-base">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                India - Ahmedabad
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">D-509, 5th floor, The First, behind ITC Narmada, Vastrapur, Ahmedabad - 380015</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2 flex items-center text-sm sm:text-base">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                India - Kolkata
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">RDB Boulevard, Level 8, Salt Lake City, Sector V, Kolkata - 700091</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2 flex items-center text-sm sm:text-base">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                USA
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">CLOUDTHAT AMERICAS LTD, 1916 Pike Place, Seattle, WA 98101</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2 flex items-center text-sm sm:text-base">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                UK
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">7B Popin Business Centre, South Way Wembley, Middlesex – HA9 0HF</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2 flex items-center text-sm sm:text-base">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bangladesh
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">House #107, Road #13, Block #E, Banani, Dhaka – 1213</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}