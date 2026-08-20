const express = require('express');
const router = express.Router();
const db = require('../db');

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

// GET /api/tasks - View all tasks (with optional status filtering)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let queryText = 'SELECT * FROM tasks ORDER BY created_at DESC';
    let queryParams = [];

    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      queryText = 'SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC';
      queryParams = [status.toUpperCase()];
    }

    const { rows } = await db.query(queryText, queryParams);
    console.log(`[TASK_READ] Fetched ${rows.length} task(s) from database (Filter: ${status ? status.toUpperCase() : 'ALL'})`);
    return res.json(rows);
  } catch (err) {
    console.error('[TASK_ERROR] Error fetching tasks:', err);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// GET /api/tasks/:id - Display task details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      console.warn(`[TASK_WARN] Task ID ${id} not found`);
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log(`[TASK_READ] Fetched task details for ID ${id}: "${rows[0].title}"`);
    return res.json(rows[0]);
  } catch (err) {
    console.error(`[TASK_ERROR] Error fetching task ${req.params.id}:`, err);
    return res.status(500).json({ error: 'Failed to retrieve task' });
  }
});

// POST /api/tasks - Create a task
router.post('/', async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      console.warn('[TASK_WARN] Task creation failed: Title is required');
      return res.status(400).json({ error: 'Title is required' });
    }

    const taskStatus = status && VALID_STATUSES.includes(status.toUpperCase()) 
      ? status.toUpperCase() 
      : 'TODO';

    const { rows } = await db.query(
      'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), description || '', taskStatus]
    );

    const createdTask = rows[0];
    console.log(`[TASK_CREATE] Successfully created Task ID ${createdTask.id}: "${createdTask.title}" [Status: ${createdTask.status}]`);
    return res.status(201).json(createdTask);
  } catch (err) {
    console.error('[TASK_ERROR] Error creating task:', err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update a task / Change task status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Check if task exists
    const existing = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      console.warn(`[TASK_WARN] Update failed: Task ID ${id} not found`);
      return res.status(404).json({ error: 'Task not found' });
    }

    const currentTask = existing.rows[0];
    const newTitle = title !== undefined ? title.trim() : currentTask.title;
    const newDesc = description !== undefined ? description : currentTask.description;
    let newStatus = currentTask.status;

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status.toUpperCase())) {
        console.warn(`[TASK_WARN] Update failed: Invalid status "${status}"`);
        return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      newStatus = status.toUpperCase();
    }

    const { rows } = await db.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [newTitle, newDesc, newStatus, id]
    );

    const updatedTask = rows[0];
    console.log(`[TASK_UPDATE] Successfully updated Task ID ${updatedTask.id}: "${updatedTask.title}" [Status: ${updatedTask.status}]`);
    return res.json(updatedTask);
  } catch (err) {
    console.error(`[TASK_ERROR] Error updating task ${req.params.id}:`, err);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);

    if (rowCount === 0) {
      console.warn(`[TASK_WARN] Delete failed: Task ID ${id} not found`);
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log(`[TASK_DELETE] Successfully deleted Task ID ${id} from database`);
    return res.json({ message: 'Task deleted successfully', id: parseInt(id, 10) });
  } catch (err) {
    console.error(`[TASK_ERROR] Error deleting task ${req.params.id}:`, err);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
