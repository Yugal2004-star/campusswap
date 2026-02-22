import { Link } from 'react-router-dom';
import { formatPrice, getConditionColor, getCategoryIcon, getPrimaryImage, formatRelative } from '../../utils/helpers';

const ListingCard = ({ listing, onWishlistToggle, isWishlisted }) => {
  const primaryImage = getPrimaryImage(listing.listing_images);
  const conditionColor = getConditionColor(listing.condition);

  return (
    <div className="card hover:shadow-md transition-all duration-200 group overflow-hidden animate-fade-in">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-slate-100 to-slate-200">
            {getCategoryIcon(listing.category)}
          </div>
        )}

        {/* Free badge */}
        {listing.is_free && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            FREE
          </div>
        )}

        {/* Wishlist button */}
        {onWishlistToggle && (
          <button
            onClick={(e) => { e.preventDefault(); onWishlistToggle(listing.id); }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            {isWishlisted ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      {/* Content */}
      <Link to={`/listings/${listing.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {listing.title}
          </h3>
          <span className={`badge flex-shrink-0 ${conditionColor}`}>
            {listing.condition.replace('_', ' ')}
          </span>
        </div>

        <p className="text-xl font-bold text-primary-600 mb-3">{formatPrice(listing.price)}</p>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            📍 {listing.dorm_location}
          </span>
          <span>{formatRelative(listing.created_at)}</span>
        </div>

        {listing.seller && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            {listing.seller.avatar_url ? (
              <img src={listing.seller.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold">
                {listing.seller.full_name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <span className="text-xs text-slate-600">{listing.seller.full_name || 'Anonymous'}</span>
          </div>
        )}
      </Link>
    </div>
  );
};

export default ListingCard;
