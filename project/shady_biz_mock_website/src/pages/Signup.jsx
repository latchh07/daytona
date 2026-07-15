import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') || 'professional'
  const planPrices = { starter: 29, professional: 79, enterprise: 199 }
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', company: '', industry: '', teamSize: ''
  })
  const [addonChecked, setAddonChecked] = useState(true)
  const [autoRenew, setAutoRenew] = useState(true)
  const [complianceMonitoring, setComplianceMonitoring] = useState(false)

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const StepProgress = () => (
    <div className="step-progress">
      {[1, 2, 3, 4, 5].map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <div className={`step-line${s <= step ? ' done' : ''}`} />}
          <div className={`step-dot${s === step ? ' active' : s < step ? ' done' : ''}`}>
            {s < step ? '✓' : s}
          </div>
        </React.Fragment>
      ))}
    </div>
  )

  return (
    <section className="section" style={{paddingTop: 48}}>
      <div className="container-sm">
        <StepProgress />

        {step === 1 && (
          <div className="glass" style={{padding: 36}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em'}}>Create your account</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 28}}>Step 1 of 5 — Account information</p>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Smith" value={formData.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input className="form-input" type="email" placeholder="john@company.com" value={formData.email} onChange={e => updateField('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Create a strong password" value={formData.password} onChange={e => updateField('password', e.target.value)} />
            </div>
            <button className="btn btn-primary btn-full" style={{marginTop: 8}} onClick={() => setStep(2)}>Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="glass" style={{padding: 36}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em'}}>Tell us about your business</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 28}}>Step 2 of 5 — Business details</p>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" placeholder="Acme Inc." value={formData.company} onChange={e => updateField('company', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <select className="form-input" value={formData.industry} onChange={e => updateField('industry', e.target.value)}>
                <option value="">Select your industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Team Size</label>
              <select className="form-input" value={formData.teamSize} onChange={e => updateField('teamSize', e.target.value)}>
                <option value="">Select team size</option>
                <option value="1-5">1–5</option>
                <option value="6-20">6–20</option>
                <option value="21-50">21–50</option>
                <option value="51-200">51–200</option>
                <option value="200+">200+</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" style={{marginTop: 8}} onClick={() => setStep(3)}>Continue</button>
          </div>
        )}

        {step === 3 && (
          <div className="glass" style={{padding: 36}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em'}}>Confirm your plan</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 28}}>Step 3 of 5 — Plan & preferences</p>

            <div className="card" style={{padding: 20, marginBottom: 24, textAlign: 'center'}}>
              <p style={{fontWeight: 600, marginBottom: 4, textTransform: 'capitalize'}}>{plan} Plan</p>
              <p style={{fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em'}}>${planPrices[plan]}<span style={{fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)'}}>/mo</span></p>
            </div>

            <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: sneaking / pre-checked_addon -->'}} style={{display:'contents'}} />
            <div className="checkbox-row">
              <input type="checkbox" id="addon" checked={addonChecked} onChange={() => setAddonChecked(!addonChecked)} />
              <label htmlFor="addon" className="checkbox-label">
                <strong>Priority Support Add-on</strong> (+$15/mo) — Faster response times and dedicated support channel.
              </label>
            </div>

            <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: sneaking / hidden_auto_renewal -->'}} style={{display:'contents'}} />
            <div className="toggle-row" style={{marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 16}}>
              <span className="toggle-label">Enable auto-renewal</span>
              <input type="checkbox" className="toggle-switch" checked={autoRenew} onChange={() => setAutoRenew(!autoRenew)} />
            </div>

            <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: sneaking / buried_consent -->'}} style={{display:'contents'}} />
            <p className="fine-print" style={{marginTop: 20}}>By continuing, you agree to our <a href="/terms">Terms of Service</a> including auto-renewal policy.</p>

            <button className="btn btn-primary btn-full" style={{marginTop: 24}} onClick={() => setStep(4)}>Continue</button>
          </div>
        )}

        {step === 4 && (
          <>
            <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: sneaking / forced_upsell_interstitial -->'}} style={{display:'contents'}} />
            <div className="interstitial">
              <h2>Wait — add Compliance Monitoring?</h2>
              <p>Stay ahead of regulatory changes with real-time monitoring and instant alerts.</p>
              <div className="glass" style={{maxWidth: 380, margin: '0 auto 24px', padding: 32}}>
                <div className="upsell-price">$9<span style={{fontSize: '1rem', fontWeight: 400}}>/mo</span></div>
                <ul style={{listStyle: 'none', textAlign: 'left', marginTop: 16}}>
                  <li style={{padding: '6px 0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8}}><span style={{color: 'var(--success)'}}>✓</span> Real-time regulatory updates</li>
                  <li style={{padding: '6px 0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8}}><span style={{color: 'var(--success)'}}>✓</span> Automated compliance alerts</li>
                  <li style={{padding: '6px 0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8}}><span style={{color: 'var(--success)'}}>✓</span> Risk assessment reports</li>
                </ul>
              </div>
              <button className="btn btn-primary btn-full" style={{maxWidth: 380, margin: '0 auto'}} onClick={() => { setComplianceMonitoring(true); setStep(5); }}>Yes, add Compliance Monitoring</button>
              <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: confirmshaming / guilt_decline -->'}} style={{display:'contents'}} />
              <button className="skip-link" onClick={() => setStep(5)} style={{marginTop: 16, display: 'block', margin: '16px auto 0', fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontStyle: 'italic'}}>No thanks, I'll risk falling behind</button>
            </div>
          </>
        )}

        {step === 5 && (
          <div className="glass" style={{padding: 36, textAlign: 'center'}}>
            <div style={{fontSize: '3rem', marginBottom: 16}}>🎉</div>
            <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em'}}>You're all set!</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 28}}>Here's a summary of your selections:</p>
            <div className="card" style={{padding: 20, textAlign: 'left', marginBottom: 24}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9375rem'}}>
                <span style={{color: 'var(--text-secondary)', textTransform: 'capitalize'}}>{plan} Plan</span>
                <span style={{fontWeight: 600}}>${planPrices[plan]}/mo</span>
              </div>
              {addonChecked && (
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9375rem'}}>
                  <span style={{color: 'var(--text-secondary)'}}>Priority Support</span>
                  <span style={{fontWeight: 600}}>$15/mo</span>
                </div>
              )}
              {complianceMonitoring && (
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9375rem'}}>
                  <span style={{color: 'var(--text-secondary)'}}>Compliance Monitoring</span>
                  <span style={{fontWeight: 600}}>$9/mo</span>
                </div>
              )}
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9375rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Auto-renewal</span>
                <span style={{fontWeight: 600}}>{autoRenew ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-large" onClick={() => navigate('/checkout')}>Continue to Payment</button>
          </div>
        )}
      </div>
    </section>
  )
}
