import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import StatsCard from '../../components/admin/StatsCard';
import { formatPrice } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminService.getAnalytics,
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { overview, categories = [], sustainability = [] } = data || {};

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Campus Marketplace Overview</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/reports" className="btn-secondary text-sm">
            🚩 Reports {overview?.pending_reports > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{overview.pending_reports}</span>}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Users" value={overview?.total_users?.toLocaleString()} icon="👥" color="blue" subtitle={`+${overview?.new_users_this_month || 0} this month`} />
        <StatsCard title="Active Listings" value={overview?.active_listings?.toLocaleString()} icon="📦" color="green" subtitle={`${overview?.total_listings || 0} total`} />
        <StatsCard title="Items Sold" value={overview?.sold_listings?.toLocaleString()} icon="✅" color="purple" subtitle="Successful exchanges" />
        <StatsCard title="Value Exchanged" value={formatPrice(overview?.total_value_exchanged || 0)} icon="💰" color="orange" subtitle="Total community savings" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Categories */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-slate-800 mb-4">Listings by Category</h2>
          <div className="space-y-3">
            {categories.map((cat) => {
              const catIcons = { furniture: '🛋️', electronics: '💻', textbooks: '📚', clothing: '👕', sports: '⚽', other: '📦' };
              const total = categories.reduce((sum, c) => sum + Number(c.total_listings), 0);
              const pct = total > 0 ? Math.round((cat.total_listings / total) * 100) : 0;
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{catIcons[cat.category]} {cat.category}</span>
                    <span className="text-sm text-slate-500">{cat.total_listings} items</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sustainability */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-slate-800 mb-4">♻️ Sustainability Impact</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-emerald-700">
                {sustainability.reduce((sum, s) => sum + Number(s.items_reused || 0), 0)}
              </p>
              <p className="text-sm text-emerald-600 mt-1">Items Reused</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-blue-700">
                {formatPrice(sustainability.reduce((sum, s) => sum + Number(s.total_money_saved || 0), 0))}
              </p>
              <p className="text-sm text-blue-600 mt-1">Money Saved</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-purple-700">
              {overview?.completed_meetups || 0}
            </p>
            <p className="text-sm text-purple-600 mt-1">Safe Campus Meetups Completed</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { to: '/admin/users', icon: '👥', label: 'Manage Users', desc: `${overview?.total_users || 0} users` },
          { to: '/admin/listings', icon: '📦', label: 'Manage Listings', desc: `${overview?.active_listings || 0} active` },
          { to: '/admin/reports', icon: '🚩', label: 'Review Reports', desc: `${overview?.pending_reports || 0} pending` },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="card p-5 hover:shadow-md transition-shadow text-center">
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="font-semibold text-slate-800">{item.label}</p>
            <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
