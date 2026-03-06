<template>
  <div class="review-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="查询标题" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="queryParams.author" placeholder="查询作者" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="文章审核" name="0"></el-tab-pane>
      <el-tab-pane label="动态审核" name="1"></el-tab-pane>
    </el-tabs>

    <div class="table-container" v-loading="loading">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="contentId" label="ID" width="80" />
        <el-table-column label="封面" width="120" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.cover"
              style="width: 80px; height: 50px; border-radius: 4px; display: block; margin: 0 auto;"
              :src="`/api${row.cover}`"
              :preview-src-list="[`/api${row.cover}`]"
              fit="cover"
              preview-teleported
            />
            <span v-else style="color: #999; font-size: 12px">无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.title || '无标题' }}
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="作者" width="150" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="handlePass(row)">通过</el-button>
            <el-button type="danger" size="small" @click="openRejectDialog(row)">不通过</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- 拒绝理由弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="审核不通过"
      width="500px"
      @close="resetDialog"
    >
      <el-form label-width="80px">
        <el-form-item label="拒绝理由">
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝理由（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReject" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPendingList, reviewContent } from '@/api/contentManage'
import type { PendingContent } from '@/types/index'

const activeTab = ref('0')
const loading = ref(false)
const tableData = ref<PendingContent[]>([])
const total = ref(0)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  type: 0, // 0: 文章, 1: 动态
  title: '',
  author: '',
  startTime: '',
  endTime: ''
})

const dateRange = ref<[string, string] | null>(null)

// Dialog state
const dialogVisible = ref(false)
const rejectReason = ref('')
const currentActionRow = ref<PendingContent | null>(null)
const submitLoading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPendingList(queryParams.value)
    const data = res.data?.data || res.data || res
    tableData.value = data.records || []
    total.value = data.total || 0
  } catch (error) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.value.pageNum = 1
  fetchData()
}

const handleReset = () => {
  queryParams.value.title = ''
  queryParams.value.author = ''
  queryParams.value.startTime = ''
  queryParams.value.endTime = ''
  queryParams.value.pageNum = 1
  dateRange.value = null
  fetchData()
}

const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    queryParams.value.startTime = val[0]
    queryParams.value.endTime = val[1]
  } else {
    queryParams.value.startTime = ''
    queryParams.value.endTime = ''
  }
}

const handleTabChange = (name: string) => {
  queryParams.value.type = Number(name)
  queryParams.value.pageNum = 1
  fetchData()
}

const handlePass = async (row: PendingContent) => {
  try {
    await reviewContent({
      id: row.contentId,
      type: queryParams.value.type,
      po: {
        opinion: 2
      }
    })
    ElMessage.success('审核已通过')
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const openRejectDialog = (row: PendingContent) => {
  currentActionRow.value = row
  dialogVisible.value = true
}

const resetDialog = () => {
  rejectReason.value = ''
  currentActionRow.value = null
}

const submitReject = async () => {
  if (!currentActionRow.value) return
  
  submitLoading.value = true
  try {
    await reviewContent({
      id: currentActionRow.value.contentId,
      type: queryParams.value.type,
      po: {
        opinion: 0,
        reason: rejectReason.value
      }
    })
    ElMessage.success('已拒绝该内容')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.review-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.search-wrapper {
  margin-bottom: 20px;
  padding: 20px 20px 0;
  background-color: #fcfcfc;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.table-container {
  margin-top: 15px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
