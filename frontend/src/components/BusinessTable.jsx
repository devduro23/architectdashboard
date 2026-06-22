import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import client from '../api/client';

function formatINR(val) {
  if (!val && val !== 0) return '—';
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
  if (val >= 1000)   return `₹${(val / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(val);
}

function formatDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function BusinessTable() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 50;

  useEffect(() => {
    load(page);
  }, [page]);

  async function load(p) {
    setLoading(true);
    try {
      const res = await client.get(`/payouts/business?page=${p}&limit=${LIMIT}`);
      setRows(res.data.transactions || []);
      setTotal(res.data.total || 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="w-8 h-8 rounded-full animate-spin mx-auto"
          style={{ border: '3px solid var(--border)', borderTopColor: 'var(--brand)' }} />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="card p-10 text-center">
        <p style={{ color: 'var(--text-muted)' }}>No business transactions found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Dealer</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Business Amt</th>
                <th className="text-right">Payout</th>
                <th className="text-center">Commission %</th>
                <th>City / State</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {row.product_details || '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '200px' }}>
                    <span className="block truncate text-xs">
                      {row.dealer_name || '—'}
                    </span>
                  </td>
                  <td className="text-center" style={{ color: 'var(--text-secondary)' }}>
                    {(row.quantity || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="text-right font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans' }}>
                    {formatINR(row.business_amount)}
                  </td>
                  <td className="text-right font-bold" style={{ color: '#16A34A', fontFamily: 'Plus Jakarta Sans' }}>
                    {formatINR(row.payout)}
                  </td>
                  <td className="text-center">
                    {row.commission_pct > 0 ? (
                      <span className="badge badge-blue">{row.commission_pct}%</span>
                    ) : '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {[row.city, row.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {formatDate(row.purchase_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg disabled:opacity-40 transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm px-3" style={{ color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg disabled:opacity-40 transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
