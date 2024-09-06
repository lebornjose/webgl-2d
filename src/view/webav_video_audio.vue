
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
    </div>

</template>

<script lang="ts" setup>
import {
  AudioClip,
  Combinator,
  MP4Clip,
  OffscreenSprite,
} from '@webav/av-cliper';
// 音频url
const audioUrl = 'https://mogic-spider.getmogic.com/jy/0_norm_bgm/sameDB/20140828/6597920609991133965.mp3'


const start = () => {

}
</script>

<style lang="css" scoped>
.container{
    width: 800px;
    margin: 40px auto;
}
</style>
