import express from "express";

import {
    createGroup,
    getGroups,
    getGroupMessages,
    sendGroupMessage
} from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getGroups);
router.post("/", createGroup);
router.get("/:groupId/messages", getGroupMessages);
router.post("/:groupId/messages", sendGroupMessage);

export default router;
