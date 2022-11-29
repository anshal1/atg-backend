const mongoose = require("mongoose")
const { Schema } = mongoose


const User = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    forgot_password_token: {
        type: String,
        default:""
    }
})

const UserSchema = mongoose.model("task_users", User)
module.exports = UserSchema