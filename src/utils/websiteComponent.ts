import { getWebsiteComponents } from "@/api/WebSiteManage";
import type { WebsiteComponentDefine } from "@/types";

export const getWebsiteComponentInfo = async (category: string, contentType: string) => {
    const res = await getWebsiteComponents({ category, contentType })
    return res.data as WebsiteComponentDefine[]
}
