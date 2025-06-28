export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  // 处理 CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
  setHeader(event, 'Access-Control-Max-Age', 86400)

  // 处理 OPTIONS 预检请求
  if (method === 'OPTIONS') {
    return ''
  }

  // 获取所有运动类型
  if (method === 'GET') {
    try {
      console.log('开始获取运动类型...')
      const db = event.context.cloudflare.env.DB
      
      if (!db) {
        console.error('数据库未绑定')
        throw createError({
          statusCode: 500,
          statusMessage: '数据库未绑定'
        })
      }
      
      const types = await db.prepare(
        'SELECT * FROM sport_types ORDER BY created_at DESC'
      ).all()
      
      console.log('运动类型查询结果:', types)
      
      return { results: types.results }
    } catch (error) {
      console.error('获取运动类型失败:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '获取运动类型失败',
        data: { details: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
}) 