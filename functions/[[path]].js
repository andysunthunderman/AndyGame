/**
 * 处理所有路由请求的主入口文件
 * 
 * 此文件会作为 Cloudflare Worker 的入口点，处理所有传入请求
 * 并将它们代理到 Nuxt 应用程序
 */

export async function onRequest(context) {
  // 从请求上下文中获取 env
  const { env, request } = context;
  
  try {
    // 尝试从静态资源提供服务
    return await env.ASSETS.fetch(request);
  } catch (e) {
    // 如果静态资源不存在，则交给 Nuxt 服务器处理
    return await env.MAIN.fetch(request);
  }
} 