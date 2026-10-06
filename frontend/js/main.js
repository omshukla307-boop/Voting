// Main Frontend API & State Handler

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
    ? 'http://localhost:4000/api'
    : '/api';

function apiUrl(path) {
    return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/pages/auth/Login.html';
}

function checkAuth() {
    const token = getToken();
    if (!token && !window.location.pathname.includes('Login.html') && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        window.location.href = '/pages/auth/Login.html';
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
