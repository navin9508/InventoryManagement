import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1400);
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0d1f0e;
          position: relative;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }

        .login-bg {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600')
            center/cover no-repeat;
          filter: brightness(0.35);
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: float 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #16a34a, transparent);
          top: -100px;
          left: -100px;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #15803d, transparent);
          bottom: -80px;
          right: -80px;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #4ade80, transparent);
          top: 40%;
          left: 60%;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-30px);
          }
        }

        .login-card {
          position: relative;
          z-index: 2;
          width: 420px;
          max-width: calc(100vw - 2rem);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 2.5rem;
          border: 1px solid rgba(255,255,255,0.12);
          color: white;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .login-brand {
          text-align: center;
          margin-bottom: 2rem;
        }

        .brand-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 1rem;
          border-radius: 20px;
          background: linear-gradient(135deg, #16a34a, #166534);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2rem;
          box-shadow: 0 10px 25px rgba(22,163,74,0.4);
        }

        .brand-name {
          font-size: 2rem;
          font-weight: bold;
        }

        .brand-sub {
          margin-top: 0.4rem;
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
        }

        .stats-strip {
          display: flex;
          gap: 0.8rem;
          margin-bottom: 1.6rem;
        }

        .stat-box {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 0.8rem;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .stat-val {
          font-size: 1.1rem;
          font-weight: bold;
          color: #4ade80;
        }

        .stat-lbl {
          margin-top: 0.2rem;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.55);
        }

        .form-group {
          margin-bottom: 1.2rem;
        }

        .field-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
          font-weight: 600;
        }

        .field-wrap {
          position: relative;
        }

        .field-icon {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          font-size: 1rem;
        }

        .field-input {
          width: 100%;
          padding: 14px 14px 14px 42px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.08);
          color: white;
          outline: none;
          transition: 0.2s ease;
          font-size: 0.95rem;
        }

        .field-input::placeholder {
          color: rgba(255,255,255,0.35);
        }

        .field-input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.15);
        }

        .toggle-pass {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1rem;
        }

        .login-error {
          background: rgba(255,0,0,0.15);
          padding: 0.8rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          color: #ffb4b4;
          font-size: 0.9rem;
        }

        .forgot-link {
          color: #4ade80;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .login-submit {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          margin-top: 0.6rem;
          transition: 0.2s ease;
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(22,163,74,0.35);
        }

        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.45);
        }

        .footer-link {
          color: #4ade80;
          text-decoration: none;
        }

        .footer-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-root">
        <div className="login-bg"></div>

        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="login-card">

          <div className="login-brand">
            <div className="brand-icon">🌱</div>

            <div className="brand-name">Rakshion Agro Solution</div>

            <div className="brand-sub">
              Irrigation & Hardware Management
            </div>
          </div>
          {error && (
            <div className="login-error">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label className="field-label">Username</label>

              <div className="field-wrap">
                <span className="field-icon">👤</span>

                <input
                  type="text"
                  className="field-input"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Password</label>

              <div className="field-wrap">
                <span className="field-icon">🔒</span>

                <input
                  type={showPass ? 'text' : 'password'}
                  className="field-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '44px' }}
                />

                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div
              style={{
                textAlign: 'right',
                marginBottom: '1rem'
              }}
            >
              <a href="#" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>

          </form>

          <div className="login-footer">
            <p>Secure login · AquaFlow v2.0</p>

            <p style={{ marginTop: '.4rem' }}>
              Need access?{' '}
              <a href="#" className="footer-link">
                Contact admin
              </a>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;