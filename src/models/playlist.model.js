import mongoose from "mongoose";

const playListSchema = new mongoose.Schema(
    {
        
         name:{
            type: String,
            required: true
         },
         description:{
            type: String,
            required: true
         },
         video: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "video"
         }
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }

    },
    {
        timestamps: true
    }
)

export const playList = mongoose.model("playList", playListSchema)