import type { D1Database } from '@cloudflare/workers-types'

interface Analytics {
  key: string
  value: number
}

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.cloudflare.env.DB as D1Database
    
    // Increment the pageview count
    const stmt = db.prepare('UPDATE analytics SET value = value + 1 WHERE key = ?1 RETURNING value')
    const result = await stmt.bind('pageviews').first<number>('value')

    const count = result ?? 0

    return {
      pageview: count,
    }
  }
  catch (e: any) {
    console.error({ message: e.message })
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to query D1',
    })
  }
})
