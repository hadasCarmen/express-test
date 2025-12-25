import express from "express";
import { buyTickets, createEvent, reginUser } from "./controlers.js";
const router = express.Router();

router.route("/user/register").post(reginUser);
router.route("/creator/events").post(createEvent);
router.route("/users/tickets/buy").post(buyTickets);

export default router;
