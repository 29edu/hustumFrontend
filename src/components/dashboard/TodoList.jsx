import TodoItem from "./TodoItem";

const TodoList = ({
  todos,
  loading,
  filter,
  onToggle,
  onDelete,
  onUpdateDeadline,
}) => {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-800 mb-1">
            No tasks found
          </p>
          <p className="text-sm text-gray-600">
            {filter === "all"
              ? "Add your first task to get started!"
              : `No ${filter} tasks yet`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-transparent hide-scrollbar">
      <ul className="divide-y divide-gray-200/30">
        {todos.map((todo) => (
          <TodoItem
            key={todo._id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdateDeadline={onUpdateDeadline}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
