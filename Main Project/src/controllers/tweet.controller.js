import mongoose, { isValidObjectId, Mongoose } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const createTweet = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(401, "User is not logged in");
        }
        const {content} = req.body;
        if (!content) {
            throw new ApiError(500, "Tweet content is required");
        }
        
        const tweet = await Tweet.create({
            content,
            owner: userId
        })
    
        const createdTweet = await Tweet.findOne(tweet._id);
        console.log("Created Tweet: ", createdTweet);
        if (!createdTweet) {
            throw new ApiError(500, "Something went wrong while creating the tweet")
        }
    
        return res.status(200).json(
            new ApiResponse(200, createdTweet, "Tweet Created Successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while creating tweet")
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const {userId} = req.params;
        const userTweets = await User.aggregate([
            {
                $match : {
                    _id : new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup : {
                    from : "tweets",
                    localField : "_id",
                    foreignField : "owner",
                    as : "userTweets",
                    pipeline : [
                        {
                            $project : {
                                _id : 1,
                                content : 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields : {
                    tweetCount : {
                        $size : "$userTweets"
                    }
                }
            }
            ,  {
                $project : {
                    userTweets : 1,
                    username : 1,
                    fullname : 1,
                    tweetCount : 1
                }
            }
        ])
    
        if (!userTweets || userTweets.length===0) {
            throw new ApiError(404, "User tweets not found")
        }
    
        return res.status(200).json(
            new ApiResponse(200, userTweets[0], "User tweets fetched successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while getting user tweet")
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    try {
        const {tweetId} = req.params;
        if (!tweetId) {
            throw new ApiError(404, "TweetId is required for updating the tweet")
        }
        
        const {updatedContent} = req.body;
        if (!updatedContent) {
            throw new ApiError(500, "Updated Content is required to update tweet")
        }

        const userId = req.user?._id;
        //TODO: To check if the onwer of the tweetId is this userId only before proceeding.
    
        const tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set : {
                    content : updatedContent
                }
            },
            {
                new : true
            }
        ).select('_id content owner')

        // console.log("Tweet owner: ", tweet.owner);
        // console.log("UserId: ", userId);
    //     if (tweet.owner.toString() !== userId.toString()) {
    //     throw new ApiError(403, "Forbidden: You can only update your own tweets")
    // }

        res.status(200).json(
            new ApiResponse(200, tweet, "Tweet Updated Successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while updating tweet")
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}