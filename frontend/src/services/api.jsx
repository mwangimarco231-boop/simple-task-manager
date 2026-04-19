import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const taskAPI = {
    // Auth
    login: (credentials) => axios.post(`${API_URL}/token/`, credentials),
    register: (userData) => axios.post(`${API_URL}/register/`, userData),

    // Tasks
    getTasks: () => api.get('/tasks/'),
    createTask: (taskData) => api.post('/tasks/', taskData),
    updateTask: (taskId, taskData) => api.put(`/tasks/${taskId}/`, taskData),
    deleteTask: (taskId) => api.delete(`/tasks/${taskId}/`),
};

export default api;