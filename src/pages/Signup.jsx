// src/pages/auth/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpEmail, signInGoogle } from "../lib/firebase";
import "./Auth.css";

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// Password strength meter
function StrengthMeter({ password }) {
  const getStrength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  };
  const strength = getStrength(password);
  const labels   = ["", "Weak", "Fair", "Good", "Strong"];
  const colors   = ["", "#e07070", "#e8a040", "#a0c060", "#5cb88a"];

  if (!password) return null;
  return (
    <div className="strength-meter">
      <div className="strength-bars">
        {[1,2,3,4].map(n => (
          <div
            key={n}
            className="strength-bar"
            style={{ background: n <= strength ? colors[strength] : "var(--ink-100)" }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const friendlyError = (code) => {
    const map = {
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/invalid-email":        "Please enter a valid email address.",
      "auth/weak-password":        "Password must be at least 6 characters.",
      "auth/network-request-failed": "Network error. Check your connection.",
    };
    return map[code] || "Something went wrong. Please try again.";
  };

  const validate = () => {
    if (!name.trim())          return "Please enter your name.";
    if (!email)                return "Please enter your email.";
    if (password.length < 6)   return "Password must be at least 6 characters.";
    if (password !== confirm)  return "Passwords don't match.";
    return null;
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError("");
    setLoading(true);
    try {
      await signUpEmail(email, password, name.trim());
      navigate("/login");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGLoading(true);
    try {
      await signInGoogle();
      navigate("/explore");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(friendlyError(err.code));
      }
    } finally {
      setGLoading(false);
    }
  };

  const passwordsMatch = confirm && password === confirm;
  const passwordsMismatch = confirm && password !== confirm;

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-panel__inner">
          <div className="auth-brand">
            <span className="auth-brand__heart" style={{color:"#d4748a"}}>♡</span>
            <span className="auth-brand__name" style={{color:"#d4748a"}}>Whisper</span>
          </div>
          <p className="auth-panel__tagline">
            Your feelings<br />deserve a<br />safe home.
          </p>
          <div className="auth-panel__petals" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="petal" style={{ "--i": i }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          {/* Mobile brand */}
          <div className="auth-brand auth-brand--mobile">
            <span className="auth-brand__heart">♡</span>
            <span className="auth-brand__name">Whisper</span>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-title" style={{textAlign:"center", color:"#d4748a", fontSize:"20px"}}>CREATE ACCOUNT</h1>
            <p className="auth-subtitle" style={{textAlign:"center"}}>Join a space built on love & anonymity</p>
          </div>

          {/* Google */}
          <button
            className="google-btn"
            onClick={handleGoogle}
            disabled={gLoading || loading}
            type="button"
            style={{backgroundColor:"#f7d4dc", margin:"10px"}}
          >
            {gLoading ? <span className="auth-spinner" /> : <GoogleIcon />}
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider" style={{color:"green"}}><span>or sign up with email</span></div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleEmail} noValidate>
            <div className="field">
              <label className="field__label" htmlFor="signup-name">Your name</label>
              <input
                id="signup-name"
                type="text"
                className="field__input"
                placeholder="How should we call you?"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                autoFocus
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                className="field__input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="signup-password">Password</label>
              <div className="field__input-wrap">
                <input
                  id="signup-password"
                  type={showPass ? "text" : "password"}
                  className="field__input"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="field__eye"
                  onClick={() => setShowPass(v => !v)}
                  aria-label="Toggle password"
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <StrengthMeter password={password} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="signup-confirm">Confirm password</label>
              <div className="field__input-wrap">
                <input
                  id="signup-confirm"
                  type={showConf ? "text" : "password"}
                  className={`field__input ${passwordsMismatch ? "field__input--error" : ""} ${passwordsMatch ? "field__input--success" : ""}`}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="field__eye"
                  onClick={() => setShowConf(v => !v)}
                  aria-label="Toggle confirm password"
                >
                  {showConf ? <EyeOffIcon /> : <EyeIcon />}
                </button>
                {passwordsMatch    && <span className="field__check">✓</span>}
                {passwordsMismatch && <span className="field__cross">✕</span>}
              </div>
              {passwordsMismatch && (
                <span className="field__hint field__hint--error">Passwords don't match</span>
              )}
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className={`auth-submit ${loading ? "loading" : ""}`}
              disabled={loading || gLoading || !name || !email || !password || !confirm}
              style={{backgroundColor:"pink", marginTop:"15px", marginBottom:"10px"}}
            >
              {loading
                ? <><span className="auth-spinner"  style={{color:"#d4748a"}}/> Creating account…</>
                : "Create account"
              }
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch__link" style={{color:"#d4748a"}}>Sign in</Link>
          </p>

          <p className="auth-legal" style={{fontSize:"12px", color:"green"}}>
            *Your confessions are always anonymous. Your name is only used for your profile.
          </p>
        </div>
      </div>
    </div>
  );
}