import request from "@/utils/request";

/**
 * 获取ES索引
 */
export const getEsIndex = () => {
    return request.get('/admin/es/getIndexDefine')
}

/**
 * 全量同步
 */
export const fullSync = () => {
    return request.post('/content/post/syncES')
}