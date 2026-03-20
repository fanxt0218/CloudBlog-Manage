<template>
  <div class="dashboard-container">
    <div class="welcome-header">
      <div class="greeting">
        <h1>您好，管理员</h1>
        <p>欢迎回到 CloudBlog 管理后台，这是今日的平台概况。</p>
      </div>
    </div>

    <!-- Statistics Grid -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="4">
        <StatCard
          title="内容总量"
          :value="stats.totalArticle"
          :icon="Document"
          bgColor="#e8f3ff"
          iconColor="#1890ff"
          :loading="loading.stats"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <StatCard
          title="用户总数"
          :value="stats.totalUser"
          :icon="User"
          bgColor="#fff7e6"
          iconColor="#fa8c16"
          :loading="loading.stats"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <StatCard
          title="在线用户"
          :value="stats.onlineUser"
          :icon="Connection"
          bgColor="#f9f0ff"
          iconColor="#722ed1"
          :loading="loading.stats"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="待审核内容"
          :value="stats.pendingContent"
          :icon="ChatLineRound"
          bgColor="#f6ffed"
          iconColor="#52c41a"
          :loading="loading.pending"
          :show-badge="stats.pendingContent > 0"
          clickable
          @click="router.push('/content/review')"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="待处理工单"
          :value="stats.pendingTicket"
          :icon="Tickets"
          bgColor="#fff1f0"
          iconColor="#f5222d"
          :loading="loading.pending"
          :show-badge="stats.pendingTicket > 0"
          clickable
          @click="router.push('/ticket/index')"
        />
      </el-col>
    </el-row>

    <!-- Main Content -->
    <el-row :gutter="20" class="content-row">
      <el-col :span="24">
        <HotArticles :articles="hotArticles" :loading="loading.hot" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Document, User, Connection, ChatLineRound, Tickets } from '@element-plus/icons-vue'
import StatCard from './components/StatCard.vue'
import HotArticles from './components/HotArticles.vue'
import { 
  getPlatformTotalArticleCount, 
  getUserStatistics, 
  getPendingContentCount, 
  getPendingWorkOrderCount, 
  getPlatformHotArticle 
} from '@/api/DataBoard'
import type { PlatformHotArticleItem } from '@/types'

const router = useRouter()

const stats = reactive({
  totalArticle: 0,
  totalUser: 0,
  onlineUser: 0,
  pendingContent: 0,
  pendingTicket: 0
})

const hotArticles = ref<PlatformHotArticleItem[]>([])

const loading = reactive({
  stats: false,
  pending: false,
  hot: false
})

const fetchStats = async () => {
  loading.stats = true
  try {
    const [articleRes, userRes] = await Promise.all([
      getPlatformTotalArticleCount(),
      getUserStatistics()
    ])
    stats.totalArticle = (articleRes as any).data ? parseInt((articleRes as any).data) : 0
    stats.totalUser = (userRes as any).data.totalUser || 0
    stats.onlineUser = (userRes as any).data.onlineUser || 0
  } catch (error) {
    console.error('获取基础统计失败:', error)
  } finally {
    loading.stats = false
  }
}

const fetchPending = async () => {
  loading.pending = true
  try {
    const [contentRes, contentRes2, ticketRes] = await Promise.all([
      getPendingContentCount({ type: 0 }),
      getPendingContentCount({ type: 1 }),
      getPendingWorkOrderCount({ status: 0 })
    ])
    stats.pendingContent = ((contentRes as any).data.total || 0) + ((contentRes2 as any).data.total || 0)
    stats.pendingTicket = (ticketRes as any).data.total || 0
  } catch (error) {
    console.error('获取待办统计失败:', error)
  } finally {
    loading.pending = false
  }
}

const fetchHotArticles = async () => {
  loading.hot = true
  try {
    const res = await getPlatformHotArticle({ limit: 5 })
    hotArticles.value = (res as any).data || []
  } catch (error) {
    console.error('获取热门文章失败:', error)
  } finally {
    loading.hot = false
  }
}

onMounted(() => {
  document.title = '首页 - CloudBlog管理后台'
  fetchStats()
  fetchPending()
  fetchHotArticles()
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.welcome-header {
  margin-bottom: 24px;
}

.greeting h1 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 8px 0;
}

.greeting p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stat-row {
  margin-bottom: 24px;
}

.content-row {
  margin-bottom: 24px;
}
</style>
