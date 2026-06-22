import { useEffect, useState } from 'react';
import {
  Building2, Package, IndianRupee, AlertCircle,
  BarChart3, MapPin, List, TrendingUp, ShoppingBag,
} from 'lucide-react';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import StatCard from '../components/StatCard';
import SiteTable from '../components/SiteTable';
import PayoutTable from '../components/PayoutTable';
import PayoutChart from '../components/PayoutChart';
import SiteDrawer from '../components/SiteDrawer';
import BusinessTable from '../components/BusinessTable';

function formatINR(val) {
  if (!val && val !== 0) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000)   return `₹${(val / 100000).toFixed(2)}L`;
  if (val >= 1000)     return `₹${(val / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(val);
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--brand-light)' }}>
        <Icon size={16} style={{ color: 'var(--brand)' }} />
      </div>
      <div>
        <h2 className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const architect = useAuthStore((s) => s.architect);
  const [sites, setSites] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [bySite, setBySite] = useState([]);
  const [bizTotals, setBizTotals] = useState(null);
  const [bizByProduct, setBizByProduct] = useState([]);
  const [bizByDealer, setBizByDealer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [drawerPayouts, setDrawerPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true); setError(null);
    try {
      const [sitesRes, payoutsRes, summaryRes] = await Promise.all([
        client.get('/sites'),
        client.get('/payouts'),
        client.get('/payouts/summary'),
      ]);
      setSites(sitesRes.data.sites || []);
      setPayouts(payoutsRes.data.payouts || []);
      const s = summaryRes.data;
      setSummary(s.summary || {});
      setBySite(s.bySite || []);
      setBizTotals(s.bizTotals || {});
      setBizByProduct(s.bizByProduct || []);
      setBizByDealer(s.bizByDealer || []);
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleViewSite(site) {
    setSelectedSite(site);
    setDrawerPayouts(payouts.filter(p => p.site_name === site.project_name));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full animate-spin mx-auto mb-3"
            style={{ border: '3px solid var(--border)', borderTopColor: 'var(--brand)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="card p-8 text-center max-w-sm">
          <AlertCircle size={36} className="mx-auto mb-3" style={{ color: 'var(--error)' }} />
          <p className="font-heading font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {error}
          </p>
          <button onClick={fetchAll} className="btn-primary px-6">Retry</button>
        </div>
      </div>
    );
  }

  const hasSchemePayout = payouts.length > 0;
  const hasBizData      = (bizTotals?.total_transactions || 0) > 0;
  const hasArchProfile  = architect?.total_business_amount > 0;

  // Stat cards — blend scheme payout + business data
  const totalPayout = hasSchemePayout
    ? (summary?.total_scheme_payout || 0)
    : (bizTotals?.total_biz_payout || architect?.total_payout || 0);

  const totalBusiness = bizTotals?.total_business_amount || architect?.total_business_amount || 0;

  const stats = [
    {
      label: 'Sites',
      value: sites.length > 0
        ? sites.length.toString()
        : (bizTotals?.total_transactions || 0).toLocaleString('en-IN'),
      icon: Building2,
      iconBg: '#FFF0F0', iconColor: '#C0392B',
      subtitle: sites.length > 0 ? 'Linked project sites' : 'Business transactions',
    },
    {
      label: 'Business Volume',
      value: formatINR(totalBusiness),
      icon: TrendingUp,
      iconBg: '#FFF7ED', iconColor: '#E8613C',
      subtitle: 'Total business amount (FY 23–25)',
    },
    {
      label: hasSchemePayout ? 'Scheme Payout' : 'Total Payout',
      value: formatINR(totalPayout),
      icon: IndianRupee,
      iconBg: '#F0FDF4', iconColor: '#16A34A',
      subtitle: hasSchemePayout ? 'Calculated scheme payout' : 'Earned commissions',
    },
    {
      label: hasSchemePayout ? 'Pending Remittance' : 'Eligible Qty',
      value: hasSchemePayout
        ? (summary?.pending_remittance || 0).toString()
        : (bizTotals?.total_quantity || 0).toLocaleString('en-IN'),
      icon: hasSchemePayout ? AlertCircle : Package,
      iconBg: (hasSchemePayout && summary?.pending_remittance > 0) ? '#FEF2F2' : '#F0FDF4',
      iconColor: (hasSchemePayout && summary?.pending_remittance > 0) ? '#991B1B' : '#16A34A',
      subtitle: hasSchemePayout ? 'Items awaiting remittance' : 'Total units supplied',
    },
  ];

  // Build tabs based on available data
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    ...(hasBizData ? [{ id: 'business', label: 'Business History', icon: ShoppingBag }] : []),
    ...(sites.length > 0 ? [{ id: 'sites', label: 'My Sites', icon: MapPin }] : []),
    ...(hasSchemePayout ? [{ id: 'payouts', label: 'Scheme Payouts', icon: List }] : []),
  ];

  // Chart data: prefer bySite (scheme), else bizByDealer
  const chartData = bySite.length > 0
    ? bySite.map(d => ({ site_name: d.site_name, total_payout: d.total_payout }))
    : bizByDealer.map(d => ({ site_name: d.dealer_name, total_payout: d.total_payout }));

  const chartLabel = bySite.length > 0 ? 'Payout by Site' : 'Payout by Dealer';

  return (
    <div className="space-y-7 max-w-7xl mx-auto">

      {/* Architect tier + scheme badge */}
      {(architect?.tier || architect?.eligible_for_scheme) && (
        <div className="flex items-center gap-3 flex-wrap">
          {architect.tier && (
            <span className="badge badge-amber">
              {architect.tier} Tier
            </span>
          )}
          {architect.selling_branch && (
            <span className="badge badge-blue">{architect.selling_branch}</span>
          )}
          {architect.eligible_for_scheme === 'YES' && (
            <span className="badge badge-green">Eligible for Scheme</span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              fontFamily: 'Plus Jakarta Sans',
              background: activeTab === id ? 'var(--brand)' : 'transparent',
              color: activeTab === id ? 'white' : 'var(--text-muted)',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Payout chart */}
          {chartData.length > 0 && (
            <section>
              <SectionHeader
                icon={BarChart3}
                title={chartLabel}
                subtitle="Calculated payout amount"
              />
              <PayoutChart data={chartData} />
            </section>
          )}

          {/* Business by product */}
          {bizByProduct.length > 0 && (
            <section>
              <SectionHeader
                icon={Package}
                title="Top Products by Business Volume"
                subtitle="Product-wise breakdown from your transactions"
              />
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-right">Qty Supplied</th>
                      <th className="text-right">Business Amount</th>
                      <th className="text-right">Your Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bizByProduct.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <span className="font-mono text-xs px-2 py-1 rounded"
                            style={{ background: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
                            {p.product_details || '—'}
                          </span>
                        </td>
                        <td className="text-right" style={{ color: 'var(--text-secondary)' }}>
                          {(p.total_qty || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                          {formatINR(p.total_amount)}
                        </td>
                        <td className="text-right font-bold" style={{ color: '#16A34A', fontFamily: 'Plus Jakarta Sans' }}>
                          {formatINR(p.total_payout)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* No data state */}
          {!hasBizData && !hasSchemePayout && (
            <div className="card p-12 text-center">
              <BarChart3 size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-heading font-semibold" style={{ color: 'var(--text-secondary)' }}>
                No transaction data available yet
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Your performance data will appear here once records are loaded.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Business History tab ─────────────────────────────────────────── */}
      {activeTab === 'business' && (
        <section>
          <SectionHeader
            icon={ShoppingBag}
            title="Business History"
            subtitle={`${(bizTotals?.total_transactions || 0).toLocaleString('en-IN')} transactions · ${formatINR(bizTotals?.total_business_amount)} total volume`}
          />
          <BusinessTable architectId={architect?.id} />
        </section>
      )}

      {/* ── Sites tab ────────────────────────────────────────────────────── */}
      {activeTab === 'sites' && (
        <section>
          <SectionHeader
            icon={MapPin}
            title="My Sites"
            subtitle={`${sites.length} linked project site${sites.length !== 1 ? 's' : ''}`}
          />
          <SiteTable sites={sites} onViewSite={handleViewSite} />
        </section>
      )}

      {/* ── Scheme Payouts tab ───────────────────────────────────────────── */}
      {activeTab === 'payouts' && (
        <section>
          <SectionHeader
            icon={List}
            title="Scheme Payouts"
            subtitle="Eligibility breakdown by site and product"
          />
          <PayoutTable payouts={payouts} />
        </section>
      )}

      {/* Site drawer */}
      {selectedSite && (
        <SiteDrawer
          site={selectedSite}
          payouts={drawerPayouts}
          onClose={() => setSelectedSite(null)}
        />
      )}
    </div>
  );
}
