import { Todo, TodoList } from './types';

export function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.text === 'string' &&
    typeof candidate.completed === 'boolean' &&
    (candidate.createdAt === undefined ||
      typeof candidate.createdAt === 'string')
  );
}

export function isTodoArray(value: unknown): value is TodoList {
  return Array.isArray(value) && value.every(isTodo);
}

export function formatDateTime(date: Date = new Date()): string {
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function isValidString(input: unknown, minLength = 1): input is string {
  return typeof input === 'string' && input.trim().length >= minLength;
}
