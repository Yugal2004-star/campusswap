const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMeetups, createMeetup, updateMeetup } = require('../controllers/meetupController');
const { createMeetupSchema, updateMeetupSchema, validate } = require('../validations/meetupValidation');

router.get('/', authMiddleware, getMeetups);
router.post('/', authMiddleware, validate(createMeetupSchema), createMeetup);
router.patch('/:id', authMiddleware, validate(updateMeetupSchema), updateMeetup);

module.exports = router;
