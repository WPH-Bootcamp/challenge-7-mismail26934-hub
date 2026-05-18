import * as fs from 'fs';
import * as path from 'path';
import { TodoList } from './types';
import { isTodoArray } from './utils';

const DATA_DIR = path.join(process.cwd(), 'data');
const TODO_FILE = path.join(DATA_DIR, 'todos.json');

function ensureStorage(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(TODO_FILE)) {
    fs.writeFileSync(TODO_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function initializeStorage(): void {
  try {
    ensureStorage();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown storage error';
    throw new Error(`Failed to initialize storage: ${message}`);
  }
}

export function readTodos(): TodoList {
  try {
    ensureStorage();

    const rawData = fs.readFileSync(TODO_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(rawData);

    if (!isTodoArray(parsed)) {
      throw new Error('Invalid todo data format in storage file');
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        'Failed to read todos: storage file contains invalid JSON'
      );
    }

    const message =
      error instanceof Error ? error.message : 'Unknown read error';
    throw new Error(`Failed to read todos: ${message}`);
  }
}

export function writeTodos(todos: TodoList): void {
  try {
    ensureStorage();
    fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2), 'utf-8');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown write error';
    throw new Error(`Failed to save todos: ${message}`);
  }
}
