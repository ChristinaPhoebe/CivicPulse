import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 120,
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Pothole', 'Streetlight', 'Garbage', 'Graffiti', 'Other'],
  },
  status: {
    type: String,
    enum: ['Reported', 'In Progress', 'Resolved'],
    default: 'Reported',
  },
  location: {
    type: String,
    default: '',
  },
  lat: {
    type: Number,
    default: 0,
  },
  lng: {
    type: Number,
    default: 0,
  },
  votes: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model('Issue', issueSchema);
