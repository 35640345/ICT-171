class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (!this.socket) {
            this.socket = io('https://ws.revenues.digital:2087', {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
            });

            this.socket.on('initial_data', (data) => {
                this.notifyListeners('initial_data', data);
            });

            this.socket.on('revenue_update', (data) => {
                this.notifyListeners('revenue_update', data);
            });

            this.socket.on('connection_update', (data) => {
                this.notifyListeners('connection_update', data);
            });

            this.socket.on('stats', (data) => {
                this.notifyListeners('stats', data);
            });
        }

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event, ...args) {
        if (!this.socket?.connected) {
            return;
        }
        this.socket.emit(event, ...args);
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

    notifyListeners(event, data) {
        this.listeners.get(event)?.forEach(cb => cb(data));
    }
}

window.socketService = new SocketService();