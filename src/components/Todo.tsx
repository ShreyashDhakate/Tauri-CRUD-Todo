import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "../App.css";
interface Todo {
  id: number;
  title: string;
  isCompleted: boolean;
}

function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

 
  useEffect(() => {
    initializeDatabase();
    fetchTodos();
  }, []);

  async function initializeDatabase() {
    try {
      const result = await invoke("initialize_db");
      console.log(result);
    } catch (error) {
      console.error("Error initializing the database:", error);
    }
  }

  async function fetchTodos() {
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
  }

  async function addTodo() {
    if (!newTodo.trim()) {
      alert("Please enter a valid task!");
      return;
    }
    try {
      await invoke("insert_todo", { title: newTodo.trim(), isCompleted: false });
      setNewTodo("");
      fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  }

  async function updateTodo(id: number, title: string, isCompleted: boolean) {
    try {
      await invoke("update_todo", { id, title,isCompleted });
      alert("Todo updated successfully!");
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
      alert("Failed to update todo.");
    }
  }

  async function deleteTodo(id: number) {
    try {
      await invoke("delete_todo", { id });
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  const handleInputChange = (id: number, field: keyof Todo, value: any) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, [field]: value } : todo
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center">
  {/* App Title */}
  <h1 className="text-3xl font-semibold text-center mb-10 text-gray-100 font-poppins tracking-wide">
    Tauri v2 Todo App
  </h1>

  {/* Todo List Container */}
  <div className="max-w-xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
    {/* Input and Add Button */}
    <div className="flex gap-2 mb-6">
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Enter new task"
        className="flex-1 border border-gray-700 bg-gray-700 text-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
      />
      <button
        onClick={addTodo}
        className="bg-blue-600 text-white px-4 py-2 text-xs rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
      >
        Add
      </button>
    </div>

    {/* Loading Spinner */}
    {isLoading ? (
      <div className="flex justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    ) : (
      <ul className="space-y-4">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md transition duration-200 hover:shadow-lg"
          >
            {/* Todo Content */}
            <div className="flex-1 mr-4">
              {/* Editable Title */}
              <h1 className="text-white">{todo.isCompleted}</h1>
              <input
                type="text"
                value={todo.title}
                onChange={(e) =>
                  handleInputChange(todo.id, "title", e.target.value)
                }
                className="w-full border-b border-gray-600 bg-transparent text-gray-200 text-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              {/* Completion Status */}
              <div className="mt-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={(e) =>
                      handleInputChange(
                        todo.id,
                        "isCompleted",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-green-500 focus:ring-green-400 transition duration-200"
                  />
                  <span
                    className={`text-xs ${
                      todo.isCompleted
                        ? "text-gray-400 line-through"
                        : "text-gray-200"
                    }`}
                  >
                    {todo.isCompleted ? "Completed" : "Incomplete"}
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateTodo(todo.id, todo.title, todo.isCompleted)
                }
                className="bg-green-600 text-white px-3 py-2 text-xs rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200"
              >
                Update
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="bg-red-600 text-white px-3 py-2 text-xs rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

  );
}

export default Todo;
