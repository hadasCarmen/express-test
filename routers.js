import express from "express";
import{
    reginUser
} from "./controlers.js"
const router = express.Router();

router.route("/user/register").post(reginUser)





export default router;
