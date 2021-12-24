const User = require("../models/user.js");
const jwt = require("jsonwebtoken");

const checkToken = async (req, res, next) => {
  if (req.headers.authorization) {
    jwt.verify(req.headers.authorization, "secret", async (err, decoded) => {
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return res.status(401).json({
          status: "failure",
          data: {
            err: "Invalid Token",
          },
        });
      }
      return next();
    });
  } else {
    return res.status(401).json({
      status: "failure",
      data: {
        err: "No Token Found",
      },
    });
  }
};

module.exports = checkToken;
