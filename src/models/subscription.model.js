import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId, // who is subscribing
        ref : "User"
    },
    channel : {
        type : Schema.Types.ObjectId, // who is subscribing
        ref : "User"
    }
}, 
    {
        timestamps: true
    }
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)

// How many subscriber channel "a" has ? -> Find all the documents in which channel=="a"
// What are the channels that user "a" has subscribed? -> Find all the documents in which subscriber=="a"