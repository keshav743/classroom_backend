const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assignmentSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
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
    deadline: {
      type: Date,
      required: true,
    },
    responses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Response",
        required: true,
      },
    ],
    submittedPeople: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Assignment", assignmentSchema);
