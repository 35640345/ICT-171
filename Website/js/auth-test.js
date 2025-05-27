const DEFAULT_PASSWORD = 'test';

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.username = '';
    }

    login(username, password) {
        if (password === DEFAULT_PASSWORD) {
            this.isAuthenticated = true;
            this.username = username;
            return true;
        }
        return false;
    }

    logout() {
        this.isAuthenticated = false;
        this.username = '';
    }

    getUsername() {
        return this.username;
    }

    getIsAuthenticated() {
        return this.isAuthenticated;
    }
}

window.authManager = new AuthManager();
