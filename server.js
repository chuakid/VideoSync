let path = require("path")

const express = require('express')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});
// const io = require('socket.io')(server)
let port = process.env.PORT || 3000;


let rooms = [1, 2, 3, 4],
    roomInfo = {}

for (let room of rooms) {
    roomInfo[room] = { people: {} }
}

io.on('connection', (client) => {
    client.emit("rooms", rooms)
    client.on("join", (info) => {
        if (!rooms.includes(parseInt(info.roomId)))
            return

        client.name = info.name
        client.roomId = info.roomId

        client.join(info.roomId)
        console.log(client.id + " joined " + client.roomId)
        client.emit("roomJoinStatus")

        roomInfo[client.roomId]["people"][client.id] = client.name //add client to client list
        if (roomInfo[client.roomId]['link']) // if link already changed 
            client.emit("linkChanged", roomInfo[client.roomId]["link"]) //change the new client's link
        io.in(client.roomId).emit("clientJoined", Object.values(roomInfo[client.roomId]["people"])) //let everyone know the new client list

        client.on("disconnect", () => {
            delete roomInfo[client.roomId]["people"][client.id]
            io.in(client.roomId).emit("clientJoined", Object.values(roomInfo[client.roomId]["people"])) //let everyone know the new client list
            console.log(client.name + " disconnected")
        })
    })
    client.on("linkChange", (id) => {
        roomInfo[client.roomId]["link"] = id
        client.broadcast.to(client.roomId).emit("linkChanged", id)
    })
    client.on("seek", (seekTime) => {
        client.broadcast.to(client.roomId).emit("seek", seekTime)
    })
    client.on("playing", () => {
        client.broadcast.to(client.roomId).emit("playing")
    })
    client.on("pause", () => {
        client.broadcast.to(client.roomId).emit("pause")
    })

    console.log("a user connected")
});

server.listen(port, () => {
    console.log("listening on port", port)
})

app.get('/', (req, res) => res.sendFile(path.join(__dirname, "./dist/index.html")))
app.use(express.static('dist'))


