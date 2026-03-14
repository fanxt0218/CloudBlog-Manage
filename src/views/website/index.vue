<template>
  <div class="page-container">
    <h2>网站管理</h2>
    <p>此处将显示网站系统配置与管理相关内容。</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  document.title = '网站管理 - CloudBlog管理后台'
})
</script>

<style scoped>
.page-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style>
