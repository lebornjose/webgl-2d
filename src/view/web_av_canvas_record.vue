
<template>
   <div class="content">
      <h2>使用webAV 实现视频录制canvas视频</h2>
      <div class="list">
         <a-button type="primary" @click="addVideo">添加视频</a-button>
         <a-button type="primary" @click="start" :disabled="loading">{{ loading ? '录制中' :  '开始录制'}} </a-button>
         <a-button type="primary" @click="stop">暂停录制</a-button>

          
      </div>
      <canvas></canvas>
      <div
        ref="initCvs"
        class="video-container"
      >
         <!-- <video src="/public/video/output.mp4" ref="videoRef" muted loop autoplay/> -->
      </div>
   </div>
</template>

<script type="ts" setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { AVCanvas } from '@webav/av-canvas';
import { AVRecorder } from '@webav/av-recorder';
import {
  MediaStreamClip,
  VisibleSprite,
  createEl,
} from '@webav/av-cliper';
import { onMounted } from 'vue';
const initCvs = ref()
const videoRef = ref()
let avCvs = null
let recorder = null
const loading = ref(false) // 录制中
let videoEl = null
const loadFile = async (accept) => {
   const [fileHandle] = await window.showOpenFilePicker({
    types: [{ accept }],
  });
  return (await fileHandle.getFile());
}
const start = async() => {
   if (avCvs == null) return;
   loading.value = true
   await videoEl.play();
   const fileHandle = await window.showSaveFilePicker({
    suggestedName: `WebAV-${Date.now()}.mp4`,
   });
  const writer = await fileHandle.createWritable();
  recorder = new AVRecorder(avCvs.captureStream(), {
    bitrate: 5e6,
  });
  console.log('writer', writer)
  recorder.start().pipeTo(writer).catch(console.error);
}

const stop = async() => {
   loading.value = false
   videoEl.pause();
   await recorder?.stop();
   message.success('录制完成')
}

const addVideo = async () => {
   videoEl = createEl('video');
   videoEl.src =  '/public/video/output.mp4'
   videoEl.loop = true;
   videoEl.autoplay = true;
   // videoEl.width = 240
   await videoEl.play();
   const spr = new VisibleSprite(
      // @ts-ignore
      new MediaStreamClip(videoEl.captureStream()),
   );
   await videoEl.pause();
   await avCvs.addSprite(spr);
}
onMounted(async() => {
   avCvs = new AVCanvas(initCvs.value, {
    bgColor: '#333',
    width: 1920,
    height: 1080,
  });
  avCvs.play({ start: 0, end: Infinity });
})
</script>

<style lang="css" scoped>
.content{
    width: 800px;
    margin: 40px auto;
}
.list{
   display: flex;
   gap: 12px;
}
.video-container{
   width: 900px;
   height: 500px;
   position: 'relative';
}

.video-container video{
   width: 280px;
   position: absolute;
   z-index: 1;
   left: 40%;
}
</style>
