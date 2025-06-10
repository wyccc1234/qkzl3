# 青空之恋网站模块设计

## 1. 核心模块

### 1.1 用户系统模块 (auth.js)
```typescript
// 用户数据结构
interface User {
  id: string;         // 用户唯一标识
  username: string;   // 用户名
  password: string;   // 密码(加密存储)
  role: string;       // 角色：'admin' 或 'user'
  avatar: string;     // 头像URL
  registerDate: Date; // 注册日期
  lastLogin: Date;    // 最后登录时间
}

// 登录状态结构
interface UserSession {
  userId: string;     // 用户ID
  username: string;   // 用户名
  role: string;       // 用户角色
  loginTime: number;  // 登录时间戳
  expiresAt: number;  // 过期时间戳
}

// 用户认证类
class AuthManager {
  // 用户注册
  static async register(username: string, password: string): Promise<{success: boolean, message: string, userId?: string}>;
  
  // 用户登录
  static async login(username: string, password: string): Promise<{success: boolean, message: string, user?: UserSession}>;
  
  // 检查是否已登录
  static isLoggedIn(): boolean;
  
  // 获取当前登录用户
  static getCurrentUser(): UserSession | null;
  
  // 登出
  static logout(): void;
  
  // 验证密码
  static validatePassword(password: string): boolean;
  
  // 检查用户名是否存在
  static async usernameExists(username: string): Promise<boolean>;
}
```

### 1.2 评论系统模块 (comments.js)
```typescript
// 评论数据结构
interface Comment {
  id: string;           // 评论ID
  postId: string;       // 关联帖子ID
  userId: string;       // 评论用户ID
  username: string;     // 评论用户名
  userAvatar: string;   // 用户头像
  content: string;      // 评论内容
  createdAt: Date;      // 创建时间
  likes: number;        // 点赞数
  replies: Reply[];     // 回复列表
}

// 回复数据结构
interface Reply {
  id: string;           // 回复ID
  commentId: string;    // 关联评论ID
  userId: string;       // 回复用户ID
  username: string;     // 回复用户名
  userAvatar: string;   // 用户头像
  content: string;      // 回复内容
  createdAt: Date;      // 创建时间
}

// 评论管理类
class CommentManager {
  // 获取特定内容的评论列表
  static async getComments(postId: string): Promise<Comment[]>;
  
  // 添加评论
  static async addComment(postId: string, content: string): Promise<{success: boolean, comment?: Comment}>;
  
  // 添加回复
  static async addReply(commentId: string, content: string): Promise<{success: boolean, reply?: Reply}>;
  
  // 删除评论
  static async deleteComment(commentId: string): Promise<boolean>;
  
  // 删除回复
  static async deleteReply(replyId: string, commentId: string): Promise<boolean>;
}
```

### 1.3 点赞系统模块 (likes.js)
```typescript
// 点赞数据结构
interface Like {
  id: string;           // 点赞ID
  targetType: string;   // 点赞目标类型：'post'、'comment'
  targetId: string;     // 点赞目标ID
  userId: string;       // 用户ID
  createdAt: Date;      // 创建时间
}

// 点赞管理类
class LikeManager {
  // 添加点赞
  static async addLike(targetType: string, targetId: string): Promise<{success: boolean, likes: number}>;
  
  // 取消点赞
  static async removeLike(targetType: string, targetId: string): Promise<{success: boolean, likes: number}>;
  
  // 获取内容的点赞状态
  static async getLikeStatus(targetType: string, targetId: string): Promise<{liked: boolean, count: number}>;
  
  // 获取用户的点赞列表
  static async getUserLikes(userId: string): Promise<Like[]>;
}
```

### 1.4 鼠标粒子效果模块 (particles.js)
```typescript
// 粒子类
interface Particle {
  x: number;          // X坐标
  y: number;          // Y坐标
  size: number;       // 大小
  color: string;      // 颜色
  speedX: number;     // X方向速度
  speedY: number;     // Y方向速度
  life: number;       // 生命周期
  maxLife: number;    // 最大生命周期
}

// 粒子效果管理类
class ParticleEffect {
  // 初始化粒子效果
  static init(): void;
  
  // 生成新的粒子
  static createParticles(x: number, y: number, count: number): void;
  
  // 更新和渲染粒子
  static update(): void;
  
  // 清理页面上的粒子
  static clear(): void;
}
```

### 1.5 数据管理模块 (DataManager.js)
```typescript
// 数据管理类
class DataManager {
  // 保存数据到localStorage
  static async saveData(key: string, data: any): Promise<boolean>;
  
  // 从localStorage获取数据
  static getData(key: string): any;
  
  // 删除数据
  static removeData(key: string): boolean;
  
  // 清除所有数据
  static clearAllData(): void;
  
  // 检查数据是否存在
  static hasData(key: string): boolean;
}
```

## 2. 页面功能模块

### 2.1 主页面功能 (main.js)
```typescript
// 页面初始化
function initPage(): void;

// 加载轮播图
async function loadCarousel(): Promise<void>;

// 加载游戏介绍
async function loadGameIntro(): Promise<void>;

// 加载角色介绍
async function loadCharacters(): Promise<void>;

// 加载游戏截图
async function loadScreenshots(): Promise<void>;

// 加载最新公告
async function loadAnnouncements(): Promise<void>;

// 初始化用户界面元素
function initUserInterface(): void;

// 初始化评论系统
function initCommentSystem(): void;

// 加载页面评论
async function loadComments(sectionId: string): Promise<void>;
```

### 2.2 管理页面功能 (admin.js)
```typescript
// 页面初始化
function initAdminPage(): void;

// 加载轮播图管理
async function loadCarouselManagement(): Promise<void>;

// 加载游戏介绍管理
async function loadGameIntroManagement(): Promise<void>;

// 加载角色管理
async function loadCharacterManagement(): Promise<void>;

// 加载截图管理
async function loadScreenshotManagement(): Promise<void>;

// 加载公告管理
async function loadAnnouncementManagement(): Promise<void>;

// 加载网站设置管理
async function loadSettingsManagement(): Promise<void>;

// 处理管理员登录
async function handleAdminLogin(username: string, password: string): Promise<boolean>;
```

## 3. 公共工具模块

### 3.1 工具函数 (utils.js)
```typescript
// 生成唯一ID
function generateId(): string;

// 格式化日期
function formatDate(date: Date): string;

// 验证图片URL
function validateImageUrl(url: string): boolean;

// 限制字符串长度
function truncateString(str: string, maxLength: number): string;

// 防抖函数
function debounce(func: Function, delay: number): Function;

// 节流函数
function throttle(func: Function, limit: number): Function;
```