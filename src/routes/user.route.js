import { Router } from "express";
import { logoutUser, loginUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetail, updateUserAvatar, updateUsercoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
 import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), 
    registerUser)

    router.route("/login").post(loginUser)

    // secure Routes 

    router.route("/logout").post(verifyJWT, logoutUser)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-password").post(verifyJWT,changeCurrentPassword)
    router.route("/current-user").post(verifyJWT, getCurrentUser)
    router.route("/update-account").patch(verifyJWT, updateAccountDetail)
    router.route("/avatar").patch(verifyJWT, upload.single("avatar"),updateUserAvatar)
    router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUsercoverImage)
    router.route("/c/:username").get(verifyJWT, getUserChannelProfile) // If you can get data in Url then used this method
    router.route("/history").get(verifyJWT, getWatchHistory)

export default router;