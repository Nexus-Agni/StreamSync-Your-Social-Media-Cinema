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
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}