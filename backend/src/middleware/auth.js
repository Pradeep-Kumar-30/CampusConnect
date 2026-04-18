const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const cookieToken = req.cookies && req.cookies.token;
    let token = null;

    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      console.warn(`[AUTH] Access denied: No token found in headers or cookies for ${req.path}`);
      return res.status(401).json({ message: "No auth token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dnvhigoudrshrejgvrej");
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error", err.message);
    return res.status(401).json({ message: "Invalid auth token" });
  }
};

module.exports = auth;
