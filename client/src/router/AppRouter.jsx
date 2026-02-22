import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './ProtectedRoute';
import Layout from '../components/common/Layout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import AuthCallback from '../pages/auth/AuthCallback';
import ListingDetailPage from '../pages/ListingDetailPage';
import ListingCreate from '../pages/ListingCreate';
import ListingEdit from '../pages/ListingEdit';
import Chat from '../pages/Chat';
import Profile from '../pages/Profile';
import Wishlist from '../pages/Wishlist';
import MeetupPage from '../pages/MeetupPage';
import NotFound from '../pages/NotFound';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminListings from '../pages/admin/AdminListings';
import AdminReports from '../pages/admin/AdminReports';

const AppRouter = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      {/* ─── Public auth routes ─────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ─── PUBLIC routes (no login needed) inside Layout ──── */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/profile/:userId" element={<Profile />} />
      </Route>

      {/* ─── PROTECTED routes (must be logged in) ───────────── */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/listings/create" element={<ListingCreate />} />
        <Route path="/listings/:id/edit" element={<ListingEdit />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:chatId" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/meetups" element={<MeetupPage />} />
      </Route>

      {/* ─── ADMIN routes ────────────────────────────────────── */}
      <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="listings" element={<AdminListings />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;