import request from '@/utils/request'

/**
 * 登录
 */
export const login = (
    data: {
        loginType: string,
        target: string,
        password: string,
        twicePassword: string,
        admin: boolean
    }
) => {
    return request.post(`/user/login`, data);
}

/**
 * 验证码登录
 */
export const loginByCode = (
    data: {
        target: string,
        checkCode: string,
        type: string
    }
) => {
    return request.post(`/user/checkCodeLogin`, {}, { params: data });
}