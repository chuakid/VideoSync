import { io } from "socket.io-client";
import { host } from "./variables.js"
let socket = io(host)
console.log(host);

socket.on("roomJoinStatus", (status) => {
    console.log("Joined room");
});

export default socket;
