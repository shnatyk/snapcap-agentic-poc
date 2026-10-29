import { describe, expect, it } from "vitest";
import { addTodo, clearCompleted, removeTodo, sortByStatus, toggleTodo } from "./todos";

describe("todos", () => {
  it("adds a todo with a trimmed title", () => {
    const todos = addTodo([], "  Buy milk  ");

    expect(todos).toHaveLength(1);
    expect(todos[0]).toMatchObject({ title: "Buy milk", done: false });
  });

  it("ignores a blank title", () => {
    expect(addTodo([], "   ")).toEqual([]);
  });

  it("toggles a todo between done and not done", () => {
    const [todo] = addTodo([], "Buy milk");

    const done = toggleTodo([todo], todo.id);
    expect(done[0].done).toBe(true);
    expect(toggleTodo(done, todo.id)[0].done).toBe(false);
  });

  it("removes a todo", () => {
    const todos = addTodo(addTodo([], "Buy milk"), "Walk the dog");

    expect(removeTodo(todos, todos[0].id).map((todo) => todo.title)).toEqual(["Walk the dog"]);
  });

  it("clears completed todos and keeps the others", () => {
    const todos = [
      { id: "1", title: "a", done: true },
      { id: "2", title: "b", done: false },
    ];

    expect(clearCompleted(todos).map((todo) => todo.id)).toEqual(["2"]);
  });

  it("sorts done first, stable within each group, without mutating", () => {
    const todos = [
      { id: "1", title: "a", done: false },
      { id: "2", title: "b", done: true },
      { id: "3", title: "c", done: false },
      { id: "4", title: "d", done: true },
    ];

    expect(sortByStatus(todos).map((todo) => todo.id)).toEqual(["2", "4", "1", "3"]);
    expect(todos.map((todo) => todo.id)).toEqual(["1", "2", "3", "4"]);
  });
});
