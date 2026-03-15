<template>
  <div class="user-manage-container">
    <div class="card-container">
      <div class="card-header">
        <span class="title">用户管理</span>
        <el-button type="primary" size="small" :icon="Plus" @click="handleAdd">添加用户</el-button>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-box">
        <el-form :inline="true" :model="queryParams" class="demo-form-inline" size="small">
          <el-form-item label="模糊搜索">
            <el-input v-model="queryParams.name" placeholder="姓名/昵称" clearable @keyup.enter="handleSearch" style="width: 150px" />
          </el-form-item>
          <el-form-item label="账号">
            <el-input v-model="queryParams.account" placeholder="账号" clearable @keyup.enter="handleSearch" style="width: 120px" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="queryParams.phone" placeholder="手机号" clearable @keyup.enter="handleSearch" style="width: 120px" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="queryParams.email" placeholder="邮箱" clearable @keyup.enter="handleSearch" style="width: 150px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 100px">
              <el-option label="正常" :value="0" />
              <el-option label="锁定" :value="1" />
              <el-option label="删除" :value="2" />
              <el-option label="失效" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table :data="tableData" v-loading="loading" border stripe size="small">
        <el-table-column prop="userId" label="ID" width="70" align="center" />
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar v-if="row.image" :src="row.image.startsWith('http') ? row.image : '/api' + row.image" :size="40" />
            <el-avatar v-else :size="40">{{ row.userName?.charAt(0) || 'U' }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="账号" width="120" show-overflow-tooltip />
        <el-table-column prop="userName" label="昵称" width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="110" />
        <el-table-column prop="email" label="邮箱" width="150" show-overflow-tooltip />
        <el-table-column label="性别" width="60" align="center">
          <template #default="{ row }">
            {{ row.sex === 1 ? '男' : (row.sex === 2 ? '女' : '保密') }}
          </template>
        </el-table-column>
        <el-table-column prop="region" label="地区" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="150" :formatter="TimeUtil.formatTime" />
        
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="warning" link size="small" @click="handleResetPwd(row)">重置密码</el-button>
              <el-dropdown @command="(status: number) => handleStatusChange(row, status)" trigger="click">
                <el-button type="success" link size="small" class="status-btn">
                  状态修改<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="0" :disabled="row.status === 0">设为正常</el-dropdown-item>
                    <el-dropdown-item :command="1" :disabled="row.status === 1">设为锁定</el-dropdown-item>
                    <el-dropdown-item :command="2" :disabled="row.status === 2">设为删除</el-dropdown-item>
                    <el-dropdown-item :command="3" :disabled="row.status === 3">设为失效</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
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

    <!-- 添加用户弹窗 -->
    <el-dialog v-model="addDialog.visible" title="添加用户" width="400px">
      <el-form :model="addDialog.form" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户昵称" prop="userName">
          <el-input v-model="addDialog.form.userName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addDialog.form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <div class="add-tip">注：初始密码默认设置为 fan123</div>
      </el-form>
      <template #footer>
        <el-button @click="addDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="addDialog.submitting" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户弹窗 -->
    <el-dialog v-model="editDialog.visible" title="编辑用户信息" width="550px">
      <el-form :model="editDialog.form" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
          >
            <img v-if="editDialog.form.image" :src="editDialog.form.image.startsWith('http') ? editDialog.form.image : '/api' + editDialog.form.image" class="avatar-preview" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="昵称" prop="userName">
          <el-input v-model="editDialog.form.userName" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="editDialog.form.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">保密</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="地区">
          <el-cascader
            v-model="regionData.selectedOptions"
            :options="regionOptions"
            placeholder="请选择省/市/区"
            style="width: 100%;"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="职业" prop="profession">
          <el-input v-model="editDialog.form.profession" placeholder="请输入职业" />
        </el-form-item>
        
        <el-form-item label="生日" prop="birthDate">
          <el-date-picker
            v-model="editDialog.form.birthDate"
            type="date"
            placeholder="选择生日"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="个人简介" prop="introduction">
          <el-input v-model="editDialog.form.introduction" type="textarea" :rows="3" placeholder="请输入个人简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="editDialog.submitting" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Plus, Search, Refresh, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type UploadFile } from 'element-plus'
import { regionData as chinaRegionData, codeToText } from 'element-china-area-data'
import { getUserList, resetPassword, disableUser, updateUser, uploadAvatar, register } from '@/api/userManage'
import type { UserInfo } from '@/types/index'
import { TimeUtil } from '@/utils/TimeUtil'

const loading = ref(false)
const tableData = ref<UserInfo[]>([])
const total = ref(0)

const queryParams = reactive({
  name: '',
  account: '',
  email: '',
  phone: '',
  status: null as number | null,
  startTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 10
})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await getUserList({
        ...queryParams,
        // 如果后端需要严格类型，这里可能需要处理null
        status: queryParams.status !== null ? queryParams.status : null
    } as any)
    
    const data = res.data?.data || res.data || res
    tableData.value = data.records || []
    total.value = data.total || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNum = 1
  fetchData()
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.account = ''
  queryParams.email = ''
  queryParams.phone = ''
  queryParams.status = null
  queryParams.startTime = ''
  queryParams.endTime = ''
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

// ---------------- 添加用户 ----------------
const addFormRef = ref<FormInstance>()
const addDialog = reactive({
  visible: false,
  submitting: false,
  form: {
    userName: '',
    phone: '',
  }
})

const addRules = {
  userName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const handleAdd = () => {
  addDialog.form = { userName: '', phone: '' }
  addDialog.visible = true
}

const submitAdd = async () => {
  await addFormRef.value?.validate()
  addDialog.submitting = true
  try {
    const payload = {
      ...addDialog.form,
      password: 'fan123',
      twicePassword: 'fan123'
    }
    const res: any = await register(payload)
    if (res.data?.code === 200 || res.code === 200) {
      ElMessage.success('添加成功')
      addDialog.visible = false
      fetchData()
    } else {
      ElMessage.error(res.data?.msg || res.msg || '添加失败')
    }
  } catch (error) {
    ElMessage.error('操作异常')
  } finally {
    addDialog.submitting = false
  }
}

// ---------------- 编辑用户 ----------------
const editFormRef = ref<FormInstance>()
const editDialog = reactive({
  visible: false,
  submitting: false,
  form: {
    userId: 0,
    userName: '',
    sex: 0,
    image: '',
    introduction: '',
    region: '',
    birthDate: '',
    profession: ''
  }
})

// 分解地区结构：省/市/区
const regionOptions = chinaRegionData
const regionData = reactive({
  selectedOptions: [] as string[]
})

const editRules = {
  userName: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

const handleEdit = (row: UserInfo) => {
  editDialog.form = {
    userId: row.userId,
    userName: row.userName || '',
    sex: row.sex ?? 0,
    image: row.image || '',
    introduction: row.introduction || '',
    region: row.region || '',
    birthDate: row.birthday || '', // 对应后端的生日字段映射
    profession: row.profession || ''
  }
  
  // 解析地区信息：省/市/区，转换为 code 数组供 cascader 使用
  regionData.selectedOptions = []
  if (row.region) {
    const regions = row.region.split('/')
    const p = regions[0]
    const c = regions[1]
    const d = regions[2]
    
    // 手动构造映射寻找code
    let pCode: string | undefined
    let cCode: string | undefined
    let dCode: string | undefined

    const pNode = chinaRegionData.find(item => item.label === p)
    if (pNode) {
      pCode = pNode.value
      regionData.selectedOptions.push(pCode)
      
      if (c && pNode.children) {
        const cNode = pNode.children.find(item => item.label === c)
        if (cNode) {
          cCode = cNode.value
          regionData.selectedOptions.push(cCode)
          
          if (d && cNode.children) {
            const dNode = cNode.children.find(item => item.label === d)
            if (dNode) {
              dCode = dNode.value
              regionData.selectedOptions.push(dCode)
            }
          }
        }
      }
    }
  }
  
  editDialog.visible = true
}

const handleAvatarChange = async (file: UploadFile) => {
  if (!file.raw) return
  
  const formData = new FormData()
  formData.append('file', file.raw)
  
  try {
    const res: any = await uploadAvatar(formData)
    if (res.data?.code === 200 || res.code === 200) {
      editDialog.form.image = res.data?.data || res.data
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error('头像上传失败')
    }
  } catch (error) {
    ElMessage.error('头像上传出错')
  }
}

const submitEdit = async () => {
  await editFormRef.value?.validate()
  editDialog.submitting = true
  
  // 组合地区信息
  let regionStr = ''
  if (regionData.selectedOptions && regionData.selectedOptions.length > 0) {
    const texts = regionData.selectedOptions.map(code => codeToText[code] || '')
    regionStr = texts.filter(t => t).join('/')
  }
  editDialog.form.region = regionStr
  
  try {
    const res: any = await updateUser(editDialog.form)
    if (res.data?.code === 200 || res.code === 200) {
      ElMessage.success('修改成功')
      editDialog.visible = false
      fetchData()
    } else {
      ElMessage.error(res.data?.msg || res.msg || '修改失败')
    }
  } catch (error) {
    ElMessage.error('操作异常')
  } finally {
    editDialog.submitting = false
  }
}

// ---------------- 状态切换与重置密码 ----------------
const getStatusType = (status: number) => {
  switch (status) {
    case 0: return 'success'
    case 1: return 'warning'
    case 2: return 'info'
    case 3: return 'danger'
    default: return ''
  }
}

const getStatusLabel = (status: number) => {
  const labels: Record<number, string> = {
    0: '正常',
    1: '锁定',
    2: '删除',
    3: '失效'
  }
  return labels[status] || '未知'
}

const handleStatusChange = (row: UserInfo, targetStatus: number) => {
  const actionText = getStatusLabel(targetStatus)
  
  ElMessageBox.confirm(`确认将用户 "${row.userName || row.account}" 的状态修改为 [${actionText}] 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await disableUser({ targetId: row.userId, status: targetStatus })
      if (res.data?.code === 200 || res.code === 200) {
        ElMessage.success(`已成功修改为${actionText}`)
        fetchData()
      } else {
        ElMessage.error(res.data?.msg || res.msg || `修改失败`)
      }
    } catch (error) {
      ElMessage.error('操作异常')
    }
  }).catch(() => {})
}

const handleResetPwd = (row: UserInfo) => {
  ElMessageBox.confirm(`确认重置用户 "${row.userName || row.account}" 的密码吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await resetPassword({ targetId: row.userId })
      if (res.data?.code === 200 || res.code === 200) {
        ElMessage.success('重置成功')
      } else {
        ElMessage.error(res.data?.msg || res.msg || '重置失败')
      }
    } catch (error) {
      ElMessage.error('操作异常')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
  document.title = '用户管理 - CloudBlog管理后台'
})
</script>

<style scoped>
.user-manage-container {
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

.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0px; /* el-button already has some margin if they are siblings, but flex gap is cleaner */
}

.operation-buttons :deep(.el-dropdown) {
  vertical-align: middle;
}

.add-tip {
  color: #E6A23C;
  font-size: 12px;
  margin-left: 80px;
  margin-top: -10px;
}

/* 头像上传样式 */
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 80px;
  height: 80px;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 24px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  text-align: center;
  line-height: 80px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  display: block;
  object-fit: cover;
  border-radius: 50%;
}
</style>
