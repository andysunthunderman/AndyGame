// 定义D1数据库类型
interface D1Result<T> {
  results: T[];
  success: boolean;
}

interface D1Database {
  prepare: (query: string) => {
    run: () => Promise<unknown>;
    all: <T = unknown>() => Promise<D1Result<T>>;
    bind: (...values: unknown[]) => {
      run: () => Promise<unknown>;
    };
  };
}

// 定义消息类型接口
interface MessageRecord {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
}

// 定义环境变量类型
interface Env {
  DB: D1Database;
}

interface RequestContext {
  request: Request;
  env: Env;
}

export const onRequest = async ({ request, env }: RequestContext) => {
  // 设置响应头
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // 检查数据库连接
    if (!env.DB) {
      console.error('数据库未配置');
      return new Response(
        JSON.stringify({ error: '数据库配置错误' }),
        { status: 500, headers }
      );
    }

    const db = env.DB;

    // 创建留言表（如果不存在）
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nickname TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (dbError) {
      console.error('创建表失败:', dbError);
      return new Response(
        JSON.stringify({ error: '数据库初始化失败' }),
        { status: 500, headers }
      );
    }

    // 处理 GET 请求
    if (request.method === 'GET') {
      try {
        const result = await db.prepare(`
          SELECT id, nickname, content, datetime(created_at, 'localtime') as created_at
          FROM messages
          ORDER BY created_at DESC
        `).all<MessageRecord>();

        return new Response(
          JSON.stringify({ messages: result.results }),
          { status: 200, headers }
        );
      } catch (getError) {
        console.error('获取留言失败:', getError);
        return new Response(
          JSON.stringify({ error: '获取留言失败' }),
          { status: 500, headers }
        );
      }
    }

    // 处理 POST 请求
    if (request.method === 'POST') {
      try {
        const body = await request.json() as { nickname?: string; content?: string };
        const { nickname, content } = body;

        // 验证请求数据
        if (!nickname?.trim() || !content?.trim()) {
          return new Response(
            JSON.stringify({ error: '昵称和留言内容不能为空' }),
            { status: 400, headers }
          );
        }

        // 限制内容长度
        if (nickname.length > 50 || content.length > 500) {
          return new Response(
            JSON.stringify({ error: '昵称或留言内容超出长度限制' }),
            { status: 400, headers }
          );
        }

        // 插入新留言
        await db.prepare(`
          INSERT INTO messages (nickname, content)
          VALUES (?, ?)
        `).bind(nickname.trim(), content.trim()).run();

        return new Response(
          JSON.stringify({ message: '留言发表成功' }),
          { status: 200, headers }
        );
      } catch (postError) {
        console.error('发表留言失败:', postError);
        return new Response(
          JSON.stringify({ error: '发表留言失败' }),
          { status: 500, headers }
        );
      }
    }

    // 处理其他请求方法
    return new Response(
      JSON.stringify({ error: '不支持的请求方法' }),
      { status: 405, headers }
    );
  } catch (error) {
    console.error('服务器错误:', error);
    return new Response(
      JSON.stringify({ error: '服务器错误' }),
      { status: 500, headers }
    );
  }
}

// 单独处理 GET 请求
export const onRequestGet = async ({ env }: { env: Env }) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // 创建留言表（如果不存在）
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 获取所有留言
    const result = await env.DB.prepare(`
      SELECT id, nickname, content, datetime(created_at, 'localtime') as created_at
      FROM messages
      ORDER BY created_at DESC
    `).all<MessageRecord>();

    return new Response(
      JSON.stringify({ messages: result.results }), 
      { status: 200, headers }
    );
  } catch (error) {
    console.error('获取留言失败:', error);
    return new Response(
      JSON.stringify({ error: '获取留言失败' }),
      { status: 500, headers }
    );
  }
};

// 单独处理 POST 请求
export const onRequestPost = async ({ request, env }: RequestContext) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json() as { nickname?: string; content?: string };
    const { nickname, content } = body;

    // 验证请求数据
    if (!nickname?.trim() || !content?.trim()) {
      return new Response(
        JSON.stringify({ error: '昵称和留言内容不能为空' }),
        { status: 400, headers }
      );
    }

    // 限制内容长度
    if (nickname.length > 50 || content.length > 500) {
      return new Response(
        JSON.stringify({ error: '昵称或留言内容超出长度限制' }),
        { status: 400, headers }
      );
    }

    // 创建留言表（如果不存在）
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 插入新留言
    await env.DB.prepare(`
      INSERT INTO messages (nickname, content)
      VALUES (?, ?)
    `).bind(nickname.trim(), content.trim()).run();

    return new Response(
      JSON.stringify({ message: '留言发表成功' }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('发表留言失败:', error);
    return new Response(
      JSON.stringify({ error: '发表留言失败' }),
      { status: 500, headers }
    );
  }
}; 