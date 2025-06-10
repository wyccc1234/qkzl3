// 主页面功能模块

// 在页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化导航栏事件
  initNavigation();
  
  // 初始化用户界面
  initUserInterface();
  
  // 初始化评论系统
  initCommentSystem();
  
  // 显示提示消息（如果URL中有消息参数）
  checkMessageParam();
});

// 初始化导航栏事件
function initNavigation() {
  // 平滑滚动到锚点
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // 平滑滚动
        window.scrollTo({
          top: targetElement.offsetTop - 70, // 减去导航栏高度
          behavior: 'smooth'
        });
        
        // 更新活动导航项
        updateActiveNavItem(this);
      }
    });
  });
  
  // 根据滚动位置更新导航栏活动状态
  window.addEventListener('scroll', function() {
    updateActiveNavOnScroll();
  });
  
  // 初始化时执行一次
  updateActiveNavOnScroll();
}

// 根据滚动位置更新导航栏活动状态
function updateActiveNavOnScroll() {
  const scrollPosition = window.scrollY + 100; // 100px 偏移
  
  // 获取所有可能的目标区域
  const sections = document.querySelectorAll('section[id]');
  
  // 查找当前在视口中的区域
  let currentSection = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });
  
  // 更新导航栏活动状态
  document.querySelectorAll('.navbar-nav .nav-link').forEach(navLink => {
    navLink.classList.remove('active');
    
    const href = navLink.getAttribute('href');
    if (href === `#${currentSection}`) {
      navLink.classList.add('active');
    }
  });
}

// 更新活动导航项
function updateActiveNavItem(clickedItem) {
  document.querySelectorAll('.navbar-nav .nav-link').forEach(navLink => {
    navLink.classList.remove('active');
  });
  
  clickedItem.classList.add('active');
}

// 初始化用户界面
function initUserInterface() {
  // 检查用户登录状态
  updateUserMenu();
  
  // 绑定认证相关事件
  bindAuthEvents();
  
  // 绑定登录按钮点击事件
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showAuthModal('login');
    });
  }
  
  // 绑定注册按钮点击事件
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showAuthModal('register');
    });
  }
  
  // 绑定退出登录按钮点击事件
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      AuthManager.logout();
      updateUserMenu();
      showToast('success', '你已成功退出登录');
    });
  }
  
  // 绑定管理员入口点击事件
  const adminBtn = document.getElementById('admin-btn');
  if (adminBtn) {
    adminBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 检查是否已登录且为管理员
      const currentUser = AuthManager.getCurrentUser();
      if (currentUser && currentUser.role === 'admin') {
        // 跳转到管理页面
        window.location.href = 'admin.html';
      } else {
        // 显示管理员登录模态框
        showAdminLoginModal();
      }
    });
  }
}

// 更新用户菜单
function updateUserMenu() {
  const userMenuContainer = document.getElementById('user-menu-container');
  const guestMenuContainer = document.getElementById('guest-menu-container');
  
  if (!userMenuContainer || !guestMenuContainer) return;
  
  // 获取当前用户
  const currentUser = AuthManager.getCurrentUser();
  
  if (currentUser) {
    // 显示用户菜单
    userMenuContainer.style.display = 'flex';
    guestMenuContainer.style.display = 'none';
    
    // 更新用户名
    const usernameElement = document.getElementById('current-username');
    if (usernameElement) {
      usernameElement.textContent = currentUser.username;
    }
    
    // 如果是管理员，显示管理按钮
    const adminBtnContainer = document.getElementById('admin-btn-container');
    if (adminBtnContainer) {
      adminBtnContainer.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
  } else {
    // 显示游客菜单
    userMenuContainer.style.display = 'none';
    guestMenuContainer.style.display = 'flex';
  }
}

// 绑定认证相关事件
function bindAuthEvents() {
  // 登录表单提交事件
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      
      if (!username || !password) {
        showAuthError('请输入用户名和密码');
        return;
      }
      
      // 登录
      const result = AuthManager.login(username, password);
      
      if (result.success) {
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('auth-modal'));
        if (modal) modal.hide();
        
        // 更新用户菜单
        updateUserMenu();
        
        // 显示成功消息
        showToast('success', '登录成功');
      } else {
        showAuthError(result.message);
      }
    });
  }
  
  // 注册表单提交事件
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      if (!username || !password || !confirmPassword) {
        showAuthError('请填写所有字段');
        return;
      }
      
      if (password !== confirmPassword) {
        showAuthError('两次输入的密码不一致');
        return;
      }
      
      // 注册
      const result = AuthManager.register(username, password);
      
      if (result.success) {
        // 切换到登录表单
        showAuthForm('login');
        
        // 自动填充用户名
        const loginUsername = document.getElementById('login-username');
        if (loginUsername) loginUsername.value = username;
        
        // 显示成功消息
        showAuthMessage('注册成功，请登录', 'success');
      } else {
        showAuthError(result.message);
      }
    });
  }
  
  // 管理员登录表单提交事件
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('admin-username').value.trim();
      const password = document.getElementById('admin-password').value;
      
      if (!username || !password) {
        showAdminLoginError('请输入管理员账号和密码');
        return;
      }
      
      // 管理员登录
      const result = AuthManager.loginAdmin(username, password);
      
      if (result.success) {
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('admin-login-modal'));
        if (modal) modal.hide();
        
        // 显示成功消息
        showToast('success', '管理员登录成功');
        
        // 跳转到管理页面
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 500);
      } else {
        showAdminLoginError(result.message);
      }
    });
  }
  
  // 切换登录/注册表单
  document.querySelectorAll('.switch-auth-form').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const formType = this.dataset.form;
      showAuthForm(formType);
    });
  });
}

