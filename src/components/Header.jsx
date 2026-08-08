import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'

function Header() {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-black/50 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <button 
              className="h-10 w-10 grid place-items-center rounded-md hover:bg-white/5 transition"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-white/90" />
            </button>
            
            <Link to="/" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full grid place-items-center ring-1 ring-white/20">
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-6 h-6 text-white/90" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.6"
                >
                  <circle cx="10" cy="12" r="6" />
                  <circle cx="14" cy="12" r="6" />
                </svg>
              </div>
              <span className="tracking-[0.25em] text-white/90 text-sm font-medium">
                AIMSTR
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link 
              to="/upload" 
              className="px-4 py-2 rounded-full btn-wood font-semibold text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
