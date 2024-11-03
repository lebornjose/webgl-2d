

<template>
    <div class="content">
      <h2>绿幕抠图</h2>
      <div class="img">
        <p>原图</p>
        <img src="/video/green-dog.jpeg">
      </div>
      <div class="result">
        <p>去除之后</p>
        <canvas ref="canvasRef" width="500" height="280"></canvas>
      </div>
    </div>
</template>

<style lang="css" scoped>
.content{
  width: 800px;
  margin: 40px auto;
}
</style>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import  { assetsPrefix } from '../../utils/assetsPrefix'
import { createChromakey } from '@webav/av-cliper';

const imgSrc = assetsPrefix(['video/green-dog.jpeg']);

const chromakey = createChromakey({
  // 未设置 keyColor 默认取左上角第一个像素的颜色值
  // keyColor: '#00FF00'
  similarity: 0.4,
  smoothness: 0.05,
  spill: 0.05,
});

const canvasRef = ref();
let ctx: any = null

const start = async () => {
  const img = new Image();
  img.src = imgSrc[0];
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  ctx.drawImage(
    await chromakey(img),
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height,
  );
}
onMounted(() => {
  ctx = canvasRef.value.getContext('2d')

  start()
})

</script>
