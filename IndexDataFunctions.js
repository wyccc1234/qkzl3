/**
 * index页面的数据展示函数
 * 基于通用DataManager模块封装前端展示功能
 */

// 轮播图展示相关函数
const CarouselDisplay = {
  // 渲染轮播图到DOM
  renderCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const carousels = DataManager.getData('carousels');
    if (!carousels || carousels.length === 0) {
      container.innerHTML = '<div class="carousel-item active"><div class="placeholder-image">暂无轮播图</div></div>';
      return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建轮播项
    carousels.forEach((carousel, index) => {
      const item = document.createElement('div');
      item.className = `carousel-item${index === 0 ? ' active' : ''}`;
      
      const content = `
        <img src="${carousel.image}" class="d-block w-100" alt="${carousel.title}">
        <div class="carousel-caption d-none d-md-block">
          <h5>${carousel.title}</h5>
          <p>${carousel.description}</p>
          ${carousel.link ? `<a href="${carousel.link}" class="btn btn-primary">了解更多</a>` : ''}
        </div>
      `;
      
      item.innerHTML = content;
      container.appendChild(item);
    });
    
    // 创建指示器
    const indicators = document.querySelector(`#${containerId.replace('Inner', 'Indicators')}`);
    if (indicators) {
      indicators.innerHTML = '';
      
      carousels.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.setAttribute('data-bs-target', `#${containerId.replace('Inner', '')}`);
        indicator.setAttribute('data-bs-slide-to', index);
        if (index === 0) {
          indicator.className = 'active';
          indicator.setAttribute('aria-current', 'true');
        }
        indicator.setAttribute('aria-label', `Slide ${index + 1}`);
        
        indicators.appendChild(indicator);
      });
    }
  }
};

// 游戏介绍展示相关函数
const GameIntroDisplay = {
  // 渲染游戏介绍到DOM
  renderGameIntro(titleId, descriptionId, featuresContainerId) {
    const titleElement = document.getElementById(titleId);
    const descriptionElement = document.getElementById(descriptionId);
    const featuresContainer = document.getElementById(featuresContainerId);
    
    const gameIntro = DataManager.getData('gameIntro');
    if (!gameIntro) return;
    
    // 设置标题和描述
    if (titleElement) titleElement.textContent = gameIntro.title || '青空之恋';
    if (descriptionElement) descriptionElement.textContent = gameIntro.description || '一款充满青春气息的校园恋爱视觉小说';
    
    // 渲染特性
    if (featuresContainer) {
      featuresContainer.innerHTML = '';
      
      const features = gameIntro.features || [];
      if (features.length === 0) {
        featuresContainer.innerHTML = '<div class="col-12 text-center">暂无特性数据</div>';
        return;
      }
      
      features.forEach(feature => {
        const featureElement = document.createElement('div');
        featureElement.className = 'col-md-4 mb-4';
        
        featureElement.innerHTML = `
          <div class="feature-box text-center">
            ${feature.icon ? `<div class="feature-icon mb-3"><i class="${feature.icon}"></i></div>` : ''}
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
          </div>
        `;
        
        featuresContainer.appendChild(featureElement);
      });
    }
  }
};

