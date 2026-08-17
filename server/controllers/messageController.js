import prisma from "../config/prisma.js";

export async function sendMessage(req, res) {
    try {
        const senderId = req.user.id;
        const { receiverId, text } = req.body;

        if (!receiverId || !text?.trim()) {
            return res.status(400).json({
                message: "Receiver and message are required"
            });
        }

        const message = await prisma.message.create({
            data: {
                text: text.trim(),
                senderId,
                receiverId
            }
        });

        return res.status(201).json(message);
    } catch (error) {
        console.error("Send message error:", error);

        return res.status(500).json({
            message: "Unable to send message"
        });
    }
}

export async function getMessages(req, res) {
    try {
        const currentUserId = req.user.id;
        const otherUserId = Number(req.params.userId);

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        senderId: currentUserId,
                        receiverId: otherUserId
                    },
                    {
                        senderId: otherUserId,
                        receiverId: currentUserId
                    }
                ]
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        return res.status(200).json(messages);
    } catch (error) {
        console.error("Get messages error:", error);

        return res.status(500).json({
            message: "Unable to fetch messages"
        });
    }
}

export async function markMessagesRead(req, res) {
    try {
        const receiverId = req.user.id;
        const senderId = Number(req.params.senderId);

        if (!Number.isInteger(senderId)) {
            return res.status(400).json({
                message: "Invalid sender"
            });
        }

        const unreadMessages = await prisma.message.findMany({
            where: {
                senderId,
                receiverId,
                isRead: false
            },
            select: {
                id: true
            }
        });

        if (unreadMessages.length === 0) {
            return res.status(200).json({
                messageIds: [],
                readAt: null
            });
        }

        const messageIds = unreadMessages.map(
            (message) => message.id
        );
        const readAt = new Date();

        await prisma.message.updateMany({
            where: {
                id: {
                    in: messageIds
                },
                receiverId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt
            }
        });

        req.app.get("io")
            .to(`user_${senderId}`)
            .emit("messages_read", {
                messageIds,
                readerId: receiverId,
                readAt
            });

        return res.status(200).json({
            messageIds,
            readAt
        });
    } catch (error) {
        console.error("Mark messages read error:", error);

        return res.status(500).json({
            message: "Unable to mark messages as read"
        });
    }
}
