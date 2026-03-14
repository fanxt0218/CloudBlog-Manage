<template>
  <div class="login-page">
    <div class="login-wrapper">
      <LoginCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginCard from '@/components/loginPage/loginCard.vue'
import { onMounted } from 'vue';

onMounted(() => {
  document.title = '登录 - CloudBlog管理后台'
})
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  background-image: url('../../../public/assests/bg.jpg'); /* 假设你有背景图，或者可以使用渐变 */
  background-color: #f0f2f5;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 靠右展示 */
}

.login-wrapper {
  margin-right: 10%; /* 距离右侧10%的距离 */
}
</style>
