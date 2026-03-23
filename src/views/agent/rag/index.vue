<template>
  <div class="rag-management-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>RAG内容管理</span>
          <div class="header-ops">
            <el-button :loading="loading" type="primary" :icon="Refresh" @click="fetchData">刷新</el-button>
            <el-button :loading="submitting" type="success" :icon="Check" @click="handleSubmit">保存修改</el-button>
          </div>
        </div>
      </template>
      
      <div v-loading="loading">
        <el-input
          v-model="ragContent"
          type="textarea"
          :rows="25"
          placeholder="请输入RAG内容..."
          autocomplete="off"
          class="rag-editor"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Check } from '@element-plus/icons-vue'
import { getRagContent, editRagContent } from '@/api/agentManage'

const loading = ref(false)
const submitting = ref(false)
const ragContent = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRagContent()
    // 获取RAG内容时从返回值的data字段中取值
    ragContent.value = res.data?.data || res.data || ''
  } catch (error) {
    console.error(error)
    ElMessage.error('获取RAG内容失败')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!ragContent.value) {
    ElMessage.warning('内容不能为空')
    return
  }
  
  submitting.value = true
  try {
    // 编辑提交时将内容变为一个txt文件，在FormData中以file字段名称上传
    const blob = new Blob([ragContent.value], { type: 'text/plain' })
    const file = new File([blob], 'rag_content.txt', { type: 'text/plain' })
    
    const formData = new FormData()
    formData.append('file', file)
    
    await editRagContent(formData)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
  document.title = 'RAG管理 - CloudBlog管理后台'
})
</script>

<style scoped>
.rag-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-ops {
  display: flex;
  gap: 12px;
}

.rag-editor :deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 15px;
  background-color: #fafafa;
}

.rag-editor :deep(.el-textarea__inner):focus {
  background-color: #fff;
}
</style>
