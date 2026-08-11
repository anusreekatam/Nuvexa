import express from "express";

import {
    registerUser,
    loginUser
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, (req, res) => {
    res.json({
        message: "Protected route accessed",
        user: req.user
    });
});

export default router;