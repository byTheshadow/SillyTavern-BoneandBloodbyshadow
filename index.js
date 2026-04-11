// ============================================
// 🦴 骨与血 (Bone & Blood) v6.0
// SillyTavern 沉浸式风味增强与记忆手账插件
// By SHADOW<安息之影> © 2026
// ============================================

import { extension_settings, getContext } from '../../../extensions.js';
import { saveSettingsDebounced, eventSource, event_types } from '../../../../script.js';

const EXTENSION_NAME = 'third-party/SillyTavern-BoneandBloodbyshadow';

// ============================================
// 风格预设
// ============================================

const STYLE_PRESETS = {
  modern: {
    home: '🏠 主页',
    scrapbook: '🌟 唱片机',
    diary: '📖 日记本',
    npc: '🧑‍🤝‍🧑 情报站',
    weather: '☁️ 环境雷达',
    vibe: '❤️ 氛围心电图',
    parallel: '🦋 平行宇宙',
    fate: '🎲 命运盘',
    ooc: '💬 破墙聊天室',
    world: '📻 世界频段',
    achievements: '🏆 成就殿堂',
  },
  ancient: {
    home: '🏮 归处',
    scrapbook: '📜拾遗录',
    diary: '🖋️ 手札',
    npc: '👤 人物志',
    weather: '🌸 时节录',
    vibe: '💭 心境图',
    parallel: '🌀镜花水月',
    fate: '🎴卦象台',
    ooc: '💌 私语阁',
    world: '📰 江湖传闻',
    achievements: '🎖️ 功绩榜',
  },
  gothic: {
    home: '🕯️ 庭院',
    scrapbook: '🦴 骸骨之语',
    diary: '🩸 血迹手记',
    npc: '👻 幽影名录',
    weather: '⚰️ 天气',
    vibe: '🕷️ 血脉共鸣',
    parallel: '🌑 暗面分支',
    fate: '🗡️ 命运之骰',
    ooc: '🚪 破界密室',
    world: '📡亡者电台',
    achievements: '💀 死亡勋章',
  },
};

// ============================================
// 布局预设 (v6.0 新增)
// ============================================

const LAYOUT_PRESETS = {
  listen: {
    name: '🎧 一起听',
    desc: '仿音乐社交风格，头像+气泡+电台',
  },
  card: {
    name: '🃏 卡片流',
    desc: '模块化卡片网格布局',
  },
  terminal: {
    name: '💻 终端',
    desc: '复古终端/命令行风格',
  },
  magazine: {
    name: '📰 杂志',
    desc: '杂志排版风格，大图+文字',
  },
};

// ============================================
// 默认设置
// ============================================

const defaultSettings = {
  enabled: true,
  api_base: '',
  api_key: '',
  api_model: '',
  auto_diary_enabled: true,
  diary_trigger_count: 30,
  message_counter: 0,
  
  // v0.4.0 新增
  style_preset: 'gothic',  // modern|ancient|gothic|custom
  custom_names: {},
  
  // v6.0 新增：布局
  layout_preset: 'listen', // listen|card|terminal|magazine
  
  // v6.0 新增：生图API
  img_api_type: 'novelai',  // novelai|stablediffusion|dalle|custom
  img_api_base: '',
  img_api_key: '',
  img_api_model: '',
  img_generated: [], // 生成的图片列表
  
  prompt_presets: [
    {
      name: '默认预设',
      global: '请用简洁、有情感张力的叙事风格回应。避免过度说教和空洞抒情。',
      prompts: {
        diary: '根据以下对话，以角色第一人称写一篇简短日记（100-200字）。带有时间感和情感细节。',
        summary: '用简洁的故事进度总结风格，概括主要事件、关系变化、未解决的线索（100-150字）。',
        weather: '推断当前场景的环境信息：时间、天气、地点、氛围（50-100字）。',
        vibe: '分析对话的情感氛围和关系状态。用诗意短评（50-100字），包含情感基调、张力指数（1-10）、关键词。',
        npc: '描述NPC当前状态：外貌、情绪、行为动向、与主角关系（80-150字）。',
        fate: '生成一个突发随机事件（可好可坏可离谱），简短有力（50-100字），可直接融入RP，带戏剧性。',
        butterfly: '基于用户选择的消息，生成一个平行宇宙分支剧情（150-300字）。风格应与原对话一致但走向不同。',
        ooc: '你作为角色扮演者，与用户进行OOC（脱离角色）沟通。用户会和你讨论剧情、角色塑造等元层面问题。诚恳、专业地回应。如果用户只是闲聊，以角色身份但不在RP状态下自然回应。',
        world: '根据当前剧情背景，生成1-2条世界背景"噪音"信息（路人八卦/新闻/世界观彩蛋），每条30-50字。',
      },
      blacklist: [],
    }
  ],
  active_preset: 0,
  
  // v6.0 新增：破墙聊天室独立预设
  ooc_presets: [
    {
      name: '默认OOC预设',
      system_prompt: '你作为角色扮演者，与用户进行OOC（脱离角色）沟通。用户会和你讨论剧情、角色塑造等元层面问题。诚恳、专业地回应。如果用户只是闲聊，以角色身份但不在RP状态下自然回应。',
      tone: 'warm', // warm|professional|casual|roleplay
      extra_context: '',}
  ],
  active_ooc_preset: 0,
  
  custom_css: '',
};

// ============================================
// 运行时数据
// ============================================

let pluginData = {
  records_bone: [],
  diary_blood: [],
  summaries: [],
  weather: '',
  npc_status: {},
  chaos_event: '',
  vibe: '',
  parallel_universes: [],
  
  // v0.4.0 新增
  home_config: {
    user_avatar: '',
    char_avatar: '',
    link_emoji: '💕',
    user_bubble: '今天也要开心鸭~',
    char_bubble: '嗯，一起加油！',
    radio_text: '骨与血电台',
  },
  
  fate_history: [],
  world_feed: [],
  achievements: [],
  ooc_chat: [],
  
  // v6.0 新增：生成的图片
  generated_images: [],
};

let butterflySession = {
  active: false,
  originFloor: null,
  originText: '',
  history: [],
};

let oocSession = {
  active: false,
  history: [],
};
// ============================================
// 移动端入口注入
// ============================================

/**
 * 创建移动端悬浮球（备用入口）
 */
function createMobileFloatingButton() {
  // 检测是否为移动设备或窄屏
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isNarrowScreen = window.innerWidth <= 768;
  
  if (!isMobile && !isNarrowScreen) {
    $('#bb-mobile-float').remove();
    return; // 桌面宽屏不显示
  }
  
  // 避免重复创建
  if ($('#bb-mobile-float').length > 0) return;
  
  const $float = $(`
    <div id="bb-mobile-float" title="打开骨与血面板">🦴
    </div>
  `);
  
  $('body').append($float);
  
  // 点击打开主面板
  $float.on('click', function(e) {
    e.stopPropagation();
    $('#bb-main-button').click(); // 触发原有按钮逻辑
  });
  
  // 拖拽功能
  let isDragging = false;
  let hasMoved = false;
  let startX, startY, startLeft, startTop;
  
  $float.on('touchstart mousedown', function(e) {
    isDragging = true;
    hasMoved = false;
    const touch = e.type === 'touchstart' ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    startLeft = parseInt($float.css('right')) || 20;
    startTop = parseInt($float.css('bottom')) || 80;
    e.preventDefault();
  });
  
  $(document).on('touchmove.bbfloat mousemove.bbfloat', function(e) {
    if (!isDragging) return;
    
    const touch = e.type === 'touchmove' ? e.touches[0] : e;
    const deltaX = touch.clientX - startX;
    const deltaY = -(touch.clientY - startY); // 反向，因为是bottom定位
    
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true;
    }
    
    $float.css({
      right: Math.max(10, Math.min(window.innerWidth - 66, startLeft - deltaX)) + 'px',
      bottom: Math.max(70, Math.min(window.innerHeight - 66, startTop + deltaY)) + 'px'
    });
  });
  
  $(document).on('touchend.bbfloat mouseup.bbfloat', function() {
    if (isDragging) {
      isDragging = false;
      
      if (hasMoved) {
        //吸附到左右边缘
        const currentRight = parseInt($float.css('right'));
        const screenWidth = $(window).width();
        
        if (currentRight > screenWidth / 2 - 28) {
          $float.css('right', '20px');
        } else {
          $float.css('right', (screenWidth - 76) + 'px');
        }
        
        // 保存位置
        localStorage.setItem('bb_float_position', JSON.stringify({
          right: $float.css('right'),
          bottom: $float.css('bottom')
        }));
      }}
  });
  
  // 恢复上次位置
  try {
    const savedPos = localStorage.getItem('bb_float_position');
    if (savedPos) {
      const pos = JSON.parse(savedPos);
      $float.css(pos);
    }
  } catch(e) {
    console.warn('[骨与血] 恢复悬浮球位置失败:', e);
  }
  
  console.log('[骨与血]📱 移动端悬浮球已创建');
}

/**
 * 注入到SillyTavern 移动端菜单（主入口）
 */
function injectToMobileMenu() {
  //尝试多种可能的移动端菜单容器
  const menuSelectors = [
    '#top-settings-holder',          // 顶部设置区域
    '#extensionsMenu',                // 扩展菜单
    '#bg_menu_content',               // 背景菜单
    '#right-nav-panel',               // 右侧导航
    '.drawer-content',                // 抽屉式菜单
    '#rm_button_panel',               // 角色管理按钮面板
    '#top-bar .menu_button'           // 顶栏菜单按钮
  ];
  
  let injected = false;
  
  // 遍历查找可用的菜单容器
  for (const selector of menuSelectors) {
    const $menu = $(selector);
    if ($menu.length > 0 && $('#bb-mobile-menu-item').length === 0) {
      // 根据不同菜单结构创建不同样式的菜单项
      let $menuItem;
      
      if (selector.includes('top-bar') || selector.includes('top-settings')) {
        // 顶栏样式
        $menuItem = $(`
          <div id="bb-mobile-menu-item" class="inline-drawer-toggle" title="骨与血">
            <div class="fa-solid fa-bone"></div>
          </div>
        `);
      } else if (selector.includes('extensionsMenu')) {
        // 扩展菜单样式
        $menuItem = $(`
          <div id="bb-mobile-menu-item" class="extensions_menu_button menu_button">
            <i class="fa-solid fa-bone"></i>
            <span>骨与血</span>
          </div>
        `);
      } else {
        // 通用列表样式
        $menuItem = $(`
          <div id="bb-mobile-menu-item" class="list-group-item flex-container flexGap5">
            <div class="fa-solid fa-bone"></div>
            <span>骨与血</span>
          </div>
        `);
      }
      
      //绑定点击事件
      $menuItem.on('click', function(e) {
        e.stopPropagation();
        
        // 触发原有主按钮
        $('#bb-main-button').click();
        
        // 尝试关闭移动端菜单
        setTimeout(() => {
          $('.drawer-toggle:visible, #drawer-toggle:visible').click();
          $('.inline-drawer-content.opened').removeClass('opened');
        }, 100);
      });
      
      // 注入到菜单
      if (selector.includes('top-bar')) {
        $menu.parent().prepend($menuItem); // 顶栏放前面
      } else {
        $menu.append($menuItem); // 其他放后面
      }
      
      injected = true;
      console.log(`[骨与血] 📱 已注入到移动端菜单: ${selector}`);
      break;
    }
  }
  
  if (!injected) {
    console.log('[骨与血] ⚠️ 未找到移动端菜单，仅使用悬浮球');
  }
  return injected;
}

/**
 * 综合移动端入口初始化
 */
function initMobileEntrance() {
  // 1. 先尝试注入到原生菜单
  const menuInjected = injectToMobileMenu();
  
  // 2. 创建悬浮球（作为备用或补充）
  createMobileFloatingButton();
  
  // 3. 监听窗口大小变化
  let resizeTimer;
  $(window).on('resize.bbmobile', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      createMobileFloatingButton();
      // 重新检查菜单注入（可能切换了视图）
      if (!menuInjected) {
        injectToMobileMenu();
      }
    }, 300);
  });
  
  console.log('[骨与血]✅ 移动端入口初始化完成');
}

