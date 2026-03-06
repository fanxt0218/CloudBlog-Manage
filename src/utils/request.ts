import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useUserInfoStore } from '@/stores/userInfo';

// 创建 axios 实例 - 修改 baseURL 为相对路径
const request = axios.create({
  baseURL: '/api', // 使用相对路径，配合 Vite 代理
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加 token 等认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data;
    // 可以根据后端返回的状态码进行统一处理
    if (res.code == 200) {
      return res;
    } else if (res.code == 401) {
      console.error('未授权，会话已过期');
      const userInfoStore = useUserInfoStore();
      userInfoStore.logout();
      router.replace('/login')
      // 不再强制跳转，让组件或路由守卫决定是否重定向
    } else if (res.code == 601) {
      ElMessage.warning(res.msg || '未知警告');
    } else if (res.code == 500) {
      ElMessage.error(res.msg || '未知错误');
    }
    return res;
  },
  error => {
    console.error('网络错误:', error.message);

    // 增强的错误处理
    if (error.code === 'ERR_NETWORK') {
      console.error('无法连接到服务器，请检查后端服务是否运行');
    } else if (error.code === 'ECONNABORTED') {
      console.error('请求超时');
    } else if (error.response && error.response.status === 401) {
      console.error('未授权，会话已过期');
      const userInfoStore = useUserInfoStore();
      userInfoStore.logout();
      router.replace('/login')
    } else if (error.response) {
      console.error('服务器返回错误:', error.response.status);
    }

    return Promise.reject(error);
  }
);

/**
 * 获取用户id
 */
const getCurrentUserId = (): number => {
  const savedUserId = localStorage.getItem('userId');
  return savedUserId ? parseInt(savedUserId, 10) : 1; // 默认使用1
}

export default request;