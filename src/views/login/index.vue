<template>
  <div class="login-page" :style="pageStyle">
    <div class="login-wrapper">
      <LoginCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginCard from '@/components/loginPage/loginCard.vue'
import { onMounted, ref, computed } from 'vue';
import { getWebsiteComponentInfo } from '@/utils/websiteComponent';

const bgUrl = ref('');

// 默认背景
const DEFAULT_BG = '';

const pageStyle = computed(() => {
  if (!bgUrl.value) return {}; // 如果没有图片，就不加背景
  return {
    backgroundImage: `url(${bgUrl.value})`
  }
})

onMounted(async () => {
  document.title = '登录 - CloudBlog管理后台'
  try {
    const res = await getWebsiteComponentInfo('LOGIN', 'login_manage_bg');
    if (res && res.length > 0) {
      const url = res[0].contentValue;
      bgUrl.value = url.startsWith('http') ? url : `/api${url}`;
    } else {
      bgUrl.value = DEFAULT_BG;
    }
  } catch (e) {
    console.error('Failed to load login background', e);
    bgUrl.value = DEFAULT_BG; // 出错也使用默认图
  }
})
</script>

<style scoped lang="scss">
.login-page {
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 靠右展示 */
  transition: background-image 0.5s ease-in-out;
}

.login-wrapper {
  margin-right: 10%; /* 距离右侧10%的距离 */
}
</style>
