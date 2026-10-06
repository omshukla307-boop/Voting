// VoteIn Application - Frontend Controller & API Integration

const API_BASE = '/api';

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
    }, 400);
}

function checkAuth() {
    const token = getToken();
    const path = window.location.pathname;
    const isPublic = path.includes('Login.html') || path.includes('Register.html') || path.endsWith('index.html') || path === '/' || path.includes('/spectator/');
    
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
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Interactive Slide-to-Vote Slider Handler
function initSlideToVote(onSuccess) {
    const thumb = document.getElementById('slide-thumb');
    const container = document.getElementById('slide-container');
    if (!thumb || !container) return;

    let isDragging = false;
    let startX = 0;
    const maxSlide = container.clientWidth - thumb.clientWidth - 8;

    function startDrag(e) {
        isDragging = true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX) - thumb.offsetLeft;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function onDrag(e) {
        if (!isDragging) return;
        const currentX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
        const newLeft = Math.max(4, Math.min(currentX, maxSlide));
        thumb.style.left = `${newLeft}px`;

        if (newLeft >= maxSlide - 5) {
            isDragging = false;
            thumb.style.left = `${maxSlide}px`;
            thumb.style.background = '#10B981';
            thumb.innerHTML = '✓';
            if (typeof onSuccess === 'function') onSuccess();
        }
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        if (parseInt(thumb.style.left) < maxSlide - 5) {
            thumb.style.left = '4px';
        }
    }

    thumb.addEventListener('mousedown', startDrag);
    thumb.addEventListener('touchstart', startDrag);
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const user = getUserInfo();
    const userDisplay = document.getElementById('user-greeting');
    if (userDisplay && user && user.id) {
        userDisplay.innerText = `Hey, ${user.name || user.id}!`;
    }
});
