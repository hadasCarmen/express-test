import express from "express";
import {
  buyTickets,
  createEvent,
  reginUser,
  ticketOneUser,
  transferTickets,
} from "./controlers.js";
const router = express.Router();

router.route("/user/register").post(reginUser);
router.route("/creator/events").post(createEvent);
router.route("/users/tickets/buy").post(buyTickets);
router.route("/users/tickets/transfer").put(transferTickets);
router.route("/users/:username/summary").get(ticketOneUser);

export default router;
