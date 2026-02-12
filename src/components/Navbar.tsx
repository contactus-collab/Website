import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-[#D9D9D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/images/ballfour-foundation-logo.png"
                alt="Ball Four Foundation"
                className="h-[50px] w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop Menu - match Figma: Purpose, Resources, Notes, Newsletter */}
          <div className="hidden md:flex items-center gap-[82px]">
            <Link
              to="/purpose"
              className="text-black hover:text-brand-blue px-3 py-2 text-base font-normal transition-colors"
            >
              Purpose
            </Link>
            <Link
              to="/resources"
              className="text-black hover:text-brand-blue px-3 py-2 text-base font-normal transition-colors"
            >
              Resources
            </Link>
            <Link
              to="/notes"
              className="text-black hover:text-brand-blue px-3 py-2 text-base font-normal transition-colors"
            >
              Notes
            </Link>
            <Link
              to="/newsletter"
              className="text-black hover:text-brand-blue px-3 py-2 text-base font-normal transition-colors"
            >
              Newsletter
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 hover:text-brand-blue focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            <Link to="/purpose" className="block px-3 py-2 text-black hover:text-brand-blue" onClick={() => setIsOpen(false)}>Purpose</Link>
            <Link to="/resources" className="block px-3 py-2 text-black hover:text-brand-blue" onClick={() => setIsOpen(false)}>Resources</Link>
            <Link to="/notes" className="block px-3 py-2 text-black hover:text-brand-blue" onClick={() => setIsOpen(false)}>Notes</Link>
            <Link to="/newsletter" className="block px-3 py-2 text-black hover:text-brand-blue" onClick={() => setIsOpen(false)}>Newsletter</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

