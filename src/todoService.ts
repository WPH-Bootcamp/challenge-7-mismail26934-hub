import { Todo, TodoList, TodoServiceResult } from './types';
import { formatDateTime, isValidString } from './utils';
import { readTodos, writeTodos } from './storage';
import { randomUUID } from 'node:crypto';

function generateId(): string {
  return randomUUID();
}

function findTodoIndex(todos: TodoList, id: string): number {
  return todos.findIndex((todo) => todo.id === id);
}

export function getTodos(): TodoList {
  return readTodos();
}

export function addTodo(text: string): TodoServiceResult {
  if (!isValidString(text)) {
    return {
      success: false,
      message: 'Task title cannot be empty.',
    };
  }

  const cleanedText = text.trim();
  const todos = readTodos();
  const duplicateIndex = todos.findIndex(
    (item) => item.text.toLowerCase() === cleanedText.toLowerCase()
  );

  if (duplicateIndex !== -1) {
    return {
      success: false,
      message: 'Duplicate Task',
    };
  }

  const newTodo: Todo = {
    id: generateId(),
    text: cleanedText,
    completed: false,
    createdAt: formatDateTime(),
  };

  todos.push(newTodo);
  writeTodos(todos);

  return {
    success: true,
    message: 'Task added.',
  };
}

export function toggleTodo(id: string): TodoServiceResult {
  const todos = readTodos();
  const index = findTodoIndex(todos, id);

  if (index === -1) {
    return {
      success: false,
      message: 'Task not found.',
    };
  }

  todos[index] = {
    ...todos[index],
    completed: !todos[index].completed,
  };
  writeTodos(todos);

  return {
    success: true,
    message: todos[index].completed
      ? 'Task marked as done.'
      : 'Task marked as active.',
  };
}

export function deleteTodo(id: string): TodoServiceResult {
  const todos = readTodos();
  const index = findTodoIndex(todos, id);

  if (index === -1) {
    return {
      success: false,
      message: 'Task not found.',
    };
  }

  todos.splice(index, 1);
  writeTodos(todos);

  return {
    success: true,
    message: 'Task deleted.',
  };
}
