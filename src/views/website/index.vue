<template>
  <div class="site-manage-container">
    <div class="header-section">
      <div class="title-with-icon">
        <el-icon class="main-icon"><Setting /></el-icon>
        <div class="header-text">
          <h2>门户配置</h2>
          <p>管理网站各模块的展示内容、视觉样式与功能配置</p>
        </div>
      </div>
      <el-button type="primary" plain :icon="Refresh" @click="handleRefresh">刷新数据</el-button>
    </div>

    <!-- 首页配置 Section (已抽离为独立组件) -->
    <section class="config-section">
      <HomeConfig ref="homeConfigRef" />
    </section>

    <el-divider />

    <!-- 视觉与页面配置 Section -->
    <section class="config-section">
      <div class="section-header">
        <span class="dot purple"></span>
        <h3>视觉与页面配置</h3>
      </div>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="12" v-for="item in otherConfigs" :key="item.id">
          <el-card class="config-card horizontal" :body-style="{ padding: '0px' }" shadow="hover">
            <el-row>
              <el-col :md="12">
                <div class="preview-wrapper">
                  <el-image :src="getResourceUrl(item.preview)" fit="cover" class="preview-img">
                    <template #error>
                      <div class="image-slot">
                        <el-icon><Picture /></el-icon>
                        <span>暂未配置封面</span>
                      </div>
                    </template>
                  </el-image>
                </div>
              </el-col>
              <el-col :md="12">
                <div class="card-content">
                  <div class="card-info">
                    <h4>{{ item.title }}</h4>
                    <p class="desc">{{ item.desc }}</p>
                  </div>
                  <div class="card-footer">
                    <el-tag :type="item.preview ? 'success' : 'info'" size="small">
                      {{ item.preview ? '实时预览已开启' : '待配置' }}
                    </el-tag>
                    <el-button link type="primary" :icon="ArrowRight" @click="handleConfig(item)">立即配置</el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 配置详情对话框 -->
    <ConfigDetailDialog 
      v-if="dialogVisible"
      v-model="dialogVisible"
      :config-category="activeConfig.category"
      :config-type="activeConfig.type"
      :config-title="activeConfig.title"
      @refresh="loadOtherConfigs"
    />

    <el-divider />

    <!-- 背景图配置 (主要是登录与内容预览) -->
    <section class="config-section">
      <BackgroundConfig />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { 
  Setting, 
  Refresh, 
  ArrowRight,
  Picture
} from '@element-plus/icons-vue';
import HomeConfig from './components/HomeConfig.vue';
import BackgroundConfig from './components/BackgroundConfig.vue';
import ConfigDetailDialog from './components/ConfigDetailDialog.vue';
import { getWebsiteConfig } from '@/api/WebSiteManage';

const homeConfigRef = ref();
const dialogVisible = ref(false);
const activeConfig = ref({ category: '', type: '', title: '' });

const otherConfigs = ref([
  {
    id: 4,
    title: '用户主页背景图',
    desc: '用户主页的背景图片、遮罩色调以及对齐方式配置。可设置纯色、渐变或壁纸。',
    preview: '',
    category: 'USER',
    type: 'profile_bg'
  },
  {
    id: 5,
    title: '个人中心背景',
    desc: '个人中心页面的背景图。可设置纯色、渐变或壁纸。',
    preview: '',
    category: 'USER',
    type: 'personal_bg'
  }
]);

const getResourceUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `/api${url}`;
};

const handleConfig = (item: any) => {
  activeConfig.value = { 
    category: item.category, 
    type: item.type, 
    title: item.title 
  };
  dialogVisible.value = true;
};

const loadOtherConfigs = async () => {
  for (const item of otherConfigs.value) {
    try {
      const res: any = await getWebsiteConfig({
        category: item.category,
        contentType: item.type
      });
      if (res.code === 200 && res.data && res.data.length > 0) {
        item.preview = res.data[0].contentValue;
      } else {
        item.preview = '';
      }
    } catch (e) {
      console.error(`Failed to load ${item.type}`, e);
    }
  }
};

onMounted(() => {
  document.title = '门户配置 - CloudBlog管理后台'
  loadOtherConfigs();
})

const handleRefresh = () => {
  if (homeConfigRef.value) {
    // 假设组件暴露了刷新方法
    // homeConfigRef.value.loadData();
  }
  loadOtherConfigs();
};
</script>

<style scoped lang="scss">
.site-manage-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: calc(100vh - 84px);

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 16px;

      .main-icon {
        font-size: 32px;
        color: #409eff;
        background: #ecf5ff;
        padding: 12px;
        border-radius: 12px;
      }

      .header-text {
        h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
        }
        p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 14px;
        }
      }
    }
  }

  .config-section {
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;

      .dot {
        width: 12px;
        height: 12px;
        background: #409eff;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
        
        &.purple {
          background: #9c27b0;
          box-shadow: 0 0 0 4px rgba(156, 39, 176, 0.1);
        }
      }

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #334155;
      }
    }
  }

  .config-card {
    border: none;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 24px;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      
      .preview-img {
        transform: scale(1.1);
      }
    }

    .preview-wrapper {
      position: relative;
      height: 180px;
      overflow: hidden;

      .preview-img {
        width: 100%;
        height: 100%;
        transition: transform 0.6s ease;
      }
    }

    .card-content {
      padding: 20px;

      .card-info {
        height: auto;
        h4 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }
        .desc {
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #f1f5f9;
      }
    }

    &.horizontal {
      .preview-wrapper {
        height: 220px;
      }
      .card-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 30px;

        .card-info {
          height: auto;
          margin-bottom: 20px;
          h4 { font-size: 18px; }
        }
      }
    }
  }
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 14px;
}
</style>
