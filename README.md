# 游戏中心 - 基于 Nuxt 3 和 Element Plus 的游戏集合

由 Andy3re 开发的游戏集合网站。

## 功能特点

- 多种经典游戏（扫雷、贪吃蛇、打字挑战等）
- 响应式设计，适配不同设备
- 暗黑模式支持
- 基于 Nuxt 3 和 Element Plus 构建

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
