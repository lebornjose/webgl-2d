<template>
    <div>使用webgl 实现视频的裁剪功能</div>
    <canvas id="webgl"></canvas>
    <div class="flex">
      <button @click="play">播放</button>
      <button @click="pause">播放</button>
    </div>
</template>

<script lang="ts" setup>

let video: HTMLVideoElement
const play = () => {
    video.play();
}
const pause = () => {
  video.pause();
}

</script>
