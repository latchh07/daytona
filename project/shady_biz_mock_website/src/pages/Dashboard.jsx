import { Link } from 'react-router-dom'

export default function Dashboard() {
  const activities = [
    { text: 'Compliance check completed — GDPR module', time: '2 hours ago' },
    { text: 'IT ticket #1847 resolved', time: '5 hours ago' },
    { text: 'Monthly analytics report generated', time: '1 day ago' },
    { text: 'Security scan passed — no issues found', time: '2 days ago' },
  ]

  return (
    <div className="dashboard-layout">
      <aside className="dash-sidebar">
        <nav>
          <Link to="/dashboard" className="active">Overview</Link>
          <a href="#">Compliance</a>
          <a href="#">IT Support</a>
          <a href="#">Analytics</a>
          <a href="#">Settings</a>
          <Link to="/dashboard/billing">Billing</Link>
        </nav>
      </aside>
      <div className="dash-main">
        <h1>Welcome back, Alex</h1>
        <div className="stat-grid">
          <div className="stat-card glass">
            <div className="stat-label">Compliance Score</div>
            <div className="stat-value">94%</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-label">Open Tickets</div>
            <div className="stat-value">3</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-label">Uptime</div>
            <div className="stat-value">99.97%</div>
          </div>
        </div>
        <div className="glass" style={{padding: 28}}>
          <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: 20}}>Recent Activity</h3>
          {activities.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: i < activities.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: '0.875rem'
            }}>
              <span>{item.text}</span>
              <span style={{color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 16}}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
