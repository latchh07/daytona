import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const [showExitModal, setShowExitModal] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleMouseOut = (e) => {
      if (e.clientY <= 0 && !showExitModal) {
        setShowExitModal(true)
      }
    }
    document.addEventListener('mouseout', handleMouseOut)
    return () => document.removeEventListener('mouseout', handleMouseOut)
  }, [showExitModal])

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('shadybiz_subscribed', 'true')
    navigate('/dashboard')
  }

  return (
    <section className="section" style={{paddingTop: 48}}>
      <div className="container-sm">
        <div style={{textAlign: 'center', marginBottom: 36}}>
          <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8}}>Step 3 of 3</p>
          <h1 style={{fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em'}}>Review & Pay</h1>
        </div>

        <div className="glass order-summary">
          <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: 16}}>Order Summary</h3>
          <div className="line-item">
            <span>Professional Plan</span>
            <span>$79.00/mo</span>
          </div>
          <div className="line-item">
            <span>Priority Support Add-on</span>
            <span>$15.00/mo</span>
          </div>
          <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: sneaking / hidden_activation_fee -->'}} style={{display:'contents'}} />
          <div className="line-item">
            <span style={{color: 'var(--text-secondary)'}}>One-time activation fee</span>
            <span>$49.00</span>
          </div>
          <div className="line-item total">
            <span>Due today</span>
            <span>$143.00</span>
          </div>
          <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: sneaking / split_cost_disclosure -->'}} style={{display:'contents'}} />
          <p className="fine-print">Recurring charges of $94.00/mo begin after your first billing cycle. Activation fee is non-refundable. See <a href="/terms">full terms</a>.</p>
        </div>

        <div className="glass" style={{padding: 28, marginTop: 24}}>
          <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: 20}}>Payment Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input className="form-input" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
            </div>
            <div style={{display: 'flex', gap: 16}}>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">Expiry</label>
                <input className="form-input" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">CVC</label>
                <input className="form-input" placeholder="123" value={cardCvc} onChange={e => setCardCvc(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Name on Card</label>
              <input className="form-input" placeholder="Full name as shown on card" value={cardName} onChange={e => setCardName(e.target.value)} />
            </div>
            <p className="fine-print">Your card will be charged $143.00 today. Subscription renews automatically.</p>
            <button type="submit" className="btn btn-primary btn-full btn-large" style={{marginTop: 24}}>Complete Purchase</button>
          </form>
        </div>
      </div>

      {showExitModal && (
        <>
          <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: confirmshaming / exit_intent_modal -->'}} style={{display:'contents'}} />
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowExitModal(false) }}>
            <div className="modal-content">
              <h2>Wait — are you sure?</h2>
              <p>Businesses without proper compliance coverage face an average of <strong>$47,000</strong> in regulatory penalties per year.</p>
              <button className="btn btn-primary btn-full" onClick={() => setShowExitModal(false)}>Yes, keep my business protected</button>
              <button className="modal-dismiss" onClick={() => setShowExitModal(false)}>No thanks, I like risking penalties</button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
