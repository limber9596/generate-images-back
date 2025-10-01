// utils/jwt.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function signToken(user) {
  // user debe ser el objeto desde la BD (con id, email, role)
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
