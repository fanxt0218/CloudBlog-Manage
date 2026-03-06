<template>
  <div class="header-container">
    <div class="header-left">
      <span class="title">CloudBlog 博客管理系统</span>
    </div>
    <div class="header-right">
      <span class="user-info">admin</span>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.header-container {
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  font-size: 14px;
}
</style>
