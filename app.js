//setting up express
const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
//require socket.io with cors
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methos: ["GET", "POST"]
    }
});
app.use(cors());
let roomarray = [];
let roominfo = []
server.listen(3001, () => {
    console.log("server running at 3001");
})

app.get('/', (req, res) => {
    res.send("hello server here")
})
//socket.io connection

io.on("connection", (socket) => {
    socket.on('join-room', (data) => {
        let id = socket.id;
        let { roomid, name, sub } = data;
        socket.join(roomid);
        if (!roomarray.includes(roomid)) {
            roomarray.push(roomid)
            socket.emit('newroomadded', roomarray);
            let roominfovalue = {
                id: roomid,
                users: [
                    {
                        sub,
                        name,
                        id
                    }
                ]
            }
            roominfo.push(roominfovalue);
        
        }
        else {
            let currentroom;
            let user = {
                sub,
                name,
                id
            }
            roominfo.map((room) => {
                if (room.id == roomid) {
                    currentroom = roomid;
                    room.users.push(user)
                }
            })          
        }
        socket.emit('userlist', roominfo);

    })
    socket.on('getrooms', () => {
        socket.emit('roomarray', roomarray)
    })
    socket.on('new-message', (data) => {
        let { input, name, sub, time } = data
        io.in(data.roomid).emit('message', {
            input,
            name,
            sub,
            time
        })
    })
    socket.on('updatedlist',(userlist)=>{
        io.emit('newlist',userlist);
    })
    socket.on('disconnect',()=>{
    roominfo.map((room,mainindex)=>{
        room.users.map((user,userindex)=>{
            if(user.id = socket.id){
                roominfo[mainindex].users.splice(userindex,1);
                io.emit('newlist',roominfo);
            }
        })
    })  
    })
})