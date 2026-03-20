<template>
  <div class="redis-manage-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">缓存管理</span>
          <div class="header-actions">
            <el-button type="danger" plain @click="handleClearAll">清空所有缓存</el-button>
          </div>
        </div>
      </template>

      <!-- Search Section -->
      <div class="search-section">
        <el-input
          v-model="searchKey"
          placeholder="请输入缓存 Key"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch">搜索内容</el-button>
          </template>
        </el-input>
        <el-button 
            type="warning" 
            :disabled="!searchKey" 
            style="margin-left: 12px;"
            @click="handleClearKey"
        >
          清除该 Key
        </el-button>
      </div>

      <!-- Result Section -->
      <div class="result-section">
        <div class="result-header">
           <span class="label">缓存值</span>
           <el-tag v-if="searchKey && !loading" :type="resultData ? 'success' : 'info'" size="small">
             {{ resultData ? '已查得' : '未查询或无数据' }}
           </el-tag>
        </div>
        
        <el-skeleton :loading="loading" animated>
          <template #template>
            <el-skeleton-item variant="p" style="width: 30%" />
            <el-skeleton-item variant="text" v-for="i in 5" :key="i" />
          </template>
          <template #default>
            <div v-if="resultData" class="data-render">
              <pre><code class="language-json">{{ formattedData }}</code></pre>
            </div>
            <el-empty v-else description="请输入 Key 进行搜索" />
          </template>
        </el-skeleton>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getValueByKey, clearCache } from '@/api/redisManage'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchKey = ref('')
const resultData = ref<any>(null)
const loading = ref(false)

const formattedData = computed(() => {
  if (!resultData.value) return ''
  try {
    return JSON.stringify(resultData.value, null, 2)
  } catch (e) {
    return String(resultData.value)
  }
})

const handleSearch = async () => {
  if (!searchKey.value.trim()) {
    ElMessage.warning('请输入搜索 Key')
    return
  }
  
  loading.value = true
  try {
    const res: any = await getValueByKey(searchKey.value)
    // 根据描述，从 data 字段中进行渲染
    resultData.value = res.data
    if (!res.data) {
      ElMessage.info('未找到对应的缓存数据')
    }
  } catch (error) {
    console.error('搜索缓存失败:', error)
    ElMessage.error('获取缓存失败')
    resultData.value = null
  } finally {
    loading.value = false
  }
}

const handleClearKey = () => {
  if (!searchKey.value) return
  
  ElMessageBox.confirm(
    `确定要清除 Key: [${searchKey.value}] 的缓存吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await clearCache({ keys: [searchKey.value] })
      ElMessage.success('清除成功')
      if (resultData.value) {
        resultData.value = null
      }
    } catch (error) {
      ElMessage.error('清除失败')
    }
  }).catch(() => {})
}

const handleClearAll = () => {
  ElMessageBox.confirm(
    '确定要清空所有缓存吗？此操作不可逆，请谨慎操作。',
    '危险操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error',
    }
  ).then(async () => {
    try {
      // 不传 key 表示清空缓存
      await clearCache({})
      ElMessage.success('全量缓存刷新请求已发送')
      resultData.value = null
    } catch (error) {
      ElMessage.error('清理失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.redis-manage-container {
  padding: 24px;
}

.box-card {
  border-radius: 12px;
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.search-section {
  display: flex;
  margin-bottom: 30px;
}

.search-input {
  max-width: 600px;
}

.result-section {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #fafafa;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-header .label {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.data-render {
  background-color: #f4f4f5;
  padding: 15px;
  border-radius: 4px;
  max-height: 600px;
  overflow-y: auto;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #476582;
}
</style>
