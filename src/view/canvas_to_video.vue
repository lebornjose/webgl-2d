
<template>
   <div class="content">
      <h2>canvas 导出为视频</h2>
      <div class="list">

      </div>
      <canvas></canvas>
      <div
        ref="initCvs"
        class="video-container"
      >
         <!-- <video src="/public/video/output.mp4" ref="videoRef" muted loop autoplay/> -->
      </div>
   </div>
</template>

<style lang="css" scoped>
.content{
    width: 800px;
    margin: 40px auto;
}
</style>
