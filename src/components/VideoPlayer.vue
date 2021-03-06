<template>
  <div id="peopleList" class="card">
    <header class="card-header">
      <p class="card-header-title">Room Participants</p>
      </header>
    <div class="card-content">
      <div v-for="person in namelist" :key="person" class="person tag is-info">
        {{ person }}
      </div>
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
    <input class="input is-info"
      id="youtubelink"
      v-on:keyup.enter="userChangedVideo"
      v-model="youtubeLinkInput"
    />
    <button class="button" id="change" @click="userChangedVideo">Change Video</button>
  </div>
</template>

<script>
import Plyr from "plyr";
import socket from "../socket.js";
import getVideoId  from "get-video-id";
let emitSeek = true;
let emitPause = true;
let player;
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
            ? getVideoId(this.youtubeLinkInput).id
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
    player = new Plyr("#player");

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
#viewer {
  min-width: 50vw;
}
#peopleList {
  position: absolute;
  top: 50px;
}
</style>