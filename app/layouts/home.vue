<template>
  <main class="px-10 py-20 text-center">
    <RightTopMenu class="absolute top-4 right-4" />

    <slot />
    
    <!-- 页脚 -->
    <footer class="page-footer">
      <p>© 2025 游戏集合 - 尽情享受游戏的乐趣！</p>
      <NuxtLink to="/admin" class="admin-link">管理后台</NuxtLink>
    </footer>
  </main>
</template>

<style scoped>
/* 页脚样式 */
.page-footer {
  margin-top: 3rem;
  text-align: center;
  color: #666;
  padding: 2rem;
}

.admin-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.admin-link:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}
</style>
