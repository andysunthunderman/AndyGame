# 游戏集合项目

这是一个Andy3re使用HTML5、CSS3和JavaScript开发的网页游戏集合项目。项目采用现代化的Web技术栈，提供多个经典小游戏的在线体验。

<style>
.back-to-home {
    display: inline-block;
    padding: 10px 20px;
    background: #4a90e2;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin: 20px 0;
    transition: background 0.3s ease;
}
.back-to-home:hover {
    background: #357abd;
}
</style>

<a href="index.html" class="back-to-home">返回主页</a>

## 项目特点

- 🎮 多个经典游戏集合
- 🎨 现代化UI设计
- 📱 响应式布局
- 🚀 无需安装，即开即玩
- 💾 MySQL数据库存储
- 📊 游戏数据统计
- 🌍 位置信息记录

## 技术栈

- HTML5 Canvas
- Tailwind CSS
- 原生JavaScript
- 响应式设计
- PHP 后端接口
- MySQL 数据库
- Google Maps API

## 项目结构

```
Andy/
├── index.html          # 游戏集合主页
├── andy.mine.html      # 扫雷游戏
├── tank.html           # 坦克对战游戏
├── plane.html          # 飞机大战游戏
├── snake.html          # 贪吃蛇游戏
├── fishing.html        # 深海捕鱼游戏
├── admin.html          # 后台管理页面
├── db_operations.php   # 数据库操作接口
├── config.php          # 配置文件
└── README.md           # 项目说明文档
```

## 实现细节

### 主页 (index.html)

主页采用卡片式布局，使用Tailwind CSS实现现代化的UI设计：

- 渐变背景效果
- 响应式卡片网格
- 悬停动画效果
- 统一的设计语言

关键实现：
```css
.game-card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}
```

### 游戏实现示例（以捕鱼游戏为例）

捕鱼游戏展示了基于Canvas的游戏开发方式：

1. **画布设置**
   - 自适应屏幕尺寸
   - 高性能渲染

2. **游戏对象**
   - 使用类封装游戏对象
   - 独立的更新和渲染逻辑

3. **交互控制**
   - 鼠标事件监听
   - 碰撞检测

4. **游戏循环**
   - requestAnimationFrame实现流畅动画
   - 状态更新与渲染分离

示例代码：
```javascript
class Fish {
    constructor() {
        this.reset();
        this.size = Math.random() * 30 + 20;
        this.speed = Math.random() * 3 + 1;
    }

    update() {
        this.x -= this.speed;
        if (this.x < -50) this.reset();
    }

    draw() {
        // 绘制鱼的图形
    }
}
```

## 游戏列表

1. **扫雷游戏**
   - 经典的逻辑推理游戏
   - 难度可调整
   - 音效反馈系统

2. **坦克对战**
   - 多人对战模式
   - 实时控制系统
   - 音效反馈系统

3. **飞机大战**
   - 经典射击游戏
   - 关卡进阶系统
   - 粒子特效系统
   - 高分记录系统

4. **贪吃蛇**
   - 经典成长类游戏
   - 简单易上手

5. **深海捕鱼**
   - 休闲娱乐游戏
   - 计分系统
   - 时间限制模式

6. **双人足球**
   - 双人对战模式
   - 实时物理引擎
   - 计分系统
   - 流畅的操控体验
   - 分上下半场
   - 人性化的休息时间
   - 自定义玩家名称
   - 人形角色设计

## 开发指南

要添加新的游戏，需要：

1. 在主页添加新的游戏卡片
2. 创建对应的游戏HTML文件
3. 实现游戏逻辑
4. 保持与现有设计风格一致

示例：
```html
<div class="game-card">
    <div class="game-image [游戏类名]"></div>
    <div class="p-6">
        <h2 class="text-2xl font-bold mb-2">[游戏名称]</h2>
        <p class="text-gray-600 mb-4">[游戏描述]</p>
        <a href="[游戏文件].html" class="block w-full bg-[颜色]-500 hover:bg-[颜色]-600 text-white font-bold py-2 px-4 rounded text-center transition duration-300">
            开始游戏
        </a>
    </div>
</div>
```

