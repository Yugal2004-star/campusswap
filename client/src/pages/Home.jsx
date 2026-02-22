import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService';
import ListingCard from '../components/listings/ListingCard';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

const Home = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    category: '', condition: '', min_price: '', max_price: '',
    search: '', sort: 'created_at', order: 'desc', page: 1,
  });
  const [searchInput, setSearchInput] = useState('');
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingService.getAll(filters),
  });

  useQuery({
    queryKey: ['wishlist'],
    queryFn: listingService.getWishlist,
    enabled: !!user, // only fetch wishlist if logged in
    onSuccess: (data) => setWishlistedIds(new Set(data.map((w) => w.listing_id))),
  });

  const wishlistMutation = useMutation({
    mutationFn: (id) => listingService.toggleWishlist(id),
    onSuccess: (data, id) => {
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        data.saved ? next.add(id) : next.delete(id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(data.saved ? 'Saved to wishlist' : 'Removed from wishlist');
    },
  });

  const handleWishlistToggle = (id) => {
    if (!user) {
      toast('Please sign in to save items', { icon: '🔒' });
      navigate('/login');
      return;
    }
    wishlistMutation.mutate(id);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((p) => ({ ...p, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (key, value) => setFilters((p) => ({ ...p, [key]: value, page: 1 }));

  const { listings = [], pagination } = data || {};

  return (
    <div className="animate-fade-in">
      {/* Hero Search */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 mb-8 text-white">
        <h1 className="font-display font-bold text-3xl mb-2">Find Great Deals on Campus</h1>
        <p className="text-primary-200 mb-6">Browse items from verified students — safe, local, sustainable.</p>
        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for textbooks, furniture, electronics..."
            className="flex-1 px-5 py-3 rounded-xl text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button type="submit" className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            Search
          </button>
        </form>

        {/* Guest CTA */}
        {!user && (
          <div className="mt-5 flex items-center gap-4">
            <p className="text-primary-200 text-sm">Want to sell something?</p>
            <Link to="/login" className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-white/30">
              Sign In to List an Item →
            </Link>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => handleFilterChange('category', '')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!filters.category ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'}`}
        >
          All Items
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleFilterChange('category', cat.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filters.category === cat.value ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'}`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filters.condition} onChange={(e) => handleFilterChange('condition', e.target.value)} className="input w-auto text-sm">
          <option value="">Any Condition</option>
          <option value="new">New</option>
          <option value="like_new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min ₹" value={filters.min_price} onChange={(e) => handleFilterChange('min_price', e.target.value)} className="input w-24 text-sm" />
          <span className="text-slate-400">—</span>
          <input type="number" placeholder="Max ₹" value={filters.max_price} onChange={(e) => handleFilterChange('max_price', e.target.value)} className="input w-24 text-sm" />
        </div>
        <select
          value={`${filters.sort}-${filters.order}`}
          onChange={(e) => { const [sort, order] = e.target.value.split('-'); setFilters((p) => ({ ...p, sort, order, page: 1 })); }}
          className="input w-auto text-sm ml-auto"
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="views_count-desc">Most Viewed</option>
        </select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card aspect-[3/4] animate-pulse bg-slate-100" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display font-bold text-xl text-slate-700 mb-2">No listings found</h3>
          <p className="text-slate-400">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{pagination?.total || 0} items found</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onWishlistToggle={handleWishlistToggle}
                isWishlisted={wishlistedIds.has(listing.id)}
              />
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))} disabled={filters.page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
              <span className="flex items-center px-4 text-sm text-slate-600">Page {filters.page} of {pagination.totalPages}</span>
              <button onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))} disabled={filters.page >= pagination.totalPages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;