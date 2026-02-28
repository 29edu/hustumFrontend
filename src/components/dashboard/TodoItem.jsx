import { useState, useEffect } from "react";
import {
  calculateTimeRemaining,
  formatTimeRemaining,
} from "../../utils/timeHelpers";

const TodoItem = ({ todo, onToggle, onDelete, onUpdateDeadline }) => {
  const status = todo.status || "pending";
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Calculate time remaining in real-time for all tasks with deadlines
  useEffect(() => {
    if (todo.deadline) {
      const updateTimeRemaining = () => {
        const remaining = calculateTimeRemaining(todo.deadline);
        setTimeRemaining(remaining);
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 1000); // Update every second for real-time

      return () => clearInterval(interval);
    } else {
      setTimeRemaining(null);
    }
  }, [todo.deadline]);

  const handleDeadlineSubmit = async () => {
    if (deadlineInput && onUpdateDeadline) {
      await onUpdateDeadline(todo._id, deadlineInput);
      setIsEditingDeadline(false);
      setDeadlineInput("");
    }
  };

  const handleDeadlineCancel = () => {
    setIsEditingDeadline(false);
    setDeadlineInput("");
  };

  const formatDeadlineDisplay = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return {
          circle: "bg-green-500 border-transparent shadow-sm",
          text: "text-gray-800",
          showCheck: true,
          badge: {
            bg: "bg-green-100",
            text: "text-green-700",
            label: "Done",
          },
        };
      case "started":
        return {
          circle: "bg-yellow-400 border-transparent shadow-sm",
          text: "text-gray-800",
          showCheck: false,
          badge: {
            bg: "bg-yellow-100",
            text: "text-yellow-700",
            label: "In Progress",
          },
        };
      default:
        return {
          circle: "border-gray-300 hover:border-green-500 bg-white",
          text: "text-gray-800",
          showCheck: false,
          badge: {
            bg: "bg-red-100",
            text: "text-red-700",
            label: "Not started",
          },
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <li className="group hover:bg-green-50/50 transition-all">
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Status Button */}
        <button
          onClick={() => onToggle(todo._id, status)}
          className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-full"
          aria-label="Toggle todo status"
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${styles.circle}`}
          >
            {styles.showCheck && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </button>

        {/* Todo Content */}
        <div className="flex-1 flex flex-col gap-1">
          <span className={`text-base ${styles.text}`}>{todo.title}</span>

          {/* Deadline Section */}
          {!isEditingDeadline && !todo.deadline && (
            <button
              onClick={() => setIsEditingDeadline(true)}
              className="text-xs text-blue-600 hover:text-blue-700 text-left w-fit"
            >
              + Add deadline
            </button>
          )}

          {isEditingDeadline && (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="datetime-local"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleDeadlineSubmit}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleDeadlineCancel}
                className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}

          {todo.deadline && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatDeadlineDisplay(todo.deadline)}
              </span>

              {timeRemaining && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    timeRemaining.isOverdue
                      ? "bg-red-100 text-red-700"
                      : timeRemaining.totalMinutes < 60
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {formatTimeRemaining(timeRemaining)}
                </span>
              )}

              <button
                onClick={() => setIsEditingDeadline(true)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <span
          className={`text-xs ${styles.badge.bg} ${styles.badge.text} px-3 py-1 rounded-full font-medium`}
        >
          {styles.badge.label}
        </span>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(todo._id)}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Delete todo"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </li>
  );
};

export default TodoItem;
