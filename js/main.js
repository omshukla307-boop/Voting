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
    const isPublic = path.includes('Login.html') || path.includes('Signup.html') || path.endsWith('index.html') || path === '/' || path.includes('/spectator/');
    
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
                <span id="nav-user-id" class="badge badge-purple" style="font-size: 0.8rem;"></span>
                <button id="logout-btn" class="btn btn-secondary" style="padding: 0.4rem 0.9rem; font-size: 0.85rem; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #FCA5A5;">Logout</button>
            `;
            userBadge.querySelector('#nav-user-id').textContent = `👤 ${user.id}`;
            navLinks.appendChild(userBadge);

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.addEventListener('click', logout);
        }
    }
}

function initSlideToVote(onConfirm) {
    const container = document.getElementById('slide-container');
    const thumb = document.getElementById('slide-thumb');
    if (!container || !thumb) return;

    thumb._onConfirm = onConfirm;
    if (thumb.dataset.sliderReady) return;
    thumb.dataset.sliderReady = 'true';

    const resetSlider = () => {
        thumb.style.left = '4px';
        thumb.disabled = false;
        thumb.setAttribute('aria-valuenow', '0');
        const text = container.querySelector('.slide-to-vote-text');
        if (text) text.textContent = '>> Slide to confirm your vote';
    };

    let startX = 0;
    let startLeft = 4;
    let dragging = false;
    let submitting = false;

    thumb.addEventListener('pointerdown', event => {
        if (submitting || thumb.disabled) return;
        dragging = true;
        startX = event.clientX;
        startLeft = parseFloat(thumb.style.left) || 4;
        thumb.setPointerCapture(event.pointerId);
        thumb.style.cursor = 'grabbing';
        event.preventDefault();
    });

    thumb.addEventListener('pointermove', event => {
        if (!dragging) return;
        const maxLeft = Math.max(4, container.clientWidth - thumb.offsetWidth - 4);
        const left = Math.min(maxLeft, Math.max(4, startLeft + event.clientX - startX));
        thumb.style.left = `${left}px`;
        thumb.setAttribute('aria-valuenow', String(Math.round(((left - 4) / Math.max(1, maxLeft - 4)) * 100)));
    });

    const finishDrag = async event => {
        if (!dragging) return;
        dragging = false;
        thumb.style.cursor = 'grab';
        if (thumb.hasPointerCapture(event.pointerId)) thumb.releasePointerCapture(event.pointerId);

        const maxLeft = Math.max(4, container.clientWidth - thumb.offsetWidth - 4);
        const currentLeft = parseFloat(thumb.style.left) || 4;
        if (currentLeft < 4 + (maxLeft - 4) * 0.9) {
            resetSlider();
            return;
        }

        thumb.style.left = `${maxLeft}px`;
        submitting = true;
        thumb.disabled = true;
        try {
            const success = await thumb._onConfirm();
            if (success !== true) resetSlider();
            else {
                const text = container.querySelector('.slide-to-vote-text');
                if (text) text.textContent = 'Vote confirmed';
                thumb.setAttribute('aria-valuenow', '100');
            }
        } catch (error) {
            console.error('Slide-to-vote confirmation failed:', error);
            showToast('Could not confirm the vote. Please try again.', 'error');
            resetSlider();
        } finally {
            submitting = false;
        }
    };

    thumb.addEventListener('pointerup', finishDrag);
    thumb.addEventListener('pointercancel', () => {
        dragging = false;
        thumb.style.cursor = 'grab';
        resetSlider();
    });
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateNavAuthState();
    const greeting = document.getElementById('user-greeting');
    const user = getUserInfo();
    if (greeting && user && user.name) greeting.textContent = `Welcome, ${user.name}`;
});
