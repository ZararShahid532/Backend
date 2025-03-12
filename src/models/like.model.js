import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
       
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "video"
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment"
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tweet"
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        

    },
    {
        timestamps: true
    }
)

export const like = mongoose.model("like",likeSchema)