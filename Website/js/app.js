class VoiceChatManager {
    constructor() {
        this.joined = false;
        this.muted = true;
        this.users = new Map();
        this.username = '';
        this.speakingIndicators = new Map();
    }

    init() {
        this.setupEventListeners();
        this.setupPeerListeners();
    }

    setupEventListeners() {
        document.getElementById('joinVoiceBtn').addEventListener('click', () => {
            this.joinVoice();
        });

        document.getElementById('muteBtn').addEventListener('click', () => {
            this.toggleMute();
        });

        document.getElementById('leaveVoiceBtn').addEventListener('click', () => {
            this.leaveVoice();
        });
    }

    setupPeerListeners() {
        window.peerService.addEventListener('connected', ({ id }) => {
            this.addUser(id, this.username, false, true);
        });

        window.peerService.addEventListener('peer_joined', ({ peerId, username }) => {
            this.addUser(peerId, username, false, false);
        });

        window.peerService.addEventListener('peer_left', ({ peerId }) => {
            this.removeUser(peerId);
        });

        window.peerService.addEventListener('stream', ({ peerId, stream }) => {
            this.playStream(stream);
            this.setupSpeakingIndicator(peerId, stream);
        });

        window.peerService.addEventListener('disconnected', () => {
            this.joined = false;
            this.muted = true;
            this.users.clear();
            this.speakingIndicators.clear();
            this.updateVoiceUI();
            this.updateUsersList();
        });
    }

    async joinVoice() {
        try {
            this.username = window.authManager.getUsername();
            await window.peerService.connect(this.username);
            this.joined = true;
            this.muted = false;
            window.peerService.setMuted(false);
            this.updateVoiceUI();
        } catch (error) {
            alert('Failed to join voice chat. Please check your microphone permissions.');
        }
    }

    leaveVoice() {
        this.speakingIndicators.forEach(cleanup => cleanup());
        this.speakingIndicators.clear();
        window.peerService.disconnect();
        this.joined = false;
        this.muted = true;
        this.users.clear();
        this.updateVoiceUI();
        this.updateUsersList();
    }

    toggleMute() {
        this.muted = !this.muted;
        window.peerService.setMuted(this.muted);
        this.updateVoiceUI();
        
        const selfPeerId = Array.from(this.users.keys()).find(id => 
            this.users.get(id).isSelf
        );
        if (selfPeerId) {
            const user = this.users.get(selfPeerId);
            user.isMuted = this.muted;
            this.users.set(selfPeerId, user);
            this.updateUsersList();
        }
    }

    addUser(peerId, username, isSpeaking, isSelf = false) {
        this.users.set(peerId, { 
            peerId, 
            username, 
            isSpeaking, 
            isSelf,
            isMuted: isSelf ? this.muted : false
        });
        this.updateUsersList();
    }

    removeUser(peerId) {
        this.users.delete(peerId);
        if (this.speakingIndicators.has(peerId)) {
            const cleanup = this.speakingIndicators.get(peerId);
            cleanup();
            this.speakingIndicators.delete(peerId);
        }
        this.updateUsersList();
    }

    playStream(stream) {
        const audio = new Audio();
        audio.srcObject = stream;
        audio.autoplay = true;
        audio.volume = 1.0;
        audio.play().catch(() => {
            document.addEventListener('click', () => {
                audio.play();
            }, { once: true });
        });
    }

    setupSpeakingIndicator(peerId, stream) {
        if (!this.joined) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let isActive = true;

            const checkSpeaking = () => {
                if (!isActive || !this.joined || !this.users.has(peerId)) {
                    return;
                }

                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                const isSpeaking = average > 25;
                
                const user = this.users.get(peerId);
                if (user && user.isSpeaking !== isSpeaking) {
                    user.isSpeaking = isSpeaking;
                    this.users.set(peerId, user);
                    this.updateUsersList();
                }
                
                if (isActive && this.joined) {
                    requestAnimationFrame(checkSpeaking);
                }
            };
            
            this.speakingIndicators.set(peerId, () => {
                isActive = false;
                audioContext.close();
            });
            
            checkSpeaking();
        } catch (error) {
            // Silent fail
        }
    }

    updateVoiceUI() {
        const joinBtn = document.getElementById('joinVoiceBtn');
        const activeControls = document.getElementById('voiceActiveControls');
        const muteBtn = document.getElementById('muteBtn');
        const micOffIcon = document.getElementById('micOffIcon');
        const micOnIcon = document.getElementById('micOnIcon');

        if (this.joined) {
            joinBtn.classList.add('hidden');
            activeControls.classList.remove('hidden');
            
            if (this.muted) {
                muteBtn.classList.remove('unmuted');
                muteBtn.classList.add('muted');
                micOffIcon.classList.remove('hidden');
                micOnIcon.classList.add('hidden');
            } else {
                muteBtn.classList.remove('muted');
                muteBtn.classList.add('unmuted');
                micOffIcon.classList.add('hidden');
                micOnIcon.classList.remove('hidden');
            }
        } else {
            joinBtn.classList.remove('hidden');
            activeControls.classList.add('hidden');
        }
    }

    updateUsersList() {
        const usersList = document.getElementById('voiceUsersList');
        
        if (this.users.size === 0) {
            usersList.innerHTML = `
                <p class="voice-empty-state">
                    ${this.joined ? 'Connected to voice chat' : 'Click "Join Voice" to start'}
                </p>
            `;
            return;
        }

        const usersArray = Array.from(this.users.values());
        usersArray.sort((a, b) => {
            if (a.isSelf && !b.isSelf) return -1;
            if (!a.isSelf && b.isSelf) return 1;
            return a.username.localeCompare(b.username);
        });

        usersList.innerHTML = usersArray.map(user => `
            <div class="voice-user ${user.isSpeaking ? 'speaking' : ''}">
                <div class="voice-user-indicator ${user.isMuted ? 'muted' : ''}"></div>
                <span class="voice-user-name">${user.username}</span>
                ${user.isSelf ? '<span class="voice-user-you">(you)</span>' : ''}
                ${user.isMuted ? '<span class="voice-user-muted">🔇</span>' : ''}
            </div>
        `).join('');
    }
}

class App {
    constructor() {
        this.voiceChatManager = new VoiceChatManager();
    }

    init() {
        this.setupLoginForm();
        this.setupLogoutButton();
        this.showLoginPage();
        this.voiceChatManager.init();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username) {
                this.showError('Username is required');
                return;
            }

            const success = window.authManager.login(username, password);
            if (success) {
                this.showDashboard();
            } else {
                this.showError('Invalid password. Please try again.');
            }
        });
    }

    setupLogoutButton() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';
    }

    showLoginPage() {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        this.hideError();
    }

    showDashboard() {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        document.getElementById('welcomeText').textContent = 
            `Welcome, ${window.authManager.getUsername()}`;
        
        window.chartManager.initializeCharts();
        window.dashboardManager.init();
    }

    logout() {
        window.authManager.logout();
        window.socketService.disconnect();
        this.voiceChatManager.leaveVoice();
        this.showLoginPage();
        document.getElementById('loginForm').reset();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});