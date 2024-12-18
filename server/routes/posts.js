const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log('Posts Route:', {
        path: req.path,
        method: req.method
    });
    next();
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', 'username');
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// Get posts by username
router.get('/user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'username');
        res.json(posts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Error fetching user posts' });
    }
});

// Create post
router.post('/', auth, async (req, res) => {
    try {
        const post = new Post({
            content: req.body.content,
            user: req.userId
        });
        await post.save();
        
        const populatedPost = await Post.findById(post._id)
            .populate('user', 'username');
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});

// Update post
router.put('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        post.content = req.body.content;
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('user', 'username');
        res.json(populatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post' });
    }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Post.deleteOne({ _id: post._id });
        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// Like a post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already liked
        if (post.likes.includes(req.userId)) {
            return res.status(400).json({ message: 'Post already liked' });
        }

        post.likes.push(req.userId);
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('user', 'username')
            .populate('likes', 'username');

        res.json(updatedPost);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Error liking post' });
    }
});

// Unlike a post
router.delete('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove like
        const likeIndex = post.likes.indexOf(req.userId);
        if (likeIndex === -1) {
            return res.status(400).json({ message: 'Post not liked yet' });
        }

        post.likes.splice(likeIndex, 1);
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('user', 'username')
            .populate('likes', 'username');

        res.json(updatedPost);
    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(500).json({ message: 'Error unliking post' });
    }
});

module.exports = router;