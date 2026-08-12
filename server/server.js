import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

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

const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log(
        "User connected:",
        socket.id
    );

    socket.on("join_user", (userId) => {
        socket.data.userId = userId;

        socket.join(`user_${userId}`);

        onlineUsers.set(
            userId,
            socket.id
        );

        io.emit(
            "online_users",
            Array.from(onlineUsers.keys())
        );

        console.log(
            `User ${userId} is online`
        );
    });

    socket.on("send_message", (message) => {
        io.to(
            `user_${message.receiverId}`
        ).emit(
            "receive_message",
            message
        );
    });

    socket.on("disconnect", () => {
        const userId =
            socket.data.userId;

        if (
            userId &&
            onlineUsers.get(userId) ===
                socket.id
        ) {
            onlineUsers.delete(userId);
        }

        io.emit(
            "online_users",
            Array.from(onlineUsers.keys())
        );

        console.log(
            `User ${userId} is offline`
        );
    });
});

const PORT =
    process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});