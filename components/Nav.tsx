'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Nav() {
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    const u = localStorage.getItem('staffUsername') || '';
    setIsAuth(!!t && exp > Date.now());
    setUsername(u);
    setIsAdmin(localStorage.getItem('staffIsAdmin') === 'true');
    setMounted(true);
  }, [pathname]);

  // اقفل أي قايمة مفتوحة لما يتغير المسار
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick() {
      setMenuOpen(false);
    }
    if (menuOpen) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [menuOpen]);

  // امنع scroll الصفحة لما الـ mobile menu مفتوح
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

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
    localStorage.removeItem('staffUsername');
    localStorage.removeItem('staffIsAdmin');
    router.push('/');
    router.refresh();
  }

  const initial = username ? username.charAt(0).toUpperCase() : '?';

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

        {/* Desktop links */}
        <div className="nav-links nav-links-desktop">
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
            <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="nav-avatar"
                title={username}
              >
                {initial}
              </button>

              {menuOpen && (
                <div className="nav-avatar-menu">
                  <div className="nav-avatar-menu-header">
                    <div className="nav-avatar-menu-name">{username}</div>
                    <div className="nav-avatar-menu-sub">
                      {isAdmin ? 'Administrator' : 'Signed in'}
                    </div>
                  </div>

                  <Link
                    href="/settings"
                    className="nav-avatar-menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Settings
                  </Link>

                  <button
                    type="button"
                    className="nav-avatar-menu-item nav-avatar-menu-logout"
                    onClick={logoutNow}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <Link href="/apply" className="btn btn-primary btn-sm">Apply Now</Link>
        </div>

        {/* Mobile: Avatar + Hamburger */}
        <div className="nav-mobile-actions">
          {mounted && isAuth && (
            <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="nav-avatar"
                title={username}
              >
                {initial}
              </button>

              {menuOpen && (
                <div className="nav-avatar-menu">
                  <div className="nav-avatar-menu-header">
                    <div className="nav-avatar-menu-name">{username}</div>
                    <div className="nav-avatar-menu-sub">
                      {isAdmin ? 'Administrator' : 'Signed in'}
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    className="nav-avatar-menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="nav-avatar-menu-item nav-avatar-menu-logout"
                    onClick={logoutNow}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="nav-mobile-panel">
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

          <Link href="/apply" className="btn btn-primary" style={{ marginTop: 12, textAlign: 'center' }}>
            Apply Now
          </Link>
        </div>
      )}
    </nav>
  );
}