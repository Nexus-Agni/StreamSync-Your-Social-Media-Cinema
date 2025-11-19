import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from './apiError.js';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath, resourceType = "image") => {
    try {
        if (!localFilePath) {
            console.log('No local file path found');
            return null;
        }

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            console.log('File does not exist at path:', localFilePath);
            return null;
        }

        console.log(`Uploading file: ${localFilePath} as ${resourceType}`);

        // Upload to cloudinary with proper options
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
        });

        console.log('File uploaded successfully on cloudinary');
        console.log('URL:', response.url);
        // console.log('Duration:', response.duration);

        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);
        
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error: ", error);
        
        // Clean up local file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        
        return null;
    }
}

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) {
            throw new ApiError(400, 'No public id found');
        }

        console.log(`Deleting file: ${publicId} as ${resourceType}`);

        // Delete from cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        
        console.log('File deleted successfully', response);
        return response;

    } catch (error) {
        console.error("Cloudinary Delete Error: ", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }