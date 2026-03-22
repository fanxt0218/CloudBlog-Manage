import request from "@/utils/request";

/**
 * 获取网站配置
 */
export const getWebsiteConfig = (data: {
    category: string,
    contentType: string
}) => {
    return request.post('/admin/website/getComponentDefine', data)
}

/**
 * 上传图片 formData中传入字段(file、category、contentType)
 */
export const uploadImage = (formData: FormData) => {
    return request.post(`/admin/website/uploadResource`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 修改首页组件定义
 */
export const updateIndexWebsiteConfig = (data: {
    webSiteComponentPo: {
        category: string,
        contentType: string
    },
    // 数组中每个对象定义
    // {
    //   id:number,
    //   sortOrder?:number,
    //   contentValue?:string
    //   attributes?:string  // 推荐工具时需要（json格式，title、desc、tag、hotNum、url）
    // }
    siteContentList: []
}) => {
    return request.post('/admin/website/editIndexDefine', data)
}

/**
 * 新增配置项
 */
export const addWebsiteConfig = (data: {
    contentType: string,
    contentValue: string,
    category: string,
    attributesMap: string,         // 推荐工具时需要（json格式，title、desc、tag、hotNum、url）
    sortOrder: string
}) => {
    return request.post('/admin/website/addComponent', data)
}

/**
 * 删除配置项
 */
export const deleteWebsiteConfig = (data: {
    id: number
}) => {
    return request.post('/admin/website/deleteComponent', {}, { params: data })
}

/**
 * 获取网站组件信息
 */
export const getWebsiteComponents = (data: {
    category: string,
    contentType: string
}) => {
    return request.post(`/admin/website/getComponentDefineForUser`, data)
}