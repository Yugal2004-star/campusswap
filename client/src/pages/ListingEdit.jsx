import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { useAuth } from '../context/AuthContext';
import ListingForm from '../components/listings/ListingForm';
import toast from 'react-hot-toast';

const ListingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getOne(id),
  });

  const mutation = useMutation({
    mutationFn: async ({ formData, images }) => {
      const updated = await listingService.update(id, formData);
      if (images && images.length > 0) {
        const imgFormData = new FormData();
        images.forEach((img) => imgFormData.append('images', img));
        await listingService.uploadImages(id, imgFormData);
      }
      return updated;
    },
    onSuccess: () => {
      toast.success('Listing updated!');
      navigate(`/listings/${id}`);
    },
    onError: () => toast.error('Failed to update listing'),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!listing || listing.seller_id !== user?.id) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">Edit Listing</h1>
        <p className="text-slate-500">Update your listing information.</p>
      </div>
      <div className="card p-6">
        <ListingForm
          initialData={listing}
          onSubmit={(formData, images) => mutation.mutate({ formData, images })}
          loading={mutation.isPending}
        />
      </div>
    </div>
  );
};

export default ListingEdit;
