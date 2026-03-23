<template>
  <el-menu
    class="el-menu-vertical"
    :default-active="activePath"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
  >
    <el-menu-item index="/dashboard">
      <el-icon><House /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-menu-item index="/website/index">
      <el-icon><Setting /></el-icon>
      <span>网站管理</span>
    </el-menu-item>
    <el-sub-menu index="/content">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>内容管理</span>
      </template>
      <el-menu-item index="/content/article">文章管理</el-menu-item>
      <el-menu-item index="/content/dynamic">动态管理</el-menu-item>
      <el-menu-item index="/content/review">内容审核</el-menu-item>
      <el-menu-item index="/content/tags">标签管理</el-menu-item>
      <el-menu-item index="/content/topic">话题管理</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="/user/index">
      <el-icon><User /></el-icon>
      <span>用户管理</span>
    </el-menu-item>
    <el-menu-item index="/ticket/index">
      <el-icon><Tickets /></el-icon>
      <span>工单管理</span>
    </el-menu-item>
    <el-menu-item index="/es/index">
      <el-icon><Search /></el-icon>
      <span>搜索引擎管理</span>
    </el-menu-item>
    <el-menu-item index="/redis/index">
      <el-icon><Brush /></el-icon>
      <span>缓存管理</span>
    </el-menu-item>
    <el-menu-item index="/agent/rag">
      <el-icon><UserFilled /></el-icon>
      <span>智能体管理</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { House, Setting, Document, User, Tickets, Search, Brush, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const activePath = computed(() => {
  return route.path
})
</script>

<style scoped>
.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style>
