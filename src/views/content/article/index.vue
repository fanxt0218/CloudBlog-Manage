<template>
  <div class="article-manage-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="queryParams.title" placeholder="文章标题关键字" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="作者名称">
          <el-input v-model="queryParams.authorName" placeholder="作者名称" clearable @keyup.enter="handleSearch" />
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
        <el-form-item label="VIP文章">
          <el-select v-model="queryParams.vip" placeholder="是否VIP" clearable style="width: 120px">
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="queryParams.sort" placeholder="排序规则" style="width: 120px">
            <el-option label="最新" value="new" />
            <el-option label="最热" value="hot" />
            <el-option label="综合" value="comp" />
          </el-select>
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
        <el-table-column prop="title" label="标题" show-overflow-tooltip min-width="200" />
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column label="VIP" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isVip ? 'warning' : 'info'" size="small">
              {{ row.isVip ? 'VIP' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据统计" width="280">
          <template #default="{ row }">
            <div class="stats-box">
              <span><i class="el-icon-view"></i> 阅:{{ row.viewCount }}</span>
              <span>赞:{{ row.likeCount }}</span>
              <span>评:{{ row.commentCount }}</span>
              <span>藏:{{ row.collectCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" align="center" :formatter="TimeUtil.formatTime" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">预览</el-button>
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
import { getContentList, deleteContent } from '@/api/contentManage'
import type { ContentItem } from '@/types/index'
import { TimeUtil } from '@/utils/TimeUtil'

const VIEW_BASE_URL = 'http://localhost:5173' // 前台界面基础URL

const loading = ref(false)
const tableData = ref<ContentItem[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: '',
  authorName: '',
  startPublishTime: '',
  endPublishTime: '',
  vip: undefined as boolean | undefined,
  sort: 'new' // 默认最新
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getContentList(queryParams.value)
    // 根据实际接口响应结构调整
    const data = res.data?.data || res.data || res
    tableData.value = data.content || []
    total.value = data.totalElements || 0
  } catch (error) {
    console.error(error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
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
    startPublishTime: '',
    endPublishTime: '',
    vip: undefined,
    sort: 'new'
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

const handleEdit = (row: ContentItem) => {
  // 预览：新窗口打开
  const url = `${VIEW_BASE_URL}/postView/${row.authorId}/${row.id}`
  window.open(url, '_blank')
}

const handleDelete = (row: ContentItem) => {
  ElMessageBox.confirm(`确认删除文章《${row.title}》吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteContent({
        postId: row.id,
        userId: row.authorId
      })
      ElMessage.success('删除成功')
      fetchData()
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
.article-manage-container {
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

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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
</style>
