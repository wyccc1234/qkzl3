/**
 * admin页面的数据处理函数
 * 基于通用DataManager模块封装admin特有功能
 */

// 轮播图管理相关函数
const CarouselManager = {
  // 获取所有轮播图数据
  getAllCarousels() {
    return DataManager.getData('carousels');
  },
  
  // 添加新轮播图
  addCarousel(carouselData) {
    return DataManager.addItem('carousels', carouselData);
  },
  
  // 更新轮播图
  updateCarousel(id, newData) {
    return DataManager.updateItem('carousels', id, newData);
  },
  
  // 删除轮播图
  deleteCarousel(id) {
    return DataManager.deleteItem('carousels', id);
  },
  
  // 渲染轮播图列表到DOM
  renderCarouselList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const carousels = this.getAllCarousels();
    
    // 清空容器
    container.innerHTML = '';
    
    if (carousels.length === 0) {
      container.innerHTML = '<tr><td colspan="5" class="text-center">暂无数据</td></tr>';
      return;
    }
    
    // 添加每个轮播图到列表
    carousels.forEach((carousel, index) => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${carousel.image}" alt="${carousel.title}" style="max-width: 100px;"></td>
        <td>${carousel.title}</td>
        <td>${carousel.description}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-carousel" data-id="${carousel.id}">编辑</button>
          <button class="btn btn-sm btn-danger delete-carousel" data-id="${carousel.id}">删除</button>
        </td>
      `;
      
      container.appendChild(row);
    });
    
    // 添加事件监听器
    this.addEventListeners(container);
  },
  
  // 为轮播图列表添加事件监听器
  addEventListeners(container) {
    // 编辑按钮点击事件
    const editButtons = container.querySelectorAll('.edit-carousel');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.showEditModal(id);
      });
    });
    
    // 删除按钮点击事件
    const deleteButtons = container.querySelectorAll('.delete-carousel');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (confirm('确定要删除这个轮播图吗？')) {
          this.deleteCarousel(id);
          this.renderCarouselList('carousel-list');
        }
      });
    });
  },
  
  // 显示编辑模态框
  showEditModal(id) {
    const carousel = this.getAllCarousels().find(item => item.id === id);
    if (!carousel) return;
    
    // 填充表单
    const form = document.getElementById('carousel-form');
    if (!form) return;
    
    const titleInput = form.querySelector('#carousel-title');
    const imageInput = form.querySelector('#carousel-image');
    const descriptionInput = form.querySelector('#carousel-description');
    const linkInput = form.querySelector('#carousel-link');
    const idInput = form.querySelector('#carousel-id');
    
    if (titleInput) titleInput.value = carousel.title;
    if (imageInput) imageInput.value = carousel.image;
    if (descriptionInput) descriptionInput.value = carousel.description;
    if (linkInput) linkInput.value = carousel.link || '';
    if (idInput) idInput.value = carousel.id;
    
    // 显示模态框
    const modal = document.getElementById('carousel-modal');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }
  },
  
  // 保存轮播图数据
  saveCarouselForm(form) {
    const titleInput = form.querySelector('#carousel-title');
    const imageInput = form.querySelector('#carousel-image');
    const descriptionInput = form.querySelector('#carousel-description');
    const linkInput = form.querySelector('#carousel-link');
    const idInput = form.querySelector('#carousel-id');
    
    const carouselData = {
      title: titleInput ? titleInput.value.trim() : '',
      image: imageInput ? imageInput.value.trim() : '',
      description: descriptionInput ? descriptionInput.value.trim() : '',
      link: linkInput ? linkInput.value.trim() : ''
    };
    
    // 验证数据
    if (!carouselData.title || !carouselData.image) {
      alert('标题和图片地址不能为空！');
      return false;
    }
    
    const id = idInput ? idInput.value : null;
    
    if (id) {
      // 更新现有轮播图
      this.updateCarousel(id, carouselData);
    } else {
      // 添加新轮播图
      this.addCarousel(carouselData);
    }
    
    return true;
  },
  
  // 清空表单
  clearForm(form) {
    const titleInput = form.querySelector('#carousel-title');
    const imageInput = form.querySelector('#carousel-image');
    const descriptionInput = form.querySelector('#carousel-description');
    const linkInput = form.querySelector('#carousel-link');
    const idInput = form.querySelector('#carousel-id');
    
    if (titleInput) titleInput.value = '';
    if (imageInput) imageInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (linkInput) linkInput.value = '';
    if (idInput) idInput.value = '';
  }
};

// 游戏介绍管理相关函数
const GameIntroManager = {
  // 获取游戏介绍数据
  getGameIntro() {
    return DataManager.getData('gameIntro');
  },
  
  // 更新游戏介绍数据
  updateGameIntro(newData) {
    return DataManager.updateItem('gameIntro', null, newData);
  },
  
  // 添加游戏特性
  addGameFeature(feature) {
    const gameIntro = this.getGameIntro();
    if (!gameIntro.features) {
      gameIntro.features = [];
    }
    
    feature.id = DataManager.generateId();
    gameIntro.features.push(feature);
    this.updateGameIntro(gameIntro);
    return feature.id;
  },
  
  // 更新游戏特性
  updateGameFeature(id, newData) {
    const gameIntro = this.getGameIntro();
    if (!gameIntro.features) return false;
    
    const index = gameIntro.features.findIndex(item => item.id === id);
    if (index !== -1) {
      gameIntro.features[index] = { ...gameIntro.features[index], ...newData };
      this.updateGameIntro(gameIntro);
      return true;
    }
    return false;
  },
  
  // 删除游戏特性
  deleteGameFeature(id) {
    const gameIntro = this.getGameIntro();
    if (!gameIntro.features) return false;
    
    const originalLength = gameIntro.features.length;
    gameIntro.features = gameIntro.features.filter(item => item.id !== id);
    
    if (gameIntro.features.length !== originalLength) {
      this.updateGameIntro(gameIntro);
      return true;
    }
    return false;
  },
  
  // 渲染游戏介绍表单
  renderGameIntroForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const gameIntro = this.getGameIntro();
    
    const titleInput = form.querySelector('#game-title');
    const descriptionInput = form.querySelector('#game-description');
    
    if (titleInput) titleInput.value = gameIntro.title || '';
    if (descriptionInput) descriptionInput.value = gameIntro.description || '';
  },
  
  // 渲染游戏特性列表
  renderGameFeatureList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const gameIntro = this.getGameIntro();
    const features = gameIntro.features || [];
    
    // 清空容器
    container.innerHTML = '';
    
    if (features.length === 0) {
      container.innerHTML = '<tr><td colspan="4" class="text-center">暂无数据</td></tr>';
      return;
    }
    
    // 添加每个特性到列表
    features.forEach((feature, index) => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${feature.title}</td>
        <td>${feature.description}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-feature" data-id="${feature.id}">编辑</button>
          <button class="btn btn-sm btn-danger delete-feature" data-id="${feature.id}">删除</button>
        </td>
      `;
      
      container.appendChild(row);
    });
    
    // 添加事件监听器
    this.addEventListeners(container);
  },
  
  // 为游戏特性列表添加事件监听器
  addEventListeners(container) {
    // 编辑按钮点击事件
    const editButtons = container.querySelectorAll('.edit-feature');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.showEditFeatureModal(id);
      });
    });
    
    // 删除按钮点击事件
    const deleteButtons = container.querySelectorAll('.delete-feature');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (confirm('确定要删除这个特性吗？')) {
          this.deleteGameFeature(id);
          this.renderGameFeatureList('feature-list');
        }
      });
    });
  },
  
  // 显示编辑特性模态框
  showEditFeatureModal(id) {
    const gameIntro = this.getGameIntro();
    const feature = gameIntro.features.find(item => item.id === id);
    if (!feature) return;
    
    // 填充表单
    const form = document.getElementById('feature-form');
    if (!form) return;
    
    const titleInput = form.querySelector('#feature-title');
    const descriptionInput = form.querySelector('#feature-description');
    const iconInput = form.querySelector('#feature-icon');
    const idInput = form.querySelector('#feature-id');
    
    if (titleInput) titleInput.value = feature.title;
    if (descriptionInput) descriptionInput.value = feature.description;
    if (iconInput) iconInput.value = feature.icon || '';
    if (idInput) idInput.value = feature.id;
    
    // 显示模态框
    const modal = document.getElementById('feature-modal');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }
  },
  
  // 保存游戏介绍表单
  saveGameIntroForm(form) {
    const titleInput = form.querySelector('#game-title');
    const descriptionInput = form.querySelector('#game-description');
    
    const gameIntroData = {
      ...this.getGameIntro(),
      title: titleInput ? titleInput.value.trim() : '青空之恋',
      description: descriptionInput ? descriptionInput.value.trim() : '一款充满青春气息的校园恋爱视觉小说'
    };
    
    // 验证数据
    if (!gameIntroData.title) {
      alert('游戏标题不能为空！');
      return false;
    }
    
    this.updateGameIntro(gameIntroData);
    return true;
  },
  
  // 保存特性表单
  saveFeatureForm(form) {
    const titleInput = form.querySelector('#feature-title');
    const descriptionInput = form.querySelector('#feature-description');
    const iconInput = form.querySelector('#feature-icon');
    const idInput = form.querySelector('#feature-id');
    
    const featureData = {
      title: titleInput ? titleInput.value.trim() : '',
      description: descriptionInput ? descriptionInput.value.trim() : '',
      icon: iconInput ? iconInput.value.trim() : ''
    };
    
    // 验证数据
    if (!featureData.title || !featureData.description) {
      alert('标题和描述不能为空！');
      return false;
    }
    
    const id = idInput ? idInput.value : null;
    
    if (id) {
      // 更新现有特性
      this.updateGameFeature(id, featureData);
    } else {
      // 添加新特性
      this.addGameFeature(featureData);
    }
    
    return true;
  },
  
  // 清空特性表单
  clearFeatureForm(form) {
    if (!form) return;
    
    const titleInput = form.querySelector('#feature-title');
    const descriptionInput = form.querySelector('#feature-description');
    const iconInput = form.querySelector('#feature-icon');
    const idInput = form.querySelector('#feature-id');
    
    if (titleInput) titleInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (iconInput) iconInput.value = '';
    if (idInput) idInput.value = '';
  }
};

