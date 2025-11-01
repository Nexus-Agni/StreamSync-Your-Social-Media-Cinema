import cloudinary from 'cloudinary';
import fs from 'fs';
import { ApiError } from './apiError.js';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) {
            console.log('No local file path found');
            return null
        }
        //upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        })
        console.log('File uploaded successfully', response.url);
        fs.unlinkSync(localFilePath)
        return response

        //
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove file from server
        return null
    }
}

const deleteFromCloudinary = async (publicId)=>{
    try {
        if(!publicId) {
            throw new ApiError(400, 'No public id found');
        }
        //delete from cloudinary
        const response = await cloudinary.uploader.destroy(publicId)
        console.log('File deleted successfully', response);
        return response

        //
    } catch (error) {
        return null
    }
}

export {uploadOnCloudinary, deleteFromCloudinary} 