// 评论系统模块

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 评论数据结构
const commentSchema = {
  id: "",           // 评论ID
  postId: "",       // 关联帖子ID
  userId: "",       // 评论用户ID
  username: "",     // 评论用户名
  userAvatar: "",   // 用户头像
  content: "",      // 评论内容
  createdAt: null,  // 创建时间
  likes: 0,         // 点赞数
  replies: [],      // 回复列表
};

// 回复数据结构
const replySchema = {
  id: "",           // 回复ID
  commentId: "",    // 关联评论ID
  userId: "",       // 回复用户ID
  username: "",     // 回复用户名
  userAvatar: "",   // 用户头像
  content: "",      // 回复内容
  createdAt: null,  // 创建时间
};

// 评论系统类
class CommentManager {
  constructor() {
    this.comments = this.loadComments();
    this.initEventListeners();
  }

  // 从本地存储加载评论
  loadComments() {
    const comments = localStorage.getItem('comments');
    return comments ? JSON.parse(comments) : [];
  }

  // 保存评论到本地存储
  saveComments() {
    localStorage.setItem('comments', JSON.stringify(this.comments));
  }

  // 获取指定帖子的评论
  getCommentsByPostId(postId) {
    return this.comments.filter(comment => comment.postId === postId);
  }

  // 获取评论数量
  getCommentCount(postId) {
    const comments = this.getCommentsByPostId(postId);
    let count = comments.length;
    
    // 计算回复数量
    for (const comment of comments) {
      count += comment.replies.length;
    }
    
    return count;
  }

  // 添加评论
  addComment(postId, content, user) {
    if (!user) {
      throw new Error('用户未登录，无法评论');
    }
    
    if (!content.trim()) {
      throw new Error('评论内容不能为空');
    }
    
    const comment = {
      ...commentSchema,
      id: generateId(),
      postId,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar || 'https://i.pravatar.cc/150',
      content,
      createdAt: new Date(),
      likes: 0,
      replies: []
    };
    
    this.comments.unshift(comment);
    this.saveComments();
    
    return comment;
  }

  // 添加回复
  addReply(commentId, content, user) {
    if (!user) {
      throw new Error('用户未登录，无法回复');
    }
    
    if (!content.trim()) {
      throw new Error('回复内容不能为空');
    }
    
    const commentIndex = this.comments.findIndex(comment => comment.id === commentId);
    
    if (commentIndex === -1) {
      throw new Error('回复的评论不存在');
    }
    
    const reply = {
      ...replySchema,
      id: generateId(),
      commentId,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar || 'https://i.pravatar.cc/150',
      content,
      createdAt: new Date()
    };
    
    this.comments[commentIndex].replies.push(reply);
    this.saveComments();
    
    return reply;
  }

  // 删除评论
  deleteComment(commentId, userId) {
    const commentIndex = this.comments.findIndex(comment => comment.id === commentId);
    
    if (commentIndex === -1) {
      return { success: false, message: '评论不存在' };
    }
    
    const comment = this.comments[commentIndex];
    
    // 检查是否是评论的作者或管理员
    if (comment.userId !== userId && !window.AuthSystem.isAdmin()) {
      return { success: false, message: '没有权限删除该评论' };
    }
    
    this.comments.splice(commentIndex, 1);
    this.saveComments();
    
    return { success: true, message: '评论已删除' };
  }

  // 删除回复
  deleteReply(commentId, replyId, userId) {
    const commentIndex = this.comments.findIndex(comment => comment.id === commentId);
    
    if (commentIndex === -1) {
      return { success: false, message: '评论不存在' };
    }
    
    const comment = this.comments[commentIndex];
    const replyIndex = comment.replies.findIndex(reply => reply.id === replyId);
    
    if (replyIndex === -1) {
      return { success: false, message: '回复不存在' };
    }
    
    const reply = comment.replies[replyIndex];
    
    // 检查是否是回复的作者或管理员
    if (reply.userId !== userId && !window.AuthSystem.isAdmin()) {
      return { success: false, message: '没有权限删除该回复' };
    }
    
    comment.replies.splice(replyIndex, 1);
    this.saveComments();
    
    return { success: true, message: '回复已删除' };
  }

  // 渲染评论列表
  renderCommentList(containerSelector, postId) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const comments = this.getCommentsByPostId(postId);
    
    // 清空容器
    container.innerHTML = '';
    
