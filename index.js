const express = require("express");
const path = require("path");
const { mongoose } = require("mongoose");
const userRouter = require("./routes/user")
const blogRouter = require("./routes/blog")
const cookiePaser = require("cookie-parser");
const { checkForAuthenticationCookie}= require("./middlewares/authentication");
const Blog = require("./models/blog");

const app = express();

const port = 8000;

mongoose.connect('mongodb://127.0.0.1:27017/blogify').then(() => {
    console.log("mongo db connected")
});
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));
app.use("/user", userRouter);
app.use("/blog", blogRouter);


//routes

app.get("/", async(req, res) => {
    const allBlogs = await Blog.find({});
    res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
});

app.listen(port, () => {
    console.log(`server started at port : ${port}`);
})
