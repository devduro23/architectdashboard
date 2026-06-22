export default function StatCard({ icon: Icon, label, value, iconBg, iconColor, subtitle }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div
        className="stat-icon-block"
        style={{ background: iconBg || 'var(--brand-light)' }}
      >
        <Icon size={22} color={iconColor || 'var(--brand)'} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans' }}>
          {label}
        </p>
        <p className="font-heading font-bold text-2xl leading-tight" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