// 角色管理相关函数
const CharacterManager = {
  // 获取所有角色数据
  getAllCharacters() {
    return DataManager.getData('characters');
  },
  
  // 添加新角色
  addCharacter(characterData) {
    return DataManager.addItem('characters', characterData);
  },
  
  // 更新角色
  updateCharacter(id, newData) {
    return DataManager.updateItem('characters', id, newData);
  },
  
  // 删除角色
  deleteCharacter(id) {
    return DataManager.deleteItem('characters', id);
  },
  
  // 渲染角色列表到DOM
  renderCharacterList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const characters = this.getAllCharacters();
    
    // 清空容器
    container.innerHTML = '';
    
    if (characters.length === 0) {
      container.innerHTML = '<tr><td colspan="6" class="text-center">暂无数据</td></tr>';
      return;
    }
    
    // 添加每个角色到列表
    characters.forEach((character, index) => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${character.avatar}" alt="${character.name}" style="max-width: 50px; max-height: 50px;"></td>
        <td>${character.name}</td>
        <td>${character.personality || '-'}</td>
        <td>${character.description.length > 50 ? character.description.substr(0, 50) + '...' : character.description}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-character" data-id="${character.id}">编辑</button>
          <button class="btn btn-sm btn-danger delete-character" data-id="${character.id}">删除</button>
        </td>
      `;
      
      container.appendChild(row);
    });
    
    // 添加事件监听器
    this.addEventListeners(container);
  },
  
  // 为角色列表添加事件监听器
  addEventListeners(container) {
    // 编辑按钮点击事件
    const editButtons = container.querySelectorAll('.edit-character');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.showEditModal(id);
      });
    });
    
    // 删除按钮点击事件
    const deleteButtons = container.querySelectorAll('.delete-character');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (confirm('确定要删除这个角色吗？')) {
          this.deleteCharacter(id);
          this.renderCharacterList('character-list');
        }
      });
    });
  },
  
  // 显示编辑模态框
  showEditModal(id) {
    const character = this.getAllCharacters().find(item => item.id === id);
    if (!character) return;
    
    // 填充表单
    const form = document.getElementById('character-form');
    if (!form) return;
    
    const nameInput = form.querySelector('#character-name');
    const avatarInput = form.querySelector('#character-avatar');
    const personalityInput = form.querySelector('#character-personality');
    const descriptionInput = form.querySelector('#character-description');
    const backgroundInput = form.querySelector('#character-background');
    const idInput = form.querySelector('#character-id');
    
    if (nameInput) nameInput.value = character.name;
    if (avatarInput) avatarInput.value = character.avatar;
    if (personalityInput) personalityInput.value = character.personality || '';
    if (descriptionInput) descriptionInput.value = character.description;
    if (backgroundInput) backgroundInput.value = character.background || '';
    if (idInput) idInput.value = character.id;
    
    // 显示模态框
    const modal = document.getElementById('character-modal');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }
  },
  
  // 保存角色表单
  saveCharacterForm(form) {
    const nameInput = form.querySelector('#character-name');
    const avatarInput = form.querySelector('#character-avatar');
    const personalityInput = form.querySelector('#character-personality');
    const descriptionInput = form.querySelector('#character-description');
    const backgroundInput = form.querySelector('#character-background');
    const idInput = form.querySelector('#character-id');
    
    const characterData = {
      name: nameInput ? nameInput.value.trim() : '',
      avatar: avatarInput ? avatarInput.value.trim() : '',
      personality: personalityInput ? personalityInput.value.trim() : '',
      description: descriptionInput ? descriptionInput.value.trim() : '',
      background: backgroundInput ? backgroundInput.value.trim() : ''
    };
    
    // 验证数据
    if (!characterData.name || !characterData.avatar || !characterData.description) {
      alert('姓名、头像和描述不能为空！');
      return false;
    }
    
    const id = idInput ? idInput.value : null;
    
    if (id) {
      // 更新现有角色
      this.updateCharacter(id, characterData);
    } else {
      // 添加新角色
      this.addCharacter(characterData);
    }
    
    return true;
  },
  
  // 清空角色表单
  clearCharacterForm(form) {
    if (!form) return;
    
    const nameInput = form.querySelector('#character-name');
    const avatarInput = form.querySelector('#character-avatar');
    const personalityInput = form.querySelector('#character-personality');
    const descriptionInput = form.querySelector('#character-description');
    const backgroundInput = form.querySelector('#character-background');
    const idInput = form.querySelector('#character-id');
    
    if (nameInput) nameInput.value = '';
    if (avatarInput) avatarInput.value = '';
    if (personalityInput) personalityInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (backgroundInput) backgroundInput.value = '';
    if (idInput) idInput.value = '';
  }
};

// 游戏截图管理相关函数
const ScreenshotManager = {
  // 获取所有截图数据
  getAllScreenshots() {
    return DataManager.getData('screenshots');
  },
  
  // 添加新截图
  addScreenshot(screenshotData) {
    return DataManager.addItem('screenshots', screenshotData);
  },
  
  // 更新截图
  updateScreenshot(id, newData) {
    return DataManager.updateItem('screenshots', id, newData);
  },
  
  // 删除截图
  deleteScreenshot(id) {
    return DataManager.deleteItem('screenshots', id);
  },
  
  // 渲染截图列表到DOM
  renderScreenshotList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const screenshots = this.getAllScreenshots();
    
    // 清空容器
    container.innerHTML = '';
    
    if (screenshots.length === 0) {
      container.innerHTML = '<tr><td colspan="5" class="text-center">暂无数据</td></tr>';
      return;
    }
    
    // 添加每个截图到列表
    screenshots.forEach((screenshot, index) => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${screenshot.image}" alt="${screenshot.caption}" style="max-width: 100px;"></td>
        <td>${screenshot.caption}</td>
        <td>${screenshot.category || '-'}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-screenshot" data-id="${screenshot.id}">编辑</button>
          <button class="btn btn-sm btn-danger delete-screenshot" data-id="${screenshot.id}">删除</button>
        </td>
      `;
      
      container.appendChild(row);
    });
    
    // 添加事件监听器
    this.addEventListeners(container);
  },
  
  // 为截图列表添加事件监听器
  addEventListeners(container) {
    // 编辑按钮点击事件
    const editButtons = container.querySelectorAll('.edit-screenshot');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.showEditModal(id);
      });
    });
    
    // 删除按钮点击事件
    const deleteButtons = container.querySelectorAll('.delete-screenshot');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (confirm('确定要删除这个截图吗？')) {
          this.deleteScreenshot(id);
          this.renderScreenshotList('screenshot-list');
        }
      });
    });
  },
  
  // 显示编辑模态框
  showEditModal(id) {
    const screenshot = this.getAllScreenshots().find(item => item.id === id);
    if (!screenshot) return;
    
    // 填充表单
    const form = document.getElementById('screenshot-form');
    if (!form) return;
    
    const imageInput = form.querySelector('#screenshot-image');
    const captionInput = form.querySelector('#screenshot-caption');
    const categoryInput = form.querySelector('#screenshot-category');
    const idInput = form.querySelector('#screenshot-id');
    
    if (imageInput) imageInput.value = screenshot.image;
    if (captionInput) captionInput.value = screenshot.caption;
    if (categoryInput) categoryInput.value = screenshot.category || '';
    if (idInput) idInput.value = screenshot.id;
    
    // 显示模态框
    const modal = document.getElementById('screenshot-modal');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }
  },
  
  // 保存截图表单
  saveScreenshotForm(form) {
    const imageInput = form.querySelector('#screenshot-image');
    const captionInput = form.querySelector('#screenshot-caption');
    const categoryInput = form.querySelector('#screenshot-category');
    const idInput = form.querySelector('#screenshot-id');
    
    const screenshotData = {
      image: imageInput ? imageInput.value.trim() : '',
      caption: captionInput ? captionInput.value.trim() : '',
      category: categoryInput ? categoryInput.value.trim() : ''
    };
    
    // 验证数据
    if (!screenshotData.image || !screenshotData.caption) {
      alert('图片地址和说明不能为空！');
      return false;
    }
    
    const id = idInput ? idInput.value : null;
    
    if (id) {
      // 更新现有截图
      this.updateScreenshot(id, screenshotData);
    } else {
      // 添加新截图
      this.addScreenshot(screenshotData);
    }
    
    return true;
  },
  
  // 清空截图表单
  clearScreenshotForm(form) {
    if (!form) return;
    
    const imageInput = form.querySelector('#screenshot-image');
    const captionInput = form.querySelector('#screenshot-caption');
    const categoryInput = form.querySelector('#screenshot-category');
    const idInput = form.querySelector('#screenshot-id');
    
    if (imageInput) imageInput.value = '';
    if (captionInput) captionInput.value = '';
    if (categoryInput) categoryInput.value = '';
    if (idInput) idInput.value = '';
  }
};