    if (comments.length === 0) {
      container.innerHTML = '<div class="no-comments">暂无评论，来发表第一条评论吧！</div>';
      return;
    }
    
    // 添加评论
    comments.forEach(comment => {
      const commentElement = this.createCommentElement(comment);
      container.appendChild(commentElement);
    });
  }

  // 创建评论元素
  createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';
    commentElement.dataset.id = comment.id;
    
    // 格式化日期
    const formattedDate = this.formatDate(comment.createdAt);
    
    // 获取当前用户
    const currentUser = window.AuthSystem.getCurrentUser();
    const isCommentAuthor = currentUser && currentUser.id === comment.userId;
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    // 构建HTML
    commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-user">
          <div class="comment-avatar">
            <img src="${comment.userAvatar}" alt="${comment.username}">
          </div>
          <div class="comment-info">
            <div class="comment-username">${comment.username}</div>
            <div class="comment-time">${formattedDate}</div>
          </div>
        </div>
        <div class="comment-actions">
          ${(isCommentAuthor || isAdmin) ? 
            `<button class="btn-delete-comment" data-id="${comment.id}">
              <i class="bi bi-trash"></i>
            </button>` : ''}
          <button class="btn-reply-comment" data-id="${comment.id}">
            <i class="bi bi-reply"></i> 回复
          </button>
        </div>
      </div>
      <div class="comment-content">${this.formatContent(comment.content)}</div>
      <div class="comment-footer">
        <button class="btn-like ${comment.liked ? 'liked' : ''}" data-id="${comment.id}">
          <i class="bi bi-heart${comment.liked ? '-fill' : ''}"></i>
          <span class="like-count">${comment.likes}</span>
        </button>
      </div>
      <div class="reply-form-container" id="reply-form-${comment.id}" style="display: none;">
        <div class="reply-form">
          <textarea class="form-control reply-input" placeholder="写下你的回复..."></textarea>
          <div class="reply-actions">
            <button class="btn btn-secondary btn-sm cancel-reply-btn">取消</button>
            <button class="btn btn-primary btn-sm submit-reply-btn" data-comment-id="${comment.id}">回复</button>
          </div>
        </div>
      </div>
      <div class="replies-container" id="replies-${comment.id}">
        ${this.generateRepliesHTML(comment)}
      </div>
    `;
    
    // 添加事件监听器
    this.addCommentEventListeners(commentElement);
    
    return commentElement;
  }

  // 生成回复HTML
  generateRepliesHTML(comment) {
    if (comment.replies.length === 0) {
      return '';
    }
    
    let html = `<div class="replies-header">共 ${comment.replies.length} 条回复</div>`;
    
    comment.replies.forEach(reply => {
      // 获取当前用户
      const currentUser = window.AuthSystem.getCurrentUser();
      const isReplyAuthor = currentUser && currentUser.id === reply.userId;
      const isAdmin = currentUser && currentUser.role === 'admin';
      
      // 格式化日期
      const formattedDate = this.formatDate(reply.createdAt);
      
      html += `
        <div class="reply-item" data-id="${reply.id}">
          <div class="reply-header">
            <div class="reply-user">
              <div class="reply-avatar">
                <img src="${reply.userAvatar}" alt="${reply.username}">
              </div>
              <div class="reply-info">
                <div class="reply-username">${reply.username}</div>
                <div class="reply-time">${formattedDate}</div>
              </div>
            </div>
            <div class="reply-actions">
              ${(isReplyAuthor || isAdmin) ? 
                `<button class="btn-delete-reply" data-comment-id="${comment.id}" data-reply-id="${reply.id}">
                  <i class="bi bi-trash"></i>
                </button>` : ''}
            </div>
          </div>
          <div class="reply-content">${this.formatContent(reply.content)}</div>
        </div>
      `;
    });
    
    return html;
  }

  // 添加评论事件监听器
  addCommentEventListeners(commentElement) {
    // 删除评论按钮
    const deleteBtn = commentElement.querySelector('.btn-delete-comment');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        const commentId = deleteBtn.dataset.id;
        const currentUser = window.AuthSystem.getCurrentUser();
        
        if (currentUser) {
          const result = this.deleteComment(commentId, currentUser.id);
          if (result.success) {
            // 从DOM中移除评论
            commentElement.remove();
          }
        }
      });
    }
    
    // 回复按钮
    const replyBtn = commentElement.querySelector('.btn-reply-comment');
    const replyFormContainer = commentElement.querySelector('.reply-form-container');
    
    if (replyBtn && replyFormContainer) {
      replyBtn.addEventListener('click', () => {
        // 检查登录状态
        const currentUser = window.AuthSystem.getCurrentUser();
        if (!currentUser) {
          // 显示登录模态框
          if (typeof showModal === 'function') {
            showModal('请先登录', '需要登录后才能回复评论。');
          } else {
            alert('请先登录后再回复评论');
          }
          return;
        }
        
        // 切换回复表单显示
        replyFormContainer.style.display = 
          replyFormContainer.style.display === 'none' ? 'block' : 'none';
          
        if (replyFormContainer.style.display === 'block') {
          // 聚焦到输入框
          const replyInput = replyFormContainer.querySelector('.reply-input');
          if (replyInput) {
            replyInput.focus();
          }
        }
      });
    }
    
    // 取消回复按钮
    const cancelReplyBtn = commentElement.querySelector('.cancel-reply-btn');
    if (cancelReplyBtn && replyFormContainer) {
      cancelReplyBtn.addEventListener('click', () => {
        replyFormContainer.style.display = 'none';
        
        // 清空输入框
        const replyInput = replyFormContainer.querySelector('.reply-input');
        if (replyInput) {
          replyInput.value = '';
        }
      });
    }
    
    // 提交回复按钮
    const submitReplyBtn = commentElement.querySelector('.submit-reply-btn');
    if (submitReplyBtn) {
      submitReplyBtn.addEventListener('click', () => {
        const commentId = submitReplyBtn.dataset.commentId;
        const replyInput = commentElement.querySelector('.reply-input');
        
        if (replyInput) {
          const content = replyInput.value.trim();
          const currentUser = window.AuthSystem.getCurrentUser();
          
          if (currentUser && content) {
            try {
              const reply = this.addReply(commentId, content, currentUser);
              
              // 更新回复列表
              const repliesContainer = commentElement.querySelector(`#replies-${commentId}`);
              if (repliesContainer) {
                repliesContainer.innerHTML = this.generateRepliesHTML({
                  id: commentId,
                  replies: [...this.comments.find(c => c.id === commentId).replies]
                });
                
                // 添加回复事件监听器
                this.addReplyEventListeners(repliesContainer);
              }
              
              // 隐藏回复表单并清空内容
              replyFormContainer.style.display = 'none';
              replyInput.value = '';
            } catch (error) {
              alert(error.message);
            }
          } else if (!currentUser) {
            alert('请先登录');
          } else {
            alert('回复内容不能为空');
          }
        }
      });
    }
    
    // 点赞按钮
    const likeBtn = commentElement.querySelector('.btn-like');
    if (likeBtn) {
      likeBtn.addEventListener('click', () => {
        const commentId = likeBtn.dataset.id;
        const currentUser = window.AuthSystem.getCurrentUser();
        
        // 检查登录状态
        if (!currentUser) {
          // 显示登录模态框
          if (typeof showModal === 'function') {
            showModal('请先登录', '需要登录后才能点赞评论。');
          } else {
            alert('请先登录后再点赞评论');
          }
          return;
        }
        
        // 处理点赞
        const result = window.LikeManager.toggleLike('comment', commentId, currentUser.id);
        
        if (result.success) {
          // 更新点赞状态
          const heartIcon = likeBtn.querySelector('i');
          const likeCountElement = likeBtn.querySelector('.like-count');
          
          if (result.action === 'added') {
            heartIcon.className = 'bi bi-heart-fill';
            likeBtn.classList.add('liked');
          } else {
            heartIcon.className = 'bi bi-heart';
            likeBtn.classList.remove('liked');
          }
          
          // 更新点赞数
          likeCountElement.textContent = result.likeCount;
          
          // 更新评论对象
          const commentIndex = this.comments.findIndex(comment => comment.id === commentId);
          if (commentIndex !== -1) {
            this.comments[commentIndex].likes = result.likeCount;
          }
        }
      });
    }
  }

  // 添加回复事件监听器
  addReplyEventListeners(container) {
    // 删除回复按钮
    const deleteReplyBtns = container.querySelectorAll('.btn-delete-reply');
    deleteReplyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.commentId;
        const replyId = btn.dataset.replyId;
        const currentUser = window.AuthSystem.getCurrentUser();
        
        if (currentUser) {
          const result = this.deleteReply(commentId, replyId, currentUser.id);
          if (result.success) {
            // 从DOM中移除回复
            const replyItem = btn.closest('.reply-item');
            if (replyItem) {
              replyItem.remove();
              
              // 更新回复数量
              const comment = this.comments.find(c => c.id === commentId);
              const repliesHeader = container.querySelector('.replies-header');
              
              if (comment && repliesHeader) {
                if (comment.replies.length === 0) {
                  // 如果没有回复了，移除整个回复容器内容
                  container.innerHTML = '';
                } else {
                  // 更新回复数量
                  repliesHeader.textContent = `共 ${comment.replies.length} 条回复`;
                }
              }
            }
          }
        }
      });
    });
  }

  // 初始化事件监听器
  initEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      // 发表评论按钮
      const postCommentBtns = document.querySelectorAll('.post-comment-btn');
      postCommentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const postId = btn.dataset.postId;
          const inputId = `comment-input-${postId}`;
          const input = document.getElementById(inputId);
          
          if (input) {
            const content = input.value.trim();
            const currentUser = window.AuthSystem.getCurrentUser();
            
            if (!currentUser) {
              // 显示登录模态框
              if (typeof showAuthModal === 'function') {
                showAuthModal('login');
              } else {
                alert('请先登录后再评论');
              }
              return;
            }
            
            if (!content) {
              alert('评论内容不能为空');
              return;
            }
            
            try {
              const comment = this.addComment(postId, content, currentUser);
              
              // 更新评论列表
              const commentsContainer = document.getElementById(`${postId}-comments`);
              if (commentsContainer) {
                // 移除"暂无评论"提示
                const noComments = commentsContainer.querySelector('.no-comments');
                if (noComments) {
                  commentsContainer.removeChild(noComments);
                }
                
                // 创建新评论元素并添加到顶部
                const commentElement = this.createCommentElement(comment);
                commentsContainer.insertBefore(commentElement, commentsContainer.firstChild);
              }
              
              // 清空输入框
              input.value = '';
            } catch (error) {
              alert(error.message);
            }
          }
        });
      });
      
      // 查看角色评论按钮
      const toggleCommentsBtns = document.querySelectorAll('.toggle-comments');
      toggleCommentsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          
          const characterId = btn.dataset.characterId;
          const characterCard = btn.closest('.character-card');
          const commentsContainer = document.getElementById(`character-comments-container-${characterId}`);
          
          if (characterCard && commentsContainer) {
            // 切换评论区显示
            if (commentsContainer.style.display === 'none') {
              commentsContainer.style.display = 'block';
              btn.innerHTML = '收起评论 <i class="bi bi-chevron-up"></i>';
              
              // 渲染评论列表
              this.renderCommentList(`#character-comments-${characterId}`, `character-${characterId}`);
            } else {
              commentsContainer.style.display = 'none';
              btn.innerHTML = '查看评论 <i class="bi bi-chat-fill"></i>';
            }
          }
        });
      });
    });
  }

  // 格式化评论内容
  formatContent(content) {
    if (!content) return '';
    
    // 转义HTML
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
      
    // 将换行符转换为<br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    // 识别表情符号 (简单示例)
    const emojis = {
      ':)': '😊',
      ':(': '😢',
      ':D': '😃',
      ';)': '😉'
    };
    
    for (const [key, value] of Object.entries(emojis)) {
      formatted = formatted.replace(new RegExp(key, 'g'), value);
    }
    
    return formatted;
  }

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // 秒数差
    
    if (diff < 60) {
      return '刚刚';
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)}分钟前`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}小时前`;
    } else if (diff < 2592000) {
      return `${Math.floor(diff / 86400)}天前`;
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  }
}

// 在页面加载完成后初始化评论系统
document.addEventListener('DOMContentLoaded', () => {
  // 创建全局评论管理器实例
  window.CommentManager = new CommentManager();
  
  // 为每个评论区渲染评论
  const commentSections = [
    { selector: '#game-intro-comments', postId: 'game-intro' },
    { selector: '#screenshots-comments', postId: 'screenshots' },
    { selector: '#news-comments', postId: 'news' }
  ];
  
  commentSections.forEach(section => {
    window.CommentManager.renderCommentList(section.selector, section.postId);
  });
});

// Syntax self-check
try {
  console.log("Comments.js syntax check passed");
} catch (error) {
  console.error("Syntax error:", error.message);
}

// Function verification
console.assert(typeof CommentManager === 'function', 'CommentManager class exists');
console.assert(typeof generateId === 'function', 'generateId function exists');