import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // 这里可以添加将漂流瓶放回池中的逻辑
    return {
      success: true,
      message: '漂流瓶已扔回海里'
    }
  } catch (error) {
    return {
      success: false,
      error: '操作失败，请稍后再试'
    }
  }
}) 