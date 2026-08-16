class OnlineUsers {
    private users =
        new Map<string, Set<string>>();

    add(
        userId: string,
        socketId: string
    ) {
        const sockets =
            this.users.get(userId) ??
            new Set<string>();

        sockets.add(socketId);

        this.users.set(
            userId,
            sockets
        );
    }

    remove(socketId: string) {
        for (const [
            userId,
            sockets,
        ] of this.users.entries()) {
            if (sockets.has(socketId)) {
                sockets.delete(socketId);

                if (sockets.size === 0) {
                    this.users.delete(
                        userId
                    );
                }

                return userId;
            }
        }

        return undefined;
    }

    isOnline(userId: string) {
        return this.users.has(userId);
    }

    getSocketId(
        userId: string
    ) {
        const sockets =
            this.users.get(userId);

        if (!sockets) {
            return undefined;
        }

        return sockets.values().next()
            .value;
    }

    getSocketIds(
        userId: string
    ) {
        return [
            ...(this.users.get(
                userId
            ) ?? []),
        ];
    }

    getAll() {
        return [
            ...this.users.keys(),
        ];
    }
}

export default new OnlineUsers();