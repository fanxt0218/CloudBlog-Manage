import request from "@/utils/request";

/**
 * 获取RAG内容
 */
export const getRagContent = () => {
    return request.get(`/admin/agent/getRagText`)
}

/**
 * 编辑RAG内容
 */
export const editRagContent = (formData: FormData) => {
    return request.post(`/admin/agent/editRag`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}