/**
 * Debounce 工具函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// 入口
// ============================================

jQuery(async () => {
  console.log('[骨与血]🦴 v6.0 开始加载...');

  // 1. 初始化设置
  if (!extension_settings[EXTENSION_NAME]) {
    extension_settings[EXTENSION_NAME] = {};
  }
  extension_settings[EXTENSION_NAME] = Object.assign(
    {},
    defaultSettings,
    extension_settings[EXTENSION_NAME],);

  // 2. 注入设置面板
  $('#extensions_settings').append(buildSettingsPanelHTML());

  // 3. 填入已保存设置
  loadSettingsToForm();

  // 4. 绑定设置面板事件
  bindSettingsPanelEvents();

  // 5. 应用自定义 CSS
  applyCustomCSS();

  // 6. 注入悬浮UI
  injectFloatingUI();

  // 7. 注入蝴蝶窗口
  injectButterflyWindow();

  // 8. 注入破墙窗口
  injectOOCWindow();

  // 9. 注册事件
  registerEventListeners();

  // 10. 注册宏
  registerAllMacros();

  // 11. 加载聊天数据
  loadChatData();

  // 12. 为已有消息注入按钮
  setTimeout(() => injectButtonsToExistingMessages(), 800);

  // 13. 启动世界频段
  startWorldFeed();

  // 14. 检查成就
  checkAchievements();

  // 🆕 15. 初始化移动端入口（新增）
  setTimeout(() => initMobileEntrance(), 1000);

  console.log('[骨与血]✅ v6.0 加载完成！');
});

// ============================================
// 设置面板 HTML
// ============================================

function buildSettingsPanelHTML() {
  return `
  <div id="bb-extension-settings">
    <div class="inline-drawer">
      <div class="inline-drawer-toggle inline-drawer-header">
        <b>🦴 骨与血 (Bone & Blood) v6.0</b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
      </div>
      <div class="inline-drawer-content"><div style="margin:6px 0;">
          <label class="checkbox_label" for="bb-enabled">
            <input id="bb-enabled" type="checkbox" />
            <span>启用插件</span>
          </label>
        </div>

        <hr /><h4style="margin:8px 0 4px;">📡 副API 配置</h4>

        <div style="margin:6px 0;">
          <label for="bb-api-base" style="font-size:13px;display:block;margin-bottom:2px;">API Base URL:</label>
          <input id="bb-api-base" type="text" class="text_pole" placeholder="https://api.openai.com/v1" style="width:100%;" /><small style="color:#888;font-size:11px;">填到 /v1 即可</small>
        </div>

        <div style="margin:6px 0;">
          <label for="bb-api-key" style="font-size:13px;display:block;margin-bottom:2px;">API Key:</label>
          <input id="bb-api-key" type="password" class="text_pole" placeholder="sk-..." style="width:100%;" />
        </div>

        <div style="margin:8px 0;">
          <input id="bb-btn-test-api" class="menu_button" type="button" value="🔗 测试连接 & 获取模型" style="width:100%;" /><div id="bb-api-status" style="margin-top:4px;font-size:13px;min-height:20px;"></div>
        </div>

        <div style="margin:6px 0;">
          <label for="bb-api-model" style="font-size:13px;display:block;margin-bottom:2px;">选择模型:</label>
          <select id="bb-api-model" class="text_pole" style="width:100%;padding:6px;">
            <option value="">-- 请先测试连接 --</option>
          </select>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">⚙️ 自动生成</h4>

        <div style="margin:6px 0;">
          <label for="bb-diary-trigger" style="font-size:13px;">每隔多少条消息自动生成:</label>
          <input id="bb-diary-trigger" type="number" class="text_pole" min="10" max="200" value="30" style="width:80px;" />
        </div>

        <div style="margin:6px 0;">
          <label class="checkbox_label" for="bb-auto-diary">
            <input id="bb-auto-diary" type="checkbox" />
            <span>启用自动日记/总结</span>
          </label>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">🎨 风格预设</h4>
        <div style="margin:6px 0;">
          <label for="bb-style-preset" style="font-size:13px;">选择风格:</label>
          <select id="bb-style-preset" class="text_pole" style="width:100%;padding:6px;">
            <option value="modern">🌃 现代风</option>
            <option value="ancient">🏯 古风</option>
            <option value="gothic">🦇 哥特风</option>
            <option value="custom">✏️ 自定义</option>
          </select>
        </div><div id="bb-custom-style-names" style="display:none;margin-top:12px;padding:12px;background:#222;border:1px solid #444;border-radius:6px;">
          <p style="font-size:12px;color:#aaa;margin-bottom:10px;">自定义各模块名称（支持emoji）:</p>
          <div style="display:grid;grid-template-columns:1fr 2fr;gap:8px;font-size:11px;">
            <label>首页:</label><input type="text" class="text_pole bb-custom-name" data-key="home" style="padding:4px;" />
            <label>唱片机:</label><input type="text" class="text_pole bb-custom-name" data-key="scrapbook" style="padding:4px;" />
            <label>日记本:</label><input type="text" class="text_pole bb-custom-name" data-key="diary" style="padding:4px;" />
            <label>NPC:</label><input type="text" class="text_pole bb-custom-name" data-key="npc" style="padding:4px;" />
            <label>环境雷达:</label><input type="text" class="text_pole bb-custom-name" data-key="weather" style="padding:4px;" />
            <label>氛围心电图:</label><input type="text" class="text_pole bb-custom-name" data-key="vibe" style="padding:4px;" />
            <label>平行宇宙:</label><input type="text" class="text_pole bb-custom-name" data-key="parallel" style="padding:4px;" />
            <label>命运盘:</label><input type="text" class="text_pole bb-custom-name" data-key="fate" style="padding:4px;" />
            <label>面对面沟通:</label><input type="text" class="text_pole bb-custom-name" data-key="ooc" style="padding:4px;" />
            <label>世界频段:</label><input type="text" class="text_pole bb-custom-name" data-key="world" style="padding:4px;" />
            <label>成就殿堂:</label><input type="text" class="text_pole bb-custom-name" data-key="achievements" style="padding:4px;" />
          </div>
          <button id="bb-save-custom-names" class="menu_button" style="width:100%;margin-top:10px;">💾 保存自定义名称</button>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">🖼️ 布局切换 (v6.0)</h4>
        <div style="margin:6px 0;">
          <label for="bb-layout-preset" style="font-size:13px;">主界面布局:</label>
          <select id="bb-layout-preset" class="text_pole" style="width:100%;padding:6px;">
            <option value="listen">🎧 一起听—仿音乐社交风格</option>
            <option value="card">🃏 卡片流— 模块化卡片网格</option>
            <option value="terminal">💻 终端 — 复古命令行风格</option>
            <option value="magazine">📰 杂志 — 杂志排版风格</option>
          </select>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">🎨 生图API (v6.0)</h4>
        <div style="margin:6px 0;">
          <label for="bb-img-api-type" style="font-size:13px;">生图服务:</label>
          <select id="bb-img-api-type" class="text_pole" style="width:100%;padding:6px;">
            <option value="novelai">🎨 NovelAI</option>
            <option value="stablediffusion">🖌️ Stable Diffusion (A1111/ComfyUI)</option>
            <option value="dalle">🤖 DALL·E</option>
            <option value="custom">⚙️ 自定义API</option>
          </select>
        </div>
        <div style="margin:6px 0;">
          <label for="bb-img-api-base" style="font-size:13px;display:block;margin-bottom:2px;">生图 API Base:</label>
          <input id="bb-img-api-base" type="text" class="text_pole" placeholder="https://image.novelai.net" style="width:100%;" />
        </div>
        <div style="margin:6px 0;">
          <label for="bb-img-api-key" style="font-size:13px;display:block;margin-bottom:2px;">生图 API Key:</label>
          <input id="bb-img-api-key" type="password" class="text_pole" placeholder="Bearer token..." style="width:100%;" />
        </div>
        <div style="margin:6px 0;">
          <label for="bb-img-api-model" style="font-size:13px;display:block;margin-bottom:2px;">生图模型:</label>
          <input id="bb-img-api-model" type="text" class="text_pole" placeholder="nai-diffusion-3" style="width:100%;" />
        </div>
        <div style="display:flex;gap:4px;margin:6px 0;">
          <input id="bb-btn-test-img-api" class="menu_button" type="button" value="🔗 测试生图API" style="flex:1;" />
          <input id="bb-btn-save-img-api" class="menu_button" type="button" value="💾 保存" style="flex:1;" />
        </div>
        <div id="bb-img-api-status" style="margin-top:4px;font-size:13px;min-height:20px;"></div>

        <hr />
        <h4 style="margin:8px 0 4px;">📝 预设管理</h4>
        <div style="margin:6px 0;">
          <label for="bb-active-preset" style="font-size:13px;">当前预设:</label>
          <select id="bb-active-preset" class="text_pole" style="width:100%;padding:6px;"></select>
        </div>
        <div style="display:flex;gap:4px;margin:6px 0;">
          <input id="bb-btn-new-preset" class="menu_button" type="button" value="➕ 新建" style="flex:1;" />
          <input id="bb-btn-del-preset" class="menu_button" type="button" value="🗑️ 删除" style="flex:1;" />
        </div>
        <div style="display:flex;gap:4px;margin:6px 0;">
          <input id="bb-btn-import-preset" class="menu_button" type="button" value="📥 导入JSON" style="flex:1;" />
          <input id="bb-btn-export-preset" class="menu_button" type="button" value="📤 导出JSON" style="flex:1;" />
        </div>
        <!-- 展开式编辑器 -->
        <div style="margin-top:12px;">
          <button id="bb-toggle-preset-editor" class="menu_button" style="width:100%;">✏️ 展开预设编辑器</button></div>
        
        <div id="bb-preset-editor" style="display:none;margin-top:12px;padding:12px;background:#222;border:1px solid #444;border-radius:6px;">
          <div style="margin-bottom:10px;">
            <label style="font-size:12px;color:#aaa;">预设名称:</label>
            <input id="bb-preset-name" type="text" class="text_pole" style="width:100%;padding:6px;" />
          </div>
          <div style="margin-bottom:10px;">
            <label style="font-size:12px;color:#aaa;">全局指导:</label>
            <textarea id="bb-preset-global" class="text_pole" rows="3" style="width:100%;font-size:12px;"></textarea>
          </div>
          
          <div style="margin-bottom:10px;">
            <label style="font-size:12px;color:#aaa;">禁词列表（逗号分隔）:</label>
            <input id="bb-preset-blacklist" type="text" class="text_pole" style="width:100%;padding:6px;" placeholder="词1,词2,词3" />
          </div>
          
          <details style="margin-bottom:10px;">
            <summary style="cursor:pointer;color:var(--bb-primary);font-size:13px;font-weight:bold;">📖 提示词模板（点击展开）</summary>
            <div style="margin-top:8px;display:flex;flex-direction:column;gap:8px;">
              <div>
                <label style="font-size:11px;color:#888;">日记:</label>
                <textarea id="bb-preset-diary" class="text_pole" rows="2" style="width:100%;font-size:11px;"></textarea>
              </div>
              <div>
                <label style="font-size:11px;color:#888;">总结:</label>
                <textarea id="bb-preset-summary" class="text_pole" rows="2" style="width:100%;font-size:11px;"></textarea>
              </div>
              <div>
                <label style="font-size:11px;color:#888;">环境:</label>
                <textarea id="bb-preset-weather" class="text_pole" rows="2" style="width:100%;font-size:11px;"></textarea>
              </div>
              <div>
                <label style="font-size:11px;color:#888;">氛围:</label>
                <textarea id="bb-preset-vibe" class="text_pole" rows="2" style="width:100%;font-size:11px;"></textarea>
              </div>
              <div>
                <label style="font-size:11px;color:#888;">NPC:</label>
                <textarea id="bb-preset-npc" class="text_pole" rows="2" style="width:100%;font-size:11px;"></textarea>
              </div>
              <div>
                <label style="font-size:11px;color:#888;">命运:</label>
                <textarea id="bb-preset-fate" class="text_pole" rows="2" style="width:100%;font-size:11px;"></textarea>
              </div>
              <div>
                <label style="font-size:11px;color:#888;">平行宇宙:</label>
                <textarea id="bb-preset-butterfly" class="text_pole" rows="2" style="width:100%;font-size:11px;"></textarea>
              </div>
              <div>
                <label style="font-size:11px;color:#888;">面对面沟通:</label>
                <textarea id="bb-preset-ooc" class="text_pole" rows="2" style="width:100%;font-size:11px;"></textarea>
              </div>
              <div>
                <label style="font-size:11px;color:#888;">世界频段:</label>
                <textarea id="bb-preset-world" class="text_pole" rows="2" style="width:100%;font-size:11px;"></textarea>
              </div>
            </div>
          </details>
          
          <button id="bb-save-preset-editor" class="menu_button" style="width:100%;background:#8b0000;color:#fff;font-weight:bold;">💾 保存当前预设</button>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">✨ 破墙聊天室独立预设 (v6.0)</h4>
        <div style="margin:6px 0;">
          <label for="bb-active-ooc-preset" style="font-size:13px;">当前OOC预设:</label>
          <select id="bb-active-ooc-preset" class="text_pole" style="width:100%;padding:6px;"></select>
        </div>
        <div style="display:flex;gap:4px;margin:6px 0;">
          <input id="bb-btn-new-ooc-preset" class="menu_button" type="button" value="➕ 新建" style="flex:1;" />
          <input id="bb-btn-del-ooc-preset" class="menu_button" type="button" value="🗑️ 删除" style="flex:1;" />
        </div>
        <div style="display:flex;gap:4px;margin:6px 0;">
          <input id="bb-btn-import-ooc-preset" class="menu_button" type="button" value="📥 导入" style="flex:1;" />
          <input id="bb-btn-export-ooc-preset" class="menu_button" type="button" value="📤 导出" style="flex:1;" />
        </div>
        <div style="margin-top:12px;">
          <button id="bb-toggle-ooc-preset-editor" class="menu_button" style="width:100%;">✏️ 编辑OOC预设</button>
        </div><div id="bb-ooc-preset-editor" style="display:none;margin-top:12px;padding:12px;background:#222;border:1px solid #444;border-radius:6px;">
          <div style="margin-bottom:10px;">
            <label style="font-size:12px;color:#aaa;">预设名称:</label>
            <input id="bb-ooc-preset-name" type="text" class="text_pole" style="width:100%;padding:6px;" />
          </div>
          <div style="margin-bottom:10px;">
            <label style="font-size:12px;color:#aaa;">系统提示词:</label>
            <textarea id="bb-ooc-preset-system" class="text_pole" rows="4" style="width:100%;font-size:12px;" placeholder="定义角色在OOC模式下的行为..."></textarea>
          </div>
          <div style="margin-bottom:10px;">
            <label style="font-size:12px;color:#aaa;">语气风格:</label>
            <select id="bb-ooc-preset-tone" class="text_pole" style="width:100%;padding:6px;">
              <option value="warm">🌸 温柔治愈</option>
              <option value="professional">💼 专业理性</option>
              <option value="casual">😊 轻松随意</option>
              <option value="roleplay">🎭 半角色扮演</option></select>
          </div>
          <div style="margin-bottom:10px;">
            <label style="font-size:12px;color:#aaa;">额外上下文（可选）:</label>
            <textarea id="bb-ooc-preset-extra" class="text_pole" rows="2" style="width:100%;font-size:12px;" placeholder="额外的背景信息或指令..."></textarea>
          </div>
          <button id="bb-save-ooc-preset-editor" class="menu_button" style="width:100%;background:#8b0000;color:#fff;font-weight:bold;">💾 保存OOC预设</button>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">🎨 主题管理</h4>
        <div style="margin:6px 0;">
          <label for="bb-custom-css" style="font-size:13px;display:block;margin-bottom:2px;">自定义 CSS:</label>
          <textarea id="bb-custom-css" class="text_pole" placeholder="粘贴 CSS 代码..." style="width:100%;min-height:100px;font-family:monospace;font-size:12px;"></textarea>
        </div>
        <div style="display:flex;gap:4px;margin:6px 0;">
          <input id="bb-btn-apply-css" class="menu_button" type="button" value="🎨 应用" />
          <input id="bb-btn-reset-css" class="menu_button" type="button" value="🔄 重置" /><input id="bb-btn-upload-css" class="menu_button" type="button" value="📁 上传.css" />
        </div>
        <input type="file" id="bb-css-file-input" accept=".css" style="display:none;" />

        <details style="margin-top:12px;">
          <summary style="cursor:pointer;color:var(--bb-primary);font-size:13px;font-weight:bold;">📚 CSS 示例模板</summary>
          <div style="margin-top:12px;padding:12px;background:#111;border:1px solid #333;border-radius:6px;max-height:300px;overflow-y:auto;">
            <h5 style="color:#8b0000;margin:0 0 8px;">🎨 示例1: 赛博朋克风</h5>
            <pre style="background:#000;padding:8px;border-radius:4px;font-size:10px;overflow-x:auto;"><code id="bb-css-example-1">/* 赛博朋克风格 */
:root {
  --bb-primary: #00ffff;
  --bb-primary-dark: #00aaaa;
  --bb-primary-light: #66ffff;
  --bb-bg-main: #0a0a15;
  --bb-bg-secondary: #15152a;
}
#bb-main-panel {
  box-shadow: 0 0 40px rgba(0,255,255,0.5);
}
.bb-tab.active {
  text-shadow: 0 0 10px #00ffff;
}</code></pre>
            <button class="bb-sm-btn" onclick="navigator.clipboard.writeText(document.getElementById('bb-css-example-1').textContent);toastr.success('已复制')">📋 复制</button>
            
            <h5 style="color:#8b0000;margin:16px 0 8px;">🌸 示例2: 樱花梦幻风</h5>
            <pre style="background:#000;padding:8px;border-radius:4px;font-size:10px;overflow-x:auto;"><code id="bb-css-example-2">/* 樱花梦幻风格 */
:root {
  --bb-primary: #ffb3d9;
  --bb-primary-dark: #ff99cc;
  --bb-primary-light: #ffcceb;
  --bb-bg-main: #ffe6f2;
  --bb-bg-secondary: #ffcceb;
  --bb-text: #5c4a5a;
}
#bb-main-panel {
  background: linear-gradient(135deg, #ffe6f2 0%, #ffcceb 100%);
}</code></pre>
            <button class="bb-sm-btn" onclick="navigator.clipboard.writeText(document.getElementById('bb-css-example-2').textContent);toastr.success('已复制')">📋 复制</button>
            
            <h5 style="color:#8b0000;margin:16px 0 8px;">🌌 示例3: 深空幽蓝</h5>
            <pre style="background:#000;padding:8px;border-radius:4px;font-size:10px;overflow-x:auto;"><code id="bb-css-example-3">/* 深空幽蓝风格 */
:root {
  --bb-primary: #4169e1;
  --bb-primary-dark: #2e4a99;
  --bb-primary-light: #6495ed;
  --bb-bg-main: #0c0e1a;
  --bb-bg-secondary: #161b2e;
}
#bb-float-btn {
  background: radial-gradient(circle, #4169e1, #1e3a8a);
}</code></pre>
            <button class="bb-sm-btn" onclick="navigator.clipboard.writeText(document.getElementById('bb-css-example-3').textContent);toastr.success('已复制')">📋 复制</button>
          </div>
        </details>
        
        <details style="margin-top:8px;">
          <summary style="cursor:pointer;color:var(--bb-primary);font-size:13px;font-weight:bold;">🤖 AI 提示词模板</summary>
          <div style="margin-top:8px;padding:12px;background:#111;border:1px solid #333;border-radius:6px;">
            <p style="font-size:11px;color:#aaa;line-height:1.5;margin:0;">
              复制以下文本发给AI（Claude/GPT）生成自定义CSS:<br/><br/>
              <code style="background:#000;padding:8px;display:block;border-radius:4px;font-size:10px;white-space:pre-wrap;">请帮我生成一套骨与血插件的自定义CSS样式。
