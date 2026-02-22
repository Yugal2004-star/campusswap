const { supabaseAdmin } = require('../config/supabase');

// GET /api/listings - get all active listings with filters
const getListings = async (req, res, next) => {
  try {
    const {
      category,
      condition,
      min_price,
      max_price,
      search,
      sort = 'created_at',
      order = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('listings')
      .select(`
        *,
        seller:profiles!listings_seller_id_fkey(id, full_name, avatar_url, rating, dorm_location),
        listing_images(id, image_url, is_primary)
      `, { count: 'exact' })
      .eq('status', 'active');

    if (category) query = query.eq('category', category);
    if (condition) query = query.eq('condition', condition);
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));
    if (search) query = query.ilike('title', `%${search}%`);

    const validSortFields = ['created_at', 'price', 'views_count'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    query = query.order(sortField, { ascending: order === 'asc' }).range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      listings: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/:id
const getListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('listings')
      .select(`
        *,
        seller:profiles!listings_seller_id_fkey(id, full_name, avatar_url, rating, total_reviews, dorm_location, bio),
        listing_images(id, image_url, is_primary, storage_path)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Listing not found' });

    // Increment view count
    await supabaseAdmin
      .from('listings')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', id);

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST /api/listings
const createListing = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('listings')
      .insert({ ...req.body, seller_id: req.user.id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

// PUT /api/listings/:id
const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabaseAdmin
      .from('listings')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Listing not found' });
    if (existing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('listings')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/listings/:id
const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabaseAdmin
      .from('listings')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Listing not found' });
    if (existing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabaseAdmin.from('listings').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/listings/:id/images - upload listing images
const uploadListingImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!listing || listing.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const imageInserts = [];
    for (const [index, file] of files.entries()) {
      const fileName = `${req.user.id}/${id}/${Date.now()}-${index}.${file.mimetype.split('/')[1]}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('listing-images')
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      imageInserts.push({
        listing_id: id,
        image_url: publicUrl,
        storage_path: fileName,
        is_primary: index === 0,
      });
    }

    const { data, error } = await supabaseAdmin
      .from('listing_images')
      .insert(imageInserts)
      .select();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/listings/:id/images/:imageId
const deleteListingImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    const { data: image } = await supabaseAdmin
      .from('listing_images')
      .select('storage_path, listing_id')
      .eq('id', imageId)
      .eq('listing_id', id)
      .single();

    if (!image) return res.status(404).json({ error: 'Image not found' });

    await supabaseAdmin.storage.from('listing-images').remove([image.storage_path]);
    await supabaseAdmin.from('listing_images').delete().eq('id', imageId);

    res.json({ message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/my - get current user's listings
const getMyListings = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = supabaseAdmin
      .from('listings')
      .select('*, listing_images(id, image_url, is_primary)')
      .eq('seller_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST /api/listings/:id/report
const reportListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;

    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert({
        reporter_id: req.user.id,
        listing_id: id,
        reason,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Report submitted', data });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('wishlist')
      .select('*, listing:listings(*, listing_images(id, image_url, is_primary))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST /api/listings/:id/wishlist
const toggleWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabaseAdmin
      .from('wishlist')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('listing_id', id)
      .single();

    if (existing) {
      await supabaseAdmin.from('wishlist').delete().eq('id', existing.id);
      return res.json({ saved: false });
    }

    await supabaseAdmin.from('wishlist').insert({ user_id: req.user.id, listing_id: id });
    res.json({ saved: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  uploadListingImages,
  deleteListingImage,
  getMyListings,
  reportListing,
  getWishlist,
  toggleWishlist,
};
