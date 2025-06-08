import { defineEventHandler } from 'h3'
import { getDB } from '~/server/database'

const defaultMessages = [
  '海洋很大，漂流瓶都去远方了呢...',
  '今天的海浪有点大，什么都没找到...',
  '继续寻找吧，一定会有惊喜的！',
  '这片海域暂时没有漂流瓶呢...',
  '或许过一会儿再来看看？'
]

export default defineEventHandler(async (event) => {
  const db = await getDB()
  
  // 随机获取一个未读的漂流瓶
  const bottle = await db.prepare(
    'SELECT id, content FROM bottles WHERE is_read = FALSE ORDER BY RANDOM() LIMIT 1'
  ).first()

  if (!bottle) {
    // 如果没有漂流瓶，返回随机默认消息
    return {
      success: true,
      content: defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
    }
  }

  return {
    success: true,
    content: bottle.content,
    bottleId: bottle.id
  }
}) 