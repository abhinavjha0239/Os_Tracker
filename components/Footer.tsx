import { type JSX } from 'react';

const navigation = [
  { label: 'Students', href: '/students' },
  { label: 'Organizations', href: '/organizations' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Admin', href: '/admin/students' },
];

const socials = [
  { label: 'GitHub', href: 'https://github.com', icon: 'github' },
  { label: 'Discord', href: '#', icon: 'discord' },
  { label: 'Email', href: 'mailto:opensource@college.edu', icon: 'mail' },
];

const icons: Record<string, JSX.Element> = {
  github: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.48c.5.09.68-.21.68-.47v-1.79c-2.78.6-3.37-1.34-3.37-1.34a2.65 2.65 0 0 0-1.1-1.46c-.9-.62.07-.6.07-.6a2.1 2.1 0 0 1 1.54 1.03 2.13 2.13 0 0 0 2.9.83 2.12 2.12 0 0 1 .63-1.33c-2.22-.25-4.55-1.11-4.55-4.93a3.86 3.86 0 0 1 1-2.68 3.58 3.58 0 0 1 .1-2.65s.84-.27 2.75 1a9.45 9.45 0 0 1 5 0c1.9-1.27 2.74-1 2.74-1a3.57 3.57 0 0 1 .1 2.65 3.86 3.86 0 0 1 1 2.68c0 3.83-2.33 4.67-4.55 4.92a2.38 2.38 0 0 1 .68 1.85v2.74c0 .26.18.57.69.47A10 10 0 0 0 12 2Z"
      />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.26 4.06a18.4 18.4 0 0 0-4.69-1.5a.07.07 0 0 0-.07 0a13 13 0 0 0-.59 1.21a17 17 0 0 0-5.57 0A11 11 0 0 0 8.75 2.6a.07.07 0 0 0-.07 0A18.28 18.28 0 0 0 4 4.07a.06.06 0 0 0-.03.02C.58 9.12-.35 14 0 18.82a.08.08 0 0 0 .03.05a18.52 18.52 0 0 0 5.64 2.86a.07.07 0 0 0 .07 0a13 13 0 0 0 1.1-1.82a.07.07 0 0 0-.04-.1a11.92 11.92 0 0 1-1.68-.8a.07.07 0 0 1 0-.1l.34-.26a.07.07 0 0 1 .07-.01c3.53 1.61 7.36 1.61 10.84 0a.07.07 0 0 1 .08 0l.34.26a.07.07 0 0 1 0 .1a11.36 11.36 0 0 1-1.68.8a.07.07 0 0 0-.04.1a15.3 15.3 0 0 0 1.09 1.82a.07.07 0 0 0 .07 0a18.46 18.46 0 0 0 5.64-2.86a.08.08 0 0 0 .03-.05c.47-4.89-.79-9.73-3.77-14.69a.05.05 0 0 0-.03-.02ZM8.52 15.4c-1.06 0-1.93-1-1.93-2.22s.85-2.23 1.93-2.23s1.95 1 1.93 2.23c0 1.21-.85 2.22-1.93 2.22Zm6.96 0c-1.06 0-1.93-1-1.93-2.22s.85-2.23 1.93-2.23s1.95 1 1.93 2.23c0 1.21-.86 2.22-1.93 2.22Z"
      />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v.35l-8 5.33l-8-5.33Zm0 2.24V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.24l-8.46 5.63a1 1 0 0 1-1.08 0Z"
      />
    </svg>
  ),
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-gray-200/70 dark:border-gray-800/80 bg-white/60 dark:bg-gray-950/40 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md space-y-3">
            <span className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-blue-600 dark:text-blue-400">
              Keep shipping
            </span>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              OS Tracker keeps your campus open source heartbeat visible.
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Celebrate every merged pull request, measure impact across organizations, and inspire the next wave of contributors.
            </p>
          </div>

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-gray-600 dark:text-gray-300">
              {navigation.map((item) => (
                <a key={item.href} href={item.href} className="hover:text-gray-900 dark:hover:text-white transition">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 transition hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500"
                  aria-label={item.label}
                >
                  {icons[item.icon]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-gray-200/70 dark:border-gray-800/60 pt-6 text-sm text-gray-500 dark:text-gray-400 md:flex-row md:items-center md:justify-between">
          <p>© {year} OS Tracker. Crafted by the college developer community.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-200 transition">
              Status
            </a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-200 transition">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-200 transition">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
