<template>
  <div class="flex justify-center items-center min-h-screen">
    <div id="join" class="bg-gray-700 rounded p-5">
      <p class="mb-3">
        <input class="bg-gray-600 p-2 text-white w-full hover:bg-gray-500 transition" placeholder="Name" id="name" v-model="username" />
      </p>
      <p class="mb-3">
        <select class="bg-gray-600 py-2 pl-2 text-white w-full hover:bg-gray-500 transition cursor-pointer" id="roomSelect" v-model="roomId">
          <option disabled>Room</option>
          <option v-for="room in rooms" :key="room">
            {{ room }}
          </option>
        </select>
      </p>
      <p class="block">
        <button class="py-2 px-2 border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition w-full" @click="joinRoom" id="joinRoom">Join</button>
      </p>
    </div>
  </div>
</template>

<script>
import socket from "../socket";
export default {
  data() {
    return {
      roomId: "Room",
      username: null,
    };
  },
  props: {
    rooms: Array,
  },
  mounted() {
    socket.on("roomJoinStatus", (link) => {
      this.$emit("joined", link);
    });
  },
  methods: {
    joinRoom() {
      if (this.roomId != "Room") {
        socket.emit("join", {
          roomId: this.roomId,
          name: this.username,
        });
      }
    },
  },
  emits: {
    joined: null,
  },
};
</script>

<style>
.picker {
  min-height: 100vh;
}
</style>