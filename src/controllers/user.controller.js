import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { user} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
  // get user detail from forntend
  // validation  - not empty ...
  // check it user already exit
  // check for images 
  // check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in DB
  // remove password and refresh token field from response
  //check for user creation
  // return responce
  
  
  const {fullname, email, username, password} = req.body
   // console.log("email : ", email);
    /*
     if(fullname === "")
     {
         throw new ApiError(400, "Fullname is requried")
         
     }
        */
       if(
           [fullname, email, username,password].some((field) =>
        field?.trim() === "")
       ){
            throw new ApiError(400, "All fied are requried");
         }

       const existedUser = await user.findOne({
            $or: [{username}, {email}]   // using operator with dollar sign for pick many choice
         })
         if(existedUser)
         {
            throw new ApiError(409, "User with email and username is already exist");
            
         }
         // Multer can access req.file 

        const avatarLocalPath = req.files?.avatar[0]?.path; 

     //  const coverImageLocalPath = req.files?.coverImage[0]?.path
      // console.log(req.files)

      let coverImageLocalPath ;
      if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        
        coverImageLocalPath = req.files.coverImage[0].path;
      }
       
       if(!avatarLocalPath)
       {
        throw new ApiError(400, "Avatar file is requried 1");
       }

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if(!avatar)
        {
            throw new ApiError(400,"Avatar file is requried 2")
        }
  
        const User = await user.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

       const createdUser = await user.findById(User._id).select(
        "-password -refreshToken"
       )
       if(!createdUser)
       {
         throw new ApiError(500,"Something went wrong while registring a user");
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User register successfully")
        )


})


export {
    registerUser,
}