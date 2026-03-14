import request from "@/utils/request";

/**
 * 工单列表
 */
export function getWorkOrderList(params: {
    orderId: string,
    userName: string,
    targetType: string,
    orderType: string,
    status: string,
    startTime: string,
    endTime: string,
    pageNum: string,
    pageSize: string
}) {
    return request.post('/admin/workOrder/getWorkOrderList', params)
}

/**
 * 处理工单
 */
export function handleWorkOrder(data: {
    id: number,
    status: number,
    handleReason: string
}) {
    return request.post('/admin/workOrder/handleWorkOrder', data)
}
