import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatPrice, getConditionColor, getPrimaryImage, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminListings = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', category: '', page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', filters],
    queryFn: () => adminService.getListings(filters),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.updateListingStatus(id, status),
    onSuccess: () => {
      toast.success('Listing updated');
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    },
    onError: () => toast.error('Failed to update listing'),
  });

  const { listings = [], pagination } = data || {};

  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Manage Listings</h1>

      {/* Filters */}
      <div className="card p-4 mb-6 flex gap-3">
        <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))} className="input w-auto">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="removed">Removed</option>
        </select>
        <select value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value, page: 1 }))} className="input w-auto">
          <option value="">All Categories</option>
          <option value="furniture">Furniture</option>
          <option value="electronics">Electronics</option>
          <option value="textbooks">Textbooks</option>
          <option value="clothing">Clothing</option>
          <option value="sports">Sports</option>
          <option value="other">Other</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const img = getPrimaryImage(listing.listing_images);
            return (
              <div key={listing.id} className="card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{listing.title}</p>
                  <p className="text-sm text-slate-500">{listing.seller?.full_name} • {listing.dorm_location}</p>
                  <p className="text-xs text-slate-400">{formatDate(listing.created_at)}</p>
                </div>

                <div className="text-right flex-shrink-0 mr-4">
                  <p className="font-bold text-primary-600">{formatPrice(listing.price)}</p>
                  <span className={`badge text-xs ${getConditionColor(listing.condition)}`}>{listing.condition}</span>
                </div>

                <div className="flex items-center gap-2">
                  {listing.status === 'active' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: listing.id, status: 'removed' })}
                      className="btn-ghost text-xs text-red-600 py-1"
                    >
                      Remove
                    </button>
                  )}
                  {listing.status === 'removed' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: listing.id, status: 'active' })}
                      className="btn-ghost text-xs text-emerald-600 py-1"
                    >
                      Restore
                    </button>
                  )}
                  <span className={`badge ${listing.status === 'active' ? 'bg-emerald-100 text-emerald-700' : listing.status === 'sold' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>
                    {listing.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))} disabled={filters.page === 1} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
          <span className="flex items-center text-sm text-slate-600 px-3">Page {filters.page} of {pagination.totalPages}</span>
          <button onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))} disabled={filters.page >= pagination.totalPages} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
};

export default AdminListings;
