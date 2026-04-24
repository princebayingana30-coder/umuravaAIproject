import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import applicantRoutes from './routes/applicants';
import screeningRoutes from './routes/screening';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  })
);
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
// Public mode (no login required)
app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/screening', screeningRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'TalentIQ API is running at root' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TalentIQ API is running' });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talentiq';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
