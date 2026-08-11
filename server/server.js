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

io.on("connection", (socket) => {
    console.log(
        "User connected:",
        socket.id
    );

    socket.on("join_user", (userId) => {
        socket.join(`user_${userId}`);

        console.log(
            `User ${userId} joined room user_${userId}`
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
        console.log(
            "User disconnected:",
            socket.id
        );
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});