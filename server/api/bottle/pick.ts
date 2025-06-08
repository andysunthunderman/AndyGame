import { defineEventHandler } from 'h3'

// 模拟一些漂流瓶内容
const bottleMessages = [
  '今天的天气真好，希望每个人都开心！',
  '加油，你是最棒的！',
  '有时候停下来看看天空也是一种享受。',
  '不要害怕失败，它是成功的垫脚石。',
  '记得照顾好自己，你也是别人的风景。',
  '生活就像一盒巧克力，你永远不知道下一颗是什么味道。',
  '保持微笑，保持希望。',
  '愿你遇到的所有困难，都能让你变得更强大。'
]

export default defineEventHandler(async (event) => {
  try {
    // 随机选择一条消息
    const randomIndex = Math.floor(Math.random() * bottleMessages.length)
    const content = bottleMessages[randomIndex]
    
    return {
      success: true,
      content
    }
  } catch (error) {
    return {
      success: false,
      error: '打捞失败，请稍后再试'
    }
  }
}) 