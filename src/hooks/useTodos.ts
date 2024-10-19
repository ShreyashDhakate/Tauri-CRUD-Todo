// src/hooks/useTodos.ts
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Todo {
  id: number;
  title: string;
  isCompleted: boolean;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editedTodos, setEditedTodos] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const result: Todo[] = await invoke("get_todos");
      console.log("Fetched Todos:", result);
      setTodos(result);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (title: string) => {
    if (!title.trim()) {
      alert("Please enter a valid task!");
      return;
    }
    try {
      await invoke("insert_todo", { title: title.trim(), isCompleted: false });
      fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleTodo = (id: number, isCompleted: boolean) => {
    setEditedTodos((prev) => new Map(prev).set(id, !isCompleted));
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
      )
    );
  };

  const updateTodo = async (id: number) => {
    try {
      const todo = todos.find((todo) => todo.id === id);
      if (!todo) return;

      const isCompleted = editedTodos.get(id) ?? todo.isCompleted;

      await invoke("update_todo", {
        id,
        title: todo.title,
        isCompleted,
      });

      alert("Todo updated successfully!");
      setEditedTodos((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      alert("Failed to update todo.");
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await invoke("delete_todo", { id });
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return {
    todos,
    isLoading,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    setTodos,
    handleInputChange: (id: number, value: string) =>
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, title: value } : todo
        )
      ),
  };
}
