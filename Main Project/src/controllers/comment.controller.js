import mongoose from "mongoose"
import {Comment} from "../models/comments.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const getVideoComments = asyncHandler(async (req, res) => {
try {
    const {videoId} = req.params
    const {page = 1, limit = 2} = req.query
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid VideoId is required");
    }
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skipAmount = (pageNumber - 1) * limitNumber;

    const allComments = await Comment.find({video : videoId}).sort({createdAt : -1}).skip(skipAmount).limit(limitNumber)
    res.status(200).json(
        new ApiResponse(200, allComments, "Comments fetched successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while fetching comments")
}
})

const addComment = asyncHandler(async (req, res) => {
try {
    const {videoId} = req.params
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid VideoId is required");
    }
    const userId = req.user?._id;
    const {content} = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required to add a comment");
    }
    const newComment = await Comment.create({
        video : videoId,
        owner : userId,
        content
    })

    const createdComment = await Comment.findById(newComment._id).select("-createdAt -updatedAt -__v")
    res.status(200).json(
        new ApiResponse(200, createdComment, "Comment added successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while adding a comment")
}
})

const updateComment = asyncHandler(async (req, res) => {
try {
    const {commentId} = req.params;
    const {updatedContent} = req.body;
    const userId = req.user?._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found from DB");
    }
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Forbidden: You can only update your own comments");
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set : {
            content : updatedContent
        }
    }, {new : true}).select("-createdAt -updatedAt -__v")
    res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while updating a comment")
}
})

const deleteComment = asyncHandler(async (req, res) => {
try {
    const {commentId} = req.params;
    const userId = req.user?._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found from DB");
    }
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Forbidden: You can only delete your own comments");
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId).select("-createdAt -updatedAt -__v")
    if (!deletedComment) {
        throw new ApiError(404, "Comment deletion failed")
    }
    res.status(200).json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while deleting a comment")
}
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }