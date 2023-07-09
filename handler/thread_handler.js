'use strict';

const mongoose = require('mongoose');

mongoose.connect(
  process.env.DB,
  { useNewUrlParser: true, useUnifiedTopology: true },
);

let threadSchema = mongoose.Schema({
  board: String,
  text: String,
  created_on: { type: Date, default: Date.now() },
  bumped_on: { type: Date, default: Date.now() },
  reported: { type: Boolean, default: false },
  delete_password: String,
  replies: []
});

let replySchema = mongoose.Schema({
  text: String,
  created_on: { type: Date, default: Date.now() },
  delete_password: String,
  reported: { type: Boolean, default: false }
});

let Thread = mongoose.model("Thread", threadSchema);
let Reply = mongoose.model("Reply", replySchema);

class Thread_Handler {
  async createThread(board, text, delete_password) {
    let newThread = new Thread({
      board: board,
      text: text,
      delete_password: delete_password,
      replies: []
    });

    let thread = await newThread.save();

    console.log("New Thread: " + thread);
    return thread;
  }

  async createReply(text, delete_password, thread_id) {
    let checkThread = await Thread.find({ _id: thread_id });

    if (!checkThread) {
      return "Thread not found";
    }

    let newReply = new Reply({
      text: text,
      delete_password: delete_password,
    });

    let reply = await newReply.save((err, reply) => {
      let update = {
        $push: { replies: [reply] },
        $set: { bumped_on: Date.now() }
      };
      Thread.updateOne(
        { _id: thread_id },
        updateReplies
      );

      /*let updateTime = { $set: { bumped_on: Date.now() } };
      Thread.updateOne(
        { _id: thread_id },
        updateTime
      );*/
    });

    return reply;
  };

  async getRecentThreads(board) {
    let boardThreads = await Thread.find({ board: board})
      .select('-reported -delete_password')
      .sort('-bumped_on')
      .limit(10);
    
    return boardThreads;
  };

  async getEntireThread(board, thread_id) {
    let thread = await Thread.find({ _id: thread_id, board: board})
      .select('-reported -delete_password');

    return thread;
  };

  async deleteThread(thread_id, delete_password) {
    let deletedThread = await Thread.removeOne({_id: thread_id, delete_password: delete_password})

    if (deletedThread) {
      return "Success";
    } else {
      return "incorrect password";
    }
  }
}
module.exports = Thread_Handler;