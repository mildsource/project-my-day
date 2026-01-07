import { Router, Response } from 'express';
import { query, queryOne } from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all todos for user
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const todos = query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    res.json({ todos });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to get todos' });
  }
});

// Create todo
router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = queryOne(
      'INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?) RETURNING *',
      [req.userId, title, description || '']
    );

    res.json({ todo });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
router.put('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    // Verify ownership
    const existing = queryOne(
      'SELECT id FROM todos WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    query(`
      UPDATE todos 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          completed = COALESCE(?, completed),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [title, description, completed !== undefined ? (completed ? 1 : 0) : null, id, req.userId]);

    const todo = queryOne('SELECT * FROM todos WHERE id = ?', [id]);

    res.json({ todo });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
router.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = queryOne(
      'SELECT id FROM todos WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, req.userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
