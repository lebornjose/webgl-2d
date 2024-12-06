<template>
    <div class="m-room-wrapper">
        <div class="can-support-rtc" v-if="canSupportVideo">
            <div class="form-area" v-if="showFormArea">
                <a-form>
                    <a-form-item label="房间Id">
                        <a-input v-model:value="roomForm.roomId" :disabled="!canClickBtn" />
                    </a-form-item>
                    <a-form-item label="昵称">
                        <a-input v-model:value="roomForm.nickname" :disabled="!canClickBtn" />
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
                {{ roomUsers.length }}
                <a-button type="primary" v-if="sockId" @click="toSendVideo">
                    发起视频
                </a-button>
            </div>
        </div>
        <div v-else>
            <h1>当前域名的浏览器不支持WebRTC！</h1>
        </div>
    </div>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { computed, reactive, ref } from 'vue';
import socket from '../../utils/socket';


const sockId = ref('') // 客户端id
const localStream = ref(null) // 本地视频流
const canSupportVideo = ref(false) // 是否支持视频
const showFormArea = ref(true) // 是否显示表单
const roomUsers = ref([]) // 房间在线用户
const canClickBtn = ref(true) // 是否可以点击按钮
const peer = ref(null) // peer

const offerOption = ref({
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
})

const user = computed(() => {
    return Object.assign({}, { sockId: sockId.value }, roomForm);
})
const receiveUser = computed(() => {
    return roomUsers.value.find(item => item.sockId !== sockId.value)
})
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
        message.error(msg);
    }
}

const canSupportWebRTC = () => {
    if (typeof navigator.mediaDevices !== 'object') {
        message.error('No navigator.mediaDevices');
        return false;
    }
    if (typeof navigator.mediaDevices.enumerateDevices !== 'function') {
        message.error('No navigator.mediaDevices.enumerateDevices');
        return false;
    }
    if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
        message.error('No navigator.mediaDevices.getUserMedia');
        return false;
    }
    canSupportVideo.value = true;
    getDevices();
    return true;
}
const createLocalVideoStream = async () => {
    const constraints = { audio: true, video: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
}
const initPeerListen = () => {
    debugger
    peer.value.onicecandidate = (event) => {
        debugger
        if (event.candidate) {
            socket.emit('addIceCandidate', { candidate: event.candidate, user: user.value });
        }
    };
    peer.value.onaddstream = (event) => {
        // 拿到对方的视频流
        debugger
        document.querySelector('#echat-remote-1').srcObject = event.stream;
    };
    peer.value.onclose = () => {
        debugger
     };
}
const initSocketEvents = () => {
    // 离开页面
    window.onbeforeunload = () => {
        socket.emit('userLeave', {
            userName: roomForm.userName,
            sockId: sockId.value,
            roomId: roomForm.roomId,
        });
    };
    console.log('socket', socket)
    // 连接成功
    socket.on('connectionSuccess', (id) => {
        sockId.value = id;
        console.log('connectionSuccess client sockId:', sockId);
    });
    socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
    });
    // 检查房间成功
    socket.on('checkRoomSuccess', (exsitRoomUsers) => {
        canClickBtn.value = true;
        if (exsitRoomUsers && exsitRoomUsers.length > 1) {
            message.info('当前房间人数已满~请换个房间id');
        } else {
            showFormArea.value = false;
            roomUsers.value = [
                {
                    userName: roomForm.nickname + '(我)',
                    sockId: sockId.value,
                    roomId: roomForm.roomId,
                }
            ];
        }
    });
    // 加入房间成功
    socket.on('joinRoomSuccess', (users) => {
        const otherUser = users.find(item => item.sockId !== sockId.value);
        if (!otherUser) return false;
        message.success(`${otherUser.userName}加入了房间`);
        roomUsers.value = [otherUser, {
            userName: roomForm.nickname + '(我)',
            sockId: sockId.value,
            roomId: roomForm.roomId,
        }];
        console.log(roomUsers.value.length)
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
                message.info(`${item.userName}离开了房间`);
                if (item.sockId === sockId.value) {
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
        message.info(infoTips);
        VIDEO_VIEW.hideAllVideoModal();
    });
    // 接收视频邀请
    socket.on('receiveVideo', (sender) => {
        if (user.value.sockId === sender.sockId) return false;
        VIDEO_VIEW.showReceiveVideoModalBySender(sender);
    });
    // 拒绝接收视频
    socket.on('rejectReceiveVideo', (user) => {
        const infoTips = user.sockId === sockId.value ? '您拒绝了接收视频' : '对方拒绝了接收视频';
        message.info(infoTips);
        VIDEO_VIEW.hideAllVideoModal();
    });
    // 接听视频
    socket.on('answerVideo', async (info) => {
        VIDEO_VIEW.showInvideoModal();
        // 创建本地视频流信息
        const stream = await createLocalVideoStream();
        localStream.value = stream
        document.querySelector('#echat-local').srcObject = localStream.value;
        peer.value = new RTCPeerConnection()
        initPeerListen()
        peer.value.addStream(localStream.value)
        if (info.sockId === sockId.value) {
            // 接收方
        } else {
            // 发送方 创建offer
            const offer = await peer.value.createOffer(offerOption.value);
            await peer.value.setLocalDescription(offer);
            socket.emit('receiveOffer', { user: user.value, offer });
        }
    });
}

const startVideoCancelCb = () => {
    socket.emit('cancelSendVideo', user.value);
    VIDEO_VIEW.hideAllVideoModal();
}
const receiveVideoCancelCb = () => {
    socket.emit('rejectReceiveVideo', user.value);
    VIDEO_VIEW.hideAllVideoModal();
}
const receiveVideoAnswerCb = () => {
    socket.emit('answerVideo', user.value);
}
const hangUpVideoCb = () => {
    socket.emit('hangupVideo', user.value);
}
const openMikeCb = () => {

}
const closeMikeCb = () => {

}
const openCammerCb = () => {

}
const closeCammerCb = () => {

}
const toScreenCb = () => {

}

const initVIDEO_VIEWSdk = () => {
    const configOptios = {
        startVideoCancelCb: startVideoCancelCb,
        receiveVideoCancelCb: receiveVideoCancelCb,
        receiveVideoAnswerCb: receiveVideoAnswerCb,
        hangUpVideoCb: hangUpVideoCb,
        openMikeCb: openMikeCb,
        closeMikeCb: closeMikeCb,
        openCammerCb: openCammerCb,
        closeCammerCb: closeCammerCb,
        toScreenCb: toScreenCb,
    };
    VIDEO_VIEW.configCallBack(configOptios);
}

const toSendVideo = () => {
    socket.emit('toSendVideo', user.value);
    VIDEO_VIEW.showStartVideoModalByReceiver(receiveUser.value);
}

const submitForm = () => {
    if (!sockId.value) {
        message.error('socket未连接成功,请刷新再尝试!');
        return false;
    }
    canClickBtn.value = false;
    socket.emit('checkRoom', {
        roomId: roomForm.roomId,
        sockId: sockId.value,
        userName: roomForm.nickname
    });
}
if (canSupportWebRTC()) {
    initSocketEvents()
    initVIDEO_VIEWSdk();
}
</script>

<style>
.m-room-wrapper {
    width: 880px;
    margin: 20px auto !important;
}

.m-room-wrapper .box-card {
    width: 480px;
}

.m-room-wrapper .box-card .item {
    padding: 18px 0;
}

.ant-form-item-control-input-content {
    display: flex;
    gap: 12px;
}
</style>
