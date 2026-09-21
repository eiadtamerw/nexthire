'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Nav() {
  const [isAuth, setIsAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    setIsAuth(!!t && exp > Date.now());
    setMounted(true);
  }, [pathname]);

  async function logoutNow() {
    const token = localStorage.getItem('staffToken');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch (e) {}
    }
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffExpires');
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <svg viewBox="0 0 130 115" fill="none">
              <circle cx="20" cy="12" r="8" fill="currentColor" />
              <path d="M 6 26 L 6 92 L 24 92 L 24 56 L 56 92 L 74 92 L 74 26 L 56 26 L 56 62 L 24 26 Z" fill="currentColor" />
              <path d="M 112 26 L 112 78 Q 112 92 126 92" stroke="currentColor" strokeWidth="18" fill="none" strokeLinecap="round" />
              <rect x="88" y="52" width="42" height="14" fill="currentColor" />
              <circle cx="122" cy="108" r="8" fill="currentColor" />
            </svg>
          </span>
          <span className="brand-text">
            Next<strong>Hire</strong>
          </span>
        </Link>

        <div className="nav-links">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link href="/offers" className={pathname === '/offers' ? 'active' : ''}>Offers</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>Contact</Link>

          {mounted && isAuth && (
            <Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
          )}
                    {mounted && isAuth && (
            <Link href="/matches" className={pathname === '/matches' ? 'active' : ''}>Matches</Link>
          )}

          {mounted && !isAuth && <Link href="/login">Login</Link>}

          {mounted && isAuth && (
            <button
              onClick={logoutNow}
              className="btn btn-ghost btn-sm"
              style={{ border: '1px solid var(--border)' }}
              type="button"
            >
              Logout
            </button>
          )}

          <Link href="/apply" className="btn btn-primary btn-sm">Apply Now</Link>
        </div>
      </div>
    </nav>
  );
}