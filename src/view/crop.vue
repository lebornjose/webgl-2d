<template>
    <div>使用webgl 实现视频的裁剪功能</div>
    <canvas id="webgl"></canvas>
    <div class="flex">
      <button @click="play">播放</button>
      <button @click="pause">播放</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initShaders } from '../utils/utils'


const vertexShaderSource = `
    attribute vec2 a_Position;
    attribute vec2 a_texCoord;
    uniform mat3 u_MvpMatrix;
    varying vec2 v_texCoord;
    void main(){
        vec3 position = vec3(vec2(2.0,2.0)*a_Position-vec2(1.0, 1.0), 1.0); 
        gl_Position = vec4(position.xy, 0.0, 1.0);
        v_texCoord = vec2(a_texCoord.x, a_texCoord.y);
        // mat2 tex_matrix = mat2(
        //     1, 0,
        //     0, 1);
        // vec2 crop_textCooerd = (tex_matrix * a_texCoord).xy;    
        // v_texCoord = crop_textCooerd;
    }
`
const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    uniform vec2 u_ClipTopLeft;
    uniform vec2 u_ClipBottomRight;
    varying vec2 v_texCoord;
    void main(){
        // 判断当前纹理坐标是否在裁剪区域内
        bool insideClipArea = all(greaterThanEqual(v_texCoord, u_ClipTopLeft)) && all(lessThanEqual(v_texCoord, u_ClipBottomRight));
        if (insideClipArea) {
          // 在裁剪区域内，采样纹理并输出颜色
          gl_FragColor = texture2D(u_Sampler, v_texCoord);
        } else {
          // 不在裁剪区域内，输出透明
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }

        //  gl_FragColor = texture2D(u_Sampler, v_texCoord);
    }  
`
let video: HTMLVideoElement
const play = () => {
    video.play();
}
const pause = () => {
  video.pause();
}
onMounted(() => {
   const canvas: any = document.getElementById('webgl');
   canvas.width = 360;
   canvas.height = 640;
   const gl = canvas.getContext('webgl');

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
   const u_ClipTopLeft = gl.getUniformLocation(gl.program, 'u_ClipTopLeft');
   const u_ClipBottomRight = gl.getUniformLocation(gl.program, 'u_ClipBottomRight');
   gl.uniform1i(u_Sampler, 0);
   /* 建立video对象 */
   video = document.createElement('video')
   video.src = '/video/output.mp4';
   video.autoplay = false;
   video.loop = false;
   video.setAttribute("crossOrigin", 'Anonymous');
   gl.uniform2fv(u_ClipTopLeft, [0.3, 0.5]);  // 设置裁剪区域的左上角坐标 0.3 左边开始的位置， 0.5从下往上的裁剪距离
    gl.uniform2fv(u_ClipBottomRight, [0.9, 0.8]); // 0.9 (1-0.9) 为从最右边往左的距离0.8(1-0.8) 从上往下的裁剪
 
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
       console.log('end');
       render();
     }, 50);
   })
   video.addEventListener('playing', () => {
     render();
   })
})
</script>
