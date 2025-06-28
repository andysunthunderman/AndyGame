const defaultMessages = [
  '海洋很大，漂流瓶都去远方了呢...',
  '今天的海浪有点大，什么都没找到...',
  '继续寻找吧，一定会有惊喜的！',
  '这片海域暂时没有漂流瓶呢...',
  '或许过一会儿再来看看？',
  '风平浪静的日子，漂流瓶都躲起来了...',
  '海鸥告诉我，漂流瓶在更远的地方等着你...',
  '潮汐带走了所有的漂流瓶，明天再来试试吧！'
]

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

  if (method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const db = event.context.cloudflare.env.DB
  
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: '数据库未绑定'
    })
  }

  try {
    console.log('正在搜索漂流瓶...')
    
    // 随机获取一个未读的漂流瓶，按创建时间排序增加随机性
    const bottles = await db.prepare(
      'SELECT id, content, created_at FROM bottles WHERE is_read = FALSE ORDER BY created_at DESC LIMIT 10'
    ).all()

    console.log('找到的漂流瓶数量:', bottles.results?.length || 0)

    if (!bottles.results || bottles.results.length === 0) {
      // 如果没有漂流瓶，返回随机默认消息
      const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
      return {
        success: true,
        content: randomMessage,
        isDefault: true
      }
    }

    // 从找到的漂流瓶中随机选择一个
    const randomIndex = Math.floor(Math.random() * bottles.results.length)
    const selectedBottle = bottles.results[randomIndex]

    // 将选中的漂流瓶标记为已读
    await db.prepare(
      'UPDATE bottles SET is_read = TRUE WHERE id = ?'
    ).bind(selectedBottle.id).run()

    console.log('成功打捞到漂流瓶:', selectedBottle.id)

    return {
      success: true,
      content: selectedBottle.content,
      bottleId: selectedBottle.id,
      isDefault: false,
      foundAt: selectedBottle.created_at
    }
  } catch (error) {
    console.error('打捞漂流瓶失败:', error)
    
    // 出错时也返回默认消息，确保用户体验
    const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
    return {
      success: true,
      content: randomMessage,
      isDefault: true,
      error: '打捞过程中出现了小问题，但海洋依然美丽...'
    }
  }
}) 