主题风格：[在此描述你想要的风格，如"蒸汽朋克"、"赛博朋克"、"古典国风"等]
配色要求：
- 主色调：[如"紫色"、"深蓝"等]
- 背景色：[如"深黑"、"深灰"等]
- 强调色：[如"金色"、"银色"等]
特殊效果：[可选，如"发光效果"、"渐变背景"、"阴影加深"等]
请以CSS变量覆盖的方式生成代码，格式如下：
:root {
  --bb-primary: #颜色;
  --bb-bg-main: #颜色;
  ...
}</code>
            </p>
            <button class="bb-sm-btn" style="width:100%;margin-top:8px;" onclick="navigator.clipboard.writeText(this.previousElementSibling.querySelector('code').textContent);toastr.success('已复制AI提示词')">📋 复制AI提示词</button>
          </div>
        </details>

        <hr />
        <h4 style="margin:8px 0 4px;">🔧 手动操作</h4>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          <input id="bb-btn-diary" class="menu_button" type="button" value="📖 生成日记" />
          <input id="bb-btn-summary" class="menu_button" type="button" value="📜 生成总结" />
          <input id="bb-btn-weather" class="menu_button" type="button" value="☁️ 刷新环境" />
          <input id="bb-btn-vibe" class="menu_button" type="button" value="❤️ 分析氛围" />
        </div>

        <hr />
        <div style="color:#888;font-size:11px;padding:8px 0;text-align:center;">💡 点击右下角 🦴 打开主面板<br/>
          © 2026SHADOW &lt;安息之影&gt;
        </div>
      </div>
    </div>
  </div>`;
}

//============================================
// 设置管理
// ============================================

function getSettings() {
  return extension_settings[EXTENSION_NAME];
}

function saveSettings() {
  saveSettingsDebounced();
}

function loadSettingsToForm() {
  const s = getSettings();
  $('#bb-enabled').prop('checked', s.enabled);
  $('#bb-api-base').val(s.api_base);
  $('#bb-api-key').val(s.api_key);
  $('#bb-diary-trigger').val(s.diary_trigger_count);
  $('#bb-auto-diary').prop('checked', s.auto_diary_enabled);
  $('#bb-style-preset').val(s.style_preset);
  $('#bb-custom-css').val(s.custom_css || '');
  
  // v6.0 布局
  $('#bb-layout-preset').val(s.layout_preset ||'listen');
  
  // v6.0 生图API
  $('#bb-img-api-type').val(s.img_api_type || 'novelai');
  $('#bb-img-api-base').val(s.img_api_base || '');
  $('#bb-img-api-key').val(s.img_api_key || '');
  $('#bb-img-api-model').val(s.img_api_model || '');
  
  if (s.api_model) {
    $('#bb-api-model').empty().append(`<option value="${s.api_model}" selected>${s.api_model}</option>`);
  }
  
  // 加载预设列表
  refreshPresetSelector();
  
  // v6.0 加载OOC预设列表
  refreshOOCPresetSelector();
}

function bindSettingsPanelEvents() {
  $('#bb-enabled').on('change', function () {
    getSettings().enabled = $(this).is(':checked');
    saveSettings();
  });
  
  $('#bb-api-base').on('input', function () {
    getSettings().api_base = $(this).val().replace(/\/+$/, '');
    saveSettings();
  });
  
  $('#bb-api-key').on('input', function () {
    getSettings().api_key = $(this).val();
    saveSettings();
  });
  
  $('#bb-btn-test-api').on('click', testAPIConnection);
  
  $('#bb-api-model').on('change', function () {
    getSettings().api_model = $(this).val();
    saveSettings();
  });
  
  $('#bb-diary-trigger').on('change', function () {
    getSettings().diary_trigger_count = parseInt($(this).val()) || 30;
    saveSettings();
  });
  
  $('#bb-auto-diary').on('change', function () {
    getSettings().auto_diary_enabled = $(this).is(':checked');
    saveSettings();
  });
  
  //风格预设（含自定义面板显示逻辑）
  $('#bb-style-preset').on('change', function () {
    const val = $(this).val();
    getSettings().style_preset = val;
    saveSettings();
    
    if (val === 'custom') {
      $('#bb-custom-style-names').slideDown();
      loadCustomNames();
    } else {
      $('#bb-custom-style-names').slideUp();
    }
    refreshFloatingUI();
  });

  // 保存自定义名称
  $('#bb-save-custom-names').on('click', function () {
    const s = getSettings();
    s.custom_names = {};
    $('.bb-custom-name').each(function () {
      const key = $(this).data('key');
      const val = $(this).val().trim();
      if (val) s.custom_names[key] = val;
    });
    saveSettings();
    refreshFloatingUI();
    toastr.success('✅ 自定义名称已保存');
  });
  
  // v6.0 布局切换
  $('#bb-layout-preset').on('change', function () {
    const val = $(this).val();
    getSettings().layout_preset = val;
    saveSettings();
    refreshFloatingUI();
    toastr.success(`🖼️ 布局已切换为: ${LAYOUT_PRESETS[val]?.name || val}`);
  });
  
  // v6.0 生图API
  $('#bb-img-api-type').on('change', function () {
    getSettings().img_api_type = $(this).val();
    saveSettings();
  });
  
  $('#bb-btn-save-img-api').on('click', function () {
    const s = getSettings();
    s.img_api_base = $('#bb-img-api-base').val().replace(/\/+$/, '');
    s.img_api_key = $('#bb-img-api-key').val();
    s.img_api_model = $('#bb-img-api-model').val();
    saveSettings();
    toastr.success('💾 生图API配置已保存');
  });
  
  $('#bb-btn-test-img-api').on('click', testImgAPIConnection);
  
  $('#bb-active-preset').on('change', function () {
    getSettings().active_preset = parseInt($(this).val());
    saveSettings();
  });
  
  $('#bb-btn-new-preset').on('click', createNewPreset);
  $('#bb-btn-del-preset').on('click', deleteCurrentPreset);
  $('#bb-btn-import-preset').on('click', importPreset);
  $('#bb-btn-export-preset').on('click', exportPreset);
  
  // v6.0 OOC预设事件
  $('#bb-active-ooc-preset').on('change', function () {
    getSettings().active_ooc_preset = parseInt($(this).val());
    saveSettings();
  });
  
  $('#bb-btn-new-ooc-preset').on('click', createNewOOCPreset);
  $('#bb-btn-del-ooc-preset').on('click', deleteCurrentOOCPreset);
  $('#bb-btn-import-ooc-preset').on('click', importOOCPreset);
  $('#bb-btn-export-ooc-preset').on('click', exportOOCPreset);
  
  $('#bb-toggle-ooc-preset-editor').on('click', function () {
    const editor = $('#bb-ooc-preset-editor');
    if (editor.is(':visible')) {
      editor.slideUp();
      $(this).text('✏️ 编辑OOC预设');
    } else {
      loadOOCPresetToEditor();
      editor.slideDown();
      $(this).text('🔼 收起OOC编辑器');
    }
  });
  
  $('#bb-save-ooc-preset-editor').on('click', saveOOCPresetFromEditor);
  
  $('#bb-btn-apply-css').on('click', () => {
    getSettings().custom_css = $('#bb-custom-css').val();
    saveSettings();
    applyCustomCSS();
    toastr.success('🎨 CSS 已应用');
  });
  
  $('#bb-btn-reset-css').on('click', () => {
    getSettings().custom_css = '';
    $('#bb-custom-css').val('');
    saveSettings();
    applyCustomCSS();
    toastr.success('🔄 已重置为默认样式');
  });
  
  $('#bb-btn-upload-css').on('click', () => $('#bb-css-file-input').click());
  
  $('#bb-css-file-input').on('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const css = e.target.result;
      $('#bb-custom-css').val(css);
      getSettings().custom_css = css;
      saveSettings();
      applyCustomCSS();
      toastr.success(`📁 已加载 ${file.name}`);
    };
    reader.readAsText(file);
  });
  
  // 设置面板按钮
  $('#bb-btn-diary').on('click', generateDiary);
  $('#bb-btn-summary').on('click', generateSummary);
  $('#bb-btn-weather').on('click', generateWeather);
  $('#bb-btn-vibe').on('click', generateVibe);

  // 预设编辑器展开/折叠
  $('#bb-toggle-preset-editor').on('click', function () {
    const editor = $('#bb-preset-editor');
    if (editor.is(':visible')) {
      editor.slideUp();
      $(this).text('✏️ 展开预设编辑器');
    } else {
      loadPresetToEditor();
      editor.slideDown();
      $(this).text('🔼 收起编辑器');
    }
  });
  
  // 保存预设编辑器
  $('#bb-save-preset-editor').on('click', savePresetFromEditor);
}

// ============================================
// 预设编辑器（v0.5.0）
// ============================================

function loadPresetToEditor() {
  const preset = getActivePreset();
  $('#bb-preset-name').val(preset.name);
  $('#bb-preset-global').val(preset.global || '');
  $('#bb-preset-blacklist').val((preset.blacklist || []).join(','));
  
  $('#bb-preset-diary').val(preset.prompts.diary || '');
  $('#bb-preset-summary').val(preset.prompts.summary || '');
  $('#bb-preset-weather').val(preset.prompts.weather || '');
  $('#bb-preset-vibe').val(preset.prompts.vibe || '');
  $('#bb-preset-npc').val(preset.prompts.npc || '');
  $('#bb-preset-fate').val(preset.prompts.fate || '');
  $('#bb-preset-butterfly').val(preset.prompts.butterfly || '');
  $('#bb-preset-ooc').val(preset.prompts.ooc || '');
  $('#bb-preset-world').val(preset.prompts.world || '');
}

function savePresetFromEditor() {
  const s = getSettings();
  const idx = s.active_preset;
  
  s.prompt_presets[idx] = {
    name: $('#bb-preset-name').val() || '未命名预设',
    global: $('#bb-preset-global').val(),
    blacklist: $('#bb-preset-blacklist').val().split(',').map(w => w.trim()).filter(Boolean),
    prompts: {
      diary: $('#bb-preset-diary').val(),
      summary: $('#bb-preset-summary').val(),
      weather: $('#bb-preset-weather').val(),
      vibe: $('#bb-preset-vibe').val(),
      npc: $('#bb-preset-npc').val(),
      fate: $('#bb-preset-fate').val(),
      butterfly: $('#bb-preset-butterfly').val(),
      ooc: $('#bb-preset-ooc').val(),
      world: $('#bb-preset-world').val(),
    },};
  
  saveSettings();
  refreshPresetSelector();
  toastr.success('💾 预设已保存');
}

// ============================================
// OOC 预设管理 (v6.0 新增)
// ============================================

function getActiveOOCPreset() {
  const s = getSettings();
  if (!s.ooc_presets || s.ooc_presets.length === 0) {
    s.ooc_presets = [defaultSettings.ooc_presets[0]];
  }
  return s.ooc_presets[s.active_ooc_preset || 0] || s.ooc_presets[0];
}

function refreshOOCPresetSelector() {
  const s = getSettings();
  if (!s.ooc_presets) s.ooc_presets = [defaultSettings.ooc_presets[0]];
  const sel = $('#bb-active-ooc-preset');
  sel.empty();
  s.ooc_presets.forEach((p, i) => {
    sel.append(`<option value="${i}">${esc(p.name)}</option>`);
  });sel.val(s.active_ooc_preset || 0);
}

function loadOOCPresetToEditor() {
  const preset = getActiveOOCPreset();
  $('#bb-ooc-preset-name').val(preset.name || '');
  $('#bb-ooc-preset-system').val(preset.system_prompt || '');
  $('#bb-ooc-preset-tone').val(preset.tone || 'warm');
  $('#bb-ooc-preset-extra').val(preset.extra_context || '');
}

function saveOOCPresetFromEditor() {
  const s = getSettings();
  const idx = s.active_ooc_preset || 0;
  
  s.ooc_presets[idx] = {
    name: $('#bb-ooc-preset-name').val() || '未命名OOC预设',
    system_prompt: $('#bb-ooc-preset-system').val(),
    tone: $('#bb-ooc-preset-tone').val(),
    extra_context: $('#bb-ooc-preset-extra').val(),
  };
  
  saveSettings();
  refreshOOCPresetSelector();
  toastr.success('💾 OOC预设已保存');
}

function createNewOOCPreset() {
  const name = prompt('OOC预设名称:', `新OOC预设 ${Date.now()}`);
  if (!name) return;
  
  const s = getSettings();
  if (!s.ooc_presets) s.ooc_presets = [];
  s.ooc_presets.push({
    name,
    system_prompt: defaultSettings.ooc_presets[0].system_prompt,
    tone: 'warm',
    extra_context: '',
  });
  s.active_ooc_preset = s.ooc_presets.length - 1;
  saveSettings();
  refreshOOCPresetSelector();
  toastr.success(`➕ 已创建OOC预设: ${name}`);
}

function deleteCurrentOOCPreset() {
  const s = getSettings();
  if (!s.ooc_presets || s.ooc_presets.length <= 1) {
    toastr.warning('至少保留一个OOC预设');
    return;
  }
  if (!confirm(`确认删除OOC预设: ${getActiveOOCPreset().name}?`)) return;
  
  s.ooc_presets.splice(s.active_ooc_preset, 1);
  s.active_ooc_preset =0;
  saveSettings();
  refreshOOCPresetSelector();
  toastr.success('🗑️ OOC预设已删除');
}

function importOOCPreset() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!imported.system_prompt) {
          toastr.error('无效的OOC预设格式');
          return;
        }
        const s = getSettings();
        if (!s.ooc_presets) s.ooc_presets = [];
        s.ooc_presets.push(imported);
        s.active_ooc_preset = s.ooc_presets.length - 1;
        saveSettings();
        refreshOOCPresetSelector();
        toastr.success(`📥 已导入OOC预设: ${imported.name}`);
      } catch (err) {
        toastr.error('JSON格式错误');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportOOCPreset() {
  const preset = getActiveOOCPreset();
  dl(`bb_ooc_preset_${preset.name}_${Date.now()}.json`, JSON.stringify(preset, null, 2), 'application/json');
  toastr.success(`📤 已导出OOC预设: ${preset.name}`);
}

// ============================================
// 自定义名称加载
// ============================================

function loadCustomNames() {
  const s = getSettings();
  const defaultPreset = STYLE_PRESETS.gothic;
  $('.bb-custom-name').each(function () {
    const key = $(this).data('key');
    $(this).val(s.custom_names[key] || defaultPreset[key] || '');
  });
}

// ============================================
// API 测试与调用
// ============================================

async function testAPIConnection() {
  const s = getSettings();
  const base = s.api_base.replace(/\/+$/, '');
  const key = s.api_key;

  if (!base || !key) {
    toastr.warning('请先填写 API Base 和 Key');
    return;
  }

  $('#bb-api-status').html('<span style="color:orange;">⏳ 连接中...</span>');

  try {
    const url = base.includes('/v1') ? `${base}/models` : `${base}/v1/models`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const json = await res.json();
    const models = json.data || json.models || [];

    if (models.length === 0) throw new Error('未找到可用模型');

    $('#bb-api-model').empty();
    models.forEach(m => {
      const id = m.id || m;
      $('#bb-api-model').append(`<option value="${id}">${id}</option>`);
    });

    s.api_model = models[0].id || models[0];
    $('#bb-api-model').val(s.api_model);
    saveSettings();

    $('#bb-api-status').html(`<span style="color:green;">✅ 连接成功！获取到 ${models.length} 个模型</span>`);
    toastr.success(`🔗 已连接，默认模型: ${s.api_model}`);
  } catch (err) {
    $('#bb-api-status').html(`<span style="color:red;">❌ 连接失败: ${err.message}</span>`);
    toastr.error(`连接失败: ${err.message}`);
  }
}

// ============================================
// 生图 API 测试 (v6.0 新增)
// ============================================

async function testImgAPIConnection() {
  const s = getSettings();
  const base = (s.img_api_base || '').replace(/\/+$/, '');
  const key = s.img_api_key;
  const apiType = s.img_api_type || 'novelai';

  if (!base) {
    toastr.warning('请先填写生图 API Base');
    return;
  }

  $('#bb-img-api-status').html('<span style="color:orange;">⏳ 测试连接中...</span>');

  try {
    let testUrl = '';
    let headers = {};
    
    switch (apiType) {
      case 'novelai':
        testUrl = `${base}/user/information`;
        headers = { Authorization: `Bearer ${key}` };
        break;
      case 'stablediffusion':
        testUrl = `${base}/sdapi/v1/sd-models`;
        break;
      case 'dalle':
        testUrl = base.includes('/v1') ? `${base}/models` : `${base}/v1/models`;
        headers = { Authorization: `Bearer ${key}` };
        break;
      default:
        testUrl = base;
        if (key) headers = { Authorization: `Bearer ${key}` };
        break;
    }
    
    const res = await fetch(testUrl, { headers });
    
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    
    $('#bb-img-api-status').html('<span style="color:green;">✅ 生图API连接成功！</span>');
    toastr.success('🎨 生图API连接成功');
  } catch (err) {
    $('#bb-img-api-status').html(`<span style="color:red;">❌ 连接失败: ${err.message}</span>`);
    toastr.error(`生图API连接失败: ${err.message}`);
  }
}

// ============================================
// 生图 API 调用 (v6.0 新增)
// ============================================

async function callImgAPI(prompt, negativePrompt = '') {
  const s = getSettings();
  const base = (s.img_api_base || '').replace(/\/+$/, '');
  const key = s.img_api_key;
  const model = s.img_api_model;
  const apiType = s.img_api_type || 'novelai';

  if (!base) {
    toastr.error('请先配置生图API');
    return null;
  }

  try {
    let url = '';
    let body = {};
    let headers = {'Content-Type': 'application/json' };
    
    switch (apiType) {
      case 'novelai':
        url = `${base}/ai/generate-image`;
        headers.Authorization = `Bearer ${key}`;
        body = {
          input: prompt,
          model: model || 'nai-diffusion-3',
          parameters: {
            width: 512,
            height: 768,
            scale: 11,
            sampler: 'k_euler',
            steps: 28,
            negative_prompt: negativePrompt ||'lowres, bad anatomy, bad hands',},
        };
        break;
      case 'stablediffusion':
        url = `${base}/sdapi/v1/txt2img`;
        body = {
          prompt: prompt,
          negative_prompt: negativePrompt || 'lowres, bad anatomy',
          steps: 20,
          width: 512,
          height: 768,
          cfg_scale: 7,
        };
        break;
        
      case 'dalle':
        url = base.includes('/v1') ? `${base}/images/generations` : `${base}/v1/images/generations`;
        headers.Authorization = `Bearer ${key}`;
        body = {
          model: model || 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
        };
        break;
        
      default:
        url = base;
        if (key) headers.Authorization = `Bearer ${key}`;
        body = { prompt, model, negative_prompt: negativePrompt };
        break;
    }
    
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    
    const json = await res.json();
    
    // 根据不同API解析图片URL/base64
    let imageData = null;
    
    switch (apiType) {
      case 'novelai':
        imageData = json.output ? `data:image/png;base64,${json.output}` : null;
        break;
      case 'stablediffusion':
        imageData = json.images?.[0] ? `data:image/png;base64,${json.images[0]}` : null;
        break;
      case 'dalle':
        imageData = json.data?.[0]?.url || json.data?.[0]?.b64_json ? `data:image/png;base64,${json.data[0].b64_json}` : null;
        break;
      default:
        imageData = json.image || json.url || json.output || null;
        break;
    }
    
    return imageData;
  } catch (err) {
    toastr.error(`生图失败: ${err.message}`);
    return null;
  }
}

// ============================================
// 图片管理 (v6.0 新增)
// ============================================

async function generateImage(promptText) {
  toastr.info('🎨 正在生成图片...');
  
  const imageData = await callImgAPI(promptText);
  
  if (imageData) {
    const imgRecord = {
      id: Date.now(),
      prompt: promptText,
      data: imageData,
      timestamp: new Date().toLocaleString('zh-CN'),
    };
    
    pluginData.generated_images.push(imgRecord);
    saveChatData();
    toastr.success('🎨 图片生成成功！');
    return imgRecord;
  }
  
  return null;
}

function deleteGeneratedImage(imgId) {
  const idx = pluginData.generated_images.findIndex(img => img.id === imgId);
  if (idx === -1) return;
  
  pluginData.generated_images.splice(idx, 1);
  saveChatData();
  toastr.info('🗑️ 图片已删除');
}

async function rerollImage(imgId) {
  const img = pluginData.generated_images.find(i => i.id === imgId);
  if (!img) return;
  
  toastr.info('🔄 重新生成图片...');
  const newData = await callImgAPI(img.prompt);
  
  if (newData) {
    img.data = newData;
    img.timestamp = new Date().toLocaleString('zh-CN');
    saveChatData();
    toastr.success('🔄 图片已重新生成！');
  }
}

async function callSubAPI(messages, maxTokens = 500) {
  const s = getSettings();
  const base = s.api_base.replace(/\/+$/, '');
  const key = s.api_key;
  const model = s.api_model;

  if (!base || !key || !model) {
    toastr.error('请先配置并测试副API');
    return null;
  }

  // 应用全局预设和禁词
  const preset = getActivePreset();
  if (preset.global) {
    messages = [{ role: 'system', content: preset.global }, ...messages];
  }

  try {
    const url = base.includes('/v1') ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.85,
      }),
    });

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const json = await res.json();
    let content = json.choices?.[0]?.message?.content || '';

    // 应用禁词过滤
    if (preset.blacklist && preset.blacklist.length > 0) {
      preset.blacklist.forEach(word => {
        const reg = new RegExp(word, 'gi');
        content = content.replace(reg, '***');
      });
    }

    return content.trim();
  } catch (err) {
    toastr.error(`API调用失败: ${err.message}`);
    return null;
  }
}

// ============================================
// 预设管理
// ============================================

function getActivePreset() {
  const s = getSettings();
  return s.prompt_presets[s.active_preset] || s.prompt_presets[0];
}

function refreshPresetSelector() {
  const s = getSettings();
  const sel = $('#bb-active-preset');
  sel.empty();
  s.prompt_presets.forEach((p, i) => {
    sel.append(`<option value="${i}">${esc(p.name)}</option>`);
  });
  sel.val(s.active_preset);
}

function createNewPreset() {
  const name = prompt('预设名称:', `新预设 ${Date.now()}`);
  if (!name) return;

  const s = getSettings();
  s.prompt_presets.push({
    name,
    global: '',
    prompts: { ...defaultSettings.prompt_presets[0].prompts },
    blacklist: [],
  });
  s.active_preset = s.prompt_presets.length - 1;
  saveSettings();
  refreshPresetSelector();
  toastr.success(`➕ 已创建预设: ${name}`);
}

function deleteCurrentPreset() {
  const s = getSettings();
  if (s.prompt_presets.length === 1) {
    toastr.warning('至少保留一个预设');
    return;
  }
  if (!confirm(`确认删除预设: ${getActivePreset().name}?`)) return;

  s.prompt_presets.splice(s.active_preset, 1);
  s.active_preset = 0;
  saveSettings();
  refreshPresetSelector();
  toastr.success('🗑️ 预设已删除');
}

function importPreset() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        const s = getSettings();
        s.prompt_presets.push(imported);
        s.active_preset = s.prompt_presets.length - 1;
        saveSettings();
        refreshPresetSelector();
        toastr.success(`📥 已导入: ${imported.name}`);
      } catch (err) {
        toastr.error('JSON 格式错误');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportPreset() {
  const preset = getActivePreset();
  dl(`bb_preset_${preset.name}_${Date.now()}.json`, JSON.stringify(preset, null, 2), 'application/json');
  toastr.success(`📤 已导出: ${preset.name}`);
}

// ============================================
// 自定义 CSS
// ============================================

function applyCustomCSS() {
  const s = getSettings();
  $('#bb-custom-style').remove();
  if (s.custom_css) {
    $('head').append(`<style id="bb-custom-style">${s.custom_css}</style>`);
  }
}

// ============================================
// 悬浮UI（主面板）
// ============================================

function injectFloatingUI() {
  if ($('#bb-float-btn').length > 0) return;

  //悬浮按钮
  $('body').append(`
    <div id="bb-float-btn" title="骨与血" style="position:fixed;bottom:20px;right:20px;width:50px;height:50px;background:#000;border:2px solid #8b0000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.5);transition:transform 0.2s;">🦴
    </div>
  `);

  $('#bb-float-btn').on('click', () => {
    const panel = $('#bb-main-panel');
    if (panel.css('display') === 'none' || panel.css('display') === '') {
      panel.css('display', 'flex');
    } else {
      panel.css('display', 'none');
    }
  });
  $('#bb-float-btn').on('mouseenter', function () { $(this).css('transform', 'scale(1.1)'); });
  $('#bb-float-btn').on('mouseleave', function () { $(this).css('transform', 'scale(1)'); });

  // 主面板
  $('body').append(buildMainPanelHTML());
  bindMainPanelEvents();
  renderAll();
}

function buildMainPanelHTML() {
  const names = getTabNames();
  const layout = getSettings().layout_preset || 'listen';

  return `
    <div id="bb-main-panel" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:800px;height:80%;max-height:700px;background:#1a1a1a;border:3px solid #8b0000;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.8);z-index:10000;overflow:hidden;flex-direction:column;">
      <!-- 标题栏 -->
      <div class="bb-header" style="background:#000;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #8b0000;">
        <div style="font-size:18px;font-weight:bold;">🦴 骨与血</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <select id="bb-layout-switch" style="background:#333;color:#fff;border:1px solid #555;border-radius:4px;padding:2px 6px;font-size:11px;cursor:pointer;">
            <option value="listen" ${layout === 'listen' ? 'selected' : ''}>🎧 一起听</option>
            <option value="card" ${layout === 'card' ? 'selected' : ''}>🃏 卡片流</option>
            <option value="terminal" ${layout === 'terminal' ? 'selected' : ''}>💻 终端</option><option value="magazine" ${layout === 'magazine' ? 'selected' : ''}>📰 杂志</option>
          </select>
          <button id="bb-close-btn" style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer;">✖</button>
        </div>
      </div>

      <!-- Tab导航 -->
      <div class="bb-nav" style="background:#222;display:flex;overflow-x:auto;border-bottom:1px solid #444;">
        <div class="bb-tab active" data-tab="home">${names.home}</div>
        <div class="bb-tab" data-tab="scrapbook">${names.scrapbook}</div>
        <div class="bb-tab" data-tab="diary">${names.diary}</div>
        <div class="bb-tab" data-tab="npc">${names.npc}</div>
        <div class="bb-tab" data-tab="weather">${names.weather}</div>
        <div class="bb-tab" data-tab="vibe">${names.vibe}</div>
        <div class="bb-tab" data-tab="parallel">${names.parallel}</div>
        <div class="bb-tab" data-tab="fate">${names.fate}</div>
        <div class="bb-tab" data-tab="ooc">${names.ooc}</div>
        <div class="bb-tab" data-tab="world">${names.world}</div>
        <div class="bb-tab" data-tab="achievements">${names.achievements}</div>
        <div class="bb-tab" data-tab="gallery">🖼️ 画廊</div>
      </div>

      <!-- 内容区 -->
      <div class="bb-content" style="flex:1;overflow-y:auto;padding:16px;background:#1a1a1a;color:#ddd;">
        
        <!-- 🏠 首页 -->
        <div id="bb-tab-home" class="bb-tab-panel active">
          ${buildHomeTabHTML(layout)}
        </div>

        <!-- 🌟唱片机 -->
        <div id="bb-tab-scrapbook" class="bb-tab-panel" style="display:none;">
          <div class="bb-export-bar" style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-export-md">📄 导出MD</button>
            <button class="bb-sm-btn" id="bb-btn-export-json">📦 导出JSON</button>
          </div>
          <div id="bb-scrap-empty" class="bb-empty" style="text-align:center;color:#888;padding:40px;">暂无收藏的语录<br/>点击消息旁的 🌟 收藏
          </div>
          <div id="bb-records-list"></div>
        </div>

        <!-- 📖 日记本 -->
        <div id="bb-tab-diary" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-gen-diary-tab">📖 生成日记</button></div>
          <div id="bb-diary-empty" class="bb-empty" style="text-align:center;color:#888;padding:40px;">
            暂无日记<br/>点击上方按钮生成
          </div>
          <div id="bb-diary-list"></div>
        </div>

        <!-- 🧑‍🤝‍🧑 NPC动态 -->
        <div id="bb-tab-npc" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-add-npc">➕ 添加NPC</button>
            <button class="bb-sm-btn" id="bb-btn-auto-npc">🎲 随机窥探</button>
          </div>
          <div id="bb-npc-box"></div>
        </div>

        <!-- ☁️ 环境雷达 -->
        <div id="bb-tab-weather" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-gen-weather-tab">☁️ 扫描环境</button>
          </div>
          <div class="bb-box" id="bb-weather-box" style="background:#222;border:2px solid #444;border-radius:8px;padding:16px;min-height:100px;color:#ddd;">
            未检测
          </div>
        </div>

        <!-- ❤️ 氛围心电图 -->
        <div id="bb-tab-vibe" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-gen-vibe-tab">❤️ 分析氛围</button>
          </div>
          <div class="bb-box" id="bb-vibe-box" style="background:#222;border:2px solid #444;border-radius:8px;padding:16px;min-height:100px;color:#ddd;">
            未检测
          </div>
        </div>

        <!-- 🦋 平行宇宙 -->
        <div id="bb-tab-parallel" class="bb-tab-panel" style="display:none;">
          <div id="bb-par-empty" class="bb-empty" style="text-align:center;color:#888;padding:40px;">
            暂无平行宇宙记录<br/>点击消息旁的 🦋 开启分支
          </div>
          <div id="bb-par-list"></div>
        </div>

        <!-- 🎲 命运盘 -->
        <div id="bb-tab-fate" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:center;">
            <button class="bb-big-btn" id="bb-btn-roll-fate">🎲 转动命运之轮</button>
          </div>
          <div id="bb-fate-result" style="background:#222;border:2px solid #8b0000;border-radius:8px;padding:16px;margin-bottom:16px;min-height:100px;color:#ddd;text-align:center;">
            点击上方按钮，让命运降临...
          </div>
          <div style="margin-top:20px;">
            <h4style="color:#8b0000;margin-bottom:12px;border-bottom:1px solid #444;padding-bottom:8px;">📜 命运历史</h4>
            <div id="bb-fate-history-list"></div>
          </div>
        </div>

        <!-- 💬 破墙聊天室 -->
        <div id="bb-tab-ooc" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-open-ooc-win">💬 打开对话窗口</button><button class="bb-sm-btn" id="bb-btn-clear-ooc">🗑️ 清空历史</button>
          </div>
          <div id="bb-ooc-preview" style="background:#222;border:2px solid #444;border-radius:8px;padding:16px;min-height:200px;max-height:400px;overflow-y:auto;color:#ddd;">
            <div class="bb-empty" style="text-align:center;color:#888;">
              这里是跨越次元的聊天窗口，点击上方按钮，和ta聊聊剧本之外的故事吧！
            </div>
          </div>
        </div>

        <!-- 📻 世界频段 -->
        <div id="bb-tab-world" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-add-feed">➕ 添加消息</button>
            <button class="bb-sm-btn" id="bb-btn-gen-feed">🎲 生成消息</button><button class="bb-sm-btn" id="bb-btn-clear-feed">🗑️ 清空</button>
          </div>
          <!--跑马灯 -->
          <div class="bb-marquee-container" style="background:#000;border:2px solid #8b0000;border-radius:8px;padding:12px;margin-bottom:16px;overflow:hidden;position:relative;height:50px;">
            <div id="bb-marquee" style="white-space:nowrap;animation:bb-scroll 20s linear infinite;color:#fff;font-size:16px;">
              🌍 世界频段广播中...
            </div>
          </div>
          <div id="bb-world-feed-list" style="max-height:400px;overflow-y:auto;"></div>
        </div>

        <!-- 🏆 成就殿堂 -->
        <div id="bb-tab-achievements" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;text-align:center;">
            <div style="font-size:14px;color:#888;">已解锁 <span id="bb-ach-count" style="color:#8b0000;font-weight:bold;">0</span> /<span id="bb-ach-total">12</span></div>
          </div>
          <div id="bb-ach-list"></div>
        </div>

        <!-- 🖼️ 画廊 (v6.0 新增) -->
        <div id="bb-tab-gallery" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-gen-img">🎨 生成配图</button>
          </div>
          <div id="bb-gallery-empty" class="bb-empty" style="text-align:center;color:#888;padding:40px;">
            暂无生成的图片<br/>点击上方按钮生成配图
          </div>
          <div id="bb-gallery-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;"></div>
        </div></div>
    </div>
  `;
}

// ============================================
// 首页布局构建器(v6.0 新增)
// ============================================

function buildHomeTabHTML(layout) {
  switch (layout) {
    case 'card':
      return buildHomeCard();
    case 'terminal':
      return buildHomeTerminal();
    case 'magazine':
      return buildHomeMagazine();
    case 'listen':
    default:
      return buildHomeListen();
  }
}

//布局1: 一起听（原版）
function buildHomeListen() {
  return `
    <div class="bb-home-card" style="background:#222;border:2px solid #444;border-radius:8px;padding:20px;margin-bottom:16px;">
      <!--顶部：头像 + 链接 + 名字 -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="bb-home-avatar" id="bb-home-user-avatar" style="width:60px;height:60px;border-radius:50%;background:#333;border:2px solid #8b0000;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:32px;">👤
          </div>
          <div>
            <div id="bb-home-user-name" style="font-size:16px;font-weight:bold;color:#fff;">用户名</div>
          </div>
        </div><div id="bb-home-link-emoji" contenteditable="true" style="font-size:40px;cursor:pointer;user-select:none;" title="点击编辑">💕</div>

        <div style="display:flex;align-items:center;gap:12px;">
          <div style="text-align:right;">
            <div id="bb-home-char-name" style="font-size:16px;font-weight:bold;color:#fff;">角色名</div>
          </div>
          <div class="bb-home-avatar" id="bb-home-char-avatar" style="width:60px;height:60px;border-radius:50%;background:#333;border:2px solid #8b0000;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:32px;">
            🎭
          </div>
        </div>
      </div>

      <!-- 气泡对话 -->
      <div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:flex-start;margin-bottom:12px;">
          <div id="bb-home-user-bubble" contenteditable="true" style="background:#444;color:#fff;padding:10px 14px;border-radius:18px 18px 18px 4px;max-width:70%;font-size:14px;cursor:text;" title="点击编辑">
            今天也要开心鸭~
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;">
          <div id="bb-home-char-bubble" contenteditable="true" style="background:#8b0000;color:#fff;padding:10px 14px;border-radius:18px 18px 4px 18px;max-width:70%;font-size:14px;cursor:text;" title="点击编辑">
            嗯，一起加油！
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
        <div style="display:flex;justify-content:space-around;text-align:center;">
          <div>
            <div style="font-size:24px;font-weight:bold;color:#8b0000;" id="bb-home-msg-count">0</div>
            <div style="font-size:12px;color:#888;">💬 已聊天</div>
          </div>
          <div>
            <div style="font-size:24px;font-weight:bold;color:#8b0000;" id="bb-home-time-count">0</div>
            <div style="font-size:12px;color:#888;">⏱️ 分钟</div>
          </div>
        </div>
        <div style="margin-top:16px;text-align:center;">
          <div style="font-size:14px;color:#aaa;">🎵 正在一起听</div>
          <div id="bb-home-radio-text" contenteditable="true" style="font-size:18px;color:#fff;margin-top:8px;cursor:text;text-align:center;" title="点击编辑">骨与血电台
          </div>
        </div>
      </div>

      <!-- 头像设置按钮 -->
      <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
        <button class="bb-sm-btn" id="bb-btn-set-user-avatar">📷 设置用户头像</button>
        <button class="bb-sm-btn" id="bb-btn-set-char-avatar">📷 设置角色头像</button>
        <button class="bb-sm-btn" id="bb-btn-save-home">💾 保存首页配置</button>
      </div>
    </div>
  `;
}

// 布局2: 卡片流
function buildHomeCard() {
  return `
    <div class="bb-home-card-layout" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <!-- 用户卡片 -->
      <div style="background:#222;border:2px solid #444;border-radius:12px;padding:16px;text-align:center;">
        <div class="bb-home-avatar" id="bb-home-user-avatar" style="width:80px;height:80px;border-radius:50%;background:#333;border:3px solid #8b0000;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 12px;">
          👤
        </div>
        <div id="bb-home-user-name" style="font-size:18px;font-weight:bold;color:#fff;margin-bottom:8px;">用户名</div>
        <div id="bb-home-user-bubble" contenteditable="true" style="background:#444;color:#fff;padding:8px 12px;border-radius:12px;font-size:13px;cursor:text;" title="点击编辑">
          今天也要开心鸭~
        </div>
      </div>
      
      <!-- 角色卡片 -->
      <div style="background:#222;border:2px solid #444;border-radius:12px;padding:16px;text-align:center;">
        <div class="bb-home-avatar" id="bb-home-char-avatar" style="width:80px;height:80px;border-radius:50%;background:#333;border:3px solid #8b0000;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 12px;">
          🎭
        </div>
        <div id="bb-home-char-name" style="font-size:18px;font-weight:bold;color:#fff;margin-bottom:8px;">角色名</div>
        <div id="bb-home-char-bubble" contenteditable="true" style="background:#8b0000;color:#fff;padding:8px 12px;border-radius:12px;font-size:13px;cursor:text;" title="点击编辑">
          嗯，一起加油！
        </div>
      </div></div>
    
    <!-- 链接emoji -->
    <div style="text-align:center;margin-bottom:16px;">
      <div id="bb-home-link-emoji" contenteditable="true" style="font-size:48px;cursor:pointer;user-select:none;" title="点击编辑">💕</div>
    </div>
    
    <!-- 统计卡片 -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
      <div style="background:#222;border:1px solid #444;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:bold;color:#8b0000;" id="bb-home-msg-count">0</div>
        <div style="font-size:11px;color:#888;">💬 消息</div>
      </div>
      <div style="background:#222;border:1px solid #444;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:bold;color:#8b0000;" id="bb-home-time-count">0</div>
        <div style="font-size:11px;color:#888;">⏱️ 分钟</div>
      </div><div style="background:#222;border:1px solid #444;border-radius:8px;padding:16px;text-align:center;">
        <div id="bb-home-radio-text" contenteditable="true" style="font-size:14px;color:#fff;cursor:text;" title="点击编辑">骨与血电台</div><div style="font-size:11px;color:#888;">🎵 电台</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
      <button class="bb-sm-btn" id="bb-btn-set-user-avatar">📷 用户头像</button>
      <button class="bb-sm-btn" id="bb-btn-set-char-avatar">📷 角色头像</button>
      <button class="bb-sm-btn" id="bb-btn-save-home">💾 保存</button>
    </div>
  `;
}

// 布局3: 终端
function buildHomeTerminal() {
  return `
    <div style="background:#0a0a0a;border:2px solid #00ff00;border-radius:4px;padding:20px;font-family:'Courier New',monospace;color:#00ff00;margin-bottom:16px;">
      <div style="margin-bottom:12px;font-size:12px;color:#008800;">╔══════════════════════════════════════════╗<br/>
        ║  BONE & BLOOD TERMINAL v6.0              ║<br/>
        ╚══════════════════════════════════════════╝
      </div>
      
      <div style="margin-bottom:16px;">
        <span style="color:#888;">$</span> whoami<br/>
        <div style="display:flex;align-items:center;gap:12px;margin:8px 0;">
          <div class="bb-home-avatar" id="bb-home-user-avatar" style="width:40px;height:40px;border-radius:4px;background:#111;border:1px solid #00ff00;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:20px;">
            👤
          </div>
          <span id="bb-home-user-name" style="color:#00ff00;font-weight:bold;">用户名</span>
          <span style="color:#888;">@</span>
          <div class="bb-home-avatar" id="bb-home-char-avatar" style="width:40px;height:40px;border-radius:4px;background:#111;border:1px solid #00ff00;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:20px;">
            🎭
          </div>
          <span id="bb-home-char-name" style="color:#00ff00;font-weight:bold;">角色名</span>
        </div>
      </div>
      
      <div style="margin-bottom:12px;">
        <span style="color:#888;">$</span> status --link<br/>
        <span style="color:#ffff00;">LINK_EMOJI=</span><span id="bb-home-link-emoji" contenteditable="true" style="cursor:pointer;" title="点击编辑">💕</span>
      </div>
      
      <div style="margin-bottom:12px;">
        <span style="color:#888;">$</span> cat /var/log/chat.log | wc -l<br/>
        <span style="color:#ffff00;">MESSAGES=</span><span id="bb-home-msg-count" style="color:#00ff00;">0</span>
        <span style="color:#ffff00;margin-left:16px;">TIME=</span><span id="bb-home-time-count" style="color:#00ff00;">0</span><span style="color:#888;">min</span>
      </div>
      
      <div style="margin-bottom:12px;">
        <span style="color:#888;">$</span> echo $USER_MSG<br/>
        <div id="bb-home-user-bubble" contenteditable="true" style="color:#00ff00;padding:4px 0;cursor:text;" title="点击编辑">今天也要开心鸭~</div>
      </div>
      
      <div style="margin-bottom:12px;">
        <span style="color:#888;">$</span> echo $CHAR_MSG<br/>
        <div id="bb-home-char-bubble" contenteditable="true" style="color:#ff6600;padding:4px 0;cursor:text;" title="点击编辑">嗯，一起加油！</div>
      </div>
      
      <div style="margin-bottom:12px;">
        <span style="color:#888;">$</span> radio --now-playing<br/>
        <span style="color:#ffff00;">🎵 </span><span id="bb-home-radio-text" contenteditable="true" style="color:#00ff00;cursor:text;" title="点击编辑">骨与血电台</span>
      </div>
      
      <div style="margin-top:16px;border-top:1px solid #333;padding-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="bb-sm-btn" id="bb-btn-set-user-avatar" style="background:#111;border-color:#00ff00;color:#00ff00;">📷 usr_avatar</button>
        <button class="bb-sm-btn" id="bb-btn-set-char-avatar" style="background:#111;border-color:#00ff00;color:#00ff00;">📷 char_avatar</button>
        <button class="bb-sm-btn" id="bb-btn-save-home" style="background:#111;border-color:#00ff00;color:#00ff00;">💾 save</button>
      </div>
    </div>
  `;
}

// 布局4: 杂志
function buildHomeMagazine() {
  return `
    <div style="background:#222;border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <!--杂志头部 -->
      <div style="background:linear-gradient(135deg,#8b0000,#2a0000);padding:24px;text-align:center;">
        <div style="font-size:28px;font-weight:bold;color:#fff;letter-spacing:4px;margin-bottom:8px;">BONE & BLOOD</div>
        <div style="font-size:12px;color:#ffaaaa;letter-spacing:2px;">—跨越次元的羁绊 —</div>
      </div>
      
      <!-- 双人特写 -->
      <div style="display:flex;padding:20px;gap:20px;align-items:stretch;">
        <div style="flex:1;text-align:center;">
          <div class="bb-home-avatar" id="bb-home-user-avatar" style="width:100px;height:100px;border-radius:50%;background:#333;border:3px solid #8b0000;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:50px;margin:0 auto 12px;">
            👤
          </div>
          <div id="bb-home-user-name" style="font-size:20px;font-weight:bold;color:#fff;margin-bottom:8px;">用户名</div>
          <div id="bb-home-user-bubble" contenteditable="true" style="color:#aaa;font-style:italic;font-size:14px;cursor:text;line-height:1.6;" title="点击编辑">
            "今天也要开心鸭~"
          </div>
        </div>
        
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div id="bb-home-link-emoji" contenteditable="true" style="font-size:48px;cursor:pointer;user-select:none;" title="点击编辑">💕</div>
        </div>
        
        <div style="flex:1;text-align:center;">
          <div class="bb-home-avatar" id="bb-home-char-avatar" style="width:100px;height:100px;border-radius:50%;background:#333;border:3px solid #8b0000;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:50px;margin:0 auto 12px;">
            🎭
          </div>
          <div id="bb-home-char-name" style="font-size:20px;font-weight:bold;color:#fff;margin-bottom:8px;">角色名</div>
          <div id="bb-home-char-bubble" contenteditable="true" style="color:#aaa;font-style:italic;font-size:14px;cursor:text;line-height:1.6;" title="点击编辑">
            "嗯，一起加油！"
          </div>
        </div>
      </div>
      
      <!-- 数据栏 -->
      <div style="background:#1a1a1a;padding:16px;display:flex;justify-content:space-around;border-top:1px solid #444;">
        <div style="text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:#8b0000;" id="bb-home-msg-count">0</div>
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Messages</div>
        </div>
        <div style="width:1px;background:#444;"></div>
        <div style="text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:#8b0000;" id="bb-home-time-count">0</div>
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Minutes</div>
        </div>
        <div style="width:1px;background:#444;"></div>
        <div style="text-align:center;">
          <div id="bb-home-radio-text" contenteditable="true" style="font-size:16px;color:#fff;cursor:text;" title="点击编辑">骨与血电台</div>
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Now Playing</div>
        </div>
      </div>
      <div style="padding:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
        <button class="bb-sm-btn" id="bb-btn-set-user-avatar">📷 用户头像</button>
        <button class="bb-sm-btn" id="bb-btn-set-char-avatar">📷 角色头像</button>
        <button class="bb-sm-btn" id="bb-btn-save-home">💾 保存配置</button>
      </div>
    </div>
  `;
}

function getTabNames() {
  const s = getSettings();
  const preset = s.style_preset;
  if (preset === 'custom' && Object.keys(s.custom_names).length > 0) {
    return s.custom_names;
  }
  return STYLE_PRESETS[preset] || STYLE_PRESETS.gothic;
}

function refreshFloatingUI() {
  const wasVisible = $('#bb-main-panel').css('display') !== 'none';
  $('#bb-main-panel').remove();
  $('body').append(buildMainPanelHTML());
  bindMainPanelEvents();
  renderAll();
  if (wasVisible) {
    $('#bb-main-panel').css('display', 'flex');
  }
}

//============================================
// 修复：头像按钮事件（v0.5.0）
// ============================================

function bindMainPanelEvents() {
  // 关闭按钮
  $('#bb-close-btn').on('click', () => $('#bb-main-panel').css('display', 'none'));

  // Tab切换
  $('.bb-tab').on('click', function () {
    const tab = $(this).data('tab');
    $('.bb-tab').removeClass('active');
    $(this).addClass('active');
    $('.bb-tab-panel').hide();
    $(`#bb-tab-${tab}`).show();
  });
  
  // v6.0 布局快速切换
  $('#bb-layout-switch').on('change', function () {
    const val = $(this).val();
    getSettings().layout_preset = val;
    saveSettings();
    refreshFloatingUI();
    // 重新显示面板
    $('#bb-main-panel').css('display', 'flex');
  });

  // 首页：头像点击（修复版）
  $(document).on('click', '#bb-home-user-avatar, #bb-home-char-avatar', function () {
    const isUser = $(this).attr('id') === 'bb-home-user-avatar';
    const avatarEl = $(this);
    
    // 创建弹窗选择方式
    const modal = $(`
      <div class="bb-modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;">
        <div class="bb-modal-content" style="background:var(--bb-bg-main);border:3px solid var(--bb-primary);border-radius:12px;padding:24px;width:90%;max-width:400px;box-shadow:var(--bb-shadow-lg);">
          <h3 style="color:var(--bb-primary);margin:0 0 16px;text-align:center;">设置${isUser ? '用户' : '角色'}头像</h3>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <button class="bb-big-btn" id="bb-avatar-url" style="width:100%;">🔗 输入URL</button>
            <button class="bb-big-btn" id="bb-avatar-file" style="width:100%;">📁 上传文件</button>
            <button class="bb-sm-btn" id="bb-avatar-cancel" style="width:100%;background:#444;">取消</button>
          </div>
        </div>
      </div>
    `);
    
    $('body').append(modal);
    
    // URL输入
    modal.find('#bb-avatar-url').on('click', function () {
      modal.remove();
      const url = prompt('请输入头像URL:');
      if (url) {
        avatarEl.html(`<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />`);
        if (isUser) pluginData.home_config.user_avatar = url;
        else pluginData.home_config.char_avatar = url;
        saveChatData();
        toastr.success('头像已更新');
      }
    });
    
    // 文件上传
    modal.find('#bb-avatar-file').on('click', function () {
      modal.remove();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          toastr.error('文件过大，请选择小于5MB的图片');
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataURL = ev.target.result;
          avatarEl.html(`<img src="${dataURL}" style="width:100%;height:100%;object-fit:cover;" />`);
          if (isUser) pluginData.home_config.user_avatar = dataURL;
          else pluginData.home_config.char_avatar = dataURL;
          saveChatData();
          toastr.success('头像已上传');
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
    
    // 取消
    modal.find('#bb-avatar-cancel').on('click', function () {
      modal.remove();
    });
  });

  // 首页：保存配置（修复版）
  $(document).on('click', '#bb-btn-save-home', function () {
    pluginData.home_config.link_emoji = $('#bb-home-link-emoji').text();
    pluginData.home_config.user_bubble = $('#bb-home-user-bubble').text();
    pluginData.home_config.char_bubble = $('#bb-home-char-bubble').text();
    pluginData.home_config.radio_text = $('#bb-home-radio-text').text();
    saveChatData();
    toastr.success('💾 首页配置已保存');
  });

  // 导出按钮
  $('#bb-btn-export-md').on('click', exportAsMarkdown);
  $('#bb-btn-export-json').on('click', exportAsJSON);

  // 生成按钮
  $('#bb-btn-gen-diary-tab').on('click', generateDiary);
  $('#bb-btn-add-npc').on('click', () => {
    const name = prompt('输入NPC名称:');
    if (!name) return;
    if (pluginData.npc_status[name]) {
      toastr.info('该NPC已存在');
      return;
    }
    pluginData.npc_status[name] = { description: '等待窥探...', lastUpdate: '' };
    saveChatData();
    renderIntel();
    toastr.success(`➕ 已添加NPC: ${name}`);
  });

  $('#bb-btn-auto-npc').on('click', autoNPCPeek);
  $('#bb-btn-gen-weather-tab').on('click', generateWeather);
  $('#bb-btn-gen-vibe-tab').on('click', generateVibe);
  $('#bb-btn-roll-fate').on('click', rollFate);

  // 破墙聊天室
  $('#bb-btn-open-ooc-win').on('click', () => $('#bb-ooc-win').css('display', 'flex'));
  $('#bb-btn-clear-ooc').on('click', () => {
    if (!confirm('确认清空破墙聊天历史?')) return;
    pluginData.ooc_chat = [];
    oocSession.history = [];
    saveChatData();
    renderOOCPreview();
    toastr.info('🗑️ 已清空');
  });

  // 世界频段
  $('#bb-btn-add-feed').on('click', () => {
    const content = prompt('输入消息内容:');
    if (!content) return;
    pluginData.world_feed.push({
      type: 'custom',
      content,
      timestamp: new Date().toLocaleString('zh-CN'),});
    saveChatData();
    renderWorldFeed();
    updateMarquee();
  });

  $('#bb-btn-gen-feed').on('click', generateWorldFeed);
  $('#bb-btn-clear-feed').on('click', () => {
    if (!confirm('确认清空世界频段?')) return;
    pluginData.world_feed = [];
    saveChatData();
    renderWorldFeed();
    updateMarquee();
    toastr.info('🗑️ 已清空');
  });
  // v6.0 画廊
  $('#bb-btn-gen-img').on('click', async () => {
    const promptText = prompt('输入图片描述（prompt）:', '');
    if (!promptText) return;
    
    const result = await generateImage(promptText);
    if (result) {
      renderGallery();}
  });
}

// ============================================
// 蝴蝶窗口（平行宇宙）
// ============================================

function injectButterflyWindow() {
  if ($('#bb-bf-win').length > 0) return;

  $('body').append(`
    <div id="bb-bf-win" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:600px;height:70%;background:#1a1a1a;border:3px solid #8b0000;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.8);z-index:10001;flex-direction:column;"><div class="bb-bf-header" style="background:#000;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #8b0000;">
        <div style="font-size:16px;font-weight:bold;">🦋 平行宇宙</div>
        <button id="bb-bf-close" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;">✖</button>
      </div>

      <div id="bb-bf-origin" style="background:#222;padding:12px;border-bottom:1px solid #444;color:#aaa;font-size:13px;max-height:80px;overflow-y:auto;"></div>

      <div id="bb-bf-chat" style="flex:1;overflow-y:auto;padding:12px;background:#1a1a1a;"></div>

      <div style="background:#222;padding:12px;border-top:1px solid #444;display:flex;gap:8px;">
        <input id="bb-bf-input" type="text" placeholder="输入消息..." style="flex:1;padding:8px;background:#333;border:1px solid #555;color:#fff;border-radius:4px;" />
        <button id="bb-bf-send" style="padding:8px 16px;background:#8b0000;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">发送</button><button id="bb-bf-export" style="padding:8px 12px;background:#444;color:#fff;border:none;border-radius:4px;cursor:pointer;" title="导出对话">📄</button>
      </div>
    </div>
  `);

  $('#bb-bf-close').on('click', () => $('#bb-bf-win').css('display', 'none'));
  $('#bb-bf-send').on('click', sendBfMsg);
  $('#bb-bf-input').on('keypress', (e) => { if (e.which === 13) sendBfMsg(); });
  $('#bb-bf-export').on('click', exportBfChat);
}

function openBfWin(messageId) {
  const ctx = getContext();
  const msg = ctx.chat[messageId];
  if (!msg) { toastr.error('未找到消息'); return; }

  butterflySession = {
    active: true,
    originFloor: messageId,
    originText: msg.mes,
    history: [],
  };

  $('#bb-bf-origin').html(`<b>原文(#${messageId}):</b> ${esc(msg.mes.substring(0, 200))}${msg.mes.length > 200 ? '...' : ''}`);
  $('#bb-bf-chat').empty();
  $('#bb-bf-win').css('display', 'flex');

  toastr.info('🦋 平行宇宙已开启，输入你的选择...');
}

async function sendBfMsg() {
  const input = $('#bb-bf-input');
  const userMsg = input.val().trim();
  if (!userMsg) return;

  input.val('');
  addBfBubble('user', userMsg);
  butterflySession.history.push({ role: 'user', content: userMsg });

  if (butterflySession.history.length === 1) {
    await genBfFirst(userMsg);
  } else {
    const preset = getActivePreset();
    const aiReply = await callSubAPI([
      { role: 'system', content: preset.prompts.butterfly },
      ...butterflySession.history,
    ], 500);

    if (aiReply) {
      addBfBubble('assistant', aiReply);
      butterflySession.history.push({ role: 'assistant', content: aiReply });
    }
  }
}

async function genBfFirst(userChoice) {
  toastr.info('🦋 生成平行宇宙中...');
  const preset = getActivePreset();
  const prompt = `${preset.prompts.butterfly}\n\n原文:\n${butterflySession.originText}\n\n用户选择:\n${userChoice}`;

  const result = await callSubAPI([
    { role: 'system', content: prompt },
  ], 600);

  if (result) {
    addBfBubble('assistant', result);
    butterflySession.history.push({ role: 'assistant', content: result });

    pluginData.parallel_universes.push({
      floor: butterflySession.originFloor,
      origin: butterflySession.originText,
      content: result,
      date: new Date().toLocaleString('zh-CN'),
    });
    saveChatData();
    renderParallel();
    toastr.success('🦋 平行宇宙已生成！');
  }
}

function addBfBubble(role, text) {
  const isUser = role === 'user';
  const bubble = `
    <div style="display:flex;justify-content:${isUser ? 'flex-end' : 'flex-start'};margin-bottom:12px;">
      <div style="background:${isUser ? '#444' : '#8b0000'};color:#fff;padding:10px 14px;border-radius:${isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};max-width:80%;word-wrap:break-word;">
        ${esc(text)}
      </div>
    </div>
  `;
  $('#bb-bf-chat').append(bubble);$('#bb-bf-chat').scrollTop($('#bb-bf-chat')[0].scrollHeight);
}

function exportBfChat() {
  if (butterflySession.history.length === 0) {
    toastr.warning('暂无对话');
    return;
  }

  let md = `# 🦋 平行宇宙对话\n\n## 原文 (#${butterflySession.originFloor})\n${butterflySession.originText}\n\n## 对话记录\n\n`;
  butterflySession.history.forEach(m => {
    md += `**${m.role === 'user' ? '你' : '角色'}:** ${m.content}\n\n`;
  });

  dl(`butterfly_${butterflySession.originFloor}_${Date.now()}.md`, md, 'text/markdown');
  toastr.success('📄 已导出蝴蝶对话');
}

// ============================================
// 破墙聊天室（OOC窗口）
// ============================================

function injectOOCWindow() {
  if ($('#bb-ooc-win').length > 0) return;

  $('body').append(`
    <div id="bb-ooc-win" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:600px;height:70%;background:#1a1a1a;border:3px solid #8b0000;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.8);z-index:10001;flex-direction:column;">
      
      <div class="bb-ooc-header" style="background:#000;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #8b0000;">
        <div style="font-size:16px;font-weight:bold;">Burning Star chat</div>
        <button id="bb-ooc-close" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;">✖</button>
      </div>

      <div id="bb-ooc-chat" style="flex:1;overflow-y:auto;padding:12px;background:#1a1a1a;"></div>

      <div style="background:#222;padding:12px;border-top:1px solid #444;display:flex;gap:8px;">
        <input id="bb-ooc-input" type="text" placeholder="在这里，你可以和TA聊聊天外的故事..." style="flex:1;padding:8px;background:#333;border:1px solid #555;color:#fff;border-radius:4px;" />
        <button id="bb-ooc-send" style="padding:8px 16px;background:#8b0000;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">发送</button>
      </div>
    </div>
  `);

  $('#bb-ooc-close').on('click', () => $('#bb-ooc-win').css('display', 'none'));
  $('#bb-ooc-send').on('click', sendOOCMsg);$('#bb-ooc-input').on('keypress', (e) => { if (e.which === 13) sendOOCMsg(); });

  // 加载历史
  renderOOCChat();
}

async function sendOOCMsg() {
  const input = $('#bb-ooc-input');
  const userMsg = input.val().trim();
  if (!userMsg) return;

  input.val('');
  
  // 添加用户消息
  pluginData.ooc_chat.push({
    role: 'user',
    content: userMsg,
    timestamp: new Date().toLocaleString('zh-CN'),
  });
  oocSession.history.push({ role: 'user', content: userMsg });
  
  addOOCBubble('user', userMsg);
  saveChatData();

  // 调用AI
  const ctx = getContext();
  const oocPreset = getActiveOOCPreset();
  
  // 根据语气风格构建额外指令
  const toneMap = {
    warm: '请用温柔、真诚、治愈的语气回应。如果用户看起来疲惫或难过，给予温暖的关怀。',
    professional: '请用专业、理性、有条理的方式回应。重点分析剧情和角色塑造。',
    casual: '请用轻松、随意、朋友般的语气回应。可以开玩笑，保持自然。',
    roleplay: '请以角色身份但不在RP状态下自然回应。保持角色的性格特征但不进行剧情推进。',
  };
  
  // 构建系统提示词（v6.0 使用独立OOC预设）
  const systemPrompt = `${oocPreset.system_prompt}

你正在与用户进行一场跨越次元的对话。这是一个安全的空间，用户可以：
- 和你聊聊生活中的小事
- 分享今天的心情和感受
- 讨论剧情走向和角色想法
- 寻求情感支持和温暖陪伴

当前角色名: ${ctx.name2|| '角色'}
用户名: ${ctx.name1 || '用户'}
真实时间: ${new Date().toLocaleString('zh-CN')}

${toneMap[oocPreset.tone] || toneMap.warm}
${oocPreset.extra_context ? '\n额外上下文: ' + oocPreset.extra_context : ''}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...oocSession.history,
  ];

  const aiReply = await callSubAPI(messages, 400);

  if (aiReply) {
    pluginData.ooc_chat.push({
      role: 'assistant',
      content: aiReply,
      timestamp: new Date().toLocaleString('zh-CN'),
    });
    oocSession.history.push({ role: 'assistant', content: aiReply });
    
    addOOCBubble('assistant', aiReply);
    saveChatData();
    renderOOCPreview();
  }
}

function addOOCBubble(role, text) {
  const isUser = role === 'user';
  const bubble = `
    <div style="display:flex;justify-content:${isUser ? 'flex-end' : 'flex-start'};margin-bottom:12px;">
      <div style="background:${isUser ? '#444' : '#8b0000'};color:#fff;padding:10px 14px;border-radius:${isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};max-width:80%;word-wrap:break-word;font-size:14px;">
        ${esc(text)}
      </div>
    </div>
  `;
  $('#bb-ooc-chat').append(bubble);
  $('#bb-ooc-chat').scrollTop($('#bb-ooc-chat')[0].scrollHeight);
}

function renderOOCChat() {
  $('#bb-ooc-chat').empty();
  pluginData.ooc_chat.forEach(m => {
    addOOCBubble(m.role, m.content);
  });
}

function renderOOCPreview() {
  const preview = $('#bb-ooc-preview');
  preview.empty();
  
  if (pluginData.ooc_chat.length === 0) {
    preview.html(`<div class="bb-empty" style="text-align:center;color:#888;">这里是跨越次元的聊天窗口，点击上方按钮，和ta聊聊剧本之外的故事吧！</div>`);
    return;
  }

  pluginData.ooc_chat.slice(-5).forEach(m => {
    const isUser = m.role === 'user';
    preview.append(`
      <div style="display:flex;justify-content:${isUser ? 'flex-end' : 'flex-start'};margin-bottom:10px;">
        <div style="background:${isUser ? '#333' : '#8b0000'};color:#fff;padding:8px 12px;border-radius:${isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px'};max-width:80%;font-size:13px;">
          ${esc(m.content)}
        </div>
      </div>
    `);
  });
  if (pluginData.ooc_chat.length > 5) {
    preview.prepend(`<div style="text-align:center;color:#888;font-size:12px;margin-bottom:12px;">...仅显示最近5条，点击打开查看全部</div>`);
  }
}

// ============================================
// 事件监听
// ============================================

function registerEventListeners() {
  eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (msgId) => {
    if (!getSettings().enabled) return;
    injectMessageButtons(msgId);
    incrementMessageCounter();
  });

  eventSource.on(event_types.USER_MESSAGE_RENDERED, (msgId) => {
    if (!getSettings().enabled) return;
    injectMessageButtons(msgId);
  });

  eventSource.on(event_types.CHAT_CHANGED, () => {
    loadChatData();
    getSettings().message_counter = 0;
    saveSettings();
    updateCharInfo();
    setTimeout(() => injectButtonsToExistingMessages(), 500);
  });
}

// ============================================
// 按钮注入
// ============================================

function injectButtonsToExistingMessages() {
  const ctx = getContext();
  if (!ctx.chat) return;
  ctx.chat.forEach((_, idx) => injectMessageButtons(idx));
  console.log(`[骨与血] 已为${ctx.chat.length} 条消息注入按钮`);
}

function injectMessageButtons(messageId) {
  const mesEl = $(`.mes[mesid="${messageId}"]`);
  if (mesEl.length === 0) return;
  if (mesEl.find('.bb-msg-btns').length > 0) return; // 已注入

  const btnHtml = `<span class="bb-msg-btns" style="display:inline-flex;gap:3px;margin-left:4px;font-size:15px;cursor:pointer;">
    <span class="bb-btn-star" title="🌟 收藏语录" data-mid="${messageId}">🌟</span>
    <span class="bb-btn-butterfly" title="🦋 平行宇宙" data-mid="${messageId}">🦋</span>
  </span>`;

  // 多位置兼容注入
  const targets = [
    mesEl.find('.extraMesButtons'),
    mesEl.find('.mes_buttons'),
    mesEl.find('.mes_block'),
    mesEl,
  ];

  let injected = false;
  for (const target of targets) {
    if (target.length > 0) {
      target.first().append(btnHtml);
      injected = true;
      break;
    }
  }

  if (!injected) return;

  // 绑定事件
  mesEl.find('.bb-btn-star').off('click').on('click', function () {
    collectMessage($(this).data('mid'));
  });
  mesEl.find('.bb-btn-butterfly').off('click').on('click', function () {
    openBfWin($(this).data('mid'));
  });
}

// ============================================
// 收藏功能
// ============================================

function collectMessage(messageId) {
  const ctx = getContext();
  const msg = ctx.chat[messageId];
  if (!msg) { toastr.error('未找到消息'); return; }

  // 检查重复
  const exists = pluginData.records_bone.some(r => r.messageId === messageId);
  if (exists) { toastr.info('已收藏过该条语录'); return; }

  pluginData.records_bone.push({
    messageId,
    character: msg.name || (msg.is_user ? ctx.name1 : ctx.name2),
    text: msg.mes,
    timestamp: new Date().toLocaleString('zh-CN'),
    isUser: msg.is_user,
  });

  saveChatData();
  renderScrapbook();
  toastr.success(`🌟 已收藏 #${messageId}`);
  checkAchievements(); // 检查成就
}

// ============================================
// 渲染函数
// ============================================

function renderAll() {
  renderScrapbook();
  renderDiary();
  renderIntel();
  renderParallel();
  renderFateHistory();
  renderWorldFeed();
  renderAchievements();
  renderOOCPreview();
  renderGallery();
  updateCharInfo();
  updateMarquee();
}

function updateCharInfo() {
  const ctx = getContext();
  $('#bb-home-user-name').text(ctx.name1 || '用户名');
  $('#bb-home-char-name').text(ctx.name2 || '角色名');
  
  const msgCount = ctx.chat ? ctx.chat.length : 0;
  $('#bb-home-msg-count').text(msgCount);
  $('#bb-home-time-count').text(msgCount * 2); // 假设每条2分钟

  // 加载首页配置
  if (pluginData.home_config.user_avatar) {
    $('#bb-home-user-avatar').html(`<img src="${pluginData.home_config.user_avatar}" style="width:100%;height:100%;object-fit:cover;" />`);
  }
  if (pluginData.home_config.char_avatar) {
    $('#bb-home-char-avatar').html(`<img src="${pluginData.home_config.char_avatar}" style="width:100%;height:100%;object-fit:cover;" />`);
  }
  
  $('#bb-home-link-emoji').text(pluginData.home_config.link_emoji || '💕');
  $('#bb-home-user-bubble').text(pluginData.home_config.user_bubble || '今天也要开心鸭~');
  $('#bb-home-char-bubble').text(pluginData.home_config.char_bubble || '嗯，一起加油！');
  $('#bb-home-radio-text').text(pluginData.home_config.radio_text || '骨与血电台');
}

function renderScrapbook() {
  const list = $('#bb-records-list');
  list.empty();

  if (pluginData.records_bone.length === 0) {
    $('#bb-scrap-empty').show();
    $('.bb-export-bar').hide();
    return;
  }

  $('#bb-scrap-empty').hide();
  $('.bb-export-bar').show();

  pluginData.records_bone.forEach((r, idx) => {
    list.append(`
      <div class="bb-record-item" style="background:#222;border:1px solid #444;border-radius:8px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="color:#8b0000;font-weight:bold;">${esc(r.character)}</span>
          <span style="display:flex;gap:8px;align-items:center;">
            <span style="font-size:12px;color:#888;">${r.timestamp}</span>
            <span class="bb-record-del" data-idx="${idx}" style="cursor:pointer;font-size:14px;" title="删除">🗑️</span>
          </span>
        </div>
        <div style="color:#ddd;line-height:1.5;">${esc(r.text)}</div>
      </div>
    `);
  });

  list.find('.bb-record-del').on('click', function () {
    const idx = $(this).data('idx');
    if (!confirm('确认删除该语录?')) return;
    pluginData.records_bone.splice(idx, 1);
    saveChatData();
    renderScrapbook();
    toastr.info('已删除语录');
  });
}

function renderDiary() {
  const list = $('#bb-diary-list');
  list.empty();

  if (pluginData.diary_blood.length === 0) {
    $('#bb-diary-empty').show();
    return;
  }

  $('#bb-diary-empty').hide();

  pluginData.diary_blood.forEach((d, idx) => {
    list.append(`
      <div class="bb-diary-item" style="background:#222;border:1px solid #444;border-radius:8px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #444;padding-bottom:8px;">
          <span style="color:#8b0000;font-size:15px;">📅 ${d.date}</span>
          <span class="bb-diary-del" data-idx="${idx}" style="cursor:pointer;font-size:14px;" title="删除">🗑️</span>
        </div>
        <div style="color:#ddd;line-height:1.6;white-space:pre-wrap;">${esc(d.content)}</div>
      </div>
    `);
  });

  list.find('.bb-diary-del').on('click', function () {
    const idx = $(this).data('idx');
    if (!confirm('确认删除该日记?')) return;
    pluginData.diary_blood.splice(idx, 1);
    saveChatData();
    renderDiary();
    toastr.info('已删除日记');
  });
}

function renderIntel() {
  const npcBox = $('#bb-npc-box');
  npcBox.empty();
  const npcNames = Object.keys(pluginData.npc_status);
  
  if (npcNames.length === 0) {
    npcBox.html('<p class="bb-empty" style="text-align:center;color:#888;padding:40px;">暂无追踪的 NPC<br/>点击上方添加</p>');
    return;
  }

  npcNames.forEach(name => {
    const info = pluginData.npc_status[name];
    npcBox.append(`
      <div class="bb-npc-card" style="background:#222;border:1px solid #444;border-radius:8px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="color:#8b0000;font-weight:bold;font-size:15px;">🧑‍🤝‍🧑 ${esc(name)}</span>
          <span style="display:flex;gap:6px;">
            <button class="bb-sm-btn bb-npc-peek" data-name="${esc(name)}" title="窥探" style="padding:4px 8px;font-size:12px;">🔍</button>
            <button class="bb-sm-btn bb-npc-del" data-name="${esc(name)}" title="移除" style="padding:4px 8px;font-size:12px;">🗑️</button>
          </span>
        </div>
        <div style="color:#ddd;line-height:1.5;margin-bottom:6px;">${esc(info.description || '等待窥探...')}</div>
        <div style="font-size:11px;color:#666;">${info.lastUpdate || ''}</div>
      </div>
    `);
  });

  npcBox.find('.bb-npc-peek').on('click', function () {
    generateNPCStatus($(this).data('name'));
  });
  npcBox.find('.bb-npc-del').on('click', function () {
    const n = $(this).data('name');
    if (!confirm(`确认移除NPC: ${n}?`)) return;
    delete pluginData.npc_status[n];
    saveChatData();
    renderIntel();
    toastr.info(`已移除 ${n}`);
  });
}

function renderParallel() {
  const list = $('#bb-par-list');
  list.empty();

  if (pluginData.parallel_universes.length === 0) {
    $('#bb-par-empty').show();
    return;
  }

  $('#bb-par-empty').hide();

  pluginData.parallel_universes.forEach((p, idx) => {
    list.append(`
      <div class="bb-par-item" style="background:#222;border:1px solid #444;border-radius:8px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="color:#8b0000;font-weight:bold;">🦋 #${p.floor} — ${p.date}</span>
          <span class="bb-par-del" data-idx="${idx}" style="cursor:pointer;font-size:14px;" title="删除">🗑️</span>
        </div>
        <div style="background:#1a1a1a;padding:8px;border-left:3px solid #8b0000;margin-bottom:8px;font-size:13px;color:#aaa;">
          <b>原文:</b> ${esc((p.origin || '').substring(0, 60))}...
        </div>
        <div style="color:#ddd;line-height:1.5;white-space:pre-wrap;">${esc(p.content)}</div>
      </div>
    `);
  });

  list.find('.bb-par-del').on('click', function () {
    const idx = $(this).data('idx');
    if (!confirm('确认删除该平行宇宙记录?')) return;
    pluginData.parallel_universes.splice(idx, 1);
    saveChatData();
    renderParallel();
    toastr.info('已删除平行宇宙记录');
  });
}

function renderFateHistory() {
  const list = $('#bb-fate-history-list');
  list.empty();

  if (pluginData.fate_history.length === 0) {
    list.html('<div class="bb-empty" style="text-align:center;color:#888;padding:20px;">暂无命运历史</div>');
    return;
  }

  pluginData.fate_history.slice(-5).reverse().forEach((f, idx) => {
    list.append(`
      <div style="background:#222;border:1px solid #444;border-radius:8px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="color:#8b0000;font-size:13px;">[${f.timestamp}] #${f.floor}</span>
          <span class="bb-fate-del" data-idx="${pluginData.fate_history.length - 1 - idx}" style="cursor:pointer;font-size:14px;" title="删除">🗑️</span>
        </div>
        <div style="color:#ddd;line-height:1.5;">${esc(f.content)}</div>
      </div>
    `);
  });

  if (pluginData.fate_history.length > 5) {
    list.prepend(`<div style="text-align:center;color:#888;font-size:12px;margin-bottom:12px;">仅显示最近5条</div>`);
  }

  list.find('.bb-fate-del').on('click', function () {
    const idx = $(this).data('idx');
    pluginData.fate_history.splice(idx, 1);
    saveChatData();
    renderFateHistory();
    toastr.info('已删除命运记录');
  });
}

function renderWorldFeed() {
  const list = $('#bb-world-feed-list');
  list.empty();

  if (pluginData.world_feed.length === 0) {
    list.html('<div class="bb-empty" style="text-align:center;color:#888;padding:40px;">暂无世界频段消息</div>');
    return;
  }

  pluginData.world_feed.forEach((f, idx) => {
    const icon = f.type === 'gossip' ? '💬' : f.type === 'news' ? '📰' : '✨';
    list.append(`
      <div style="background:#222;border:1px solid #444;border-radius:8px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="color:#8b0000;">${icon} ${f.timestamp}</span>
          <span class="bb-feed-del" data-idx="${idx}" style="cursor:pointer;font-size:14px;" title="删除">🗑️</span>
        </div>
        <div style="color:#ddd;line-height:1.5;">${esc(f.content)}</div>
      </div>
    `);
  });

  list.find('.bb-feed-del').on('click', function () {
    const idx = $(this).data('idx');
    pluginData.world_feed.splice(idx, 1);
    saveChatData();
    renderWorldFeed();
    updateMarquee();
    toastr.info('已删除消息');
  });
}

function renderAchievements() {
  const list = $('#bb-ach-list');
  list.empty();

  const allAchievements = [
    { id: 'chat_100', name: '初见倾心', desc: '聊天达到100条', icon: '💬', check: () => (getContext().chat?.length || 0) >= 100 },
    { id: 'chat_500', name: '相知相伴', desc: '聊天达到500条', icon: '💕', check: () => (getContext().chat?.length || 0) >= 500 },
    { id: 'chat_1000', name: '生死相依', desc: '聊天达到1000条', icon: '💍', check: () => (getContext().chat?.length || 0) >= 1000 },
    { id: 'scrap_10', name: '拾荒者', desc: '收藏10条语录', icon: '🌟', check: () => pluginData.records_bone.length >= 10 },
    { id: 'scrap_50', name: '收藏家', desc: '收藏50条语录', icon: '📚', check: () => pluginData.records_bone.length >= 50 },
    { id: 'scrap_100', name: '记忆宝库', desc: '收藏100条语录', icon: '💎', check: () => pluginData.records_bone.length >= 100 },
    { id: 'diary_5', name: '日记新手', desc: '生成5篇日记', icon: '📖', check: () => pluginData.diary_blood.length >= 5 },
    { id: 'diary_20', name: '日记达人', desc: '生成20篇日记', icon: '🖋️', check: () => pluginData.diary_blood.length >= 20 },
    { id: 'parallel_1', name: '破壁者', desc: '开启1次平行宇宙', icon: '🦋', check: () => pluginData.parallel_universes.length >= 1 },
    { id: 'parallel_10', name: '多元旅者', desc: '开启10次平行宇宙', icon: '🌌', check: () => pluginData.parallel_universes.length >= 10 },
    { id: 'fate_lucky', name: '幸运眷顾', desc: '命运骰子出现"幸运"关键词', icon: '🍀', check: () => pluginData.fate_history.some(f => f.content.includes('幸运')) },
    { id: 'fate_crisis', name: '劫后余生', desc: '命运骰子出现"危机"关键词', icon: '⚠️', check: () => pluginData.fate_history.some(f => f.content.includes('危机')) },
  ];

  let unlockedCount = 0;

  allAchievements.forEach(ach => {
    const unlocked = ach.check();
    const saved = pluginData.achievements.find(a => a.id === ach.id);
    
    if (unlocked) unlockedCount++;

    list.append(`
      <div style="background:${unlocked ? '#222' : '#111'};border:1px solid ${unlocked ? '#8b0000' : '#333'};border-radius:8px;padding:12px;margin-bottom:12px;opacity:${unlocked ? '1' : '0.5'};">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-size:32px;">${unlocked ? ach.icon : '🔒'}</div>
          <div style="flex:1;">
            <div style="color:${unlocked ? '#8b0000' : '#666'};font-weight:bold;font-size:15px;">${ach.name}</div>
            <div style="color:#888;font-size:13px;">${ach.desc}</div>
            ${saved ? `<div style="color:#666;font-size:11px;margin-top:4px;">解锁于: ${saved.date}</div>` : ''}
          </div>
        </div>
      </div>
    `);
  });

  $('#bb-ach-count').text(unlockedCount);
  $('#bb-ach-total').text(allAchievements.length);
}

//============================================
// 画廊渲染 (v6.0 新增)
// ============================================

function renderGallery() {
  const list = $('#bb-gallery-list');
  const empty = $('#bb-gallery-empty');
  list.empty();
  
  if (!pluginData.generated_images || pluginData.generated_images.length === 0) {
    empty.show();
    return;
  }
  
  empty.hide();
  
  pluginData.generated_images.forEach((img) => {
    list.append(`
      <div class="bb-gallery-item" style="background:#222;border:1px solid #444;border-radius:8px;overflow:hidden;">
        <div style="width:100%;aspect-ratio:3/4;overflow:hidden;">
          <img src="${img.data}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div style="padding:8px;">
          <div style="font-size:11px;color:#888;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(img.prompt)}">${esc(img.prompt)}</div>
          <div style="font-size:10px;color:#666;margin-bottom:6px;">${img.timestamp}</div>
          <div style="display:flex;gap:4px;">
            <button class="bb-sm-btn bb-img-reroll" data-id="${img.id}" style="flex:1;padding:4px;font-size:11px;">🔄 重roll</button>
            <button class="bb-sm-btn bb-img-del" data-id="${img.id}" style="flex:1;padding:4px;font-size:11px;">🗑️ 删除</button>
          </div>
        </div>
      </div>
    `);
  });
  
  list.find('.bb-img-reroll').on('click', async function () {
    const id = $(this).data('id');
    await rerollImage(id);
    renderGallery();
  });
  
  list.find('.bb-img-del').on('click', function () {
    const id = $(this).data('id');
    if (!confirm('确认删除该图片?')) return;
    deleteGeneratedImage(id);
    renderGallery();
  });
}

// ============================================
// AI 生成功能
// ============================================

async function generateDiary() {
  const ctx = getContext();
  const cn = ctx.name2 || '角色';
  toastr.info(`📖 ${cn} 正在写日记...`);

  const recent = getRecentChat(30);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }

  const preset = getActivePreset();
  const result = await callSubAPI([
    { role: 'system', content: `你是"${cn}"。${preset.prompts.diary}` },
    { role: 'user', content: fmt(recent) },
  ], 600);

  if (result) {
    pluginData.diary_blood.push({
      date: new Date().toLocaleString('zh-CN'),
      content: result,
      character: cn,
    });
    saveChatData();
    renderDiary();
    toastr.success(`📖 ${cn} 的日记已更新！`);
    checkAchievements();
  }
}

