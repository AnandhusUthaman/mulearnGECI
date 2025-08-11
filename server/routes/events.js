const express = require('express');
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');
const { upload, handleUploadError, deleteFile } = require('../middleware/upload');
const { validateEvent, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filtering and pagination
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }
    
    if (req.query.author) {
      filter.author = req.query.author;
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Date filtering
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) {
        filter.date.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.date.$lte = new Date(req.query.dateTo);
      }
    }

    // Get events with pagination
    const events = await Event.find(filter)
      .populate('author', 'name email')
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Event.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: events,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('author', 'name email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Admin only)
router.post('/', adminAuth, upload.single('image'), handleUploadError, validateEvent, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const {
      title,
      description,
      content,
      date,
      time,
      endTime,
      location,
      venue,
      type,
      category,
      maxAttendees,
      registrationLink,
      registrationDeadline,
      status,
      featured,
      tags,
      organizers,
      speakers,
      requirements,
      agenda,
      price,
      currency,
      imageAlt
    } = req.body;

    const event = new Event({
      title,
      description,
      content,
      image: `/uploads/events/${req.file.filename}`,
      imageAlt: imageAlt || title,
      date: new Date(date),
      time,
      endTime,
      location,
      venue: venue ? JSON.parse(venue) : undefined,
      type,
      category: category || 'technical',
      maxAttendees: parseInt(maxAttendees),
      registrationLink,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
      status: status || 'upcoming',
      featured: featured === 'true',
      tags: tags ? JSON.parse(tags) : [],
      organizers: organizers ? JSON.parse(organizers) : [],
      speakers: speakers ? JSON.parse(speakers) : [],
      requirements: requirements ? JSON.parse(requirements) : [],
      agenda: agenda ? JSON.parse(agenda) : [],
      price: price ? parseFloat(price) : 0,
      currency: currency || 'INR',
      author: req.user.id
    });

    await event.save();
    await event.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    // Delete uploaded file if event creation fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating event'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Admin only)
router.put('/:id', adminAuth, validateObjectId, upload.single('image'), handleUploadError, validateEvent, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const {
      title,
      description,
      content,
      date,
      time,
      endTime,
      location,
      venue,
      type,
      category,
      maxAttendees,
      currentAttendees,
      registrationLink,
      registrationDeadline,
      status,
      featured,
      tags,
      organizers,
      speakers,
      requirements,
      agenda,
      price,
      currency,
      imageAlt
    } = req.body;

    // Update fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.content = content || event.content;
    event.date = date ? new Date(date) : event.date;
    event.time = time || event.time;
    event.endTime = endTime || event.endTime;
    event.location = location || event.location;
    event.venue = venue ? JSON.parse(venue) : event.venue;
    event.type = type || event.type;
    event.category = category || event.category;
    event.maxAttendees = maxAttendees ? parseInt(maxAttendees) : event.maxAttendees;
    event.currentAttendees = currentAttendees !== undefined ? parseInt(currentAttendees) : event.currentAttendees;
    event.registrationLink = registrationLink || event.registrationLink;
    event.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : event.registrationDeadline;
    event.status = status || event.status;
    event.featured = featured !== undefined ? featured === 'true' : event.featured;
    event.tags = tags ? JSON.parse(tags) : event.tags;
    event.organizers = organizers ? JSON.parse(organizers) : event.organizers;
    event.speakers = speakers ? JSON.parse(speakers) : event.speakers;
    event.requirements = requirements ? JSON.parse(requirements) : event.requirements;
    event.agenda = agenda ? JSON.parse(agenda) : event.agenda;
    event.price = price !== undefined ? parseFloat(price) : event.price;
    event.currency = currency || event.currency;
    event.imageAlt = imageAlt || event.imageAlt;

    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image
      if (event.image && event.image.startsWith('/uploads/')) {
        deleteFile(event.image.substring(1)); // Remove leading slash
      }
      event.image = `/uploads/events/${req.file.filename}`;
    }

    await event.save();
    await event.populate('author', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', adminAuth, validateObjectId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete associated image
    if (event.image && event.image.startsWith('/uploads/')) {
      deleteFile(event.image.substring(1)); // Remove leading slash
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
});

// @route   PUT /api/events/:id/register
// @desc    Register for event (increment attendees)
// @access  Public
router.put('/:id/register', validateObjectId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is open
    if (event.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not available for this event'
      });
    }

    // Check if event is full
    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check registration deadline
    const now = new Date();
    const deadline = event.registrationDeadline || event.date;
    if (now > deadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    event.currentAttendees += 1;
    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for event',
      currentAttendees: event.currentAttendees,
      spotsLeft: event.maxAttendees - event.currentAttendees
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering for event'
    });
  }
});

module.exports = router;