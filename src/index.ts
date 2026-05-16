import express, { Request, Response } from 'express';
import path from 'path';
import { Todo, TodoList } from './types';
import { initializeStorage } from './storage';
import {
  addTodo,
  deleteTodo,
  getTodos,
  seedTodos,
  toggleTodo,
} from './todoService';
import { isTodoArray } from './utils';

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const CLIENT_DIR = path.join(__dirname, 'client');

app.use(express.json());
app.use(express.static(PUBLIC_DIR));
app.use('/client', express.static(CLIENT_DIR));

function sendServiceResult(
  res: Response,
  result: { success: boolean; message: string }
): void {
  const statusCode = result.success ? 200 : 400;
  res.status(statusCode).json(result);
}

app.get('/api/todos', (_req: Request, res: Response) => {
  try {
    res.json(getTodos());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load todos';
    res.status(500).json({ success: false, message });
  }
});

app.post('/api/todos', (req: Request, res: Response) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    sendServiceResult(res, addTodo(text));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to add todo';
    res.status(500).json({ success: false, message });
  }
});

app.patch('/api/todos/:id/toggle', (req: Request, res: Response) => {
  try {
    sendServiceResult(res, toggleTodo(req.params.id));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to toggle todo';
    res.status(500).json({ success: false, message });
  }
});

app.delete('/api/todos/:id', (req: Request, res: Response) => {
  try {
    sendServiceResult(res, deleteTodo(req.params.id));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete todo';
    res.status(500).json({ success: false, message });
  }
});

app.put('/api/todos/seed', (req: Request, res: Response) => {
  try {
    const todos: unknown = req.body?.todos;

    if (!isTodoArray(todos)) {
      res.status(400).json({
        success: false,
        message: 'Invalid todo data format.',
      });
      return;
    }

    sendServiceResult(res, seedTodos(todos as TodoList));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to seed todos';
    res.status(500).json({ success: false, message });
  }
});

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

function startServer(): void {
  try {
    initializeStorage();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to initialize storage';
    console.error(`Error: ${message}`);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`To-Do App running at http://localhost:${PORT}`);
  });
}

startServer();
