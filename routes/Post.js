const express = require("express");
const post_router = express.Router();
const ImageUpload = require("../Schema/PostSchema.js");
const cloudinary = require("cloudinary");
const multer = require("multer");
const fs = require("fs");
const FetchUser = require("../Find_user_in_database");
const storage = multer.diskStorage({})
const upload = multer({
    storage,
});
require("dotenv").config();

// For hosting our images
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});


post_router.post("/share/image", FetchUser, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(404).json({ error: "Image not found" })
        }
        cloudinary.v2.uploader.upload(req.file.path, { public_id: req.file.filename }).then(async (result) => {
            if (result) {
                const Image = await ImageUpload.create({
                    image: result.secure_url,
                    delete_id: result.public_id,
                    uploaded_by: user.username
                })
                res.json({ msg: "Successfully Uploaded" });
            }
        })
    } catch (error) {
        if (error) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
})

post_router.get("/all/post", async (req, res) => {
    let page = req.query.page;
    const limit = req.query.limit;
    let isNextPage = false;
    const allimage = await ImageUpload.find({});
    if (!allimage || allimage.length < 1) {
        return res.status(404).json({
            error: "Image Not Found"
        })
    }
    // Fetching limited amout of images
    const allImage = await ImageUpload.find({}).limit(limit).skip(limit * (page - 1));

    // Checking if next page exists or not
    // If the allImage returns the data whose length is equal to limit then there might be a chance that there are more data
    // So we will fetch data on the second page to check if next page exists or not
    if (allImage.length === limit) {
        // Don't need to fetch all data just fetch one data to check if next page exists if yes then user will request this url again and we will check again
        const Check = await ImageUpload.find({}).limit(1).skip(limit * (page + 1));
        if (Check.length < 1) {
            isNextPage = false;
        } else {
            isNextPage = true;
        }
    } else if (allImage.length < limit) {
        isNextPage = false;
    }
    res.json({
        isNextPage,
        post: allImage
    })
})

post_router.put("/like/:id", FetchUser, async (req, res) => {
    const find_image = await ImageUpload.findById(req.params.id);
    if (!find_image) {
        return res.status(404).json({
            error: "Image Not Found"
        })
    }
    const like = await ImageUpload.findByIdAndUpdate(req.params.id, { $push: { likes: user.username } }, { new: true });
    res.json(like);
})
post_router.put("/dislike/:id", FetchUser, async (req, res) => {
    const find_image = await ImageUpload.findById(req.params.id);
    if (!find_image) {
        return res.status(404).json({
            error: "Image Not Found"
        })
    }
    const like = await ImageUpload.findByIdAndUpdate(req.params.id, { $pull: { likes: user.username } }, { new: true });
    res.json(like);
})
post_router.post("/add/comment/:id", FetchUser, async (req, res) => {
    const { comment_body } = req.body;
    if (!comment_body) {
        return res.status(400).json({ error: "Comment cannot be empty" });
    }
    const find_image = await ImageUpload.findById(req.params.id);
    if (!find_image) {
        return res.status(404).json({
            error: "Image Not Found"
        })
    }
    const add_comment = await ImageUpload.findByIdAndUpdate(req.params.id, {
        $push: {
            comments: {
                comment: comment_body,
                date: Date.now(),
                username: user.username
            }
        }
    }, { new: true });
    res.json({ add_comment });
})
post_router.post("/remove/comment/:id", FetchUser, async (req, res) => {
    const { comment_body } = req.body;
    if (!comment_body) {
        return res.status(400).json({ error: "Comment cannot be empty" });
    }
    const find_image = await ImageUpload.findById(req.params.id);
    if (!find_image) {
        return res.status(404).json({
            error: "Image Not Found"
        })
    }
    const remove_comment = await ImageUpload.findByIdAndUpdate(req.params.id, {
        $pull: {
            comments: {
                comment: comment_body,
                username: user.username
            }
        }
    }, { new: true });
    res.json({ remove_comment });
})
post_router.delete("/delete/post/:id", FetchUser, async (req, res) => {
    let find_post = await ImageUpload.findById(req.params.id);
    if (!find_post) {
        return res.status(404).json({
            error: "Image Not Found"
        })
    }
    if (find_post.uploaded_by !== user.username) {
        return res.status(401).json({
            error: "Unauthorized Action"
        })
    }
    find_post = await ImageUpload.findByIdAndDelete(req.params.id);
    cloudinary.uploader.destroy(find_post.delete_id).then((result) => {
        if (result) {
            return res.json(find_post);
        }
    }).catch((err) => {
        if (err) {
            return res.json({ error: "An error occured" })
        }
    })
})
module.exports = post_router;