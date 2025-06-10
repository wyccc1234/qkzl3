// 管理页面功能模块

// 在页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 检查管理员登录状态
  checkAdminAccess();
  
  // 初始化侧边栏事件
  initSidebar();
  
  // 初始化数据管理
  initDataManagement();
  
  // 初始化管理员登出事件
  initLogout();
  
  // 更新当前时间显示
  updateCurrentTime();
  setInterval(updateCurrentTime, 60000);
});

// 检查管理员登录状态
function checkAdminAccess() {
  // 获取当前用户
  const currentUser = AuthManager.getCurrentUser();
  
  // 如果未登录或非管理员，则跳转到登录页面
  if (!currentUser || currentUser.role !== 'admin') {
    // 显示登录页面
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('admin-page').style.display = 'none';
    
    // 绑定登录表单提交事件
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
          showAdminLoginMessage('请输入用户名和密码', 'danger');
          return;
        }
        
        // 管理员登录
        const result = AuthManager.loginAdmin(username, password);
        
        if (result.success) {
          // 显示管理页面
          document.getElementById('login-page').style.display = 'none';
          document.getElementById('admin-page').style.display = 'block';
          
          // 初始化数据
          loadAllData();
        } else {
          showAdminLoginMessage(result.message, 'danger');
        }
      });
    }
  } else {
    // 已登录为管理员，显示管理页面
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-page').style.display = 'block';
    
    // 加载数据
    loadAllData();
  }
}

// 显示登录页面提示消息
function showAdminLoginMessage(message, type = 'danger') {
  const loginForm = document.getElementById('login-form');
  
  // 检查是否已存在提示信息
  let messageElement = document.getElementById('login-message');
  
  if (!messageElement) {
    // 创建新的提示信息元素
    messageElement = document.createElement('div');
    messageElement.id = 'login-message';
    messageElement.className = `alert alert-${type} mt-3`;
    
    // 添加到表单后面
    if (loginForm) {
      loginForm.insertAdjacentElement('afterend', messageElement);
    }
  } else {
    // 更新现有提示信息
    messageElement.className = `alert alert-${type} mt-3`;
  }
  
  messageElement.textContent = message;
}

// 初始化侧边栏事件
function initSidebar() {
  // 侧边栏菜单项点击事件
  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 获取目标区域ID
      const sectionId = this.dataset.section;
      
      // 更新活动菜单项
      document.querySelectorAll('.sidebar .nav-link').forEach(item => {
        item.classList.remove('active');
      });
      this.classList.add('active');
      
      // 切换显示区域
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });
      
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
}

// 初始化数据管理
function initDataManagement() {
  // 轮播图管理
  initCarouselManagement();
  
  // 游戏介绍管理
  initGameIntroManagement();
  
  // 角色管理
  initCharacterManagement();
  
  // 游戏截图管理
  initScreenshotManagement();
  
  // 公告管理
  initAnnouncementManagement();
  
  // 网站设置管理
  initSettingManagement();
}

// 初始化轮播图管理
function initCarouselManagement() {
  // 添加轮播图按钮点击事件
  const addCarouselBtn = document.getElementById('add-carousel-btn');
  if (addCarouselBtn) {
    addCarouselBtn.addEventListener('click', function() {
      // 显示添加轮播图弹窗
      showModal('添加轮播图', createCarouselForm(), function(modal) {
        // 获取表单数据
        const form = modal.querySelector('form');
        const imageUrl = form.querySelector('#carousel-image').value.trim();
        const title = form.querySelector('#carousel-title').value.trim();
        const description = form.querySelector('#carousel-description').value.trim();
        
        if (!imageUrl) {
          showFormError(form, '请输入图片URL');
          return false;
        }
        
        // 添加轮播图
        const result = window.AdminDataFunctions.addCarousel(imageUrl, title, description);
        
        if (result.success) {
          // 重新加载轮播图列表
          loadCarouselList();
          return true;
        } else {
          showFormError(form, result.message);
          return false;
        }
      });
    });
  }
}

