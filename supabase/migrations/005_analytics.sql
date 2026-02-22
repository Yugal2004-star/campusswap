-- Analytics view for admin dashboard
CREATE OR REPLACE VIEW public.admin_analytics AS
SELECT
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'user') AS total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days') AS new_users_this_month,
  (SELECT COUNT(*) FROM public.listings) AS total_listings,
  (SELECT COUNT(*) FROM public.listings WHERE status = 'active') AS active_listings,
  (SELECT COUNT(*) FROM public.listings WHERE status = 'sold') AS sold_listings,
  (SELECT COUNT(*) FROM public.listings WHERE created_at > NOW() - INTERVAL '30 days') AS new_listings_this_month,
  (SELECT COUNT(*) FROM public.chats) AS total_chats,
  (SELECT COUNT(*) FROM public.meetups WHERE status = 'completed') AS completed_meetups,
  (SELECT COUNT(*) FROM public.reports WHERE status = 'pending') AS pending_reports,
  (SELECT SUM(price) FROM public.listings WHERE status = 'sold') AS total_value_exchanged;

-- Category breakdown view
CREATE OR REPLACE VIEW public.category_stats AS
SELECT
  category,
  COUNT(*) AS total_listings,
  COUNT(*) FILTER (WHERE status = 'sold') AS sold_count,
  AVG(price) AS avg_price
FROM public.listings
GROUP BY category;

-- Sustainability stats view
CREATE OR REPLACE VIEW public.sustainability_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'sold') AS items_reused,
  SUM(price) FILTER (WHERE status = 'sold') AS total_money_saved,
  COUNT(DISTINCT seller_id) FILTER (WHERE status = 'sold') AS active_contributors,
  DATE_TRUNC('month', created_at) AS month
FROM public.listings
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Admin policies for views
GRANT SELECT ON public.admin_analytics TO authenticated;
GRANT SELECT ON public.category_stats TO authenticated;
GRANT SELECT ON public.sustainability_stats TO authenticated;

-- Admin can see all reports
CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.uid() = reporter_id
  );

-- Admin can update reports
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );
