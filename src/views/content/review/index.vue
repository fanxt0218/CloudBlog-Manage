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
      <el-table :key="activeTab" :data="tableData" border style="width: 100%">
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
            <span class="click-title" @click="handleView(row)">
              {{ row.title || '无标题' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="作者" width="150" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="自动检测建议" width="150" align="center" v-if="queryParams.type === 0">
          <template #default="{ row }">
            <div v-if="row.pass_status !== undefined && row.pass_status !== null">
              <el-tag :type="row.pass_status === 1 ? 'success' : 'danger'" size="small">
                {{ row.pass_status === 1 ? '通过' : '未通过' }}
              </el-tag>
              <el-button 
                v-if="row.detection_result" 
                type="primary" 
                link 
                size="small" 
                style="margin-left: 8px;"
                @click="openReportDialog(row.detection_result)"
              >
                检测报告
              </el-button>
            </div>
            <span v-else style="color: #999; font-size: 12px">-</span>
          </template>
        </el-table-column>
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

    <!-- 检测报告弹窗 -->
    <el-dialog
      v-model="reportDialogVisible"
      title="自动检测报告"
      width="600px"
    >
      <div v-if="currentReport" class="report-content">
        <div class="report-header">
          <div class="report-info-item">
            <span class="label">检测编号：</span>
            <span class="value">{{ currentReport.checkId }}</span>
          </div>
          <div class="report-info-item">
            <span class="label">文章名称：</span>
            <span class="value">{{ currentReport.postName }}</span>
          </div>
          <div class="report-info-item">
            <span class="label">检测时间：</span>
            <span class="value">{{ currentReport.checkTime }}</span>
          </div>
        </div>
        
        <el-divider>检测项</el-divider>
        
        <div class="check-items">
          <div v-for="(item, index) in currentReport.checkItems" :key="index" class="check-item-card">
            <div class="item-name">{{ item.itemName }}</div>
            <div :class="['item-result', item.itemResult === '合规' ? 'result-pass' : 'result-fail']">
              {{ item.itemResult }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPendingList, reviewContent, getContentCheckResult } from '@/api/contentManage'
import type { PendingContent, DetectionResult, ContentCheckRecord } from '@/types/index'

const VIEW_BASE_URL = 'http://localhost:5173' // 前台界面基础URL

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

const reportDialogVisible = ref(false)
const currentReport = ref<DetectionResult | null>(null)

const openReportDialog = (report: DetectionResult) => {
  currentReport.value = report
  reportDialogVisible.value = true
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPendingList(queryParams.value)
    const data = res.data?.data || res.data || res
    
    const records = data.records || []
    
    // 调用接口查询检测结果
    await Promise.all(records.map(async (item: PendingContent) => {
      try {
        const checkRes: any = await getContentCheckResult(item.contentId)
        const checkData = checkRes.data?.data || checkRes.data || checkRes
        if (checkData && checkData.passStatus !== undefined) {
          item.pass_status = checkData.passStatus
          // 解析 detectionResult 字符串
          if (typeof checkData.detectionResult === 'string') {
            try {
              item.detection_result = JSON.parse(checkData.detectionResult)
            } catch (e) {
              console.error('Failed to parse detectionResult', e)
            }
          } else {
            item.detection_result = checkData.detectionResult
          }
        }
      } catch (err) {
        console.error(`获取内容 ${item.contentId} 的检测结果失败`, err)
      }
    }))
    
    tableData.value = records
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

/**
 * 预览处理
 */
const handleView = (row: PendingContent) => {
  if (queryParams.value.type === 0) {
    handleViewPost(row)
  } else {
    handleDetail(row)
  }
}

/**
 * 预览文章
 * @param row 
 */
const handleViewPost = (row: PendingContent) => {
  // 预览：新窗口打开
  const url = `${VIEW_BASE_URL}/postView/${row.authorId}/${row.contentId}`
  window.open(url, '_blank')
}

/**
 * 预览动态
 */
const handleDetail = (row: PendingContent) => {
  // 详情：新窗口打开
  const url = `${VIEW_BASE_URL}/shareView/${row.contentId}`
  window.open(url, '_blank')
}

onMounted(() => {
  fetchData()
  document.title = '内容审核 - CloudBlog管理后台'
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

.click-title {
  /* color: #409eff; */
  cursor: pointer;
  transition: color 0.2s;
}

.click-title:hover {
  color: #66b1ff;
  /* text-decoration: underline; */
}

/* 自动检测报告样式 */
.report-content {
  padding: 10px;
}
.report-header {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.report-info-item {
  margin-bottom: 8px;
  font-size: 14px;
}
.report-info-item:last-child {
  margin-bottom: 0;
}
.report-info-item .label {
  color: #606266;
  font-weight: bold;
}
.report-info-item .value {
  color: #303133;
}
.check-items {
  display: grid;
  /* grid-template-columns: repeat(2, 1fr); */
  gap: 15px;
}
.check-item-card {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}
.check-item-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}
.item-name {
  font-weight: bold;
  color: #303133;
}
.item-result {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 4px;
}
.result-pass {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}
.result-fail {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}
</style>
