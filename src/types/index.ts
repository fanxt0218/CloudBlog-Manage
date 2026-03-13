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
    topicName: string,
    image: string,
    description: string,
    status: number
}

export type Topics = TopicItem[]

/**
 * 标签分类
 */
export interface TagClassItem {
    id: number,
    className: string,
    description: string,
    status: number
}

export type TagClassList = TagClassItem[]

/**
 * 标签
 */
export interface TagItem {
    id: number,
    tagName: string,
    classId: number,
    description: string,
    createTime: string,
    updateTime: string,
    status: number
}

export type TagList = TagItem[]

/**
 * 用户信息
 */
export interface UserInfo {
    userId: number,
    account: string,
    userName: string,
    sex: number,
    image: string,
    phone: string,
    email: string,
    status: number,
    introduction: string,
    region: string,
    birthday: string,
    profession: string,
    vip: number,
    lastLoginTime: string,
    createTime: string,
    updateTime: string
}

export type UserList = PageResponse<UserInfo>


