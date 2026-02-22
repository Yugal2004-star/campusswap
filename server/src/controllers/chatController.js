const { supabaseAdmin } = require('../config/supabase');

// GET /api/chats - get all chats for current user
const getChats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('chats')
      .select(`
        *,
        listing:listings(id, title, status, listing_images(image_url, is_primary)),
        buyer:profiles!chats_buyer_id_fkey(id, full_name, avatar_url),
        seller:profiles!chats_seller_id_fkey(id, full_name, avatar_url)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /api/chats/:id/messages
const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: chat } = await supabaseAdmin
      .from('chats')
      .select('buyer_id, seller_id')
      .eq('id', id)
      .single();

    if (!chat || (chat.buyer_id !== userId && chat.seller_id !== userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
      .eq('chat_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark messages as read
    await supabaseAdmin
      .from('messages')
      .update({ is_read: true })
      .eq('chat_id', id)
      .neq('sender_id', userId);

    // Reset unread count
    const unreadField = chat.buyer_id === userId ? 'buyer_unread' : 'seller_unread';
    await supabaseAdmin.from('chats').update({ [unreadField]: 0 }).eq('id', id);

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST /api/chats - start a new chat
const createChat = async (req, res, next) => {
  try {
    const { listing_id, initial_message } = req.body;
    const buyer_id = req.user.id;

    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('seller_id, status, title')
      .eq('id', listing_id)
      .single();

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ error: 'This listing is no longer active' });
    if (listing.seller_id === buyer_id) return res.status(400).json({ error: 'You cannot chat with yourself' });

    // Check if chat already exists
    const { data: existing } = await supabaseAdmin
      .from('chats')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('buyer_id', buyer_id)
      .single();

    let chatId;
    if (existing) {
      chatId = existing.id;
    } else {
      const { data: newChat, error: chatError } = await supabaseAdmin
        .from('chats')
        .insert({ listing_id, buyer_id, seller_id: listing.seller_id })
        .select()
        .single();

      if (chatError) throw chatError;
      chatId = newChat.id;
    }

    // Send initial message
    const { data: message, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({ chat_id: chatId, sender_id: buyer_id, content: initial_message })
      .select()
      .single();

    if (msgError) throw msgError;

    // Update chat with last message
    await supabaseAdmin
      .from('chats')
      .update({
        last_message: initial_message,
        last_message_at: new Date().toISOString(),
        seller_unread: supabaseAdmin.rpc('increment', { row_id: chatId }),
      })
      .eq('id', chatId);

    res.status(201).json({ chat_id: chatId, message });
  } catch (err) {
    next(err);
  }
};

// POST /api/chats/:id/messages
const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, message_type } = req.body;
    const userId = req.user.id;

    const { data: chat } = await supabaseAdmin
      .from('chats')
      .select('buyer_id, seller_id')
      .eq('id', id)
      .single();

    if (!chat || (chat.buyer_id !== userId && chat.seller_id !== userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({ chat_id: id, sender_id: userId, content, message_type })
      .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
      .single();

    if (error) throw error;

    // Update chat last message and increment unread for the other party
    const otherUnreadField = chat.buyer_id === userId ? 'seller_unread' : 'buyer_unread';
    await supabaseAdmin
      .from('chats')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Increment unread count using raw update
    const { data: currentChat } = await supabaseAdmin.from('chats').select(otherUnreadField).eq('id', id).single();
    await supabaseAdmin
      .from('chats')
      .update({ [otherUnreadField]: (currentChat[otherUnreadField] || 0) + 1 })
      .eq('id', id);

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

module.exports = { getChats, getMessages, createChat, sendMessage };
