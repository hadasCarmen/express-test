import express from "express";
import{
    createEvent,
    reginUser
} from "./controlers.js"
const router = express.Router();

router.route("/user/register").post(reginUser)
router.route("/creator/events").post(createEvent)





export default router;
