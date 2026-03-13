<template>
  <div class="topic-manage-container">
    <div class="card-container">
      <div class="card-header">
        <span class="title">话题管理</span>
        <el-button type="primary" size="small" :icon="Plus" @click="handleAdd">添加话题</el-button>
      </div>
      
      <div class="search-box">
        <el-input v-model="queryParams.name" placeholder="搜索话题名称" clearable size="small" @input="handleSearch" style="width: 250px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="封面" width="120" align="center">
          <template #default="{ row }">
            <el-image 
              v-if="row.image"
              :src="'/api' + row.image" 
              style="width: 60px; height: 55px; border-radius: 4px;" 
              fit="cover"
              :preview-src-list="['/api' + row.image]"
              preview-teleported
            />
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="topicName" label="话题名称" width="180" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
              {{ row.status === 0 ? '正常' : '已删除' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" :disabled="row.status === 1" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box" v-if="total > 0">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 话题弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? '编辑话题' : '添加话题'" width="500px">
      <el-form :model="dialog.form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="话题名称" prop="topicName">
          <el-input v-model="dialog.form.topicName" placeholder="请输入话题名称" />
        </el-form-item>
        
        <el-form-item label="封面图" prop="image">
          <el-upload
            class="topic-uploader"
            action=""
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleImageChange"
          >
            <img v-if="dialog.form.image" :src="'/api' + dialog.form.image" class="avatar" />
            <el-icon v-else class="topic-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="el-upload__tip">建议比例 1:1</div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" placeholder="请输入话题描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type UploadFile } from 'element-plus'
import { getTopicList, addTopic, editTopic, deleteTopic, uploadImage } from '@/api/contentManage'
import type { TopicItem } from '@/types/index'

const loading = ref(false)
const tableData = ref<TopicItem[]>([])
const total = ref(0)

const queryParams = reactive({
  name: '',
  pageNum: 1,
  pageSize: 10
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getTopicList(queryParams)
    // 话题列表接口可能返回数组
    const data = res.data?.data || res.data || res
    if (Array.isArray(data)) {
        tableData.value = data
        total.value = data.length
    } else {
        tableData.value = data.records || []
        total.value = data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取话题列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNum = 1
  fetchData()
}

const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  fetchData()
}

// 弹窗表单
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  form: {
    id: 0,
    topicName: '',
    image: '',
    description: '',
    status: 0
  }
})

const rules = {
  topicName: [{ required: true, message: '请输入话题名称', trigger: 'blur' }],
  image: [{ required: true, message: '请上传封面图', trigger: 'change' }]
}

const handleAdd = () => {
  dialog.isEdit = false
  dialog.form = { id: 0, topicName: '', image: '', description: '', status: 0 }
  dialog.visible = true
}

const handleEdit = (row: TopicItem) => {
  dialog.isEdit = true
  dialog.form = { ...row }
  dialog.visible = true
}

const handleImageChange = async (file: UploadFile) => {
  if (!file.raw) return
  
  const formData = new FormData()
  formData.append('file', file.raw)
  
  try {
    const res: any = await uploadImage(formData)
    if (res.data?.code === 200 || res.code === 200) {
      dialog.form.image = res.data?.data || res.data
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('图片上传失败')
    }
  } catch (error) {
    ElMessage.error('图片上传出错')
  }
}

const submit = async () => {
  await formRef.value?.validate()
  dialog.submitting = true
  try {
    let res: any
    if (dialog.isEdit) {
      res = await editTopic(dialog.form)
    } else {
      res = await addTopic(dialog.form)
    }
    
    if (res.data?.code === 200 || res.code === 200) {
      ElMessage.success(dialog.isEdit ? '修改成功' : '添加成功')
      dialog.visible = false
      fetchData()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    dialog.submitting = false
  }
}

const handleDelete = (row: TopicItem) => {
  ElMessageBox.confirm(`确认删除话题 "${row.topicName}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteTopic(row.id, { 
        topicName: row.topicName, 
        image: row.image, 
        description: row.description 
      })
      if (res.data?.code === 200 || res.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.topic-manage-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.card-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header .title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.search-box {
  margin-bottom: 15px;
}

.pagination-box {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 上传样式 */
.topic-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.topic-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.topic-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}
</style>
