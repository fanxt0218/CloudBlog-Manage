<template>
  <div class="dynamic-manage-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="动态标题内容" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="作者名">
          <el-input v-model="queryParams.authorName" placeholder="作者名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="话题">
          <el-select v-model="queryParams.sort" placeholder="选择话题" clearable style="width: 150px">
            <el-option
              v-for="item in topicList"
              :key="item.id"
              :label="item.topicName"
              :value="item.id.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
            <el-option label="正常" :value="2" />
            <el-option label="已删除" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container" v-loading="loading">
      <el-table :data="tableData" border style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="作者" width="150">
          <template #default="{ row }">
            <div class="author-info">
              <el-avatar :size="24" :src="`/api${row.userAvatar}`" />
              <span class="ml-2">{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="话题" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ getTopicName(row.topicId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="brief" label="内容简介" show-overflow-tooltip min-width="250" />
        <el-table-column label="互动数据" width="200">
          <template #default="{ row }">
            <div class="stats-box">
              <span>阅:{{ row.browseCount }}</span>
              <span>赞:{{ row.likeCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getShareList, getTopicList, deleteShare } from '@/api/contentManage'
import type { DynamicItem, TopicItem } from '@/types/index'

const VIEW_BASE_URL = 'http://localhost:5173' // 前台界面基础URL

const loading = ref(false)
const topicList = ref<TopicItem[]>([])
const tableData = ref<DynamicItem[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: '',
  authorName: '',
  status: undefined as number | undefined,
  sort: '', // 此处传入话题ID
  startPublishTime: '',
  endPublishTime: ''
})

const fetchTopics = async () => {
  try {
    const res = await getTopicList()
    topicList.value = res.data?.data || res.data || res
  } catch (error) {
    console.error('获取话题列表失败', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getShareList(queryParams.value)
    const data = res.data?.data || res.data || res
    tableData.value = data.content || []
    total.value = data.totalElements || 0
  } catch (error) {
    ElMessage.error('获取动态列表失败')
  } finally {
    loading.value = false
  }
}

const getTopicName = (id: number) => {
  const topic = topicList.value.find(t => t.id === id)
  return topic ? topic.topicName : `话题${id}`
}

const handleSearch = () => {
  queryParams.value.pageNum = 1
  fetchData()
}

const handleReset = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    title: '',
    authorName: '',
    status: undefined,
    sort: '',
    startPublishTime: '',
    endPublishTime: ''
  }
  dateRange.value = null
  fetchData()
}

const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    queryParams.value.startPublishTime = val[0]
    queryParams.value.endPublishTime = val[1]
  } else {
    queryParams.value.startPublishTime = ''
    queryParams.value.endPublishTime = ''
  }
}

const handleSizeChange = (val: number) => {
  queryParams.value.pageSize = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  queryParams.value.pageNum = val
  fetchData()
}

const handleDetail = (row: DynamicItem) => {
  // 详情：新窗口打开
  const url = `${VIEW_BASE_URL}/shareView/${row.id}`
  window.open(url, '_blank')
}

const handleDelete = (row: DynamicItem) => {
  ElMessageBox.confirm('确认删除这条动态吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteShare({
        postId: row.id,
        userId: row.userId
      })
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchTopics()
  fetchData()
  document.title = '动态管理 - CloudBlog管理后台'
})
</script>

<style scoped>
.dynamic-manage-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.search-wrapper {
  background: #fff;
  padding: 24px 24px 4px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.author-info {
  display: flex;
  align-items: center;
}

.ml-2 {
  margin-left: 8px;
}

.stats-box {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #606266;
}

.stats-box span {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
