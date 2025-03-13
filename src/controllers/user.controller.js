import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { user} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";



const generateAccessAndRefreshToken = async (userId) =>
{   
   
   
    try {
       const User = await user.findById(userId)
       
      const accessToken = User.generateAccessToken();
      const refreshToken = User.generateRefreshToken();
      
      User.refreshToken = refreshToken
     await User.save({ validateBeforeSave: false });

     return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, " Something went wrong while generaing Access and refresh Token")
            }
}

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
      //  console.log(User)

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User register successfully")
        )


})

const loginUser = asyncHandler(async(req,res)=>{
       // req body -> data
       // username or email
       // find the user
       // password check
       // Access and refresh token
       // send cookies 
       

    const{email, username, password} = req.body
     if(!(username || email))
     {
        throw new ApiError(400, " Username or email is requried")
     }

     const User = await user.findOne({
        $or: [{username}, {email}]
     })
     if(!User)
     {
        throw new ApiError(404, "User doesnot exist")
     }
       const isPasswordValid = await User.isPasswordCorrect(password)
    
        
       if(!isPasswordValid)
        {
           throw new ApiError(401, " Password In correct")
        }
        
  
    const{accessToken, refreshToken} = await generateAccessAndRefreshToken(User._id);

   const loggedInUser = await user.findById(User._id).select("-password -refreshToken") // .Select Used Exclude Those field are not acces to other

   const option = {
    httpOnly: true, // Only Modified on Server not on forentend .. Security Step
    secure: true
   }

   return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User Logged In Successfully"
    )
   )

})

const logoutUser = asyncHandler(async(req, res)=>{
    await user.findByIdAndUpdate(req.User._id,
        {
            $set: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
     )

     const option = {
        httpOnly: true, // Only Modified on Server not on forentend .. Security Step
        secure: true
       }
       return res.status(200).clearCookie("accessToken",option).clearCookie("refreshToken",option).json(
         new ApiResponse(200, {}, "UserUser logged out ")
       )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken)
  {
    throw new ApiError(401, " Unauthorized requet ")
  }
try {
         const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
           const User = await user.findById(decodedToken._id)
          if (!User) {
               throw new ApiError(401, "Invalid refresh token");
               }
               if(incomingRefreshToken !== User?.refreshToken)
               {
                 throw new ApiError(401, " Refresh token is expired");
                }
            
                const option = {
                    httpOnly: true,
                    secure: true
                }
    
            const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(User._id)
               return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",newRefreshToken,option).json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access token refreshed"
                )
               )
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
}

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
 
    const{oldPassword, newPassword} = req.body;
    console.log(oldPassword)
    
      const User = await user.findById(req.User?._id);
      const isPasswordCorrect = await User.isPasswordCorrect(oldPassword);
      //console.log(isPasswordCorrect);
      
      if(!isPasswordCorrect)
      {
        throw new ApiError(401, "In valid old password");
        
      }

      User.password = newPassword;
     await User.save({validateBeforeSave: false});

     return res.status(200).json(new ApiResponse(200, {}, "Password chsnge successfully!!"))

})


const getCurrentUser = asyncHandler(async(req,res)=>{

    return res.status(200).json( new ApiResponse(200, req.User, "Current User Fetch Successfully"))
})


const updateAccountDetail = asyncHandler(async(req,res)=>{
    const {fullname, email} = req.body
    if(!(fullname || email))
    {
        throw new ApiError(401, " All field are requried");       
    }

      const User = await user.findByIdAndUpdate(
        req.User?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        {new: true}   // It is used to save information after change 
    
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, User, "Account detail updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path     // Acces through multer middleware
    if (!avatarLocalPath) {
        throw new ApiError(401, " avatar file is missing");
        
    }

      const avatar = await uploadOnCloudinary(avatarLocalPath);
      if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar");
      }

    const User = await user.findByIdAndUpdate(
        req.User?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },   // set is uesd for select one field
        {new: true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, User, "Update Avatar Successfully"))

})

const updateUsercoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath)
    {
        throw new ApiError(400, "CoverImage is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cloudinary")
    }
  
   const User = await user.findByIdAndUpdate(
        req.User?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, User, "Update CoverImage Successfully"))

})

const getUserChannelProfile = asyncHandler(async(req, res)=>{

    const {username} = req.params;  // get data from url link
console.log(username)
    if(!username?.trim())
    {
        throw new ApiError(400,"User name is missing")
    }

    // user.find({username})
    const channel = await user.aggregate([{
              $match: {
                username: username?.toLowerCase()
              }
            },
      {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: " subscriber",
            as: "subscriberTo"
        }
    },
    {
        $addFields: {
            subscriberCount: {
                $size: "$subscribers"        
            },
            channelSubscribedToCount: {
                $size: "$subscriberTo"
            },
            isSubscribed: {
                $cond: {
                
                    if: {$in: [req.User?._id, "$subscribers.subscriber"]},
                    then: true,
                    else: false
                }
            }
        }
    },
    {
        $project: {
            fullname: 1,
            username: 1,
            subscriberCount: 1,
            channelSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1


        }
    }
  ])

  if (!channel?.length) {
    throw new ApiError(404 ,"Channel does not exist");
    
  }
  return res.status(200).json(
    new ApiResponse(200, channel[0], "User Channel fetched successfully")
  )
   })

const getWatchHistory = asyncHandler(async(req, res)=>{

const User = await user.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(req.User._id)   // Aggeration pipeline doesnot support mongoose that why we can get id for this method.
            
        }
    },
    {
        $lookup: {
            from: "video",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            pipeline: [    // Extent piprline using nested pipeline
            {
                $lookup: {
                    from: "user",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                }
            ]
                }
            },
                {
                    $addFields: {
                        owner: {
                            $first: "$owner"  // first is uesd to find first element in array
                        }
                    }
                }
            ]
        }
    }
])

return res.status(200).json(new ApiResponse(200, User[0].watchHistory, "Watch History Fetched Successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory
    
}