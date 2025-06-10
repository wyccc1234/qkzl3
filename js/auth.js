// 用户认证系统

// 用全局命名空间避免冲突
window.AuthSystem = (function() {
  // 生成唯一ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // 用户数据结构
  const userSchema = {
    id: "",         // 用户唯一标识
    username: "",   // 用户名
    password: "",   // 密码(加密存储)
    role: "",       // 角色：'admin' 或 'user'
    avatar: "",     // 头像URL
    registerDate: null, // 注册日期
    lastLogin: null,    // 最后登录时间
  };

  // 用户会话数据结构
  const sessionSchema = {
    userId: "",       // 用户ID
    username: "",     // 用户名
    role: "",         // 用户角色
    loginTime: null,  // 登录时间戳
    expiresAt: null,  // 过期时间戳
  };

  // 用户认证类
  class AuthManager {
    constructor() {
      this.users = this.loadUsers();
      this.session = this.loadSession();
      
      // 确保至少有一个管理员账号
      this.ensureAdminExists();
    }
    
    // 从本地存储加载用户列表
    loadUsers() {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    }
    
    // 保存用户列表到本地存储
    saveUsers() {
      localStorage.setItem('users', JSON.stringify(this.users));
    }
    
    // 从本地存储加载会话
    loadSession() {
      const session = localStorage.getItem('userSession');
      
      if (!session) {
        return null;
      }
      
      const parsedSession = JSON.parse(session);
      
      // 检查会话是否过期
      if (parsedSession.expiresAt && new Date().getTime() > parsedSession.expiresAt) {
        localStorage.removeItem('userSession');
        return null;
      }
      
      return parsedSession;
    }
    
    // 保存会话到本地存储
    saveSession(session) {
      if (session) {
        localStorage.setItem('userSession', JSON.stringify(session));
      } else {
        localStorage.removeItem('userSession');
      }
      
      this.session = session;
    }
    
    // 确保至少有一个管理员账号
    ensureAdminExists() {
      // 检查是否已经有管理员用户
      const adminExists = this.users.some(user => user.role === 'admin');
      
      if (!adminExists) {
        // 创建默认管理员账号
        const adminUser = {
          ...userSchema,
          id: generateId(),
          username: 'admin',
          password: this.hashPassword('admin123'), // 默认密码
          role: 'admin',
          avatar: 'https://i.pravatar.cc/150?img=1',
          registerDate: new Date(),
          lastLogin: new Date()
        };
        
        this.users.push(adminUser);
        this.saveUsers();
        
        console.info('已创建默认管理员账号，用户名: admin, 密码: admin123');
      }
    }
    
    // 密码哈希（简单实现，实际应使用更安全的方法）
    hashPassword(password) {
      // 在实际应用中，应使用专业的密码哈希库
      // 这里只是简单实现
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
      }
      return hash.toString(36);
    }
    
    // 验证密码
    verifyPassword(password, hash) {
      return this.hashPassword(password) === hash;
    }
    
    // 注册新用户
    register(username, password, confirmPassword) {
      // 参数验证
      if (!username || !password || !confirmPassword) {
        return { success: false, message: '所有字段都是必填项' };
      }
      
      if (password !== confirmPassword) {
        return { success: false, message: '两次输入的密码不匹配' };
      }
      
      if (username.length < 3) {
        return { success: false, message: '用户名至少需要3个字符' };
      }
      
      if (password.length < 6) {
        return { success: false, message: '密码至少需要6个字符' };
      }
      
      // 检查用户名是否已被使用
      if (this.users.some(user => user.username === username)) {
        return { success: false, message: '用户名已存在' };
      }
      
      // 创建新用户
      const newUser = {
        ...userSchema,
        id: generateId(),
        username,
        password: this.hashPassword(password),
        role: 'user', // 默认为普通用户
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`, // 随机头像
        registerDate: new Date(),
        lastLogin: new Date()
      };
      
      // 添加用户并保存
      this.users.push(newUser);
      this.saveUsers();
      
      // 自动登录新用户
      this.login(username, password);
      
      return { success: true, message: '注册成功', user: { ...newUser, password: undefined } };
    }
    
    // 用户登录
    login(username, password) {
      // 查找用户
      const user = this.users.find(user => user.username === username);
      
      if (!user) {
        return { success: false, message: '用户名或密码不正确' };
      }
      
      // 验证密码
      if (!this.verifyPassword(password, user.password)) {
        return { success: false, message: '用户名或密码不正确' };
      }
      
      // 更新最后登录时间
      user.lastLogin = new Date();
      this.saveUsers();
      
      // 创建会话
      const session = {
        ...sessionSchema,
        userId: user.id,
        username: user.username,
        role: user.role,
        loginTime: new Date().getTime(),
        expiresAt: new Date().getTime() + (7 * 24 * 60 * 60 * 1000) // 7天后过期
      };
      
      // 保存会话
      this.saveSession(session);
      
      return {
        success: true,
        message: '登录成功',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          avatar: user.avatar
        }
      };
    }
    
    // 管理员登录
    adminLogin(username, password) {
      // 首先尝试常规登录
      const result = this.login(username, password);
      
      if (!result.success) {
        return result;
      }
      
      // 检查是否是管理员
      if (result.user.role !== 'admin') {
        // 登出并返回错误
        this.logout();
        return { success: false, message: '非管理员账号' };
      }
      
      return result;
    }
    
    // 用户登出
    logout() {
      this.saveSession(null);
      return { success: true, message: '已登出' };
    }
    
    // 获取当前用户
    getCurrentUser() {
      if (!this.session) {
        return null;
      }
      
      const user = this.users.find(user => user.id === this.session.userId);
      
      if (!user) {
        // 会话无效，清除
        this.logout();
        return null;
      }
      
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      };
    }
    
    // 检查用户是否登录
    isLoggedIn() {
      return this.getCurrentUser() !== null;
    }
    
    // 检查当前用户是否是管理员
    isAdmin() {
      const user = this.getCurrentUser();
      return user && user.role === 'admin';
    }
    
    // 更改密码
    changePassword(userId, oldPassword, newPassword, confirmPassword) {
      // 参数验证
      if (!oldPassword || !newPassword || !confirmPassword) {
        return { success: false, message: '所有字段都是必填项' };
      }
      
      if (newPassword !== confirmPassword) {
        return { success: false, message: '两次输入的新密码不匹配' };
      }
      
      if (newPassword.length < 6) {
        return { success: false, message: '密码至少需要6个字符' };
      }
      
      // 查找用户
      const userIndex = this.users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
      }
      
      const user = this.users[userIndex];
      
      // 验证旧密码
      if (!this.verifyPassword(oldPassword, user.password)) {
        return { success: false, message: '旧密码不正确' };
      }
      
      // 更新密码
      this.users[userIndex].password = this.hashPassword(newPassword);
      this.saveUsers();
      
      return { success: true, message: '密码已更改' };
    }
    
    // 获取所有用户（管理员功能）
    getAllUsers() {
      if (!this.isAdmin()) {
        return { success: false, message: '无权限访问' };
      }
      
      // 返回用户列表，但不包含密码
      const userList = this.users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        registerDate: user.registerDate,
        lastLogin: user.lastLogin
      }));
      
      return { success: true, users: userList };
    }
    
    // 更改用户角色（管理员功能）
    changeUserRole(userId, newRole) {
      if (!this.isAdmin()) {
        return { success: false, message: '无权限访问' };
      }
      
      if (newRole !== 'user' && newRole !== 'admin') {
        return { success: false, message: '无效的角色' };
      }
      
      // 查找用户
      const userIndex = this.users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
      }
      
      // 禁止降级自己的权限
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId && newRole !== 'admin') {
        return { success: false, message: '不能降级自己的权限' };
      }
      
      // 更新角色
      this.users[userIndex].role = newRole;
      this.saveUsers();
      
      return { success: true, message: '用户角色已更改' };
    }
    
    // 删除用户（管理员功能）
    deleteUser(userId) {
      if (!this.isAdmin()) {
        return { success: false, message: '无权限访问' };
      }
      
      // 查找用户
      const userIndex = this.users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
      }
      
      // 禁止删除自己
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        return { success: false, message: '不能删除自己的账号' };
      }
      
      // 删除用户
      this.users.splice(userIndex, 1);
      this.saveUsers();
      
      return { success: true, message: '用户已删除' };
    }
  }
  
  // 返回公共接口
  return new AuthManager();
})();

// 在页面加载完成后初始化认证UI
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否有登录/注册按钮
  const navbarRight = document.querySelector('.navbar-nav.ms-auto');
  
  if (navbarRight) {
    // 更新导航栏用户状态
    updateNavbarUserStatus();
  }
  
  // 初始化登录表单
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // 检查是否是管理员登录表单
      const isAdminLogin = document.querySelector('.login-container') !== null;
      
      if (isAdminLogin) {
        // 管理员登录
        const result = window.AuthSystem.adminLogin(username, password);
        
        if (result.success) {
          // 显示管理页面
          document.getElementById('login-page').style.display = 'none';
          document.getElementById('admin-page').style.display = 'block';
        } else {
          alert(result.message);
        }
      } else {
        // 用户登录
        const result = window.AuthSystem.login(username, password);
        
        if (result.success) {
          // 关闭登录模态框
          if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) {
              loginModal.hide();
            }
          }
          
          // 更新用户状态
          updateNavbarUserStatus();
          
          // 刷新页面内容
          if (typeof refreshPageContent === 'function') {
            refreshPageContent();
          }
        } else {
          alert(result.message);
        }
      }
    });
  }
  
  // 初始化注册表单
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      const result = window.AuthSystem.register(username, password, confirmPassword);
      
      if (result.success) {
        // 关闭注册模态框
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
          if (registerModal) {
            registerModal.hide();
          }
        }
        
        // 更新用户状态
        updateNavbarUserStatus();
        
        // 刷新页面内容
        if (typeof refreshPageContent === 'function') {
          refreshPageContent();
        }
      } else {
        alert(result.message);
      }
    });
  }
  
  // 初始化退出按钮
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const result = window.AuthSystem.logout();
      
      if (result.success) {
        // 对于管理页面，返回登录页
        if (document.getElementById('admin-page')) {
          document.getElementById('admin-page').style.display = 'none';
          document.getElementById('login-page').style.display = 'block';
        } else {
          // 普通页面，更新用户状态
          updateNavbarUserStatus();
          
          // 重新加载页面或刷新内容
          if (typeof refreshPageContent === 'function') {
            refreshPageContent();
          } else {
            window.location.reload();
          }
        }
      }
    });
  }
  
  // 绑定注册切换按钮
  const switchToRegisterBtn = document.getElementById('switch-to-register');
  if (switchToRegisterBtn) {
    switchToRegisterBtn.addEventListener('click', function() {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) {
          loginModal.hide();
        }
        
        setTimeout(() => {
          const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
          registerModal.show();
        }, 500);
      }
    });
  }
  
  // 绑定登录切换按钮
  const switchToLoginBtn = document.getElementById('switch-to-login');
  if (switchToLoginBtn) {
    switchToLoginBtn.addEventListener('click', function() {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        if (registerModal) {
          registerModal.hide();
        }
        
        setTimeout(() => {
          const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
          loginModal.show();
        }, 500);
      }
    });
  }
});

// 更新导航栏用户状态
function updateNavbarUserStatus() {
  const navbarRight = document.querySelector('.navbar-nav.ms-auto');
  if (!navbarRight) return;
  
  const currentUser = window.AuthSystem.getCurrentUser();
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  
  if (currentUser) {
    // 用户已登录
    if (authButtons) authButtons.style.display = 'none';
    
    if (!userMenu) {
      // 创建用户菜单
      const userMenuHTML = `
        <li class="nav-item dropdown" id="user-menu">
          <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="${currentUser.avatar}" alt="${currentUser.username}" class="avatar rounded-circle me-2" width="24" height="24">
            <span>${currentUser.username}</span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a class="dropdown-item" href="#profile">个人资料</a></li>
            ${currentUser.role === 'admin' ? `<li><a class="dropdown-item" href="admin.html">管理后台</a></li>` : ''}
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logout-link">退出登录</a></li>
          </ul>
        </li>
      `;
      
      navbarRight.insertAdjacentHTML('beforeend', userMenuHTML);
      
      // 绑定退出登录事件
      document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        window.AuthSystem.logout();
        window.location.reload();
      });
    } else {
      userMenu.style.display = 'block';
      
      // 更新用户信息
      const avatar = userMenu.querySelector('.avatar');
      const usernameSpan = userMenu.querySelector('span');
      
      if (avatar && usernameSpan) {
        avatar.src = currentUser.avatar;
        avatar.alt = currentUser.username;
        usernameSpan.textContent = currentUser.username;
      }
      
      // 更新管理后台链接
      const adminLink = userMenu.querySelector('[href="admin.html"]');
      if (adminLink) {
        if (currentUser.role === 'admin') {
          adminLink.parentElement.style.display = 'block';
        } else {
          adminLink.parentElement.style.display = 'none';
        }
      }
    }
  } else {
    // 用户未登录
    if (userMenu) userMenu.style.display = 'none';
    
    if (!authButtons) {
      // 创建登录/注册按钮
      const authButtonsHTML = `
        <div class="d-flex" id="auth-buttons">
          <button type="button" class="btn btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
            登录
          </button>
          <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#registerModal">
            注册
          </button>
        </div>
      `;
      
      navbarRight.insertAdjacentHTML('beforeend', authButtonsHTML);
    } else {
      authButtons.style.display = 'flex';
    }
  }
}

// 显示认证模态框
function showAuthModal(type) {
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    if (type === 'login') {
      const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
      loginModal.show();
    } else if (type === 'register') {
      const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
      registerModal.show();
    }
  }
}

// 显示通用模态框
function showModal(title, message) {
  const modalElement = document.querySelector('#genericModal');
  if (modalElement) {
    const modalTitle = modalElement.querySelector('.modal-title');
    const modalBody = modalElement.querySelector('.modal-body');
    
    if (modalTitle && modalBody) {
      modalTitle.textContent = title;
      modalBody.textContent = message;
      
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  } else {
    alert(message);
  }
}

// 语法检查
try {
  console.log('Auth.js syntax check passed');
} catch (error) {
  console.error('Syntax error:', error.message);
}

// 函数验证
console.assert(typeof window.AuthSystem === 'object', 'AuthSystem is defined as global object');
console.assert(typeof updateNavbarUserStatus === 'function', 'updateNavbarUserStatus function exists');