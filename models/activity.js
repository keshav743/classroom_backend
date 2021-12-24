const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    assignmentRef: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
    },
    title: {
      type: String,
    },
    belongsToRoom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responseRef: {
      type: Schema.Types.ObjectId,
      ref: "Response",
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Activity", activitySchema, "activities");
