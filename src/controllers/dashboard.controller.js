import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const getChannelStats = asyncHandler(async (req, res) => {
try {
    const channelId = req.user?._id;
    const totalVideos = await Video.countDocuments({owner : channelId});
    const totalSubscribers = await Subscription.countDocuments({channel : channelId});
    const totalLikes = await Like.countDocuments({video : {$in : await Video.find({owner : channelId})}});
    const totalViews = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group : {
                _id : null,
                count : {
                    $sum : "$views"
                }
            }
        }, {
            $project : {
                _id : 0,
                count : 1
            }
        }
    ])

    res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalSubscribers,
            totalLikes,
            totalViews
        }, "Channel stats fetched successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while getting channel stats")
}
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
try {
    const channelId = req.user?._id;
    const videos = await Video.find({owner : channelId}).select("-owner -createdAt -updatedAt -__v")
    res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while getting channel videos")
}
})

export {
    getChannelStats, 
    getChannelVideos
    }