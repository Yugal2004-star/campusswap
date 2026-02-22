const { supabaseAdmin } = require('../config/supabase');

// GET /api/meetups - get meetups for current user
const getMeetups = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = supabaseAdmin
      .from('meetups')
      .select(`
        *,
        listing:listings(id, title, listing_images(image_url, is_primary)),
        buyer:profiles!meetups_buyer_id_fkey(id, full_name, avatar_url),
        seller:profiles!meetups_seller_id_fkey(id, full_name, avatar_url)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('meetup_date', { ascending: true });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST /api/meetups
const createMeetup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { chat_id, listing_id, location, meetup_date, meetup_time, notes } = req.body;

    const { data: chat } = await supabaseAdmin
      .from('chats')
      .select('buyer_id, seller_id')
      .eq('id', chat_id)
      .single();

    if (!chat || (chat.buyer_id !== userId && chat.seller_id !== userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('meetups')
      .insert({
        chat_id,
        listing_id,
        proposed_by: userId,
        buyer_id: chat.buyer_id,
        seller_id: chat.seller_id,
        location,
        meetup_date,
        meetup_time,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Send meetup request message in chat
    await supabaseAdmin.from('messages').insert({
      chat_id,
      sender_id: userId,
      content: `📅 Meetup proposed: ${location} on ${meetup_date} at ${meetup_time}`,
      message_type: 'meetup_request',
    });

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/meetups/:id
const updateMeetup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, cancel_reason } = req.body;

    const { data: meetup } = await supabaseAdmin
      .from('meetups')
      .select('buyer_id, seller_id, chat_id, proposed_by')
      .eq('id', id)
      .single();

    if (!meetup || (meetup.buyer_id !== userId && meetup.seller_id !== userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = { status };
    if (status === 'cancelled') {
      updateData.cancelled_by = userId;
      updateData.cancel_reason = cancel_reason;
    }

    const { data, error } = await supabaseAdmin
      .from('meetups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send status message in chat
    const statusMessages = {
      confirmed: '✅ Meetup confirmed!',
      cancelled: `❌ Meetup cancelled. Reason: ${cancel_reason || 'No reason provided'}`,
      completed: '🎉 Meetup completed! Transaction done.',
    };

    await supabaseAdmin.from('messages').insert({
      chat_id: meetup.chat_id,
      sender_id: userId,
      content: statusMessages[status],
      message_type: status === 'confirmed' ? 'meetup_confirmed' : 'system',
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMeetups, createMeetup, updateMeetup };
