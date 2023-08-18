<template>
    <div>使用webgl 实现视频的滤镜功能</div>
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
`
const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_image;
    varying vec2 v_texCoord;
    uniform float opacity; // 定义透明度
    // 用于从纹理中获取位移值。
    uniform sampler2D displacementMap;
    // 定义了一个常量 MAXCOLOR，表示颜色的最大值。
    #define MAXCOLOR 15.0
    // 定义了一个常量 COLORS，表示颜色的数量。
    #define COLORS 16.0
    // 定义了一个常量 WIDTH，表示纹理的宽度。
    #define WIDTH 256.0
    // 定义了一个常量 HEIGHT，表示纹理的高度。
    #define HEIGHT 16.0

    vec4 filter(vec4 px) {
        // px.b 表示蓝色通道的值 表示将像素颜色值中的蓝色通道值乘以15.0，得到一个新的浮点数值
        float cell = px.b * MAXCOLOR; 
        float cell_l = floor(cell); // 返回一个最大整数
        // 对数字进行舍入或截断
        float cell_h = ceil(cell);
        // 用于将像素坐标从像素空间转换为纹理空间
        float half_px_x = 0.5 / WIDTH; 
        // 用于将像素坐标从像素空间转换为纹理空间
        float half_px_y = 0.5 / HEIGHT;
        //  px.r 红色通道值 采样红色通道像素颜色值
        float r_offset = half_px_x + px.r / COLORS * (MAXCOLOR / COLORS);
            //  px.g 绿色通道值 采样绿色通道像素颜色值
        float g_offset = half_px_y + px.g * (MAXCOLOR / COLORS);
        vec2 lut_pos_l = vec2(cell_l / COLORS + r_offset, g_offset);
        vec2 lut_pos_h = vec2(cell_h / COLORS + r_offset, g_offset);

        vec4 graded_color_l = texture2D(displacementMap, vec2(lut_pos_l.x, 1.-lut_pos_l.y));
        vec4 graded_color_h = texture2D(displacementMap, vec2(lut_pos_h.x, 1.-lut_pos_h.y));
        // 返回纹理和着色图片混合的值
        return mix(graded_color_l, graded_color_h, fract(cell));
    }
    void main(){
        vec4 px = texture2D(u_image, v_texCoord.xy);
        vec4 graded_color = filter(px);
        gl_FragColor =mix(px,graded_color,opacity);
        gl_FragColor.a = px.a; 
    }  
`

let video: HTMLVideoElement
const play = () => {
    video.play();
}
const pause = () => {
  video.pause();
}

const loadTexture = (gl, url) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        resolve(texture);
    }
    image.onerror = reject
    image.src = url
  })
}

onMounted(async () => {
    const canvas: any = document.getElementById('webgl');
    canvas.width = 360;
    canvas.height = 640;
    const gl = canvas.getContext('webgl');

    let img: any = new Image()
    img.crossOrigin = 'anonymous'
    img.src = './filter/lut2.png'

    video = document.createElement('video')
    video.src = '/video/output.mp4';
    video.autoplay = false;
    video.loop = false;
    video.setAttribute("crossOrigin", 'Anonymous');

    /* 建立video对象 */
    const render = async() => {
        console.log('111')
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        if (!video.paused) {
            requestAnimationFrame(render);
        }
   }
   video.addEventListener('loadeddata', function (e) {
      video.currentTime = 0;
      setTimeout(async () => {
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
        const opacity = gl.getUniformLocation(gl.program, 'opacity');
        gl.uniform1f(opacity, 0.5)
        /* 图像预处理 */
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        /* 准备三个角色 */
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            video
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        /* 获取uniform变量 */
        const u_image = gl.getUniformLocation(gl.program, 'u_image');

        const displacementMap = gl.getUniformLocation(gl.program, 'displacementMap');

        const lutTexture = await loadTexture(gl, './filter/lut2.png');

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, lutTexture);

        gl.uniform1i(u_image, 0);
        gl.uniform1i(displacementMap, 1);
    
        render();
      }, 50);
   })
   video.addEventListener('playing', () => {
     render();
   })
})
</script>
