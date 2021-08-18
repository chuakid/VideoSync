<template>
  <div class="flex flex-col md:flex-row min-h-screen max-h-screen">
    <div class="text-white max-w-28 p-2">
      <h2 class="text-lg">Users</h2>
      <ul>
        <li v-for="person in namelist" :key="person" class="inline-block mr-2 md:mr-0 md:block md:mt-2 rounded px-1 break-all bg-yellow-800">
          {{ person }}
        </li>
      </ul>
    </div>
    <div id="viewer" class="flex-1 flex flex-col">
      <div class="plyr__video-embed" id="player">
        <iframe v-bind:src="'https://www.youtube.com/watch?v=' + link" allowtransparency></iframe>
      </div>

      <div class="relative">
        <input
          placeholder="Change video"
          class="w-full p-1"
          id="youtubelink"
          @input="userChangedVideoLink"
          @keyup.enter="userChangedVideo"
          v-model="youtubeLinkInput"
        />
        <div
          class="absolute flex bg-gray-800 h-24 transition bottom-full hover:bg-gray-700 cursor-pointer"
          v-if="showPreview"
          v-on:click="userChangedVideo()"
        >
          <img class="inline-block" :src="imgSrc" />
          <div class="p-2">
            <h2 class="text-blue-500 text-xl">
              {{ videoTitle }}
            </h2>
            <p class="text-white">Channel: {{ channelTitle }}</p>
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
  props: {
    link: String,
  },
  methods: {
    userChangedVideoLink() {
      let id = getVideoId(this.youtubeLinkInput).id;
      if (!id) {
        this.imgSrc = "";
        this.showPreview = false;
        return;
      }

      this.imgSrc = "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
      axios
        .get(
          "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&key=" + import.meta.env.VITE_API_KEY
        )
        .then((response) => {
          if (!response.data.pageInfo.resultsPerPage) {
            this.imgSrc = "";
            this.showPreview = false;
          } else {
            this.showPreview = true;
            this.videoTitle = response.data.items[0].snippet.title;
            this.channelTitle = response.data.items[0].snippet.channelTitle;
          }
        });
    },
    userChangedVideo() {
      let id = this.changeVideo();
      socket.emit("linkChange", id);
    },
    changeVideo(id = null) {
      this.showPreview = false;
      if (!id) {
        id = this.youtubeLinkInput != "" ? getVideoId(this.youtubeLinkInput).id : "dQw4w9WgXcQ";
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
    player = new Plyr("#player", {
      settings: ["captions", "quality", "speed", "loop"],
    });
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
#player {
  flex: 1;
}
</style>