import request from "@/utils/request";

/**
 * 获取平台总文章数
 */
export const getPlatformTotalArticleCount = () => {
    return request.get('/admin/data/getTotalArticleCount')
}

/**
 * 获取用户统计数据
 */
export const getUserStatistics = () => {
    return request.get('/admin/data/getDataBoardUser')
}

/**
 * 获取待审核内容数量（total值）
 */
export const getPendingContentCount = (params: {
    type: number
}) => {
    return request.get('/admin/content/review/list', { params })
}

/**
 * 获取待审核工单数量，status传0（total值）
 */
export const getPendingWorkOrderCount = (data: {
    status: number
}) => {
    return request.post('/admin/workOrder/getWorkOrderList', data)
}

/**
 * 获取平台热门文章
 */
export const getPlatformHotArticle = (params: {
    limit?: number
}) => {
    return request.get('/admin/data/getHotArticle', { params })
}
