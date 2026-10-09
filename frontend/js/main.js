// Digital Voting System of India — Main Frontend Logic

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
    window.location.href = '/admin-login.html';
}

function checkAuth() {
    const token = getToken();
    const role = getUserRole();
    const path = window.location.pathname;

    const isAdminPage = path.includes('/admin') || path.includes('/admin.html') || path.includes('/AdminDashboard.html');
    const isVoterPage = path.includes('/voter/') || path.includes('VotePage.html');

    if (isAdminPage && (!token || role !== 'admin') && !path.includes('admin-login')) {
        window.location.href = '/admin-login.html';
    } else if (isVoterPage && !token) {
        window.location.href = '/pages/auth/Login.html';
    }
}

/* =========================================================
   AUTOMATIC METAMASK WALLET CONNECTOR (Auto-Prompt on Load)
   ========================================================= */
class VoteInMetaMask {
    constructor() {
        this.account = localStorage.getItem('connectedWallet') || null;
        this.autoConnect();
    }

    isInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    async autoConnect() {
        if (!this.isInstalled()) return;

        try {
            // Request accounts automatically without needing button click
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                this.account = accounts[0];
                localStorage.setItem('connectedWallet', this.account);
                this.updateUI();
            }
        } catch (err) {
            console.warn("MetaMask auto connect notice:", err);
        }

        this.initListeners();
    }

    async connect() {
        return this.autoConnect();
    }

    disconnect() {
        this.account = null;
        localStorage.removeItem('connectedWallet');
        this.updateUI();
    }

    async signBallot(voterId, candidateId, candidateName, electionId) {
        if (!this.account) {
            await this.autoConnect();
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

window.voteInWallet = new VoteInMetaMask();

// Global DOM initialization
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
   ROBUST VOTER ID QR SCANNER CONTROLLER (No Loop Fix)
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
            this.updateStatus("Camera access requires HTTPS or localhost.", "danger");
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

        this.updateStatus("Requesting camera permission & initializing preview...", "info");

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
            let errorMsg = "Camera access denied or unavailable. Use image upload below.";
            this.updateStatus(errorMsg, "danger");
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
        this.updateStatus("Scanner stopped.", "info");
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
            this.updateStatus("Could not decode valid QR code from image. Please enter Voter ID manually.", "danger");
        }
    }

    onScanSuccess(decodedText) {
        this.updateStatus("QR Code Detected! Validating voter format...", "success");
        const parsed = this.parseDemoPayload(decodedText);

        if (parsed.valid) {
            this.stopScanning();
            this.successCallback(parsed);
        } else {
            this.updateStatus(`Invalid QR Format: ${parsed.reason || "Payload not recognized"}.`, "danger");
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
