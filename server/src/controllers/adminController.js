const { supabaseAdmin } = require('../config/supabase');

// GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('admin_analytics').select('*').single();
    if (error) throw error;

    const { data: categoryStats } = await supabaseAdmin.from('category_stats').select('*');
    const { data: sustainabilityStats } = await supabaseAdmin
      .from('sustainability_stats')
      .select('*')
      .limit(6);

    res.json({ overview: data, categories: categoryStats, sustainability: sustainabilityStats });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    if (role) query = query.eq('role', role);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      users: data,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_banned } = req.body;
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (is_banned !== undefined) updates.is_banned = is_banned;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/listings
const getAdminListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('listings')
      .select(`*, seller:profiles!listings_seller_id_fkey(id, full_name, email), listing_images(image_url, is_primary)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      listings: data,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/reports
const getReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    const { data, error } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(id, full_name, email),
        listing:listings(id, title),
        reported_user:profiles!reports_reported_user_id_fkey(id, full_name, email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/reports/:id
const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/listings/:id/status
const updateListingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('listings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics, getUsers, updateUser, getAdminListings, getReports, updateReport, updateListingStatus };
