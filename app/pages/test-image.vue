<template>
  <div class="test-container">
    <h1>图片测试页面</h1>
    
    <div class="image-tests">
      <h2>测试1：直接img标签</h2>
      <img src="/images/minesweeper.png" alt="扫雷" style="width: 200px; height: 200px; border: 1px solid red;">
      
      <h2>测试2：CSS背景图片</h2>
      <div style="width: 200px; height: 200px; background-image: url('/images/minesweeper.png'); background-size: cover; border: 1px solid blue;"></div>
      
      <h2>测试3：动态路径</h2>
      <img :src="dynamicImagePath" :alt="'动态加载'" style="width: 200px; height: 200px; border: 1px solid green;">
      
      <h2>图片文件检查</h2>
      <p>当前图片路径: {{ dynamicImagePath }}</p>
      <p>图片存在检查: <span id="image-check">检查中...</span></p>
    </div>
  </div>
</template>

<script setup lang="ts">
const dynamicImagePath = ref('/images/minesweeper.png')

onMounted(() => {
  // 检查图片是否能够加载
  const img = new Image()
  img.onload = () => {
    document.getElementById('image-check')!.textContent = '图片加载成功'
    document.getElementById('image-check')!.style.color = 'green'
  }
  img.onerror = () => {
    document.getElementById('image-check')!.textContent = '图片加载失败'
    document.getElementById('image-check')!.style.color = 'red'
  }
  img.src = dynamicImagePath.value
})
</script>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.image-tests {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h1, h2 {
  color: #333;
}
</style> 