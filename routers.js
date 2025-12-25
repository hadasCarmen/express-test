import express from "express";
import {
  buyTickets,
  createEvent,
  reginUser,
  ticketOneUser,
} from "./controlers.js";
const router = express.Router();

router.route("/user/register").post(reginUser);
router.route("/creator/events").post(createEvent);
router.route("/users/tickets/buy").post(buyTickets);
router.route("/users/:username/summary").get(ticketOneUser);

export default router;
