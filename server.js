const express = require("express");
const path = require("path");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: 'Trop de requêtes de cette IP, veuillez réessayer après 15 minutes'
});
app.use(limiter);
app.use(express.static(path.join(__dirname + "/public")));
app.use(helmet());
app.get("/receiver.html", (req, res) => {
    res.sendFile(__dirname + "/public/receiver.html");
});

io.on("connection", function(socket){
    socket.on("sender-join", function(data){
        socket.join(data.uid);
    });
    socket.on("receiver-join", function(data){
        socket.join(data.uid);
        socket.in(data.sender_uid).emit("init", data.uid);
    });
    socket.on("file-meta", function(data){
        socket.in(data.uid).emit("fs-meta", data.metadata);
    });
    socket.on("fs-start", function(data){
        socket.in(data.uid).emit("fs-share", {});
    });
    socket.on("file-raw", function(data){
        socket.in(data.uid).emit("fs-share", data.buffer);
    });
});

server.listen(3000);
