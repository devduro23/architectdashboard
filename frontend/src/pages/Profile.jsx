import { useState } from 'react';
import { User, Phone, Briefcase, Award, KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import client from '../api/client';

function maskMobile(mobile) {
  if (!mobile) return '—';
  const m = mobile.toString();
  if (m.length < 4) return m;
  return m.slice(0, 2) + '****' + m.slice(-4);
}

const TIER_STYLE = {
  gold: 'badge-amber',
  silver: { background: '#F3F4F6', color: '#6B7280' },
  platinum: { background: '#EDE9FE', color: '#6D28D9' },
};

function TierBadge({ tier }) {
  if (!tier) return null;
  const key = tier.toLowerCase();
  if (key === 'silver') {
    return <span className="badge" style={TIER_STYLE.silver}>{tier}</span>;
  }
  if (key === 'platinum') {
    return <span className="badge" style={TIER_STYLE.platinum}>{tier}</span>;
  }
  return <span className="badge badge-amber">{tier}</span>;
}

export default function Profile() {
  const architect = useAuthStore((s) => s.architect);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await client.post('/auth/change-password', { currentPassword, newPassword });
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  function formatINR(val) {
    if (!val && val !== 0) return '—';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000)   return `₹${(val / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }

  const infoRows = [
    { icon: User,      label: 'Full Name',           value: architect?.name },
    { icon: Phone,     label: 'Mobile Number',        value: maskMobile(architect?.mobile) },
    { icon: Briefcase, label: 'Selling Branch',       value: architect?.selling_branch || 'Not assigned' },
    { icon: Briefcase, label: 'Mapped ISR',           value: architect?.mapped_isr || 'Not assigned' },
    { icon: Award,     label: 'Business Volume (23–25)', value: formatINR(architect?.total_business_amount) },
    { icon: Award,     label: 'Total Earned Payout',  value: formatINR(architect?.total_payout) },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your account information</p>
      </div>

      {/* Profile Card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-20" style={{ background: 'linear-gradient(135deg, #C0392B 0%, #E8613C 100%)' }} />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-9 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-bold text-2xl text-white border-4 border-white"
              style={{ background: 'linear-gradient(135deg, #C0392B 0%, #E8613C 100%)', boxShadow: '0 4px 12px rgba(192,57,43,0.25)' }}
            >
              {architect?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Name + Tier */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                {architect?.name}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Architect</p>
            </div>
            {architect?.tier && (
              <div className="flex items-center gap-2">
                <Award size={16} style={{ color: '#D97706' }} />
                <TierBadge tier={architect.tier} />
              </div>
            )}
          </div>

          {/* Info rows */}
          <div className="space-y-4">
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-page)' }}>
                <div className="stat-icon-block flex-shrink-0" style={{ background: 'var(--brand-light)', width: 36, height: 36 }}>
                  <Icon size={16} style={{ color: 'var(--brand)' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans' }}>{label}</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="stat-icon-block" style={{ background: 'var(--brand-light)', width: 36, height: 36 }}>
            <KeyRound size={16} style={{ color: 'var(--brand)' }} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Change Password</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Update your login password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans' }}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="input-field pr-10"
                required
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans' }}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="input-field pr-10"
                required
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="input-field"
              required
            />
          </div>

          {/* Error */}
          {pwError && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>
              {pwError}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="px-4 py-3 rounded-lg text-sm flex items-center gap-2" style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary px-6">
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
