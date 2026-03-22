<template>
  <div class="background-config-wrapper">
    <div class="section-header">
      <span class="dot blue"></span>
      <h3>背景图配置</h3>
      <p class="subtitle">管理登录页与文章预览页的视觉背景</p>
    </div>

    <div class="glass-container">
      <!-- 登录页背景组 -->
      <div class="config-group">
        <h4 class="group-title"><el-icon><Monitor /></el-icon> 登录页面</h4>
        <div class="mock-grid">
          <!-- 用户端登录 -->
          <div class="mock-card" @click="handleEdit('LOGIN', 'login_bg', '用户端登录背景')">
            <div class="mock-screen">
              <div class="mock-bg" :style="{ backgroundImage: `url(${getPreviewUrl(bgData['login_bg'] || '')})` }"></div>
              <div class="mock-content login-user">
                <div class="glass-form">
                  <div class="form-line short"></div>
                  <div class="form-line"></div>
                  <div class="form-btn"></div>
                </div>
              </div>
            </div>
            <div class="mock-info">
              <div class="info-text">
                <span class="label">用户端登录</span>
                <span class="status" :class="{ active: bgData.login_bg }">{{ bgData.login_bg ? '已配置' : '待配置' }}</span>
              </div>
              <el-button link type="primary" :icon="Edit">管理图片</el-button>
            </div>
          </div>

          <!-- 管理端登录 -->
          <div class="mock-card" @click="handleEdit('LOGIN', 'login_manage_bg', '管理端登录背景')">
            <div class="mock-screen">
              <div class="mock-bg" :style="{ backgroundImage: `url(${getPreviewUrl(bgData['login_manage_bg'] || '')})` }"></div>
              <div class="mock-content login-admin">
                <div class="admin-panel">
                  <div class="panel-header"></div>
                  <div class="panel-body">
                    <div class="body-line"></div>
                    <div class="body-line short"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mock-info">
              <div class="info-text">
                <span class="label">管理端登录</span>
                <span class="status" :class="{ active: bgData.login_manage_bg }">{{ bgData.login_manage_bg ? '已配置' : '待配置' }}</span>
              </div>
              <el-button link type="primary" :icon="Edit">管理图片</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 预览页背景组 -->
      <div class="config-group">
        <h4 class="group-title"><el-icon><View /></el-icon> 内容预览页面</h4>
        <div class="mock-grid single">
          <div class="mock-card wide" @click="handleEdit('VIEW', 'viewpage_bg', '文章预览页背景')">
            <div class="mock-screen">
              <div class="mock-bg" :style="{ backgroundImage: `url(${getPreviewUrl(bgData['viewpage_bg'] || '')})` }"></div>
              <div class="mock-content article-view">
                <div class="article-mock">
                  <div class="article-title"></div>
                  <div class="article-meta"></div>
                  <div class="article-para"></div>
                  <div class="article-para"></div>
                </div>
              </div>
            </div>
            <div class="mock-info">
              <div class="info-text">
                <span class="label">文章预览背景</span>
                <span class="status" :class="{ active: bgData.viewpage_bg }">{{ bgData.viewpage_bg ? '已配置' : '待配置' }}</span>
              </div>
              <el-button link type="primary" :icon="Edit">管理图片</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 复用配置详情对话框 -->
    <ConfigDetailDialog 
      v-if="dialogVisible"
      v-model="dialogVisible"
      :config-category="activeConfig.category"
      :config-type="activeConfig.type"
      :config-title="activeConfig.title"
      @refresh="fetchBgData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Monitor, View, Edit } from '@element-plus/icons-vue';
import ConfigDetailDialog from './ConfigDetailDialog.vue';
import { getWebsiteConfig } from '@/api/WebSiteManage';

const dialogVisible = ref(false);
const activeConfig = ref({ category: '', type: '', title: '' });

const DEFAULT_BG = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop';

const bgData = ref<Record<string, string>>({
  login_bg: '',
  login_manage_bg: '',
  viewpage_bg: ''
});

const getPreviewUrl = (url: string) => {
  if (!url) return DEFAULT_BG;
  if (url.startsWith('http')) return url;
  return `/api${url}`;
};

const handleEdit = (category: string, type: string, title: string) => {
  activeConfig.value = { category, type, title };
  dialogVisible.value = true;
};

const fetchBgData = async () => {
  const configs = [
    { category: 'LOGIN', type: 'login_bg' },
    { category: 'LOGIN', type: 'login_manage_bg' },
    { category: 'VIEW', type: 'viewpage_bg' }
  ];

  for (const conf of configs) {
    try {
      const res: any = await getWebsiteConfig({
        category: conf.category,
        contentType: conf.type
      });
      if (res.code === 200 && res.data && res.data.length > 0) {
        // 取最新的一条或发布的一条
        bgData.value[conf.type] = res.data[0].contentValue;
      } else {
        bgData.value[conf.type] = '';
      }
    } catch (e) {
      console.error(`Failed to fetch ${conf.type}`, e);
    }
  }
};

onMounted(fetchBgData);
</script>

<style scoped lang="scss">
.background-config-wrapper {
  margin-top: 40px;
  animation: fadeInUp 0.6s ease-out;
}

.section-header {
  margin-bottom: 24px;
  .dot.blue { background: #409eff; }
  .subtitle {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
  }
}

.glass-container {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 24px;
}

.config-group {
  margin-bottom: 32px;
  &:last-child { margin-bottom: 0; }
  
  .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    color: #303133;
    margin-bottom: 16px;
    .el-icon { color: #409eff; }
  }
}

.mock-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  &.single {
    grid-template-columns: 1fr;
  }
}

.mock-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #ebeef5;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
    .mock-bg { transform: scale(1.05); }
  }
}

.mock-screen {
  height: 180px;
  position: relative;
  overflow: hidden;
  background: #f5f7fa;

  .mock-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transition: transform 0.6s ease;
  }

  .mock-content {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.1);
  }
}

/* 模拟登录页 */
.glass-form {
  width: 80px;
  padding: 10px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.3);
  display: flex;
  flex-direction: column;
  gap: 6px;

  .form-line {
    height: 4px;
    background: rgba(255,255,255,0.6);
    border-radius: 2px;
    &.short { width: 60%; }
  }
  .form-btn {
    height: 6px;
    background: #409eff;
    border-radius: 3px;
    margin-top: 4px;
  }
}

/* 模拟管理后台 */
.admin-panel {
  width: 120px;
  height: 80px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;

  .panel-header {
    height: 12px;
    background: #2b3643;
    border-radius: 4px 4px 0 0;
  }
  .panel-body {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    .body-line {
      height: 4px;
      background: #f0f2f5;
      border-radius: 2px;
      &.short { width: 40%; }
    }
  }
}

/* 模拟文章预览 */
.article-mock {
  width: 80%;
  height: 70%;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 10px;

  .article-title { height: 8px; background: #303133; border-radius: 4px; width: 70%; }
  .article-meta { height: 4px; background: #c0c4cc; border-radius: 2px; width: 40%; }
  .article-para { height: 4px; background: #f0f2f5; border-radius: 2px; }
}

.mock-info {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .info-text {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
    .status {
      font-size: 11px;
      color: #909399;
      &.active {
        color: #67c23a;
        &::before {
          content: '●';
          margin-right: 4px;
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .mock-grid {
    grid-template-columns: 1fr;
  }
}
</style>
