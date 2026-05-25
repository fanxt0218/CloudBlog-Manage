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
    createTime: string,
    pass_status?: number,
    detection_result?: DetectionResult
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

/**
 * 工单列表
 */
export interface WorkOrderListItem {
    id: number,
    orderId: string,
    userId: number,
    userName: string,
    userAccount: string,
    targetId: number,
    targetType: number,
    orderType: number,
    reason: string,
    filePath: string,
    status: number,
    createTime: string,
    updateTime: string,
    handleReason: string
}

/**
 * 工单目标详情
 */
export interface WorkOrderTargetDetail {
    orderId: string,
    targetId: number,
    mainInfo: string,
    detail: string,
    status: string,
    createTime: string
}

export type WorkOrderList = PageResponse<WorkOrderListItem>

/**
 * 内容详情
 */
export interface ContentDetail {
    authorId: number,
    title: string,
    introduction: string,
    image: string,
    createTime: string
}

/**
 * 动态详情
 */
export interface ShareDetail {
    authorId: number,
    userName: string,
    userImage: string,
    createTime: string,
    imageUrl: string,
    videoUrl: string
}

/**
 * 用户统计数据
 */
export interface UserStatistic {
    totalUser: number,
    onlineUser: number
}

/**
 * 平台热门文章
 */
export interface PlatformHotArticleItem {
    articleId: number,
    title: string,
    introduction: string,
    image: string,
    authorId: number,
    authorName: string,
    browseCount: number,
    likeCount: number,
    collectCount: number,
    commentCount: number,
    totalScore: number
}

/**
 * 用户信息
 */
export interface UserInfo {
    userName: string,
    image: string,
    region: string,
    joinTime: string,
    introduction: string,
    visits: number,
    postCount: number,
    fanCount: number,
    blogAge: number,
    exp: number,
    level: number,
    focusCount: number,
    isVip: number
}

/**
 * 网站组件定义
 */
export interface WebsiteComponentDefine {
    id: number,
    contentType: string,
    contentKey: string,
    contentValue: string,
    contentFormat: string,
    category: string,
    groupName: string,
    title: string,
    description: string,
    sortOrder: number,
    attributes: string,
    attributesMap: any,
    status: number,
    isPublic: number,
    createdBy: string,
    updatedBy: string,
    createTime: string,
    updateTime: string
}

/**
 * 敏感词列表
 */
export interface SensitiveWordItem {
    id: number,
    word: string,
    description: string,
    status: number,
    createTime: string,
    updateTime: string
}

export type SensitiveWordList = SensitiveWordItem[]

/**
 * 文章检测记录
 */
export interface ContentCheckRecord {
    id: number,
    postId: number,
    detection_type: string,
    detection_result: DetectionResult,
    pass_status: number,
    create_time: string
}

export interface DetectionResult {
    checkId: string,
    postId: number,
    postName: string,
    checkTime: string,
    checkItems: CheckItem[]
}

export interface CheckItem {
    itemName: string,
    itemResult: string
}