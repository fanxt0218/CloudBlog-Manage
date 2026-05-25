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
            },
            {
                path: 'sensitive',
                name: 'Sensitive',
                component: () => import('@/views/content/sensitive/index.vue'),
                meta: { title: '敏感词管理' }
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
    },
    {
        path: '/es',
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'ESManage',
                component: () => import('@/views/es/index.vue'),
                meta: { title: '搜索引擎管理', icon: 'Search' }
            }
        ]
    },
    {
        path: '/redis',
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'RedisManage',
                component: () => import('@/views/redis/index.vue'),
                meta: { title: '缓存管理', icon: 'Brush' }
            }
        ]
    },
    {
        path: '/agent',
        component: Layout,
        meta: { title: '智能体管理', icon: 'Cpu' },
        children: [
            {
                path: 'rag',
                name: 'RAGManage',
                component: () => import('@/views/agent/rag/index.vue'),
                meta: { title: 'RAG管理' }
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
