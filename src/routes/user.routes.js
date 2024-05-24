import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

// http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/users/login

router.route("/register").post(
    // multiple files associates with the given form fields.
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        },
    ]),
    registerUser
)


export default router