import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy='duration', sortType='asc', userId } = req.query
    /*
        Algorithm used: 
        1. Convert page, limit to numbers
        2. Build the custom filter based on the query and match with title, description
        3. Build the custom sort object based on sortBy (duration/uploadDate/viewCount) and sortType (ascending/descending) 
        4. Calculating pagination -> skip = (page - 1) * limit
        5. Querying the db by chaining find(filter), sort(), skip(), limit()
    */
    
    try {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skipAmount = (pageNumber - 1) * limitNumber;

        let customSearchFilter = {}

        if (userId) {
            customSearchFilter.owner = userId;
        }
        if (query) {
            customSearchFilter.$or = [
                {title : {$regex: query, $options: 'i'}},
                {description : {$regex: query, $options: 'i'}}
            ]
        }

        if (sortBy!=='duration' && sortBy!=='uploadDate' &&sortBy!=='viewCount') {
            throw new ApiError(400, "Invalid sortby option")
        }

        if (sortType!=='asc' && sortType!=='desc') {
            throw new ApiError(400, "Invalid sorttype option")
        }

        let customSortingOptions = {}
        if (sortType==='asc') {
            if (sortBy==='duration'){
                customSortingOptions.duration = 1;
            } else if (sortBy==='viewCount') {
                customSortingOptions.views = 1;
            } else {
                customSortingOptions.updatedAt = 1;
            }
        } else {
            if (sortBy==='duration'){
                customSortingOptions.duration = -1;
            } else if (sortBy==='viewCount') {
                customSortingOptions.views = -1;
            } else {
                customSortingOptions.updatedAt = -1;
            }
        }


        const allVideos = await Video.find(customSearchFilter).sort(customSortingOptions).skip(skipAmount).limit(limitNumber)

        res.status(200).json(
            new ApiResponse(200, allVideos, "Videos fetched successfully")
        )

    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while fetching the videos")
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description} = req.body
        if (!title?.trim()) {
            throw new ApiError(500, "Title is required");
        }
        if (!description?.trim()) {
            throw new ApiError(500, "Description is required");
        }
    
        let videoFileLocalPath;
        if (req.files && req.files.videoFile && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0 ) {
            videoFileLocalPath = req.files.videoFile[0].path;
        }
    
        let thumbnailLocalPath;
        if (req.files && req.files.thumbnail && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
            thumbnailLocalPath = req.files.thumbnail[0].path;
        }
    
        if (!videoFileLocalPath) {
            throw new ApiError(500, "Video file is required");
        }
        if (!thumbnailLocalPath) {
            throw new ApiError(500, "Thumbnail is required");
        }
    
        const videoFile = await uploadOnCloudinary(videoFileLocalPath, "video");
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    
        if (!videoFile) {
            throw new ApiError(500, "Something went wrong while uploading videoFile on cloudinary")
        }
        if (!thumbnail) {
            throw new ApiError(500, "Something went wrong while uploading thumbnail on cloudinary")
        }

        const duration = videoFile.duration || 0;
    
        const owner = req.user?._id;
    
        const video = await Video.create({
            videoFile : videoFile.url,
            thumbnail : thumbnail.url,
            title,
            description,
            duration : Math.round(duration),
            owner
        })
    
        const createdVideo = await Video.findById(video._id);
        if (!createdVideo) {
            throw new ApiError(500, "Something went wrong while saving video on DB")
        }
    
        return res.status(200).json(
            new ApiResponse(200, createdVideo, "Video published successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500 , error.message || "Something went wrong while publishing the video")
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        if (!videoId || !mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "VideoId is required");
        }
    
        const video = await Video.aggregate([
            {
                $match : {
                    _id : new mongoose.Types.ObjectId(videoId)
                }
            }, {
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
                $addFields: {
                    owner: { $first: "$owner" } 
                }
            },{
                $project : {
                    createdAt : 0,
                    updatedAt : 0,
                    __v : 0
                }
            }
        ])
    
        if (!video) {
            throw new ApiError(404, "Video not found from DB");
        }
    
        res.status(200).json(
            new ApiResponse(200, video[0], "Video fetched successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while fetching video")
    }
})

const updateVideo = asyncHandler(async (req, res) => {
try {
        const { videoId } = req.params
        if (!videoId || !mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "VideoId is required");
        }
    
        const {title, description} = req.body;
        const thumbnail = req.file;

        if (!title && !description && !thumbnail) {
            throw new ApiError(400, "At least one field among title, description, thumbnail is required");
        }
    
        const userId = req.user?._id; 
    
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found from DB");
        }
        if (video.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "Forbidden: You can only update your own videos");
        }

        const updateFields = {};
    
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;

        if (thumbnail) {
            const thumbnailLocalPath = thumbnail.path;

            if (!thumbnailLocalPath) {
                throw new ApiError(500, "Thumbnail image is required to update thumbnail");
            }

            const thumbnailImage = await uploadOnCloudinary(thumbnailLocalPath);
            if (!thumbnailImage) {
                throw new ApiError(500, "Something went wrong while uploading thumbnail on cloudinary")
            }

            const oldThumbnailUrl = video.thumbnail?.split("/").pop()?.split(".")[0];
            if (oldThumbnailUrl) {
                await deleteFromCloudinary(oldThumbnailUrl);
            }

            updateFields.thumbnail = thumbnailImage.url;
        }
    
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set : updateFields
            },
            {new : true}
        ).select('-createdAt -updatedAt -__v');
    
        res.status(200).json(
            new ApiResponse(200, updatedVideo, "Video updated successfully")
        )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while updating video")
}
})

const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        if (!videoId || !mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "VideoId is required");
        }
    
        const userId = req.user?._id; 
    
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found from DB");
        }
        if (video.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "Forbidden: You can only update your own videos");
        }

        const videoUrl = video.videoFile?.split("/").pop()?.split(".")[0];
        const thumbnailUrl = video.thumbnail?.split("/").pop()?.split(".")[0];

        await deleteFromCloudinary(videoUrl, "video");
        await deleteFromCloudinary(thumbnailUrl);
    
        const deletedVideo = await Video.findByIdAndDelete(videoId).select("-createdAt -updatedAt -__v");
    
        return res.status(200).json(
            new ApiResponse(200, deletedVideo, "Video deleted Successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while deleting the video")
    }

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        if (!videoId || !mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "VideoId is required");
        }
    
        const userId = req.user?._id; 
        
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found from DB");
        }
        if (video.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "Forbidden: You can only update your own videos");
        }
    
        const prevPublishedStatus = video.isPublished;
    
        const updatedVideo = await Video.findByIdAndUpdate(videoId, {
            isPublished : !prevPublishedStatus
        }, {new : true});
    
        res.status(200).json(
            new ApiResponse(200, {isPublished : updatedVideo.isPublished}, "Published status updated successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while updating published status")
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}