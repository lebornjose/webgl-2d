
<template>
     <div class="content">
        <h2>canvas 导出为视频</h2>      
        <div class="video-list">
            <canvas ref="canvasRef" id="myCanvas"></canvas>

            <video v-if="videoUrl" controls :src="videoUrl" />
        </div>    
        <div class="flex">
            <!-- <a-button type="primary" @click="play">播放</a-button>
            <a-button type="primary" @click="pause">暂停</a-button>  -->
            <a-button type="primary" @click="generate">合成</a-button>
        </div>
    </div>    
</template>

<script lang="ts" setup>
import { AVCanvas } from '@webav/av-canvas';
import { AVRecorder } from '@webav/av-recorder';
import { onMounted, ref } from 'vue';


let canvas = null
console.log(canvas);
let avCvs: any = null
const videoUrl = ref('')
const loading = ref(false)
const draw = () => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 50, 50);
    if(loading.value) {
        requestAnimationFrame(draw);
    }
}

const generate = async() => {
    loading.value = true
    draw()
    const stream = canvas.captureStream();
    const recordedChunks = [];
    const options = { mimeType: 'video/webm; codecs=vp9' };
    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
    };

    mediaRecorder.start();

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: options.mimeType });
        const url = URL.createObjectURL(blob);
        videoUrl.value = url
        loading.value = false
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'canvasAnimation.webm';
        // document.body.appendChild(a);
        // a.click();
        // URL.revokeObjectURL(url);
        // document.body.removeChild(a);
    };

        // 停止录制
    setTimeout(() => {
        mediaRecorder.stop();
    }, 5000); // 录制 5 
}

onMounted(async() => {
    canvas =  document.getElementById('myCanvas') as any;
})

</script>
