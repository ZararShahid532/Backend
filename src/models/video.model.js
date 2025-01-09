import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
       videoFile: {
        type: String,  // Cloudinary url
        requried: true
       },
       thumbnail:{
        type: String,  // Cloudinary url
        requried: true
       },
       title:{
        type: String, 
        requried: true
       },
       description:{
        type: String, 
        requried: true
       },
       duration:{
        type: Number, // cloudinary url sa 
        requried: true
       },
       views:{
        type: Number,
        default:0, 
       },
       isPublished:{
        type: Boolean,
        default:true
       },
       owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
       }


},{timestamps: true}
)

videoSchema.plugin(mongooseAggregatePaginate)
export const video = mongoose.model("video",videoSchema);