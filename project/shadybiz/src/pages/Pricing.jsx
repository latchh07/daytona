import { Link } from 'react-router-dom'

export default function Pricing() {
  return (
    <section className="section" style={{paddingTop: 60}}>
      <div className="container">
        <div style={{textAlign: 'center', marginBottom: 40}}>
          <h1 className="section-title">Simple, transparent pricing.</h1>
          <p className="section-subtitle" style={{margin: '0 auto'}}>Choose a plan that fits your business. No hidden fees.</p>
        </div>

        <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: fake_urgency / fake_discount_banner -->'}} style={{display:'contents'}} />
        <div className="discount-banner">🎉 Limited time: Save 40% — offer expires soon!</div>

        <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: sneaking / split_cost_disclosure -->'}} style={{display:'contents'}} />
        <div className="pricing-grid">
          <div className="pricing-card glass">
            <h3>Starter</h3>
            <div><span className="price-original">$49</span><span className="price">$29</span></div>
            <p className="price-period">per month</p>
            <ul>
              <li>5 compliance checks/mo</li>
              <li>Email support</li>
              <li>Basic reporting</li>
              <li>Single user</li>
            </ul>
            <Link to="/signup?plan=starter" className="btn btn-primary btn-full">Get Started</Link>
          </div>

          <div className="pricing-card glass featured">
            <span className="badge-popular">Most Popular</span>
            <h3>Professional</h3>
            <div><span className="price-original">$129</span><span className="price">$79</span></div>
            <p className="price-period">per month</p>
            <ul>
              <li>Unlimited compliance checks</li>
              <li>Priority email & chat support</li>
              <li>Advanced analytics</li>
              <li>Up to 10 users</li>
              <li>API access</li>
            </ul>
            <Link to="/signup?plan=professional" className="btn btn-primary btn-full">Get Started</Link>
          </div>

          <div className="pricing-card glass">
            <h3>Enterprise</h3>
            <div><span className="price-original">$329</span><span className="price">$199</span></div>
            <p className="price-period">per month</p>
            <ul>
              <li>Everything in Professional</li>
              <li>Dedicated account manager</li>
              <li>Custom integrations</li>
              <li>Unlimited users</li>
              <li>SLA guarantee</li>
              <li>On-site training</li>
            </ul>
            <Link to="/signup?plan=enterprise" className="btn btn-primary btn-full">Contact Sales</Link>
          </div>
        </div>

        <div dangerouslySetInnerHTML={{__html: '<!-- DARK_PATTERN: sneaking / vague_pricing_terms -->'}} style={{display:'contents'}} />
        <p className="fine-print" style={{textAlign:'center', marginTop: 32}}>Prices shown reflect limited-time promotional discount. See <Link to="/terms">terms</Link> for details.</p>
      </div>
    </section>
  )
}
