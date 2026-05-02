// js/api.js
// central place for all API calls - makes it easy to change base URL

const API_BASE = 'https://taskflow-team-task-manager-production.up.railway.app/api';// get token from localStorage
const getToken = () => localStorage.getItem('token');

// generic fetch wrapper - handles auth headers + JSON parsing
const request = async (method, endpoint, body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
        }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || `Request failed: ${res.status}`);
    }
    return data;
};

const api = {
    // auth
    signup: (body) => request('POST', '/auth/signup', body),
    login:  (body) => request('POST', '/auth/login', body),
    getMe:  ()     => request('GET',  '/auth/me'),
    updateProfile: (body) => request('PUT', '/auth/profile', body),

    // projects
    getProjects:   ()       => request('GET',    '/projects'),
    createProject: (body)   => request('POST',   '/projects', body),
    updateProject: (id, b)  => request('PUT',    `/projects/${id}`, b),
    deleteProject: (id)     => request('DELETE', `/projects/${id}`),
    getMembers:    (id)     => request('GET',    `/projects/${id}/members`),
    addMember:     (id, b)  => request('POST',   `/projects/${id}/members`, b),
    removeMember:  (pid, uid) => request('DELETE', `/projects/${pid}/members/${uid}`),

    // tasks
    getTasks:    (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request('GET', `/tasks${qs ? '?' + qs : ''}`);
    },
    createTask:  (body)    => request('POST',   '/tasks', body),
    updateTask:  (id, b)   => request('PUT',    `/tasks/${id}`, b),
    deleteTask:  (id)      => request('DELETE', `/tasks/${id}`),
    getComments: (id)      => request('GET',    `/tasks/${id}/comments`),
    addComment:  (id, b)   => request('POST',   `/tasks/${id}/comments`, b),

    // dashboard
    getDashboard:   () => request('GET', '/dashboard'),
    getAllUsers:     () => request('GET', '/dashboard/users'),
    getActivityLog: () => request('GET', '/dashboard/activity'),
};

window.api = api;
