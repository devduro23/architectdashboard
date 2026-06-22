import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

function formatINR(val) {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

function groupBySite(payouts) {
  const map = new Map();
  for (const p of payouts) {
    const key = p.site_name || 'Unknown Site';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }
  return map;
}

function SiteGroup({ siteName, rows }) {
  const [expanded, setExpanded] = useState(true);
  const siteTotal = rows.reduce((s, r) => s + (r.calculated_payout || 0), 0);
  const siteTotalQty = rows.reduce((s, r) => s + (r.eligible_qty || 0), 0);
  const hasNoPay = rows.some(r => r.remit?.toUpperCase() === 'NO');

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer select-none"
        style={{ background: 'var(--bg-page)' }}
      >
        <td colSpan={5} className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {expanded ? <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />}
              <span className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans', fontSize: '13px' }}>
                {siteName}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({rows.length} product{rows.length !== 1 ? 's' : ''})</span>
              {hasNoPay && <span className="badge badge-red" style={{ fontSize: '10px' }}>Pending</span>}
            </div>
            <div className="flex items-center gap-6 pr-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty: <strong style={{ color: 'var(--text-secondary)' }}>{siteTotalQty.toLocaleString('en-IN')}</strong></span>
              <span className="font-bold text-sm" style={{ color: '#16A34A', fontFamily: 'Plus Jakarta Sans' }}>
                {formatINR(siteTotal)}
              </span>
            </div>
          </div>
        </td>
      </tr>
      {expanded && rows.map((row, i) => (
        <tr key={i} style={{ background: 'var(--surface)' }}>
          <td className="pl-10">
            <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
              {row.product_code || '—'}
            </span>
          </td>
          <td className="text-center" style={{ color: 'var(--text-secondary)' }}>
            {row.eligible_qty?.toLocaleString('en-IN') || '—'}
          </td>
          <td className="text-center">
            {row.tier ? (
              <span className="badge badge-amber">{row.tier}</span>
            ) : '—'}
          </td>
          <td style={{ color: '#16A34A', fontWeight: 600, fontFamily: 'Plus Jakarta Sans' }}>
            {formatINR(row.calculated_payout)}
          </td>
          <td>
            <span className={`badge ${row.remit?.toUpperCase() === 'YES' ? 'badge-green' : 'badge-red'}`}>
              {row.remit?.toUpperCase() === 'YES' ? 'Remitted' : 'Pending'}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function PayoutTable({ payouts }) {
  if (!payouts?.length) {
    return (
      <div className="card p-10 text-center">
        <p style={{ color: 'var(--text-muted)' }}>No payout data found.</p>
      </div>
    );
  }

  const grouped = groupBySite(payouts);
  const grandTotal = payouts.reduce((s, r) => s + (r.calculated_payout || 0), 0);
  const totalQty = payouts.reduce((s, r) => s + (r.eligible_qty || 0), 0);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '40px' }}>Product Code</th>
              <th className="text-center">Eligible Qty</th>
              <th className="text-center">Tier</th>
              <th>Payout</th>
              <th>Remit Status</th>
            </tr>
          </thead>
          <tbody>
            {[...grouped.entries()].map(([siteName, rows]) => (
              <SiteGroup key={siteName} siteName={siteName} rows={rows} />
            ))}
            {/* Grand Total Row */}
            <tr style={{ background: 'var(--brand-light)', borderTop: '2px solid var(--border)' }}>
              <td colSpan={3} className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)', paddingLeft: '16px' }}>
                Grand Total
                <span className="ml-3 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                  Qty: {totalQty.toLocaleString('en-IN')}
                </span>
              </td>
              <td colSpan={2} className="font-bold text-lg" style={{ color: '#16A34A', fontFamily: 'Plus Jakarta Sans' }}>
                {formatINR(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
