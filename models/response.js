const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const responseSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
    },
    questionPaperID: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    belongsToRoom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Response", responseSchema);
