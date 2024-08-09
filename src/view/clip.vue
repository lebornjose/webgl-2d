<template>
    <div>使用webAV 截取视频关键帧</div>
     <div class="item">
        <div v-for="(item, idx) in imgList" :key="idx">
            <p>{{ item.ts / 1000 }}</p>
            <img :src="item.img"/>
        </div>
     </div>
    <div class="flex">
        <button @click="play">截帧</button>
    </div>      
</template>


<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { MP4Clip } from '@webav/av-cliper';


const videos = {
    'output': '/video/output.mp4'
}
const imgList: any = ref([])

const start = async () => {
    const clip = new MP4Clip((await fetch(videos['output'])).body!);
    await clip.ready;
    let t = performance.now();
    const list = await clip.thumbnails();
    const cost = ((performance.now() - t) / 1000).toFixed(2);
    return {
        list,
        cost,
    };
}

const play = async () => {
    const { list, cost } = await start();
    imgList.value = list.map((it:any) => {
        it.ts = it.ts
        it.img = URL.createObjectURL(it.img)
        return it
    })
    console.log(cost)
}

</script>
<style lang="css">
.item{
    display: flex;
    gap: 10px;
}
.item img{
    width: 100px;
    /* height: 100px; */
}
</style>
