const { z } = require('zod');

const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().min(0).max(100000),
  category: z.enum(['furniture', 'electronics', 'textbooks', 'clothing', 'sports', 'other']),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  dorm_location: z.string().min(2).max(100),
  is_free: z.boolean().optional().default(false),
});

const updateListingSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().min(0).max(100000).optional(),
  category: z.enum(['furniture', 'electronics', 'textbooks', 'clothing', 'sports', 'other']).optional(),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  dorm_location: z.string().min(2).max(100).optional(),
  status: z.enum(['active', 'sold', 'removed']).optional(),
  is_free: z.boolean().optional(),
});

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { createListingSchema, updateListingSchema, validate };
