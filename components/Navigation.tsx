'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/mentors', label: 'Mentors' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const NavLinks = () => (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:space-x-1 md:gap-0">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
            isActive(item.href)
              ? 'bg-gradient-to-r from-pastel-lavender to-pastel-sky text-gray-700 shadow-md'
              : 'text-gray-600 hover:text-gray-800 hover:bg-pastel-lavender/20'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 glass-card rounded-none border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pastel-lavender to-pastel-powder text-lg font-semibold text-gray-700 shadow-md">
              OS
            </span>
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-semibold tracking-tight text-gray-800">
                OS Tracker
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-primary-600">
                Open Source Pulse
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-pastel-peach/20 hover:text-gray-800"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
              </svg>
              Admin
            </Link>
            <button
              className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 transition hover:bg-pastel-mint/20"
              aria-label="User menu"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-pastel-lavender/20"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-6">
            <div className="space-y-3 rounded-2xl glass-card p-4 shadow-lg">
              <NavLinks />
              <Link
                href="/admin"
                className="flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-pastel-peach/20"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" stroke="currentColor" fill="none" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
                </svg>
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}