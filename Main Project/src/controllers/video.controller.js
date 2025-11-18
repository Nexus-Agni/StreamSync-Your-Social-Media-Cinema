import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
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
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}