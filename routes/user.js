const express = require("express");
const User = require("../models/user")
const router = express.Router();



router.get("/signup", (req, res) => {
    res.render("signup")
});


router.get("/signin", (req, res) => {
    res.render("signin",{
        user:req.user,
    });
});

router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("signin");
});


router.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;
    console.log(req.body);

    // Ensure all fields are provided
    if (!fullName || !email || !password) {
        return res.status(400).send("All fields are required");
    };
    await User.create({
        fullName, email, password
    });
   return res.redirect("signin")
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        return res.cookie("token", token).redirect("/");
       
        
    } catch (error) {
        return res.render("signin", {
            error: "Incorrect Email or Password",
           
            
        },);
    }
});

//route for the profile data
// Profile route to render user profile page
// router.get('/profile', (req, res) => {
//     // Check if the user is logged in
//     if (!req.user) {
//       return res.redirect('/login'); // Redirect to login if not logged in
//     }
  
//     // Render the profile page with the user data
//     res.render('profile', { user: req.user });
//   });
  

router.get('/profile', (req, res) => {
    console.log('Profile route accessed');
    res.render('profile', { user: req.user });
  });
  
module.exports = router;