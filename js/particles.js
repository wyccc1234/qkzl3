/**
 * 鼠标粒子跟随效果
 * 为网站添加多彩的鼠标跟随粒子效果
 */
class ParticleEffect {
  constructor(options = {}) {
    // 默认配置
    this.options = {
      colors: ['#FFB6C1', '#87CEEB', '#DDA0DD', '#FFFACD', '#FFD700'], // 默认颜色：粉色、天蓝色、浅紫色、浅黄色、金色
      particleCount: 15, // 同时显示的粒子数量
      particleSize: {min: 2, max: 5}, // 粒子大小范围
      particleLife: {min: 800, max: 1500}, // 粒子生命周期(毫秒)
      speed: {min: 1, max: 3}, // 粒子移动速度
      angle: {min: 0, max: 360}, // 粒子移动角度范围
      ...options
    };
    
    // 粒子容器
    this.container = null;
    
    // 粒子数组
    this.particles = [];
    
    // 鼠标位置
    this.mouseX = 0;
    this.mouseY = 0;
    
    // 上次创建粒子的时间
    this.lastCreateTime = 0;
    
    // 创建间隔(毫秒)
    this.createInterval = 50;
    
    // 动画帧ID
    this.animationFrameId = null;
    
    // 是否正在运行
    this.isRunning = false;
    
    // 初始化
    this.init();
  }
  
  // 初始化
  init() {
    // 创建粒子容器
    this.createContainer();
    
    // 绑定事件
    this.bindEvents();
    
    // 开始动画
    this.start();
  }
  
  // 创建粒子容器
  createContainer() {
    // 检查是否已存在容器
    const existingContainer = document.getElementById('particle-container');
    if (existingContainer) {
      this.container = existingContainer;
      return;
    }
    
    // 创建新容器
    this.container = document.createElement('div');
    this.container.id = 'particle-container';
    
    // 设置容器样式
    Object.assign(this.container.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none', // 不阻止鼠标事件
      zIndex: 9999,
      overflow: 'hidden'
    });
    
    // 将容器添加到body
    document.body.appendChild(this.container);
  }
  
  // 绑定事件
  bindEvents() {
    // 监听鼠标移动事件
    document.addEventListener('mousemove', this.onMouseMove.bind(this), {
      passive: true
    });
    
    // 监听触摸移动事件
    document.addEventListener('touchmove', this.onTouchMove.bind(this), {
      passive: true
    });
    
    // 监听窗口大小变化事件
    window.addEventListener('resize', this.onResize.bind(this), {
      passive: true
    });
  }
  
  // 鼠标移动事件处理
  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    
    // 创建新粒子
    this.createParticle();
  }
  
  // 触摸移动事件处理
  onTouchMove(e) {
    if (e.touches.length > 0) {
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
      
      // 创建新粒子
      this.createParticle();
    }
  }
  
  // 窗口大小变化事件处理
  onResize() {
    // 清空所有粒子
    this.particles = [];
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
  
  // 创建粒子
  createParticle() {
    // 控制创建频率
    const now = Date.now();
    if (now - this.lastCreateTime < this.createInterval) return;
    this.lastCreateTime = now;
    
    // 限制粒子数量
    if (this.particles.length >= this.options.particleCount) {
      const oldestParticle = this.particles.shift();
      if (oldestParticle.element && this.container.contains(oldestParticle.element)) {
        this.container.removeChild(oldestParticle.element);
      }
    }
    
    // 随机属性
    const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
    const size = this.getRandomValue(this.options.particleSize);
    const life = this.getRandomValue(this.options.particleLife);
    const speed = this.getRandomValue(this.options.speed);
    const angle = this.getRandomValue(this.options.angle) * Math.PI / 180;
    const opacity = Math.random() * 0.5 + 0.5; // 0.5 - 1
    
    // 创建粒子元素
    const element = document.createElement('div');
    Object.assign(element.style, {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: '50%',
      opacity: opacity,
      top: `${this.mouseY}px`,
      left: `${this.mouseX}px`,
      transform: 'translate(-50%, -50%)',
      transition: `opacity ${life}ms ease-out`,
      boxShadow: `0 0 ${size}px ${color}` // 添加轻微的光晕效果
    });
    
    // 将粒子添加到容器
    this.container.appendChild(element);
    
    // 创建粒子对象
    const particle = {
      element,
      x: this.mouseX,
      y: this.mouseY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      timestamp: now,
      size
    };
    
    // 添加到粒子数组
    this.particles.push(particle);
    
    // 设置粒子淡出
    setTimeout(() => {
      element.style.opacity = '0';
      
      // 移除粒子
      setTimeout(() => {
        if (element.parentNode === this.container) {
          this.container.removeChild(element);
        }
        // 从粒子数组中移除
        const index = this.particles.indexOf(particle);
        if (index !== -1) {
          this.particles.splice(index, 1);
        }
      }, life);
    }, 10);
  }
  
  // 更新粒子位置
  updateParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // 更新元素位置
      if (particle.element) {
        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;
      }
    }
  }
  
  // 动画循环
  animate() {
    if (!this.isRunning) return;
    
    // 更新粒子
    this.updateParticles();
    
    // 请求下一帧
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }
  
  // 开始动画
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }
  
  // 暂停动画
  pause() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  // 销毁实例
  destroy() {
    // 停止动画
    this.pause();
    
    // 移除事件监听
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('resize', this.onResize);
    
    // 移除容器
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // 清空粒子数组
    this.particles = [];
  }
  
  // 获取随机值
  getRandomValue(option) {
    if (typeof option === 'object') {
      return Math.random() * (option.max - option.min) + option.min;
    }
    return option;
  }
}

// 页面加载完成后初始化粒子效果
document.addEventListener('DOMContentLoaded', function() {
  // 创建粒子效果实例
  const particleEffect = new ParticleEffect({
    colors: ['#FFB6C1', '#87CEEB', '#DDA0DD', '#FFFACD', '#FFD700'],
    particleCount: 20
  });
  
  // 暴露给全局
  window.particleEffect = particleEffect;
});

// Syntax self-check
try {
  console.log("Particles.js syntax check passed");
}
catch (error) {
  console.error("Syntax error:", error.message);
}

// Function verification
console.assert(typeof ParticleEffect === 'function', 'ParticleEffect class exists');
console.assert(ParticleEffect.prototype.createParticle instanceof Function, 'createParticle method exists');