import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

function formatINR(val) {
  if (!val) return '₹0';
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value || 0;
  return (
    <div className="card px-4 py-3" style={{ minWidth: '160px' }}>
      <p className="font-heading font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
        {label}
      </p>
      <p className="font-bold text-base" style={{ color: '#16A34A', fontFamily: 'Plus Jakarta Sans' }}>
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
      </p>
    </div>
  );
}

export default function PayoutChart({ data }) {
  if (!data?.length) {
    return (
      <div className="card p-10 text-center">
        <p style={{ color: 'var(--text-muted)' }}>No chart data available.</p>
      </div>
    );
  }

  const chartData = data.map(d => ({
    name: d.site_name?.length > 22 ? d.site_name.slice(0, 20) + '…' : d.site_name,
    fullName: d.site_name,
    payout: d.total_payout || 0,
  }));

  return (
    <div className="card p-5">
      <div style={{ width: '100%', height: Math.max(220, Math.min(320, data.length * 52)) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 8, bottom: data.length > 4 ? 60 : 16 }}
            barSize={data.length === 1 ? 60 : Math.max(20, Math.min(48, 180 / data.length))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              angle={data.length > 4 ? -35 : 0}
              textAnchor={data.length > 4 ? 'end' : 'middle'}
              interval={0}
            />
            <YAxis
              tickFormatter={formatINR}
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(192,57,43,0.06)' }} />
            <Bar dataKey="payout" radius={[5, 5, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill="var(--brand)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
