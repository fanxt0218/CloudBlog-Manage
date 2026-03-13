import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '../layout/index.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: { title: '首页', icon: 'House' }
            }
        ]
    },
    {
        path: '/website',
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'Website',
                component: () => import('@/views/website/index.vue'),
                meta: { title: '网站管理', icon: 'Setting' }
            }
        ]
    },
    {
        path: '/content',
        component: Layout,
        redirect: '/content/article',
        meta: { title: '内容管理', icon: 'Document' },
        children: [
            {
                path: 'article',
                name: 'Article',
                component: () => import('@/views/content/article/index.vue'),
                meta: { title: '文章管理' }
            },
            {
                path: 'dynamic',
                name: 'Dynamic',
                component: () => import('@/views/content/dynamic/index.vue'),
                meta: { title: '动态管理' }
            },
            {
                path: 'review',
                name: 'Review',
                component: () => import('@/views/content/review/index.vue'),
                meta: { title: '内容审核' }
            },
            {
                path: 'tags',
                name: 'Tags',
                component: () => import('@/views/content/tags/index.vue'),
                meta: { title: '标签管理' }
            },
            {
                path: 'topic',
                name: 'Topic',
                component: () => import('@/views/content/topics/index.vue'),
                meta: { title: '话题管理' }
            }
        ]
    },
    {
        path: '/user',
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'User',
                component: () => import('@/views/user/index.vue'),
                meta: { title: '用户管理', icon: 'User' }
            }
        ]
    },
    {
        path: '/ticket',
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'Ticket',
                component: () => import('@/views/ticket/index.vue'),
                meta: { title: '工单管理', icon: 'Tickets' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    // 如果没有token且要访问的不是登录页，重定向到登录页
    if (to.path !== '/login' && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router
