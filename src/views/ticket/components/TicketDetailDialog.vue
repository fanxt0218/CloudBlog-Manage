<template>
  <el-dialog
    :model-value="visible"
    title="工单详情"
    width="600px"
    append-to-body
    @close="handleClose"
  >
    <div v-if="order" class="dialog-content">
      <!-- 基础信息 -->
      <el-descriptions :column="2" border size="small" class="detail-base">
        <el-descriptions-item label="工单号">{{ order.orderId }}</el-descriptions-item>
        <el-descriptions-item label="发起人">{{ order.userName }}</el-descriptions-item>
        <el-descriptions-item label="工单类型">{{ formatOrderType(order.orderType) }}</el-descriptions-item>
        <el-descriptions-item label="目标类型">{{ formatTargetType(order.targetType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ formatStatus(order.status) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ TimeUtil.formatTime(order, { property: 'createTime' }) }}</el-descriptions-item>
      </el-descriptions>

      <!-- 举报内容块 -->
      <div v-if="order.orderType === 0" class="target-card mt-4" v-loading="loadingDetail" @click="handleTargetClick">
        <div v-if="order.targetType === 0 && targetArticleDetail" class="card-inner clickable">
           <h4>📌 举报文章：{{ targetArticleDetail.title }}</h4>
           <p>{{ targetArticleDetail.introduction || '暂无简介' }}</p>
           <span class="view-hint">点击查看文章详情 -></span>
        </div>
        <div v-else-if="order.targetType === 1 && targetShareDetail" class="card-inner clickable">
           <div class="user-header">
              <el-avatar :size="24" :src="targetShareDetail.userImage ? `/api${targetShareDetail.userImage}` : ''" />
              <span style="margin-left:8px; font-weight: bold;">{{ targetShareDetail.userName }}</span>
           </div>
           <p style="margin-top: 8px;">📌 举报动态及其内容</p>
           <span class="view-hint">点击查看动态详情 -></span>
        </div>
        <div v-else-if="order.targetType === 3" class="card-inner clickable">
           <h4>📌 举报违规用户 (ID: {{ order.targetId }})</h4>
           <span class="view-hint">点击查看用户主页 -></span>
        </div>
        <div v-else-if="order.targetType === 2" class="card-inner clickable">
           <h4>📌 举报违规评论 (ID: {{ order.targetId }})</h4>
           <span class="view-hint">该类型暂不支持直接跳转</span>
        </div>
        <div v-else class="card-inner">
           <span style="color: #909399;">获取目标信息中或获取失败...</span>
        </div>
      </div>

      <!-- 详细说明 -->
      <div class="detail-section mt-4">
        <h4>详情说明</h4>
        <div class="desc-box">{{ order.reason || '无详细原因说明' }}</div>
      </div>
      
      <!-- 附件展示 -->
      <div v-if="order.filePath" class="detail-section mt-4">
        <h4>附件信息</h4>
        <div class="attachment-list">
          <template v-for="(file, index) in order.filePath.split(',')" :key="index">
            <el-image 
              v-if="isImage(file)" 
              :src="file.startsWith('http') ? file : `/api${file}`" 
              class="attach-item img" 
              fit="cover"
              :preview-src-list="[file.startsWith('http') ? file : `/api${file}`]" />
            <video 
              v-else-if="isVideo(file)" 
              :src="file.startsWith('http') ? file : `/api${file}`" 
              controls 
              class="attach-item video"></video>
            <a v-else :href="file.startsWith('http') ? file : `/api${file}`" target="_blank" class="attach-item file-link">{{ file.substring(file.lastIndexOf('/') + 1) || '附件文件' }}</a>
          </template>
        </div>
      </div>

      <!-- 处理结果 -->
      <div v-if="order.status !== 0" class="detail-section mt-4">
        <h4>处理结果</h4>
        <div class="desc-box success-bg">{{ order.handleReason || '已处理（无额外说明）' }}</div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="order?.status === 0" type="primary" @click="handleProcess">去处理</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getContentDetail, getShareDetail } from '@/api/contentManage'
