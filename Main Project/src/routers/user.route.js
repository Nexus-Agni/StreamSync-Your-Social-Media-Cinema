import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getUserWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route('/register').post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        }, 
        {
            name : "coverImage",
            maxCount : 1
        }
    ]) ,
    registerUser)

userRouter.route('/login').post(loginUser)

//secured routes
userRouter.route('/logout').post(verifyJWT,logoutUser)
userRouter.route('/refresh-access-token').post(verifyJWT, refreshAccessToken)
userRouter.route('/change-password').post(verifyJWT, changeCurrentPassword)

//get methods
userRouter.route('/currentUser').get(verifyJWT, getCurrentUser)
userRouter.route('/history').get(verifyJWT, getUserWatchHistory)

//patch routes (updates)
userRouter.route('/update-account').patch(verifyJWT, updateAccountDetails)
userRouter.route('/update-avatar').patch(verifyJWT, upload.single("coverImage"), updateUserAvatar)
userRouter.route('/update-coverImage').patch(verifyJWT, upload.single("avatar"), updateUserCoverImage)

//from params
userRouter.route('/c/:username').get(verifyJWT, getUserChannelProfile)



export default userRouter;