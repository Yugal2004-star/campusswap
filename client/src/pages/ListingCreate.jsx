import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import ListingForm from '../components/listings/ListingForm';
import toast from 'react-hot-toast';

const ListingCreate = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({ formData, images }) => {
      const listing = await listingService.create(formData);
      if (images && images.length > 0) {
        const imgFormData = new FormData();
        images.forEach((img) => imgFormData.append('images', img));
        await listingService.uploadImages(listing.id, imgFormData);
      }
      return listing;
    },
    onSuccess: (listing) => {
      toast.success('Listing posted successfully!');
      navigate(`/listings/${listing.id}`);
    },
    onError: () => toast.error('Failed to create listing. Try again.'),
  });

  const handleSubmit = (formData, images) => {
    mutation.mutate({ formData, images });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">List an Item</h1>
        <p className="text-slate-500">Share something you no longer need with your campus community.</p>
      </div>

      <div className="card p-6">
        <ListingForm onSubmit={handleSubmit} loading={mutation.isPending} />
      </div>
    </div>
  );
};

export default ListingCreate;