import type { WorkOrderListItem, ContentDetail, ShareDetail } from '@/types/index'
import { TimeUtil } from '@/utils/TimeUtil'

const VIEW_BASE_URL = 'http://localhost:5173'

const props = defineProps<{
  visible: boolean
  order: WorkOrderListItem | null
}>()

const emit = defineEmits(['update:visible', 'process'])

const targetArticleDetail = ref<ContentDetail | null>(null)
const targetShareDetail = ref<ShareDetail | null>(null)
const loadingDetail = ref(false)

watch(() => props.visible, async (newVal) => {
  if (newVal && props.order) {
    const row = props.order
    targetArticleDetail.value = null
    targetShareDetail.value = null

    if (row.orderType === 0) { // 举报工单才需要附加查询目标
      loadingDetail.value = true
      try {
        if (row.targetType === 0) { // 举报文章
          const res = await getContentDetail({ postId: row.targetId })
          targetArticleDetail.value = res.data?.data || res.data || res
        } else if (row.targetType === 1) { // 举报动态
          const res = await getShareDetail({ shareId: row.targetId })
          targetShareDetail.value = res.data?.data || res.data || res
        }
      } catch (e) {
        console.error(e)
        ElMessage.error('获取目标详情失败')
      } finally {
        loadingDetail.value = false
      }
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleProcess = () => {
  handleClose() // 关闭详情面板
  emit('process', props.order) // 触发去处理事件
}

const handleTargetClick = () => {
  if (!props.order) return
  const { targetType, targetId } = props.order
  let url = ''
  if (targetType === 0 && targetArticleDetail.value) {
    url = `${VIEW_BASE_URL}/postView/${targetArticleDetail.value.authorId}/${targetId}`
  } else if (targetType === 1) {
    url = `${VIEW_BASE_URL}/shareView/${targetId}`
  } else if (targetType === 3) {
    url = `${VIEW_BASE_URL}/otherUserHome/${targetId}`
  } else if (targetType === 2) {
    ElMessage.info('评论详情跳转暂不支持')
    return
  }
  
  if (url) {
    window.open(url, '_blank')
  }
}

const isImage = (path: string) => {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(path)
}

const isVideo = (path: string) => {
  return /\.(mp4|webm|ogg)$/i.test(path)
}

const formatTargetType = (type: number | string) => {
  const map: Record<string, string> = {
    '0': '文章',
    '1': '动态',
    '2': '评论',
    '3': '账号'
  }
  return map[String(type)] || '未知'
}

const formatOrderType = (type: number | string) => {
  const map: Record<string, string> = {
    '0': '内容举报',
    '1': 'BUG',
    '2': '建议',
    '3': '忘记密码'
  }
  return map[String(type)] || '未知'
}

const formatStatus = (status: number | string) => {
  const map: Record<string, string> = {
    '0': '未处理',
    '1': '处理中',
    '2': '处理完成'
  }
  return map[String(status)] || '未知'
}

</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}

.detail-section h4 {
  margin-bottom: 8px;
  color: #303133;
  font-size: 15px;
  border-left: 3px solid #409EFF;
  padding-left: 8px;
}

.desc-box {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.success-bg {
  background: #f0f9eb;
  color: #67c23a;
}

.target-card {
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.card-inner {
  padding: 16px;
  background-color: #fdfdfd;
}

.card-inner.clickable {
  cursor: pointer;
}

.card-inner.clickable:hover {
  background-color: #ecf5ff;
}

.card-inner h4 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #303133;
}

.card-inner p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.view-hint {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #409EFF;
}

.user-header {
  display: flex;
  align-items: center;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.attach-item {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.attach-item.video {
  width: 160px;
  background: #000;
}

.attach-item.file-link {
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
  min-height: 40px;
  padding: 8px 12px;
  background: #f4f4f5;
  color: #409EFF;
  text-decoration: none;
  font-size: 13px;
  border-radius: 4px;
}

.attach-item.file-link:hover {
  background: #ecf5ff;
}
</style>
