const { z } = require('zod');

const createChatSchema = z.object({
  listing_id: z.string().uuid(),
  initial_message: z.string().min(1).max(1000),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  message_type: z.enum(['text', 'meetup_request', 'system']).optional().default('text'),
});

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { createChatSchema, sendMessageSchema, validate };
