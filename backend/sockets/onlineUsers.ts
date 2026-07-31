class OnlineUsers {
    private users = new Map<string, string>();

    add(userId: string, socketId: string) {
        this.users.set(userId, socketId);
    }

    remove(socketId: string) {
        for (const [userId, id] of this.users.entries()) {
            if (id === socketId) {
                this.users.delete(userId);
                break;
            }
        }
    }

    isOnline(userId: string) {
        return this.users.has(userId);
    }

    getSocketId(userId: string) {
        return this.users.get(userId);
    }

    getAll() {
        return [...this.users.keys()];
    }
}

export default new OnlineUsers();