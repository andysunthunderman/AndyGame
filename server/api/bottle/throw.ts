import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { content } = body

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: '漂流瓶内容不能为空'
      }
    }

    // 这里可以添加数据库存储逻辑
    // 目前仅返回成功响应
    return {
      success: true,
      message: '漂流瓶已成功投放到海里'
    }
  } catch (error) {
    return {
      success: false,
      error: '投掷失败，请稍后再试'
    }
  }
}) 