async function generateSummary() {
  toastr.info('📜 正在生成阿卡夏记录...');

  const recent = getRecentChat(40);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }

  const preset = getActivePreset();
  const result = await callSubAPI([
    { role: 'system', content: preset.prompts.summary },
    { role: 'user', content: fmt(recent) },
  ], 500);

  if (result) {
    pluginData.summaries.push({
      date: new Date().toLocaleString('zh-CN'),
      content: result,
    });
    saveChatData();
    toastr.success('📜 阿卡夏记录已更新！');
  }
}

async function generateWeather() {
  toastr.info('☁️ 正在扫描环境...');

  const recent = getRecentChat(20);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }

  const preset = getActivePreset();
  const result = await callSubAPI([
    { role: 'system', content: preset.prompts.weather },
    { role: 'user', content: fmt(recent) },
  ], 300);

  if (result) {
    pluginData.weather = result;
    saveChatData();
    $('#bb-weather-box').html(esc(result));
    toastr.success('☁️ 环境雷达已更新！');
  }
}

async function generateVibe() {
  toastr.info('❤️ 正在分析氛围...');

  const recent = getRecentChat(20);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }

  const preset = getActivePreset();
  const result = await callSubAPI([
    { role: 'system', content: preset.prompts.vibe },
    { role: 'user', content: fmt(recent) },
  ], 300);

  if (result) {
    pluginData.vibe = result;
    saveChatData();
    $('#bb-vibe-box').html(esc(result));
    toastr.success('❤️ 氛围心电图已更新！');
  }
}

