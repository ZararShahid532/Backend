import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "video"
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }

    },
    {timestamps: true}
)

commentSchema.plugin(mongooseAggregatePaginate)

export const  comment = mongoose.model("comment",commentSchema)