import {v2 as cloudinary} from "Cloudinary"
import fs from "fs"
    // Configuration
    cloudinary.config({ 

        cloud_name: proccess.env.CLOUDINARY_CLOUD_NAME,
        api_key: proccess.env.CLOUDINARY_API_KEY, 
        api_secret: proccess.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });


    const uploadOnCloudinary = async (localFilePath) => {
     try {
        if (!localFilePath) {
            return null;
        } 
        // upload File on Cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        console.log(" File is uploaded on Cloudinary", response.url);
        return response;

     } catch (error) {
        fs.unlinkSync(localFilePath)  // remove the locally saved temparary file as the upload opration got failed
        
     }   
    }

    export {uploadOnCloudinary}
    