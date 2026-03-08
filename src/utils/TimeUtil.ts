/**
 * 时间工具类
 */
export const TimeUtil = {
    /**
     * 格式化时间
     */
    formatTime(row: any, column: any): string {
        const date = new Date(row[column.property])
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }
}