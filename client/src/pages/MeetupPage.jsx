import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetupService } from '../services/meetupService';
import { useAuth } from '../context/AuthContext';
import { formatMeetupDate, getPrimaryImage } from '../utils/helpers';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-slate-100 text-slate-700',
};

const MeetupCard = ({ meetup, currentUserId, onUpdate }) => {
  const isProposer = meetup.proposed_by === currentUserId;
  const otherUser = currentUserId === meetup.buyer_id ? meetup.seller : meetup.buyer;
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`badge px-3 py-1 font-medium ${statusColors[meetup.status]}`}>
            {meetup.status.charAt(0).toUpperCase() + meetup.status.slice(1)}
          </span>
        </div>
        <p className="text-xs text-slate-400">{formatMeetupDate(meetup.meetup_date, meetup.meetup_time)}</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {otherUser?.avatar_url ? (
          <img src={otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
            {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-800">{otherUser?.full_name}</p>
          <p className="text-xs text-slate-500">{currentUserId === meetup.buyer_id ? 'Seller' : 'Buyer'}</p>
        </div>
      </div>

      <div className="bg-surface-50 rounded-xl p-3 mb-4 space-y-1.5">
        <p className="text-sm"><span className="font-medium">📦 Item:</span> {meetup.listing?.title}</p>
        <p className="text-sm"><span className="font-medium">📍 Location:</span> {meetup.location}</p>
        {meetup.notes && <p className="text-sm"><span className="font-medium">📝 Notes:</span> {meetup.notes}</p>}
      </div>

      {meetup.status === 'pending' && !isProposer && (
        <div className="flex gap-2">
          <button onClick={() => onUpdate(meetup.id, 'confirmed')} className="btn-primary flex-1 justify-center text-sm">
            ✅ Confirm
          </button>
          <button onClick={() => setShowCancel(true)} className="btn-secondary flex-1 justify-center text-sm text-red-600">
            ❌ Decline
          </button>
        </div>
      )}

      {meetup.status === 'confirmed' && (
        <div className="flex gap-2">
          <button onClick={() => onUpdate(meetup.id, 'completed')} className="btn-primary flex-1 justify-center text-sm">
            🎉 Mark Complete
          </button>
          <button onClick={() => setShowCancel(true)} className="btn-secondary flex-1 justify-center text-sm text-red-600">
            Cancel
          </button>
        </div>
      )}

      {showCancel && (
        <div className="mt-3 space-y-2">
          <input
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            className="input text-sm"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowCancel(false)} className="btn-secondary flex-1 justify-center text-sm">Back</button>
            <button
              onClick={() => { onUpdate(meetup.id, 'cancelled', cancelReason); setShowCancel(false); }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl text-sm flex-1 justify-center"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MeetupPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: meetups = [], isLoading } = useQuery({
    queryKey: ['meetups'],
    queryFn: meetupService.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, cancel_reason }) => meetupService.update(id, { status, cancel_reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetups'] });
      toast.success('Meetup updated!');
    },
    onError: () => toast.error('Failed to update meetup'),
  });

  const handleUpdate = (id, status, cancel_reason) => {
    updateMutation.mutate({ id, status, cancel_reason });
  };

  const tabs = ['pending', 'confirmed', 'completed', 'cancelled'];
  const filtered = meetups.filter((m) => m.status === activeTab);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Meetups</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl mb-6">
        {tabs.map((tab) => {
          const count = meetups.filter((m) => m.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab} {count > 0 && <span className="ml-1 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">{count}</span>}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-2">📅</div>
          <p>No {activeTab} meetups</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((meetup) => (
            <MeetupCard
              key={meetup.id}
              meetup={meetup}
              currentUserId={user?.id}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetupPage;
