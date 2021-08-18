<template>
  <main class="bg-gray-800">
    <server-picker v-if="!connected" :rooms="rooms" @joined="joined" />
    <video-player :link="link" v-if="connected" />
  </main>
</template>

<script>
import ServerPicker from "./components/ServerPicker.vue";
import VideoPlayer from "./components/VideoPlayer.vue";
import socket from "./socket.js";
import "plyr/dist/plyr.css";

export default {
  components: {
    VideoPlayer,
    ServerPicker,
  },
  data() {
    return {
      rooms: [],
      connected: false,
      link: "",
    };
  },
  methods: {
    joined(link) {
      this.connected = true;
      this.link = link;
    },
  },
  mounted() {
    socket.on("rooms", (roomsEmitted) => {
      this.rooms = roomsEmitted;
    });
    socket.on("connect", () => {
      console.log("Socket connected");
    });
  },
};
</script>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>