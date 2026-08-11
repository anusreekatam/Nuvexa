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