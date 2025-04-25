import express from 'express';
import { chatWithOpenAI } from '../controllers/openaiController.js';

const router = express.Router();

// POST route for chat interactions
router.post('/chat', chatWithOpenAI);

export default router; 