import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('shadybiz_logged_in') === 'true') {
      navigate('/')
    }
  }, [navigate])


  const handleLogin = (e) => {
    e.preventDefault()
    
    // Check if both fields are not empty (case-insensitive check by converting to lowercase, 
    // although any non-empty string is valid).
    const normalizedUsername = username.trim().toLowerCase()
    const normalizedPassword = password.trim().toLowerCase()

    if (!normalizedUsername || !normalizedPassword) {
      setError('Please enter both a username and password.')
      return
    }

    localStorage.setItem('shadybiz_logged_in', 'true')
    localStorage.setItem('shadybiz_username', username.trim())
    navigate('/')
  }

  return (
    <section className="section" style={{ paddingTop: 80, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container-sm">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Shady<span style={{ color: 'var(--accent)' }}>Biz</span> Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Please log in to access compliance & IT support services.
          </p>
        </div>

        <div className="glass" style={{ padding: 36, maxWidth: 420, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 24 }}>Sign In</h2>
          
          {error && (
            <div style={{ 
              background: 'rgba(255, 59, 48, 0.08)', 
              color: 'var(--danger)', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-xs)', 
              fontSize: '0.875rem', 
              marginBottom: 20,
              border: '1px solid rgba(255, 59, 48, 0.15)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text"
                className="form-input" 
                placeholder="e.g. admin" 
                value={username} 
                onChange={e => {
                  setUsername(e.target.value)
                  setError('')
                }} 
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => {
                  setPassword(e.target.value)
                  setError('')
                }} 
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ padding: '14px 24px' }}>
              Access Platform
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
