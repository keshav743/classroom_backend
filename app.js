const express = require("express");
const log = require("log-beautify");
const path = require("path");
const multer = require("multer");
const uuid = require("uuid");
const PORT = process.env.PORT || 3000;

const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname == "assignment") {
      cb(null, "uploads/assignments");
    } else if (file.fieldname == "response") {
      cb(null, "uploads/responses");
    }
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v1() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const authRoutes = require("./routes/authRoutes.js");
const classRoutes = require("./routes/classRoutes.js");

app.use(
  "/assignments",
  express.static(path.join(__dirname, "uploads/assignments"))
);
app.use(
  "/responses",
  express.static(path.join(__dirname, "uploads/responses"))
);
app.use(cors());
app.use(express.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    { name: "assignment", maxCount: 1 },
    { name: "response", maxCount: 1 },
  ])
);

app.use("/api/auth", authRoutes);
app.use("/api/classroom", classRoutes),
  mongoose
    .connect(
      "mongodb+srv://keshav_23:keshav%4023@cluster0.iflqo.mongodb.net/assignmentDB?retryWrites=true&w=majority"
    )
    .then((_) => {
      app.listen(PORT, () => {
        log.success("Server Started at Port 3000");
      });
    });
