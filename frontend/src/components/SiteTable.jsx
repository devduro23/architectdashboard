import { Eye, MapPin, Calendar } from 'lucide-react';

const STAGE_COLORS = {
  'won': 'badge-green',
  'lost': 'badge-red',
  'negotiation': 'badge-amber',
  'proposal': 'badge-blue',
  'qualified': 'badge-blue',
  'new': 'badge-gray',
  'closed': 'badge-gray',
};

function getStageBadge(stage) {
  if (!stage) return 'badge-gray';
  const key = stage.toLowerCase();
  for (const [k, v] of Object.entries(STAGE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return 'badge-gray';
}

function formatDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SiteTable({ sites, onViewSite }) {
  if (!sites?.length) {
    return (
      <div className="card p-10 text-center">
        <p style={{ color: 'var(--text-muted)' }}>No sites found.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project / Site</th>
              <th>Location</th>
              <th>Lead Stage</th>
              <th>Linked Dealer</th>
              <th>Maturity Date</th>
              <th>Task Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id}>
                <td>
                  <span className="font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans' }}>
                    {site.project_name || '—'}
                  </span>
                  {site.lead_code && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {site.lead_code}
                    </p>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span>
                      {[site.city, site.state].filter(Boolean).join(', ') || site.locality || '—'}
                    </span>
                  </div>
                </td>
                <td>
                  {site.lead_stage ? (
                    <span className={`badge ${getStageBadge(site.lead_stage)}`}>
                      {site.lead_stage}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {site.linked_dealer || '—'}
                </td>
                <td>
                  <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {site.expected_maturity_date && (
                      <Calendar size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                    {formatDate(site.expected_maturity_date)}
                  </div>
                </td>
                <td>
                  {site.latest_task_status ? (
                    <span className={`badge ${site.latest_task_status?.toLowerCase().includes('complet') ? 'badge-green' : 'badge-gray'}`}>
                      {site.latest_task_status}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <button
                    onClick={() => onViewSite(site)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: 'var(--brand-light)',
                      color: 'var(--brand)',
                      fontFamily: 'Plus Jakarta Sans',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--brand)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--brand-light)';
                      e.currentTarget.style.color = 'var(--brand)';
                    }}
                  >
                    <Eye size={13} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
