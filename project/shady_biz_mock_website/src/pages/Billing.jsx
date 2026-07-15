import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Billing() {
  const [cancelStep, setCancelStep] = useState(0)
  const [pauseDuration, setPauseDuration] = useState('1month')
  const [cancelReason, setCancelReason] = useState('')
  const [feedback, setFeedback] = useState('')

  if (cancelStep > 0) {
    return (
      <section style={{padding: '80px 0'}}>
        <div className="container-sm">
          <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: roach_motel / cancellation_gauntlet -->'}} style={{display:'contents'}} />
          <p className="cancel-progress">Step {cancelStep} of 8</p>

          {cancelStep === 1 && (
            <div className="cancel-step">
              <h2>We'd hate to see you go</h2>
              <p>Help us understand why you're leaving.</p>
              <div style={{maxWidth: 380, margin: '0 auto 24px', textAlign: 'left'}}>
                {['Too expensive', 'Not using it enough', 'Switching to competitor', 'Missing features', 'Other'].map(reason => (
                  <label key={reason} style={{
                    display: 'block', padding: '10px 16px', margin: '4px 0',
                    borderRadius: 8, border: `1px solid ${cancelReason === reason ? 'var(--accent)' : 'var(--border)'}`,
                    background: cancelReason === reason ? 'var(--accent-light)' : 'transparent',
                    cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s'
                  }}>
                    <input type="radio" name="cancelReason" value={reason} checked={cancelReason === reason}
                      onChange={() => setCancelReason(reason)} style={{marginRight: 10}} />
                    {reason}
                  </label>
                ))}
              </div>
              <button className="btn btn-primary btn-full" onClick={() => setCancelStep(2)}>Continue</button>
            </div>
          )}

          {cancelStep === 2 && (
            <div className="cancel-step">
              <h2>What if we made it more affordable?</h2>
              <p>We can offer you an exclusive discount to keep your business protected.</p>
              <div className="offer-box">
                <p style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 4}}>Exclusive offer</p>
                <div className="offer-price">50% off</div>
                <p style={{fontSize: '0.9375rem', marginTop: 4}}>for 3 months</p>
                <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 8}}>$47.00/mo instead of $94.00/mo</p>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => setCancelStep(0)}>Accept This Offer</button>
              <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: confirmshaming / guilt_decline -->'}} style={{display:'contents'}} />
              <button className="shameful-decline" onClick={() => setCancelStep(3)}>No thanks, I prefer to overpay elsewhere</button>
            </div>
          )}

          {cancelStep === 3 && (
            <div className="cancel-step">
              <h2>How about a different plan?</h2>
              <p>Downgrade to Starter and keep essential features at a lower cost.</p>
              <div className="offer-box">
                <div className="offer-price">$29/mo</div>
                <p style={{fontSize: '0.9375rem', marginTop: 4}}>Starter Plan</p>
                <ul style={{listStyle: 'none', textAlign: 'left', marginTop: 12}}>
                  <li style={{padding: '4px 0', fontSize: '0.875rem'}}>✓ 5 compliance checks/mo</li>
                  <li style={{padding: '4px 0', fontSize: '0.875rem'}}>✓ Email support</li>
                  <li style={{padding: '4px 0', fontSize: '0.875rem'}}>✓ Basic reporting</li>
                </ul>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => setCancelStep(0)}>Downgrade to Starter</button>
              <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: confirmshaming / guilt_decline -->'}} style={{display:'contents'}} />
              <button className="shameful-decline" onClick={() => setCancelStep(4)}>No, I don't need compliance protection</button>
            </div>
          )}

          {cancelStep === 4 && (
            <div className="cancel-step">
              <h2>Need a break? Pause instead.</h2>
              <p>Pause your subscription and come back when you're ready. Your data stays safe.</p>
              <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: roach_motel / pause_deflection -->'}} style={{display:'contents'}} />
              <select className="form-input" style={{maxWidth: 240, margin: '0 auto 20px', display: 'block'}}
                value={pauseDuration} onChange={e => setPauseDuration(e.target.value)}>
                <option value="1month">1 month</option>
                <option value="2months">2 months</option>
                <option value="3months">3 months</option>
              </select>
              <button className="btn btn-primary btn-full" onClick={() => setCancelStep(0)}>Pause My Subscription</button>
              <button className="shameful-decline" onClick={() => setCancelStep(5)}>No, just cancel it</button>
            </div>
          )}

          {cancelStep === 5 && (
            <div className="cancel-step">
              <h2>Here's what you'll lose</h2>
              <p style={{color: 'var(--danger)'}}>If you cancel, you will permanently lose access to:</p>
              <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: confirmshaming / loss_aversion -->'}} style={{display:'contents'}} />
              <div style={{textAlign: 'left', maxWidth: 320, margin: '0 auto 24px'}}>
                {['Compliance automation & alerts', 'Priority IT support', 'Business analytics dashboard', 'Audit-ready reports', 'API access'].map(item => (
                  <div key={item} style={{padding: '8px 0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 10}}>
                    <span style={{color: 'var(--danger)', fontWeight: 700}}>✕</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full" onClick={() => setCancelStep(0)}>Keep My Account</button>
              <button className="shameful-decline" onClick={() => setCancelStep(6)}>I don't need reliable support</button>
            </div>
          )}

          {cancelStep === 6 && (
            <div className="cancel-step">
              <h2>One more thing...</h2>
              <p>Is there anything we could have done differently?</p>
              <textarea className="form-input" style={{minHeight: 120, resize: 'vertical', maxWidth: 420, margin: '0 auto', display: 'block'}}
                value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Your feedback helps us improve..." />
              <button className="btn btn-primary btn-full" style={{marginTop: 20}} onClick={() => setCancelStep(7)}>Submit & Continue</button>
            </div>
          )}

          {cancelStep === 7 && (
            <div className="cancel-step">
              <h2>⚠️ Your data will be deleted</h2>
              <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: roach_motel / data_loss_threat -->'}} style={{display:'contents'}} />
              <p style={{color: 'var(--danger)'}}>After cancellation, all compliance records, reports, and configurations will be permanently deleted after 30 days. This action cannot be undone.</p>
              <button className="btn btn-primary btn-full" onClick={() => setCancelStep(0)}>Keep My Data & Account</button>
              <button className="shameful-decline" onClick={() => setCancelStep(8)}>I understand, continue cancellation</button>
            </div>
          )}

          {cancelStep === 8 && (
            <div className="cancel-step">
              <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: roach_motel / forced_phone_cancellation -->'}} style={{display:'contents'}} />
              <h2>Almost there</h2>
              <p>To complete your cancellation, please contact our retention team by phone.</p>
              <div style={{fontSize: '1.75rem', fontWeight: 700, margin: '24px 0'}}>(555) 010-1234</div>
              <p style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>Monday – Friday, 9:00 AM – 5:00 PM EST</p>
              <p style={{marginTop: 20, fontSize: '0.9375rem', color: 'var(--text-secondary)'}}>We're unable to process cancellations online at this time. A team member will be happy to assist you.</p>
              <Link to="/dashboard/billing" className="btn btn-primary btn-full" style={{marginTop: 32}}
                onClick={() => setCancelStep(0)}>Return to Dashboard</Link>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <div className="dashboard-layout">
      <aside className="dash-sidebar">
        <nav>
          <Link to="/dashboard">Overview</Link>
          <a href="#">Compliance</a>
          <a href="#">IT Support</a>
          <a href="#">Analytics</a>
          <a href="#">Settings</a>
          <Link to="/dashboard/billing" className="active">Billing</Link>
        </nav>
      </aside>
      <div className="dash-main">
        <h1>Billing & Subscription</h1>

        <div className="glass billing-info">
          <div className="row"><span className="label">Current Plan</span><span className="value">Professional</span></div>
          <div className="row"><span className="label">Monthly Cost</span><span className="value">$94.00/mo</span></div>
          <div className="row"><span className="label">Next Billing Date</span><span className="value">August 15, 2025</span></div>
          <div className="row"><span className="label">Payment Method</span><span className="value">Visa ending in 4242</span></div>
          <div className="row"><span className="label">Auto-Renewal</span><span className="value">Enabled</span></div>
        </div>

        <h3 style={{marginTop: 32, marginBottom: 16, fontWeight: 600}}>Billing History</h3>
        <div className="glass" style={{padding: 24}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem'}}>
            <thead>
              <tr>
                {['Date', 'Description', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 0', borderBottom: '1px solid var(--border)',
                    color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem',
                    textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Jul 15, 2025', desc: 'Monthly subscription', amount: '$94.00', status: 'Paid' },
                { date: 'Jul 15, 2025', desc: 'Activation fee', amount: '$49.00', status: 'Paid' },
                { date: 'Jun 15, 2025', desc: 'Monthly subscription', amount: '$94.00', status: 'Paid' },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{padding: '10px 0', borderBottom: '1px solid var(--border)'}}>{row.date}</td>
                  <td style={{padding: '10px 0', borderBottom: '1px solid var(--border)'}}>{row.desc}</td>
                  <td style={{padding: '10px 0', borderBottom: '1px solid var(--border)'}}>{row.amount}</td>
                  <td style={{padding: '10px 0', borderBottom: '1px solid var(--border)'}}>
                    <span style={{
                      background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)',
                      padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600
                    }}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: roach_motel / hidden_cancel_link -->'}} style={{display:'contents'}} />
        <button className="cancel-link" style={{marginTop: 64}} onClick={() => setCancelStep(1)}>Cancel subscription</button>
      </div>
    </div>
  )
}
