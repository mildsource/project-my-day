import { Router, Response } from 'express';
import { query, queryOne } from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all todos for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const todos = await query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.json({ todos });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to get todos' });
  }
});

// Create todo
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = await queryOne(
      'INSERT INTO todos (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, title, description || '']
    );

    res.json({ todo });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    // Verify ownership
    const existing = await queryOne(
      'SELECT id FROM todos WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todo = await queryOne(`
      UPDATE todos 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          completed = COALESCE($3, completed),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `, [title, description, completed, id, req.userId]);

    res.json({ todo });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await queryOne(
      'SELECT id FROM todos WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, req.userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
