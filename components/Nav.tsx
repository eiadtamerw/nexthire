'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Nav({ activePage = '' }: { activePage?: string }) {
  const [isAuth, setIsAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    setIsAuth(!!t && exp > Date.now());
    setMounted(true);
  }, []);

  function logoutNow() {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffExpires');
    router.push('/');
  }

  // عشان نمنع mismatch بين السيرفر والكلاينت
  if (!mounted) {
    return (
      <nav className="nav">
        <div className="nav-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <svg viewBox="0 0 130 115" fill="none">
                <circle cx="20" cy="12" r="8" fill="currentColor"/>
                <path d="M 6 26 L 6 92 L 24 92 L 24 56 L 56 92 L 74 92 L 74 26 L 56 26 L 56 62 L 24 26 Z" fill="currentColor"/>
                <path d="M 112 26 L 112 78 Q 112 92 126 92" stroke="currentColor" strokeWidth="18" fill="none" strokeLinecap="round"/>
                <rect x="88" y="52" width="42" height="14" fill="currentColor"/>
                <circle cx="122" cy="108" r="8" fill="currentColor"/>
              </svg>
            </span>
            <span className="brand-text">Next<strong>Hire</strong></span>
          </Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/offers">Offers</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/apply" className="btn btn-primary btn-sm">Apply Now</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <svg viewBox="0 0 130 115" fill="none">
              <circle cx="20" cy="12" r="8" fill="currentColor"/>
              <path d="M 6 26 L 6 92 L 24 92 L 24 56 L 56 92 L 74 92 L 74 26 L 56 26 L 56 62 L 24 26 Z" fill="currentColor"/>
              <path d="M 112 26 L 112 78 Q 112 92 126 92" stroke="currentColor" strokeWidth="18" fill="none" strokeLinecap="round"/>
              <rect x="88" y="52" width="42" height="14" fill="currentColor"/>
              <circle cx="122" cy="108" r="8" fill="currentColor"/>
            </svg>
          </span>
          <span className="brand-text">Next<strong>Hire</strong></span>
        </Link>

        <div className="nav-links">
          <Link href="/" className={activePage === 'home' ? 'active' : ''}>Home</Link>
          <Link href="/offers" className={activePage === 'offers' ? 'active' : ''}>Offers</Link>
          <Link href="/contact" className={activePage === 'contact' ? 'active' : ''}>Contact</Link>
          {isAuth && (
            <Link href="/dashboard" className={activePage === 'dashboard' ? 'active' : ''}>Dashboard</Link>
          )}
          {!isAuth && <Link href="/login">Login</Link>}
          {isAuth && (
            <button
              onClick={logoutNow}
              className="btn btn-ghost btn-sm"
              style={{ border: '1px solid var(--border)' }}
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