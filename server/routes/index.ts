import { Router } from 'express';
import authRoutes from './auth.js';
import todoRoutes from './todos.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/todos', todoRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
