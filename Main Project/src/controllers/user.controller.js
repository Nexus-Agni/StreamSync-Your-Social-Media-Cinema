import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const getRefreshAndAccessToken = async (userId)=> {
    try {
        const user = await User.findById(userId)
        // console.log("User : ", user);
        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        console.log("Acess Token: ", accessToken);
        console.log("Refresh Token: ", refreshToken);
        
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
    
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        console.log("Error: ", error);
        
        throw new ApiError(500, "Something went wrong during generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async (req, res)=>{
    //steps 
    // Take user data like username, email from frontend
    // Validate the inputs
    // check if user already exists
    // check for images, check for avatar
    // upload them to cloudinary
    // create user object - store it in mongodb
    // remove password and refresh token field from the resoponse
    // if response exists return res

    const {username, fullname, email, password} = req.body
    
    //checking for empty inputs
    if (username === " ") {
        throw new ApiError(500, "Username is required")
    } 
    if (fullname === " ") {
        throw new ApiError(500, "Fullname is required")
    }
    if (email === " ") {
        throw new ApiError(500, "Email is required")
    }
    if (password === " ") {
        throw new ApiError(500, "Password is required")
    }

    //checking for valid email adress
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(500, "Invalid email address");
    }

    // checking for valid password
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/gm
    if (!passwordRegex.test(password)) {
        throw new ApiError(500, "Password should contain Uppercase, lowercase, numbers, special charecterrs and should be at least 8 char long")
    }

    //checking if user already exists
    const existedUser = await User.findOne({
        $or : [{email}, {username}]
    })
    if (existedUser) {
        throw new ApiError(509, "User already exists")
    }

    //
    // const avatarLocalPath =  req.files?.avatar[0].path;
    // // const coverImageLocalPath = req.files?.coverImage[0].path;
    // console.log(req.files);
    // console.log(avatarLocalPath);
    let avatarLocalPath;
    if (req.files && req.files.avatar && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.avatar[0].path;
    }

    // let coverImageLocalPath;
    //     if (req.files && req.files.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }   


    if (!avatarLocalPath) {
        throw new ApiError(500, "Avatar is required")
    }

    //upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Avatar is required")
    }

    //Creating a user
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || " ",
        username : username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})

const loginUser = asyncHandler(async (req, res)=>{
    // take data from res.body
    // take username or email from the user
    // check whether user is present or not
    // if not present -> throw error
    // if present -> take input for password
    // check the password
    // if incorrect -> throw error
    // if correct -> generate and send request and access token via cookies

    try {
        const {username, password, email} = req.body
        console.log(username, password, email);
    
        if (!username && !email) {
            throw new ApiError(500, "Either username or email is required")
        }
    
        const user = await User.findOne({
            $or : [{username}, {email}]
        })
        console.log(user);
        if (!user) {
            throw new ApiError(404, "User does not exist")
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password)
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid login credentials")
        }
    
        const {accessToken , refreshToken } = await getRefreshAndAccessToken(user._id)

        user.isLoggedIn = true;
        user.save();
    
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken ")
        
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user : loggedInUser, accessToken, refreshToken //FIXME: Should be removed from response
                },
                "Successfully logged In "
            )
        )
    } catch (error) {
        throw new ApiError(500, "Something went wrong during Logging in user.")
    }

})

const logoutUser =asyncHandler(async (req, res)=>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : {
                refreshToken : 1,
            }, 
            isLoggedIn : false
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    res.status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res, next)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
            const user = await User.findById(decodedToken?._id)
        
            if (!user) {
                throw new ApiError(401, "Invalid refresh token")
            }
        
            //matching incoming refresh token with token of database
            if (decodedToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used")
            }
        
            const options = {
                httpOnly : true,
                secure : true
            }
        
            const {accessToken, newRefreshToken} = await getRefreshAndAccessToken(user._id)
        
            res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                200,
                {accessToken, refreshToken : newRefreshToken},
                "Access Token refreshed successfully"
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res, next)=>{
try {
        const {oldPassword, newPassword} = req.body
    
        const user = await User.findById(req.user?._id)
    
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Incorrect old password")
        }
    
        user.password = newPassword
        await user.save({validateBeforeSave : false})
    
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Password updated successfully"))
} catch (error) {
    throw new ApiError(401, error?.message || "Password update failed")
}
})

const getCurrentUser = asyncHandler (async (req, res, next)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res, next)=>{
try {
        const {fullname,email} = req.body
    
        if (!fullname || !email) {
            throw new ApiError(400, "Fullname and email fields are required")
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set : {
                    fullname, email
                }
            },
            {new : true}
        ).select("-password")
    
        return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
} catch (error) {
    throw new ApiError(401, error?.message || "Account details update failed")
}

})

const updateUserAvatar = asyncHandler (async (req, res, next)=>{
try {
        const avatarLocalPath = req.file?.path
    
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required")
        }
    
        const avatar = uploadOnCloudinary(avatarLocalPath)
    
        const oldAvatarPublicId = req.user?.avatar?.split("/").pop()?.split(".")[0]
    
        if (!avatar.url) {
            throw new ApiError(400, "Error while uploading avatar on cloudinary")
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id, 
            {
                $set : {avatar: avatar.url}
            },
            {new: true}
        ).select("-password")
    
        await deleteFromCloudinary(oldAvatarPublicId)
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Avatar updated successfully"
        ))
} catch (error) {
    throw new ApiError(401, error?.message || "Avatar update failed")
}
})

const updateUserCoverImage = asyncHandler (async (req, res, next)=>{
try {
        const coverImageLocalPath = req.file?.path
        if (!coverImageLocalPath) {
            throw new ApiError(400, "Cover Image is required")
        }
    
        const coverImage = uploadOnCloudinary(coverImageLocalPath)
        if (!coverImage) {
            throw new ApiError(400, "Error while uploading cover image on cloudinary")
        }
    
        const oldCoverImagePublicId = req.user?.coverImage?.split("/").pop()?.split(".")[0]
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set : {
                    coverImage : coverImage.url
                }
            },
            {new : true}
        ).select("-password")
    
        await deleteFromCloudinary(oldCoverImagePublicId)
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Cover image updated successfully"
        ))
} catch (error) {
    throw new ApiError(401, error?.message || "Cover image update failed")
}
})

const getUserChannelProfile = asyncHandler(async (req, res, next)=>{
    const {username} = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },{
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        }, {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"                
            }
        }, {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelsSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if : {$in : [req.user?._id, "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project : {
                fullname : 1,
                username : 1,
                avatar : 1,
                subscribersCount : 1,
                channelsSubscribedToCount : 1,
                isSubscribed : 1,
                coverImage : 1,
                email : 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0]), "User channel fetched successfully")
})

const getUserWatchHistory = asyncHandler(async (req, res, next) => {
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        }, {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        username : 1,
                                        fullname : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    }, 
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "watch history fetched successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateAccountDetails,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserWatchHistory
}