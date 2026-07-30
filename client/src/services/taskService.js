import { apiPrivate } from '../api/axios';

export const taskService = {
  getTasks: async (params = {}) => {
    const response = await apiPrivate.get('/task', { params });
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await apiPrivate.post('/task', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await apiPrivate.put(`/task/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await apiPrivate.delete(`/task/${id}`);
    return response.data;
  },
};

export default taskService;
