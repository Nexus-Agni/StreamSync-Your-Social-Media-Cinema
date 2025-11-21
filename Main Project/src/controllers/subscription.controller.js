import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    try {
        const {channelId} = req.params
        if (!channelId || !isValidObjectId(channelId)) {
            throw new ApiError(400, "Valid ChannelId is required")
        }
    
        const userId = req.user?._id;
    
        const isChannelSubscribedByUser = await Subscription.findOne({
            channel : channelId,
            subscriber : userId
        })
    
        if (isChannelSubscribedByUser) {
            const deletedSubscription = await Subscription.findByIdAndDelete(isChannelSubscribedByUser?._id).select("subscriber channel _id")
    
            res.status(200).json(
                new ApiResponse(200, {
                    isSubscribed : false,
                    deletedSubscription
                },
                "Unsubscribed successfully")
            )
        } else {
            const newSubscription = await Subscription.create({
                channel : channelId,
                subscriber : userId
            })
    
            const createdSubscription = await Subscription.findById(newSubscription._id).select("channel subscriber _id")
    
            res.status(200).json(
                new ApiResponse(200, {
                    isSubscribed : true,
                    createdSubscription
                }, "Subscribed successfully")
            )
        }
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while toggling subscription")
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        const {channelId} = req.params;
        if (!channelId || !isValidObjectId(channelId)) {
            throw new ApiError(400, "Valid ChannelId is required")
        }

        const userId = req.user?._id;
        if (userId.toString() !== channelId.toString()) {
            throw new ApiError(403, "Forbidden: You can only get subscriber list of your own channel")
        }
    
        const subscriberList = await Subscription.aggregate([
            {
                $match : {
                    channel : new mongoose.Types.ObjectId(channelId)
                }
            }, {
                $lookup : {
                    from : "users",
                    localField : "subscriber",
                    foreignField : "_id",
                    as : "subscriberInfo", 
                    pipeline : [
                        {
                            $project : {
                                _id : 1,
                                username : 1,
                                fullname : 1,
                                avatar : 1
                            }
                        }
                    ]
                }, 
            }, {
                $unwind : "$subscriberInfo"
            },  {
                $project : {
                    _id : 1,
                    subscriber : 1,
                    channel : 1,
                    subscriberInfo : "$subscriberInfo"
                }
            }
        ])
    
        if (!subscriberList) {
            throw new ApiError(500, "Unable find to find subscriber list")
        }

        const subscriberCount = subscriberList.length;
    
        res.status(200).json(
            new ApiResponse(200, {
                subscriberCount,
                subscriberList
            }, "Subscriber list fetched successfully" )
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while fetching subscriber list")
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
try {
    const { subscriberId } = req.params
    if (!subscriberId || !isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Valid SubscriberId is required")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        }, {
            $lookup : {
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as : "channelInfo", 
                pipeline : [
                    {
                        $project : {
                            _id : 1,
                            username : 1,
                            fullname : 1,
                            avatar : 1
                        }
                    }
                ]
            }, 
        }, {
            $unwind : "$channelInfo"
        },  {
            $project : {
                _id : 1,
                subscriber : 1,
                channel : 1,
                channelInfo : "$channelInfo"
            }
        }
    ])

    if (!subscribedChannels) {
        throw new ApiError(500, "Unable find to find subscriber list")
    }

    const channelCount = subscribedChannels.length;

    res.status(200).json(
        new ApiResponse(200, {
            channelCount,
            subscribedChannels
        }, "Subscribed channels fetched successfully" )
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while fetching subscribed channels")
}
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}