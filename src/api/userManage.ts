import request from "@/utils/request";

/**
 * 用户列表
 */
export function getUserList(params: {
    name: string,
    account: string,
    email: string,
    phone: string,
    status: number,
    startTime: string,
    endTime: string,
    pageNum: number,
    pageSize: number
}) {
    return request.post('/admin/user/list', params)
}

/**
 * 重置密码
 */
export function resetPassword(params: {
    targetId: number
}) {
    return request.post('/admin/user/resetPassword', {}, { params: { targetId: params.targetId } })
}

/**
 * 禁用/启用
 */
export function disableUser(params: {
    targetId: number,
    status: number
}) {
    return request.post('/admin/user/updateStatus', {}, { params: { targetId: params.targetId, status: params.status } })
}

/**
 * 修改用户信息
 */
export function updateUser(params: {
    userId: number,
    userName: string,
    sex: number,
    image: string,
    introduction: string,
    region: string,
    birthDate: string,
    profession: string
}) {
    return request.post('/admin/user/edit', params)
}

/**
 * 上传头像，创建FormData对象来包装文件，这样会自动设置正确的Content-Type
 */
export const uploadAvatar = (formData: FormData) => {
    return request.post(`/userInfo/detail/uploadAvatar`, formData, {
        // 不设置Content-Type，让浏览器自动设置为multipart/form-data
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 添加用户
 */
export const register = (data: {
    userName: string,
    phone: string,
    password: string,
    twicePassword: string
}) => {
    return request.post('/user/register', data)
}

