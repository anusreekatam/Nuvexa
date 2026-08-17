import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import prisma from "./config/prisma.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin:
            process.env.CLIENT_URL ||
            "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

app.use(
    cors({
        origin:
            process.env.CLIENT_URL ||
            "http://localhost:5173"
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Nuvexa backend is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

const onlineUsers = new Map();

function emitOnlineUsers() {
    io.emit(
        "online_users",
        Array.from(onlineUsers.keys())
    );
}

io.on("connection", (socket) => {
    socket.on(
        "join_user",
        ({ userId, token }) => {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                if (Number(decoded.id) !== Number(userId)) {
                    return;
                }

                socket.data.userId = Number(decoded.id);

                socket.join(
                    `user_${decoded.id}`
                );

                const authenticatedUserId = Number(decoded.id);
                const userSockets =
                    onlineUsers.get(authenticatedUserId) ||
                    new Set();

                userSockets.add(socket.id);
                onlineUsers.set(
                    authenticatedUserId,
                    userSockets
                );
                emitOnlineUsers();
            } catch {
                socket.emit("authentication_error", {
                    message: "Invalid or expired token"
                });
            }
        }
    );

    socket.on(
        "send_message",
        async (messageId) => {
            try {
                const senderId = Number(socket.data.userId);
                const numericMessageId = Number(messageId);

                if (
                    !Number.isInteger(senderId) ||
                    !Number.isInteger(numericMessageId)
                ) {
                    return;
                }

                const message = await prisma.message.findFirst({
                    where: {
                        id: numericMessageId,
                        senderId
                    }
                });

                if (message) {
                    io.to(
                        `user_${message.receiverId}`
                    ).emit(
                        "receive_message",
                        message
                    );
                }
            } catch (error) {
                console.error(
                    "Send direct socket message error:",
                    error
                );
            }
        }
    );

    socket.on(
        "join_group",
        async (groupId) => {
            try {
                const numericGroupId = Number(groupId);
                const userId = Number(socket.data.userId);

                if (
                    !Number.isInteger(numericGroupId) ||
                    !Number.isInteger(userId)
                ) {
                    return;
                }

                const membership =
                    await prisma.groupMember.findUnique({
                        where: {
                            groupId_userId: {
                                groupId: numericGroupId,
                                userId
                            }
                        }
                    });

                if (membership) {
                    socket.join(
                        `group_${numericGroupId}`
                    );
                }
            } catch (error) {
                console.error("Join group error:", error);
            }
        }
    );

    socket.on(
        "send_group_message",
        async (messageId) => {
            try {
                const userId = Number(socket.data.userId);
                const numericMessageId = Number(messageId);

                if (
                    !Number.isInteger(userId) ||
                    !Number.isInteger(numericMessageId)
                ) {
                    return;
                }

                const message =
                    await prisma.groupMessage.findFirst({
                        where: {
                            id: numericMessageId,
                            senderId: userId,
                            group: {
                                memberships: {
                                    some: {
                                        userId
                                    }
                                }
                            }
                        },
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    });

                if (message) {
                    socket.to(
                        `group_${message.groupId}`
                    ).emit(
                        "receive_group_message",
                        message
                    );
                }
            } catch (error) {
                console.error(
                    "Send group socket message error:",
                    error
                );
            }
        }
    );

    socket.on(
        "typing",
        ({
            senderId,
            receiverId
        }) => {
            const authenticatedSenderId =
                Number(socket.data.userId);

            if (
                !Number.isInteger(authenticatedSenderId) ||
                Number(senderId) !== authenticatedSenderId
            ) {
                return;
            }

            io.to(
                `user_${receiverId}`
            ).emit(
                "user_typing",
                {
                    senderId: authenticatedSenderId
                }
            );
        }
    );

    socket.on(
        "stop_typing",
        ({
            senderId,
            receiverId
        }) => {
            const authenticatedSenderId =
                Number(socket.data.userId);

            if (
                !Number.isInteger(authenticatedSenderId) ||
                Number(senderId) !== authenticatedSenderId
            ) {
                return;
            }

            io.to(
                `user_${receiverId}`
            ).emit(
                "user_stop_typing",
                {
                    senderId: authenticatedSenderId
                }
            );
        }
    );

    socket.on(
        "disconnect",
        () => {
            const userId =
                socket.data.userId;

            const userSockets = onlineUsers.get(userId);

            if (userSockets) {
                userSockets.delete(socket.id);

                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                }
            }

            emitOnlineUsers();
        }
    );
});

const PORT =
    process.env.PORT || 5000;

server.listen(
    PORT,
    () => {
        console.log(
            `Server running on port ${PORT}`
        );
    }
);
