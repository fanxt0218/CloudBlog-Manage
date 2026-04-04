<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 左侧介绍区 -->
      <div class="intro-section">
        <div class="brand">
          <img src="../../assets/manage-login-logo.png" class="logo-icon" alt="Logo">
          <svg class="logo-svg-login" viewBox="0 0 160 40">
            <text x="0" y="30" class="logo-text cloud-login">Cloud</text>
            <text x="88" y="30" class="logo-text blog-login">Blog</text>
          </svg>
        </div>
        <p class="slogan">探索知识，分享生活，连接未来</p>
        <div class="features">
          <div class="feature-item">
            <span class="dot"></span>
            <span>海量优质内容</span>
          </div>
          <div class="feature-item">
            <span class="dot"></span>
            <span>AI 智能辅助创作</span>
          </div>
          <div class="feature-item">
            <span class="dot"></span>
            <span>连接全球创作者</span>
          </div>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="form-section">
        <div class="form-header">
          <h2 class="active">登录</h2>
          <!-- <span>/</span>
          <h2>注册</h2> -->
        </div>

        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-position="top">
          <el-form-item label="手机号" prop="target">
            <el-input 
              v-model="loginForm.target" 
              placeholder="请输入手机号"
              :prefix-icon="Iphone" 
              clearable
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码" 
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="#" class="forgot-password">忘记密码?</a>
          </div>

          <el-button 
            type="primary" 
            class="login-btn" 
            :loading="loading" 
            @click="handleLogin"
          >
            立即登录
          </el-button>
        </el-form>

        <div class="third-party-login">
          <p>其他登录方式</p>
          <div class="icons">
            <div class="icon-wrapper">
              <img src="../../assets/icon/WeChat.png" alt="WeChat" />
            </div>
            <div class="icon-wrapper">
              <img src="../../assets/icon/QQ.png" alt="QQ" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="LoginBar">
import { ref, reactive, onMounted } from 'vue'
import { login, loginByCode } from '@/api/loginPage'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import { Iphone, Phone, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userInfoStore = useUserInfoStore()
const loginFormRef = ref()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  loginType: 'phone',
  target: '',
  password: '',
  twicePassword: '',
  admin: true
})

const rules = {
  target: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        loginForm.twicePassword = loginForm.password
        const res: any = await login(loginForm)
        if (res.code === 200) {
          ElMessage.success('登录成功')
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userId', res.data.userId)
          userInfoStore.setUserInfo({ userName: res.data.userName })
          
          if (rememberMe.value) {
            localStorage.setItem('savedPhone', loginForm.target)
          } else {
            localStorage.removeItem('savedPhone')
          }

          router.push('/')
          setTimeout(() => {
            window.location.reload()
          }, 500)
        } else {
          ElMessage.error(res.msg || '登录失败')
        }
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error('网络错误，请稍后再试')
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  const savedPhone = localStorage.getItem('savedPhone')
  if (savedPhone) {
    loginForm.target = savedPhone
    rememberMe.value = true
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  /* background-color: #f5f7fa; */
  /* padding: 20px; */
}

.login-card {
  display: flex;
  width: 900px;
  height: 550px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 左侧介绍区 */
.intro-section {
  flex: 1;
  background: linear-gradient(135deg, #4316f5 0%, #1e90ff 100%);
  color: #fff;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.brand {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.logo-icon {
    width: 50px;
    height: 50px;
    border-radius: 6px;
}

.logo-svg-login {
  height: 40px;
  width: auto;
}

.logo-text {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 34px;
  font-weight: 800;
}

.cloud-login {
  fill: #fff;
}

.blog-login {
  fill: rgba(255, 255, 255, 0.89);
  font-weight: 600;
  font-size: 35px;
}

.slogan {
  font-size: 20px;
  font-weight: 300;
  margin-bottom: 40px;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #f8b343;
  border-radius: 50%;
}

/* 右侧表单区 */
.form-section {
  flex: 1.2;
  padding: 50px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-header h2.active {
  color: #333;
  position: relative;
}

.form-header h2.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30px;
  height: 4px;
  background: #4316f5;
  border-radius: 2px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.forgot-password {
  font-size: 14px;
  color: #707070;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 45px;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #4316f5 0%, #1e90ff 100%);
  border: none;
  color: white;
  margin-bottom: 30px;
  /* transition: transform 0.2s ease, box-shadow 0.2s ease; */
}

.login-btn:hover {
  /* transform: translateY(-2px); */
  box-shadow: 0 5px 15px rgba(67, 22, 245, 0.3);
}

.third-party-login {
  text-align: center;
}

.third-party-login p {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
  position: relative;
}

.third-party-login p::before,
.third-party-login p::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 25%;
  height: 1px;
  background: #eee;
}

.third-party-login p::before { left: 0; }
.third-party-login p::after { right: 0; }

.icons {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.icon-wrapper {
  width: 30px;
  height: 30px;
  border: 1px solid #eee;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  /* transition: all 0.3s ease; */
}

.icon-wrapper img {
  width: 30px;
  height: 30px;
}

@media (max-width: 950px) {
  .login-card {
    width: 100%;
    height: auto;
    flex-direction: column;
  }
  
  .intro-section {
    padding: 30px;
  }
  
  .form-section {
    padding: 40px 30px;
  }
}
</style>