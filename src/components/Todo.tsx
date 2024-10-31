import { useState, useEffect } from "react";
import { useInitializeDatabase } from "../hooks/useInitializeDatabase";
import { useTodos } from "../hooks/useTodos";
import "../App.css";

function Todo() {
  const [newTodo, setNewTodo] = useState<string>("");
  const { initializeDatabase } = useInitializeDatabase();
  const { todos, isLoading, addTodo, toggleTodo, updateTodo, deleteTodo } = useTodos();

  const [editedTitles, setEditedTitles] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  const handleInputChange = (id: string, value: string) => {
    setEditedTitles((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-semibold text-center mb-10 text-gray-100 font-poppins tracking-wide">
        Tauri v2 Todo App
      </h1>

      <div className="max-w-xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter new task"
            className="flex-1 border border-gray-700 bg-gray-700 text-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <button
            onClick={() => {
              if (newTodo.trim()) {
                addTodo(newTodo);
                setNewTodo("");
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 text-xs rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          >
            Add
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {todos.map((todo) => (
              <li
                key={todo._id.$oid.toString()}
                className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md transition duration-200 hover:shadow-lg"
              >
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={editedTitles[todo._id.$oid.toString()] || todo.title}
                    onChange={(e) =>
                      handleInputChange(todo._id.$oid.toString(), e.target.value)
                    }
                    className="w-full border-b border-gray-600 bg-transparent text-gray-200 text-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={todo.is_completed}
                        onChange={() => toggleTodo(todo._id.$oid.toString(), todo.is_completed)}
                        className="h-4 w-4 text-green-500 focus:ring-green-400 transition duration-200"
                      />
                      <span
                        className={`text-xs ${
                          todo.is_completed
                            ? "text-gray-400 line-through"
                            : "text-gray-200"
                        }`}
                      >
                        {todo.is_completed ? "Completed" : "Incomplete"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateTodo(
                        todo._id.$oid.toString(),
                        editedTitles[todo._id.$oid.toString()] || todo.title,
                        todo.is_completed
                      )
                    }
                    className="bg-green-600 text-white px-3 py-2 text-xs rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200"
                  >
                    Update
                  </button>

                  <button
                    onClick={() => deleteTodo(todo._id.$oid.toString())}
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
