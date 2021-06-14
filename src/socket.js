import { io } from "socket.io-client";
let socket = io(import.meta.env.VITE_HOST)

socket.on("roomJoinStatus", (status) => {
    console.log("Joined room");
});

export default socket;
