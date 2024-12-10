const express = require("express");
const User = require("../models/user")
const router = express.Router();
const multer=require("multer")
const path=require("path")
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


// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter }); // Initialize Multer


router.post("/signup",upload.single("profileImageURL"),  async (req, res) => {
    const { fullName, email, password  } = req.body;
    console.log(req.body);

    // Ensure all fields are provided
    if (!fullName || !email || !password  ){
        return res.status(400).send("All fields are required");
    };
    try {
      // Check for existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send("Email is already in use");
      }
  
        // Handle profile image upload
        let profileImageURL = req.file
        ? `/uploads/${req.file.filename}`
        : "/images/default.png"; // Default profile image if none uploaded
    await User.create({
        fullName, email, password,  profileImageURL
    });
   return res.redirect("signin")
  } catch (error) {
    console.error("Error during user signup:", error.message);
    return res.status(500).send("Internal Server Error");
  }
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



// Profile route to render user profile page
router.get('/profile', (req, res) => {
    // Check if the user is logged in
    if (!req.user) {
      return res.redirect('/login'); // Redirect to login if not logged in
    }
  
    // Render the profile page with the user data
    res.render('profile', { user: req.user });
  });
  

  
module.exports = router;