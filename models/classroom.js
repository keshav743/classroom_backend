const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classroomSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  roomDescription: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  assignments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
    },
  ],
  activity: [
    {
      type: Schema.Types.ObjectId,
      ref: "Activity",
    },
  ],
});

module.exports = new mongoose.model("Classroom", classroomSchema);
