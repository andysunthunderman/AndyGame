import { defineEventHandler, readBody } from 'h3'
import { getDB } from '~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await getDB()

  // 将漂流瓶标记为已读
  await db.prepare(
    'UPDATE bottles SET is_read = TRUE WHERE id = ?'
  ).run(body.bottleId)

  return {
    success: true
  }
}) 