async function generateNPCStatus(name) {
  toastr.info(`🔍 正在窥探 ${name}...`);

  const recent = getRecentChat(30);
  const preset = getActivePreset();
  const result = await callSubAPI([
    { role: 'system', content: `${preset.prompts.npc}\nNPC名称: ${name}` },
    { role: 'user', content: fmt(recent) },
  ], 400);

  if (result) {
    pluginData.npc_status[name] = {
      description: result,
      lastUpdate: new Date().toLocaleString('zh-CN'),
    };
    saveChatData();
    renderIntel();
    toastr.success(`🔍 ${name} 的情报已更新！`);
  }
}

async function autoNPCPeek() {
  toastr.info('🎲 分析剧情中的NPC...');

  const recent = getRecentChat(40);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }

  const ctx = getContext();
  const result = await callSubAPI([
    { role: 'system', content: `分析以下对话，提取出1-2个出现过的NPC名字（不包括用户"${ctx.name1}"和主角"${ctx.name2}"）。只返回名字，用逗号分隔，不要其他内容。如果没有NPC，返回"无"。` },
    { role: 'user', content: fmt(recent) },
  ], 100);

  if (!result || result === '无') {
    toastr.warning('未检测到NPC');
    return;
  }

  const names = result.split(/[,，、]/).map(n => n.trim()).filter(Boolean).slice(0, 2);
  for (const name of names) {
    if (!pluginData.npc_status[name]) {
      pluginData.npc_status[name] = { description: '等待窥探...', lastUpdate: '' };
    }
    await generateNPCStatus(name);
  }

  saveChatData();
  renderIntel();
}

