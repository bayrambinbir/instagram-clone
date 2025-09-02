import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getMesage, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.route("/send/:id").post(isAuthenticated, sendMessage);
router.route("/all/:id").get(isAuthenticated, getMesage);

export default router;
