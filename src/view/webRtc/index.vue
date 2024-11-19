<template>
    <div class="web-rtc">
        <div class="web-rtc-video"> 
            <div class="web-rtc-video-btn">
              <a-button type="primary" @click="createVideo">创建视频</a-button>
              <a-button type="primary" @click="receiveVideo">接收视频</a-button>
              <a-button type="primary" v-if="type === 0" >结束</a-button>
            </div>
            <div v-if="type === 0">
              <p> 我的本地视频：</p>
              <video ref="localVideo" autoplay muted></video>
            </div>
             
            <div v-if="type === 1">
              <p>远程连接拿到我的本地视频</p>
              <video ref="remoteVideo" autoplay muted></video>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
const localVideo = ref(null);
const remoteVideo = ref(null);
let localStream = null

const type = ref(null) // 0 播放端 1 录制端

const createPeerConnection = async () => {
  const peerA = new RTCPeerConnection()
  const peerB = new RTCPeerConnection()

  // 添加本地媒体流
  localStream.getTracks().forEach((track) => {
    peerA.addTrack(track, localStream)
  })

  // 监听 ice 候选项事件
  peerA.onicecandidate = (event) => {
    if (event.candidate) {
      peerB.addIceCandidate(event.candidate) // 设置 ice 候选项
    }
  }

  // 监听获取媒体数据（前提是peerA已添加了媒体流数据）
  peerB.ontrack = (event) => {
    remoteVideo.value.srcObject = event.streams[0]
    // document.getElementById('local-from-remote').srcObject = event.streams[0]
  }
  /**
   * 媒体协商（交换SDP）
   */
  const offer = await peerA.createOffer()
  await peerA.setLocalDescription(offer)

  await peerB.setRemoteDescription(offer)
  const answer = await peerB.createAnswer()
  await peerB.setLocalDescription(answer)

  await peerA.setRemoteDescription(answer)
}


const createVideo = async () => {
  type.value = 0
  localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
  });
  localVideo.value.srcObject = localStream;  localVideo.value.srcObject = localStream;    
  await createPeerConnection()
}

const receiveVideo = async () => {
  type.value = 1
  await createPeerConnection()
}

onMounted(async() => {
    console.log(localVideo.value);
    // 显示数据源，localVideo 是 html 中的 video 标签
})
</script>

<style scoped>
.web-rtc-video {
  margin: 20px auto;
  width: 1000px;
}
.web-rtc-video-btn {
  display: flex;
  gap: 12px;

}
</style>