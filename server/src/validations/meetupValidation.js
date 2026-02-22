const { z } = require('zod');

const createMeetupSchema = z.object({
  chat_id: z.string().uuid(),
  listing_id: z.string().uuid(),
  location: z.string().min(3).max(200),
  meetup_date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  meetup_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  notes: z.string().max(500).optional(),
});

const updateMeetupSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed']),
  cancel_reason: z.string().max(300).optional(),
});

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { createMeetupSchema, updateMeetupSchema, validate };
