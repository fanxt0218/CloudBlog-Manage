<template>
  <div class="es-manage-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>搜索引擎管理</span>
          <el-button type="primary" :loading="syncLoading" @click="handleSync">同步ES</el-button>
        </div>
      </template>
      
      <div class="index-structure">
        <h3>ES 索引结构</h3>
        <el-skeleton :loading="loading" animated>
          <template #template>
            <el-skeleton-item variant="p" style="width: 50%" />
            <el-skeleton-item variant="text" v-for="i in 10" :key="i" />
          </template>
          <div v-if="indexStructure" class="structure-content">
            <pre><code class="language-json">{{ formattedStructure }}</code></pre>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-skeleton>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getEsIndex, fullSync } from '@/api/esManage'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const syncLoading = ref(false)
const indexStructure = ref('')

const formattedStructure = computed(() => {
  if (!indexStructure.value) return ''
  try {
    // 尝试解析 JSON 字符串
    const parsed = JSON.parse(indexStructure.value)
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    // 如果解析失败，则返回原始字符串
    return indexStructure.value
  }
})

const fetchIndex = async () => {
  loading.value = true
  try {
    const res: any = await getEsIndex()
    // 根据用户描述，es获取索引时从返回值的msg字段获取
    indexStructure.value = res.msg || ''
  } catch (error) {
    console.error('获取ES索引失败:', error)
    ElMessage.error('获取ES索引失败')
  } finally {
    loading.value = false
  }
}

const handleSync = () => {
  ElMessageBox.confirm(
    '确定要执行全量同步吗？这可能会消耗较多系统资源。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    syncLoading.value = true
    try {
      const res: any = await fullSync()
      ElMessage.success(res.data)
      // 可以在此处重新获取索引结构，视具体需求而定
      fetchIndex()
    } catch (error) {
      console.error('同步失败:', error)
      ElMessage.error('同步失败')
    } finally {
      syncLoading.value = false
    }
  }).catch(() => {
    // 用户取消操作
  })
}

onMounted(() => {
  fetchIndex()
})
</script>

<style scoped>
.es-manage-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.index-structure h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.structure-content {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #476582;
}

:deep(.language-json) {
  color: #476582;
}
</style>
