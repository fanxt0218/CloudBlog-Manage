<template>
  <el-card class="hot-articles-card" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="title">平台热门文章</span>
        <el-tag size="small" type="danger" effect="plain">TOP 5</el-tag>
      </div>
    </template>

    <div v-loading="loading">
      <div v-for="(article, index) in articles" :key="article.articleId" class="article-item" @click="handleArticleClick(article)">
        <div class="article-index">{{ index + 1 }}</div>
        <div class="article-info">
          <div class="article-title">{{ article.title }}</div>
          <div class="article-author">
             <el-avatar :size="16" :src="`/api${article.image}`" class="author-avatar" />
             <span>{{ article.authorName }}</span>
          </div>
        </div>
        
        <!-- Hover Statistics -->
        <div class="article-stats">
          <div class="stat-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ article.commentCount }}</span>
          </div>
          <div class="stat-item">
            <el-icon><Pointer /></el-icon>
            <span>{{ article.likeCount }}</span>
          </div>
          <div class="stat-item">
            <el-icon><Star /></el-icon>
            <span>{{ article.collectCount }}</span>
          </div>
          <div class="stat-item">
            <el-icon><View /></el-icon>
            <span>{{ article.browseCount }}</span>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && articles.length === 0" description="暂无热门文章" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { PlatformHotArticleItem } from '@/types'
import { ChatDotRound, View, Pointer, Star } from '@element-plus/icons-vue'

const VIEW_BASE_URL = 'http://localhost:5173'

defineProps<{
  articles: PlatformHotArticleItem[]
  loading: boolean
}>()

const handleArticleClick = (article: PlatformHotArticleItem) => {
    const url = `${VIEW_BASE_URL}/postView/${article.authorId}/${article.articleId}`
  window.open(url, '_blank')
}
  
</script>

<style scoped>
.hot-articles-card {
  border: none;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-size: 16px;
  font-weight: 600;
}

.article-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 4px;
  cursor: pointer;
}

.article-item:hover {
  background-color: #f5f7fa;
}

.article-index {
  width: 24px;
  font-size: 14px;
  font-weight: 700;
  color: #c0c4cc;
  flex-shrink: 0;
}

.article-item:nth-child(1) .article-index { color: #f56c6c; }
.article-item:nth-child(2) .article-index { color: #e6a23c; }
.article-item:nth-child(3) .article-index { color: #409eff; }

.article-info {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.article-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.article-author {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.author-avatar {
  margin-right: 6px;
}

/* Stats styles - hidden by default, shown on hover */
.article-stats {
  display: flex;
  gap: 12px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.article-item:hover .article-stats {
  opacity: 1;
  transform: translateX(0);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

.stat-item .el-icon {
  font-size: 14px;
}
</style>
