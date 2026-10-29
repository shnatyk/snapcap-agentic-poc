import "@fontsource/jost/300.css";
import "@fontsource/jost/400.css";
import "@fontsource/limelight/400.css";
import "./style.css";
import { addTodo, clearCompleted, removeTodo, sortByStatus, toggleTodo, type Todo } from "./todos";

const STORAGE_KEY = "todos";

const form = document.querySelector<HTMLFormElement>("#new-todo")!;
const input = document.querySelector<HTMLInputElement>("#new-todo-title")!;
const clear = document.querySelector<HTMLButtonElement>("#clear-completed")!;
const list = document.querySelector<HTMLUListElement>("#todo-list")!;

let todos: Todo[] = load();

function load(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function update(next: Todo[]) {
  todos = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

function render() {
  clear.hidden = !todos.some((todo) => todo.done);
  list.replaceChildren(
    ...sortByStatus(todos).map((todo) => {
      const item = document.createElement("li");
      item.className = todo.done ? "done" : "";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.done;
      checkbox.addEventListener("change", () => update(toggleTodo(todos, todo.id)));

      const title = document.createElement("span");
      title.textContent = todo.title;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", "Delete");
      remove.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      remove.addEventListener("click", () => update(removeTodo(todos, todo.id)));

      item.append(checkbox, title, remove);
      return item;
    }),
  );
}

clear.addEventListener("click", () => update(clearCompleted(todos)));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  update(addTodo(todos, input.value));
  input.value = "";
});

render();
