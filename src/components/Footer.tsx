import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const FOOTER_BG = '#EDE9F7'
const BORDER_TOP = '#0F006A'
const TEXT_DARK = '#0F006A'
const LINK_COLOR = '#1E1E1E'

export default function Footer() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  return (
    <footer
      className="border-t-4 pt-12 pb-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: FOOTER_BG, borderTopColor: BORDER_TOP }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top row: Logo + description (left), Social icons (right) */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
          <div className="max-w-md">
            <Link to="/" className="inline-block mb-4">
              <span className="block font-sans text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: TEXT_DARK }}>
                BALLFOUR
              </span>
              <span className="block font-sans text-base font-normal mt-0.5" style={{ color: TEXT_DARK }}>
                FOUNDATION
              </span>
            </Link>
            <p
              className="font-sans max-w-md"
              style={{
                color: '#000',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '18px',
                fontWeight: 400,
                lineHeight: '155%',
              }}
            >
              From adorable clothing and accessories to safe and fun toys, our curated collection ensures your baby's first years are filled with comfort, joy, and style.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/ballfourfoundation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors hover:opacity-80"
              style={{ borderColor: BORDER_TOP }}
              aria-label="Facebook"
            >
              <img src="/images/Icon.svg" alt="" className="w-5 h-5 object-contain" />
            </a>
            <a
              href="https://www.instagram.com/ballfourfoundation/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors hover:opacity-80"
              style={{ borderColor: BORDER_TOP }}
              aria-label="Instagram"
            >
              <img src="/images/Icon%20(1).svg" alt="" className="w-5 h-5 object-contain" />
            </a>
            <a
              href="https://x.com/ball4foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors hover:opacity-80"
              style={{ borderColor: BORDER_TOP, color: BORDER_TOP }}
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Separator */}
        <hr className="border-t border-gray-300 mb-8" />

        {/* Middle row: Nav links (left), Admin Login (right) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <nav className="flex flex-wrap items-center gap-6 sm:gap-8" aria-label="Footer navigation">
            <Link to="/" className="font-sans text-base font-normal hover:underline" style={{ color: LINK_COLOR }}>
              Home
            </Link>
            <Link to="/purpose" className="font-sans text-base font-normal hover:underline" style={{ color: LINK_COLOR }}>
              Purpose
            </Link>
            <Link to="/resources" className="font-sans text-base font-normal hover:underline" style={{ color: LINK_COLOR }}>
              Resources
            </Link>
            <Link to="/notes" className="font-sans text-base font-normal hover:underline" style={{ color: LINK_COLOR }}>
              Notes
            </Link>
            <Link to="/newsletter" className="font-sans text-base font-normal hover:underline" style={{ color: LINK_COLOR }}>
              Newsletter
            </Link>
          </nav>
          {user ? (
            <Link
              to="/admin"
              className="inline-flex items-center justify-center h-10 px-6 rounded-full font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 shrink-0"
              style={{ backgroundColor: BORDER_TOP }}
            >
              Admin Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center h-10 px-6 rounded-full font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 shrink-0"
              style={{ backgroundColor: BORDER_TOP }}
            >
              Admin Login
            </Link>
          )}
        </div>

        {/* Bottom row: Tagline (left), Contact Info (right) */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pt-4">
          <h2
            className="max-w-xl"
            style={{
              color: 'var(--sds-color-text-default-default)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '44px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal',
              letterSpacing: '-0.44px',
            }}
          >
            All Kids Deserve the Opportunity to Shine
          </h2>
          <div className="shrink-0 text-right">
            <h4 className="font-sans text-base font-semibold mb-2" style={{ color: LINK_COLOR }}>
              Contact Info
            </h4>
            <a
              href="mailto:contactus@ballfour.org"
              className="font-sans text-base font-normal hover:underline"
              style={{ color: LINK_COLOR }}
            >
              contactus@ballfour.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
