<script setup>
</script>

<template>
  <div>
    <router-view />
  </div>
</template>

<style>

*{
  margin: 0;
  padding: 0;
}
.container{
  padding: 20px;
  width: 800px;
  margin: 20px auto;
  .flex{
    display: flex;
    gap: 10px;
    margin-left: 0;
  }
}
</style>
