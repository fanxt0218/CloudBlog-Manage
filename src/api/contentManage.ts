import request from "@/utils/request";

/**
 * 获取待审核列表
 */
export const getPendingList = (params: {
    title?: string,
    startTime?: string,
    endTime?: string,
    type?: number,
    author?: string,
    pageNum?: number,
    pageSize?: number
}) => {
    return request.get('/admin/content/review/list', { params })
}

/**
 * 审核,路径参数id,请求体status,reason
 */
export const reviewContent = (params: {
    id: number,
    type: number,
    po: {
        opinion: number,
        reason?: string
    }
}) => {
    return request.post(`/admin/content/review/${params.type}/${params.id}`, params.po)
}