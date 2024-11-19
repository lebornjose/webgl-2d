<template>
    <div class="m-room-wrapper">
        <div class="can-support-rtc" v-if="canSupportVideo">
            <div class="form-area" v-if="showFormArea">
                <a-form>
                    <a-form-item label="房间Id">
                        <a-input v-model="roomForm.roomId" :disabled="!canClickBtn"/>
                    </a-form-item>
                    <a-form-item label="昵称">
                       <a-input v-model="roomForm.nickname" :disabled="!canClickBtn"/>
                    </a-form-item>
                    <a-form-item>
                        <a-button type="primary" @click="submitForm" :disabled="!canClickBtn">加入房间</a-button>
                        <a-button @click="resetForm">重置</a-button>
                    </a-form-item>
                </a-form>
            </div>
            <div class="list-area" v-if="!showFormArea">
                <h2>当前房间id: {{ roomForm.roomId }} </h2>
                <h2>在线人数: {{ roomUsers.length }} </h2>
                <div class="box-card">
                    <div v-for="item in roomUsers" :key="item.sockId" class="item">
                        {{ item.userName }}
                    </div>
                </div>
                <el-button type="primary" v-if="roomUsers.length > 1 && sockId" @click="toSendVideo">
                    发起视频
                </el-button>
            </div>
        </div>   
        <div v-else>
            <h1>当前域名的浏览器不支持WebRTC！</h1>
        </div> 
    </div>
</template>

<script setup>
import socket from '../../utils/socket'
import { onMounted, ref, reactive } from 'vue'


const sockId = ref('') // 客户端id
const localStream = ref(null) // 本地视频流
const canSupportVideo = ref(false) // 是否支持视频
const showFormArea = ref(true) // 是否显示表单
const roomUsers = ref([]) // 房间在线用户
const canClickBtn = ref(true) // 是否可以点击按钮
const peer = ref(null) // peer

// 房间信息
const roomForm = reactive({
    roomId: '',
    nickname: ''
})

const getDevices = async () => {
    try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    VIDEO_VIEW.showDevicesNameByDevices(devices);
    } catch (error) {
    console.error(error);
    const msg = `getDevices error: ${error.name} : ${error.message}`;
    this.$message.error(msg);
    }
}

const canSupportWebRTC = () => {
    if (typeof navigator.mediaDevices !== 'object') {
    this.$message.error('No navigator.mediaDevices');
    return false;
    }
    if (typeof navigator.mediaDevices.enumerateDevices !== 'function') {
    this.$message.error('No navigator.mediaDevices.enumerateDevices');
    return false;
    }
    if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
    this.$message.error('No navigator.mediaDevices.getUserMedia');
    return false;
    }
    canSupportVideo.value = true;
    getDevices();
    return true;
}
const createLocalVideoStream = async () => {
    const constraints = { audio: true, video: true };
    const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return localStream;
}
const initPeerListen = () => {
    peer.value.onicecandidate = (event) => {
        if (event.candidate) { 
            socket.emit('addIceCandidate', { candidate: event.candidate, user: user.value }); 
        }
    };
    peer.value.onaddstream = (event) => {
        // 拿到对方的视频流
        document.querySelector('#echat-remote-1').srcObject = event.stream;
    };
    this.peer.onclose = () => {};
}
const initSocketEvents = () => {
    // 离开页面
    window.onbeforeunload = () => {
        socket.emit('userLeave', {
            userName: this.roomForm.userName,
            sockId: this.sockId,
            roomId: this.roomForm.roomId,
        });
    };
    // 连接成功
    socket.on('connectionSuccess', (sockId) => {
        sockId.value = sockId;
        console.log('connectionSuccess client sockId:', sockId);
    });
    // 检查房间成功
    socket.on('checkRoomSuccess', (exsitRoomUsers) => {
        debugger
        this.canClickBtn = true;
        if (exsitRoomUsers && exsitRoomUsers.length > 1) {
          this.$message.info('当前房间人数已满~请换个房间id');
        } else {
          showFormArea.value = false;
          roomUsers.value = [
            {
              userName: roomForm.userName + '(我)',
              sockId: sockId.value,
              roomId: roomForm.roomId,

            }
          ];
        }
    });
    // 加入房间成功
    socket.on('joinRoomSuccess', (roomUsers) => {
        console.log('joinRoomSuccess client user:', roomUsers);
        const otherUser = roomUsers.find(item => item.sockId !== this.sockId);
        if (!otherUser) return false;
        this.$message.success(`${otherUser.userName}加入了房间`);
        roomUsers.value = [otherUser, {
          userName: roomForm.userName + '(我)',
          sockId: sockId.value,
          roomId: roomForm.roomId,
        }];
    });
    // 用户离开
    socket.on('userLeave', (roomUsers) => {
        console.log('userLeave client user:', roomUsers);
        if (!roomUsers.value.length) {
          showFormArea.value = true;
          sockId.value = '';
        }
        const serverSockIdArr = roomUsers.map(item => item.sockId);
        roomUsers.value.forEach(item => {
          if (serverSockIdArr.indexOf(item.sockId) === -1) {
            this.$message.info(`${item.userName}离开了房间`);
            if (item.sockId === this.sockId) {
              showFormArea.value = true;
              sockId.value = '';
            }
          }
        });
        roomUsers.value = roomUsers;
        roomUsers.value.forEach((item) => {
          if (item.sockId === sockId.value) {
            item.userName = item.userName + '(我)';
          }
        });
        // TODO: 挂断视频
        VIDEO_VIEW.hideAllVideoModal();
    });
     // 取消发送视频
    socket.on('cancelSendVideo', (user) => {
        const infoTips = user.sockId === sockId ? '您取消了发送视频' : '对方取消了发送视频';
        this.$message.info(infoTips);
        VIDEO_VIEW.hideAllVideoModal();
    });
    // 接收视频邀请
    socket.on('receiveVideo', (sender) => {
        if (this.user.sockId === sender.sockId) return false;
        VIDEO_VIEW.showReceiveVideoModalBySender(sender);
    });
     // 拒绝接收视频
    socket.on('rejectReceiveVideo', (user) => {
        const infoTips = user.sockId === sockId.value ? '您拒绝了接收视频' : '对方拒绝了接收视频';
        this.$message.info(infoTips);
        VIDEO_VIEW.hideAllVideoModal();
    });
    // 接听视频
    socket.on('answerVideo', async (user) => {
        VIDEO_VIEW.showInvideoModal();
        // 创建本地视频流信息
        const localStream = await createLocalVideoStream();
        localStream.value = localStream
        peer.value = new RTCPeerConnection()
        console.log(peer.value)
        initPeerListen()
        peer.value.addStream(this.localStream)
        if (user.sockId === this.sockId) {
          // 接收方
        } else {
          // 发送方 创建offer
          const offer = await peer.value.createOffer(this.offerOption);
          await peer.value.setLocalDescription(offer);
          socket.emit('receiveOffer', { user: this.user, offer });
        }
    });
}

onMounted(() => {
    if(canSupportWebRTC()) {
        initSocketEvents()
    }
})
</script>

<style>
.m-room-wrapper{
    width: 880px;
    margin: 20px auto!important;
}
.m-room-wrapper .box-card {
    width: 480px;
}
.m-room-wrapper .box-card .item{
    padding: 18px 0;
}
.ant-form-item-control-input-content{
    display: flex;
    gap: 12px;
}
</style>
