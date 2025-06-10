/**
 * 数据同步管理器 - 负责初始化index页面的数据并处理实时更新
 */
const DataSyncManager = {
  // 初始化所有页面数据
  initializePageData() {
    // 应用网站设置
    SiteSettingsDisplay.applySiteSettings();
    
    // 渲染轮播图
    CarouselDisplay.renderCarousel('carouselInner');
    
    // 渲染游戏介绍
    GameIntroDisplay.renderGameIntro('game-title', 'game-description', 'game-features');
    
    // 渲染角色列表
    CharacterDisplay.renderCharacters('character-list');
    
    // 渲染游戏截图
    ScreenshotDisplay.renderScreenshots('screenshot-list');
    
    // 渲染公告列表 (展示最新的3条)
    AnnouncementDisplay.renderAnnouncements('announcement-list', 3);
    
    // 监听数据更新事件，实现实时更新
    this.listenForDataUpdates();
  },
  
  // 监听数据更新事件
  listenForDataUpdates() {
    DataManager.listenForDataUpdates((event) => {
      const { type } = event.detail;
      
      // 根据更新的数据类型，刷新对应的UI
      switch (type) {
        case 'carousels':
          CarouselDisplay.renderCarousel('carouselInner');
          break;
          
        case 'gameIntro':
          GameIntroDisplay.renderGameIntro('game-title', 'game-description', 'game-features');
          break;
          
        case 'characters':
          CharacterDisplay.renderCharacters('character-list');
          break;
          
        case 'screenshots':
          ScreenshotDisplay.renderScreenshots('screenshot-list');
          break;
          
        case 'announcements':
          AnnouncementDisplay.renderAnnouncements('announcement-list', 3);
          break;
          
        case 'siteSettings':
          SiteSettingsDisplay.applySiteSettings();
          break;
      }
    });
  }
};

// 页面加载时初始化数据
document.addEventListener('DOMContentLoaded', () => {
  // 初始化所有数据显示
  DataSyncManager.initializePageData();
});