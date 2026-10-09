// Digital Voting System of India — Main Frontend API, Wallet & Auth Logic

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
    const path = window.location.pathname;

    const isAdminPage = path.includes('/admin/AdminDashboard.html');
    const isVoterPage = path.includes('/voter/VotePage.html') || path.includes('/voter/Dashboard.html');

    if (isAdminPage && (!token || role !== 'admin')) {
        window.location.href = '/pages/auth/AdminLogin.html';
    } else if (isVoterPage && !token) {
        window.location.href = '/pages/auth/Login.html';
    }
}

/* =========================================================
   METAMASK / WEB3 WALLET AUTOMATIC CONTROLLER (EIP-1193)
   ========================================================= */
class VoteInMetaMask {
    constructor() {
        this.account = localStorage.getItem('connectedWallet') || null;
        this.chainId = null;
        this.init();
    }

    isInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    async init() {
        if (!this.isInstalled()) return;

        try {
            // EIP-1193 Silent Accounts Check (does not trigger popup if already authorized)
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                this.account = accounts[0];
                localStorage.setItem('connectedWallet', this.account);
            }
            this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
            this.updateUI();
        } catch (err) {
            console.warn("MetaMask silent init notice:", err);
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
                this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
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
            const connected = await this.connect();
            if (!connected) return null;
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
            console.warn("MetaMask vote signing canceled or failed:", err);
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

            window.ethereum.on('chainChanged', (chainId) => {
                this.chainId = chainId;
                window.location.reload();
            });
        }
    }

    updateUI() {
        const walletBtns = document.querySelectorAll('.metamask-connect-btn');
        walletBtns.forEach(btn => {
            const textSpan = btn.querySelector('.wallet-text');
            if (this.account) {
                const shortAddr = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
                if (textSpan) textSpan.innerText = shortAddr;
                else btn.innerHTML = `🦊 ${shortAddr}`;
                btn.classList.add('wallet-connected');
                btn.title = `Connected Wallet: ${this.account}\nClick to Disconnect`;
            } else {
                if (textSpan) textSpan.innerText = 'Connect MetaMask';
                else btn.innerHTML = '🦊 Connect Wallet';
                btn.classList.remove('wallet-connected');
                btn.title = 'Click to Connect MetaMask Wallet';
            }
        });

        // Wallet status elements
        const statusEl = document.getElementById('wallet-status-badge');
        if (statusEl) {
            if (this.account) {
                statusEl.className = 'badge badge-live';
                statusEl.innerText = `Wallet Connected (${this.account.slice(0, 6)}...)`;
            } else {
                statusEl.className = 'badge badge-ended';
                statusEl.innerText = 'Wallet Not Connected';
            }
        }
    }
}

window.voteInWallet = new VoteInMetaMask();

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    if (window.voteInWallet) {
        window.voteInWallet.updateUI();

        document.querySelectorAll('.metamask-connect-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (window.voteInWallet.account) {
                    if (confirm(`MetaMask Wallet Connected:\n${window.voteInWallet.account}\n\nDo you want to disconnect this wallet?`)) {
                        window.voteInWallet.disconnect();
                    }
                } else {
                    await window.voteInWallet.connect();
                }
            });
        });
    }
});

/* =========================================================
   QR CODE SCANNER CONTROLLER (html5-qrcode integration)
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
            this.updateStatus("Camera access is not supported by your browser or environment (HTTPS required).", "danger");
            return [];
        }
        try {
            const devices = await Html5Qrcode.getCameras();
            return devices && devices.length > 0 ? devices : [];
        } catch (err) {
            console.warn("Camera enumeration error:", err);
            return [];
        }
    }

    async startScanning(cameraId = null) {
        if (this.isScanning) await this.stopScanning();

        this.updateStatus("Requesting camera permission & initializing preview...", "info");

        try {
            if (!this.html5QrcodeScanner) {
                this.html5QrcodeScanner = new Html5Qrcode(this.elementId);
            }

            const config = { fps: 10, qrbox: { width: 240, height: 240 } };
            const cameraConfig = cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "environment" };

            await this.html5QrcodeScanner.start(
                cameraConfig,
                config,
                (decodedText, decodedResult) => {
                    this.onScanSuccess(decodedText, decodedResult);
                },
                (errorMessage) => {
                    // Scanning line frame miss
                }
            );

            this.isScanning = true;
            this.updateStatus("Camera active. Align Voter ID QR code inside the frame.", "success");
        } catch (err) {
            console.error("QR scanner start error:", err);
            this.isScanning = false;
            let errorMsg = "Camera access denied or camera unavailable.";
            if (err.name === "NotAllowedError" || String(err).includes("Permission denied")) {
                errorMsg = "Camera Permission Denied. Please grant camera permissions in your browser settings.";
            } else if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                errorMsg = "Camera access requires HTTPS in non-localhost web deployments.";
            }
            this.updateStatus(errorMsg, "danger");
        }
    }

    async stopScanning() {
        if (this.html5QrcodeScanner && this.isScanning) {
            try {
                await this.html5QrcodeScanner.stop();
                this.html5QrcodeScanner.clear();
            } catch (err) {
                console.warn("Scanner stop cleanup notice:", err);
            }
        }
        // Force teardown of open MediaStream tracks
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
            this.updateStatus("Could not decode valid QR payload from uploaded image.", "danger");
        }
    }

    onScanSuccess(decodedText) {
        this.updateStatus("QR Code Detected! Validating voter format...", "success");
        const parsed = this.parseDemoPayload(decodedText);

        if (parsed.valid) {
            this.stopScanning();
            this.successCallback(parsed);
        } else {
            this.updateStatus(`Invalid QR Format: ${parsed.reason || "Payload not recognized"}. Expected demo payload.`, "danger");
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
                statusMessage: "Format valid — Practice/Demo verification only"
            };
        }

        return { valid: false, reason: "Missing valid Voter ID or EPIC key" };
    }
}

/* =========================================================
   PIN INPUT AUTO-FOCUS & CLEARING HELPER
   ========================================================= */
function initPinInputs(containerId, onComplete) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const boxes = container.querySelectorAll('.pin-digit-box');
    boxes.forEach((box, idx) => {
        box.value = '';
        box.placeholder = '•';

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
            }
        });
    });
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
            thumb.style.background = '#138808';
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
