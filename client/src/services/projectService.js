import { apiPrivate } from '../api/axios';

export const projectService = {
  getProjects: async (params = {}) => {
    const response = await apiPrivate.get('/projects', { params });
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await apiPrivate.post('/projects', projectData);
    return response.data;
  },
};

export default projectService;
