const express = require('express');
const Post = require('../models/Post');
const { auth, adminAuth } = require('../middleware/auth');
const { upload, handleUploadError, deleteFile } = require('../middleware/upload');
const { validatePost, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts with filtering and pagination
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
    } else {
      // Only show published posts for public access
      filter.status = 'published';
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
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Get posts with pagination
    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only show published posts to public, unless user is admin
    if (post.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private (Admin only)
router.post('/', adminAuth, upload.single('image'), handleUploadError, validatePost, async (req, res) => {
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
      category,
      tags,
      status,
      featured,
      registrationLink,
      imageAlt
    } = req.body;

    const post = new Post({
      title,
      description,
      content,
      image: `/uploads/posts/${req.file.filename}`,
      imageAlt: imageAlt || title,
      category,
      tags: tags ? JSON.parse(tags) : [],
      status: status || 'draft',
      featured: featured === 'true',
      registrationLink,
      author: req.user.id
    });

    await post.save();
    await post.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    // Delete uploaded file if post creation fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (Admin only)
router.put('/:id', adminAuth, validateObjectId, upload.single('image'), handleUploadError, validatePost, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const {
      title,
      description,
      content,
      category,
      tags,
      status,
      featured,
      registrationLink,
      imageAlt
    } = req.body;

    // Update fields
    post.title = title || post.title;
    post.description = description || post.description;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags ? JSON.parse(tags) : post.tags;
    post.status = status || post.status;
    post.featured = featured !== undefined ? featured === 'true' : post.featured;
    post.registrationLink = registrationLink || post.registrationLink;
    post.imageAlt = imageAlt || post.imageAlt;

    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image
      if (post.image && post.image.startsWith('/uploads/')) {
        deleteFile(post.image.substring(1)); // Remove leading slash
      }
      post.image = `/uploads/posts/${req.file.filename}`;
    }

    await post.save();
    await post.populate('author', 'name email');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (Admin only)
router.delete('/:id', adminAuth, validateObjectId, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Delete associated image
    if (post.image && post.image.startsWith('/uploads/')) {
      deleteFile(post.image.substring(1)); // Remove leading slash
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like/unlike post
// @access  Public
router.put('/:id/like', validateObjectId, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.likes += 1;
    await post.save();

    res.json({
      success: true,
      message: 'Post liked successfully',
      likes: post.likes
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking post'
    });
  }
});

module.exports = router;