<template>
   <div class="content">
        <div>使用webAV 实现视频解码帧序列图</div>
        
        <div class="img-list">
            <div class="item" v-for="(item, idx) in imgList" :key="idx">
                <div className="text-center">{{ (item.ts / 1e6).toFixed(2) }}s</div>
                <img :src="item.img"/>
            </div>
        </div>
        <p>运行时间：{{ time }}s</p>
        <div class="flex">
            <a-button type="primary" @click="play">本地视频截帧</a-button>
            <a-button type="primary" @click="originPlay">远程视频截帧</a-button>
        </div>
   </div>
</template>


<script lang="ts" setup>
import { ref } from 'vue';
import { MP4Clip } from '@webav/av-cliper';

const time:any = ref(0)
const videos = {
    'output': '/video/output.mp4',
    'origin': 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/algorithm_qn/process/20240723/1721715464214_mute.mp4'
}
const imgList = ref<any[]>([{
    img: 'https://mogic-static.oss-cn-hangzhou.aliyuncs.com/app-sass/dddd.png',
    ts: 0
}])
let clip:any = null

const play = async () => {
    const resp1 = await fetch(videos['output']);
    clip = new MP4Clip(resp1.body!);
    await clip.ready;
    let t = performance.now();
    const list = await clip.thumbnails(200, {
        start: 10e6,
        end: 20e6,
        step: 1e6,
    });
    const cost = ((performance.now() - t) / 1000).toFixed(2);
    imgList.value = list.map((it) => {
        it.img = URL.createObjectURL(it.img)
        return it
    })
    time.value = cost
    console.log('imgList', imgList.value)
    console.log('cost', cost)
}

const originPlay = async () => {
    const resp1 = await fetch(videos['origin']);
    clip = new MP4Clip(resp1.body!);
    await clip.ready;
    let t = performance.now();
    const list = await clip.thumbnails(200, {
        start: 10e6,
        end: 20e6,
        step: 1e6,
    });
    const cost = ((performance.now() - t) / 1000).toFixed(2);
    imgList.value = list.map((it) => {
        it.img = URL.createObjectURL(it.img)
        return it
    })
    time.value = cost
    console.log('imgList', imgList.value)
    console.log('cost', cost)
}

</script>

<style lang="css" scoped>
.content{
    width: 800px;
    margin: 30px auto;
}
.img-list{
    display: flex;
    height: 300px;
    gap: 10px;
}
.img-list .item{
    display: flex;
    flex-direction: column;
}
.img-list img{
    width: 200px;
    height: 200px;
}
.flex{
    display: flex;
    gap: 12px;
}
</style>

