import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const TaskCalendar = ({ selectedDate, onDateChange, todos }) => {
  // Get dates that have tasks
  const getTaskDates = () => {
    const dates = new Set();
    todos.forEach((todo) => {
      const date = new Date(todo.createdAt);
      dates.add(date.toDateString());
    });
    return dates;
  };

  const taskDates = getTaskDates();

  // Add custom styling for dates with tasks
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const hasTask = taskDates.has(date.toDateString());
      if (hasTask) {
        return (
          <div className="flex justify-center">
            <div className="w-1 h-1 bg-green-400 rounded-full mt-1"></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-transparent rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Task Calendar
      </h3>
      <Calendar
        onChange={onDateChange}
        value={selectedDate}
        tileContent={tileContent}
        className="border-none w-full"
      />
      <style jsx global>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background: transparent;
        }
        .react-calendar__tile {
          padding: 0.75em 0.5em;
          position: relative;
          border-radius: 50%;
          background: transparent;
          font-weight: 700;
        }
        .react-calendar__tile--active {
          background: rgba(75, 85, 99, 0.7) !important;
          color: white;
          border-radius: 50% !important;
          width: 2rem !important;
          height: 2rem !important;
          margin: auto;
          font-weight: 700;
        }
        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background: rgba(185, 254, 187, 0.7) !important;
        }
        .react-calendar__tile--now {
          background: rgba(188, 233, 84, 0.7) !important;
          color: white;
          border-radius: 50% !important;
          width: 2rem !important;
          height: 2rem !important;
          margin: auto;
          font-weight: 700;
        }
        .react-calendar__tile--now:enabled:hover,
        .react-calendar__tile--now:enabled:focus {
          background: rgba(188, 233, 84, 0.8) !important;
        }
        .react-calendar__tile--active.react-calendar__tile--now {
          background: rgba(75, 85, 99, 0.7) !important;
          border: 2px solid #eab308 !important;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          margin: auto;
        }
        .react-calendar__navigation button {
          font-size: 1rem;
          font-weight: 600;
          background: transparent;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: rgba(255, 255, 255, 0.5);
        }
        .react-calendar__month-view__days__day--weekend {
          color: #b91c1c;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default TaskCalendar;
