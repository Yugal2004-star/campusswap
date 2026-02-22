import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingService } from '../../services/listingService';
import { formatPrice, getPrimaryImage, getCategoryIcon } from '../../utils/helpers';

// ─── Keyword-based filter extractor (no API, no cost) ────────────────────────
const extractFilters = (message) => {
  const msg = message.toLowerCase();
  const filters = {};

  // ── Category + Search keyword detection ──
  const categoryMap = {
    furniture: ['desk', 'chair', 'table', 'bed', 'sofa', 'couch', 'shelf', 'cupboard', 'wardrobe', 'almirah', 'mattress', 'furniture', 'stool', 'rack'],
    electronics: ['laptop', 'phone', 'mobile', 'charger', 'headphone', 'earphone', 'tablet', 'ipad', 'computer', 'pc', 'monitor', 'keyboard', 'mouse', 'camera', 'speaker', 'tv', 'electronics', 'wire', 'cable', 'adapter', 'powerbank'],
    textbooks: ['textbook', 'book', 'notes', 'novel', 'guide', 'syllabus', 'reference', 'physics', 'chemistry', 'maths', 'math', 'biology', 'engineering', 'commerce', 'study material', 'ncert', 'notebook'],
    clothing: ['shirt', 'tshirt', 't-shirt', 'jeans', 'pant', 'dress', 'jacket', 'hoodie', 'shoes', 'sneakers', 'kurta', 'saree', 'uniform', 'clothing', 'clothes', 'top', 'skirt', 'shorts', 'sandals'],
    sports: ['cricket', 'football', 'basketball', 'badminton', 'gym', 'fitness', 'racket', 'bat', 'ball', 'cycle', 'bicycle', 'dumbbell', 'weights', 'sports', 'yoga', 'mat', 'skipping'],
    other: ['other', 'misc', 'miscellaneous'],
  };

  for (const [cat, keywords] of Object.entries(categoryMap)) {
    const matched = keywords.find(k => msg.includes(k));
    if (matched) {
      filters.category = cat;
      // use matched word as search unless it's the category name itself
      if (!['furniture', 'electronics', 'textbooks', 'clothing', 'sports', 'other', 'misc', 'miscellaneous'].includes(matched)) {
        filters.search = matched;
      }
      break;
    }
  }

  // ── Condition detection ──
  if (msg.includes('brand new') || msg.includes('unused') || (msg.includes('new') && !msg.includes('new condition'))) {
    filters.condition = 'new';
  } else if (msg.includes('like new') || msg.includes('almost new') || msg.includes('barely used')) {
    filters.condition = 'like_new';
  } else if (msg.includes('good condition') || msg.includes('good quality')) {
    filters.condition = 'good';
  } else if (msg.includes('fair condition') || msg.includes('average condition')) {
    filters.condition = 'fair';
  } else if (msg.includes('poor') || msg.includes('damaged') || msg.includes('broken')) {
    filters.condition = 'poor';
  }

  // ── Price detection ──
  // "under 5000", "below 10k", "less than 3000", "upto 2000", "max 5000"
  const underMatch = msg.match(/(?:under|below|less than|upto|up to|within|max|maximum|budget of|atmost|at most)\s*(?:rs\.?|₹|inr)?\s*(\d+)\s*k?/);
  if (underMatch) {
    const val = parseInt(underMatch[1]);
    filters.max_price = underMatch[0].includes('k') ? val * 1000 : val;
  }

  // "above 1000", "more than 500", "minimum 2000", "atleast 1000"
  const aboveMatch = msg.match(/(?:above|more than|over|min|minimum|atleast|at least)\s*(?:rs\.?|₹|inr)?\s*(\d+)\s*k?/);
  if (aboveMatch) {
    const val = parseInt(aboveMatch[1]);
    filters.min_price = aboveMatch[0].includes('k') ? val * 1000 : val;
  }

  // "between 1000 and 5000"
  const betweenMatch = msg.match(/between\s*(?:rs\.?|₹)?\s*(\d+)\s*k?\s*(?:and|to|-)\s*(?:rs\.?|₹)?\s*(\d+)\s*k?/);
  if (betweenMatch) {
    const v1 = parseInt(betweenMatch[1]);
    const v2 = parseInt(betweenMatch[2]);
    filters.min_price = betweenMatch[0].includes('k') ? v1 * 1000 : v1;
    filters.max_price = betweenMatch[0].includes('k') ? v2 * 1000 : v2;
  }

  // ── Free items ──
  if (msg.includes('free') || msg.includes('no cost') || msg.includes('donate') || msg.includes('giveaway') || msg.includes('zero cost')) {
    filters.max_price = 0;
    delete filters.min_price;
  }

  // ── Cheap / budget shorthand (no price mentioned) ──
  if ((msg.includes('cheap') || msg.includes('budget') || msg.includes('affordable') || msg.includes('low price') || msg.includes('inexpensive')) && !filters.max_price) {
    filters.max_price = 1000;
  }

  return filters;
};

