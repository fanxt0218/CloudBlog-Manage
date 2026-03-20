import request from '@/utils/request'

/**
 * 根据key获取value
 */
export const getValueByKey = (key: string) => {
    return request.get('/admin/redis/get', { params: { key } })
}

/**
 * 清除缓存
 */
export const clearCache = (params: {
    keys?: string[]
}) => {
    return request.delete('/admin/redis/refresh', { params })
}