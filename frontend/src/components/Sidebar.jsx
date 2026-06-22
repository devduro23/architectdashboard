import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, X } from 'lucide-react';
import useAuthStore from '../store/authStore';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'My Profile' },
];

export default function Sidebar({ onClose }) {
  const logout = useAuthStore((s) => s.logout);
  const architect = useAuthStore((s) => s.architect);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-heading font-bold text-sm"
            style={{ background: 'var(--brand)' }}>
            A
          </div>
          <span className="font-heading font-bold text-base" style={{ color: 'var(--brand)' }}>
            ArchPortal
          </span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded" style={{ color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Architect info */}
      {architect && (
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-white text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C0392B 0%, #E8613C 100%)' }}>
              {architect.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {architect.name}
              </p>
              {architect.tier && (
                <span className="badge badge-amber" style={{ fontSize: '10px', padding: '1px 7px' }}>
                  {architect.tier}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={logout}
          className="sidebar-nav-item w-full"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
