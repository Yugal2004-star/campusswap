import AIChatbot from './AIChatbot';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">CS</span>
            </div>
            <span className="font-display font-bold text-xl text-slate-900">CampusSwap</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`btn-ghost text-sm ${isActive('/') ? 'text-primary-600 bg-primary-50' : ''}`}>Browse</Link>
            {user && (
              <>
                <Link to="/chat" className={`btn-ghost text-sm ${location.pathname.startsWith('/chat') ? 'text-primary-600 bg-primary-50' : ''}`}>Messages</Link>
                <Link to="/meetups" className={`btn-ghost text-sm ${isActive('/meetups') ? 'text-primary-600 bg-primary-50' : ''}`}>Meetups</Link>
                <Link to="/wishlist" className={`btn-ghost text-sm ${isActive('/wishlist') ? 'text-primary-600 bg-primary-50' : ''}`}>Saved</Link>
                {isAdmin && (
                  <Link to="/admin" className={`btn-ghost text-sm text-purple-600 ${location.pathname.startsWith('/admin') ? 'bg-purple-50' : ''}`}>Admin</Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/listings/create" className="btn-primary text-sm hidden sm:inline-flex">
                  + List Item
                </Link>
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                        {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 card shadow-lg py-1 animate-scale-in">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-sm text-slate-800">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>My Profile</Link>
                      <Link to="/listings/create" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 sm:hidden" onClick={() => setMenuOpen(false)}>List an Item</Link>
                      <Link to="/meetups" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 md:hidden" onClick={() => setMenuOpen(false)}>Meetups</Link>
                      {isAdmin && <Link to="/admin" className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                      <hr className="my-1 border-slate-100" />
                      <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/login" className="btn-primary text-sm">Sign Up Free</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {menuOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
};

const Layout = () => (
  <div className="min-h-screen bg-surface-50">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Outlet />
    </main>
    <AIChatbot />
  </div>
);

export default Layout;