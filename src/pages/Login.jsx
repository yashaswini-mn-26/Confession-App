// src/pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInEmail, signInGoogle } from "../lib/firebase";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const friendlyError = (code) => {
    const map = {
      "auth/user-not-found":      "No account found with this email.",
      "auth/wrong-password":      "Incorrect password. Try again.",
      "auth/invalid-credential":  "Incorrect email or password.",
      "auth/too-many-requests":   "Too many attempts. Please wait a moment.",
      "auth/user-disabled":       "This account has been disabled.",
      "auth/invalid-email":       "Please enter a valid email address.",
      "auth/network-request-failed": "Network error. Check your connection.",
    };
    return map[code] || "Something went wrong. Please try again.";
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError("");
    setLoading(true);
    try {
      await signInEmail(email, password);
      navigate("/explore");
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

  return (
    <div className="auth-page">
      {/* Left panel — decorative */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-panel__inner">
          <div className="auth-brand">
            <span className="auth-brand__heart" style={{color:"#d4748a"}}>♡</span>
            <span className="auth-brand__name" style={{color:"#d4748a"}}>Whisper</span>
          </div>
          <p className="auth-panel__tagline">
            Every heart<br />has a story<br />worth telling.
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
            <span className="auth-brand__heart" style={{color:"#d4748a"}}>♡</span>
            <span className="auth-brand__name" style={{color:"#d4748a"}}>Whisper</span>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-title" style={{textAlign:"center", color:"#d4748a", fontSize:"20px"}}>WELCOME BACK</h1>
            <p className="auth-subtitle" style={{textAlign:"center"}}>Sign in to continue sharing</p>
          </div>

          {/* Google button */}
          <button
            className="google-btn"
            onClick={handleGoogle}
            disabled={gLoading || loading}
            type="button"
            style={{backgroundColor:"#f7d4dc", margin:"10px"}}
          >
            {gLoading ? (
              <span className="auth-spinner" />
            ) : (
              <GoogleIcon />
            )}
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider">
            <span style={{color:"green"}}>or sign in with email</span>
          </div>

          {/* Email form */}
          <form className="auth-form" onSubmit={handleEmail} noValidate>
            <div className="field">
              <label className="field__label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="field__input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div className="field">
              <div className="field__labelrow">
                <label className="field__label" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="field__link">Forgot password?</Link>
              </div>
              <div className="field__input-wrap">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  className="field__input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="field__eye"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className={`auth-submit ${loading ? "loading" : ""}`}
              disabled={loading || gLoading || !email || !password}
               style={{backgroundColor:"pink", marginTop:"15px", marginBottom:"10px"}}
            >
              {loading ? <><span className="auth-spinner" /> Signing in…</> : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New to Whisper?{" "}
            <Link to="/signup" className="auth-switch__link" style={{color:"#d4748a"}}>Create an account</Link>
          </p>

          <p className="auth-legal">
            By signing in, you agree to share love anonymously and treat all hearts with kindness.
          </p>
        </div>
      </div>
    </div>
  );
}

// Inline SVG icons
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