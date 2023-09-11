
<template>
    <div>使用webgl 实现视频的转场功能功能</div>
    <canvas id="webgl"></canvas>
    <div class="flex">
        <button @click="play">播放</button>
        <button @click="pause">暂停</button>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { initShaders } from '../utils/utils'

const vertexShaderSource = `
  attribute vec2 a_Position;
  attribute vec2 a_texCoord; 
  varying vec2 v_texCoord;
  void main(){
      vec3 position = vec3(vec2(2.0,2.0)*a_Position-vec2(1.0, 1.0), 1.0); 
      gl_Position = vec4(position.xy, 0.0, 1.0);
      v_texCoord=a_texCoord;
  }
`;
//片段着色器
let fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_image_a;
    uniform sampler2D u_image_b;
    uniform float mix;
    varying vec2 v_texCoord;
    varying float v_mix;
    void main() {
        vec4 color_a = texture2D(u_image_a, v_texCoord);
        vec4 color_b = texture2D(u_image_b, v_texCoord);
        color_a[0] *= (1.0 - mix);
        color_a[1] *= (1.0 - mix);
        color_a[2] *= (1.0 - mix);
        color_a[3] *= (1.0 - mix);
        color_b[0] *= mix;
        color_b[1] *= mix;
        color_b[2] *= mix;
        color_b[3] *= mix;
        gl_FragColor = color_a + color_b;
    }
`;



const play = () => {

}

const pause = () => {

}
let gl: any = null
let video: any = null
let video1: any = null

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
    const u_image_a = gl.getUniformLocation(gl.program, 'u_image_a');
    gl.uniform1i(u_image_a, 0);

    const u_image_b = gl.getUniformLocation(gl.program, 'u_image_b');
    gl.uniform1i(u_image_b, 0);

    const v_mix = gl.getUniformLocation(gl.program, 'v_mix');
    gl.uniform1i(v_mix, 0.0);


    /* 建立video对象 */
    video = document.createElement('video')
    video.src = '/video/output.mp4';
    video.autoplay = false;
    video.loop = false;
    video.setAttribute("crossOrigin", 'Anonymous');


     /* 建立video对象 */
    video1 = document.createElement('video')
    video1.src = '/video/output.mp4';
    video1.autoplay = false;
    video1.loop = false;
    video1.setAttribute("crossOrigin", 'Anonymous');

   
    video.addEventListener('loadeddata', function (e) {
        video.currentTime = 0;
        setTimeout(() => {
        render();
        }, 50);
    })
})

</script>
