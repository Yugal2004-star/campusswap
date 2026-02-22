import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export const formatPrice = (price) => {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  if (isToday(date)) return `Today ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, yyyy');
};

export const formatRelative = (dateStr) => {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
};

export const formatMeetupDate = (date, time) => {
  return `${format(new Date(date), 'EEEE, MMM d, yyyy')} at ${time}`;
};

export const getCategoryIcon = (category) => {
  const icons = {
    furniture: '🛋️',
    electronics: '💻',
    textbooks: '📚',
    clothing: '👕',
    sports: '⚽',
    other: '📦',
  };
  return icons[category] || '📦';
};

export const getConditionColor = (condition) => {
  const colors = {
    new: 'bg-emerald-100 text-emerald-700',
    like_new: 'bg-blue-100 text-blue-700',
    good: 'bg-yellow-100 text-yellow-700',
    fair: 'bg-orange-100 text-orange-700',
    poor: 'bg-red-100 text-red-700',
  };
  return colors[condition] || 'bg-slate-100 text-slate-700';
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-emerald-100 text-emerald-700',
    sold: 'bg-slate-100 text-slate-700',
    removed: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-700';
};

export const validateCampusEmail = (email) => {
  // Allow .edu emails and common university domains
  return /^[^\s@]+@[^\s@]+\.(edu|ac\.in|edu\.in)$/.test(email);
};

export const getPrimaryImage = (images) => {
  if (!images || images.length === 0) return null;
  return images.find((img) => img.is_primary)?.image_url || images[0]?.image_url;
};
