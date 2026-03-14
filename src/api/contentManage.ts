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
export const getTopicList = (params: {
    name?: string,
    pageNum?: number,
    pageSize?: number
}) => {
    return request.get('/content/share/getTopicList', { params })
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

/**
 * 获取标签分类列表
 */
export const getTagClassList = (params: {
    className?: string,
    pageNum?: number,
    pageSize?: number
}) => {
    return request.get('/content/Interest/tagClassList', { params })
}

/**
 * 获取标签列表
 */
export const getTagList = (params: {
    classId: number,
    tagName?: string,
    pageNum?: number,
    pageSize?: number
}) => {
    return request.get('/content/Interest/tagList', { params })
}

/**
 * 编辑标签
 */
export const editTag = (data: {
    id: number,
    tagName: string,
    classId: number,
    description: string,
    status?: number
}) => {
    return request.post('/admin/content/editTag', data)
}

/**
 * 编辑标签分类
 */
export const editTagClass = (data: {
    id: number,
    className: string,
    description: string,
    status?: number
}) => {
    return request.post('/admin/content/editTagCategory', data)
}

/**
 * 编辑话题
 */
export const editTopic = (data: {
    id: number,
    topicName: string,
    image: string,
    description: string,
    status?: number
}) => {
    return request.post('/admin/content/editTopic', data)
}

/**
 * 添加话题
 */
export const addTopic = (data: {
    topicName: string,
    image: string,
    description: string
}) => {
    return request.post('/admin/content/addTopic', data)
}

/**
 * 添加标签
 */
export const addTag = (data: {
    tagName: string,
    classId: number,
    description: string
}) => {
    return request.post('/admin/content/addTag', data)
}

/**
 * 添加标签分类
 */
export const addTagClass = (data: {
    className: string,
    description: string
}) => {
    return request.post('/admin/content/addTagCategory', data)
}

/**
 * 删除标签
 */
export const deleteTag = (id: number, currentData: { tagName: string, classId: number, description: string }) => {
    return editTag({ ...currentData, id, status: 1 })
}

/**
 * 删除标签分类
 */
export const deleteTagClass = (id: number, currentData: { className: string, description: string }) => {
    return editTagClass({ ...currentData, id, status: 1 })
}

/**
 * 上传图片
 */
export const uploadImage = (formData: FormData) => {
    return request.post(`/content/create/uploadImage`, formData, {
        // 不设置Content-Type，让浏览器自动设置为multipart/form-data
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 删除话题
 */
export const deleteTopic = (id: number, currentData: { topicName: string, image: string, description: string }) => {
    return editTopic({ ...currentData, id, status: 1 })
}

/**
 * 获取内容详情
 */
export const getContentDetail = (params: {
    postId: number,
    userId?: number
}) => {
    return request.get(`/content/post/getPost`, { params })
}

/**
 * 获取动态详情
 */
export const getShareDetail = (params: {
    shareId: number,
    userId?: number
}) => {
    return request.get(`/content/share/getShare`, { params })
}