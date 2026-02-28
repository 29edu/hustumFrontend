import { useState, useEffect } from "react";
import { todoApi } from "../api/todoApi";

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoApi.getAllTodos();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      alert("Failed to fetch todos. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title) => {
    try {
      const newTodo = await todoApi.createTodo(title);
      setTodos([newTodo, ...todos]);
      return newTodo;
    } catch (error) {
      console.error("Error adding todo:", error);
      alert("Failed to add todo");
      throw error;
    }
  };

  const updateTodo = async (id, currentStatus) => {
    try {
      const status = currentStatus || "pending";
      let newStatus;
      let completed = false;

      if (status === "pending") {
        newStatus = "started";
      } else if (status === "started") {
        newStatus = "completed";
        completed = true;
      } else {
        newStatus = "pending";
      }

      const updatedTodo = await todoApi.updateTodo(id, {
        status: newStatus,
        completed,
      });
      setTodos(todos.map((todo) => (todo._id === id ? updatedTodo : todo)));
      return updatedTodo;
    } catch (error) {
      console.error("Error updating todo:", error);
      alert("Failed to update todo");
      throw error;
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete todo");
      throw error;
    }
  };

  const updateDeadline = async (id, deadline) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, { deadline });
      setTodos(todos.map((todo) => (todo._id === id ? updatedTodo : todo)));
      return updatedTodo;
    } catch (error) {
      console.error("Error updating deadline:", error);
      alert("Failed to update deadline");
      throw error;
    }
  };

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    updateDeadline,
    refreshTodos: fetchTodos,
  };
};