// 角色展示相关函数
const CharacterDisplay = {
  // 渲染角色到DOM
  renderCharacters(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const characters = DataManager.getData('characters');
    if (!characters || characters.length === 0) {
      container.innerHTML = '<div class="col-12 text-center">暂无角色数据</div>';
      return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 添加每个角色到列表
    characters.forEach(character => {
      const characterElement = document.createElement('div');
      characterElement.className = 'col-md-4 mb-4';
      
      characterElement.innerHTML = `
        <div class="character-card">
          <div class="character-image">
            <img src="${character.avatar}" alt="${character.name}" class="img-fluid">
          </div>
          <div class="character-info">
            <h3>${character.name}</h3>
            <p class="personality">${character.personality || ''}</p>
            <p class="description">${character.description}</p>
            ${character.background ? `<p class="background">${character.background}</p>` : ''}
          </div>
        </div>
      `;
      
      container.appendChild(characterElement);
    });
  }
};

// 游戏截图展示相关函数
const ScreenshotDisplay = {
  // 渲染游戏截图到DOM
  renderScreenshots(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const screenshots = DataManager.getData('screenshots');
    if (!screenshots || screenshots.length === 0) {
      container.innerHTML = '<div class="col-12 text-center">暂无截图数据</div>';
      return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 添加每个截图到列表
    screenshots.forEach(screenshot => {
      const screenshotElement = document.createElement('div');
      screenshotElement.className = 'col-md-4 mb-4';
      
      screenshotElement.innerHTML = `
        <div class="screenshot-item">
          <a href="${screenshot.image}" data-fancybox="gallery" data-caption="${screenshot.caption}">
            <img src="${screenshot.image}" alt="${screenshot.caption}" class="img-fluid">
          </a>
          <p class="caption">${screenshot.caption}</p>
        </div>
      `;
      
      container.appendChild(screenshotElement);
    });
  }
};

// 公告展示相关函数
const AnnouncementDisplay = {
  // 渲染公告到DOM
  renderAnnouncements(containerId, limit = 0) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let announcements = DataManager.getData('announcements');
    if (!announcements || announcements.length === 0) {
      container.innerHTML = '<div class="announcement-empty">暂无公告</div>';
      return;
    }
    
    // 按日期排序（最新的在前面）
    announcements = announcements.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 如果设置了限制，则只显示指定数量的公告
    if (limit > 0) {
      announcements = announcements.slice(0, limit);
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 添加每个公告到列表
    announcements.forEach(announcement => {
      const announcementElement = document.createElement('div');
      announcementElement.className = `announcement-item${announcement.important ? ' important' : ''}`;
      
      announcementElement.innerHTML = `
        <div class="announcement-date">${announcement.date}</div>
        <h4 class="announcement-title">${announcement.title}</h4>
        <div class="announcement-content">${announcement.content}</div>
      `;
      
      container.appendChild(announcementElement);
    });
  }
};

// 网站设置展示相关函数
const SiteSettingsDisplay = {
  // 渲染网站设置到DOM
  applySiteSettings() {
    const settings = DataManager.getData('siteSettings');
    if (!settings) return;
    
    // 设置网站标题
    document.title = settings.siteName || '青空之恋';
    
    // 设置Logo
    const logoElements = document.querySelectorAll('.site-logo');
    logoElements.forEach(el => {
      if (settings.logo) {
        // 如果元素是图片
        if (el.tagName === 'IMG') {
          el.src = settings.logo;
          el.alt = settings.siteName;
        } 
        // 如果是其他元素，可能需要作为背景图
        else {
          el.style.backgroundImage = `url(${settings.logo})`;
        }
      }
    });
    
    // 设置网站名称
    const siteNameElements = document.querySelectorAll('.site-name');
    siteNameElements.forEach(el => {
      el.textContent = settings.siteName || '青空之恋';
    });
    
    // 设置联系邮箱
    const contactEmailElements = document.querySelectorAll('.contact-email');
    contactEmailElements.forEach(el => {
      if (settings.contactEmail) {
        if (el.tagName === 'A') {
          el.href = `mailto:${settings.contactEmail}`;
          el.textContent = settings.contactEmail;
        } else {
          el.textContent = settings.contactEmail;
        }
      }
    });
    
    // 设置版权信息
    const copyrightElement = document.getElementById('copyright');
    if (copyrightElement) {
      copyrightElement.textContent = settings.copyright || '© 2023 青空之恋 版权所有';
    }
    
    // 设置社交媒体链接
    if (settings.socialLinks) {
      // 微博
      const weiboLink = document.getElementById('social-weibo-link');
      if (weiboLink && settings.socialLinks.weibo) {
        weiboLink.href = settings.socialLinks.weibo;
      }
      
      // 微信
      const wechatLink = document.getElementById('social-wechat-link');
      if (wechatLink && settings.socialLinks.wechat) {
        wechatLink.href = settings.socialLinks.wechat;
      }
      
      // QQ
      const qqLink = document.getElementById('social-qq-link');
      if (qqLink && settings.socialLinks.qq) {
        qqLink.href = settings.socialLinks.qq;
      }
    }
  }
};