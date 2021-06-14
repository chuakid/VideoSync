import { io } from "socket.io-client";
let socket = io(import.meta.env.VITE_HOST)

export default socket;
