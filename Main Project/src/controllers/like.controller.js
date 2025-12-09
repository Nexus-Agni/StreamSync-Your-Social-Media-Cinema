import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const {videoId} = req.params
        if (!videoId || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Valid VideoId is required");
        }
        const userId = req.user?._id;
    
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found from DB");
        }
    
        const prevLikedStatus = await Like.findOne({
            video : videoId,
            likedBy : userId
        }).select("-createdAt -updatedAt -__v")
    
        if (prevLikedStatus) {
            await Like.findByIdAndDelete(prevLikedStatus._id)
            res.status(200).json(
                new ApiResponse(200, {isLiked : false, deletedLike : prevLikedStatus}, "Video unliked successfully")
            )
        } else {
            const newLike = await Like.create({
                video : videoId,
                likedBy : userId
            })
            const likeCreated = await Like.findById(newLike._id).select("-createdAt -updatedAt -__v")
            res.status(200).json(
                new ApiResponse(200, {isLiked : true, likeCreated}, "Video liked successfully")
            )
        }
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while liking video") 
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
try {
    const {commentId} = req.params
    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Valid CommentId is required");
    }

    const userId = req.user?._id;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found from DB");
    }
    
    const prevLikedStatus = await Like.findOne({
        comment : commentId,
        likedBy : userId
    }).select("-createdAt -updatedAt -__v")
    
    if (prevLikedStatus) {
        await Like.findByIdAndDelete(prevLikedStatus._id)
        res.status(200).json(
            new ApiResponse(200, {isLiked : false, deletedLike : prevLikedStatus}, "Comment unliked successfully")
        )
    } else {
        const newLike = await Like.create({
            comment : commentId,
            likedBy : userId
        })
        const likeCreated = await Like.findById(newLike._id).select("-createdAt -updatedAt -__v")
        res.status(200).json(
            new ApiResponse(200, {isLiked : true, likeCreated}, "Comment liked successfully")
        )
    }
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while liking comment")
}
})

const toggleTweetLike = asyncHandler(async (req, res) => {
try {
    const {tweetId} = req.params
    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Valid TweetId is required");
    }
    
    const userId = req.user?._id;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found from DB");
    }
    
    const prevLikedStatus = await Like.findOne({
        tweet : tweetId,
        likedBy : userId
    }).select("-createdAt -updatedAt -__v")
    
    if (prevLikedStatus) {
        await Like.findByIdAndDelete(prevLikedStatus._id)
        res.status(200).json(
            new ApiResponse(200, {isLiked : false, deletedLike : prevLikedStatus}, "Tweet unliked successfully")
        )
    } else {
        const newLike = await Like.create({
            tweet : tweetId,
            likedBy : userId
        })
        const likeCreated = await Like.findById(newLike._id).select("-createdAt -updatedAt -__v")
        res.status(200).json(
            new ApiResponse(200, {isLiked : true, likeCreated}, "Tweet liked successfully")
        )
    }
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while liking tweet")
}
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
try {
    const userId = req.user?._id;
    const likedVideos = await Like.aggregate([
        {
            $match : {
                likedBy : new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null }
            }
        }, {
            $lookup : {
                from : "videos",
                foreignField : "_id",
                localField : "video",
                as : "videoDetails", 
                pipeline : [
                    {
                        $project : {
                            owner : 0,
                            __v : 0,
                            createdAt : 0,
                            updatedAt : 0,
                            _id : 0    
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$videoDetails"
        },{
            $project : {
                __v : 0,
                createdAt : 0,
                updatedAt : 0,
                likedBy : 0 
            }
        }
    ])
    res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while getting liked videos")
}
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}