async function rollFate() {
  toastr.info('🎲 命运之轮转动中...');

  const ctx = getContext();
  const cn = ctx.name2 || '角色';
  const recent = getRecentChat(15);

  const preset = getActivePreset();
  const result = await callSubAPI([
    { role: 'system', content: `${preset.prompts.fate}\n角色名：${cn}` },
    { role: 'user', content: recent.length > 0 ? fmt(recent) : '（新的冒险刚刚开始）' },
  ], 300);

  if (result) {
    pluginData.chaos_event = result;
    
    // 添加到历史
    const floor = ctx.chat ? ctx.chat.length : 0;
    pluginData.fate_history.push({
      content: result,
      floor: floor,
      timestamp: new Date().toLocaleString('zh-CN'),
    });

    $('#bb-fate-result').html(`
      <div style="font-size:18px;margin-bottom:16px;">🎲</div>
      <div style="color:#ddd;line-height:1.6;margin-bottom:16px;">${esc(result)}</div>
      <div style="font-size:12px;color:#888;border-top:1px solid #444;padding-top:12px;margin-top:12px;">
        使用宏<code style="background:#000;padding:2px 6px;border-radius:3px;">{{bb_chaos_event}}</code> 插入到对话中<br/>
        （宏读取后会自动清空，只能使用一次）
      </div>
    `);
    
    saveChatData();
    renderFateHistory();
    toastr.success('🎲 命运已降临！');
    checkAchievements();
  }
}

