import express from 'express';
import path from 'path';
import cors from 'cors';
import { initializeDatabase } from './db/index.js';
import apiRoutes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database BEFORE starting server
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// API routes - MUST come before static files
app.use('/api', apiRoutes);

// ⚠️ CRITICAL: Use process.cwd() here - NEVER __dirname!
// process.cwd() = /app (correct)
// __dirname = /app/dist-server (wrong - frontend is in /app/dist)
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// SPA fallback - MUST be last
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Initialize database and start server
initializeDatabase();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
