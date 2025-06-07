export async function onRequest(context) {
    const { env, request } = context;
    const { DB } = env;
  
  // 检查数据库连接
  if (!DB) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Database connection not available',
      details: 'D1 database is not properly bound to the application'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {
    switch (action) {
      // 用户注册
      case 'register':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }
        const registerData = await request.json();
        const { username, password, nickname, email } = registerData;

        // 检查用户名是否已存在
        const existingUser = await DB.prepare(
          'SELECT id FROM users WHERE username = ?'
        )
        .bind(username)
        .all();

        if (existingUser.results.length > 0) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户名已存在'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 检查邮箱是否已存在
        if (email) {
          const existingEmail = await DB.prepare(
            'SELECT id FROM users WHERE email = ?'
          )
          .bind(email)
          .all();

          if (existingEmail.results.length > 0) {
            return new Response(JSON.stringify({
              success: false,
              error: '邮箱已被使用'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        // 创建新用户
        const insertUser = await DB.prepare(
          `INSERT INTO users (username, password, nickname, email) 
           VALUES (?, ?, ?, ?)`
        )
        .bind(username, password, nickname || null, email || null)
        .run();

        return new Response(JSON.stringify({
          success: true,
          userId: insertUser.lastRowId
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      // 用户登录
      case 'login':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }
        const loginData = await request.json();
        const { username: loginUsername, password: loginPassword } = loginData;

        const user = await DB.prepare(
          'SELECT id, username, nickname, status FROM users WHERE username = ? AND password = ?'
        )
        .bind(loginUsername, loginPassword)
        .all();

        if (user.results.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户名或密码错误'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (user.results[0].status === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: '账号已被禁用'
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 更新最后登录时间
        await DB.prepare(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
        )
        .bind(user.results[0].id)
        .run();

        return new Response(JSON.stringify({
          success: true,
          user: {
            id: user.results[0].id,
            username: user.results[0].username,
            nickname: user.results[0].nickname
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      // 获取用户信息
      case 'get_user_info':
        const userId = url.searchParams.get('userId');
        if (!userId) {
          return new Response(JSON.stringify({
            success: false,
            error: '缺少用户ID'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const userInfo = await DB.prepare(
          'SELECT id, username, nickname, email, created_at, last_login FROM users WHERE id = ?'
        )
        .bind(userId)
        .all();

        if (userInfo.results.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: '用户不存在'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          user: userInfo.results[0]
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      // 更新用户信息
      case 'update_user':
        if (request.method !== 'PUT') {
          return new Response('Method not allowed', { status: 405 });
        }
        const updateData = await request.json();
        const { userId: updateUserId, nickname: newNickname, email: newEmail } = updateData;

        if (newEmail) {
          const emailCheck = await DB.prepare(
            'SELECT id FROM users WHERE email = ? AND id != ?'
          )
          .bind(newEmail, updateUserId)
          .all();

          if (emailCheck.results.length > 0) {
            return new Response(JSON.stringify({
              success: false,
              error: '邮箱已被使用'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        await DB.prepare(
          'UPDATE users SET nickname = ?, email = ? WHERE id = ?'
        )
        .bind(newNickname, newEmail, updateUserId)
        .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });

      // 修改密码
      case 'change_password':
        if (request.method !== 'PUT') {
          return new Response('Method not allowed', { status: 405 });
        }
        const passwordData = await request.json();
        const { userId: pwdUserId, oldPassword, newPassword } = passwordData;

        const pwdCheck = await DB.prepare(
          'SELECT id FROM users WHERE id = ? AND password = ?'
        )
        .bind(pwdUserId, oldPassword)
        .all();

        if (pwdCheck.results.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: '原密码错误'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        await DB.prepare(
          'UPDATE users SET password = ? WHERE id = ?'
        )
        .bind(newPassword, pwdUserId)
        .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });

      // 原有的游戏分数和位置信息相关接口
      case 'get_scores':
        const scores = await DB.prepare(
          'SELECT * FROM game_scores ORDER BY created_at DESC'
        ).all();

        return new Response(JSON.stringify({ 
          success: true, 
          scores: scores.results 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'save_score':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }
        const scoreData = await request.json();
        const { gameName, playerName, score, playCount, userId: scoreUserId } = scoreData;

        const currentDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().split(' ')[0];

        const insertScore = await DB.prepare(
          `INSERT INTO game_scores (game_name, player_name, score, play_count, play_date, play_time, user_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(gameName, playerName, score, playCount, currentDate, currentTime, scoreUserId)
        .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'get_locations':
        const locations = await DB.prepare(
          'SELECT * FROM player_locations ORDER BY created_at DESC'
        ).all();

        return new Response(JSON.stringify({ 
          success: true, 
          locations: locations.results 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'save_location':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }
        const locationData = await request.json();
        const { city, country, latitude, longitude, userId: locationUserId } = locationData;

        const insertLocation = await DB.prepare(
          `INSERT INTO player_locations (city, country, latitude, longitude, user_id) 
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(city, country, latitude, longitude, locationUserId)
        .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action',
          availableActions: [
            'register',
            'login',
            'get_user_info',
            'update_user',
            'change_password',
            'get_scores',
            'save_score',
            'get_locations',
            'save_location'
          ]
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Database operation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      context: {
        action: action,
        hasDB: !!DB,
        dbType: DB ? typeof DB : 'undefined'
      }
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  }