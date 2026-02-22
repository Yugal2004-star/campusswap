import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import ListingCard from '../components/listings/ListingCard';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: listingService.getWishlist,
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => listingService.toggleWishlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Saved Items ({wishlist.length})</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🤍</div>
          <h3 className="font-display font-bold text-xl text-slate-700 mb-2">Nothing saved yet</h3>
          <p className="text-slate-400 mb-6">Click the heart icon on listings to save them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <ListingCard
              key={item.id}
              listing={item.listing}
              onWishlistToggle={(id) => toggleMutation.mutate(id)}
              isWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