## 运行说明

1. 确保有现代浏览器（支持HTML5）
2. 直接打开index.html即可开始游戏
3. 无需安装任何依赖或运行环境

## 数据管理功能

### 游戏数据记录

项目集成了 MySQL 数据库，提供以下功能：

1. **游戏记录**
   - 记录玩家游戏成绩
   - 统计游戏次数
   - 记录游戏时间
   - 保存最高分记录

2. **位置信息**
   - 记录玩家地理位置
   - 显示玩家分布地图
   - 支持地理位置统计

3. **数据统计**
   - 游戏热度分析
   - 玩家活跃度统计
   - 成绩排行榜

### API 接口

#### 1. 保存游戏分数
```http
POST /db_operations.php?action=save_score

参数：
{
    "game_name": "游戏名称",
    "player_name": "玩家名称",
    "score": 分数,
    "play_count": 游戏次数
}

返回：
{
    "success": true,
    "message": "分数保存成功"
}
```

#### 2. 获取游戏记录
```http
GET /db_operations.php?action=get_scores

返回：
{
    "success": true,
    "scores": [
        {
            "game_name": "游戏名称",
            "player_name": "玩家名称",
            "score": 分数,
            "play_count": 游戏次数,
            "game_time": "游戏时间"
        }
    ]
}
```

#### 3. 保存位置信息
```http
POST /db_operations.php?action=save_location

参数：
{
    "city": "城市",
    "country": "国家",
    "latitude": 纬度,
    "longitude": 经度
}

返回：
{
    "success": true,
    "message": "位置信息保存成功"
}
```

#### 4. 获取位置信息
```http
GET /db_operations.php?action=get_locations

返回：
{
    "success": true,
    "locations": [
        {
            "city": "城市",
            "country": "国家",
            "latitude": 纬度,
            "longitude": 经度,
            "record_time": "记录时间"
        }
    ]
}
```

### 后台管理功能

项目提供了完整的后台管理界面（admin.html），主要功能包括：

1. **游戏记录管理**
   - 查看所有游戏记录
   - 按游戏类型筛选
   - 按时间范围筛选
   - 支持排序功能

2. **位置信息管理**
   - Google Maps 地图展示
   - 查看玩家地理分布
   - 位置信息统计
   - 地区活跃度分析

3. **数据可视化**
   - 游戏热度趋势图
   - 玩家分布热力图
   - 成绩分布统计图

### 使用示例

```javascript
// 保存游戏分数
fetch('db_operations.php?action=save_score', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        game_name: '贪吃蛇',
        player_name: '玩家1',
        score: 100,
        play_count: 1
    })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('分数保存成功');
    }
});

// 获取游戏记录
fetch('db_operations.php?action=get_scores')
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('游戏记录:', data.scores);
    }
});
```

## 未来计划

- [ ] 添加更多游戏类型
- [ ] 实现游戏存档功能
- [ ] 添加音效系统
- [ ] 优化移动端体验
- [ ] 添加多人联机功能
- [x] 集成数据库存储功能
- [x] 实现后台管理系统
- [ ] 添加更多数据分析功能

## 贡献指南

欢迎贡献新的游戏或改进现有游戏！请确保：

1. 遵循现有的代码风格
2. 保持设计风格一致性
3. 测试游戏在不同设备上的表现
4. 提供必要的文档说明

## 通用功能

- 🏠 **返回主页**：所有游戏界面右上角都设有"返回主页"按钮，点击可随时返回游戏集合主页
- 🎮 **统一界面**：所有游戏保持一致的界面风格和操作逻辑
- 🔄 **重新开始**：每个游戏都提供重新开始功能
- ⏸️ **暂停功能**：部分游戏支持暂停操作

