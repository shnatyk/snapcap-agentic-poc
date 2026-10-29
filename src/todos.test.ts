import { describe, expect, it } from "vitest";
import { addTodo, removeTodo, toggleTodo } from "./todos";

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
});
