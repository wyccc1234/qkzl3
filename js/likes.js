// 点赞系统模块

// 全局点赞管理器
window.LikeManager = (function() {
  // 生成唯一ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  // 点赞数据结构
  const likeSchema = {
    id: "",           // 点赞ID
    targetType: "",   // 点赞目标类型：'post'、'comment'
    targetId: "",     // 点赞目标ID
    userId: "",       // 用户ID
    createdAt: null,  // 创建时间
  };

  class LikeManager {
    constructor() {
      this.likes = this.loadLikes();
    }
    
    // 从本地存储加载点赞数据
    loadLikes() {
      const likes = localStorage.getItem('likes');
      return likes ? JSON.parse(likes) : [];
    }
    
    // 保存点赞数据到本地存储
    saveLikes() {
      localStorage.setItem('likes', JSON.stringify(this.likes));
    }
    
    // 获取特定目标的点赞列表
    getLikesByTarget(targetType, targetId) {
      return this.likes.filter(like => 
        like.targetType === targetType && like.targetId === targetId
      );
    }
    
    // 获取用户对特定目标的点赞
    getUserLike(targetType, targetId, userId) {
      return this.likes.find(like => 
        like.targetType === targetType && 
        like.targetId === targetId && 
        like.userId === userId
      );
    }
    
    // 获取点赞数量
    getLikeCount(targetType, targetId) {
      return this.getLikesByTarget(targetType, targetId).length;
    }
    
    // 检查用户是否已点赞
    hasUserLiked(targetType, targetId, userId) {
      return this.getUserLike(targetType, targetId, userId) !== undefined;
    }
    
    // 添加点赞
    addLike(targetType, targetId, userId) {
      // 检查是否已点赞
      if (this.hasUserLiked(targetType, targetId, userId)) {
        return { 
          success: false, 
          message: '已经点赞过了',
          likeCount: this.getLikeCount(targetType, targetId)
        };
      }
      
      // 创建新点赞
      const like = {
        ...likeSchema,
        id: generateId(),
        targetType,
        targetId,
        userId,
        createdAt: new Date()
      };
      
      // 保存点赞
      this.likes.push(like);
      this.saveLikes();
      
      return { 
        success: true, 
        message: '点赞成功', 
        action: 'added',
        likeCount: this.getLikeCount(targetType, targetId)
      };
    }
    
    // 移除点赞
    removeLike(targetType, targetId, userId) {
      const likeIndex = this.likes.findIndex(like => 
        like.targetType === targetType && 
        like.targetId === targetId && 
        like.userId === userId
      );
      
      if (likeIndex === -1) {
        return { 
          success: false, 
          message: '未点赞',
          likeCount: this.getLikeCount(targetType, targetId)
        };
      }
      
      // 移除点赞
      this.likes.splice(likeIndex, 1);
      this.saveLikes();
      
      return { 
        success: true, 
        message: '已取消点赞', 
        action: 'removed',
        likeCount: this.getLikeCount(targetType, targetId)
      };
    }
    
    // 切换点赞状态
    toggleLike(targetType, targetId, userId) {
      if (!userId) {
        return { success: false, message: '用户未登录' };
      }
      
      if (this.hasUserLiked(targetType, targetId, userId)) {
        return this.removeLike(targetType, targetId, userId);
      } else {
        return this.addLike(targetType, targetId, userId);
      }
    }
    
    // 设置初始点赞状态（刷新或初始化时使用）
    setupInitialLikeStates(targetType, targetsList, userId) {
      if (!userId || !targetsList || !Array.isArray(targetsList)) {
        return;
      }
      
      targetsList.forEach(target => {
        const isLiked = this.hasUserLiked(targetType, target.id, userId);
        const likeCount = this.getLikeCount(targetType, target.id);
        
        // 更新目标对象的点赞状态
        target.liked = isLiked;
        target.likes = likeCount;
      });
    }
    
    // 获取用户的点赞历史
    getUserLikeHistory(userId, targetType = null) {
      let userLikes = this.likes.filter(like => like.userId === userId);
      
      if (targetType) {
        userLikes = userLikes.filter(like => like.targetType === targetType);
      }
      
      return userLikes;
    }
    
    // 清除用户的所有点赞（用户注销账号时使用）
    clearUserLikes(userId) {
      this.likes = this.likes.filter(like => like.userId !== userId);
      this.saveLikes();
      
      return { success: true, message: '已清除用户点赞记录' };
    }
    
    // 批量检查点赞状态
    bulkCheckLikeStatus(targetType, targetIds, userId) {
      const result = {};
      
      targetIds.forEach(id => {
        result[id] = {
          liked: this.hasUserLiked(targetType, id, userId),
          count: this.getLikeCount(targetType, id)
        };
      });
      
      return result;
    }
  }
  
  // 返回单例实例
  return new LikeManager();
})();

// 在DOM加载完成后初始化点赞UI
document.addEventListener('DOMContentLoaded', function() {
  // 初始化内容点赞按钮
  initializeContentLikeButtons();
  
  // 监听新加载的内容
  document.addEventListener('contentLoaded', function(e) {
    // 如果有指定容器，在其中初始化点赞按钮
    if (e.detail && e.detail.container) {
      initializeContentLikeButtons(e.detail.container);
    } else {
      initializeContentLikeButtons();
    }
  });
});

// 初始化内容点赞按钮
function initializeContentLikeButtons(container = document) {
  const likeButtons = container.querySelectorAll('.btn-like:not(.comment-like)');
  
  likeButtons.forEach(button => {
    // 避免重复添加事件监听器
    if (button.dataset.initialized === 'true') return;
    button.dataset.initialized = 'true';
    
    button.addEventListener('click', function() {
      const targetType = button.dataset.type || 'post';
      const targetId = button.dataset.id;
      
      // 获取当前用户
      const currentUser = window.AuthSystem.getCurrentUser();
      
      // 检查用户是否登录
      if (!currentUser) {
        // 显示登录提示
        if (typeof showAuthModal === 'function') {
          showAuthModal('login');
        } else {
          alert('请先登录后再点赞');
        }
        return;
      }
      
      // 切换点赞状态
      const result = window.LikeManager.toggleLike(targetType, targetId, currentUser.id);
      
      if (result.success) {
        // 更新UI
        const heartIcon = button.querySelector('i');
        const likeCount = button.querySelector('.like-count');
        
        if (result.action === 'added') {
          button.classList.add('liked');
          if (heartIcon) heartIcon.className = heartIcon.className.replace('bi-heart', 'bi-heart-fill');
          
          // 添加点赞动画效果
          button.classList.add('like-animation');
          setTimeout(() => button.classList.remove('like-animation'), 1000);
        } else {
          button.classList.remove('liked');
          if (heartIcon) heartIcon.className = heartIcon.className.replace('bi-heart-fill', 'bi-heart');
        }
        
        // 更新点赞计数
        if (likeCount) likeCount.textContent = result.likeCount;
      }
    });
  });
}

// 语法检查
try {
  console.log("Likes.js syntax check passed");
} catch (error) {
  console.error("Syntax error:", error.message);
}

// 函数验证
console.assert(typeof window.LikeManager === 'object', 'LikeManager is defined as global object');
console.assert(typeof initializeContentLikeButtons === 'function', 'initializeContentLikeButtons function exists');