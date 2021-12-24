const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const log = require("log-beautify");

const User = require("../models/user.js");

module.exports.signupController = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 12);
    const finalUser = { ...req.body, password: hash };
    const newUser = await User.create(finalUser);
    log.success("User Created");
    const authToken = jwt.sign({ id: newUser._id }, "secret", {
      expiresIn: "1d",
    });
    return res.status(201).json({
      status: "success",
      data: {
        token: authToken,
        userData: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      },
    });
  } catch (errMsg) {
    return res.status(500).json({
      status: "failure",
      err: errMsg,
    });
  }
};

module.exports.loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const passwordsMatched = await bcrypt.compare(password, user.password);
      if (passwordsMatched) {
        log.success("Passwords Matched");
        const authToken = jwt.sign({ id: user._id }, "secret", {
          expiresIn: "1d",
        });
        return res.status(201).json({
          status: "success",
          data: {
            token: authToken,
            userData: {
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          },
        });
      } else {
        log.error("Passwords didn't Match!!");
        throw new Error("Incorrect Password.");
      }
    } else {
      log.error("No user exists for the E-Mail ID.");
      throw new Error("No user exists for the E-Mail ID.");
    }
  } catch (errMsg) {
    return res.status(401).json({
      status: "failure",
      err: errMsg.message,
    });
  }
};
