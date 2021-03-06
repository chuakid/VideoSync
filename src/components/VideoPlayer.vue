<template>
  <div id="peopleList">
    <h2>Room Participants</h2>
    <div v-for="person in namelist" :key="person" class="person">
      {{ person }}
    </div>
  </div>

  <div id="viewer">
    <div class="plyr__video-embed" id="player">
      <iframe
        src="https://www.youtube.com/embed/bTqVqk7FSmY?"
        allowtransparency
        allow="autoplay"
      ></iframe>
    </div>
    <input
      id="youtubelink"
      v-on:keyup.enter="userChangedVideo"
      v-model="youtubeLinkInput"
    />
    <button id="change" @click="userChangedVideo">Change Video</button>
  </div>
</template>

<script>
import Plyr from "plyr";
import socket from "../socket.js";
let emitSeek = true;
let emitPause = true;

export default {
  data() {
    return {
      youtubeLinkInput: "",
      namelist: [],
    };
  },
  methods: {
    userChangedVideo() {
      let id = this.changeVideo();
      socket.emit("linkChange", id);
    },
    changeVideo(id = null) {
      if (!id) {
        id =
          this.youtubeLinkInput != ""
            ? youtubeLinkInput.split("?v=")[1]
            : "dQw4w9WgXcQ";
      }

      player.source = {
        type: "video",
        sources: [
          {
            src: id,
            provider: "youtube",
          },
        ],
      };
      emitSeek = true;
      emitPause = true;
      return id;
    },
  },
  mounted() {
    const player = new Plyr("#player");

    socket.on("clientJoined", (namelist) => {
      this.namelist = namelist;
    });

    //Change link if someone else changes link
    socket.on("linkChanged", (link) => {
      this.changeVideo(link);
    });

    socket.on("seek", (data) => {
      emitSeek = false;
      player.currentTime = data;
    });
    player.on("seeked", () => {
      if (emitSeek) socket.emit("seek", player.currentTime);
      emitSeek = true;
    });

    player.on("playing", () => {
      socket.emit("playing");
    });
    socket.on("playing", () => {
      player.play();
    });

    player.on("pause", () => {
      if (emitPause) socket.emit("pause");
      else emitPause = true;
    });
    socket.on("pause", () => {
      emitPause = false;
      player.pause();
    });
  },
};
</script>

<style scoped>
#peopleList {
  position: absolute;
  top: 10px;
  left: 20px;
  background: rgb(0, 0, 54);
}
#youtubelink {
  background-color: #7c7c7c;
  border: none;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}

#viewer {
  min-width: 50vw;
}

.person {
  background: #313131;
  border-radius: 10px;
  text-align: center;
}
</style>