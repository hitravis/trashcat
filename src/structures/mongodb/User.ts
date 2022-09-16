import { Schema, model } from "mongoose";

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    memberId: String,
    currency: { type: Number, default: 0 },
    experience: { type: Number, default: 0},
    // A JSON string containing an array of <reminder, expiry> pairs.
    reminders: { type: String, default: "" },
});

export default model("User", userSchema, "users");
