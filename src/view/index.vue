

<template>
   <div>
      <div class="container">
        <h2>音视频demo</h2>
        <div class="list">
            <a-button type="primary" @click="toUrl('transition')">转场</a-button>
            <a-button type="primary" @click="toUrl('in_animation')">出场动画</a-button>
            <a-button type="primary" @click="toUrl('flip')">视频翻转</a-button>
            <a-button type="primary" @click="toUrl('mask')">蒙版</a-button>
            <a-button type="primary" @click="toUrl('filter')">滤镜</a-button>
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
            <a-button type="primary" @click="toUrl('webAvCanvasCamera')">摄像头录制</a-button>
            <a-dropdown placement="bottom">
                <a-button type="primary">canvas 导出为视频</a-button>
                <template #overlay>
                    <a-menu>
                        <a-menu-item>
                            <a href="javascript:;" @click="toUrl('canvasToVideo')">canvas 导出为视频</a>
                        </a-menu-item>
                        <a-menu-item>
                            <a href="javascript:;" @click="toUrl('canvasToMp4')">canvas 导出为视频1</a>
                        </a-menu-item>
                        <a-menu-item>
                            <a href="javascript:;" @click="toUrl('canvasMp4')">canvas 导出为视频2</a>
                        </a-menu-item>
                        <a-menu-item>
                            <a href="javascript:;" @click="toUrl('canvas2Mp4')">canvas 导出为视频3</a>
                        </a-menu-item>
                    </a-menu>
                   
                </template>
            </a-dropdown>
            <a-button type="primary" @click="toUrl('greenScreen')">绿幕抠图</a-button>
        </div>

        <video ref="videoRef" class="v" src="https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/algorithm_qn/process/20241014/1040g00g318j0t73hjk004a5e4kih2s3nm3jst6g_mute.mp4" controls/>
        <canvas width="360" height="720"  ref="canvasRef" />

        <a-button @click="start">绘制</a-button>
        <video src="https://mogic-algo-data.getmogic.com/yuxiaopu/font/gittest.mp4" controls autoplay loop></video>
      </div>
   </div>
</template>
<script type="ts" setup>
import { ref } from 'vue'
import { router } from '../router';

const canvasRef = ref(null)
const videoRef = ref(null)
const toUrl = (name) => {
    router.push({ name })
}
const start = () => {
    const ctx = canvasRef.value.getContext('2d')
    ctx.drawImage(videoRef.value, 0, 0, 360, 720)
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
.v{
    width: 360px;
    height: 720px;
}
</style>
