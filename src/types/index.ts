/**
 * 分页响应体
 */
export interface PageResponse<T> {
    records: T[],
    current: number,
    size: number,
    total: number,
    pages: number
}

/**
 * 待审核列表
 */
export interface PendingContent {
    contentId: number,
    title: string,
    type: number,
    authorId: string,
    authorName: string,
    cover: string,
    createTime: string
}

export type PendingContents = PageResponse<PendingContent>

/**
 * 内容列表
 */
export interface ContentItem {
    id: number,
    authorId: number,
    exp: number,
    authorLevel: number,
    authorName: string,
    title: string,
    introduction: string,
    content: string,
    categoryId: number,
    status: number,
    type: number,
    postType: number,
    isVip: number,
    createTime: string,
    updateTime: string,
    viewCount: number,
    likeCount: number,
    commentCount: number,
    collectCount: number
}

export interface Contents {
    content: ContentItem[],
    currentPage: number,
    pageSize: number,
    totalElements: number,
    totalPages: number,
    hasNext: boolean,
    nextCursor: number
}

/**
 * 动态item
 */
export interface DynamicItem {
    id: number,
    userId: number,
    userName: string,
    userAvatar: string,
    topicId: number,
    createTime: string,
    brief: string,
    image: string,
    browseCount: number,
    likeCount: number
}

export interface Dynamics {
    content: DynamicItem[],
    currentPage: number,
    pageSize: number,
    totalElements: number,
    totalPages: number,
    hasNext: boolean,
    nextCursor: number
}

/**
 * 话题列表
 */
export interface TopicItem {
    id: number,
    topicName: string
}

export type Topics = TopicItem[]


