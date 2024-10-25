
<template>
    <div>使用webgl 实现视频的转场功能功能</div>
    <canvas id="webgl"></canvas>

    <p>时间: {{ currentTime  }}</p>
    <div class="flex">
        <button @click="play">播放</button>
        <button @click="pause">暂停</button>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { initShaders } from '../../utils/utils'

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

const currentTime = ref(0);
const state = ref(0) // 0 暂停， 1 播放状态

const play = () => {
    state.value = 1
   let startTime = performance.now();
   video.play()
   const start = () => {
        requestAnimationFrame(() => {
            if(state.value) {
                let time = performance.now()
                currentTime.value = (time - startTime) / 1000
                if(currentTime.value >= 5 && currentTime.value <=6 ) {
                    video1.play()
                    const v_mix = gl.getUniformLocation(gl.program, 'mix');
                    let rate = (currentTime.value - 5) / 1
                    console.log(rate)
                    gl.uniform1f(v_mix, rate);
                }
                if(currentTime.value > 6) {
                    video.pause()
                }
                start()
                render()
            }
        })
   }
   start()
}

const pause = () => {
    state.value = 0
    video.pause()
    video1.pause()
}
let gl: any = null
let video: any = null
let video1: any = null
let textureA: WebGLTexture | null = null;
let textureB: WebGLTexture | null = null;

const createTexture = (gl: WebGLRenderingContext): WebGLTexture | null => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));
  
  return texture;
};

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    const mix = (currentTime.value - 5) / 1;

      // 绑定纹理 A
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureA);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);

      // 绑定纹理 B
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureB);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video1);

    const imageAUniform = gl.getUniformLocation(gl.program, 'u_image_a');
    const imageBUniform = gl.getUniformLocation(gl.program, 'u_image_b');
    gl.uniform1i(imageAUniform, 0); // 将纹理 A 的索引绑定到 uniform 变量上
    gl.uniform1i(imageBUniform, 1); // 将纹理 B 的索引绑定到 uniform 变量上
    

    // const mixUniform = gl.getUniformLocation(gl.program, 'mix');
    // gl.uniform1f(mixUniform, mix);

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
    

    textureA = createTexture(gl);
    textureB = createTexture(gl);

    const v_mix = gl.getUniformLocation(gl.program, 'mix');
    gl.uniform1i(v_mix, 0.0);


    /* 建立video对象 */
    video = document.createElement('video')
    video.src = '/video/output.mp4';
    video.autoplay = false;
    video.loop = false;
    video.setAttribute("crossOrigin", 'Anonymous');


     /* 建立video对象 */
    video1 = document.createElement('video')
    video1.src = 'https://creative-alloss.getmogic.com/TEST/process/20230529/vc-upload-1685340741075-6.mp4';
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
