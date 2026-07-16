import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const { pathname } = useLocation()
  const isDashboard = pathname.startsWith('/dashboard')

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="logo">
            Shady<span>Biz</span>
          </Link>
          <ul className="nav-links">
            {isDashboard ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/dashboard/billing">Billing</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/terms">Terms</Link></li>
                <li><Link to="/pricing" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8125rem' }}>Get Started</Link></li>
              </>
            )}
          </ul>
        </div>
      </header>
      <main className="page-main">
        <Outlet />
      </main>
      {!isDashboard && (
        <footer className="site-footer">
          <p>© 2025 ShadyBiz, Inc. All rights reserved.</p>
          <div style={{ marginTop: 8 }}>
            <Link to="/terms">Terms of Service</Link>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact</a>
          </div>
        </footer>
      )}
    </>
  )
}
