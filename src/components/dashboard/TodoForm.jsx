import { useState } from "react";

const TodoForm = ({ onAddTodo }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    await onAddTodo(inputValue);
    setInputValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-3 text-base border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-500 bg-white/30 backdrop-blur-sm"
        />
        <button
          type="submit"
          className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          Add Task
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
