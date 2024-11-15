<template>
  <div>
    <h1>Canvas Record</h1>
    <div className="cvs-container relative" ref="cvsEl"></div>
  </div>
</template>

<script lang="ts" setup>
import { AVCanvas } from "@webav/av-canvas"
import { ChunkSlice, convertChunkSlice2MP4 } from "./chunk-slice"
import { file2stream, mp4StreamToOPFSFile } from "@webav/av-cliper"
import { onMounted, ref} from "vue";

let avCanvas: AVCanvas | null = null
const CHUNK_SLICE = new ChunkSlice()
const cvsEl = ref<any>(null)


onMounted(() => {
    if (avCanvas != null) return avCanvas

    avCanvas = new AVCanvas(cvsEl.value, {
    bgColor: '#333',
    resolution: {
      width: 1280,
      height: 720
    }
  })
})

</script>
