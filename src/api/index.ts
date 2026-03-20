import request from "@/utils/request";

// 获取用户信息
export const getUserInfo = (userId: number) => {
    return request.get(`/userInfo/homePage/getUserInfo`, { params: { userId } });
}