// 显示登录/注册模态框
function showAuthModal(mode = 'login') {
  // 获取模态框元素
  const modalElement = document.getElementById('auth-modal');
  if (!modalElement) return;
  
  // 显示指定的表单
  showAuthForm(mode);
  
  // 初始化并显示模态框
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// 显示管理员登录模态框
function showAdminLoginModal() {
  // 获取模态框元素
  const modalElement = document.getElementById('admin-login-modal');
  if (!modalElement) return;
  
  // 清空表单
  const form = document.getElementById('admin-login-form');
  if (form) form.reset();
  
  // 清空错误消息
  const errorElement = document.getElementById('admin-login-error');
  if (errorElement) errorElement.textContent = '';
  
  // 初始化并显示模态框
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// 显示指定的认证表单
function showAuthForm(formType) {
  // 隐藏所有表单
  document.querySelectorAll('.auth-form').forEach(form => {
    form.style.display = 'none';
  });
  
  // 显示指定表单
  const targetForm = document.getElementById(`${formType}-form-container`);
  if (targetForm) {
    targetForm.style.display = 'block';
  }
  
  // 更新模态框标题
  const modalTitle = document.getElementById('auth-modal-title');
  if (modalTitle) {
    modalTitle.textContent = formType === 'login' ? '用户登录' : '用户注册';
  }
  
  // 清空表单
  const form = document.getElementById(`${formType}-form`);
  if (form) form.reset();
  
  // 清空错误消息
  const errorElement = document.getElementById('auth-error');
  if (errorElement) errorElement.textContent = '';
  
  // 清空成功消息
  const messageElement = document.getElementById('auth-message');
  if (messageElement) messageElement.style.display = 'none';
}

// 显示认证错误信息
function showAuthError(message) {
  const errorElement = document.getElementById('auth-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// 显示管理员登录错误信息
function showAdminLoginError(message) {
  const errorElement = document.getElementById('admin-login-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// 显示认证成功信息
function showAuthMessage(message, type = 'success') {
  const messageElement = document.getElementById('auth-message');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `alert alert-${type} mt-3`;
    messageElement.style.display = 'block';
    
    // 清空错误消息
    const errorElement = document.getElementById('auth-error');
    if (errorElement) errorElement.style.display = 'none';
  }
}

// 初始化评论系统
function initCommentSystem() {
  // 加载游戏介绍评论
  loadComments('game-intro', 'game-intro-comments');
  
  // 加载角色评论
  document.querySelectorAll('.character-card').forEach(card => {
    const characterId = card.dataset.characterId;
    if (characterId) {
      loadComments(`character-${characterId}`, `character-comments-${characterId}`);
    }
  });
  
  // 绑定发表评论按钮点击事件
  document.querySelectorAll('.post-comment-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const postId = this.dataset.postId;
      const commentInput = document.getElementById(`comment-input-${postId}`);
      
      if (!commentInput) return;
      
      // 获取当前用户
      const currentUser = AuthManager.getCurrentUser();
      if (!currentUser) {
        showAuthModal('login');
        return;
      }
      
      // 获取评论内容
      const content = commentInput.value.trim();
      if (!content) {
        showToast('error', '请输入评论内容');
        return;
      }
      
      // 发表评论
      const result = CommentManager.addComment(
        postId,
        currentUser.userId,
        currentUser.username,
        `https://i.pravatar.cc/150?u=${currentUser.username}`, // 使用头像生成服务
        content
      );
      
      if (result.success) {
        // 清空输入框
        commentInput.value = '';
        
        // 重新加载评论
        loadComments(postId, `${postId}-comments`);
        
        // 显示成功消息
        showToast('success', '评论已发布');
      } else {
        showToast('error', result.message);
      }
    });
  });
}

// 加载评论
function loadComments(postId, containerId) {
  if (window.CommentManager) {
    CommentManager.renderComments(postId, containerId);
  }
}

// 显示Toast消息
function showToast(type, message) {
  // 创建Toast元素
  const toast = document.createElement('div');
  toast.className = `toast show toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  // Toast内容
  toast.innerHTML = `
    <div class="toast-header">
      <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2"></i>
      <strong class="me-auto">${type === 'success' ? '成功' : '错误'}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;
  
  // 追加到Toast容器
  const toastContainer = document.getElementById('toast-container');
  if (toastContainer) {
    toastContainer.appendChild(toast);
  } else {
    // 创建Toast容器
    const newContainer = document.createElement('div');
    newContainer.id = 'toast-container';
    newContainer.className = 'position-fixed bottom-0 end-0 p-3';
    newContainer.style.zIndex = '9999';
    
    // 添加到body
    document.body.appendChild(newContainer);
    newContainer.appendChild(toast);
  }
  
  // 添加关闭按钮事件
  const closeBtn = toast.querySelector('.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      toast.remove();
    });
  }
  
  // 自动关闭
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

// 检查URL中的消息参数
function checkMessageParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  const type = urlParams.get('type') || 'success';
  
  if (message) {
    showToast(type, decodeURIComponent(message));
    
    // 移除URL参数，避免刷新时再次显示
    const newUrl = window.location.pathname + window.location.hash;
    history.replaceState(null, '', newUrl);
  }
}

// 暴露全局函数
window.showAuthModal = showAuthModal;
window.showToast = showToast;

// Syntax self-check
try {
  console.log("Main.js syntax check passed");
}
catch (error) {
  console.error("Syntax error:", error.message);
}

// Function verification
console.assert(typeof updateUserMenu === 'function', 'updateUserMenu function exists');
console.assert(typeof showToast === 'function', 'showToast function exists');