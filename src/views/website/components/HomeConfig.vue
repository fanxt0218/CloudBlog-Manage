<template>
  <div class="home-config-wrapper">
    <div class="section-header">
      <span class="dot"></span>
      <h3>首页配置</h3>
    </div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :md="8" v-for="item in homeConfigs" :key="item.contentType">
        <el-card class="config-card" :body-style="{ padding: '0px' }" shadow="hover" @click="handleCardClick(item)">
          <div class="preview-wrapper">
            <el-image :src="getPreviewUrl(item.preview)" fit="cover" class="preview-img">
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                  <span>暂无配置图</span>
                </div>
              </template>
              <template #placeholder>
                <div class="image-slot">Loading<span class="dot">...</span></div>
              </template>
            </el-image>
            <div class="preview-overlay">
              <el-button type="primary" circle :icon="Edit" />
            </div>
          </div>
          <div class="card-content">
            <div class="card-info">
              <h4>{{ item.title }}</h4>
              <p class="desc">{{ item.desc }}</p>
            </div>
            <div class="card-footer">
              <el-tag :type="item.hasData ? 'success' : 'info'" size="small">
                {{ item.hasData ? '预览更新中' : '待配置' }}
              </el-tag>
              <div class="item-count">点击管理 {{ item.count || 0 }} 项内容</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置详情对话框 -->
    <ConfigDetailDialog 
      v-if="dialogVisible"
      v-model="dialogVisible"
      :config-type="activeConfig?.contentType"
      :config-title="activeConfig?.title"
      @refresh="loadConfigData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Edit, Picture } from '@element-plus/icons-vue';
import ConfigDetailDialog from './ConfigDetailDialog.vue';
import { getWebsiteConfig } from '@/api/WebSiteManage';

const dialogVisible = ref(false);
const activeConfig = ref<any>(null);

// 默认未配置封面图
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';

const homeConfigs = ref([
  {
    contentType: 'carousel',
    title: '首页宽屏活动',
    desc: '首页顶部巨幕活动牌，上传图片后随机抽取一张展示。',
    preview: '',
    hasData: false,
    count: 0
  },
  {
    contentType: 'advertise',
    title: '广告轮播图',
    desc: '侧边栏或列表广告位，按排序进行轮播展示。',
    preview: '',
    hasData: false,
    count: 0
  },
  {
    contentType: 'recommend_tool',
    title: '推荐工具轮播',
    desc: '首页热门工具展示位，每组4个工具，支持排序展示。',
    preview: '',
    hasData: false,
    count: 0
  }
]);

const getPreviewUrl = (url: string) => {
  if (!url) return DEFAULT_COVER;
  if (url.startsWith('http')) return url;
  return `/api${url}`;
};

const handleCardClick = (item: any) => {
  activeConfig.value = item;
  dialogVisible.value = true;
};

const loadConfigData = async () => {
  for (const config of homeConfigs.value) {
    try {
      const res: any = await getWebsiteConfig({
        category: 'HOME',
        contentType: config.contentType
      });
      if (res.code === 200 && res.data && res.data.length > 0) {
        config.preview = res.data[0].contentValue;
        config.hasData = true;
        config.count = res.data.length;
      } else {
        config.preview = '';
        config.hasData = false;
        config.count = 0;
      }
    } catch (e) {
      console.error('Failed to load preview for', config.contentType, e);
    }
  }
};

onMounted(loadConfigData);
</script>

<style scoped lang="scss">
.home-config-wrapper {
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
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #334155;
    }
  }

  .config-card {
    border: none;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 24px;
    cursor: pointer;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;

      .preview-overlay {
        opacity: 1;
      }
      
      .preview-img {
        transform: scale(1.1);
      }
    }

    .preview-wrapper {
      position: relative;
      height: 160px;
      overflow: hidden;

      .preview-img {
        width: 100%;
        height: 100%;
        transition: transform 0.6s ease;
      }

      .preview-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
    }

    .card-content {
      padding: 16px;

      .card-info {
        height: 80px;
        h4 {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }
        .desc {
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f1f5f9;

        .item-count {
          font-size: 11px;
          color: #94a3b8;
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
