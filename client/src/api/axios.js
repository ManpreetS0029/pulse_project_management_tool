import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || '/api';

export const apiPrivate = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

