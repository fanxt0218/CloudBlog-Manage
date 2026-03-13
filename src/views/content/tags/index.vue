<template>
  <div class="tag-manage-container">
    <el-row :gutter="20">
      <!-- 左侧：标签分类管理 -->
      <el-col :span="8">
        <div class="card-container">
          <div class="card-header">
            <span class="title">标签分类</span>
            <el-button type="primary" size="small" :icon="Plus" @click="handleAddClass">添加分类</el-button>
          </div>
          <div class="search-box">
            <el-input v-model="classQueryParams.className" placeholder="按分类名称搜索" clearable size="small" @input="handleClassSearch">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <el-table :data="classList" v-loading="classLoading" border stripe size="small" highlight-current-row @current-change="handleClassChange">
            <el-table-column prop="className" label="分类名称" show-overflow-tooltip />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
                  {{ row.status === 0 ? '正常' : '已删除' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click.stop="handleEditClass(row)">编辑</el-button>
                <el-button type="danger" link size="small" :disabled="row.status === 1" @click.stop="handleDeleteClass(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- 右侧：标签管理 -->
      <el-col :span="16">
        <div class="card-container">
          <div class="card-header">
            <span class="title">{{ currentClass ? `[${currentClass.className}] 标签列表` : '标签列表 (请先选择分类)' }}</span>
            <el-button type="primary" size="small" :icon="Plus" :disabled="!currentClass" @click="handleAddTag">添加标签</el-button>
          </div>
          <div class="search-box">
             <el-input v-model="tagQueryParams.tagName" placeholder="按标签名称搜索" clearable size="small" @input="handleTagSearch" :disabled="!currentClass">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <el-table :data="tagList" v-loading="tagLoading" border stripe size="small">
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="tagName" label="标签名称" show-overflow-tooltip />
            <el-table-column prop="description" label="说明" show-overflow-tooltip />
            <el-table-column prop="createTime" label="创建时间" width="160" :formatter="TimeUtil.formatTime" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
                  {{ row.status === 0 ? '正常' : '已删除' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditTag(row)">编辑</el-button>
                <el-button type="danger" link size="small" :disabled="row.status === 1" @click="handleDeleteTag(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-box" v-if="tagTotal > 0">
            <el-pagination
              v-model:current-page="tagQueryParams.pageNum"
              v-model:page-size="tagQueryParams.pageSize"
              :total="tagTotal"
              layout="prev, pager, next"
              small
              @current-change="fetchTags"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 分类弹窗 -->
    <el-dialog v-model="classDialog.visible" :title="classDialog.isEdit ? '编辑分类' : '添加分类'" width="400px">
      <el-form :model="classDialog.form" :rules="classRules" ref="classFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="className">
          <el-input v-model="classDialog.form.className" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="classDialog.form.description" type="textarea" placeholder="请输入分类说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="classDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitClass">确定</el-button>
      </template>
    </el-dialog>

    <!-- 标签弹窗 -->
    <el-dialog v-model="tagDialog.visible" :title="tagDialog.isEdit ? '编辑标签' : '添加标签'" width="400px">
      <el-form :model="tagDialog.form" :rules="tagRules" ref="tagFormRef" label-width="80px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="tagDialog.form.tagName" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="tagDialog.form.description" type="textarea" placeholder="请输入标签说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { 
  getTagClassList, getTagList, addTagClass, addTag, editTagClass, editTag, deleteTagClass, deleteTag 
} from '@/api/contentManage'
import type { TagClassItem, TagItem } from '@/types/index'
import { TimeUtil } from '@/utils/TimeUtil'

// 分类相关
const classLoading = ref(false)
const classList = ref<TagClassItem[]>([])
const currentClass = ref<TagClassItem | null>(null)
const classQueryParams = reactive({
  className: '',
})

const fetchClassList = async () => {
  classLoading.value = true
  try {
    const res = await getTagClassList(classQueryParams)
    classList.value = res.data?.data || res.data || res || []
    if (classList.value.length > 0 && !currentClass.value) {
      // 默认选中第一个
      currentClass.value = classList.value[0]
      fetchTags()
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    classLoading.value = false
  }
}

const handleClassSearch = () => {
  fetchClassList()
}

const handleClassChange = (row: TagClassItem | null) => {
  currentClass.value = row
  if (row) {
    tagQueryParams.pageNum = 1
    fetchTags()
  }
}

// 标签相关
const tagLoading = ref(false)
const tagList = ref<TagItem[]>([])
const tagTotal = ref(0)
const tagQueryParams = reactive({
  tagName: '',
  pageNum: 1,
  pageSize: 10
})

const fetchTags = async () => {
  if (!currentClass.value) return
  tagLoading.value = true
  try {
    const res = await getTagList({
      ...tagQueryParams,
      classId: currentClass.value.id
    })
    const data = res.data?.data || res.data || res
    tagList.value = Array.isArray(data) ? data : (data.records || [])
    tagTotal.value = data.total || 0
  } catch (error) {
    ElMessage.error('获取标签列表失败')
  } finally {
    tagLoading.value = false
  }
}

const handleTagSearch = () => {
  tagQueryParams.pageNum = 1
  fetchTags()
}

// 分类弹窗表单
const classFormRef = ref<FormInstance>()
const classDialog = reactive({
  visible: false,
  isEdit: false,
  form: {
    id: 0,
    className: '',
    description: '',
    status: 0
  }
})

const classRules = {
  className: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const handleAddClass = () => {
  classDialog.isEdit = false
  classDialog.form = { id: 0, className: '', description: '', status: 0 }
  classDialog.visible = true
}

const handleEditClass = (row: TagClassItem) => {
  classDialog.isEdit = true
  classDialog.form = { ...row }
  classDialog.visible = true
}

const submitClass = async () => {
  await classFormRef.value?.validate()
  try {
    let res: any
    if (classDialog.isEdit) {
      res = await editTagClass(classDialog.form)
    } else {
      res = await addTagClass(classDialog.form)
    }
    
    if (res.data?.code === 200 || res.code === 200) {
      ElMessage.success(classDialog.isEdit ? '修改成功' : '添加成功')
      classDialog.visible = false
      fetchClassList()
    } else {
    //   ElMessage.error(res.data?.msg || res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDeleteClass = (row: TagClassItem) => {
  ElMessageBox.confirm(`确认删除分类 "${row.className}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteTagClass(row.id, { className: row.className, description: row.description })
      if (res.data?.code === 200 || res.code === 200) {
        ElMessage.success('删除成功')
        fetchClassList()
      } else {
        ElMessage.error(res.data?.msg || res.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 标签弹窗表单
const tagFormRef = ref<FormInstance>()
const tagDialog = reactive({
  visible: false,
  isEdit: false,
  form: {
    id: 0,
    tagName: '',
    classId: 0,
    description: '',
    status: 0
  }
})

const tagRules = {
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
}

const handleAddTag = () => {
  if (!currentClass.value) return
  tagDialog.isEdit = false
  tagDialog.form = { id: 0, tagName: '', classId: currentClass.value.id, description: '', status: 0 }
  tagDialog.visible = true
}

const handleEditTag = (row: TagItem) => {
  tagDialog.isEdit = true
  tagDialog.form = { ...row }
  tagDialog.visible = true
}

const submitTag = async () => {
  await tagFormRef.value?.validate()
  try {
    let res: any
    if (tagDialog.isEdit) {
      res = await editTag(tagDialog.form)
    } else {
      res = await addTag(tagDialog.form)
    }

    if (res.data?.code === 200 || res.code === 200) {
      ElMessage.success(tagDialog.isEdit ? '修改成功' : '添加成功')
      tagDialog.visible = false
      fetchTags()
    } else {
    //   ElMessage.error(res.data?.msg || res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDeleteTag = (row: TagItem) => {
  ElMessageBox.confirm(`确认删除标签 "${row.tagName}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteTag(row.id, { tagName: row.tagName, classId: row.classId, description: row.description })
      if (res.data?.code === 200 || res.code === 200) {
        ElMessage.success('删除成功')
        fetchTags()
      } else {
        ElMessage.error(res.data?.msg || res.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchClassList()
})
</script>

<style scoped>
.tag-manage-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.card-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  height: 100%;
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
