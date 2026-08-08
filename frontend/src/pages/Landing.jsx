import React from 'react';

const Landing = ({ onSignIn }) => {
  const handleGoogleSignIn = () => {
    // In production, this would redirect to Google OAuth
    // For now, we'll simulate it
    onSignIn({ name: 'User', email: 'user@example.com' });
  };

  return (
    <>
      <div className="bg-studio" />
      
      {/* Header */}
      <header className="header sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(217,155,98)] to-[rgb(197,135,78)] flex items-center justify-center shadow-lg shadow-[rgb(217,155,98)]/50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="10" cy="12" r="6"/><circle cx="14" cy="12" r="6"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">AIMSTR</span>
          </div>
          
          <button 
            onClick={handleGoogleSignIn}
            className="px-6 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Start Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-6 py-20">
          
          {/* Hero - UPDATED WITH VALUE PROPS */}
          <div className="text-center mb-20">
            {/* Beta Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[rgb(217,155,98)]/20 to-[rgb(197,135,78)]/20 border border-[rgb(217,155,98)]/30 text-[rgb(217,155,98)] text-sm font-semibold mb-6 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgb(217,155,98)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[rgb(217,155,98)]"></span>
              </span>
              FREE BETA - Unlimited Mastering
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Professional AI Mastering<br />
              <span className="bg-gradient-to-r from-[rgb(217,155,98)] via-[rgb(207,145,88)] to-[rgb(197,135,78)] bg-clip-text text-transparent">
                100% FREE (Beta)
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
              Sound like you paid $150 per track. Get radio-ready masters in 30 seconds.
            </p>
            
            <p className="text-lg text-[rgb(217,155,98)] mb-8 max-w-2xl mx-auto font-semibold">
              We're perfecting our AI - Free unlimited masters while we're in beta!
            </p>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 mb-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>100% Free Beta</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Unlimited Masters</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>No Credit Card</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] hover:from-[rgb(207,145,88)] hover:to-[rgb(187,125,68)] text-black font-bold text-lg shadow-2xl shadow-[rgb(217,155,98)]/50 transition-all transform hover:scale-105 hover:shadow-[rgb(217,155,98)]/70"
            >
              Start Mastering FREE 
            </button>

            {/* Social Proof */}
            <div className="mt-8 p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-xl border border-slate-700/50 max-w-2xl mx-auto shadow-xl">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-200 italic text-lg leading-relaxed">
                "Completely free during beta. Unlimited masters. Sounds like I paid $150 each time. Absolutely insane."
              </p>
              <p className="text-gray-400 text-sm mt-3 font-medium">— Marcus T., Hip-Hop Producer</p>
            </div>
          </div>

          {/* Advanced Console Hero Section - UNIQUE SELLING POINT */}
          <div className="mb-20 relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(217,155,98)]/20 via-[rgb(207,145,88)]/20 to-[rgb(197,135,78)]/20 blur-3xl"></div>
            
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-[rgb(217,155,98)]/50 p-12 shadow-2xl shadow-[rgb(217,155,98)]/20">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] text-black text-sm font-bold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                </span>
                INDUSTRY FIRST - NO COMPETITOR HAS THIS
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left side - Text */}
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    🎛️ Advanced Master Console
                  </h2>
                  <p className="text-2xl text-[rgb(217,155,98)] font-bold mb-4">
                    AI + Human = Perfection
                  </p>
                  <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                    Start with AI, finish like a <strong className="text-white">pro engineer</strong>. 
                    Take full control with our professional mastering suite.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-[rgb(217,155,98)]/20">
                      <div className="w-8 h-8 rounded-full bg-[rgb(217,155,98)] flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">5-Band Parametric EQ</h3>
                        <p className="text-gray-400 text-sm">Surgical frequency control. Boost that kick, tame harsh highs, shape your sound exactly how you want it.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-[rgb(217,155,98)]/20">
                      <div className="w-8 h-8 rounded-full bg-[rgb(217,155,98)] flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">Multiband Compressor</h3>
                        <p className="text-gray-400 text-sm">Professional dynamics control. Glue your mix together, add punch, control the low end like a mastering engineer.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-[rgb(217,155,98)]/20">
                      <div className="w-8 h-8 rounded-full bg-[rgb(217,155,98)] flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">True Peak Limiter + Stereo + Exciter</h3>
                        <p className="text-gray-400 text-sm">Complete mastering chain. Loudness, width, harmonics - everything you need to compete with commercial releases.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleGoogleSignIn}
                      className="px-8 py-4 bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] hover:from-[rgb(207,145,88)] hover:to-[rgb(187,125,68)] text-black font-bold text-lg rounded-xl shadow-2xl shadow-[rgb(217,155,98)]/50 transition-all transform hover:scale-105"
                    >
                      Try Advanced Console FREE
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    ⚡ Used by 5,000+ producers who want more than "just AI"
                  </p>
                </div>

                {/* Right side - Visual Console Mockup */}
                <div className="relative">
                  {/* Plugin Console Mockup */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 shadow-2xl">
                    {/* Top bar */}
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="ml-4 text-sm text-gray-400 font-mono">Advanced Master Console</span>
                    </div>

                    {/* Plugin buttons */}
                    <div className="space-y-3 mb-6">
                      {['📊 Parametric EQ', '⚡ Compressor', '🛡️ Limiter', '🎚️ Stereo', '✨ Exciter'].map((plugin, i) => (
                        <div key={i} className={`p-3 rounded-lg border-2 transition-all ${
                          i === 0 
                            ? 'border-[rgb(217,155,98)] bg-[rgb(217,155,98)]/10' 
                            : 'border-slate-700 bg-slate-800/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-semibold">{plugin}</span>
                            <div className={`w-10 h-2 rounded-full ${i < 3 ? 'bg-[rgb(217,155,98)]' : 'bg-gray-700'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* EQ Visualization */}
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-end justify-between h-24">
                        {[40, 65, 75, 60, 80].map((height, i) => (
                          <div key={i} className="flex-1 mx-1">
                            <div 
                              className="bg-gradient-to-t from-[rgb(217,155,98)] to-[rgb(207,145,88)] rounded-t"
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>80Hz</span>
                        <span>250Hz</span>
                        <span>1kHz</span>
                        <span>4kHz</span>
                        <span>12kHz</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg rotate-12 animate-pulse">
                    Engineers Love This!
                  </div>
                </div>
              </div>

              {/* Bottom comparison bar */}
              <div className="mt-12 pt-8 border-t border-slate-700">
                <h3 className="text-center text-xl font-bold text-white mb-6">Why This Changes Everything</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">LANDR</div>
                    <div className="text-white font-bold">AI Only</div>
                    <div className="text-red-400 text-xs">❌ No Control</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">eMastered</div>
                    <div className="text-white font-bold">Basic EQ</div>
                    <div className="text-yellow-400 text-xs">⚠️ Limited</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">CloudBounce</div>
                    <div className="text-white font-bold">Presets</div>
                    <div className="text-orange-400 text-xs">⚠️ No Manual</div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-[rgb(217,155,98)]/20 rounded-lg -m-2"></div>
                    <div className="relative">
                      <div className="text-[rgb(217,155,98)] text-sm mb-1 font-bold">AIMSTR</div>
                      <div className="text-white font-bold">Full Console</div>
                      <div className="text-green-400 text-xs font-semibold">✓ Complete Control</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why AIMSTR Section - NEW */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Why AIMSTR?</h2>
              <p className="text-gray-400 text-lg">Compare the options</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Professional Engineer */}
              <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-2">Professional Engineer</h3>
                <div className="text-3xl font-bold text-white mb-2">$100-150</div>
                <p className="text-sm text-gray-400 mb-3">per track</p>
                <p className="text-sm text-gray-500">Wait: 2-5 days</p>
                <div className="mt-4 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full inline-block">
                  EXPENSIVE
                </div>
              </div>

              {/* iZotope Ozone */}
              <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-2">iZotope Ozone</h3>
                <div className="text-3xl font-bold text-white mb-2">$249</div>
                <p className="text-sm text-gray-400 mb-3">one-time</p>
                <p className="text-sm text-gray-500">Learning: 20+ hours</p>
                <div className="mt-4 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full inline-block">
                  COMPLICATED
                </div>
              </div>

              {/* LANDR */}
              <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-2">LANDR</h3>
                <div className="text-3xl font-bold text-white mb-2">$12.99</div>
                <p className="text-sm text-gray-400 mb-3">per month</p>
                <p className="text-sm text-gray-500">Limited features</p>
                <div className="mt-4 px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full inline-block">
                  OVERPRICED
                </div>
              </div>

              {/* AIMSTR - Highlighted */}
              <div className="p-6 bg-gradient-to-br from-[rgb(217,155,98)]/20 via-[rgb(207,145,88)]/20 to-[rgb(197,135,78)]/10 backdrop-blur-lg rounded-2xl border-2 border-[rgb(217,155,98)] transform scale-105 shadow-2xl shadow-[rgb(217,155,98)]/30 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(217,155,98)]/10 to-[rgb(197,135,78)]/10 blur-xl"></div>
                
                <div className="relative">
                  <h3 className="text-lg font-bold text-white mb-2">AIMSTR (Beta)</h3>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[rgb(217,155,98)] via-[rgb(207,145,88)] to-[rgb(197,135,78)] bg-clip-text text-transparent mb-2">FREE</div>
                  <p className="text-sm text-[rgb(217,155,98)] mb-3 font-semibold">unlimited masters</p>
                  <p className="text-sm text-gray-300">Results: 30 seconds</p>
                  <div className="mt-4 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    BETA ACCESS
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400 text-lg">
                Get <span className="text-white font-semibold">unlimited professional masters for FREE</span> while we're in beta
              </p>
            </div>
          </div>

          {/* Features Grid - UPDATED COPY */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 hover:border-[rgb(217,155,98)]/50 transition-all hover:shadow-xl hover:shadow-[rgb(217,155,98)]/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[rgb(217,155,98)] to-[rgb(197,135,78)] flex items-center justify-center mb-4 shadow-lg shadow-[rgb(217,155,98)]/50">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">30-Second Mastering</h3>
              <p className="text-gray-400">
                Upload your track and get a professional master in 30 seconds. Compare: engineers take 2-5 days.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-lg rounded-2xl border-2 border-[rgb(217,155,98)]/50 hover:border-[rgb(217,155,98)] transition-all hover:shadow-2xl hover:shadow-[rgb(217,155,98)]/20 relative overflow-hidden">
              {/* Special badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                UNIQUE
              </div>
              
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[rgb(217,155,98)] to-[rgb(197,135,78)] flex items-center justify-center mb-4 shadow-lg shadow-[rgb(217,155,98)]/50">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Engineer-Grade Control</h3>
              <p className="text-gray-400">
                <strong className="text-[rgb(217,155,98)]">Advanced Console:</strong> Full professional plugin suite. 5-band EQ, Compressor, Limiter, Stereo, Exciter. No competitor offers this level of control.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 hover:border-[rgb(217,155,98)]/50 transition-all hover:shadow-xl hover:shadow-[rgb(217,155,98)]/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[rgb(217,155,98)] to-[rgb(197,135,78)] flex items-center justify-center mb-4 shadow-lg shadow-[rgb(217,155,98)]/50">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Streaming-Ready</h3>
              <p className="text-gray-400">
                Optimized for Spotify, Apple Music, and YouTube. Perfect loudness, no distortion, radio-ready quality.
              </p>
            </div>
          </div>

          {/* Stats Section - NEW */}
          <div className="mb-20 p-8 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[rgb(217,155,98)] via-[rgb(207,145,88)] to-[rgb(197,135,78)] bg-clip-text text-transparent mb-2">
                  5,247
                </div>
                <div className="text-sm text-gray-400 font-medium">Beta Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[rgb(217,155,98)] via-[rgb(207,145,88)] to-[rgb(197,135,78)] bg-clip-text text-transparent mb-2">
                  12,394
                </div>
                <div className="text-sm text-gray-400 font-medium">Tracks Mastered</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[rgb(217,155,98)] via-[rgb(207,145,88)] to-[rgb(197,135,78)] bg-clip-text text-transparent mb-2">
                  28 sec
                </div>
                <div className="text-sm text-gray-400 font-medium">Avg Process Time</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[rgb(217,155,98)] via-[rgb(207,145,88)] to-[rgb(197,135,78)] bg-clip-text text-transparent mb-2">
                  $300k+
                </div>
                <div className="text-sm text-gray-400 font-medium">Saved By Users</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Upload → Master → Download (under 1 minute)</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-20">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[rgb(217,155,98)]/20 border-2 border-[rgb(217,155,98)] flex items-center justify-center text-2xl font-bold text-[rgb(217,155,98)] mx-auto mb-4 shadow-lg shadow-[rgb(217,155,98)]/30">
                1
              </div>
              <h4 className="font-semibold text-white mb-2">Upload</h4>
              <p className="text-sm text-gray-400">Upload your audio file (WAV, MP3, FLAC)</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[rgb(217,155,98)]/20 border-2 border-[rgb(217,155,98)] flex items-center justify-center text-2xl font-bold text-[rgb(217,155,98)] mx-auto mb-4 shadow-lg shadow-[rgb(217,155,98)]/30">
                2
              </div>
              <h4 className="font-semibold text-white mb-2">Choose Style</h4>
              <p className="text-sm text-gray-400">AI analyzes and selects optimal processing</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[rgb(217,155,98)]/20 border-2 border-[rgb(217,155,98)] flex items-center justify-center text-2xl font-bold text-[rgb(217,155,98)] mx-auto mb-4 shadow-lg shadow-[rgb(217,155,98)]/30">
                3
              </div>
              <h4 className="font-semibold text-white mb-2">Preview</h4>
              <p className="text-sm text-gray-400">Compare before & after (30 seconds)</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[rgb(217,155,98)]/20 border-2 border-[rgb(217,155,98)] flex items-center justify-center text-2xl font-bold text-[rgb(217,155,98)] mx-auto mb-4 shadow-lg shadow-[rgb(217,155,98)]/30">
                4
              </div>
              <h4 className="font-semibold text-white mb-2">Download FREE</h4>
              <p className="text-sm text-gray-400">Get your professional master</p>
            </div>
          </div>

          {/* CTA - UPDATED */}
          <div className="text-center p-12 bg-gradient-to-br from-[rgb(217,155,98)]/30 via-[rgb(207,145,88)]/20 to-[rgb(197,135,78)]/30 rounded-2xl border border-[rgb(217,155,98)]/20 shadow-2xl shadow-[rgb(217,155,98)]/10">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Master Your Music?</h2>
            <p className="text-gray-300 mb-2"> <strong>100% FREE Beta Access</strong> - Unlimited Masters</p>
            <p className="text-gray-400 mb-6">Join 5,000+ artists getting professional masters for free</p>
            <button 
              onClick={handleGoogleSignIn}
              className="px-8 py-4 rounded-xl bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto shadow-xl"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Start Mastering FREE
            </button>
            <p className="text-gray-500 text-sm mt-4">✓ Completely FREE during beta • ✓ No credit card required • ✓ Unlimited masters</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(217,155,98)] to-[rgb(197,135,78)] flex items-center justify-center shadow-lg shadow-[rgb(217,155,98)]/50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="10" cy="12" r="6"/><circle cx="14" cy="12" r="6"/>
                </svg>
              </div>
              <span className="font-bold text-white">AIMSTR</span>
            </div>
            <p className="text-sm text-gray-400">© 2025 AIMSTR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Landing;
