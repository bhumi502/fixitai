// routes/aiRoutes.js - AI Endpoint Routes
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzeComplaint, chatAssistant, generateSolutionGuide } = require('../services/aiService');

// @desc    Analyze complaint description with AI
// @route   POST /api/ai/analyze
// @access  Private (Authenticated Users/Admin)
router.post('/analyze', protect, async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid complaint description to analyze.',
      });
    }

    const result = await analyzeComplaint(description);

    return res.status(200).json({
      success: true,
      message: 'AI Analysis complete',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate AI Repair & Diagnostic Solution Guide for Staff/Admin
// @route   POST /api/ai/solution-guide
// @access  Private (Staff/Admin)
router.post('/solution-guide', protect, async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;
    const result = await generateSolutionGuide({ title, description, category, location });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    AI Chatbot Assistant response
// @route   POST /api/ai/chat
// @access  Public / Private
router.post('/chat', async (req, res, next) => {
  try {
    const { message, userRole } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    const result = await chatAssistant(message, { role: userRole || 'user' });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
