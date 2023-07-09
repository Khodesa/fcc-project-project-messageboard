'use strict';

let threadHandler = require('../handler/thread_handler.js');

module.exports = function(app) {

  let threads = new threadHandler();

  app.route('/api/threads/:board')
    .post(async function(req, res) {
      let board = req.params.board;
      let text = req.body.text;
      let delete_password = req.body.delete_password;

      let newThread = await threads.createThread(board, text, delete_password);

      return res.json(newThread);
    })
    .get(async function(req, res) {
      let board = req.params.board;

      let recentThreads = await threads.getRecentThreads(board);

      return res.json(recentThreads);
    })
    .delete(async function(req, res) {
      let thread_id = req.body.thread_id;
      let delete_password = req.body.delete_password;

      let deleted = await threads.deleteThread(thread_id, delete_password);

      return res.json(deleted);
    });

  app.route('/api/replies/:board')
    .post(async function(req, res) {
      let text = req.body.text;
      let delete_password = req.body.delete_password;
      let thread_id = req.body.thread_id;

      let newReply = await threads.createReply(text, delete_password, thread_id);

      return res.json(newReply);
    })
    .get(async function(req, res) {
      let board = req.params.board;
      let thread_id = req.query.thread_id;

      let thread = await threads.getEntireThread(board, thread_id);

      return res.json(thread);
    });
};
