import { Menu, Bell } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Navbar({ onMenuClick }) {
  const architect = useAuthStore((s) => s.architect);

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#FFF0F0] transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:block">
          <h1 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {architect?.name?.split(' ')[0] || 'Architect'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Here's your performance overview
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-[#FFF0F0] transition-colors relative"
          style={{ color: 'var(--text-muted)' }}>
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #C0392B 0%, #E8613C 100%)' }}>
          {architect?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
