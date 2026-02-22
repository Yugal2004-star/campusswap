const { supabaseAdmin } = require('../config/supabase');

// GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/me
const updateMe = async (req, res, next) => {
  try {
    const allowed = ['full_name', 'dorm_location', 'university', 'bio', 'avatar_url'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id - public profile
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url, university, dorm_location, bio, rating, total_reviews, created_at')
      .eq('id', id)
      .single();

    if (error || !profile) return res.status(404).json({ error: 'User not found' });

    const { data: listings } = await supabaseAdmin
      .from('listings')
      .select('*, listing_images(image_url, is_primary)')
      .eq('seller_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    res.json({ ...profile, listings });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/avatar - upload avatar
const uploadAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const fileName = `avatars/${req.user.id}/${Date.now()}.${file.mimetype.split('/')[1]}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('listing-images')
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('listing-images')
      .getPublicUrl(fileName);

    await supabaseAdmin.from('profiles').update({ avatar_url: publicUrl }).eq('id', req.user.id);

    res.json({ avatar_url: publicUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, getUserProfile, uploadAvatar };
