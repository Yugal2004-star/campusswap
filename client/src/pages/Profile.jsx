import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { listingService } from '../services/listingService';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/listings/ListingCard';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userId } = useParams();
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const isOwnProfile = !userId || userId === user?.id;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId || user?.id],
    queryFn: () => isOwnProfile
      ? api.get('/api/users/me').then((r) => r.data)
      : api.get(`/api/users/${userId}`).then((r) => r.data),
    onSuccess: (d) => { if (form === null) setForm(d); },
  });

  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingService.getMy(),
    enabled: isOwnProfile,
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => api.patch('/api/users/me', updates).then((r) => r.data),
    onSuccess: () => {
      toast.success('Profile updated!');
      setEditing(false);
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const displayData = data || {};
  const listings = isOwnProfile ? myListings : (displayData.listings || []);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-6">
          {displayData.avatar_url ? (
            <img src={displayData.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center font-display font-bold text-3xl">
              {displayData.full_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}

          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={form?.full_name || ''}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="Full name"
                  className="input"
                />
                <input
                  value={form?.university || ''}
                  onChange={(e) => setForm((p) => ({ ...p, university: e.target.value }))}
                  placeholder="University name"
                  className="input"
                />
                <input
                  value={form?.dorm_location || ''}
                  onChange={(e) => setForm((p) => ({ ...p, dorm_location: e.target.value }))}
                  placeholder="Dorm / Location"
                  className="input"
                />
                <textarea
                  value={form?.bio || ''}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Short bio..."
                  className="input resize-none"
                  rows={2}
                />
                <div className="flex gap-3">
                  <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                  <button
                    onClick={() => updateMutation.mutate(form)}
                    className="btn-primary"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="font-display font-bold text-2xl text-slate-900">
                    {displayData.full_name || 'Anonymous'}
                  </h1>
                  {isOwnProfile && (
                    <button onClick={() => { setForm(displayData); setEditing(true); }} className="btn-secondary text-sm">
                      Edit Profile
                    </button>
                  )}
                </div>
                {displayData.university && <p className="text-slate-600 mb-1">🎓 {displayData.university}</p>}
                {displayData.dorm_location && <p className="text-slate-500 text-sm mb-1">📍 {displayData.dorm_location}</p>}
                {displayData.bio && <p className="text-slate-500 text-sm mt-2">{displayData.bio}</p>}
                <div className="flex gap-4 mt-3 text-sm text-slate-500">
                  <span>⭐ {displayData.rating?.toFixed(1) || '0.0'} ({displayData.total_reviews || 0} reviews)</span>
                  <span>📅 Joined {formatDate(displayData.created_at)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 className="font-display font-bold text-xl text-slate-900 mb-4">
        {isOwnProfile ? 'My Listings' : 'Listings'} ({listings.length})
      </h2>

      {listings.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-2">📦</div>
          <p>No listings yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
