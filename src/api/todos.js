import { client } from "../utils/httpClient";

const USER_ID = 11373;

export const getTodos = () => {
  return client.get(`/todos?userId=${USER_ID}`);
};

export const createTodo = (title) => {
  return client.post("/todos", {
    title,
    completed: false,
    userId: USER_ID,
  });
};

export const updateTodo = ({ id, title, completed }) => {
  return client.patch(`/todos/${id}`, {
    title,
    completed,
  });
};

export const deleteTodo = (todoId) => {
  return client.delete(`/todos/${todoId}`);
};
