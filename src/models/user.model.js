import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(

    {
      username:{
        type: String,
        requried: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
      },
      email:{
        type: String,
        requried: true,
        unique: true,
        lowercase: true,
        trim: true
      },
      fullname:{
        type: String,
        requried: true,
        trim: true,
        index: true
      },
      avatar:{
        type: String, // Cloudinary Service ka url use kara ga 
        requried: true
      },
      coverImage:{
        type: String // Cloudinary Service ka url use kara ga 
      },
      watchHistory:[{
        type: mongoose.Schema.Types.ObjectId, // Cloudinary Service ka url use kara ga 
        ref: "videoz"
      }
    ],
    password:{
        type: String,
        requried:[true,"Password is requried"]
      },
      refreshToken:{
        type: String 
      }


},{timestamps: true}
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
  await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
 return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.REFRESH_TOKEN_EXPIRY
    }
  )
}
export const user = mongoose.model("user",userSchema);