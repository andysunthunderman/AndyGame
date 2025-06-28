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

  const db = event.context.cloudflare.env.DB
  
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: '数据库未绑定'
    })
  }

  // 获取所有用户
  if (method === 'GET') {
    try {
      console.log('正在查询用户列表...')
      const users = await db.prepare(
        'SELECT * FROM sports_users ORDER BY created_at DESC'
      ).all()
      console.log('用户列表查询结果:', users)
      
      return { results: users.results }
    } catch (error) {
      console.error('获取用户失败:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '获取用户失败',
        data: { details: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  // 创建新用户
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      console.log('创建用户请求体:', body)
      const { nickname } = body
      
      if (!nickname) {
        throw createError({
          statusCode: 400,
          statusMessage: '昵称不能为空'
        })
      }

      console.log('正在创建用户...')
      const result = await db.prepare(
        'INSERT INTO sports_users (nickname) VALUES (?) RETURNING *'
      ).bind(nickname).all()
      console.log('创建用户结果:', result)
      
      setResponseStatus(event, 201)
      return { results: result.results }
    } catch (error) {
      console.error('创建用户失败:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '创建用户失败',
        data: { details: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
}) 