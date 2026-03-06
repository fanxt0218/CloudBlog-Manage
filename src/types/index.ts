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