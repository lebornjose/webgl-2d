
<template>
   <div class="content">
      <h2>canvas 导出为视频</h2>
      <div class="list">
        <a-button @click="start">启动</a-button>
      </div>
      <video
        v-if="videoSrc"
        :src="videoSrc"
        controls
        autoPlay
      ></video>
      
   </div>
</template>

<script lang="ts" setup>
import {  OffscreenSprite, Combinator } from '@webav/av-cliper';
import CountdownClip from './CountDown'
import { ref } from 'vue';
const WIDTH = 1280;
const HEIGHT = 720;
const com = ref(null)
const videoSrc = ref<string | null>(null)

const build = async (com) => {
  const timeStart = performance.now();
  const srcBlob = await new Response(com?.output()).blob();
  console.log(URL.createObjectURL(srcBlob))
  const url = URL.createObjectURL(srcBlob)
  videoSrc.value = url
  console.log(`合成耗时: ${Math.round(performance.now() - timeStart)}ms`);
}
const start = async() => {
    const spr = new OffscreenSprite(new CountdownClip(5));
    const com = new Combinator({ width: WIDTH, height: HEIGHT });
    await com.addSprite(spr, { main: true });
    await build(com)
}
</script>
<style lang="css" scoped>
.content{
  width: 800px;
  margin: 40px auto;
}
</style>