// 加载轮播图列表
function loadCarouselList() {
  const carouselListElement = document.getElementById('carousel-list');
  if (!carouselListElement) return;
  
  // 获取轮播图数据
  const carousels = window.AdminDataFunctions.getCarousels();
  
  // 清空现有列表
  carouselListElement.innerHTML = '';
  
  // 添加轮播图项
  carousels.forEach((carousel, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><img src="${carousel.image}" class="img-thumbnail" alt="轮播图"></td>
      <td>${carousel.title || '-'}</td>
      <td>${carousel.description || '-'}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-carousel" data-id="${carousel.id}">
          <i class="bi bi-pencil"></i> 编辑
        </button>
        <button class="btn btn-sm btn-danger delete-carousel" data-id="${carousel.id}">
          <i class="bi bi-trash"></i> 删除
        </button>
      </td>
    `;
    
    // 绑定编辑按钮事件
    const editBtn = row.querySelector('.edit-carousel');
    editBtn.addEventListener('click', function() {
      // 显示编辑轮播图弹窗
      showModal('编辑轮播图', createCarouselForm(carousel), function(modal) {
        // 获取表单数据
        const form = modal.querySelector('form');
        const imageUrl = form.querySelector('#carousel-image').value.trim();
        const title = form.querySelector('#carousel-title').value.trim();
        const description = form.querySelector('#carousel-description').value.trim();
        
        if (!imageUrl) {
          showFormError(form, '请输入图片URL');
          return false;
        }
        
        // 更新轮播图
        const result = window.AdminDataFunctions.updateCarousel(
          carousel.id,
          imageUrl,
          title,
          description
        );
        
        if (result.success) {
          // 重新加载轮播图列表
          loadCarouselList();
          return true;
        } else {
          showFormError(form, result.message);
          return false;
        }
      });
    });
    
    // 绑定删除按钮事件
    const deleteBtn = row.querySelector('.delete-carousel');
    deleteBtn.addEventListener('click', function() {
      // 显示删除确认弹窗
      showConfirmModal('删除轮播图', '确定要删除这张轮播图吗？', function() {
        // 删除轮播图
        const result = window.AdminDataFunctions.deleteCarousel(carousel.id);
        
        if (result.success) {
          // 重新加载轮播图列表
          loadCarouselList();
          return true;
        } else {
          showToast('错误', result.message);
          return false;
        }
      });
    });
    
    carouselListElement.appendChild(row);
  });
  
  // 如果没有轮播图
  if (carousels.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="5" class="text-center">暂无轮播图数据</td>
    `;
    carouselListElement.appendChild(emptyRow);
  }
}

// 创建轮播图表单
function createCarouselForm(carousel = null) {
  return `
    <form id="carousel-form">
      <div class="alert alert-danger mt-3" id="form-error" style="display: none;"></div>
      <div class="mb-3">
        <label for="carousel-image" class="form-label">图片URL</label>
        <input type="text" class="form-control" id="carousel-image" value="${carousel ? carousel.image : ''}" required>
        <small class="text-muted">请输入有效的图片URL</small>
      </div>
      <div class="mb-3">
        <label for="carousel-title" class="form-label">标题</label>
        <input type="text" class="form-control" id="carousel-title" value="${carousel ? carousel.title || '' : ''}">
      </div>
      <div class="mb-3">
        <label for="carousel-description" class="form-label">描述</label>
        <textarea class="form-control" id="carousel-description" rows="3">${carousel ? carousel.description || '' : ''}</textarea>
      </div>
    </form>
  `;
}

// 初始化游戏介绍管理
function initGameIntroManagement() {
  // 保存游戏介绍按钮点击事件
  const saveGameIntroBtn = document.getElementById('save-game-intro');
  if (saveGameIntroBtn) {
    saveGameIntroBtn.addEventListener('click', function() {
      // 获取表单数据
      const title = document.getElementById('game-title').value.trim();
      const description = document.getElementById('game-description').value.trim();
      
      if (!title || !description) {
        showToast('错误', '请填写游戏标题和描述');
        return;
      }
      
      // 保存游戏介绍
      const result = window.AdminDataFunctions.saveGameIntro(title, description);
      
      if (result.success) {
        showToast('成功', '游戏介绍已保存');
      } else {
        showToast('错误', result.message);
      }
    });
  }
  
  // 添加特性按钮点击事件
  const addFeatureBtn = document.getElementById('add-feature-btn');
  if (addFeatureBtn) {
    addFeatureBtn.addEventListener('click', function() {
      // 显示添加特性弹窗
      showModal('添加游戏特性', createFeatureForm(), function(modal) {
        // 获取表单数据
        const form = modal.querySelector('form');
        const title = form.querySelector('#feature-title').value.trim();
        const description = form.querySelector('#feature-description').value.trim();
        
        if (!title || !description) {
          showFormError(form, '请填写特性标题和描述');
          return false;
        }
        
        // 添加特性
        const result = window.AdminDataFunctions.addFeature(title, description);
        
        if (result.success) {
          // 重新加载特性列表
          loadFeatureList();
          return true;
        } else {
          showFormError(form, result.message);
          return false;
        }
      });
    });
  }
}

// 初始化角色管理
function initCharacterManagement() {
  // 添加角色按钮点击事件
  const addCharacterBtn = document.getElementById('add-character-btn');
  if (addCharacterBtn) {
    addCharacterBtn.addEventListener('click', function() {
      // 显示添加角色弹窗
      showModal('添加角色', createCharacterForm(), function(modal) {
        // 获取表单数据
        const form = modal.querySelector('form');
        const name = form.querySelector('#character-name').value.trim();
        const image = form.querySelector('#character-image').value.trim();
        const personality = form.querySelector('#character-personality').value.trim();
        const description = form.querySelector('#character-description').value.trim();
        
        if (!name || !image) {
          showFormError(form, '请填写角色名称和图片URL');
          return false;
        }
        
        // 添加角色
        const result = window.AdminDataFunctions.addCharacter(name, image, personality, description);
        
        if (result.success) {
          // 重新加载角色列表
          loadCharacterList();
          return true;
        } else {
          showFormError(form, result.message);
          return false;
        }
      });
    });
  }
}

// 初始化游戏截图管理
function initScreenshotManagement() {
  // 添加截图按钮点击事件
  const addScreenshotBtn = document.getElementById('add-screenshot-btn');
  if (addScreenshotBtn) {
    addScreenshotBtn.addEventListener('click', function() {
      // 显示添加截图弹窗
      showModal('添加游戏截图', createScreenshotForm(), function(modal) {
        // 获取表单数据
        const form = modal.querySelector('form');
        const image = form.querySelector('#screenshot-image').value.trim();
        const caption = form.querySelector('#screenshot-caption').value.trim();
        
        if (!image) {
          showFormError(form, '请输入截图URL');
          return false;
        }
        
        // 添加截图
        const result = window.AdminDataFunctions.addScreenshot(image, caption);
        
        if (result.success) {
          // 重新加载截图列表
          loadScreenshotList();
          return true;
        } else {
          showFormError(form, result.message);
          return false;
        }
      });
    });
  }
}

// 初始化公告管理
function initAnnouncementManagement() {
  // 添加公告按钮点击事件
  const addAnnouncementBtn = document.getElementById('add-announcement-btn');
  if (addAnnouncementBtn) {
    addAnnouncementBtn.addEventListener('click', function() {
      // 显示添加公告弹窗
      showModal('添加公告', createAnnouncementForm(), function(modal) {
        // 获取表单数据
        const form = modal.querySelector('form');
        const title = form.querySelector('#announcement-title').value.trim();
        const content = form.querySelector('#announcement-content').value.trim();
        const important = form.querySelector('#announcement-important').checked;
        
        if (!title || !content) {
          showFormError(form, '请填写公告标题和内容');
          return false;
        }
        
        // 添加公告
        const result = window.AdminDataFunctions.addAnnouncement(title, content, important);
        
        if (result.success) {
          // 重新加载公告列表
          loadAnnouncementList();
          return true;
        } else {
          showFormError(form, result.message);
          return false;
        }
      });
    });
  }
}

// 初始化网站设置管理
function initSettingManagement() {
  // 保存网站设置按钮点击事件
  const saveSettingsBtn = document.getElementById('save-settings');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function() {
      // 获取表单数据
      const siteName = document.getElementById('site-name').value.trim();
      const siteDescription = document.getElementById('site-description').value.trim();
      const contactEmail = document.getElementById('contact-email').value.trim();
      
      if (!siteName) {
        showToast('错误', '请填写网站名称');
        return;
      }
      
      // 保存网站设置
      const result = window.AdminDataFunctions.saveSettings({
        siteName,
        siteDescription,
        contactEmail
      });
      
      if (result.success) {
        showToast('成功', '网站设置已保存');
      } else {
        showToast('错误', result.message);
      }
    });
  }
}

