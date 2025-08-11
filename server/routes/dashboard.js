const express = require('express');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Contact = require('../models/Contact');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Get basic counts
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalContacts,
      unreadContacts,
      totalUsers,
      totalViews
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'upcoming' }),
      Event.countDocuments({ status: 'completed' }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      User.countDocuments(),
      Post.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ])
    ]);

    // Get recent activity
    const recentPosts = await Post.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt views');

    const recentEvents = await Event.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status date currentAttendees maxAttendees');

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt');

    // Get monthly statistics for charts
    const currentYear = new Date().getFullYear();
    const monthlyPosts = await Post.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const monthlyEvents = await Event.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get popular posts
    const popularPosts = await Post.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title views likes createdAt')
      .populate('author', 'name');

    // Get event attendance statistics
    const eventStats = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$maxAttendees' },
          totalAttendees: { $sum: '$currentAttendees' },
          averageAttendance: { $avg: { $divide: ['$currentAttendees', '$maxAttendees'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalPosts,
          publishedPosts,
          draftPosts,
          totalEvents,
          upcomingEvents,
          completedEvents,
          totalContacts,
          unreadContacts,
          totalUsers,
          totalViews: totalViews[0]?.totalViews || 0
        },
        recentActivity: {
          posts: recentPosts,
          events: recentEvents,
          contacts: recentContacts
        },
        charts: {
          monthlyPosts: monthlyPosts.map(item => ({
            month: item._id,
            count: item.count
          })),
          monthlyEvents: monthlyEvents.map(item => ({
            month: item._id,
            count: item.count
          }))
        },
        popularPosts,
        eventStats: eventStats[0] || {
          totalCapacity: 0,
          totalAttendees: 0,
          averageAttendance: 0
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics
// @access  Private (Admin only)
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily statistics
    const dailyStats = await Promise.all([
      // Daily posts
      Post.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      // Daily events
      Event.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      // Daily contacts
      Contact.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    // Get category distribution
    const [postCategories, eventTypes, contactCategories] = await Promise.all([
      Post.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Contact.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        dailyStats: {
          posts: dailyStats[0],
          events: dailyStats[1],
          contacts: dailyStats[2]
        },
        distributions: {
          postCategories,
          eventTypes,
          contactCategories
        }
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

module.exports = router;