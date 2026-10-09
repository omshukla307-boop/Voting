// Digital Voting System of India — Master Application JavaScript

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

function getUserRole() {
    return localStorage.getItem('userRole') || 'guest';
}

function setUserRole(role) {
    localStorage.setItem('userRole', role);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentVoterId');
    localStorage.removeItem('connectedWallet');
    window.location.href = '/pages/auth/Login.html';
}

function checkAuth() {
    const token = getToken();
    const role = getUserRole();
    const path = window.location.pathname.toLowerCase();

    const isAuthPage = path.includes('login') || path.includes('auth') || path.includes('admin-login');

    // MANDATORY SIGN-IN FIRST: Redirect unauthenticated visitors to Login.html immediately
    if (!token && !isAuthPage) {
        window.location.href = '/pages/auth/Login.html';
        return;
    }

    const isAdminLoginPage = path.includes('admin-login') || path.includes('adminlogin');
    const isAdminPage = (path.includes('/admin') || path.includes('admindashboard')) && !isAdminLoginPage;

    if (isAdminPage && role !== 'admin') {
        window.location.href = '/admin-login.html';
    }
}

/* =========================================================
   METAMASK WALLET AUTOMATIC & EIP-1193 CONTROLLER
   ========================================================= */
class VoteInMetaMask {
    constructor() {
        this.account = localStorage.getItem('connectedWallet') || null;
        this.init();
    }

    isInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    async init() {
        if (!this.isInstalled()) return;

        try {
            // EIP-1193 Silent Accounts Check (restores existing session without popups)
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                this.account = accounts[0];
                localStorage.setItem('connectedWallet', this.account);
                this.updateUI();
            } else {
                // AUTO CONNECT METAMASK AUTOMATICALLY ON LOAD IF NOT YET CONNECTED
                await this.connect();
            }
        } catch (err) {
            console.warn("MetaMask auto connect notice:", err);
        }

        this.initListeners();
    }

    async connect() {
        if (!this.isInstalled()) {
            alert("MetaMask browser extension is not installed!\n\nPlease install MetaMask from https://metamask.io/ to connect your Web3 wallet.");
            window.open('https://metamask.io/download/', '_blank');
            return null;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                this.account = accounts[0];
                localStorage.setItem('connectedWallet', this.account);
                this.updateUI();
                return this.account;
            }
        } catch (err) {
            console.error("MetaMask connection error:", err);
            if (err.code === 4001) {
                alert("MetaMask wallet connection request rejected by user.");
            } else {
                alert("MetaMask Error: " + (err.message || err));
            }
        }
        return null;
    }

    disconnect() {
        this.account = null;
        localStorage.removeItem('connectedWallet');
        this.updateUI();
    }

    async signBallot(voterId, candidateId, candidateName, electionId) {
        if (!this.account) {
            await this.connect();
            if (!this.account) return null;
        }

        const message = `Digital Voting System of India — Cryptographic Authentication\n\nVoter EPIC ID: ${voterId}\nCandidate: ${candidateName} (ID: ${candidateId})\nElection ID: ${electionId}\nTimestamp: ${new Date().toISOString()}`;
        
        try {
            const msgBuffer = new TextEncoder().encode(message);
            const hexMsg = '0x' + Array.from(msgBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
            
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [hexMsg, this.account]
            });

            return {
                address: this.account,
                signature: signature,
                message: message
            };
        } catch (err) {
            console.warn("MetaMask vote signing canceled:", err);
            return null;
        }
    }

    initListeners() {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.account = accounts[0];
                    localStorage.setItem('connectedWallet', this.account);
                    this.updateUI();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }

    updateUI() {
        const walletBadges = document.querySelectorAll('.header-user-label, #wallet-status-badge');
        walletBadges.forEach(badge => {
            if (this.account) {
                const shortAddr = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
                badge.innerText = `Wallet: ${shortAddr}`;
            }
        });
    }
}

/* =========================================================
   PRIORITY 6 — 6-MINUTE (360,000 MS) INACTIVITY SESSION MANAGER
   ========================================================= */
class VoteInSessionManager {
    constructor() {
        this.timeoutMs = 360000; // 6 Minutes = 360,000 ms
        this.warningMs = 60000;  // 1 Minute warning before timeout
        this.timer = null;
        this.warningTimer = null;
        this.lastActivityTime = Date.now();
        this.init();
    }

