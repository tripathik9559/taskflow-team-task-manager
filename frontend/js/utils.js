// js/utils.js
// shared helper functions used across pages

// show a toast notification
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
}

// format date for display: "Apr 30, 2026"
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// format datetime: "Apr 30, 10:45 AM"
function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
        ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// check if a deadline has passed
function isOverdue(deadline, status) {
    if (!deadline || status === 'done') return false;
    return new Date(deadline) < new Date();
}

// capitalize first letter
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');
}

// get badge HTML for status
function statusBadge(status) {
    return `<span class="badge badge-${status}">${capitalize(status)}</span>`;
}

// get badge HTML for priority
function priorityBadge(priority) {
    return `<span class="badge badge-${priority}">${capitalize(priority)}</span>`;
}

// get current user from localStorage
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

// redirect to login if not authenticated
function requireAuth() {
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    if (!token || !user) {
        window.location.href = '/index.html';
    }
    return user;
}

// redirect to dashboard if already logged in
function redirectIfLoggedIn() {
    const token = localStorage.getItem('token');
    if (token) window.location.href = '/pages/dashboard.html';
}

// logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// show/hide loading spinner inside a container
function setLoading(containerId, show) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (show) {
        el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
    }
}

// build modal and append to body - returns modal element
function createModal(title, bodyHTML, onConfirm = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" id="closeModal">&times;</button>
            </div>
            <div class="modal-body">${bodyHTML}</div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#closeModal').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    return overlay;
}

window.showToast = showToast;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.isOverdue = isOverdue;
window.capitalize = capitalize;
window.statusBadge = statusBadge;
window.priorityBadge = priorityBadge;
window.getCurrentUser = getCurrentUser;
window.requireAuth = requireAuth;
window.redirectIfLoggedIn = redirectIfLoggedIn;
window.logout = logout;
window.setLoading = setLoading;
window.createModal = createModal;
