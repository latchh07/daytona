import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  const [time, setTime] = useState({ h: 4, m: 59, s: 32 })
  const [proofIndex, setProofIndex] = useState(0)
  const proofMessages = [
    '127 businesses signed up in the last hour',
    'Acme Corp just subscribed — 2 min ago',
    '89 compliance audits completed today'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        const totalSec = prev.h * 3600 + prev.m * 60 + prev.s - 1
        if (totalSec <= 0) return { h: 4, m: 59, s: 32 }
        return {
          h: Math.floor(totalSec / 3600),
          m: Math.floor((totalSec % 3600) / 60),
          s: totalSec % 60
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const ticker = setInterval(() => {
      setProofIndex(i => (i + 1) % proofMessages.length)
    }, 5000)
    return () => clearInterval(ticker)
  }, [])

  const fmt = n => String(n).padStart(2, '0')

  return (
    <>
      <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: fake_urgency / resetting_countdown -->'}} style={{display:'contents'}} />
      <div className="urgency-banner">
        Limited-time offer — Save 40% on all plans.
        <span className="countdown"> {fmt(time.h)}:{fmt(time.m)}:{fmt(time.s)}</span>
      </div>

      <section className="hero">
        <div className="container">
          <h1 className="section-title">Compliance & IT support,<br/>simplified.</h1>
          <p className="section-subtitle">One platform for regulatory compliance, IT management, and business security. Built for teams that move fast.</p>
          <div style={{marginTop: 32}}>
            <Link to="/pricing" className="btn btn-primary btn-large">View Plans</Link>
          </div>
          <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: fake_urgency / fake_scarcity -->'}} style={{display:'contents'}} />
          <div className="scarcity-badge" style={{marginTop: 20}}>Only 3 spots left at this price</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{textAlign:'center', fontSize:'2rem'}}>Everything your business needs</h2>
          <div className="feature-grid">
            <div className="feature-card glass">
              <div className="icon">🛡️</div>
              <h3>Compliance Automation</h3>
              <p>Automated regulatory checks, real-time alerts, and audit-ready reports.</p>
            </div>
            <div className="feature-card glass">
              <div className="icon">💻</div>
              <h3>IT Support</h3>
              <p>24/7 monitoring, incident response, and managed infrastructure.</p>
            </div>
            <div className="feature-card glass">
              <div className="icon">📊</div>
              <h3>Business Analytics</h3>
              <p>Actionable insights, risk scoring, and performance dashboards.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{textAlign:'center', paddingTop: 0}}>
        <p style={{color:'var(--text-muted)', fontSize:'0.9375rem'}}>Trusted by 2,000+ small businesses across 40 industries.</p>
      </section>

      <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: fake_urgency / fake_social_proof -->'}} style={{display:'contents'}} />
      <div className="social-proof-ticker">
        <div className="glass">
          <span className="dot"></span>
          <span>{proofMessages[proofIndex]}</span>
        </div>
      </div>
    </>
  )
}
