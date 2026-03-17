// routes/tourist_feedback.routes.js
import express from 'express';

const router = express.Router();

// Temporary in-memory storage (replace with MongoDB model later)
let feedbacks = [];

// ==================== CREATE FEEDBACK ====================
// POST /api/feedbacks
router.post('/', async (req, res) => {
  try {
    const { touristId, rating, comment, category } = req.body;

    // Validate required fields
    if (!touristId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Tourist ID and rating are required'
      });
    }

    // Validate rating (should be 1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create feedback
    const feedback = {
      id: Date.now().toString(),
      touristId,
      rating,
      comment: comment || '',
      category: category || 'General',
      createdAt: new Date(),
      status: 'Pending'
    };

    feedbacks.push(feedback);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Feedback creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== GET ALL FEEDBACKS ====================
// GET /api/feedbacks
router.get('/', async (req, res) => {
  try {
    const { touristId, category, minRating } = req.query;

    let filteredFeedbacks = [...feedbacks];

    // Filter by tourist ID
    if (touristId) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.touristId === touristId);
    }

    // Filter by category
    if (category) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.category === category);
    }

    // Filter by minimum rating
    if (minRating) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.rating >= parseInt(minRating));
    }

    res.json({
      success: true,
      count: filteredFeedbacks.length,
      data: filteredFeedbacks
    });

  } catch (error) {
    console.error('Feedback fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== GET FEEDBACK BY ID ====================
// GET /api/feedbacks/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = feedbacks.find(f => f.id === id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Feedback fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== GET FEEDBACKS BY TOURIST ====================
// GET /api/feedbacks/tourist/:touristId
router.get('/tourist/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;

    const touristFeedbacks = feedbacks.filter(f => f.touristId === touristId);

    res.json({
      success: true,
      count: touristFeedbacks.length,
      data: touristFeedbacks
    });

  } catch (error) {
    console.error('Feedback fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== UPDATE FEEDBACK ====================
// PATCH /api/feedbacks/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const feedbackIndex = feedbacks.findIndex(f => f.id === id);

    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update feedback
    feedbacks[feedbackIndex] = {
      ...feedbacks[feedbackIndex],
      ...updates,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedbacks[feedbackIndex]
    });

  } catch (error) {
    console.error('Feedback update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== DELETE FEEDBACK ====================
// DELETE /api/feedbacks/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const feedbackIndex = feedbacks.findIndex(f => f.id === id);

    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedbacks.splice(feedbackIndex, 1);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Feedback delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== GET FEEDBACK STATISTICS ====================
// GET /api/feedbacks/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
      : 0;

    const ratingDistribution = {
      1: feedbacks.filter(f => f.rating === 1).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      5: feedbacks.filter(f => f.rating === 5).length,
    };

    res.json({
      success: true,
      data: {
        totalFeedbacks,
        averageRating: averageRating.toFixed(2),
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;