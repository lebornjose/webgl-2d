
<!-- 支持画面特效 -->
<template>
    <div>使用webgl 实现视频的九宫格特效功能</div>
    <canvas id="webgl" style="width: 360;height: 720px"></canvas>
    <div class="flex">
      <button @click="play">播放</button>
      <button @click="pause">暂停</button>
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
    }
`
const fragmentShaderSource = `
    precision mediump float;
    // 视频纹理
    uniform sampler2D u_Sampler;
    varying vec2 v_texCoord;
    
    void main(){
      // 计算九宫格的行和列数
      float rows = 3.0; // 行数
      float cols = 3.0; // 列数

      // 计算当前纹理坐标对应的宫格索引
      vec2 grid = vec2(floor(v_texCoord.x * cols), floor(v_texCoord.y * rows));

      // 计算每个宫格的宽度和高度
      float gridWidth = 1.0 / cols;
      float gridHeight = 1.0 / rows;

      // 计算当前宫格的左上角和右下角坐标
      vec2 topLeft = vec2(grid.x * gridWidth, grid.y * gridHeight);
      vec2 bottomRight = vec2(topLeft.x + gridWidth, topLeft.y + gridHeight);

      // 根据当前宫格的坐标范围，调整纹理坐标
      vec2 adjustedTexCoord = clamp(v_texCoord - topLeft, 0.0, 1.0) / vec2(gridWidth, gridHeight);

      // 采样视频纹理中的颜色
      vec4 color = texture2D(u_Sampler, adjustedTexCoord);

      // 输出颜色
      gl_FragColor = color;
    }  
`

let video: HTMLVideoElement
const play = () => {
    video.play();
}
const pause = () => {
  video.pause();
}

// crop 裁剪参数，x0 -> x1 表示从x位置的0.2才是裁到0.8结束
// y0 -> y1 表示从y轴的0.1开始到0.5结束 0.1 -> 0.6
// 默认不裁剪为 {x0: 0, x1: 1, y0:0, y1:1}
const crop = {x0: 0.2, x1: 0.8, y0: 0.1, y1: 0.6}
onMounted(() => {
   const canvas: any = document.getElementById('webgl');
   canvas.width = 720;
   canvas.height = 1280;
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
   gl.generateMipmap(gl.TEXTURE_2D);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
 
   /* 获取uniform变量 */
   const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
   gl.uniform1i(u_Sampler, 0);
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
       console.log('end');
       render();
     }, 50);
   })
   video.addEventListener('playing', () => {
     render();
   })
})
</script>
