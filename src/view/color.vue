<template>
  <h3>使用webgl 实现色值的变化调整</h3>
  <div class="main">
    <div class="left-canvas">
      <canvas id="webgl"></canvas>
    </div>
    <div class="flex">
      <div class="item">
        <span class="text">色温</span>
        <a-slider :min="1000" v-model:value="state.temperature" :max="65500" @change="change" />
      </div>
      <!-- <div class="item">
        <span class="text">色调</span>
        <a-slider :step="0.1" :min="-1" v-model:value="state.hue" :max="1" @change="change"/>
      </div> -->
      <div>
        <button @click="play">播放</button>
        <button @click="pause">暂停</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { initShaders } from '../utils/utils'

const state = reactive({
  temperature: 5000,
  hue: 0
})


const vertexShaderSource = `
  attribute vec2 a_Position;
  attribute vec2 a_texCoord; 
  varying vec2 v_texCoord;
  void main(){
      vec3 position = vec3(vec2(2.0,2.0)*a_Position-vec2(1.0, 1.0), 1.0); 
      gl_Position = vec4(position.xy, 0.0, 1.0);
      v_texCoord=a_texCoord;
  }
`
const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_Sampler;
  uniform float u_Temperature;
  varying vec2 v_texCoord;


  

  void main(){
    vec4 color = texture2D(u_Sampler,v_texCoord);

    vec3 temperature = vec3(1.0, 1.0, 1.0);
    if(u_Temperature < 5000.0) {
      temperature.r = clamp((u_Temperature - 1000.0) / (5000.0 - 1000.0), 0.0, 1.0);
    } else {
      temperature.b = clamp((65000.0 - u_Temperature) / (65000.0 - 5000.0), 0.0, 1.0);
    }

    gl_FragColor = vec4(color.rgb * temperature, color.a);
  }  
`
let video: HTMLVideoElement
let gl: any = null
const play = () => {
  video.play();
}
const pause = () => {
  video.pause();
}
const change = () => {
  const u_Temperature = gl.getUniformLocation(gl.program, 'u_Temperature');
  gl.uniform1f(u_Temperature, state.temperature);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
onMounted(() => {
  const canvas: any = document.getElementById('webgl');
  canvas.width = 360;
  canvas.height = 640;
  gl = canvas.getContext('webgl');

  initShaders(gl, vertexShaderSource, fragmentShaderSource);
  // 给画布填充色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  const source = new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);

  const sourceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  // 方法绑定当前缓冲区范围到gl.ARRAY_BUFFER,成为当前顶点缓冲区对象的通用顶点属性并指定它的布局
  gl.vertexAttribPointer(
    a_Position,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  // 无论怎样，都需要你使用enableVertexAttribArray()方法，来激活每一个属性以便使用，不被激活的属性是不会被使用的。一旦激活，以下其他方法就可以获取到属性的值了
  gl.enableVertexAttribArray(a_Position);

  const texCoordLocation = gl.getAttribLocation(gl.program, 'a_texCoord');
  gl.vertexAttribPointer(
    texCoordLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(texCoordLocation);

  /* 图像预处理 */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  /* 准备三个角色 */
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  /* 获取uniform变量 */
  const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  gl.uniform1i(u_Sampler, 0);

  const u_Temperature = gl.getUniformLocation(gl.program, 'u_Temperature');
  gl.uniform1f(u_Temperature, state.temperature);

  /* 建立video对象 */
  video = document.createElement('video')
  video.src = '/video/output.mp4';
  video.autoplay = false;
  video.loop = false;
  video.setAttribute("crossOrigin", 'Anonymous');


  const render = () => {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      video
    )
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!video.paused) {
      requestAnimationFrame(render);
    }
  }
  video.addEventListener('loadeddata', function (e) {
    video.currentTime = 0;
    setTimeout(() => {
      render();
    }, 50);
  })
  video.addEventListener('playing', () => {
    render();
  })
})
</script>

<style lang="css">
h3 {
  text-align: center;
}

.main {
  display: flex;
  width: 1200px;
  margin: 20px auto;
}

.flex {
  margin-left: 30px;
  width: 400px;
}

.item {
  display: flex;
  width: 420px;
  align-items: center;
}

.item .text {
  float: left;
  margin-right: 20px;
}

.item .ant-slider {
  width: 350px;
  float: left;
}
</style>
