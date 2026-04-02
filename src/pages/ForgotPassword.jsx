// src/pages/auth/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../lib/firebase";
import "./Auth.css";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      const map = {
        "auth/user-not-found":  "No account found with this email.",
        "auth/invalid-email":   "Please enter a valid email address.",
      };
      setError(map[err.code] || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-panel auth-panel--right" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="auth-form-wrap">
          <div className="auth-brand auth-brand--mobile">
            <span className="auth-brand__heart">♡</span>
            <span className="auth-brand__name">Whisper</span>
          </div>

          {sent ? (
            <div className="auth-sent">
              <div className="auth-sent__icon">💌</div>
              <h2 className="auth-title">Check your inbox</h2>
              <p className="auth-subtitle">
                We sent a reset link to <strong>{email}</strong>.
                Check your spam folder if you don't see it.
              </p>
              <Link to="/login" className="auth-submit auth-submit--link">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h1 className="auth-title">Reset password</h1>
                <p className="auth-subtitle">Enter your email and we'll send you a link</p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label className="field__label" htmlFor="fp-email">Email address</label>
                  <input
                    id="fp-email"
                    type="email"
                    className="field__input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="auth-error" role="alert">
                    <span>⚠</span> {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={`auth-submit ${loading ? "loading" : ""}`}
                  disabled={loading || !email}
                >
                  {loading
                    ? <><span className="auth-spinner" /> Sending…</>
                    : "Send reset link"
                  }
                </button>
              </form>

              <p className="auth-switch">
                Remembered it?{" "}
                <Link to="/login" className="auth-switch__link">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}