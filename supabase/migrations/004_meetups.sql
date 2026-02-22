-- Meetups table (safe on-campus meetup scheduling)
CREATE TABLE IF NOT EXISTS public.meetups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  proposed_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  meetup_date DATE NOT NULL,
  meetup_time TIME NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  cancelled_by UUID REFERENCES public.profiles(id),
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for meetups
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meetup participants can view meetups"
  ON public.meetups FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Chat participants can create meetups"
  ON public.meetups FOR INSERT
  WITH CHECK (auth.uid() = proposed_by);

CREATE POLICY "Meetup participants can update meetups"
  ON public.meetups FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Trigger
CREATE TRIGGER meetups_updated_at
  BEFORE UPDATE ON public.meetups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