// ─── Generate friendly reply based on filters + results ──────────────────────
const generateReply = (filters, count) => {
  const parts = [];
  if (filters.search)    parts.push(`"${filters.search}"`);
  if (filters.category && !filters.search)  parts.push(filters.category);
  if (filters.condition) parts.push(`${filters.condition.replace('_', ' ')} condition`);
  if (filters.max_price === 0) parts.push('for free');
  else if (filters.max_price && filters.min_price) parts.push(`₹${filters.min_price}–₹${filters.max_price}`);
  else if (filters.max_price) parts.push(`under ₹${filters.max_price}`);
  else if (filters.min_price) parts.push(`above ₹${filters.min_price}`);

  const searched = parts.length ? `Searched for ${parts.join(', ')}. ` : '';
  if (count === 0) return `${searched}😕 No items found! Try broader keywords.`;
  if (count === 1) return `${searched}Found 1 item for you! 👇`;
  return `${searched}Found ${count} items for you! 👇`;
};

// ─── Simple intent handler (greetings, help, etc.) ───────────────────────────
const getIntentReply = (message) => {
  const msg = message.toLowerCase().trim();
  if (msg.match(/^(hi|hello|hey|hii|helo|namaste|sup|yo)\b/))
    return "Hey! 👋 I'm your campus shopping assistant.\n\nTell me what you're looking for and I'll find the best deals on campus!";
  if (msg.match(/\b(help|what can you do|how (does this|to use)|instructions)\b/))
    return "I can find campus items for you! 🛍️\n\nJust describe what you need:\n• \"cheap physics textbook\"\n• \"laptop under ₹15000\"\n• \"free furniture\"\n• \"good condition cricket bat\"\n• \"clothes between ₹200 and ₹1000\"";
  if (msg.match(/\b(thanks|thank you|thx|ty|thankyou)\b/))
    return "You're welcome! 😊 Let me know if you need anything else.";
  if (msg.match(/\b(bye|goodbye|see you|cya|ok bye)\b/))
    return "Bye! Happy shopping! 🛍️";
  if (msg.match(/\b(who are you|what are you|are you (a )?bot|are you ai)\b/))
    return "I'm CampusSwap's shopping assistant 🤖 I help you find the best deals among student listings on campus. Just tell me what you need!";
  return null;
};