## 游戏玩法指南

### 1. 扫雷游戏 (andy.mine.html)
- 🎯 **游戏目标**：找出所有非地雷的格子，避免触碰地雷
- 📝 **操作方式**：
  - 左键点击：揭开格子
  - 点击标记地雷按钮：标记地雷
  - 右上角返回按钮：返回主页
- 🎮 **游戏规则**：
  - 数字表示周围8个格子中地雷的数量
  - 标记所有地雷位置并揭开所有安全格子即为胜利
  - 触碰地雷则游戏结束

### 2. 坦克对战 (tank.html)
- 🎯 **游戏目标**：在战场上消灭其他玩家的坦克
- 📝 **操作方式**：
  - 【见游戏中】
  - 暂停按钮：暂停游戏
  - 重新开始按钮：重置游戏
  - 右上角返回按钮：返回主页
- 🎮 **游戏规则**：
  - 多人对战模式
  - 被炮弹击中则损失一条生命
  - 最后存活的玩家获胜

### 3. 飞机大战 (plane.html)
- 🎯 **游戏目标**：击落敌机，获取高分
- 📝 **操作方式**：
  - w/a/s/d/：控制飞机位置
  - 空格键：发射子弹
  - 右上角返回按钮：返回主页
  - E键：暂停/继续游戏
- 🎮 **游戏规则**：
  - 被敌机或子弹击中则损失生命

### 4. 贪吃蛇 (snake.html)
- 🎯 **游戏目标**：控制蛇吃食物成长，避免碰撞
- 📝 **操作方式**：
  - 方向键：控制蛇的移动方向
- 🎮 **游戏规则**：
  - 吃到食物后蛇身变长
  - 碰到墙壁或自身则游戏结束
  - 蛇身越长得分越高

### 5. 深海捕鱼 (fishing.html)
- 🎯 **游戏目标**：在限时内捕获尽可能多的鱼
- 📝 **操作方式**：
  - 鼠标左右移动：控制捕鱼器位置
  - 按住鼠标左键：伸出钓鱼线
  - 松开鼠标左键：收回钓鱼线
- 🎮 **游戏规则**：
  - 游戏时限60秒
  - 越大的鱼得分越高
  - 钓鱼钩需要接触到鱼才能捕获
  - 时间结束显示最终得分
  - 捕鱼器在屏幕底部移动
  - 钓鱼线可伸缩控制

### 6. 双人足球
- 🎯 **游戏目标**：控制球员进球得分，在规定时间内获得更多进球的一方获胜
- 📝 **操作方式**：
  - 玩家1（蓝色）：
    - W/A/S/D 键控制移动
    - 空格键踢球
  - 玩家2（红色）：
    - ↑/↓/←/→ 方向键控制移动
    - Shift键踢球
  - 游戏时长：
    - 上半场1分钟
    - 中场休息10秒
    - 下半场1分钟
  - 特色功能：
    - 可自定义玩家名称
    - 实时比分显示
    - 动态腿部动画
    - 真实的物理碰撞
    - 标准足球场设计

### 游戏操作小技巧

1. **扫雷游戏**
   - 优先点击角落和边缘位置
   - 利用数字提示推理地雷位置
   - 不确定时可以标记可疑位置

2. **坦克对战**
   - 预判对手移动路线

3. **飞机大战**
   - 保持灵活移动，避免固定位置
   - 优先击落威胁性更大的敌机
   - 注意收集治疗包

4. **贪吃蛇**
   - 保持安全距离，避免陷入死角
   - 提前规划移动路线
   - 在空间充足时可以画圈行进

5. **深海捕鱼**
   - 观察鱼的游动路径，提前放置钓鱼线
   - 大鱼移动较慢，更容易捕获
   - 控制钓鱼线长度，避免过长影响操作
   - 在鱼群密集处进行捕捉
   - 注意钓鱼线的收放时机

## 版权信息

© 2025 游戏集合 - 保留所有权利 