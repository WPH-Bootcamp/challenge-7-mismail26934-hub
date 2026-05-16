export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
}

export type TodoList = Todo[];

export interface TodoServiceResult {
  success: boolean;
  message: string;
}
