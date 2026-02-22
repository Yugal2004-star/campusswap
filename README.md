# 🏫 CampusSwap — Campus Marketplace

A full-stack campus-only marketplace for verified students to safely buy and sell furniture, electronics, textbooks, and more.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (OAuth + Email) |
| **Storage** | Supabase Storage |
| **Realtime** | Supabase Realtime (chat) |
| **State** | TanStack Query + Zustand |
| **Validation** | Zod |

---

## 📁 Project Structure

```
campus-marketplace/
├── client/          # React + Tailwind frontend
├── server/          # Node.js + Express API
└── supabase/        # Database migrations & config
```

---

## ⚙️ Setup

### 1. Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run migrations in the SQL editor (in order):
   - `supabase/migrations/001_users.sql`
   - `supabase/migrations/002_listings.sql`
   - `supabase/migrations/003_chats.sql`
   - `supabase/migrations/004_meetups.sql`
   - `supabase/migrations/005_analytics.sql`
3. Enable **Google OAuth** in Authentication → Providers
4. Set redirect URL to `http://localhost:5173/auth/callback`

### 2. Environment Variables

**Server** (`server/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```

### 3. Install & Run

```bash
# Install all dependencies
npm run install:all

# Run both client + server
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/health

---

## 🔑 Key Features

### 🔐 Authentication
- Google OAuth with university email
- Email/password signup with verification
- JWT-based API authentication
- Role-based access (user / admin)

### 📦 Listings
- Create listings with up to 5 photos
- Filter by category, condition, price range
- Search by title
- Wishlist/save items
- Report suspicious listings

### 💬 Real-time Chat
- Supabase Realtime powered messaging
- No refresh needed — messages appear instantly
- Unread message counts

### 📅 Meetup Scheduling
- Schedule safe on-campus meetups
- Confirm / cancel / complete meetups
- Meetup status messages sent in chat

### 🛡️ Admin Dashboard
- User management (ban/unban, promote to admin)
- Listing moderation (remove/restore)
- Report review (resolve/dismiss)
- Analytics: total users, listings, sustainability impact

---

## 🗃️ Database Schema

| Table | Description |
|---|---|
| `profiles` | Student profiles extending Supabase auth |
| `listings` | Item listings with category, price, location |
| `listing_images` | Multiple images per listing |
| `wishlist` | Saved listings per user |
| `chats` | Conversation threads |
| `messages` | Chat messages with realtime |
| `meetups` | Scheduled on-campus meetups |
| `reports` | User-submitted reports |

---

## 🌱 Future Enhancements

- [ ] Push notifications (web/mobile)
- [ ] UPI/Razorpay payment integration
- [ ] Mobile app (React Native)
- [ ] AI-powered price suggestions
- [ ] Review & rating system post-meetup