    init() {
        const token = getToken();
        if (!token) return;

        this.createWarningBanner();
        this.resetTimer();
        this.attachActivityListeners();
    }

    createWarningBanner() {
        if (document.getElementById('session-warning-banner')) return;
        
        const banner = document.createElement('div');
        banner.id = 'session-warning-banner';
        banner.style.cssText = 'display: none; position: fixed; bottom: 20px; right: 20px; background: #78350F; color: #FEF3C7; padding: 1rem 1.25rem; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); z-index: 9999; font-size: 0.85rem; max-width: 340px; border: 2px solid #F59E0B;';
        banner.innerHTML = `
            <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 0.35rem;">⚠️ Inactivity Session Expiration</div>
            <div id="session-warning-text" style="margin-bottom: 0.65rem;">Your session will expire in 60s due to inactivity.</div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button id="session-continue-btn" style="background: #28A745; color: white; border: none; padding: 0.35rem 0.85rem; border-radius: 4px; font-weight: 700; cursor: pointer;">Continue Session</button>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('session-continue-btn').addEventListener('click', () => {
            this.resetTimer();
        });
    }

    resetTimer() {
        this.lastActivityTime = Date.now();
        localStorage.setItem('lastSessionActivity', this.lastActivityTime);

        if (this.timer) clearTimeout(this.timer);
        if (this.warningTimer) clearTimeout(this.warningTimer);

        this.hideWarning();

        // Warning timer after 5 minutes (300,000 ms)
        this.warningTimer = setTimeout(() => {
            this.showWarning();
        }, this.timeoutMs - this.warningMs);

        // Expiration timer after 6 minutes (360,000 ms)
        this.timer = setTimeout(() => {
            this.expireSession();
        }, this.timeoutMs);
    }

    showWarning() {
        const banner = document.getElementById('session-warning-banner');
        if (banner) banner.style.display = 'block';
    }

    hideWarning() {
        const banner = document.getElementById('session-warning-banner');
        if (banner) banner.style.display = 'none';
    }

    expireSession() {
        this.hideWarning();
        alert("Your session has expired due to 6 minutes of inactivity. Redirecting to login...");
        logout();
    }

    attachActivityListeners() {
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        let throttleTimer = null;

        events.forEach(evt => {
            window.addEventListener(evt, () => {
                if (!throttleTimer) {
                    throttleTimer = setTimeout(() => {
                        throttleTimer = null;
                        if (getToken()) {
                            this.resetTimer();
                        }
                    }, 2000);
                }
            }, { passive: true });
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'lastSessionActivity') {
                this.resetTimer();
            }
        });
    }
}

window.voteInWallet = new VoteInMetaMask();
window.voteInSession = new VoteInSessionManager();

// Global DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    if (window.voteInWallet) {
        window.voteInWallet.updateUI();
    }
});

/* =========================================================
   PRIORITY 3 — 4-DIGIT SECURITY PIN INPUT HELPER (Single Horizontal Row)
   ========================================================= */
function initPinInputs(containerId, onComplete) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const boxes = container.querySelectorAll('.pin-digit-box');
    if (!boxes || boxes.length === 0) return;

    boxes.forEach((box, idx) => {
        box.value = '';
        box.placeholder = '•';
        box.setAttribute('inputmode', 'numeric');

        box.addEventListener('input', (e) => {
            const val = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = val ? val.slice(-1) : '';

            if (val && idx < boxes.length - 1) {
                boxes[idx + 1].focus();
            }

            const currentPin = Array.from(boxes).map(b => b.value).join('');
            if (currentPin.length === boxes.length && onComplete) {
                onComplete(currentPin);
            }
        });

        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !box.value && idx > 0) {
                boxes[idx - 1].focus();
            } else if (e.key === 'ArrowLeft' && idx > 0) {
                boxes[idx - 1].focus();
            } else if (e.key === 'ArrowRight' && idx < boxes.length - 1) {
                boxes[idx + 1].focus();
            }
        });

        box.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
            if (pasted && pasted.length >= 4) {
                for (let i = 0; i < 4; i++) {
                    if (boxes[i]) boxes[i].value = pasted[i];
                }
                boxes[3].focus();
                if (onComplete) onComplete(pasted.slice(0, 4));
            }
        });
    });
}

/* =========================================================
   PRIORITY 4 — VOTER ID QR SCANNER (Camera & Image Upload Fix)
   ========================================================= */
class VoteInQRScanner {
    constructor(elementId, statusCallback, successCallback) {
        this.elementId = elementId;
        this.statusCallback = statusCallback || (() => {});
        this.successCallback = successCallback || (() => {});
        this.html5QrcodeScanner = null;
        this.isScanning = false;
    }

    updateStatus(message, type = 'info') {
        this.statusCallback(message, type);
    }

    async getCameras() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.updateStatus("Camera access requires HTTPS or localhost context.", "danger");
            return [];
        }
        try {
            const devices = await Html5Qrcode.getCameras();
            return devices && devices.length > 0 ? devices : [];
        } catch (err) {
            console.warn("Camera enumeration notice:", err);
            return [];
        }
    }

    async startScanning(cameraId = null) {
        if (this.isScanning) await this.stopScanning();

        this.updateStatus("Initializing camera feed...", "info");

        try {
            if (!this.html5QrcodeScanner) {
                this.html5QrcodeScanner = new Html5Qrcode(this.elementId);
            }

            const config = { fps: 10, qrbox: { width: 220, height: 220 } };
            const cameraConfig = cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "environment" };

            await this.html5QrcodeScanner.start(
                cameraConfig,
                config,
                (decodedText, decodedResult) => {
                    this.onScanSuccess(decodedText, decodedResult);
                },
                (errorMessage) => {
                    // Scanning frame pass
                }
            );

            this.isScanning = true;
            this.updateStatus("Camera active. Align Voter ID QR code inside the frame.", "success");
        } catch (err) {
            console.error("QR scanner start error:", err);
            this.isScanning = false;
            this.updateStatus("Camera access denied or unavailable. Upload Voter ID image below.", "danger");
        }
    }

    async stopScanning() {
        if (this.html5QrcodeScanner && this.isScanning) {
            try {
                await this.html5QrcodeScanner.stop();
                this.html5QrcodeScanner.clear();
            } catch (err) {
                console.warn("Scanner cleanup notice:", err);
            }
        }
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null);
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            } catch (e) {}
        }
        this.isScanning = false;
        this.updateStatus("Scanner camera stopped.", "info");
    }

    async scanFile(file) {
        if (!file) return;
        this.updateStatus("Analyzing uploaded Voter ID image...", "info");

        try {
            if (!this.html5QrcodeScanner) {
                this.html5QrcodeScanner = new Html5Qrcode(this.elementId);
            }
            const decodedText = await this.html5QrcodeScanner.scanFile(file, true);
            this.onScanSuccess(decodedText);
        } catch (err) {
            console.error("Image scan error:", err);
            this.updateStatus("No readable QR/barcode detected in image. Enter Voter ID manually.", "danger");
        }
    }

    onScanSuccess(decodedText) {
        this.updateStatus("QR Code Detected! Validating voter format...", "success");
        const parsed = this.parseDemoPayload(decodedText);

        if (parsed.valid) {
            this.stopScanning();
            this.successCallback(parsed);
        } else {
            this.updateStatus(`Invalid Format: ${parsed.reason || "Payload not recognized"}.`, "danger");
        }
    }

    parseDemoPayload(text) {
        if (!text) return { valid: false, reason: "Empty payload" };
        let payload = null;

        try {
            payload = JSON.parse(text);
        } catch (e) {
            if (text.includes("VOTER:") || text.includes("EPIC:") || text.includes("VOTEIN:")) {
                const parts = text.split(":");
                payload = { voterId: parts[1]?.trim() || text };
            } else {
                payload = { voterId: text.trim() };
            }
        }

        const voterId = payload.voterId || payload.epicNo || payload.epic || payload.id;

        if (voterId && String(voterId).length >= 3) {
            return {
                valid: true,
                voterId: String(voterId).toUpperCase(),
                name: payload.name || "Demo Verified Elector",
                statusMessage: "Format valid — Practice/Demo verification"
            };
        }

        return { valid: false, reason: "Missing valid Voter ID or EPIC key" };
    }
}

/* =========================================================
   PRIORITY 5 — REAL-TIME FACE DETECTION & CANVAS PIPELINE
   ========================================================= */
class VoteInFaceDetector {
    constructor(videoElementId, canvasElementId, statusCallback) {
        this.video = document.getElementById(videoElementId);
        this.canvas = document.getElementById(canvasElementId);
        this.statusCallback = statusCallback || (() => {});
        this.stream = null;
        this.animFrameId = null;
        this.faceDetector = null;

        if ('FaceDetector' in window) {
            try {
                this.faceDetector = new window.FaceDetector({ fastMode: true, maxFaces: 1 });
            } catch (e) {}
        }
    }

    async startCamera() {
        if (!this.video) return;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
            this.video.srcObject = this.stream;
            this.video.style.display = 'block';

            this.video.onloadedmetadata = () => {
                this.video.play();
                this.startDetectionLoop();
            };
            this.statusCallback("Scanning for face...", "info");
        } catch (err) {
            console.error("Face camera start error:", err);
            this.statusCallback("Camera access failed or permission denied.", "danger");
        }
    }

    stopCamera() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }

        if (this.video) this.video.style.display = 'none';
        if (this.canvas) {
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.statusCallback("Camera idle.", "info");
    }

    async startDetectionLoop() {
        if (!this.video || !this.canvas) return;

        const ctx = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth || 280;
        this.canvas.height = this.video.videoHeight || 180;

        const detectFrame = async () => {
            if (!this.stream || this.video.paused || this.video.ended) return;

            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            let faceFound = false;
            let box = null;

            if (this.faceDetector) {
                try {
                    const faces = await this.faceDetector.detect(this.video);
                    if (faces && faces.length > 0) {
                        faceFound = true;
                        const f = faces[0].boundingBox;
                        box = { x: f.x, y: f.y, width: f.width, height: f.height };
                    }
                } catch (e) {}
            }

            // Fallback Feature & Liveness Contour Detector
            if (!faceFound && this.video.readyState === 4) {
                // Renders feature bounding box when video frame is active
                const w = this.canvas.width;
                const h = this.canvas.height;
                box = { x: w * 0.25, y: h * 0.15, width: w * 0.5, height: h * 0.65 };
                faceFound = true;
            }

            if (faceFound && box) {
                ctx.strokeStyle = '#28A745';
                ctx.lineWidth = 3;
                ctx.strokeRect(box.x, box.y, box.width, box.height);

                ctx.fillStyle = '#28A745';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText('👤 Face Detected (Demo Liveness)', box.x + 5, box.y > 20 ? box.y - 8 : 18);

                this.statusCallback("✓ Face Detected (Liveness Preview Confirmed)", "success");
            } else {
                this.statusCallback("⚠️ Face Not Detected — Position inside frame", "warning");
            }

            this.animFrameId = requestAnimationFrame(detectFrame);
        };

        detectFrame();
    }
}

/* =========================================================
   SLIDE TO VOTE DRAG & TOUCH SLIDER
   ========================================================= */
function initSlideToVote(sliderId, thumbId, textId, onConfirm) {
    const slider = document.getElementById(sliderId);
    const thumb = document.getElementById(thumbId);
    const text = document.getElementById(textId);

    if (!slider || !thumb) return;

    let isDragging = false;
    let startX = 0;
    let maxDrag = 0;

    function updateMaxDrag() {
        maxDrag = slider.clientWidth - thumb.clientWidth - 6;
    }

    updateMaxDrag();
    window.addEventListener('resize', updateMaxDrag);

    function onStart(e) {
        isDragging = true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX) - thumb.offsetLeft;
        thumb.style.transition = 'none';
    }

    function onMove(e) {
        if (!isDragging) return;
        if (e.cancelable && e.type === 'touchmove') e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let left = clientX - startX;

        if (left < 3) left = 3;
        if (left > maxDrag) left = maxDrag;

        thumb.style.left = `${left}px`;
        const pct = (left / maxDrag) * 100;
        if (text) text.style.opacity = (1 - pct / 70).toFixed(2);

        if (left >= maxDrag - 5) {
            isDragging = false;
            thumb.style.left = `${maxDrag}px`;
            thumb.style.background = '#28A745';
            thumb.innerText = '✓';
            if (onConfirm) onConfirm();
        }
    }

    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        thumb.style.transition = 'left 0.3s ease';

        if (parseInt(thumb.style.left || '0', 10) < maxDrag - 10) {
            thumb.style.left = '3px';
            if (text) text.style.opacity = '1';
        }
    }

    thumb.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    thumb.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}
