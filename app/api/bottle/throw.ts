import { defineEventHandler, readBody } from 'h3'
import { getDB } from '~/server/database'
import { getUserId } from '~/server/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userId = await getUserId(event)
  const db = await getDB()

  try {
    // 插入漂流瓶
    await db.prepare(
      'INSERT INTO bottles (content, user_id) VALUES (?, ?)'
    ).run(body.content, userId)

    return {
      success: true
    }
  } catch (error) {
    console.error('投掷漂流瓶失败:', error)
    return {
      success: false,
      message: '投掷失败，请稍后再试'
    }
  }
}) 