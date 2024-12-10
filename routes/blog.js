const express = require("express");
const Blog = require("../models/blog")
const blogRouter = express.Router();
const multer = require("multer");
const path = require("path");
const Comment = require("../models/comment");

blogRouter.get("/add-new", (req, res) => {
    return res.render("new-blog", {
        user: req.user,
    });
});


const fs = require("fs");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "../public/uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

blogRouter.get("/:id", async(req,res)=>{
    const blog=await Blog.findById(req.params.id).populate("createdBy");
    const comments=await Comment.find({blogId:req.params.id}).populate("createdBy");

    return res.render("blog",{
        user:req.user,
        blog,
        comments,
    });
});

blogRouter.post("/upload", upload.single("coverImage"), async (req, res) => {
    const { title, body } = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
    // return res.redirect("/");
});


const mongoose = require("mongoose");

blogRouter.post("/comment/:blogId", async (req, res) => {
    const { blogId } = req.params;

    if (!mongoose.isValidObjectId(blogId)) {
        return res.status(400).send("Invalid Blog ID");
    }

    try {
        await Comment.create({
            content: req.body.content,
            blogId,
            createdBy: req.user._id,
        });
        return res.redirect(`/blog/${blogId}`);
    } catch (error) {
        return res.status(500).send("Error creating comment");
    }
});


module.exports = blogRouter;