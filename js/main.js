// E-Voting Platform - Global JavaScript Controller

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

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function getUserInfo() {
    const token = getToken();
    if (!token) return null;
    return parseJwt(token);
}

function logout() {
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = '/pages/auth/Login.html';
    }, 500);
}

function checkAuth() {
    const token = getToken();
    const path = window.location.pathname;
    const isPublic = path.includes('Login.html') || path.endsWith('index.html') || path === '/' || path.includes('/spectator/');
    
    if (!token && !isPublic) {
        window.location.href = '/pages/auth/Login.html';
    }
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function updateNavAuthState() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const user = getUserInfo();
    const loginBtn = navLinks.querySelector('a[href*="Login.html"]');

    if (user && user.id) {
        if (loginBtn) loginBtn.remove();
        
        let userBadge = document.getElementById('nav-user-badge');
        if (!userBadge) {
            userBadge = document.createElement('div');
            userBadge.id = 'nav-user-badge';
            userBadge.style.display = 'flex';
            userBadge.style.alignItems = 'center';
            userBadge.style.gap = '0.75rem';
            userBadge.innerHTML = `
                <a href="/pages/voter/VotePage.html" class="btn btn-secondary" style="padding: 0.4rem 1rem; font-size: 0.85rem;">🗳️ Cast Vote</a>
                <span class="badge badge-purple" style="font-size: 0.8rem;">👤 ${user.id}</span>
                <button id="logout-btn" class="btn btn-secondary" style="padding: 0.4rem 0.9rem; font-size: 0.85rem; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #FCA5A5;">Logout</button>
            `;
            navLinks.appendChild(userBadge);

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.addEventListener('click', logout);
        }
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateNavAuthState();
});
