import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  archive: (id) => api.patch(`/projects/${id}/archive`),
};

export const sprintService = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/sprints`),
  getById: (id) => api.get(`/sprints/${id}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/sprints`, data),
  update: (id, data) => api.put(`/sprints/${id}`, data),
  updateStatus: (id, status) => api.patch(`/sprints/${id}/status`, { status }),
};

export const taskService = {
  getBySprint: (sprintId) => api.get(`/sprints/${sprintId}/tasks`),
  getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => api.patch(`/tasks/${id}/status`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const commentService = {
  getByTask: (taskId) => api.get(`/tasks/${taskId}/comments`),
  create: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
};

export const standupService = {
  submit: (data) => api.post('/standups', data),
  getByProject: (projectId, params) => api.get(`/projects/${projectId}/standups`, { params }),
  getToday: (projectId) => api.get('/standups/today', { params: { projectId } }),
};

export const teamService = {
  getMembers: (projectId) => api.get(`/projects/${projectId}/members`),
  addMember: (projectId, data) => api.post(`/projects/${projectId}/members`, data),
  updateRole: (projectId, userId, role) => api.put(`/projects/${projectId}/members/${userId}`, { role }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
};
