'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview' },
  { href: '/students', label: 'Students' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/leaderboard', label: 'Leaderboard' },
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
              ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/30'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-lg font-semibold text-white shadow-lg shadow-blue-500/30">
              OS
            </span>
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                OS Tracker
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-indigo-500 dark:text-indigo-300">
                Open Source Pulse
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin/students"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
            >
              Admin Console
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500"
            >
              View Leaderboard
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/70"
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
            <div className="space-y-3 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/95 dark:bg-slate-950/85 backdrop-blur-2xl p-4 shadow-lg">
              <NavLinks />
              <Link
                href="/leaderboard"
                className="flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow shadow-indigo-500/25"
              >
                View Leaderboard
              </Link>
              <Link
                href="/admin/students"
                className="flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70"
              >
                Admin Console
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
