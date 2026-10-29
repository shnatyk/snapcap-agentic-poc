export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

export function addTodo(todos: Todo[], title: string): Todo[] {
  const trimmed = title.trim();
  if (!trimmed) return todos;
  return [...todos, { id: crypto.randomUUID(), title: trimmed, done: false }];
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
}

export function removeTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}