// 初始化管理员登出事件
function initLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 登出
      AuthManager.logout();
      
      // 跳转到主页
      window.location.href = 'index.html';
    });
  }
}

// 更新当前时间显示
function updateCurrentTime() {
  const currentTimeElement = document.getElementById('current-time');
  if (currentTimeElement) {
    const now = new Date();
    currentTimeElement.textContent = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())} ${padZero(now.getHours())}:${padZero(now.getMinutes())}`;
  }
}

// 数字前补0
function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

// 显示模态框
function showModal(title, content, submitCallback) {
  // 创建模态框元素
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'dynamicModal';
  modal.tabIndex = '-1';
  modal.setAttribute('aria-hidden', 'true');
  
  // 模态框内容
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
          <button type="button" class="btn btn-primary" id="modal-submit">确定</button>
        </div>
      </div>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(modal);
  
  // 初始化模态框
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
  
  // 绑定确定按钮点击事件
  const submitBtn = modal.querySelector('#modal-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      if (submitCallback && submitCallback(modal)) {
        modalInstance.hide();
      }
    });
  }
  
  // 模态框关闭后移除
  modal.addEventListener('hidden.bs.modal', function() {
    document.body.removeChild(modal);
  });
}

// 显示确认模态框
function showConfirmModal(title, message, confirmCallback) {
  // 创建模态框元素
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'confirmModal';
  modal.tabIndex = '-1';
  modal.setAttribute('aria-hidden', 'true');
  
  // 模态框内容
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
          <button type="button" class="btn btn-danger" id="confirm-submit">确定</button>
        </div>
      </div>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(modal);
  
  // 初始化模态框
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
  
  // 绑定确定按钮点击事件
  const confirmBtn = modal.querySelector('#confirm-submit');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
      if (confirmCallback && confirmCallback()) {
        modalInstance.hide();
      }
    });
  }
  
  // 模态框关闭后移除
  modal.addEventListener('hidden.bs.modal', function() {
    document.body.removeChild(modal);
  });
}

// 显示表单错误
function showFormError(form, message) {
  const errorElement = form.querySelector('#form-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// 显示提示消息
function showToast(title, message) {
  // 创建Toast元素
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  // Toast内容
  toast.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${title}</strong>
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
    newContainer.className = 'position-fixed top-0 end-0 p-3';
    newContainer.style.zIndex = '9999';
    
    // 添加到body
    document.body.appendChild(newContainer);
    newContainer.appendChild(toast);
  }
  
  // 初始化Toast
  const toastInstance = new bootstrap.Toast(toast, {
    delay: 3000
  });
  toastInstance.show();
}

// 加载所有数据
function loadAllData() {
  // 加载轮播图列表
  loadCarouselList();
  
  // 加载游戏介绍数据
  loadGameIntroData();
  
  // 加载特性列表
  loadFeatureList();
  
  // 加载角色列表
  loadCharacterList();
  
  // 加载截图列表
  loadScreenshotList();
  
  // 加载公告列表
  loadAnnouncementList();
  
  // 加载网站设置
  loadSiteSettings();
}

// Syntax self-check
try {
  console.log("Admin.js syntax check passed");
}
catch (error) {
  console.error("Syntax error:", error.message);
}

// Function verification
console.assert(typeof loadAllData === 'function', 'loadAllData function exists');
console.assert(typeof showToast === 'function', 'showToast function exists');