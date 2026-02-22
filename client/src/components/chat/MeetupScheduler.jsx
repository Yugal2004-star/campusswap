import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetupService } from '../../services/meetupService';
import { DORM_LOCATIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

const SAFE_LOCATIONS = [
  'Library - Main Entrance',
  'Student Center Lobby',
  'Cafeteria - Ground Floor',
  'Admin Block Reception',
  'Gym Entrance',
  'Hostel Common Room',
  ...DORM_LOCATIONS,
];

const MeetupScheduler = ({ chatId, listingId, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    location: '',
    meetup_date: '',
    meetup_time: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: (data) => meetupService.create(data),
    onSuccess: () => {
      toast.success('Meetup request sent!');
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['meetups'] });
      onClose();
    },
    onError: () => toast.error('Failed to schedule meetup'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.location || !form.meetup_date || !form.meetup_time) {
      toast.error('Please fill all required fields');
      return;
    }
    mutation.mutate({ chat_id: chatId, listing_id: listingId, ...form });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-slate-900">Schedule Meetup</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-6">
          <p className="text-sm text-emerald-700 font-medium">🛡️ Safety tip</p>
          <p className="text-xs text-emerald-600 mt-1">Always meet in public, well-lit campus areas. Never share your home address.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Safe Meeting Location *</label>
            <select
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className="input"
              required
            >
              <option value="">Select a safe location</option>
              {SAFE_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                min={today}
                value={form.meetup_date}
                onChange={(e) => setForm((p) => ({ ...p, meetup_date: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Time *</label>
              <input
                type="time"
                value={form.meetup_time}
                onChange={(e) => setForm((p) => ({ ...p, meetup_time: e.target.value }))}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional details..."
              rows={2}
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetupScheduler;
