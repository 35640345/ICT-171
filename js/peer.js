class PeerService {
    constructor() {
        this.peer = null;
        this.localStream = null;
        this.connections = new Map();
        this.listeners = new Map();
        this.isConnected = false;
        this.username = '';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.intentionalDisconnect = false;
    }

    async getLocalStream() {
        if (!this.localStream) {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });
        }
        return this.localStream;
    }

    async connect(userName) {
        if (this.peer && this.isConnected) {
            return;
        }
        
        this.intentionalDisconnect = false;
        this.username = userName;
        const id = `voice-${userName}-${Date.now()}`;

        this.peer = new Peer(id, {
            host: 'webrtc.revenues.digital',
            port: 2096,
            secure: true,
            config: { 
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ] 
            },
            debug: 2
        });

        this.peer.on('open', async (peerId) => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connected', { id: peerId });

            const localStream = await this.getLocalStream();
            setTimeout(async () => {
                await this.discoverAndConnectToPeers(localStream);
            }, 1000);
        });

        this.peer.on('call', async (call) => {
            const localStream = await this.getLocalStream();
            call.answer(localStream);
            this.hookCall(call, call.peer);
        });

        this.peer.on('error', (err) => {
            this.isConnected = false;
            if (err.type === 'disconnected' && !this.intentionalDisconnect) {
                this.handleDisconnection();
            }
        });

        this.peer.on('disconnected', () => {
            this.isConnected = false;
            if (!this.intentionalDisconnect) {
                this.handleDisconnection();
            }
        });

        this.peer.on('close', () => {
            this.isConnected = false;
            this.emit('peer-disconnected', { peerId: id });
        });
    }

    async discoverAndConnectToPeers(localStream) {
        try {
            const response = await fetch('https://webrtc.revenues.digital:2096/peerjs/peers');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const peers = await response.json();

            const voicePeers = peers.filter(peerId => 
                peerId.startsWith('voice-') && 
                peerId !== this.peer.id &&
                !this.connections.has(peerId)
            );

            for (const peerId of voicePeers) {
                if (this.connections.has(peerId)) continue;
                
                const call = this.peer.call(peerId, localStream);
                this.hookCall(call, peerId);
            }
        } catch (error) {
            // Silent fail
        }
    }

    handleDisconnection() {
        if (this.intentionalDisconnect) {
            return;
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            
            setTimeout(() => {
                if (!this.isConnected && this.username && !this.intentionalDisconnect) {
                    this.connect(this.username);
                }
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    disconnect() {
        this.intentionalDisconnect = true;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop();
            });
            this.localStream = null;
        }
        
        this.connections.clear();
        this.emit('disconnected');
    }

    setMuted(muted) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
    }

    hookCall(call, peerId) {
        this.connections.set(peerId, call);

        call.on('stream', (remoteStream) => {
            this.emit('stream', { peerId, stream: remoteStream });
            this.emit('peer_joined', { 
                peerId, 
                username: this.extractUsernameFromPeerId(peerId)
            });
        });

        call.on('close', () => {
            this.connections.delete(peerId);
            this.emit('peer_left', { peerId });
        });

        call.on('error', () => {
            this.connections.delete(peerId);
            this.emit('peer_left', { peerId });
        });
    }

    extractUsernameFromPeerId(peerId) {
        const parts = peerId.split('-');
        if (parts.length >= 2) {
            return parts.slice(1, -1).join('-');
        }
        return peerId.replace('voice-', '');
    }

    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    removeEventListener(event, callback) {
        this.listeners.get(event)?.delete(callback);
    }

    emit(event, payload) {
        this.listeners.get(event)?.forEach(cb => {
            cb(payload);
        });
    }
}

window.peerService = new PeerService();