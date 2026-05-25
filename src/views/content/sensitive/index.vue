<template>
  <div class="sensitive-manage-container">
    <div class="card-container">
      <div class="card-header">
        <span class="title">敏感词管理</span>
        <el-button type="primary" size="small" :icon="Plus" @click="handleAdd">添加敏感词</el-button>
      </div>
      
      <div class="search-box">
        <el-input v-model="searchWord" placeholder="搜索敏感词" clearable size="small" @input="handleSearch" style="width: 250px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <el-table :data="paginatedData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="word" label="敏感词" width="200" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'danger'" size="small">
              {{ Number(row.status) === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box" v-if="filteredData.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredData.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 敏感词弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? '编辑敏感词' : '添加敏感词'" width="500px">
      <el-form :model="dialog.form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="敏感词" prop="word">
          <el-input v-model="dialog.form.word" placeholder="请输入敏感词" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>

        <el-form-item label="状态" prop="status" v-if="dialog.isEdit">
          <el-radio-group v-model="dialog.form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
import { ref, onMounted, reactive, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getSensitiveWordList, addSensitiveWord, updateSensitiveWord, deleteSensitiveWord } from '@/api/contentManage'
import type { SensitiveWordItem } from '@/types/index'

const loading = ref(false)
const tableData = ref<SensitiveWordItem[]>([])
const searchWord = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredData = computed(() => {
  if (!searchWord.value) return tableData.value
  return tableData.value.filter(item => item.word.includes(searchWord.value))
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSensitiveWordList()
    const data = res.data?.data || res.data || res
    tableData.value = Array.isArray(data) ? data : (data.records || [])
  } catch (error) {
    ElMessage.error('获取敏感词列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  if (currentPage.value > Math.ceil(filteredData.value.length / val)) {
      currentPage.value = 1
  }
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 弹窗表单
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  form: {
    id: 0,
    word: '',
    description: '',
    status: 1
  }
})

const rules = {
  word: [{ required: true, message: '请输入敏感词', trigger: 'blur' }]
}

const handleAdd = () => {
  dialog.isEdit = false
  dialog.form = { id: 0, word: '', description: '', status: 1 }
  dialog.visible = true
}

const handleEdit = (row: SensitiveWordItem) => {
  dialog.isEdit = true
  dialog.form = { ...row, status: Number(row.status) }
  dialog.visible = true
}

const submit = async () => {
  await formRef.value?.validate()
  dialog.submitting = true
  try {
    let res: any
    if (dialog.isEdit) {
      res = await updateSensitiveWord(dialog.form)
    } else {
      res = await addSensitiveWord({
        word: dialog.form.word,
        description: dialog.form.description
      })
    }
    
    if (res.data?.code === 200 || res.code === 200) {
      ElMessage.success(dialog.isEdit ? '修改成功' : '添加成功')
      dialog.visible = false
      fetchData()
    } else {
        // ElMessage.error(res.data?.msg || res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    dialog.submitting = false
  }
}

const handleDelete = (row: SensitiveWordItem) => {
  ElMessageBox.confirm(`确认删除敏感词 "${row.word}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteSensitiveWord(row.id)
      if (res.data?.code === 200 || res.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.data?.msg || res.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
  document.title = '敏感词管理 - CloudBlog管理后台'
})
</script>

<style scoped>
.sensitive-manage-container {
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
</style>
