import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // 这里可以添加关闭漂流瓶的相关逻辑（如标记为已读等）
    return {
      success: true,
      message: '漂流瓶已关闭'
    }
  } catch (error) {
    return {
      success: false,
      error: '操作失败，请稍后再试'
    }
  }
}) 