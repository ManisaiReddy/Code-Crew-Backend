// const express = require("express");
// const mysql = require("mysql2");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// require('dotenv').config(); // Add this line to load environment variables

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });
// const db = mysql.createConnection({
//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: "12345",
//     database: "code",
//   });
  
//   db.connect((err) => {
//     if (err) {
//       console.error("Error connecting to MySQL:", err);
//       return;
//     }
//     console.log("Connected to MySQL database");
//   });
  
//   // ... rest of your server code ...
// app.post("/api/auth/register", upload.single("profilePic"), async (req, res) => {
//   const { email, password, fullName, gender, dob, interests, resumeLink } = req.body;
//   const profilePicPath = req.file ? req.file.path : null;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   const query = `
//     INSERT INTO code.users 
//     (email, password, full_name, gender, dob, interests, resume_link, profile_pic) 
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `;
//   db.query(
//     query,
//     [email, hashedPassword, fullName, gender, dob, interests, resumeLink, profilePicPath],
//     (err, result) => {
//       if (err) {
//         res.status(500).json({ error: "Registration failed" });
//       } else {
//         res.status(201).json({ message: "User registered successfully" });
//       }
//     }
//   );
// });

// app.post("/api/auth/login", (req, res) => {
//   const { email, password } = req.body;

//   const query = "SELECT * FROM code.users WHERE email = ?";
//   db.query(query, [email], async (err, results) => {
//     if (err) {
//       res.status(500).json({ error: "Login failed" });
//     } else if (results.length === 0) {
//       res.status(404).json({ error: "Email not registered" });
//     } else {
//       const user = results[0];
//       const passwordMatch = await bcrypt.compare(password, user.password);
//       if (passwordMatch) {
//         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
//         res.json({
//           token,
//           user: {
//             id: user.id,
//             email: user.email,
//             fullName: user.full_name,
//             gender: user.gender,
//             dob: user.dob,
//             interests: user.interests,
//             resumeLink: user.resume_link,
//             profilePic: user.profile_pic,
//           },
//         });
//       } else {
//         res.status(401).json({ error: "Invalid credentials" });
//       }
//     }
//   });
// });


// // Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (!token) return res.status(403).json({ error: "No token provided" });
  
//     jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
//       if (err) return res.status(401).json({ error: "Unauthorized" });
//       req.userId = decoded.userId;
//       next();
//     });
//   };

//   // New endpoint to fetch user details
// app.get("/api/user/profile", verifyToken, (req, res) => {
//     const query = `
//       SELECT id, email, full_name, gender, dob, interests, resume_link, profile_pic
//       FROM code.users
//       WHERE id = ?
//     `;
//     db.query(query, [req.userId], (err, result) => {
//       if (err) {
//         res.status(500).json({ error: "Failed to fetch user profile" });
//       } else if (result.length === 0) {
//         res.status(404).json({ error: "User not found" });
//       } else {
//         res.status(200).json(result[0]);
//       }
//     });
//   });
  
  
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME || "code",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Registration endpoint
app.post("/api/auth/register", upload.single("profilePic"), async (req, res) => {
  const { email, password, fullName, gender, dob, interests, resumeLink } = req.body;
  const profilePicPath = req.file ? req.file.path : null;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO code.users 
    (email, password, full_name, gender, dob, interests, resume_link, profile_pic) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [email, hashedPassword, fullName, gender, dob, interests, resumeLink, profilePicPath],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Registration failed" });
      } else {
        res.status(201).json({ message: "User registered successfully" });
      }
    }
  );
});

// Login endpoint
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM code.users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      res.status(500).json({ error: "Login failed" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Email not registered" });
    } else {
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            gender: user.gender,
            dob: user.dob,
            interests: user.interests,
            resumeLink: user.resume_link,
            profilePic: user.profile_pic,
          },
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });
    req.userId = decoded.userId;
    next();
  });
};

// Protected route to fetch user profile
app.get("/api/user/profile", verifyToken, (req, res) => {
  const query = `
    SELECT id, email, full_name, gender, dob, interests, resume_link, profile_pic
    FROM code.users
    WHERE id = ?
  `;
  db.query(query, [req.userId], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json(result[0]);
    }
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));