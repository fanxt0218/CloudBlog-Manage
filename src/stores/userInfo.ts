import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    isLoggedIn: false,
    userId: Number(localStorage.getItem('userId')) || 0,
    userName: localStorage.getItem('userName') || '',
    token: localStorage.getItem('token') || '',
    avatar: '',
    isVip: 0,
  }),
  actions: {
    // 初始化，同步登录状态
    init() {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (userId && token) {
        this.isLoggedIn = true;
        this.userId = Number(userId);
        this.token = token;
      } else {
        this.isLoggedIn = false;
        this.userId = 0;
        this.token = '';
      }
    },
    // 登录成功设置状态
    login(data: { userId: number, token: string, userName?: string }) {
      this.isLoggedIn = true;
      this.userId = data.userId;
      this.token = data.token;
      if (data.userName) this.userName = data.userName;

      localStorage.setItem('userId', String(data.userId));
      localStorage.setItem('token', data.token);
      if (data.userName) localStorage.setItem('userName', data.userName);
    },
    // 退出或 Token 过期清理状态
    logout() {
      this.isLoggedIn = false;
      this.userId = 0;
      this.token = '';
      this.userName = '';
      this.avatar = '';
      this.isVip = 0;

      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
    },
    // 设置通用用户信息
    setUserInfo(data: { userName?: string, avatar?: string, isVip?: number }) {
      if (data.userName !== undefined) {
        this.userName = data.userName;
        localStorage.setItem('userName', data.userName);
      }
      if (data.avatar !== undefined) this.avatar = data.avatar;
      if (data.isVip !== undefined) this.isVip = data.isVip;
    }
  }
})