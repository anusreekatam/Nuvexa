import express from "express";

import {
    registerUser,
    loginUser,
    getUsers
} from "../controllers/authController.js";

import {
    protect
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/register",
    registerUser
);

router.post(
    "/login",
    loginUser
);

router.get(
    "/me",
    protect,
    (req, res) => {
        res.status(200).json({
            message: "Protected route accessed",
            user: req.user
        });
    }
);

router.get(
    "/users",
    protect,
    getUsers
);

export default router;