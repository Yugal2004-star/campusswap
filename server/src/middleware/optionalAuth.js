const { supabaseAdmin } = require('../config/supabase');

// Like authMiddleware but does NOT block unauthenticated requests.
// If a valid token is present, req.user is populated.
// If no token, req.user stays null and the request continues.
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next(); // no token — that's fine, continue
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      req.user = null;
      return next(); // invalid token — treat as guest
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, is_banned')
      .eq('id', user.id)
      .single();

    req.user = profile && !profile.is_banned ? { ...user, ...profile } : null;
    next();
  } catch {
    req.user = null;
    next(); // never block on error
  }
};

module.exports = optionalAuth;