// 公告管理相关函数
const AnnouncementManager = {
  // 获取所有公告数据
  getAllAnnouncements() {
    return DataManager.getData('announcements');
  },
  
  // 添加新公告
  addAnnouncement(announcementData) {
    return DataManager.addItem('announcements', announcementData);
  },
  
  // 更新公告
  updateAnnouncement(id, newData) {
    return DataManager.updateItem('announcements', id, newData);
  },
  
  // 删除公告
  deleteAnnouncement(id) {
    return DataManager.deleteItem('announcements', id);
  },
  
  // 渲染公告列表到DOM
  renderAnnouncementList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const announcements = this.getAllAnnouncements();
    
    // 清空容器
    container.innerHTML = '';
    
    if (announcements.length === 0) {
      container.innerHTML = '<tr><td colspan="5" class="text-center">暂无数据</td></tr>';
      return;
    }
    
    // 按日期排序（最新的在前面）
    const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 添加每个公告到列表
    sortedAnnouncements.forEach((announcement, index) => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${announcement.title}</td>
        <td>${announcement.date}</td>
        <td>${announcement.important ? '<span class="badge bg-danger">重要</span>' : '<span class="badge bg-secondary">普通</span>'}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-announcement" data-id="${announcement.id}">编辑</button>
          <button class="btn btn-sm btn-danger delete-announcement" data-id="${announcement.id}">删除</button>
        </td>
      `;
      
      container.appendChild(row);
    });
    
    // 添加事件监听器
    this.addEventListeners(container);
  },
  
  // 为公告列表添加事件监听器
  addEventListeners(container) {
    // 编辑按钮点击事件
    const editButtons = container.querySelectorAll('.edit-announcement');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.showEditModal(id);
      });
    });
    
    // 删除按钮点击事件
    const deleteButtons = container.querySelectorAll('.delete-announcement');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (confirm('确定要删除这个公告吗？')) {
          this.deleteAnnouncement(id);
          this.renderAnnouncementList('announcement-list');
        }
      });
    });
  },
  
  // 显示编辑模态框
  showEditModal(id) {
    const announcement = this.getAllAnnouncements().find(item => item.id === id);
    if (!announcement) return;
    
    // 填充表单
    const form = document.getElementById('announcement-form');
    if (!form) return;
    
    const titleInput = form.querySelector('#announcement-title');
    const contentInput = form.querySelector('#announcement-content');
    const dateInput = form.querySelector('#announcement-date');
    const importantInput = form.querySelector('#announcement-important');
    const idInput = form.querySelector('#announcement-id');
    
    if (titleInput) titleInput.value = announcement.title;
    if (contentInput) contentInput.value = announcement.content;
    if (dateInput) dateInput.value = announcement.date;
    if (importantInput) importantInput.checked = announcement.important;
    if (idInput) idInput.value = announcement.id;
    
    // 显示模态框
    const modal = document.getElementById('announcement-modal');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }
  },
  
  // 保存公告表单
  saveAnnouncementForm(form) {
    const titleInput = form.querySelector('#announcement-title');
    const contentInput = form.querySelector('#announcement-content');
    const dateInput = form.querySelector('#announcement-date');
    const importantInput = form.querySelector('#announcement-important');
    const idInput = form.querySelector('#announcement-id');
    
    const announcementData = {
      title: titleInput ? titleInput.value.trim() : '',
      content: contentInput ? contentInput.value.trim() : '',
      date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
      important: importantInput ? importantInput.checked : false
    };
    
    // 验证数据
    if (!announcementData.title || !announcementData.content) {
      alert('标题和内容不能为空！');
      return false;
    }
    
    const id = idInput ? idInput.value : null;
    
    if (id) {
      // 更新现有公告
      this.updateAnnouncement(id, announcementData);
    } else {
      // 添加新公告
      this.addAnnouncement(announcementData);
    }
    
    return true;
  },
  
  // 清空公告表单
  clearAnnouncementForm(form) {
    if (!form) return;
    
    const titleInput = form.querySelector('#announcement-title');
    const contentInput = form.querySelector('#announcement-content');
    const dateInput = form.querySelector('#announcement-date');
    const importantInput = form.querySelector('#announcement-important');
    const idInput = form.querySelector('#announcement-id');
    
    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0]; // 设置为今天
    if (importantInput) importantInput.checked = false;
    if (idInput) idInput.value = '';
  }
};

// 网站设置管理相关函数
const SiteSettingsManager = {
  // 获取网站设置
  getSiteSettings() {
    return DataManager.getData('siteSettings');
  },
  
  // 更新网站设置
  updateSiteSettings(newSettings) {
    return DataManager.updateItem('siteSettings', null, newSettings);
  },
  
  // 渲染网站设置表单
  renderSiteSettingsForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const settings = this.getSiteSettings();
    
    const siteNameInput = form.querySelector('#site-name');
    const siteLogoInput = form.querySelector('#site-logo');
    const contactEmailInput = form.querySelector('#contact-email');
    const socialWeiboInput = form.querySelector('#social-weibo');
    const socialWechatInput = form.querySelector('#social-wechat');
    const socialQQInput = form.querySelector('#social-qq');
    const copyrightInput = form.querySelector('#copyright');
    
    if (siteNameInput) siteNameInput.value = settings.siteName || '青空之恋';
    if (siteLogoInput) siteLogoInput.value = settings.logo || '';
    if (contactEmailInput) contactEmailInput.value = settings.contactEmail || '';
    
    // 社交媒体链接
    if (settings.socialLinks) {
      if (socialWeiboInput) socialWeiboInput.value = settings.socialLinks.weibo || '';
      if (socialWechatInput) socialWechatInput.value = settings.socialLinks.wechat || '';
      if (socialQQInput) socialQQInput.value = settings.socialLinks.qq || '';
    }
    
    if (copyrightInput) copyrightInput.value = settings.copyright || '© 2023 青空之恋 版权所有';
  },
  
  // 保存网站设置表单
  saveSiteSettingsForm(form) {
    const siteNameInput = form.querySelector('#site-name');
    const siteLogoInput = form.querySelector('#site-logo');
    const contactEmailInput = form.querySelector('#contact-email');
    const socialWeiboInput = form.querySelector('#social-weibo');
    const socialWechatInput = form.querySelector('#social-wechat');
    const socialQQInput = form.querySelector('#social-qq');
    const copyrightInput = form.querySelector('#copyright');
    
    const settingsData = {
      siteName: siteNameInput ? siteNameInput.value.trim() : '青空之恋',
      logo: siteLogoInput ? siteLogoInput.value.trim() : '',
      contactEmail: contactEmailInput ? contactEmailInput.value.trim() : '',
      socialLinks: {
        weibo: socialWeiboInput ? socialWeiboInput.value.trim() : '',
        wechat: socialWechatInput ? socialWechatInput.value.trim() : '',
        qq: socialQQInput ? socialQQInput.value.trim() : ''
      },
      copyright: copyrightInput ? copyrightInput.value.trim() : '© 2023 青空之恋 版权所有'
    };
    
    // 验证数据
    if (!settingsData.siteName) {
      alert('网站名称不能为空！');
      return false;
    }
    
    this.updateSiteSettings(settingsData);
    return true;
  }
};