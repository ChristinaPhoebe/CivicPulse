import express from 'express';
import Issue from '../models/Issue.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, category, location, lat, lng } = req.body;
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }
    const issue = await Issue.create({
      title,
      description: description || '',
      category,
      location: location || '',
      lat: lat || 0,
      lng: lng || 0,
    });
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id/vote', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $inc: { votes: 1 } },
      { new: true },
    );
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Reported', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
