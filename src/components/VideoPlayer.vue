<template>
  <div class="columns is-gapless container mw100">
    <div id="peopleList" class="is-1 has-background-dark">
      <p class="card-header-title">Room Participants</p>
      <div>
        <div v-for="person in namelist" :key="person" class="person">
          {{ person }}
        </div>
      </div>
    </div>
    <div id="viewer" class="column">
      <div class="plyr__video-embed" id="player">
        <iframe
          src="https://www.youtube.com/embed/bTqVqk7FSmY?"
          allowtransparency
          allow="autoplay"
        ></iframe>
      </div>
      <div class="is-relative">
        <input
          placeholder="Change video"
          class="input is-info"
          id="youtubelink"
          @input="userChangedVideoLink"
          v-on:keyup.enter="userChangedVideo"
          v-model="youtubeLinkInput"
        />
        <div
          style="margin: 0; height: 100px"
          id="videoPreview"
          class="is-flex is-clickable has-background-dark"
          v-if="showPreview"
          v-on:click="changeVideo()"
        >
          <img :src="imgSrc" />
          <div class="column">
            <h2 class="is-size-5 has-text-info">
              {{ channelTitle }}
            </h2>
            <p class="">{{ videoTitle }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- </div>
    <button class="button" id="change" @click="userChangedVideo">Change Video</button>
  </div> -->
</template>

<script>
import Plyr from "plyr";
import axios from "axios";
import socket from "../socket.js";
import getVideoId from "get-video-id";
let emitSeek = true;
let emitPause = true;
let player;
export default {
  data() {
    return {
      youtubeLinkInput: "",
      namelist: [],
      imgSrc: "",
      videoTitle: "",
      showPreview: false,
      channelTitle: "",
    };
  },
  methods: {
    userChangedVideoLink() {
      let id = getVideoId(this.youtubeLinkInput).id;
      if (id) {
        this.showPreview = true;
        this.imgSrc = "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
        axios
          .get(
            "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" +
              id +
              "&key=" +
              import.meta.env.VITE_API_KEY
          )
          .then((response) => {
            this.videoTitle = response.data.items[0].snippet.title;
            this.channelTitle = response.data.items[0].snippet.channelTitle;
          });
      } else {
        this.imgSrc = "";
        this.showPreview = false;
      }
    },
    userChangedVideo() {
      let id = this.changeVideo();
      socket.emit("linkChange", id);
    },
    changeVideo(id = null) {
      this.showPreview = false;
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
.person {
  display: block;
  margin: 10px;
}
#videoPreview {
  position: absolute;
  bottom: 100%;
  width: auto;
}
#videoPreview:hover{
  cursor: pointer;
}
#videoPreview:hover h2 {
  color: white !important;
}

.input {
  height: 30px;
}

.mw100 {
  min-width: 100%;
}
</style>