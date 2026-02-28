import { useState, useMemo } from "react";

export const useDateFilter = (todos, selectedDate) => {
  const [filter, setFilter] = useState("all");

  const filteredTodos = useMemo(() => {
    // Filter by selected date first
    const dateFiltered = todos.filter((todo) => {
      const todoDate = new Date(todo.createdAt);
      const selected = new Date(selectedDate);
      return todoDate.toDateString() === selected.toDateString();
    });

    // Then apply status filter
    if (filter === "pending") {
      return dateFiltered.filter(
        (todo) => (todo.status || "pending") === "pending"
      );
    }
    if (filter === "started") {
      return dateFiltered.filter((todo) => todo.status === "started");
    }
    if (filter === "completed") {
      return dateFiltered.filter((todo) => todo.status === "completed");
    }
    return dateFiltered;
  }, [todos, selectedDate, filter]);

  const todosForDate = useMemo(() => {
    return todos.filter((todo) => {
      const todoDate = new Date(todo.createdAt);
      const selected = new Date(selectedDate);
      return todoDate.toDateString() === selected.toDateString();
    });
  }, [todos, selectedDate]);

  const counts = useMemo(() => {
    return {
      all: todosForDate.length,
      pending: todosForDate.filter(
        (todo) => (todo.status || "pending") === "pending"
      ).length,
      started: todosForDate.filter((todo) => todo.status === "started").length,
      completed: todosForDate.filter((todo) => todo.status === "completed")
        .length,
    };
  }, [todosForDate]);

  return {
    filter,
    setFilter,
    filteredTodos,
    counts,
  };
};
