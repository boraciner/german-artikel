var express = require('express');
require("dotenv").config();
const mysql = require("mysql");
const WebSocket = require("ws");

const ignore = new Set([
  "ER_DB_CREATE_EXISTS", "ER_TABLE_EXISTS_ERROR"
]);

const db = mysql.createConnection({
  user: process.env.DB_MYSQL_USER,
  password: process.env.DB_MYSQL_PASSWORD,
});






var router = express.Router();

/* GET home page. */
router.get('/:keyword?', function(req, res, next) {
  console.log("req",req.params.keyword)
  if(req && req.params.keyword){
    req.params.keyword = req.params.keyword + '%';
    db.query(`SELECT * FROM words.words WHERE keyword LIKE ? LIMIT 20;`,
      [req.params.keyword],
      (err, results, fields) => {
          results = results.map(i=>{return [i.keyword,i.artikel] })
          if(err){
            console.error(err)
          }
          console.log(results);
          
          res.render('index', { title: 'German Artikel Finder', searchedFor: results, artikel: ''});
          
      });
  }
  else{
    res.render('index', { title: 'German Artikel Finder', searchedFor: '', artikel: ''});
  }
});


router.post("/data", function (req, res) {
  res.redirect(`/${req.body.keyword}`);
 });


/* GET home page. */
router.post('/database', function(req, res) {
  console.log("start database interaction")
  res.redirect(`/`);
});

 

const WebSocketServer = new WebSocket.Server({
  port: 3001,
});
WebSocketServer.on("connection", (socket) => {
  socket.on("message", (msg) => {
    console.log("Received:", msg);
    msg = msg + '%';
    db.query(`SELECT * FROM words.words WHERE keyword LIKE ? LIMIT 20;`,
      [msg],
      (err, results, fields) => {
          results = results.map(i=>{return [i.keyword,i.artikel] })
          if(err){
            console.error(err)
          }
          console.log("2RETURN TO WEBPAGE :",results);
          socket.send(JSON.stringify(results));
      });
  });
});
module.exports = router;
