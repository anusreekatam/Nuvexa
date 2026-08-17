import express from "express";

import {
    sendMessage,
    getMessages,
    markMessagesRead
} from "../controllers/messageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.patch("/read/:senderId", protect, markMessagesRead);
router.get("/:userId", protect, getMessages);

export default router;
