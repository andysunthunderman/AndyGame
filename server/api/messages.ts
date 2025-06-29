export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  // 处理 CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
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

  // 获取所有留言
  if (method === 'GET') {
    try {
      console.log('正在获取留言列表...')
      const result = await db.prepare(
        'SELECT * FROM messages ORDER BY created_at DESC'
      ).all()
      console.log('留言列表查询结果:', result)
      
      return { 
        success: true,
        messages: result.results || []
      }
    } catch (error) {
      console.error('获取留言失败:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '获取留言失败',
        data: { details: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  // 创建新留言
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      console.log('创建留言请求体:', body)
      const { nickname, content } = body
      
      if (!nickname || !content) {
        throw createError({
          statusCode: 400,
          statusMessage: '昵称和留言内容不能为空'
        })
      }

      // 检查内容长度
      if (nickname.trim().length > 50) {
        throw createError({
          statusCode: 400,
          statusMessage: '昵称长度不能超过50个字符'
        })
      }

      if (content.trim().length > 500) {
        throw createError({
          statusCode: 400,
          statusMessage: '留言内容长度不能超过500个字符'
        })
      }

      console.log('正在创建留言...')
      const result = await db.prepare(
        'INSERT INTO messages (nickname, content) VALUES (?, ?) RETURNING *'
      ).bind(nickname.trim(), content.trim()).all()
      console.log('创建留言结果:', result)
      
      setResponseStatus(event, 201)
      return { 
        success: true,
        message: result.results?.[0] || null
      }
    } catch (error) {
      console.error('创建留言失败:', error)
      
      // 如果已经是 createError 创建的错误，直接抛出
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: '创建留言失败',
        data: { details: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  // 删除留言
  if (method === 'DELETE') {
    try {
      const body = await readBody(event)
      console.log('删除留言请求体:', body)
      const { id } = body
      
      if (!id) {
        throw createError({
          statusCode: 400,
          statusMessage: '留言ID不能为空'
        })
      }

      console.log('正在删除留言...')
      const result = await db.prepare(
        'DELETE FROM messages WHERE id = ? RETURNING *'
      ).bind(id).all()
      console.log('删除留言结果:', result)
      
      if (!result.results || result.results.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: '留言不存在'
        })
      }

      return { 
        success: true,
        message: '留言删除成功'
      }
    } catch (error) {
      console.error('删除留言失败:', error)
      
      // 如果已经是 createError 创建的错误，直接抛出
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: '删除留言失败',
        data: { details: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
}) 