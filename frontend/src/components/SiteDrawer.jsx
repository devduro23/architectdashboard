import { X, MapPin, Building2, User, Phone, Calendar, Tag, Layers } from 'lucide-react';

function formatDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatINR(val) {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

function Field({ label, value, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans' }}>
        {label}
      </p>
      {children || (
        <p className="text-sm" style={{ color: value ? 'var(--text-secondary)' : 'var(--text-muted)', fontStyle: value ? 'normal' : 'italic' }}>
          {value || 'Not available'}
        </p>
      )}
    </div>
  );
}

export default function SiteDrawer({ site, payouts, onClose }) {
  if (!site) return null;

  const totalPayout = payouts?.reduce((s, p) => s + (p.calculated_payout || 0), 0) || 0;
  const totalQty = payouts?.reduce((s, p) => s + (p.eligible_qty || 0), 0) || 0;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b sticky top-0 z-10" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div>
            <h2 className="font-heading font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
              {site.project_name || 'Site Details'}
            </h2>
            {site.lead_code && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Lead: {site.lead_code}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors flex-shrink-0 ml-4"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Location */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} style={{ color: 'var(--brand)' }} />
              <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Location</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-page)' }}>
              <Field label="Locality" value={site.locality} />
              <Field label="City" value={site.city} />
              <Field label="State" value={site.state} />
            </div>
          </section>

          {/* Lead Info */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} style={{ color: 'var(--brand)' }} />
              <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Lead Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-page)' }}>
              <Field label="Lead Stage">
                {site.lead_stage ? (
                  <span className="badge badge-blue">{site.lead_stage}</span>
                ) : <span className="text-sm" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not set</span>}
              </Field>
              <Field label="Source of Lead" value={site.source_of_lead} />
              <Field label="Type of Project" value={site.type_of_project} />
              <Field label="Decision Maker" value={site.decision_maker} />
              <Field label="Expected Maturity" value={formatDate(site.expected_maturity_date)} />
            </div>
          </section>

          {/* Dealer & Influencer */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} style={{ color: 'var(--brand)' }} />
              <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Dealer & Influencer</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-page)' }}>
              <Field label="Linked Dealer" value={site.linked_dealer} />
              <Field label="Linked Influencer" value={site.linked_influencer} />
            </div>
          </section>

          {/* Task Info */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} style={{ color: 'var(--brand)' }} />
              <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Latest Task</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-page)' }}>
              <Field label="Task Type" value={site.latest_task_type} />
              <Field label="Task Status" value={site.latest_task_status} />
            </div>
          </section>

          {/* Payout Summary for this site */}
          {payouts?.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Payouts for this Site
                </span>
              </div>

              {/* Summary pills */}
              <div className="flex gap-3 mb-3">
                <div className="flex-1 px-4 py-3 rounded-xl text-center" style={{ background: 'var(--brand-light)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Total Payout</p>
                  <p className="font-heading font-bold text-base" style={{ color: '#16A34A' }}>{formatINR(totalPayout)}</p>
                </div>
                <div className="flex-1 px-4 py-3 rounded-xl text-center" style={{ background: 'var(--bg-page)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Total Qty</p>
                  <p className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>{totalQty.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-center">Tier</th>
                      <th>Payout</th>
                      <th>Remit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
                            {p.product_code || '—'}
                          </span>
                        </td>
                        <td className="text-center" style={{ color: 'var(--text-secondary)' }}>
                          {p.eligible_qty?.toLocaleString('en-IN') || '—'}
                        </td>
                        <td className="text-center">
                          {p.tier ? <span className="badge badge-amber">{p.tier}</span> : '—'}
                        </td>
                        <td style={{ color: '#16A34A', fontWeight: 600 }}>
                          {formatINR(p.calculated_payout)}
                        </td>
                        <td>
                          <span className={`badge ${p.remit?.toUpperCase() === 'YES' ? 'badge-green' : 'badge-red'}`}>
                            {p.remit?.toUpperCase() === 'YES' ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