// ─── Mini Listing Card ───────────────────────────────────────────────────────
const MiniListingCard = ({ listing }) => {
  const img = getPrimaryImage(listing.listing_images);
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-100 hover:border-primary-300 hover:shadow-sm transition-all group"
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
        {img
          ? <img src={img} alt={listing.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">{getCategoryIcon(listing.category)}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary-600 transition-colors">
          {listing.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-slate-500 truncate">📍 {listing.dorm_location}</p>
          <span className="text-slate-300 text-xs">•</span>
          <p className="text-xs text-slate-400 capitalize">{listing.condition?.replace('_', ' ')}</p>
        </div>
      </div>
      <p className="text-sm font-bold text-primary-600 flex-shrink-0">
        {formatPrice(listing.price)}
      </p>
    </Link>
  );
};

// ─── Message Bubble ──────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex gap-2 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {isBot && (
        <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
          🤖
        </div>
      )}
      <div className={`max-w-[85%] space-y-2 ${!isBot ? 'items-end flex flex-col' : ''}`}>
        {msg.content && (
          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            isBot
              ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
              : 'bg-primary-600 text-white rounded-tr-sm'
          }`}>
            {msg.content}
          </div>
        )}

        {/* Listing results */}
        {msg.listings && msg.listings.length > 0 && (
          <div className="space-y-2 w-full">
            {msg.listings.map(l => <MiniListingCard key={l.id} listing={l} />)}
            {msg.totalCount > msg.listings.length && (
              <p className="text-xs text-slate-400 text-center pt-1">
                +{msg.totalCount - msg.listings.length} more on the browse page
              </p>
            )}
          </div>
        )}

        {/* No results */}
        {msg.listings && msg.listings.length === 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 text-sm text-amber-700">
            😕 No items found. Try different keywords or broaden your search!
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Suggestion chips ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: '📚 Cheap textbooks',      query: 'cheap textbooks' },
  { label: '💻 Laptop under ₹20k',   query: 'laptop under 20000' },
  { label: '🛋️ Free furniture',       query: 'free furniture' },
  { label: '👕 Good condition clothes', query: 'good condition clothes' },
  { label: '⚽ Sports equipment',     query: 'sports equipment' },
  { label: '📱 Mobile phones',        query: 'mobile phone' },
];

// ─── Main Chatbot ─────────────────────────────────────────────────────────────
const AIChatbot = () => {
  const [isOpen, setIsOpen]       = useState(false);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages]   = useState([
    {
      id: 1,
      role: 'bot',
      content: "Hi! 👋 I'm your campus shopping assistant.\n\nTell me what you're looking for and I'll find the best deals for you!\n\nTry: \"laptop under ₹15000\" or \"free furniture\"",
    }
  ]);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const addMessage = (msg) =>
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);

  const handleSend = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');

    addMessage({ role: 'user', content: userText });
    setLoading(true);

    // Small natural delay
    await new Promise(r => setTimeout(r, 350));

    try {
      // 1. Check simple intents (no search needed)
      const intentReply = getIntentReply(userText);
      if (intentReply) {
        addMessage({ role: 'bot', content: intentReply });
        setLoading(false);
        return;
      }

      // 2. Extract filters from message
      const filters = extractFilters(userText);

      // 3. Nothing understood — ask for clarification
      if (Object.keys(filters).length === 0) {
        addMessage({
          role: 'bot',
          content: "🤔 I didn't quite understand that.\n\nTry something like:\n• \"laptop under ₹10,000\"\n• \"good condition physics book\"\n• \"free furniture\"\n• \"cricket bat\"",
        });
        setLoading(false);
        return;
      }

      // 4. Search your listings API
      const data = await listingService.getAll({
        ...filters,
        limit: 4,
        sort: 'created_at',
        order: 'desc',
      });

      const listings   = data.listings   || [];
      const totalCount = data.pagination?.total || listings.length;

      addMessage({
        role: 'bot',
        content: generateReply(filters, totalCount),
        listings,
        totalCount,
      });

    } catch (err) {
      console.error('Chatbot error:', err);
      addMessage({
        role: 'bot',
        content: '⚠️ Could not fetch listings right now. Please try again!',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
        aria-label="Open Shopping Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden bg-surface-50"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-primary-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div>
              <p className="font-display font-bold text-white text-sm">Campus Shopping Assistant</p>
              <p className="text-primary-200 text-xs">Free · Instant · No API needed</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-primary-200">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestion chips — only at start */}
            {messages.length === 1 && !loading && (
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.query}
                      onClick={() => handleSend(s.query)}
                      className="text-xs bg-white border border-slate-200 hover:border-primary-400 hover:bg-primary-50 text-slate-600 hover:text-primary-700 px-3 py-1.5 rounded-full transition-all"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. laptop under ₹10,000..."
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-50"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;