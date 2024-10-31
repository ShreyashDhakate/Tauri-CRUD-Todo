import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Todo {
  _id: string;  // Use string to match MongoDB's ObjectId format
  title: string;
  is_completed: boolean;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const result: Todo[] = await invoke("get_todos");
      console.log("Fetched Todos:", result);
      console.log("Fetched Todos:", result);
      setTodos(result.map(todo => ({ ...todo, id: todo._id?.toString() || '' }))); // Ensure ID is string
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
      const encodedTitle = encodeURIComponent(title.trim());
      await invoke("insert_todo", { title: encodedTitle, isCompleted: false });
      fetchTodos(); // Refresh the list after adding
    } catch (error) {
      console.error("Error adding todo:", error);
      alert("Failed to add todo.");
    }
  };

  const toggleTodo = (id: string, isCompleted: boolean) => {
    // Create a new array with the updated todos
    const updatedTodos = todos.map((todo) =>
      todo._id.$oid === id ? { ...todo, is_completed: !isCompleted } : todo
    );
  
    // Update the todos state with the modified array
    setTodos(updatedTodos);
  
    // Optionally, add backend persistence here if needed.
  };
  
  

  const updateTodo = async (id: string, title: string, isCompleted: boolean) => {
    try {
      const encodedTitle = encodeURIComponent(title);
      await invoke("update_todo", { id, title: encodedTitle,  isCompleted });
      fetchTodos(); // Refresh the list after updating
    } catch (error) {
      console.error("Error updating todo:", error);
      alert("Failed to update todo.");
    }
  };
  

  const deleteTodo = async (id: string) => {
    try {
      await invoke("delete_todo", { id });
      fetchTodos(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete todo.");
    }
  };

  return {
    todos,
    isLoading,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
  };
}
