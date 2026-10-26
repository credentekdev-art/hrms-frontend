import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Quote } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage(){
  const { user, login } = useAuth()
  const [email, setEmail] = useState('manager@hrms.local')
  const [password, setPassword] = useState('Manager@123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try { await login(email, password) }
    catch { setError('We could not sign you in. Please check your email and password.') }
    finally { setLoading(false) }
  }

  return (
    <div className="loginPageV2">
      <section className="loginStory">
        <div className="loginStoryGlow one" />
        <div className="loginStoryGlow two" />
        <div className="loginBrandRow">
          <div className="logoSurface"><img src="/credentek-logo.png" alt="CredenTek" /></div>
          <span className="productBadge">HRMS Suite</span>
        </div>

        <div className="loginStoryContent">
          <span className="loginKicker">Kritika AI</span>
          <h1>Kritika AI<br/><em>HR Assistant</em></h1>
          <p className="loginLead">Manage candidates, schedule interviews, and scale your team in one unified workspace.</p>

          <div className="testimonialCard">
            <Quote size={26} />
            <p>“Streamlined our hiring process by 40% in the first month. An absolute game changer.”</p>
            <div className="testimonialPerson">
              <div className="testimonialAvatar">T</div>
              <div><strong>Team</strong><span>Head of HR</span></div>
            </div>
          </div>
        </div>
        <div className="loginStoryFooter">People operations, simplified.</div>
      </section>

      <section className="loginFormPanel">
        <form onSubmit={submit} className="loginCardV2">
          <div className="mobileLoginLogo"><img src="/credentek-logo.png" alt="CredenTek" /></div>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to Kritika AI</h2>
          <p>Access your resource planning workspace.</p>

          <label>Email address
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="username" placeholder="name@company.com" />
          </label>
          <label>Password
            <div className="passwordField">
              <input value={password} onChange={e=>setPassword(e.target.value)} type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Enter your password" />
              <button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button>
            </div>
          </label>

          {error && <div className="errorBox">{error}</div>}
          <button className="button primary wide loginButton" disabled={loading}>{loading?'Signing in…':<>Sign in <ArrowRight size={17}/></>}</button>
          <div className="demoHint"><strong>Demo Manager</strong><span>manager@hrms.local / Manager@123</span></div>
        </form>
        <footer className="loginCopyright">© 2026 CredenTek Software & Consultancy Pvt. Ltd. All rights reserved.</footer>
      </section>
    </div>
  )
}
