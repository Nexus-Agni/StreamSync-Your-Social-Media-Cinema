import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
try {
    const {name, description} = req.body
    if (!name || !description) {
        throw new ApiError(400, "Name and Description is required to create a playlist");
    }

    const userId = req.user?._id;

    const newPlaylist = await Playlist.create({
        name,
        description,
        owner : userId
    })

    const createdPlaylist = await Playlist.findById(newPlaylist._id).select("name description videos");
    if (!createdPlaylist) {
        throw new ApiError(404, "Unable to create playlist");
    }

    res.status(200).json(
        new ApiResponse(200, createdPlaylist, "Playlist created successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while creating playlist")
}
})

const getUserPlaylists = asyncHandler(async (req, res) => {
try {
    const {userId} = req.params
    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Valid userId is required")
    }

    const playlists = await Playlist.find({
        owner : userId
    }).select("-owner -createdAt -updatedAt -__v")
    if (!playlists) {
        throw new ApiError(404, "Playlists of the given user does not exist")
    }

    res.status(200).json(
        new ApiResponse(200, playlists, "Playlists found successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while getting user playlists")
}
})

const getPlaylistById = asyncHandler(async (req, res) => {
try {
    const {playlistId} = req.params
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Valid playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId).select("-owner -createdAt -updatedAt -__v")
    if (!playlist) {
        throw new ApiError(404, "Playlist does not exist")
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist found successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while getting playlist")
}
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
try {
    const {playlistId, videoId} = req.params
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Valid playlist id is required")
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid video id is required")
    }

    const userId = req.user?._id;
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist does not exist")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video does not exist")
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Forbidden: You can only update your own playlists")
    }

    playlist.videos.forEach((video) => {
        if (video.toString() === videoId.toString()) {
            throw new ApiError(400, "Video already exists in playlist")
        }
    })

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist._id, {
        $push : {
            videos : videoId
        }
    }, {new : true}).select("-owner -createdAt -updatedAt -__v")

    res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while adding video to playlist")
}
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    try {
    const {playlistId, videoId} = req.params
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Valid playlist id is required")
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid video id is required")
    }

    const userId = req.user?._id;
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist does not exist")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video does not exist")
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Forbidden: You can only update your own playlists")
    }

    let videoExistsInPlaylist = false;

    playlist.videos.forEach((video) => {
        if (video.toString()=== videoId.toString()) {
            videoExistsInPlaylist = true;
        }
    })

    if (!videoExistsInPlaylist) {
        throw new ApiError(400, "Video does not exist in playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist._id, {
        $pull : {
            videos : videoId
        }
    }, {new : true}).select("-owner -createdAt -updatedAt -__v")

    res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully")
    )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while removing video from playlist")
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
try {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Valid playlist id is required")
    }

    const userId = req.user?._id;
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist does not exist")
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Forbidden: You can only delete your own playlists")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlist._id).select("-owner -createdAt -updatedAt -__v")
    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist deletion failed")
    }

    res.status(200).json(
        new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    )
} catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while deleting playlist")
}
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}