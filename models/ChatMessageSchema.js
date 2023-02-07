const mongoose = require("mongoose")

const ChatMessageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
})

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema)
module.exports = ChatMessage