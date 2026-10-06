// Main Frontend API & State Handler

function normalizeApiBase(base) {
    if (!base) return '/api';
    const value = String(base).trim().replace(/\/+$/, '');
    return value.endsWith('/api') ? value : `${value}/api`;
}

function resolveApiBase() {
    const fromGlobal = window.__VOTING_API_BASE__ || window.__API_BASE__;
    if (fromGlobal) return normalizeApiBase(fromGlobal);

    const hostname = window.location.hostname || '';
    const isLocalHostname = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'].includes(hostname);

    if (window.location.protocol === 'file:' || isLocalHostname) {
        return 'http://localhost:4000/api';
    }

    return `${window.location.origin}/api`;
}

const API_BASE = resolveApiBase();

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
