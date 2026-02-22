import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getConditionColor, getCategoryIcon, formatRelative, getPrimaryImage } from '../utils/helpers';
import { REPORT_REASONS } from '../utils/constants';
import toast from 'react-hot-toast';

const ListingDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState({ reason: '', description: '' });
  const [contactMsg, setContactMsg] = useState('');
  const [showContact, setShowContact] = useState(false);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getOne(id),
  });

  const contactMutation = useMutation({
    mutationFn: () => chatService.create({ listing_id: id, initial_message: contactMsg }),
    onSuccess: (data) => {
      toast.success('Message sent!');
      navigate(`/chat/${data.chat_id}`);
    },
    onError: () => toast.error('Failed to send message'),
  });

  const reportMutation = useMutation({
    mutationFn: () => listingService.report(id, report),
    onSuccess: () => { toast.success('Report submitted. Thank you.'); setShowReport(false); },
    onError: () => toast.error('Failed to submit report'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => listingService.delete(id),
    onSuccess: () => { toast.success('Listing deleted'); navigate('/'); },
  });

  const handleContactClick = () => {
    if (!user) {
      toast('Please sign in to contact the seller', { icon: '🔒' });
      navigate('/login', { state: { from: `/listings/${id}` } });
      return;
    }
    setShowContact(true);
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !listing) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="font-display font-bold text-2xl text-slate-700 mb-4">Listing not found</h2>
      <Link to="/" className="btn-primary">Browse Other Items</Link>
    </div>
  );

  const isOwner = user?.id === listing.seller_id;
  const images = listing.listing_images || [];

  return (
    <div className="animate-fade-in">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-3">
            {images.length > 0 ? (
              <img src={images[selectedImage]?.image_url} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">{getCategoryIcon(listing.category)}</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-primary-600' : 'border-transparent'}`}>
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="font-display font-bold text-2xl text-slate-900 leading-tight">{listing.title}</h1>
            <span className={`badge flex-shrink-0 ${getConditionColor(listing.condition)}`}>
              {listing.condition.replace('_', ' ')}
            </span>
          </div>

          <p className="text-3xl font-bold text-primary-600 mb-6">{formatPrice(listing.price)}</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="badge bg-slate-100 text-slate-700 px-3 py-1">{getCategoryIcon(listing.category)} {listing.category}</span>
            <span className="badge bg-slate-100 text-slate-700 px-3 py-1">📍 {listing.dorm_location}</span>
            <span className="badge bg-slate-100 text-slate-700 px-3 py-1">👁️ {listing.views_count} views</span>
            <span className="badge bg-slate-100 text-slate-700 px-3 py-1">🕒 {formatRelative(listing.created_at)}</span>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed">{listing.description}</p>
          </div>

          {/* Seller */}
          {listing.seller && (
            <Link to={`/profile/${listing.seller.id}`} className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl mb-6 hover:bg-surface-100 transition-colors">
              {listing.seller.avatar_url ? (
                <img src={listing.seller.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg">
                  {listing.seller.full_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-800">{listing.seller.full_name}</p>
                <p className="text-sm text-slate-500">⭐ {listing.seller.rating?.toFixed(1) || 'New'} · {listing.seller.dorm_location || 'Campus'}</p>
              </div>
              <span className="ml-auto text-slate-400 text-sm">View Profile →</span>
            </Link>
          )}

          {/* Action Buttons */}
          {isOwner ? (
            <div className="flex gap-3">
              <Link to={`/listings/${id}/edit`} className="btn-secondary flex-1 justify-center">Edit Listing</Link>
              <button onClick={() => { if (confirm('Delete this listing?')) deleteMutation.mutate(); }} className="btn-secondary flex-1 justify-center text-red-600 border-red-200 hover:bg-red-50">
                Delete
              </button>
            </div>
          ) : listing.status === 'active' ? (
            <div>
              {!showContact ? (
                <button onClick={handleContactClick} className="btn-primary w-full justify-center py-3 text-base">
                  💬 Contact Seller
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Hi, I'm interested in this item! Is it still available?"
                    className="input resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowContact(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                    <button
                      onClick={() => contactMutation.mutate()}
                      disabled={!contactMsg.trim() || contactMutation.isPending}
                      className="btn-primary flex-1 justify-center"
                    >
                      {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              )}

              {/* Guest sign-in nudge */}
              {!user && (
                <p className="text-center text-xs text-slate-400 mt-3">
                  <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link> or <Link to="/login" className="text-primary-600 hover:underline">create an account</Link> to contact this seller
                </p>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 text-slate-600 text-center py-4 rounded-xl font-medium">
              This item is no longer available
            </div>
          )}

          {/* Report — only for logged-in non-owners */}
          {user && !isOwner && (
            <button onClick={() => setShowReport(true)} className="text-xs text-slate-400 hover:text-red-500 mt-4 block">
              🚩 Report this listing
            </button>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <h3 className="font-display font-bold text-xl mb-4">Report Listing</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Reason</label>
                <select value={report.reason} onChange={(e) => setReport((p) => ({ ...p, reason: e.target.value }))} className="input">
                  <option value="">Select reason</option>
                  {REPORT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Details (optional)</label>
                <textarea value={report.description} onChange={(e) => setReport((p) => ({ ...p, description: e.target.value }))} className="input resize-none" rows={3} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowReport(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={() => reportMutation.mutate()} disabled={!report.reason || reportMutation.isPending} className="btn-primary flex-1 justify-center bg-red-600 hover:bg-red-700">
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;