interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
}

interface ServiceResult {
  success: boolean;
  message: string;
}

const todoForm = document.getElementById('todo-form') as HTMLFormElement;
const todoInput = document.getElementById('todo-input') as HTMLInputElement;
const todoListElement = document.getElementById(
  'todo-list'
) as HTMLUListElement;
const feedbackElement = document.getElementById(
  'feedback'
) as HTMLParagraphElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const searchToggle = document.getElementById(
  'search-toggle'
) as HTMLButtonElement;
const searchClose = document.getElementById(
  'search-close'
) as HTMLButtonElement;
const searchPanel = document.getElementById('search-panel') as HTMLDivElement;
const taskBar = document.getElementById('task-bar') as HTMLDivElement;

let todos: Todo[] = [];
let searchQuery = '';

function openSearch(): void {
  taskBar.classList.add('hidden');
  taskBar.hidden = true;
  searchToggle.classList.add('hidden');
  searchToggle.hidden = true;
  searchClose.classList.remove('hidden');
  searchClose.hidden = false;
  searchPanel.classList.remove('hidden');
  searchPanel.hidden = false;
  searchInput.focus();
}

function closeSearch(): void {
  searchQuery = '';
  searchInput.value = '';
  searchPanel.classList.add('hidden');
  searchPanel.hidden = true;
  searchClose.classList.add('hidden');
  searchClose.hidden = true;
  searchToggle.classList.remove('hidden');
  searchToggle.hidden = false;
  taskBar.classList.remove('hidden');
  taskBar.hidden = false;
  renderTodos();
  todoInput.focus();
}

function getVisibleTodos(): Todo[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return todos;
  }

  return todos.filter((todo) => todo.text.toLowerCase().includes(query));
}

function setFeedback(
  message: string,
  type: 'success' | 'error' = 'success'
): void {
  feedbackElement.textContent = message;
  feedbackElement.className = `feedback ${type}`;
}

function clearFeedback(): void {
  feedbackElement.textContent = '';
  feedbackElement.className = 'feedback';
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();

  if (!response.ok) {
    const errorMessage =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : 'Request failed.';
    throw new Error(errorMessage);
  }

  return data as T;
}

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos');
  const data = await parseJsonResponse<Todo[]>(response);

  if (!Array.isArray(data)) {
    throw new Error('Invalid todo data format received from server.');
  }

  return data;
}

function renderTodos(): void {
  todoListElement.innerHTML = '';
  const visibleTodos = getVisibleTodos();

  if (todos.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'todo-item empty';
    emptyItem.textContent = 'No tasks yet. Add your first to-do.';
    todoListElement.appendChild(emptyItem);
    return;
  }

  if (visibleTodos.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'todo-item empty';
    emptyItem.textContent = 'No tasks match your search.';
    todoListElement.appendChild(emptyItem);
    return;
  }

  visibleTodos.forEach((todo, index) => {
    const listItem = document.createElement('li');
    listItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    const leftSection = document.createElement('div');
    leftSection.className = 'todo-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', async () => {
      try {
        const response = await fetch(`/api/todos/${todo.id}/toggle`, {
          method: 'PATCH',
        });
        const result = await parseJsonResponse<ServiceResult>(response);
        setFeedback(result.message, result.success ? 'success' : 'error');
        todos = await fetchTodos();
        renderTodos();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to toggle task.';
        setFeedback(message, 'error');
      }
    });

    const status = document.createElement('span');
    status.className = `todo-status ${todo.completed ? 'done' : 'active'}`;
    status.textContent = todo.completed ? 'DONE' : 'ACTIVE';

    const number = document.createElement('span');
    number.className = 'todo-number';
    number.textContent = `${index + 1}.`;

    const title = document.createElement('span');
    title.className = 'todo-title';
    title.textContent = todo.text;

    leftSection.appendChild(checkbox);
    leftSection.appendChild(status);
    leftSection.appendChild(number);
    leftSection.appendChild(title);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
      const confirmed = confirm(`Are you sure delete task ${todo.text} ?`);

      if (!confirmed) {
        return;
      }

      try {
        const response = await fetch(`/api/todos/${todo.id}`, {
          method: 'DELETE',
        });
        const result = await parseJsonResponse<ServiceResult>(response);
        setFeedback(result.message, result.success ? 'success' : 'error');
        todos = await fetchTodos();
        renderTodos();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete task.';
        setFeedback(message, 'error');
      }
    });

    listItem.appendChild(leftSection);
    listItem.appendChild(deleteButton);
    todoListElement.appendChild(listItem);
  });
}

async function loadInitialTodos(): Promise<void> {
  try {
    clearFeedback();
    todos = await fetchTodos();
    renderTodos();
    setFeedback('Initial tasks loaded successfully.', 'success');
  } catch (error) {
    todos = [];
    renderTodos();
    const message =
      error instanceof Error ? error.message : 'Failed to load tasks.';
    setFeedback(message, 'error');
  }
}

searchToggle.addEventListener('click', openSearch);
searchClose.addEventListener('click', closeSearch);

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  renderTodos();
});

todoForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: todoInput.value }),
    });

    const result = await parseJsonResponse<ServiceResult>(response);
    setFeedback(result.message, result.success ? 'success' : 'error');

    if (result.success) {
      todos = await fetchTodos();
      renderTodos();
      todoInput.value = '';
      todoInput.focus();
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to add task.';
    setFeedback(message, 'error');
  }
});

loadInitialTodos();

export {};
