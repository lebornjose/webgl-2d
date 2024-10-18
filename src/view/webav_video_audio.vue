
<template>
    <div class="container">
        <h2 class="title">使用webAv 实现视频和音频拼接的合成</h2>
        <div class="list">
            <div class="item">
               <a href="/video/video_mute.mp4" target="_blank">视频</a>
            </div>
            <div class="item">
               <a href="https://mogic-spider.getmogic.com/jy/0_norm_bgm/sameDB/20140828/6597920609991133965.mp3" target="_blank">音频</a>
            </div>
        </div>

        <a-button @click="start" type="primary">合成</a-button>
        
        <a-spin tip="视频合成中" :spinning="loading">
            <div class="video-con" v-if="videoUrl">
                <video :src="videoUrl" controls/>
            </div>
        </a-spin>
     
    </div>

</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  AudioClip,
  Combinator,
  MP4Clip,
  OffscreenSprite,
} from '@webav/av-cliper';

// 音频url
const audioUrl = 'https://mogic-spider.getmogic.com/jy/0_norm_bgm/sameDB/20140828/6597920609991133965.mp3'

const videoUrl = ref('')
const loading = ref(false)
const start = async () => {
  console.log('合成中...')
  loading.value = true
  const videoSpr = new OffscreenSprite(
    new MP4Clip((await fetch('/video/video_mute.mp4')).body!),
  );
  videoSpr.time.duration = 10e6;
  const audioSpr = new OffscreenSprite(
    new AudioClip((await fetch(audioUrl)).body!, {
      loop: true,
    }),
  );
  const com = new Combinator({
    width: 720,
    height: 1280,
  });
  await com.addSprite(videoSpr, { main: true });
  await com.addSprite(audioSpr);
  const timeStart = performance.now();
  debugger
  const srcBlob = await new Response(com?.output()).blob();

  const url = URL.createObjectURL(srcBlob)
  console.log(url)
  videoUrl.value = url
//   return com;
    loading.value = false
  console.log(`合成耗时: ${Math.round(performance.now() - timeStart)}ms`)
}
</script>

<style lang="css" scoped>
.container{
    width: 800px;
    margin: 40px auto;
}
.video-con{
    width: 180px;
    height: 360px;
    margin-top: 10px;
}
.video-con video {
    width: 180px;
    height: 360px;
}
</style>
