

<template>
   <div>
      <div class="container">
        <h2>音视频demo</h2>
        <div class="list">
            <a-button type="primary">转场</a-button>
            <a-button type="primary">动画</a-button>
            <a-button type="primary">蒙版</a-button>
            <a-button type="primary">视频色值调整</a-button>
            <a-button type="primary">九宫格特效</a-button>
            <a-button type="primary">视频裁剪</a-button>
            <a-button type="primary">画面蒙版</a-button>
            <a-button type="primary">平移, 缩放，旋转</a-button>
        </div>
        <h2>webCodecs</h2>
        <div class="list">   
            <a-button type="primary">视频解码播放</a-button>
            <a-button type="primary">视频关键帧</a-button>
            <a-button type="primary">解码帧序列图</a-button>
            <a-button type="primary">音画分离</a-button>
        </div>
      </div>
   </div>
</template>

<style lang="css" scoped>
.container{
    width: 1000px;
    padding: 40px;
    margin: 20px auto;
}
.container h2{
    margin-top: 30px;
}
.container .list{
    display: flex;
    gap: 8px;
}
</style>
