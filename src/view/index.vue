

<template>
   <div>
      <div class="container">
        <h2>音视频demo</h2>
        <div class="list">
            <a-button type="primary" @click="toUrl('transition')">转场</a-button>
            <a-button type="primary" @click="toUrl('in_animation')">出场动画</a-button>
            <a-button type="primary" @click="toUrl('flip')">视频翻转</a-button>
            <a-button type="primary" @click="toUrl('mask')">蒙版</a-button>
            <a-button type="primary" @click="toUrl('cir_mask')">圆形蒙版</a-button>
            <a-button type="primary" @click="toUrl('color')">视频色值调整</a-button>
            <a-button type="primary" @click="toUrl('effect')">九宫格特效</a-button>
            <a-button type="primary" @click="toUrl('crop')">视频裁剪</a-button>
            <a-button type="primary" @click="toUrl('matrix')">平移, 缩放，旋转</a-button>
        </div>
        <h2>webCodecs</h2>
        <div class="list">   
            <a-button type="primary" @click="toUrl('WebAv')">视频解码播放</a-button>
            <a-button type="primary" @click="toUrl('clip')">视频关键帧</a-button>
            <a-button type="primary" @click="toUrl('webAvFrame')">解码帧序列图</a-button>
            <a-button type="primary" @click="toUrl('webAvSpilt')">音画分离</a-button>
            <a-button type="primary" @click="toUrl('webAvVideoAudio')">画面音频合成</a-button>
            <a-button type="primary" @click="toUrl('webAvCanvasRecord')">canvas录制</a-button>
        </div>
      </div>
   </div>
</template>
<script type="ts" setup>
import { router } from '../router';

const toUrl = (name) => {
    router.push({ name })
}
</script>
<style lang="css" scoped>
.container{
    width: 1000px;
    padding: 40px;
    margin: 20px auto;
}
.container h2{
    margin-top: 30px;
}
.container .list{
    display: flex;
    gap: 8px;
}
</style>
