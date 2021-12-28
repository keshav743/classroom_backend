const log = require("log-beautify");
const mongoose = require("mongoose");
const Activity = require("../models/activity");
const fs = require("fs");
const path = require("path");
const Assignment = require("../models/assignment");
const Classroom = require("../models/classroom");
const Response = require("../models/response.js");

module.exports.createClassroomController = async (req, res, next) => {
  try {
    const roomName = req.body.roomName;
    const roomDescription = req.body.roomDescription;
    const userId = req.body.userId;
    const newClassroom = await Classroom.create({
      roomName: roomName,
      createdBy: userId,
      roomDescription: roomDescription,
    });
    const message = await Activity.create({
      type: "Text",
      title: "Channel Created",
      createdBy: req.body.userId,
      belongsToRoom: newClassroom["_id"],
    });
    const savedMessage = await message.save();
    newClassroom.activity.push(savedMessage["_id"]);
    const savedRoom = await newClassroom.save();
    log.success("New Channel Created");
    return res.status(201).json({
      status: "success",
      data: {
        channel: {
          id: savedRoom["_id"],
          roomName: savedRoom.roomName,
          roomDescription: savedRoom.roomDescription,
          createdBy: savedRoom.createdBy,
          activity: savedRoom.activity,
          participants: savedRoom.participants,
          assignments: savedRoom.assignments,
        },
      },
    });
  } catch (err) {
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.joinClassroomController = async (req, res, next) => {
  try {
    const roomCode = req.body.roomCode;
    const userId = req.body.userId;
    const requestedClassroom = await Classroom.findById(roomCode);
    if (requestedClassroom.createdBy == userId) {
      throw new Error("You Created this classroom so you cant join this.");
    }
    if (requestedClassroom.participants.includes(userId)) {
      throw new Error("You have aldready joined this classroom.");
    }
    requestedClassroom.participants.push(userId);
    await requestedClassroom.save();
    log.success("New Channel Joined");
    return res.status(201).json({
      status: "success",
      data: {
        channel: {
          id: requestedClassroom["_id"],
          roomName: requestedClassroom.roomName,
          roomDescription: requestedClassroom.roomDescription,
          createdBy: requestedClassroom.createdBy,
          activity: requestedClassroom.activity,
          participants: requestedClassroom.participants,
          assignments: requestedClassroom.assignments,
        },
      },
    });
  } catch (err) {
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.getJoinedClassroomsController = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const fetchedChannels = await Classroom.find({
      participants: mongoose.Types.ObjectId(userId),
    });
    return res.status(201).json({
      status: "success",
      data: {
        fetchedJoinedChannels: fetchedChannels,
      },
    });
  } catch (err) {
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.getCreatedClassroomsController = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const fetchedChannels = await Classroom.find({
      createdBy: mongoose.Types.ObjectId(userId),
    });
    return res.status(201).json({
      status: "success",
      data: {
        fetchedCreatedChannels: fetchedChannels,
      },
    });
  } catch (err) {
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.getChannelInfoController = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    const fetchedChannel = await Classroom.findOne({ _id: roomId })
      .populate("participants")
      .populate("createdBy")
      .populate("assignments")
      .populate("activity")
      .populate({
        path: "activity",
        populate: {
          path: "assignmentRef",
          model: "Assignment",
        },
      })
      .populate({
        path: "activity",
        populate: {
          path: "responseRef",
          model: "Response",
        },
      });
    if (!fetchedChannel) {
      throw new Error(
        "You may not be permitted to view channel or This channel may not exist."
      );
    }
    if (
      fetchedChannel.participants.filter(
        (e) => e["_id"].toString() == req.params.userId
      ).length == 0 &&
      fetchedChannel.createdBy["_id"] != req.params.userId
    ) {
      throw new Error(
        "You may not be permitted to view channel or This channel may not exist."
      );
    }

    fetchedChannel.activity = fetchedChannel.activity.reverse();
    return res.status(201).json({
      status: "success",
      data: {
        channelInfo: fetchedChannel,
      },
    });
  } catch (err) {
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.sendMessageController = async (req, res, next) => {
  try {
    const roomId = req.body.roomId;
    const message = await Activity.create({
      type: "Text",
      title: req.body.message,
      createdBy: req.params.userId,
      belongsToRoom: roomId,
    });
    const savedMessage = await message.save();
    const requestedClassroom = await Classroom.findById(roomId);
    requestedClassroom.activity.push(savedMessage["_id"]);
    await requestedClassroom.save();
    return res.status(201).json({
      status: "success",
      data: {
        message: savedMessage,
      },
    });
  } catch (err) {
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.createAssignmentController = async (req, res, next) => {
  try {
    const file = req.files.assignment;
    const preAssignment = await Assignment.create({
      title: req.body.title,
      instructions: req.body.instructions,
      createdBy: req.body.userId,
      path: file[0].path,
      belongsToRoom: req.body.roomId,
      deadline: req.body.deadline,
    });
    const savedAssignment = await preAssignment.save();
    const message = await Activity.create({
      type: "Assignment",
      assignmentRef: savedAssignment["_id"],
      createdBy: req.body.userId,
      belongsToRoom: req.body.roomId,
    });
    const savedMessage = await message.save();
    const requestedClassroom = await Classroom.findById(req.body.roomId);
    requestedClassroom.activity.push(savedMessage["_id"]);
    requestedClassroom.assignments.push(savedAssignment["_id"]);
    await requestedClassroom.save();
    return res.status(201).json({
      status: "success",
      data: {
        assignment: savedAssignment,
        activity: savedMessage,
      },
    });
  } catch (err) {
    log.error(err.message);
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.getAssignmentController = async (req, res, async) => {
  try {
    const fetchedAssignment = await Assignment.findOne({
      _id: req.params.assignmentId,
    })
      .populate("belongsToRoom")
      .populate("createdBy")
      .populate("responses")
      .populate({
        path: "responses",
        populate: {
          path: "submittedBy",
          model: "User",
        },
      })
      .populate("submittedPeople");
    return res.status(201).json({
      status: "success",
      data: {
        assignment: fetchedAssignment,
      },
    });
  } catch (err) {
    log.error(err.message);
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.getAssignmentFileController = async (req, res, next) => {
  try {
    const fetchedAssignment = await Assignment.findOne({
      _id: req.params.assignmentId,
    });
    console.log(path.join(__dirname, "../", fetchedAssignment.path));
    var file = await fs.createReadStream(
      path
        .join(__dirname, "../", path.normalize(fetchedAssignment.path))
        .replace("\\", "/")
    );
    file.pipe(res);
  } catch (err) {
    log.error(err.message);
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.getResponseFileController = async (req, res, next) => {
  try {
    const fetchedAssignment = await Response.findOne({
      _id: req.params.responseId,
    });
    console.log(`${__dirname}/${fetchedAssignment.path}`);
    var file = fs.createReadStream(
      path.join(__dirname, "../", fetchedAssignment.path)
    );
    file.pipe(res);
  } catch (err) {
    log.error(err.message);
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.submitAssignmentController = async (req, res, next) => {
  const file = req.files.response;
  console.log(file);
  try {
    const createdResponse = await Response.create({
      questionPaperID: req.params.assignmentId,
      submittedBy: req.params.userId,
      belongsToRoom: req.params.roomId,
      path: file[0].path,
    });
    const savedResponse = await createdResponse.save();
    const message = await Activity.create({
      type: "Submission",
      responseRef: savedResponse["_id"],
      belongsToRoom: req.body.roomId,
      assignmentRef: req.params.assignmentId,
      createdBy: req.params.userId,
      belongsToRoom: req.params.roomId,
    });
    const savedMessage = await message.save();
    const requestedAssignment = await Assignment.findById(
      req.params.assignmentId
    );
    requestedAssignment.responses.push(savedResponse["_id"]);
    requestedAssignment.submittedPeople.push(req.params.userId);
    await requestedAssignment.save();
    const requestedClassroom = await Classroom.findById(req.params.roomId);
    requestedClassroom.activity.push(savedMessage["_id"]);
    await requestedClassroom.save();
    return res.status(201).json({
      status: "success",
      data: {
        response: savedResponse,
        activity: savedMessage,
      },
    });
  } catch (err) {
    log.error(err.message);
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.deleteResponseFileController = async (req, res, next) => {
  try {
    const deletedResponse = await Response.deleteOne({
      _id: req.params.responseId,
    });
    const requestedAssignment = await Assignment.findById(
      req.params.assignmentId
    );
    const activityToBeWritten = await Activity.create({
      type: "Deletion",
      assignmentRef: req.params.assignmentId,
      belongsToRoom: req.params.roomId,
      createdBy: req.params.userId,
    });
    const savedActivity = await activityToBeWritten.save();
    requestedAssignment.responses = requestedAssignment.responses.filter(
      (e) => e["_id"] != req.params.responseId
    );
    requestedAssignment.submittedPeople =
      requestedAssignment.submittedPeople.filter(
        (e) => e["_id"] != req.params.userId
      );
    await requestedAssignment.save();
    return res.status(201).json({
      status: "success",
      data: {
        deletedResponse,
        savedActivity,
      },
    });
  } catch (err) {
    log.error(err.message);
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.getDeadlinesController = async (req, res, next) => {
  try {
    const rooms = await Classroom.find({
      participants: req.params.userId,
    })
      .populate("assignments")
      .populate({
        path: "assignments",
        populate: {
          path: "responses",
          model: "Response",
        },
      })
      .populate({
        path: "assignments",
        populate: {
          path: "belongsToRoom",
          model: "Classroom",
        },
      })
      .populate({
        path: "assignments",
        populate: {
          path: "submittedPeople",
          model: "User",
        },
      });
    let deadlines = [];
    let completed = [];
    rooms.forEach((room) => {
      room.assignments.forEach((assignment) => {
        if (
          assignment.submittedPeople.filter(
            (e) => e["_id"] == req.params.userId
          ).length > 0
        ) {
          completed.push(assignment);
        } else {
          deadlines.push(assignment);
        }
      });
    });
    return res.status(201).json({
      status: "success",
      data: {
        deadlines: deadlines,
        completed: completed,
      },
    });
  } catch (err) {
    log.error(err.message);
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};

module.exports.getHistoryController = async (req, res, next) => {
  try {
    const myActivities = await Activity.find({
      createdBy: req.params.userId,
    })
      .populate("belongsToRoom")
      .populate("assignmentRef")
      .populate("responseRef");
    return res.status(201).json({
      status: "success",
      data: {
        myActivities,
      },
    });
  } catch (err) {
    log.error(err.message);
    return res.status(401).json({
      status: "failure",
      err: err.message,
    });
  }
};
