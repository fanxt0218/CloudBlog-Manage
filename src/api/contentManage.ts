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

/**
 * 获取内容列表
 */
export const getContentList = (params: {
    title?: string;
    authorName?: string;
    status?: number;
    startPublishTime?: string;
    endPublishTime?: string;
    vip?: boolean;
    sort?: string;
    pageNum?: number;
    pageSize?: number;
}) => {
    return request.post('/admin/content/postList', params)
}

/**
 * 动态列表
 */
export const getShareList = (params: {
    title?: string;
    authorName?: string;
    status?: number;
    startPublishTime?: string;
    endPublishTime?: string;
    sort?: string;
    pageNum?: number;
    pageSize?: number;
}) => {
    return request.post('/admin/content/shareList', params)
}

/**
 * 获取话题列表
 */
export const getTopicList = () => {
    return request.get('/content/share/getTopicList')
}

/**
 * 删除文章
 */
export const deleteContent = (data: {
    postId: number,
    userId: number
}) => {
    return request.post(`/content/post/delete`, data)
}

/**
 * 删除动态
 */
export const deleteShare = (data: {
    postId: number,
    userId: number
}) => {
    return request.post(`/content/share/delete`, data)
}