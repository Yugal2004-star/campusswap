import { useState } from 'react';
import { CATEGORIES, CONDITIONS, DORM_LOCATIONS } from '../../utils/constants';

const ListingForm = ({ initialData = {}, onSubmit, loading }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'other',
    condition: 'good',
    dorm_location: '',
    is_free: false,
    ...initialData,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'is_free' && checked ? { price: '0' } : {}),
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.length < 3) errs.title = 'Title must be at least 3 characters';
    if (!form.description.trim() || form.description.length < 10) errs.description = 'Description must be at least 10 characters';
    if (!form.is_free && (isNaN(form.price) || Number(form.price) < 0)) errs.price = 'Enter a valid price';
    if (!form.dorm_location) errs.dorm_location = 'Select your dorm/location';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      price: form.is_free ? 0 : Number(form.price),
    }, images);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="label">Item Title *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g., IKEA Study Desk - Excellent Condition"
          className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Category & Condition */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className="input">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Condition *</label>
          <select name="condition" value={form.condition} onChange={handleChange} className="input">
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">Price *</label>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              name="is_free"
              checked={form.is_free}
              onChange={handleChange}
              className="rounded"
            />
            Give it away for free
          </label>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            disabled={form.is_free}
            placeholder="0"
            min="0"
            className={`input pl-8 ${form.is_free ? 'bg-slate-50 text-slate-400' : ''} ${errors.price ? 'border-red-400' : ''}`}
          />
        </div>
        {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
      </div>

      {/* Location */}
      <div>
        <label className="label">Dorm / Location *</label>
        <select name="dorm_location" value={form.dorm_location} onChange={handleChange} className={`input ${errors.dorm_location ? 'border-red-400' : ''}`}>
          <option value="">Select your location</option>
          {DORM_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        {errors.dorm_location && <p className="mt-1 text-xs text-red-500">{errors.dorm_location}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe the item's condition, dimensions, any defects, reason for selling..."
          className={`input resize-none ${errors.description ? 'border-red-400' : ''}`}
        />
        <p className="mt-1 text-xs text-slate-400">{form.description.length}/2000</p>
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Images */}
      <div>
        <label className="label">Photos (up to 5)</label>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            id="images"
          />
          <label htmlFor="images" className="cursor-pointer">
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm text-slate-600">Click to upload photos</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB each</p>
          </label>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >✕</button>
                {i === 0 && <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-1 rounded">Main</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          initialData?.id ? 'Update Listing' : 'Post Listing'
        )}
      </button>
    </form>
  );
};

export default ListingForm;
