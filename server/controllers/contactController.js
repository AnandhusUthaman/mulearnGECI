const Contact = require('../models/Contact');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHandler');
const emailService = require('../utils/emailService');
const logger = require('../utils/logger');

const contactController = {
  // Submit contact form
  submitContact: async (req, res) => {
    try {
      const { name, email, phone, subject, message, category } = req.body;

      const contact = new Contact({
        name,
        email,
        phone,
        subject,
        message,
        category: category || 'general',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await contact.save();

      // Send email notification to admin (if configured)
      try {
        await emailService.sendContactFormNotification(contact);
      } catch (emailError) {
        logger.warn('Failed to send contact notification email', { error: emailError.message });
      }

      logger.info('Contact form submitted', { contactId: contact._id, email: contact.email });

      return sendCreated(res, 'Contact form submitted successfully. We will get back to you soon!', {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        submittedAt: contact.createdAt
      });
    } catch (error) {
      logger.error('Contact form error', { error: error.message });
      return sendError(res, 500, 'Server error while submitting contact form');
    }
  },

  // Get all contact submissions (Admin only)
  getAllContacts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter = {};
      
      if (req.query.status) filter.status = req.query.status;
      if (req.query.category) filter.category = req.query.category;
      if (req.query.priority) filter.priority = req.query.priority;
      
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { subject: { $regex: req.query.search, $options: 'i' } },
          { message: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      // Get contacts with pagination
      const contacts = await Contact.find(filter)
        .populate('response.respondedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await Contact.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      // Get status counts
      const statusCounts = await Contact.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      return sendSuccess(res, 'Contacts retrieved successfully', contacts, {
        pagination: {
          currentPage: page,
          totalPages,
          totalContacts: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      });
    } catch (error) {
      logger.error('Get contacts error', { error: error.message });
      return sendError(res, 500, 'Server error while fetching contacts');
    }
  },

  // Get single contact submission
  getContactById: async (req, res) => {
    try {
      const contact = await Contact.findById(req.params.id)
        .populate('response.respondedBy', 'name email');
      
      if (!contact) {
        return sendError(res, 404, 'Contact submission not found');
      }

      // Mark as read if it's new
      if (contact.status === 'new') {
        contact.status = 'read';
        await contact.save();
      }

      return sendSuccess(res, 'Contact retrieved successfully', contact);
    } catch (error) {
      logger.error('Get contact error', { error: error.message });
      return sendError(res, 500, 'Server error while fetching contact');
    }
  },

  // Respond to contact submission
  respondToContact: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || message.trim().length === 0) {
        return sendError(res, 400, 'Response message is required');
      }

      const contact = await Contact.findById(req.params.id);
      
      if (!contact) {
        return sendError(res, 404, 'Contact submission not found');
      }

      contact.response = {
        message: message.trim(),
        respondedBy: req.user.id,
        respondedAt: new Date()
      };
      contact.status = 'replied';

      await contact.save();
      await contact.populate('response.respondedBy', 'name email');

      // Send response email to user (if configured)
      try {
        await emailService.sendContactResponse(contact, message);
      } catch (emailError) {
        logger.warn('Failed to send contact response email', { error: emailError.message });
      }

      logger.info('Contact response sent', { contactId: contact._id });

      return sendSuccess(res, 'Response sent successfully', contact);
    } catch (error) {
      logger.error('Respond to contact error', { error: error.message });
      return sendError(res, 500, 'Server error while responding to contact');
    }
  },

  // Update contact status
  updateContactStatus: async (req, res) => {
    try {
      const { status, priority } = req.body;

      const contact = await Contact.findById(req.params.id);
      
      if (!contact) {
        return sendError(res, 404, 'Contact submission not found');
      }

      if (status) {
        const validStatuses = ['new', 'read', 'replied', 'resolved', 'archived'];
        if (!validStatuses.includes(status)) {
          return sendError(res, 400, 'Invalid status');
        }
        contact.status = status;
      }

      if (priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
          return sendError(res, 400, 'Invalid priority');
        }
        contact.priority = priority;
      }

      await contact.save();

      logger.info('Contact status updated', { contactId: contact._id, status, priority });

      return sendSuccess(res, 'Contact updated successfully', contact);
    } catch (error) {
      logger.error('Update contact status error', { error: error.message });
      return sendError(res, 500, 'Server error while updating contact');
    }
  },

  // Delete contact submission
  deleteContact: async (req, res) => {
    try {
      const contact = await Contact.findById(req.params.id);
      
      if (!contact) {
        return sendError(res, 404, 'Contact submission not found');
      }

      await Contact.findByIdAndDelete(req.params.id);

      logger.info('Contact deleted', { contactId: req.params.id });

      return sendSuccess(res, 'Contact submission deleted successfully');
    } catch (error) {
      logger.error('Delete contact error', { error: error.message });
      return sendError(res, 500, 'Server error while deleting contact');
    }
  }
};

module.exports = contactController;