const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getChats, getMessages, createChat, sendMessage } = require('../controllers/chatController');
const { createChatSchema, sendMessageSchema, validate } = require('../validations/chatValidation');

router.get('/', authMiddleware, getChats);
router.post('/', authMiddleware, validate(createChatSchema), createChat);
router.get('/:id/messages', authMiddleware, getMessages);
router.post('/:id/messages', authMiddleware, validate(sendMessageSchema), sendMessage);

module.exports = router;
