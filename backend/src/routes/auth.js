const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.param, message: e.msg })),
    });
  }
  next();
};

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("rollNumber").trim().notEmpty().withMessage("Roll number is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("department").trim().notEmpty().withMessage("Department is required"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, rollNumber, password, department, semester, role } =
        req.body;

      // Check for existing user
      const existing = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { rollNumber }],
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "User with this email or roll number already exists",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        rollNumber: rollNumber.trim(),
        passwordHash,
        department: department.trim(),
        semester: semester || 0,
        role: role || "student",
      });

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      });
    } catch (err) {
      console.error("Register error:", err.message);
      res.status(500).json({
        success: false,
        message: "Server error during registration",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

router.post(
  "/login",
  [
    body("identifier").trim().notEmpty().withMessage("Email or roll number required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { identifier, password } = req.body;

      const user = await User.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { rollNumber: identifier },
        ],
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "7d" }
      );

      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .json({
          success: true,
          message: "Login successful",
          data: {
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              department: user.department,
              semester: user.semester,
            },
          },
        });
    } catch (err) {
      console.error("Login error:", err.message);
      res.status(500).json({
        success: false,
        message: "Server error during login",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;

