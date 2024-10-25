<template>
    <div>使用webAV 实现视频解码播放</div>

        <canvas
          width="360"
          height="720"
          ref="canvasRef"/>

    <div class="flex">
        <button @click="play">播放</button>
        <button @click="pause">暂停</button>
    </div>
</template>


<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { MP4Clip } from '@webav/av-cliper';


const videos = {
    'output': '/video/output.mp4'
}

const canvasRef = ref(null)
let clip:any = null
let stop = () => {};
let ctx:any = null


// 解码视频播放
const fastestDecode = async() => {
    let time = 0;
    let stopted = false;

    stop = () => (stopted = true);

    while (!stopted) {
      const { state, video } = await clip.tick(time);
      if (state === 'done') break;
      if (video != null && state === 'success') {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(
          video,
          0,
          0,
          video.codedWidth,
          video.codedHeight,
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height,
        );
        video.close();
      }
      time += 33000;
    }
    clip.destroy();
}

const timesSpeedDecode = async(times: number) => {
    let startTime = performance.now();
    const timer = setInterval(async () => {
      const { state, video } = await clip.tick(
        Math.round((performance.now() - startTime) * 1000) * times,
      );
      if (state === 'done') {
        clearInterval(timer);
        clip.destroy();
        return;
      }
      if (video != null && state === 'success') {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(
          video,
          0,
          0,
          video.codedWidth,
          video.codedHeight,
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height,
        );
        video.close();
      }
    }, 1000 / 30);

    stop = () => {
      clearInterval(timer);
      clip.destroy();
    };
}
const play = async () => {
    // debugger
    const resp1 = await fetch(videos['output']);
    clip = new MP4Clip(resp1.body!);
    await clip.ready;

    timesSpeedDecode(1)
    // fastestDecode()
}

const pause = () => {

}

onMounted(() => {
    ctx = canvasRef.value?.getContext('2d')
})

</script>
