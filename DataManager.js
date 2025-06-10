/**
 * 数据管理模块 - 统一管理admin和index页面的数据存储和读取
 */
const DataManager = {
  /**
   * 获取指定类型的所有数据
   * @param {string} type - 数据类型(carousels/gameIntro/characters/screenshots/announcements/siteSettings)
   * @return {Array|Object} - 返回请求的数据
   */
  getData(type) {
    const data = localStorage.getItem(type);
    return data ? JSON.parse(data) : (Array.isArray(this.getDefaultData(type)) ? [] : {});
  },
  
  /**
   * 获取默认数据结构
   * @param {string} type - 数据类型
   * @return {Array|Object} - 返回默认的数据结构
   */
  getDefaultData(type) {
    const defaults = {
      carousels: [],
      gameIntro: {
        title: "青空之恋",
        description: "一款充满青春气息的校园恋爱视觉小说",
        features: []
      },
      characters: [],
      screenshots: [],
      announcements: [],
      siteSettings: {
        siteName: "青空之恋",
        logo: "",
        contactEmail: "",
        socialLinks: {},
        copyright: "© 2023 青空之恋 版权所有"
      }
    };
    
    return defaults[type] || null;
  },
  
  /**
   * 保存数据
   * @param {string} type - 数据类型
   * @param {Array|Object} data - 要保存的数据
   */
  saveData(type, data) {
    localStorage.setItem(type, JSON.stringify(data));
    // 触发数据更新事件，用于通知可能打开的其他页面
    this.triggerDataUpdateEvent(type);
  },
  
  /**
   * 添加单个数据项
   * @param {string} type - 数据类型
   * @param {Object} item - 要添加的数据项
   * @returns {string} - 返回新创建项目的ID
   */
  addItem(type, item) {
    if (type === 'gameIntro' || type === 'siteSettings') {
      console.error('This method cannot be used for gameIntro or siteSettings');
      return null;
    }
    
    const data = this.getData(type);
    item.id = this.generateId();
    data.push(item);
    this.saveData(type, data);
    return item.id;
  },
  
  /**
   * 更新单个数据项
   * @param {string} type - 数据类型
   * @param {string} id - 数据项ID
   * @param {Object} newData - 新的数据
   * @returns {boolean} - 更新是否成功
   */
  updateItem(type, id, newData) {
    if (type === 'gameIntro' || type === 'siteSettings') {
      this.saveData(type, newData);
      return true;
    }
    
    const data = this.getData(type);
    const index = data.findIndex(item => item.id === id);
    
    if (index !== -1) {
      data[index] = { ...data[index], ...newData };
      this.saveData(type, data);
      return true;
    }
    return false;
  },
  
  /**
   * 删除单个数据项
   * @param {string} type - 数据类型
   * @param {string} id - 要删除的数据项ID
   * @returns {boolean} - 删除是否成功
   */
  deleteItem(type, id) {
    if (type === 'gameIntro' || type === 'siteSettings') {
      console.error('This method cannot be used for gameIntro or siteSettings');
      return false;
    }
    
    let data = this.getData(type);
    const originalLength = data.length;
    data = data.filter(item => item.id !== id);
    
    if (data.length !== originalLength) {
      this.saveData(type, data);
      return true;
    }
    return false;
  },
  
  /**
   * 生成唯一ID
   * @return {string} - 唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },
  
  /**
   * 触发数据更新事件
   * @param {string} type - 更新的数据类型
   */
  triggerDataUpdateEvent(type) {
    const event = new CustomEvent('dataUpdated', {
      detail: { type }
    });
    document.dispatchEvent(event);
  },
  
  /**
   * 监听数据更新事件
   * @param {Function} callback - 数据更新时的回调函数
   */
  listenForDataUpdates(callback) {
    document.addEventListener('dataUpdated', callback);
  },
  
  /**
   * 初始化默认数据(仅在首次使用时)
   */
  initializeDefaultData() {
    const dataTypes = ['carousels', 'gameIntro', 'characters', 'screenshots', 'announcements', 'siteSettings'];
    
    dataTypes.forEach(type => {
      if (localStorage.getItem(type) === null) {
        this.saveData(type, this.getDefaultData(type));
      }
    });
  },
  
  /**
   * 检查并迁移旧版数据格式到新格式
   */
  migrateData() {
    // 检查是否已迁移
    if (localStorage.getItem('dataMigrated') === 'true') {
      return;
    }
    
    // 迁移轮播图数据
    const oldCarouselData = localStorage.getItem('carouselData');
    if (oldCarouselData) {
      try {
        const oldData = JSON.parse(oldCarouselData);
        const newData = oldData.map(item => ({
          id: this.generateId(),
          image: item.image || '',
          title: item.title || '',
          description: item.description || '',
          link: item.link || ''
        }));
        this.saveData('carousels', newData);
      } catch (e) {
        console.error('迁移轮播图数据失败', e);
      }
    }
    
    // 迁移角色数据
    const oldCharacterData = localStorage.getItem('characterData');
    if (oldCharacterData) {
      try {
        const oldData = JSON.parse(oldCharacterData);
        const newData = oldData.map(item => ({
          id: this.generateId(),
          name: item.name || '',
          avatar: item.avatar || '',
          description: item.description || '',
          personality: item.personality || '',
          background: item.background || ''
        }));
        this.saveData('characters', newData);
      } catch (e) {
        console.error('迁移角色数据失败', e);
      }
    }
    
    // 迁移截图数据
    const oldScreenshotData = localStorage.getItem('screenshotData');
    if (oldScreenshotData) {
      try {
        const oldData = JSON.parse(oldScreenshotData);
        const newData = oldData.map(item => ({
          id: this.generateId(),
          image: item.image || '',
          caption: item.caption || '',
          category: item.category || ''
        }));
        this.saveData('screenshots', newData);
      } catch (e) {
        console.error('迁移截图数据失败', e);
      }
    }
    
    // 迁移公告数据
    const oldAnnouncementData = localStorage.getItem('announcementData');
    if (oldAnnouncementData) {
      try {
        const oldData = JSON.parse(oldAnnouncementData);
        const newData = oldData.map(item => ({
          id: this.generateId(),
          title: item.title || '',
          content: item.content || '',
          date: item.date || new Date().toISOString().split('T')[0],
          important: item.important || false
        }));
        this.saveData('announcements', newData);
      } catch (e) {
        console.error('迁移公告数据失败', e);
      }
    }
    
    // 迁移游戏介绍数据
    const oldGameIntroData = localStorage.getItem('gameIntroData');
    if (oldGameIntroData) {
      try {
        const oldData = JSON.parse(oldGameIntroData);
        const newData = {
          title: oldData.title || '青空之恋',
          description: oldData.description || '一款充满青春气息的校园恋爱视觉小说',
          features: oldData.features || []
        };
        this.saveData('gameIntro', newData);
      } catch (e) {
        console.error('迁移游戏介绍数据失败', e);
      }
    }
    
    // 迁移网站设置数据
    const oldSettingsData = localStorage.getItem('siteSettings');
    if (oldSettingsData) {
      try {
        const oldData = JSON.parse(oldSettingsData);
        this.saveData('siteSettings', oldData);
      } catch (e) {
        console.error('迁移网站设置数据失败', e);
      }
    }
    
    // 标记已完成迁移
    localStorage.setItem('dataMigrated', 'true');
  }
};

// 在页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  DataManager.migrateData(); // 先执行数据迁移
  DataManager.initializeDefaultData(); // 然后初始化默认数据
});

// 全局错误处理，防止JSON解析错误导致页面崩溃
window.addEventListener('error', (event) => {
  // 如果是JSON解析错误，可能是localStorage数据损坏
  if (event.message.includes('JSON')) {
    console.error('数据格式错误，可能需要重置数据', event);
    // 可以提供一个重置数据的功能
  }
});