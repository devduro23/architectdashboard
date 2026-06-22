import { useState } from 'react';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();
    const result = await login(mobile, password);
    if (result.success) navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #C0392B 0%, #E8613C 100%)' }}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-lg"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              A
            </div>
            <span className="font-heading font-bold text-2xl text-white">ArchPortal</span>
          </div>

          {/* Hero text */}
          <h1 className="font-heading font-bold text-4xl xl:text-5xl leading-tight text-white mb-6">
            Your projects.
            <br />
            Your payouts.
            <br />
            Your portal.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Track your sites, monitor payout eligibility, and manage your performance — all in one place.
          </p>
        </div>

        {/* Feature pills */}
        <div className="space-y-3 mb-12">
          {[
            'Real-time payout visibility',
            'Site-wise performance tracking',
            'Secure, architect-only access',
          ].map((text) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.25)' }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Powered by ArchPortal &mdash; Confidential
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: '#FDF5F5' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-heading font-bold text-sm text-white"
              style={{ background: 'var(--brand)' }}>A</div>
            <span className="font-heading font-bold text-xl" style={{ color: 'var(--brand)' }}>ArchPortal</span>
          </div>

          <div className="card p-8">
            <h2 className="font-heading font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
              Sign In
            </h2>
            <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
              Enter your mobile number and password to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans' }}>
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="input-field pl-10"
                    required
                    autoFocus
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 mt-2"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
              Default password is your mobile number
            </p>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            Powered by ArchPortal &mdash; Confidential
          </p>
        </div>
      </div>
    </div>
  );
}
