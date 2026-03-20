<template>
  <div class="header-container">
    <div class="header-left">
      <span class="title">CloudBlog 博客管理后台</span>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-profile">
          <el-avatar :size="32" :src="userInfoStore.avatar" class="avatar">
            {{ userInfoStore.userName.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="user-name">{{ userInfoStore.userName }}</span>
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import { getUserInfo } from '@/api/index'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userInfoStore = useUserInfoStore()

const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'profile') {
    // 个人信息跳转暂不实现
    ElMessage.info('个人信息功能开发中')
  }
}

const handleLogout = () => {
  userInfoStore.logout()
  router.push('/login')
  ElMessage.success('登出成功')
}

const fetchUserInfo = async () => {
  if (userInfoStore.userId) {
    try {
      const res: any = await getUserInfo(userInfoStore.userId)
      if (res.data) {
        userInfoStore.setUserInfo({
          userName: res.data.userName,
          avatar: res.data.image,
          isVip: res.data.isVip
        })
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.header-container {
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-profile:hover {
  background-color: #f5f7fa;
}

.avatar {
  background-color: #409eff;
  margin-right: 8px;
}

.user-name {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
</style>
