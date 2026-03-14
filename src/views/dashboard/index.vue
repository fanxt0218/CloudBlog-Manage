<template>
  <div class="page-container">
    <h2>首页</h2>
    <p>欢迎来到 CloudBlog 管理端</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  document.title = '首页 - CloudBlog管理后台'
})
</script>

<style scoped>
.page-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style>
