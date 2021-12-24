const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const checkForPermission = async (req, res, next) => {
  if (req.headers.authorization) {
    jwt.verify(req.headers.authorization, "secret", async (err, decoded) => {
      const currentUser = await User.findById(decoded.id);
      if (currentUser["_id"] != req.params.userId) {
        return res.status(401).json({
          status: "failure",
          data: {
            err: "You are probably misbehaving!!! Token does not belong to you.",
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

module.exports = checkForPermission;
