<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div class="plane-game">
    <NuxtLink to="/" class="back-button">
      返回主页
    </NuxtLink>

    <div class="game-container">
      <h1 class="game-title">飞机大战</h1>
      <div class="coming-soon">
        <p>✈️ 游戏正在开发中...</p>
        <p>敬请期待！</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plane-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.back-button {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  z-index: 100;
}

.game-container {
  background: rgba(255, 255, 255, 0.9);
  padding: 3rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.game-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

.coming-soon {
  font-size: 1.5rem;
  color: #666;
}

.coming-soon p {
  margin: 1rem 0;
}
</style> 