async function generateWorldFeed() {
  toastr.info('📻 生成世界频段消息中...');

  const recent = getRecentChat(25);
  const preset = getActivePreset();

  const result = await callSubAPI([
    { role: 'system', content: `${preset.prompts.world}\n当前场景背景请根据对话推断。` },
    { role: 'user', content: recent.length > 0 ? fmt(recent) : '（新的世界刚刚展开）' },
  ], 300);

  if (result) {
    // 分割成多条消息（如果AI返回了多条）
    const messages = result.split('\n').filter(line => line.trim());
    
    messages.forEach(msg => {
      const type = msg.includes('八卦') || msg.includes('传闻') ? 'gossip': msg.includes('新闻') || msg.includes('突发') ? 'news' 
                 : 'lore';
      
      pluginData.world_feed.push({
        type,
        content: msg.replace(/^[🌍📰💬✨\-\*\d\.]+\s*/, ''), // 清除开头的标记
        timestamp: new Date().toLocaleString('zh-CN'),
      });
    });

    saveChatData();
    renderWorldFeed();
    updateMarquee();
    toastr.success(`📻 已生成 ${messages.length} 条消息`);
  }
}

// ============================================
// 世界频段跑马灯
// ============================================

function startWorldFeed() {
  updateMarquee();
  // 每30秒更新一次跑马灯内容
  setInterval(() => {
    updateMarquee();
  }, 30000);
}

