
<template>
<div class="content">
    <h2>canvas 导出为视频</h2>      
    <div class="video-list">
      <canvas ref="canvasRef" id="webgl"></canvas>
      <video
        class="videoCon"
        v-if="videoSrc"
        :src="videoSrc"
        controls
        autoPlay
      ></video>
    </div>
  
    <div class="flex">
        <a-button type="primary" @click="play">播放</a-button>
        <a-button type="primary" @click="pause">暂停</a-button>
        <a-button type="primary" @click="generate">合成</a-button>
    </div>
    

</div>
</template>

<script lang="ts" setup>

import { onMounted, ref } from 'vue';
import { initShaders } from '../utils/utils'
import {  OffscreenSprite, Combinator } from '@webav/av-cliper';
import CountdownClip from './canvasToMp4/mp4Util'

let gl:any = null  
let video: HTMLVideoElement

const videoSrc = ref(null)
const canvasRef = ref(null)

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
    varying vec2 v_texCoord;
    const float PI = 3.1415926;
    const float angle = 4. * PI;
    const float scale = 5.;
    const float ar = 0.5625;
    uniform float progress;

    vec2 animation_filter(vec2 uv) {
      float theta = angle * progress;
      float s = mix(scale, 1., progress);
      float cosa = cos(theta) * s;
      float sina = sin(theta) * s;
      mat2 rotM = mat2(
          cosa, -sina * ar,
          sina / ar, cosa
      );
      vec2 uv2 = rotM * (uv - 0.5) + 0.5;
      return uv2;
    }

    void main() {
      vec2 new_uv = animation_filter(v_texCoord);
      gl_FragColor=texture2D(u_Sampler, new_uv);
      // 检查新的 UV 坐标是否超出范围
      if (new_uv.x < 0.0 || new_uv.x > 1.0 ||
          new_uv.y < 0.0 || new_uv.y > 1.0) {
          discard; // 圆外的像素丢弃
      } else {
        gl_FragColor = texture2D(u_Sampler, new_uv);
      }
    }
`

const state = ref(0) // 0 暂停， 1 播放状态
const currentTime = ref(0);


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

const play = () => {
  state.value = 1;
  let startTime = performance.now();
  video.play();
  const c = document.createElement('canvas')
  c.width = 360
  c.height = 640
  const start = () => {
    requestAnimationFrame(() => {
        if(state.value) {
            let time = performance.now()
            currentTime.value = (time - startTime) / 1000
            if(currentTime.value < 1 ) {
                const progress = gl.getUniformLocation(gl.program, 'progress');
                let rate = currentTime.value
                let p = rate > 1 ? 1 : rate
                gl.uniform1f(progress, p);

                const cc = c.getContext('2d')
                if(canvasRef.value) {
                  cc?.drawImage(canvasRef.value, 0, 0,)
                  const url = c.toDataURL('image/png')
                  const img = document.createElement('img')
                  img.src = url
                  document.body.append(img)
                }
            }
            start()
            render()
        }
    })
   }
   start()
}
const pause = () => {
  state.value = 1
  video.pause();
}

const build = async (com) => {
  const timeStart = performance.now();
  const srcBlob = await new Response(com?.output()).blob();
  const url = URL.createObjectURL(srcBlob)
  videoSrc.value = url
  console.log(`合成耗时: ${Math.round(performance.now() - timeStart)}ms`);
}
const generate = async () => {
  // let el = document.createElement('canvas')
  // el.width = 360
  // el.height = 640
  // const ctx = el.getContext('2d')
  play()
  const dom = document.getElementById('webgl')
  // const dataUrl = dom?.toDataURL('image/png')
  // const img = document.createElement('img')
  // img.src = dataUrl
  // // document.append(el)
  // document.body.append(img)
  const spr = new OffscreenSprite(new CountdownClip(dom, 10));
  const com = new Combinator({ width: 360, height: 640 });
  await com.addSprite(spr, { main: true });
  await build(com)
}

onMounted(() => {
   const canvas: any = document.getElementById('webgl');
   canvas.width = 360;
   canvas.height = 640;
   gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});

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

   const progress = gl.getUniformLocation(gl.program, 'progress');
   gl.uniform1f(progress, 0.0);

    /* 建立video对象 */
   video = document.createElement('video')
   video.src = '/video/output.mp4';
   video.autoplay = false;
   video.loop = false;
   video.width = 720
   video.height = 1280
   video.setAttribute("crossOrigin", 'Anonymous');
   video.addEventListener('loadeddata', function (e) {
      video.currentTime = 0;
     setTimeout(() => {
       console.log('end');
       render();
     }, 50);
   })
})

</script>


<style scoped>
.content{
    width: 800px;
    margin: 40px auto;
}

.video-list{
  display: flex;
  gap: 12px;
}
.videoCon{
  width: 360px;
  height: 640px;
}

.flex{
  margin-top: 12px;
  display: flex;
  gap: 12px;
  margin-left: 0;
}
</style>
