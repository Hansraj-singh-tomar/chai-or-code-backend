import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { varifyJWT } from "../middlewares/auth.middleware.js"

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

router.route("/login").post(loginUser)

// secured routes
router.route("/logout", post(varifyJWT, logoutUser))

// secured routes
router.route("/refresh-token", post(refreshAccessToken))

export default router