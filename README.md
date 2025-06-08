# 游戏中心 - 基于 Nuxt 3 和 Element Plus 的游戏集合

由 Andy3re 开发的游戏集合网站。

## 功能特点

- 多种经典游戏（扫雷、贪吃蛇、打字挑战等）
- 响应式设计，适配不同设备
- 暗黑模式支持
- 基于 Nuxt 3 和 Element Plus 构建
- 集成 Cloudflare D1 数据库用于数据持久化

## 数据库存储方案

### Cloudflare D1 数据库

本项目使用 [Cloudflare D1](https://developers.cloudflare.com/d1/) 作为主要的数据库存储解决方案。D1 是 Cloudflare 提供的 SQLite 数据库服务，具有以下特点：

- **全球分布**: 基于 SQLite 的分布式数据库，在全球边缘节点提供低延迟访问
- **无服务器**: 无需管理数据库服务器，自动扩展
- **SQL 兼容**: 支持标准 SQL 语法，便于开发和维护
- **成本效益**: 按使用量计费，适合中小型应用

### 数据库配置

#### wrangler.toml 配置
```toml
[[d1_databases]]
binding = "DB"
database_name = "andygamedb"
database_id = "2e86cca1-0db0-4f8d-9786-1ce0234c5b52"
```

#### 数据库结构

当前项目包含以下数据表：

1. **analytics** - 用于存储网站分析数据
   - `key` (TEXT): 分析指标的键名
   - `value` (INTEGER): 分析指标的数值

### 数据库操作示例

项目中通过服务端 API 与 D1 数据库交互：

```typescript
// server/api/pageview.ts
import type { D1Database } from '@cloudflare/workers-types'

export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare.env.DB as D1Database
  
  // 更新页面访问量
  const stmt = db.prepare('UPDATE analytics SET value = value + 1 WHERE key = ?1 RETURNING value')
  const result = await stmt.bind('pageviews').first<number>('value')
  
  return { pageview: result ?? 0 }
})
```

### 数据库管理

#### 本地开发
- 开发环境使用 Wrangler 提供的本地 D1 实例
- 数据存储在 `.wrangler/state/v3/d1/` 目录下

#### 生产环境
- 数据库托管在 Cloudflare 的全球网络中
- 通过 Cloudflare Dashboard 或 Wrangler CLI 进行管理

#### 常用命令
```bash
# 查看数据库信息
wrangler d1 info andygamedb

# 执行 SQL 查询
wrangler d1 execute andygamedb --command="SELECT * FROM analytics"

# 创建数据库备份
wrangler d1 backup create andygamedb
```

## 开发设置

确保安装依赖

```bash
pnpm install
```

## 开发

在 `http://localhost:3000` 启动开发服务器

```bash
pnpm dev
```

## 生产构建

为生产环境构建应用：

```bash
pnpm build
```

## Cloudflare 部署

本项目配置为使用 Cloudflare Workers 和 Pages 部署。

### 手动部署

1. 构建项目
```bash
pnpm build
```

2. 部署到 Cloudflare
```bash
pnpm deploy
```

### 通过 GitHub Actions 自动部署

项目已配置 GitHub Actions 工作流程，当推送到 main 分支时会自动部署。

需要在 GitHub 仓库设置中添加 `CF_API_TOKEN` 密钥。

## 参考

- [Element Plus Nuxt Starter](https://github.com/element-plus/element-plus-nuxt-starter)
- [Nuxt 3 文档](https://nuxt.com/)
- [Element Plus 文档](https://element-plus.org/)
