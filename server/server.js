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
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

app.use(
    cors({
        origin: "http://localhost:5173"
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

io.on("connection", (socket) => {
    console.log(
        "User connected:",
        socket.id
    );

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

                onlineUsers.set(
                    Number(decoded.id),
                    socket.id
                );

                io.emit(
                    "online_users",
                    Array.from(
                        onlineUsers.keys()
                    )
                );

                console.log(
                    `User ${decoded.id} is online`
                );
            } catch {
                socket.emit("authentication_error", {
                    message: "Invalid or expired token"
                });
            }
        }
    );

    socket.on(
        "send_message",
        (message) => {
            io.to(
                `user_${message.receiverId}`
            ).emit(
                "receive_message",
                message
            );
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
        async (message) => {
            try {
                const groupId = Number(message.groupId);
                const userId = Number(socket.data.userId);

                if (
                    !Number.isInteger(groupId) ||
                    !Number.isInteger(userId) ||
                    Number(message.senderId) !== userId
                ) {
                    return;
                }

                const membership =
                    await prisma.groupMember.findUnique({
                        where: {
                            groupId_userId: {
                                groupId,
                                userId
                            }
                        }
                    });

                if (membership) {
                    socket.to(
                        `group_${groupId}`
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
            console.log(
                `User ${senderId} typing to ${receiverId}`
            );

            io.to(
                `user_${receiverId}`
            ).emit(
                "user_typing",
                {
                    senderId
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
            console.log(
                `User ${senderId} stopped typing to ${receiverId}`
            );

            io.to(
                `user_${receiverId}`
            ).emit(
                "user_stop_typing",
                {
                    senderId
                }
            );
        }
    );

    socket.on(
        "disconnect",
        () => {
            const userId =
                socket.data.userId;

            if (
                userId &&
                onlineUsers.get(
                    userId
                ) === socket.id
            ) {
                onlineUsers.delete(
                    userId
                );
            }

            io.emit(
                "online_users",
                Array.from(
                    onlineUsers.keys()
                )
            );

            console.log(
                `User ${userId} is offline`
            );
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
