<template>
    <div class="content">
       <h2>使用webAV 实现摄像头录制</h2>
       <div class="list">
          <a-button type="primary" @click="start" :disabled="loading">{{ loading ? '录制中' :  '开始录制'}} </a-button>
          <a-button type="primary" @click="stop">暂停录制</a-button>
       </div>
       <video ref="videoRef" muted class="video-con"></video>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { AVRecorder } from '@webav/av-recorder';

const videoRef = ref<any>(null)
const loading = ref(false) // 录制中
let recorder: AVRecorder | null = null;


const createFileWriter = async(
  extName = 'mp4',
): Promise<FileSystemWritableFileStream>  => {
  const fileHandle = await (window as any).showSaveFilePicker({
    suggestedName: `WebAV-export-${Date.now()}.${extName}`,
  });
  return fileHandle.createWritable();
}
const start = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
    loading.value = true
    const recodeMS = mediaStream.clone();
    videoRef.value.srcObject = mediaStream;
    videoRef.value.play().catch(console.error);

    recorder = new AVRecorder(recodeMS);

    recorder
    .start()
    .pipeTo(await createFileWriter())
    .catch(console.error);
}

const stop = () => {
    loading.value = false
    recorder?.stop();
    videoRef.value.srcObject = null;
}
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
.video-con{
  margin-top: 30px;
  width: 600px;
  height: 320px;
}
</style>
