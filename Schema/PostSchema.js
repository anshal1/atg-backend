const mg = require("mongoose");
const { Schema } = mg;

const Image = new Schema({
    image: {
        type: String,
        required: true
    },
    likes: [{}],
    comments: [{
    }],
    date: {
        type: Date,
        default: Date.now
    },
    delete_id: {
        type: String,
    },
    uploaded_by: {
        type: String,
        required: true
    }
})

const ImageUpload = mg.model("images", Image);
module.exports = ImageUpload