
<template>
    <div>使用webAV 实现视频音画分离</div>

    <canvas
        className="w-full"
        width="360"
        height="720"
        ref="canvasRef"
    />

    <div class="flex">
        <button @click="playVideo">播放视频</button>
        <button @click="stopVideo">暂停播放视频</button>
        <button @click="playAudio">播放音频</button>
        <button @click="stopAudio">暂停播放音频</button>
    </div>
</template>
<script lang="js" setup>
import { ref, onMounted } from 'vue';
import { MP4Clip } from '@webav/av-cliper';

let videoTimer = 0;
let audioTimer = 0;
let audioSource = null;
const audioCtx = new AudioContext();
const canvasRef = ref(null)
let ctx = null
const videos = {
    'output': '/video/output.mp4'
}
let videoClip = null;
let audioTrackClip = null
const start = async () => {
    const clip = new MP4Clip((await fetch(videos['output'])).body);
    await clip.ready;
    const [videoClip1, audioTrackClip1] = await clip.splitTrack();
    videoClip = videoClip1
    audioTrackClip = audioTrackClip1
}

const stopVideo = () => {
  clearInterval(videoTimer);
}
const stopAudio = () => {
  clearInterval(audioTimer);
}
const playVideo = async () => {
    let startTime = performance.now();
    stopAudio();
    stopVideo();
    videoTimer = setInterval(async () => {
    const { state, video } = await videoClip.tick(
      Math.round((performance.now() - startTime) * 1000),
    );
    if (state === 'done') {
      clearInterval(videoTimer);
      return;
    }
    if (video != null && state === 'success') {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);
      video.close();
    }
  }, 1000 / 30);
}

const playAudio = async () => {
      // 当前片段的开始播放的时间
  let startAt = 0;
  let startTime = performance.now();

  stopAudio();
  stopVideo();
  audioTimer = setInterval(async () => {
    const { state, audio } = await audioTrackClip.tick(
      Math.round((performance.now() - startTime) * 1000),
    );
    if (state === 'done') {
      clearInterval(audioTimer);
      return;
    }
    const len = audio?.[0]?.length ?? 0;
    if (len === 0) return;
    const buf = audioCtx.createBuffer(2, len, 48000);
    buf.copyToChannel(audio[0], 0);
    buf.copyToChannel(audio[1], 1);
    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = buf;
    audioSource.connect(audioCtx.destination);
    startAt = Math.max(audioCtx.currentTime, startAt);
    audioSource.start(startAt);

    startAt += buf.duration;
  }, 1000 / 30);
}

onMounted(() => {
    ctx = canvasRef.value.getContext('2d')
    start()
})
</script>
