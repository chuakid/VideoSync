<template>
  <div class="level picker">
    <div class="level-item">
      <div id="join">
        <p class="control field is-fullwidth">
          <input
            class="input"
            placeholder="Name"
            id="name"
            v-model="username"
          />
        </p>
        <p class="control field is-fullwidth select">
          <select class="input" id="roomSelect" v-model="roomId">
            <option disabled>Room</option>
            <option v-for="room in rooms" :key="room">
              {{ room }}
            </option>
          </select>
        </p>
        <p class="control">
          <button
            class="button is-outlined is-primary is-fullwidth"
            @click="joinRoom"
            id="joinRoom"
          >
            Join
          </button>
        </p>
      </div>
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
  mounted(){
    socket.on("roomJoinStatus", (link)=>{
      this.$emit("joined", link);
    })
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
  min-height: 100vh
}
</style>