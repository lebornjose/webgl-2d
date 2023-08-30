<template>
    <h3>使用webgl 实现画面的蒙版功能</h3>
    <div class="main">
      <div class="left-canvas">
        <canvas id="webgl"></canvas>
      </div>
    </div>  
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { initShaders } from '../utils/utils'


const vertexShaderSource = `
    attribute vec2 a_Position;
    attribute vec2 a_texCoord;
    uniform mat3 u_MvpMatrix;
    varying vec2 v_texCoord;
    void main(){
        vec3 position = u_MvpMatrix * vec3(vec2(2.0,2.0)*a_Position-vec2(1.0, 1.0), 1.0); 
        gl_Position = vec4(position.xy, 0.0, 1.0);
        v_texCoord=a_texCoord;
    }
`
const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_texCoord;
    void main(){
        gl_FragColor=texture2D(u_Sampler,v_texCoord);
    }  
`



onMounted(() => {
  const canvas: any = document.getElementById('webgl');
   canvas.width = 360;
   canvas.height = 640;
   const gl = canvas.getContext('webgl');

   initShaders(gl, vertexShaderSource, fragmentShaderSource);
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   const source = new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);
  
   const sourceBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW);
   const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
})
</script>
