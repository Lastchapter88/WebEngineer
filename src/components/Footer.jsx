import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/30 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
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
            </div>
            <p className="text-sm text-slate-300/70">
              Professional audio mastering, powered by AI. Free forever.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-slate-300">Product</h4>
            <ul className="space-y-2 text-sm text-slate-300/70">
              <li>
                <Link to="/upload" className="hover:text-white transition">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-white transition">
                  Presets
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-slate-300">Support</h4>
            <ul className="space-y-2 text-sm text-slate-300/70">
              <li>
                <Link to="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/supporters" className="hover:text-white transition">
                  Supporters
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Development */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-slate-300">Support Development</h4>
            <p className="text-sm text-slate-300/70 mb-4">
              Help keep this free for everyone
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full btn-wood font-semibold text-sm">
              <Heart className="w-4 h-4" />
              Donate
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 text-center text-sm text-slate-300/60">
          <p>© 2025 AI Mastering. Made with ❤️ • Free Forever</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