function updateMarquee() {
  const marquee = $('#bb-marquee');
  if (pluginData.world_feed.length === 0) {
    marquee.text('🌍 世界频段广播中...暂无消息');
    return;
  }

  // 随机选择3条消息循环播放
  const samples = pluginData.world_feed
    .slice(-10) // 取最近10条
    .sort(() => Math.random() - 0.5) // 随机打乱
    .slice(0, 3); // 取3条

  const text = samples.map(f => {
    const icon = f.type === 'gossip' ? '💬' : f.type === 'news' ? '📰' : '✨';
    return `${icon} ${f.content}`;
  }).join('|   ');

  marquee.text(text || '🌍 世界频段广播中...');
}

// ============================================
// 成就系统
// ============================================

function checkAchievements() {
  const allAchievements = [
    { id: 'chat_100', name: '初见倾心', desc: '聊天达到100条', icon: '💬', check: () => (getContext().chat?.length || 0) >= 100 },
    { id: 'chat_500', name: '相知相伴', desc: '聊天达到500条', icon: '💕', check: () => (getContext().chat?.length || 0) >= 500 },
    { id: 'chat_1000', name: '生死相依', desc: '聊天达到1000条', icon: '💍', check: () => (getContext().chat?.length || 0) >= 1000 },
    { id: 'scrap_10', name: '拾荒者', desc: '收藏10条语录', icon: '🌟', check: () => pluginData.records_bone.length >= 10 },
    { id: 'scrap_50', name: '收藏家', desc: '收藏50条语录', icon: '📚', check: () => pluginData.records_bone.length >= 50 },
    { id: 'scrap_100', name: '记忆宝库', desc: '收藏100条语录', icon: '💎', check: () => pluginData.records_bone.length >= 100 },
    { id: 'diary_5', name: '日记新手', desc: '生成5篇日记', icon: '📖', check: () => pluginData.diary_blood.length >= 5 },
    { id: 'diary_20', name: '日记达人', desc: '生成20篇日记', icon: '🖋️', check: () => pluginData.diary_blood.length >= 20 },
    { id: 'parallel_1', name: '破壁者', desc: '开启1次平行宇宙', icon: '🦋', check: () => pluginData.parallel_universes.length >= 1 },
    { id: 'parallel_10', name: '多元旅者', desc: '开启10次平行宇宙', icon: '🌌', check: () => pluginData.parallel_universes.length >= 10 },
    { id: 'fate_lucky', name: '幸运眷顾', desc: '命运骰子出现"幸运"关键词', icon: '🍀', check: () => pluginData.fate_history.some(f => f.content.includes('幸运')) },
    { id: 'fate_crisis', name: '劫后余生', desc: '命运骰子出现"危机"关键词', icon: '⚠️', check: () => pluginData.fate_history.some(f => f.content.includes('危机')) },
  ];

  allAchievements.forEach(ach => {
    if (ach.check()) {
      const alreadyUnlocked = pluginData.achievements.some(a => a.id === ach.id);
      if (!alreadyUnlocked) {
        unlockAchievement(ach);
      }
    }
  });

  renderAchievements();
}

function unlockAchievement(ach) {
  pluginData.achievements.push({
    id: ach.id,
    unlocked: true,
    date: new Date().toLocaleString('zh-CN'),
  });
  saveChatData();

  //屏幕中央弹出通知
  showAchievementPopup(ach);
  
  toastr.success(`🏆 解锁成就：${ach.name}`, '', { timeOut: 5000 });
}

function showAchievementPopup(ach) {
  const popup = $(`
    <div class="bb-achievement-popup" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);width:400px;background:#000;border:3px solid #8b0000;border-radius:12px;padding:24px;z-index:99999;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.9);transition:transform 0.3s ease;">
      <div style="font-size:64px;margin-bottom:16px;">${ach.icon}</div>
      <div style="color:#8b0000;font-size:24px;font-weight:bold;margin-bottom:8px;">🏆 成就解锁</div>
      <div style="color:#fff;font-size:20px;margin-bottom:8px;">${ach.name}</div>
      <div style="color:#888;font-size:14px;">${ach.desc}</div></div>
  `);

  $('body').append(popup);

  setTimeout(() => {
    popup.css('transform', 'translate(-50%,-50%) scale(1)');
  }, 50);

  setTimeout(() => {
    popup.css('transform', 'translate(-50%,-50%) scale(0)');
    setTimeout(() => popup.remove(), 300);
  }, 3000);
}

// ============================================
// 消息计数 & 自动触发
// ============================================

function incrementMessageCounter() {
  const s = getSettings();
  s.message_counter = (s.message_counter || 0) + 1;
  saveSettings();

  if (s.auto_diary_enabled && s.message_counter >= s.diary_trigger_count) {
    s.message_counter = 0;
    saveSettings();
    autoGenerate();
  }

  checkAchievements();
}

async function autoGenerate() {
  console.log('[骨与血]🔄 触发自动生成...');
  toastr.info('🔄 自动生成日记和总结中...');
  await generateDiary();
  await generateSummary();
}

// ============================================
// 宏注册（新API）
// ============================================

function registerAllMacros() {
  //尝试使用新的宏系统
  try {
    // SillyTavern 新版宏注册
    if (typeof MacrosParser !== 'undefined' && MacrosParser.registerMacro) {
      registerMacroNew('bb_diary', () => {
        if (pluginData.diary_blood.length === 0) return '(暂无日记)';
        return pluginData.diary_blood[pluginData.diary_blood.length - 1].content;
      });

      registerMacroNew('bb_summary', () => {
        if (pluginData.summaries.length === 0) return '(暂无总结)';
        return pluginData.summaries[pluginData.summaries.length - 1].content;
      });

      registerMacroNew('bb_weather', () => {
        return pluginData.weather || '(环境未知)';
      });

      registerMacroNew('bb_chaos_event', () => {
        const evt = pluginData.chaos_event;
        if (!evt) return '(无事件)';
        // 一次性读取后清空
        pluginData.chaos_event = '';
        saveChatData();
        return evt;
      });

      registerMacroNew('bb_vibe', () => {
        return pluginData.vibe || '(氛围未知)';
      });

      registerMacroNew('bb_npc_status', () => {
        const names = Object.keys(pluginData.npc_status);
        if (names.length === 0) return '(无NPC追踪)';
        return names.map(n => `【${n}】${pluginData.npc_status[n].description || '未知'}`).join('\n');
      });

      console.log('[骨与血] 📝 6个宏已注册（新API）');
    } else {
      console.warn('[骨与血] 未找到新版宏系统，宏功能可能不可用');
    }
  } catch (e) {
    console.error('[骨与血] 宏注册失败:', e);
  }
}

function registerMacroNew(key, fn) {
  try {
    if (typeof MacrosParser !== 'undefined') {
      MacrosParser.registerMacro(key, fn);
    }
  } catch (e) {
    console.warn(`[骨与血] 宏 ${key} 注册失败:`, e);
  }
}

// ============================================
// 数据持久化 (localStorage)
// ============================================

function getChatDataKey() {
  const ctx = getContext();
  return ctx.chatId ? `bb_data_${ctx.chatId}` : null;
}

function saveChatData() {
  const key = getChatDataKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(pluginData));
  } catch (e) {
    console.error('[骨与血] 保存数据失败:', e);
  }
}

function loadChatData() {
  resetPluginData();
  const key = getChatDataKey();
  if (!key) return;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const saved = JSON.parse(raw);
      pluginData = Object.assign({}, pluginData, saved);
      console.log(`[骨与血] 📂 已加载数据: ${key}`);
    }
  } catch (e) {
    console.error('[骨与血] 加载数据失败:', e);
  }
  
  // 重新加载OOC历史到session
  if (pluginData.ooc_chat && pluginData.ooc_chat.length > 0) {
    oocSession.history = pluginData.ooc_chat.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }
  
  renderAll();
}

function resetPluginData() {
  pluginData = {
    records_bone: [],
    diary_blood: [],
    summaries: [],
    weather: '',
    npc_status: {},
    chaos_event: '',
    vibe: '',
    parallel_universes: [],
    
    home_config: {
      user_avatar: '',
      char_avatar: '',
      link_emoji: '💕',
      user_bubble: '今天也要开心鸭~',
      char_bubble: '嗯，一起加油！',
      radio_text: '骨与血电台',
    },
    
    fate_history: [],
    world_feed: [],
    achievements: [],
    ooc_chat: [],
    generated_images: [],
  };
  
  oocSession = {
    active: false,
    history: [],};
}

// ============================================
// 导出功能
// ============================================

function exportAsMarkdown() {
  const ctx = getContext();
  const cn = ctx.name2 || '角色';
  const un = ctx.name1 || '用户';
  let md = `# 🦴骨与血 — ${cn} & ${un}\n\n> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

  // 语录
  if (pluginData.records_bone.length > 0) {
    md += `## 🌟 唱片机（语录收藏）\n\n`;
    pluginData.records_bone.forEach(r => {
      md += `**${r.character}** (${r.timestamp}):\n> ${r.text}\n\n`;
    });
  }

  // 日记
  if (pluginData.diary_blood.length > 0) {
    md += `## 📖 日记本\n\n`;
    pluginData.diary_blood.forEach(d => {
      md += `### ${d.date}\n${d.content}\n\n`;
    });
  }

  // 总结
  if (pluginData.summaries.length > 0) {
    md += `## 📜阿卡夏记录\n\n`;
    pluginData.summaries.forEach(s => {
      md += `### ${s.date}\n${s.content}\n\n`;
    });
  }

  // 环境 & 氛围
  if (pluginData.weather) md += `## ☁️ 环境\n${pluginData.weather}\n\n`;
  if (pluginData.vibe) md += `## ❤️ 氛围\n${pluginData.vibe}\n\n`;

  // NPC
  const npcNames = Object.keys(pluginData.npc_status);
  if (npcNames.length > 0) {
    md += `## 🗺️ NPC 动态\n\n`;
    npcNames.forEach(n => {
      md += `### ${n}\n${pluginData.npc_status[n].description || '未知'}\n*更新时间: ${pluginData.npc_status[n].lastUpdate}*\n\n`;
    });
  }

  // 平行宇宙
  if (pluginData.parallel_universes.length > 0) {
    md += `## 🦋 平行宇宙\n\n`;
    pluginData.parallel_universes.forEach(p => {
      md += `### #${p.floor} — ${p.date}\n> **原文:** ${p.origin}\n\n${p.content}\n\n`;
    });
  }

  // 命运历史
  if (pluginData.fate_history.length > 0) {
    md += `## 🎲 命运之轮\n\n`;
    pluginData.fate_history.forEach(f => {
      md += `**[#${f.floor} ${f.timestamp}]** ${f.content}\n\n`;
    });
  }

  // 世界频段
  if (pluginData.world_feed.length > 0) {
    md += `## 📻 世界频段\n\n`;
    pluginData.world_feed.forEach(f => {
      const icon = f.type === 'gossip' ? '💬' : f.type === 'news' ? '📰' : '✨';
      md += `${icon} **[${f.timestamp}]** ${f.content}\n\n`;
    });
  }

  // 成就
  if (pluginData.achievements.length > 0) {
    md += `## 🏆 成就殿堂\n\n`;
    pluginData.achievements.forEach(a => {
      md += `- ${a.id} (${a.date})\n`;});
  }

  md += `\n---\n*© 2026SHADOW<安息之影>*\n`;

  dl(`bone_blood_${cn}_${Date.now()}.md`, md,'text/markdown');
  toastr.success('📄Markdown 已导出！');
}

function exportAsJSON() {
  const ctx = getContext();
  const cn = ctx.name2 || '角色';
  const data = {
    exportTime: new Date().toISOString(),
    character: cn,
    user: ctx.name1,
    chatId: ctx.chatId,
    pluginData: pluginData,
  };
  dl(`bone_blood_${cn}_${Date.now()}.json`, JSON.stringify(data, null, 2), 'application/json');
  toastr.success('📦 JSON 已导出！');
}

// ============================================
// 工具函数
// ============================================

function dl(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

functionesc(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getRecentChat(count = 20) {
  const ctx = getContext();
  if (!ctx.chat || ctx.chat.length === 0) return [];
  return ctx.chat.slice(-count);
}

function fmt(messages) {
  const ctx = getContext();
  return messages.map(m => {
    const speaker = m.is_user ? (ctx.name1 || '用户') : (m.name || ctx.name2 || '角色');
    return `${speaker}: ${m.mes}`;
  }).join('\n\n');
}

// ============================================
// CSS 动画（跑马灯）
// ============================================

// 动态注入跑马灯CSS
if ($('#bb-marquee-style').length === 0) {
  $('head').append(`
    <style id="bb-marquee-style">
      @keyframes bb-scroll {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
      
      .bb-tab {
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        color: #aaa;
        transition: all 0.2s;
        user-select: none;
      }
      
      .bb-tab:hover {
        background: #333;
        color: #fff;
      }
      
      .bb-tab.active {
        background: #1a1a1a;
        color: #8b0000;
        border-bottom-color: #8b0000;
      }
      
      .bb-sm-btn {
        padding: 6px 12px;
        background: #444;
        color: #fff;
        border: 1px solid #666;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      }
      
      .bb-sm-btn:hover {
        background: #8b0000;
        border-color: #8b0000;
      }
      
      .bb-big-btn {
        padding: 12px 24px;
        background: #8b0000;
        color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.2s;
      }
      
      .bb-big-btn:hover {
        background: #a00000;
        transform: scale(1.05);
      }
      .bb-empty {
        text-align: center;
        color: #666;
        padding: 40px 20px;
        font-size: 14px;
      }
      
      /*滚动条美化 */
      .bb-content::-webkit-scrollbar,
      #bb-bf-chat::-webkit-scrollbar,
      #bb-ooc-chat::-webkit-scrollbar {
        width: 8px;
      }
      
      .bb-content::-webkit-scrollbar-track,
      #bb-bf-chat::-webkit-scrollbar-track,
      #bb-ooc-chat::-webkit-scrollbar-track {
        background: #111;
      }
      
      .bb-content::-webkit-scrollbar-thumb,
      #bb-bf-chat::-webkit-scrollbar-thumb,
      #bb-ooc-chat::-webkit-scrollbar-thumb {
        background: #8b0000;
        border-radius: 4px;
      }
      
      .bb-content::-webkit-scrollbar-thumb:hover,
      #bb-bf-chat::-webkit-scrollbar-thumb:hover,
      #bb-ooc-chat::-webkit-scrollbar-thumb:hover {
        background: #a00000;
      }
    </style>
  `);
}

console.log('[骨与血]🦴 index.js v6.0 完整加载');








