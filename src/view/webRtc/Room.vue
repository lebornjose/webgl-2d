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
            <div v-else>
                <h1>当前域名的浏览器不支持WebRTC！</h1>
            </div>
        </div>    
    </div>
</template>

<script setup>
import { onMounted } from 'vue';


const canSupportVideo = ref(false)
const showFormArea = ref(false)

const roomUsers = ref([]) // 房间在线用户

const canClickBtn = ref(true)

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

onMounted(() => {
    canSupportWebRTC()
})
</script>
