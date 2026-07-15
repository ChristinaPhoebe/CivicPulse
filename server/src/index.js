import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import issueRoutes from './routes/issues.js';
import Issue from './models/Issue.js';
import User from './models/User.js';

dotenv.config();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

const seedIssues = async () => {
  const count = await Issue.countDocuments();
  if (count > 0) return;

  await Issue.insertMany([
    {
      title: 'Large pothole on Maple Ave',
      description: 'Deep pothole near the intersection, damaging tires.',
      category: 'Pothole',
      status: 'In Progress',
      location: 'Maple Ave & 5th St',
      lat: 40.7580,
      lng: -73.9855,
      votes: 24,
    },
    {
      title: 'Streetlight out for two weeks',
      description: 'The light on the corner has been dark, making the crosswalk unsafe at night.',
      category: 'Streetlight',
      status: 'Reported',
      location: 'Oak Park, north entrance',
      lat: 40.7610,
      lng: -73.9780,
      votes: 12,
    },
    {
      title: 'Overflowing garbage bin',
      description: "Bins haven't been emptied; trash spilling onto sidewalk.",
      category: 'Garbage',
      status: 'Resolved',
      location: 'Riverside Path',
      lat: 40.7550,
      lng: -73.9900,
      votes: 7,
    },
  ]);
  console.log('Seeded default issues');
};

const seedAdmin = async () => {
  const existing = await User.findOne({ email: 'admin@civicpulse.com' });
  if (existing) return;

  await User.create({
    name: 'Admin',
    email: 'admin@civicpulse.com',
    password: 'admin123',
    role: 'admin',
  });
  console.log('Seeded admin user (admin@civicpulse.com / admin123)');
};

connectDB().then(async () => {
  try {
    await seedAdmin();
  } catch (err) {
    console.error('seedAdmin failed:', err);
  }
  try {
    await seedIssues();
  } catch (err) {
    console.error('seedIssues failed:', err);
  }
  console.log('About to call app.listen on port', PORT);
  app.listen(PORT, () => {
    console.log('Server running on port', PORT);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

export default app;
