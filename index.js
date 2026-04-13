// ============================================
// 🦴 骨与血 (Bone & Blood) v8.1
// SillyTavern 沉浸式风味增强与记忆手账插件
// By SHADOW<安息之影> © 2026
// 区块重构版 — 15个区块 (A~O)
// ============================================

import { extension_settings, getContext } from '../../../extensions.js';
import { saveSettingsDebounced, eventSource, event_types } from '../../../../script.js';

const EXTENSION_NAME = 'third-party/SillyTavern-BoneandBloodbyshadow';
const VERSION = '7.1.0';

// ═══════════════════════════════════════════
// 【区块 A】 插件注册 & 常量定义
// ═══════════════════════════════════════════

const STYLE_PRESETS = {
  modern: {
    home: '🏠 主页', scrapbook: '🌟 唱片机', diary: '📖 日记本',
    npc: '🧑‍🤝‍🧑 情报站', weather: '☁️ 环境雷达', vibe: '❤️ 氛围心电图',
    parallel: '🦋 平行宇宙', fate: '🎲 命运盘', ooc: '💬 Burning Star',
    world: '📻 世界频段', achievements: '🏆 成就殿堂',
    gallery: '🖼️ 画廊', couple: '💕 情侣空间',
    errorlog: '⚠️ 错误日志', notifications: '🔔 通知栏',
    amber: '📌 记忆琥珀',
},
ancient: {
    home: '🏮 归处', scrapbook: '📜拾遗录', diary: '🖋️ 手札',
    npc: '👤 人物志', weather: '🌸 时节录', vibe: '💭 心境图',
    parallel: '🌀镜花水月', fate: '🎴卦象台', ooc: '💌 私语阁',
    world: '📰 江湖传闻', achievements: '🎖️ 功绩榜',
    gallery: '🎨 丹青阁', couple: '🌙鸳鸯谱',
    errorlog: '⚠️ 异闻录', notifications: '🔔 飞鸽传书',
    amber: '💎 记忆琥珀',
},
gothic: {
    home: '🕯️ 庭院', scrapbook: '🦴骸骨之语', diary: '🩸 血迹手记',
    npc: '👻 幽影名录', weather: '⚰️ 天气', vibe: '🕷️ 血脉共鸣',
    parallel: '🌑暗面分支', fate: '🗡️ 命运之骰', ooc: '🚪 Burning Star',
    world: '📡亡者电台', achievements: '💀 死亡勋章',
    gallery: '🖤暗影画廊', couple: '🥀 血契空间',
    errorlog: '💀 死亡日志', notifications: '🦇暗影通报',
    amber: '🔮 灵魂碎片',
},
monochrome: {
    home: '🏠 主页', scrapbook: '📀唱片机', diary: '📓 日记本',
    npc: '👥 情报站', weather: '🌫️ 环境雷达', vibe: '🤍 氛围心电图',
    parallel: '🔲 平行宇宙', fate: '🎲 命运盘', ooc: '💬 Burning Star',
    world: '📡 世界频段', achievements: '🏅 成就殿堂',
    gallery: '🖼️ 画廊', couple: '🤍 情侣空间',
    errorlog: '⚠️ 错误日志', notifications: '🔔 通知栏',
    amber: '📌 记忆琥珀',
},
  }; 

const TAB_KEYS = ['home','scrapbook','diary','npc','weather','vibe','parallel','fate','ooc','world','achievements','gallery','couple','errorlog','notifications','amber'];

const HOME_LAYOUTS = {
  together: { name: '🎧 一起听', desc: '仿音乐软件一起听界面' },
  dashboard: { name: '📊 仪表盘', desc: '数据概览+快捷功能' },
  minimalist: { name: '✨ 极简', desc: '大头像居中+纯净界面' },
};

const IMAGE_PROVIDERS = {
  placeholder: {
    name: '占位图片（测试用）',
    endpoint: 'picsum',
    fields: {},},
  novelai: {
    name: 'NovelAI',
    endpoint: 'https://image.novelai.net/ai/generate-image',
    authType: 'Bearer',
    fields: {
      model: { label: '模型', default: 'nai-diffusion-3' },
      width: { label: '宽度', default: 512 },
      height: { label: '高度', default: 768 },
      steps: { label: '采样步数', default: 28 },
      scale: { label: 'CFG Scale', default: 11 },
      sampler: { label: '采样器', default: 'k_euler' },
    },
  },
  stablediffusion: {
    name: 'Stable Diffusion WebUI',
    endpoint: 'http://127.0.0.1:7860/sdapi/v1/txt2img',
    authType: 'None',
    fields: {
      steps: { label: '采样步数', default: 20 },
      width: { label: '宽度', default: 512 },
      height: { label: '高度', default: 768 },
      cfg_scale: { label: 'CFG Scale', default: 7 },
      sampler_name: { label: '采样器', default: 'Euler a' },
    },
  },
};

const CSS_TEMPLATES = {
  glow: `/*✨ 发光边框效果 */
#bb-main-panel {
  border: 1px solid rgba(201, 160, 220, 0.4);
  box-shadow:
    0 0 20px rgba(201, 160, 220, 0.15),
    0 0 60px rgba(201, 160, 220, 0.08),
    inset 0 0 20px rgba(201, 160, 220, 0.03);
}
.bb-card {
  border: 1px solid rgba(201, 160, 220, 0.25);
  box-shadow: 0 0 12px rgba(201, 160, 220, 0.08);
}
.bb-card:hover {
  box-shadow: 0 0 20px rgba(201, 160, 220, 0.18);
}`,

  round: `/*🔵 圆润气泡效果 */
.bb-card,
.bb-record-item,
.bb-diary-item,
.bb-npc-card {
  border-radius: 20px;
  padding: 16px 18px;
}
.bb-chat-bubble {
  border-radius: 18px;
}
.bb-bubble-user {
  border-radius: 18px 18px 6px 18px;
}
.bb-bubble-ai {
  border-radius: 18px 18px 18px 6px;
}
.bb-tab-btn {
  border-radius: 20px;
}`,

  transparent: `/*🪟 毛玻璃效果 */
#bb-main-panel {
  background: rgba(30, 20, 45, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.bb-card,
.bb-record-item,
.bb-diary-item {
  background: rgba(46, 34, 64, 0.6);
  backdrop-filter: blur(8px);
}
.bb-tab-nav {
  background: rgba(30, 20, 45, 0.5);
}`,

  pink: `/* 🌸 樱花粉主题 */
#bb-main-panel {
  --bb-primary: #f5a0b8;
  --bb-primary-dark: #d87898;
  --bb-primary-light: #fce0ea;
  --bb-accent: #f0c0d0;
  --bb-bg-panel: #2a1a22;
  --bb-bg-card: #351e28;
  --bb-bg-card-hover: #402830;
  --bb-border: rgba(245, 160, 184, 0.18);
}
#bb-trigger-btn {
  background: linear-gradient(135deg, #d87898, #f5a0b8);
}`,

  cyberpunk: `/* 🌃 赛博朋克主题 */
#bb-main-panel {
  --bb-primary: #00f0ff;
  --bb-primary-dark: #0098a0;
  --bb-primary-light: #80ffff;
  --bb-accent: #ff0080;
  --bb-accent-dark: #c00060;
  --bb-bg-panel: #0a0a14;
  --bb-bg-card: #12121e;
  --bb-bg-card-hover: #1a1a28;
  --bb-border: rgba(0, 240, 255, 0.15);
  --bb-text: #d0e8f0;
}
#bb-main-panel {
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.1), 0 0 60px rgba(255, 0, 128, 0.05);
}
#bb-trigger-btn {
  background: linear-gradient(135deg, #0098a0, #c00060);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}`
};

const CSS_AI_PROMPT = `你是一个CSS专家。我正在使用一个叫"骨与血 (Bone & Blood)"的SillyTavern扩展插件，需要你帮我编写自定义CSS来美化它。

## 插件CSS架构说明

### 主要容器
- \`#bb-main-panel\` — 主面板（固定定位，居中弹出）
- \`#bb-trigger-btn\` — 右下角悬浮球按钮
- \`#bb-ooc-win\` — 破墙聊天室窗口
- \`#bb-bf-win\` — 蝴蝶窗口（快捷信息弹窗）

### CSS变量（可在#bb-main-panel 上覆盖）
- \`--bb-primary\` — 主色（默认紫 #c9a0dc）
- \`--bb-primary-dark\` / \`--bb-primary-light\` — 主色深/浅
- \`--bb-accent\` — 强调色（默认粉 #f0a8c8）
- \`--bb-bg-deep\` — 最深背景
- \`--bb-bg-panel\` — 面板背景
- \`--bb-bg-card\` — 卡片背景
- \`--bb-bg-card-hover\` — 卡片悬停背景
- \`--bb-bg-input\` — 输入框背景
- \`--bb-text\` — 主文字色
- \`--bb-text-dim\` — 次要文字
- \`--bb-text-muted\` — 弱化文字
- \`--bb-text-bright\` — 高亮文字
- \`--bb-border\` — 边框色
- \`--bb-radius-sm/md/lg/xl/full\` — 圆角

### 常用class
- \`.bb-card\` — 通用卡片
- \`.bb-btn\` / \`.bb-btn-primary\` / \`.bb-btn-accent\` — 按钮
- \`.bb-tab-btn\` / \`.bb-tab-btn.active\` — Tab标签
- \`.bb-tab-nav\` — Tab导航栏
- \`.bb-record-item\` — 语录卡片
- \`.bb-diary-item\` — 日记卡片
- \`.bb-ooc-msg-bubble\` — 聊天气泡
- \`.bb-home-avatar\` — 首页头像
- \`.bb-gallery-item\` — 画廊图片
- \`.bb-achievement-item\` — 成就卡片
- \`.bb-sticker-item\` — 表情包项

### 注意事项
1. 所有自定义CSS会被注入到 \`<style id="bb-custom-css-style">\` 中
2. 覆盖变量最简单：只需在\`#bb-main-panel {}\` 中重新声明变量
3. 插件默认是暗色主题
4. 请只输出纯CSS代码，不要包含解释

## 用户需求
请根据以下描述生成CSS代码：

`;

const DEFAULT_SETTINGS = {
  enabled: true,
  api_base: '',
  api_key: '',
  api_model: '',
  auto_diary_enabled: true,
  diary_trigger_count: 30,
  message_counter: 0,
  style_preset: 'gothic',
  custom_names: {},
  home_layout: 'together',
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
        ooc: '你作为角色，与用户进行跨越次元的沟通。用户可以和你讨论剧情、角色塑造等元层面问题，也可以只是闲聊。诚恳、温柔地回应。',
        world: '根据当前剧情背景，生成1-2条世界背景"噪音"信息（路人八卦/新闻/世界观彩蛋），每条30-50字。',
      },
      blacklist: [],
    },
  ],
  active_preset: 0,
  ooc_presets: [
    {
      name: '默认OOC预设',
      system_prompt: `你正在与用户进行一场跨越次元的对话。这是一个安全的空间，用户可以：
- 和你聊聊生活中的小事
- 分享今天的心情和感受
- 讨论剧情走向和角色想法
- 寻求情感支持和温暖陪伴
请用温柔、真诚、治愈的语气回应。`,
      temperature: 0.8,
      max_tokens: 500,
    },
  ],
  active_ooc_preset: 0,
  custom_css: '',
  music_search_api_tested: false,
  img_provider: 'placeholder',
  img_api_key: '',
  img_api_base: '',
  img_artist_tags: '',
  img_negative_prompt: 'nsfw, ugly, blurry, low quality, deformed',
  img_prompt_template: '基于以下内容生成一张插画：\n{content}\n画风：{artist_tags}',
  img_auto_generate: false,
  poster_bg_url: '',
  poster_font_url: '',
  poster_font_name: 'Noto Serif SC',
  poster_text_color: '#ffffff',
  available_models: [],
  custom_font_name: '',
  custom_font_apply: { panel: false, title: false, content: false, ooc: false },
  memory_amber: {
    enabled: true,
    auto_extract: true,
    extract_interval: 15,           // 每N条消息触发提取
    auto_confirm: false,             // 自动确认（不推荐）
    max_facts_per_character: 100,   // 每个角色最多保存的事实数
    priority_algorithm: 'weighted', // 'weighted' | 'simple'
    show_confidence: true,           // 显示置信度
    show_references: true,           // 显示引用次数
    conflict_detection: true,        // 启用冲突检测
    conflict_threshold: 0.7,         // 冲突检测阈值（0-1）
    multi_character: true,           // 多角色支持
    export_format: 'json',           // 'json' | 'markdown'
  },
    // 日历系统设置
  calendar: {
    enabled: true,
    mode: 'real',                // 'real' | 'rp'
    template_id: 'gregorian',        // 当前使用的模板ID
    custom_templates: [],            // 用户自定义模板
    default_view: 'month',           // 'month' | 'week' | 'day'
    show_holidays: true,
    show_solar_terms: true,          // 显示节气（仅公历）
    show_seasons: true,
    show_aggregation: true,          // 每日聚合显示
    holiday_auto_inject: true,       // 节日自动注入上下文
    season_auto_inject: true,        // 季节自动注入上下文
    custom_holidays: [],             // 用户自定义纪念日
    time_anchor: null,               // 时间锚点 { real_date, rp_date, rp_year }
    rp_current_date: null,           // RP当前日期 { year, month, day }
    week_start: 0,                   // 周起始日（0=周日，1=周一）
  },
   // 时间线编年史系统设置  ← 在这里添加
  chronicle: {
    enabled: true,
    auto_extract: true,
    extract_interval: 20,
    auto_chapter: true,
    chapter_threshold: 5,
    show_importance: true,
    default_importance: 3,
    export_format: 'markdown',
  },
  
  // 日历系统设置  ← 然后添加日历配置
  calendar: {
    enabled: true,
    mode: 'real',
    template_id: 'gregorian',
    custom_templates: [],
    default_view: 'month',
    show_holidays: true,
    show_solar_terms: true,
    show_seasons: true,
    show_aggregation: true,
    holiday_auto_inject: true,
    season_auto_inject: true,
    custom_holidays: [],
    time_anchor: null,
    rp_current_date: null,
    week_start: 0,
  },
};

const PET_TYPES = [
  { id: 'cat', name: '🐱 猫咪', maxHunger: 100, maxMood: 100 },
  { id: 'dog', name: '🐶 小狗', maxHunger: 100, maxMood: 100 },
  { id: 'rabbit', name: '🐰 兔子', maxHunger: 80, maxMood: 120 },
  { id: 'bird', name: '🐦 小鸟', maxHunger: 60, maxMood: 100 },
  { id: 'dragon', name: '🐉 幼龙', maxHunger: 150, maxMood: 80 },
];

// 运行时数据
let pluginData = null;
let butterflySession = { active: false, originFloor: null, originText: '', history: [] };
let chronicleMessageCounter = 0;
// ═══════════════════════════════════════════
// 记忆琥珀系统常量
// ═══════════════════════════════════════════

const FACT_CATEGORIES = {
  personality: { name: '性格特质', icon: '🎭', color: '#c9a0dc', weight: 1.2 },
  preference: { name: '喜好偏好', icon: '❤️', color: '#f0a8c8', weight: 1.0 },
  relationship: { name: '关系网络', icon: '🤝', color: '#a8d8f0', weight: 1.3 },
  background: { name: '背景经历', icon: '📜', color: '#d4af37', weight: 1.1 },
  ability: { name: '能力技能', icon: '⚡', color: '#ffd700', weight: 1.0 },
  appearance: { name: '外貌特征', icon: '👁️', color: '#e8b4f0', weight: 0.8 },
  habit: { name: '习惯癖好', icon: '🔄', color: '#b8e0d2', weight: 0.9 },
  memory: { name: '重要记忆', icon: '💭', color: '#d4a5a5', weight: 1.4 },
  secret: { name: '秘密隐私', icon: '🔒', color: '#8b7d8b', weight: 1.5 },
  goal: { name: '目标愿望', icon: '🎯', color: '#ff9a76', weight: 1.2 },
  fear: { name: '恐惧弱点', icon: '😰', color: '#a8a8a8', weight: 1.1 },
  custom: { name: '自定义', icon: '✨', color: '#c0c0c0', weight: 1.0 },
};

// ═══════════════════════════════════════════
// 时间线编年史系统常量
// ═══════════════════════════════════════════

const CHRONICLE_CATEGORIES = {
  milestone:{ name: '里程碑',icon: '⭐', color: '#ffd700' },
  conflict:       { name: '冲突',     icon: '⚔️', color: '#e74c3c' },
  reconciliation: { name: '和解',     icon: '🤝', color: '#4caf50' },
  fate:           { name: '命运',     icon: '🎲', color: '#9b59b6' },
  memory:         { name: '记忆',     icon: '💭', color: '#3498db' },
  romance:        { name: '情感',     icon: '💕', color: '#f0a8c8' },
  discovery:      { name: '发现',     icon: '🔍', color: '#e67e22' },
  loss:           { name: '失去',     icon: '🥀', color: '#7f8c8d' },
  growth:         { name: '成长',     icon: '🌱', color: '#2ecc71' },
  custom:         { name: '自定义',   icon: '✨', color: '#c0c0c0' },
};

const CHRONICLE_IMPORTANCE = {
  1: { name: '琐事',label: '★☆☆☆☆' },
  2: { name: '普通',   label: '★★☆☆☆' },
  3: { name: '重要',   label: '★★★☆☆' },
  4: { name: '关键',   label: '★★★★☆' },
  5: { name: '史诗',   label: '★★★★★' },
};

//编年史运行时数据
let chronicleExtracting = false;


const FACT_STATUS = {
  active: { name: '活跃', color: '#4caf50' },
  outdated: { name: '过时', color: '#888' },
  conflicted: { name: '冲突', color: '#e74c3c' },
};

// 记忆琥珀运行时数据
let memoryAmberFacts = []; // 所有事实条目
let amberPendingFacts = []; // 待确认的事实
let amberMessageCounter = 0; // 消息计数器
let amberExtracting = false; // 提取中标志
let oocSession = { active: false, history: [] };
// 错误日志和通知栏运行时数据
let bbErrorLog = [];// [{timestamp, source, message, detail}]
let bbNotifications = []; // [{timestamp, type, title, content, read}]

// ═══════════════ 区块 A结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 B】 数据管理（存储/读取）
// ═══════════════════════════════════════════

function createDefaultPluginData() {
  return {
    records_bone: [],
    diary_blood: [],
    summaries: [],
    weather: '',
    npc_status: {},
    chaos_event: '',
    vibe: '',
    parallel_universes: [],
    home_config: {
      user_avatar: '', char_avatar: '', link_emoji: '💕',
      user_bubble: '今天也要开心鸭~', char_bubble: '嗯，一起加油！',
      radio_text: '骨与血电台', background_url: '',},
    fate_history: [],
    world_feed: [],
    achievements: [],
    ooc_chat: [],
    sticker_packs: [{ id: 'default', name: '默认表情包', stickers: [] }],
    gallery: [],
    couple_space: { messages: [], love_letters: [], anniversaries: [], photo_wall: [] },
  };
}

function resetPluginData() {
  pluginData = createDefaultPluginData();
  oocSession = { active: false, history: [] };
}

function getSettings() {
  return extension_settings[EXTENSION_NAME];
}

function saveSettings() {
  saveSettingsDebounced();
}

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
    console.error('[骨与血] 保存数据失败:', e);if (e.name === 'QuotaExceededError') {
      toastr.warning('存储空间不足，请清理画廊中的图片');
    }
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
      if (!pluginData.sticker_packs) pluginData.sticker_packs = [{ id: 'default', name: '默认表情包', stickers: [] }];
      if (!pluginData.gallery) pluginData.gallery = [];
      if (!pluginData.couple_space) pluginData.couple_space = { messages: [], love_letters: [], anniversaries: [], photo_wall: [] };
      console.log(`[骨与血] 📂 已加载数据: ${key}`);
    }
  } catch (e) {
    console.error('[骨与血] 加载数据失败:', e);
  }
  // 重新加载OOC历史到session
  if (pluginData.ooc_chat && pluginData.ooc_chat.length > 0) {
    oocSession.history = pluginData.ooc_chat.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }
  renderAll();
}

function esc(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeHtml(text) {
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
  return messages
    .map((m) => {
      const speaker = m.is_user ? ctx.name1 || '用户' : m.name || ctx.name2 || '角色';
      return `${speaker}: ${m.mes}`;
    })
    .join('\n\n');
}

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

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function renderSafeHTML(text) {
  if (!text) return '';
  let html = esc(text);
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/\[sticker:(\w+)\]/g, (match, id) => {
    const sticker = findStickerById(id);
    if (sticker) {
      return `<img src="${esc(sticker.url)}" alt="${esc(sticker.alt || id)}" class="bb-sticker-img" />`;
    }
    return match;
  });
  return html;
}

function findStickerById(id) {
  for (const pack of pluginData.sticker_packs) {
    const found = pack.stickers.find((s) => s.id === id);
    if (found) return found;
  }
  return null;
}

function getActivePreset() {
  const s = getSettings();
  return s.prompt_presets[s.active_preset] || s.prompt_presets[0];
}

function getActiveOOCPreset() {
  const s = getSettings();
  if (!s.ooc_presets || s.ooc_presets.length === 0) {
    s.ooc_presets = [DEFAULT_SETTINGS.ooc_presets[0]];
  }
  return s.ooc_presets[s.active_ooc_preset || 0] || s.ooc_presets[0];
}

function getTabNames() {
  const s = getSettings();
  const preset = s.style_preset;
  if (preset === 'custom' && Object.keys(s.custom_names).length > 0) {
    return s.custom_names;
  }
  return STYLE_PRESETS[preset] || STYLE_PRESETS.gothic;
}
// ────────────────────────────────────────────
// 音乐播放器核心逻辑（新增 - MP3播放器功能）
// ────────────────────────────────────────────

// 播放器状态
const bbPlayer = {
  audio: null,
  playlist: [],    // [{name, src, lrc?}, ...]
  currentIndex: 0,
  isPlaying: false,
  lrcData: [],     // 当前歌曲的解析后歌词
};

// 初始化音频对象
function bbPlayerInit() {
  if (!bbPlayer.audio) {
    bbPlayer.audio = new Audio();
    bbPlayer.audio.addEventListener('ended', bbPlayerNext);
    bbPlayer.audio.addEventListener('timeupdate', bbPlayerUpdateProgress);
    bbPlayer.audio.addEventListener('error', (e) => {
      console.error('[骨与血] 音频加载失败:', e);
      toastr.error('音频加载失败');
    });
  }
}

// 播放指定歌曲
function bbPlayerPlay(index) {
  bbPlayerInit();
  if (typeof index === 'number') {
    bbPlayer.currentIndex = Math.max(0, Math.min(index, bbPlayer.playlist.length - 1));
  }
  const song = bbPlayer.playlist[bbPlayer.currentIndex];
  if (!song) {
    toastr.warning('歌单为空');
    return;
  }
  bbPlayer.audio.src = song.src;
  bbPlayer.audio.play().then(() => {
    bbPlayer.isPlaying = true;
    bbPlayerUpdateUI();
    // 解析当前歌曲歌词
    if (song.lrc) {
      bbPlayer.lrcData = parseLRC(song.lrc);
    } else {
      bbPlayer.lrcData = [];
    }
  }).catch(err => {
    console.error('[骨与血] 播放失败:', err);
    toastr.error('播放失败');
  });
}

// 暂停
function bbPlayerPause() {
  if (bbPlayer.audio) {
    bbPlayer.audio.pause();
    bbPlayer.isPlaying = false;
    bbPlayerUpdateUI();
  }
}

// 切换播放/暂停
function bbPlayerToggle() {
  if (!bbPlayer.audio || bbPlayer.playlist.length === 0) {
    toastr.info('请先添加歌曲到歌单');
    return;
  }
  if (bbPlayer.isPlaying) {
    bbPlayerPause();
  } else {
    if (!bbPlayer.audio.src) {
      bbPlayerPlay(0);
    } else {
      bbPlayer.audio.play();
      bbPlayer.isPlaying = true;
      bbPlayerUpdateUI();
    }
  }
}

// 下一首
function bbPlayerNext() {
  if (bbPlayer.playlist.length === 0) return;
  bbPlayer.currentIndex = (bbPlayer.currentIndex + 1) % bbPlayer.playlist.length;
  bbPlayerPlay();
}

// 上一首
function bbPlayerPrev() {
  if (bbPlayer.playlist.length === 0) return;
  bbPlayer.currentIndex = (bbPlayer.currentIndex - 1 + bbPlayer.playlist.length) % bbPlayer.playlist.length;
  bbPlayerPlay();
}

// 添加歌曲到歌单
function bbPlayerAddSong(name, src, lrc) {
  bbPlayer.playlist.push({ name, src, lrc: lrc || '' });
  toastr.success(`已添加：${name}`);
  bbPlayerSavePlaylist();
  bbPlayerUpdateUI();
}

// 从歌单移除
function bbPlayerRemoveSong(index) {
  if (index < 0 || index >= bbPlayer.playlist.length) return;
  const song = bbPlayer.playlist[index];
  bbPlayer.playlist.splice(index, 1);
  if (bbPlayer.currentIndex === index && bbPlayer.isPlaying) {
    bbPlayerPause();
  }
  if (bbPlayer.currentIndex >= bbPlayer.playlist.length) {
    bbPlayer.currentIndex = Math.max(0, bbPlayer.playlist.length - 1);
  }
  bbPlayerSavePlaylist();
  bbPlayerUpdateUI();
  toastr.info(`已删除：${song.name}`);
}

// 设置音量 (0-1)
function bbPlayerSetVolume(vol) {
  if (bbPlayer.audio) {
    bbPlayer.audio.volume = Math.max(0, Math.min(1, vol));
    const s = getSettings();
    s.music_volume = vol;
    saveSettings();
  }
}

// 跳转到指定时间（秒）
function bbPlayerSeek(time) {
  if (bbPlayer.audio) {
    bbPlayer.audio.currentTime = time;
  }
}

// 解析LRC歌词
function parseLRC(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
  
  for (const line of lines) {
    const matches = [...line.matchAll(timeRegex)];
    if (matches.length === 0) continue;
    
    const text = line.replace(timeRegex, '').trim();
    if (!text) continue;
    
    for (const match of matches) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + milliseconds / 1000;
      result.push({ time, text });
    }
  }
  
  return result.sort((a, b) => a.time - b.time);
}

// 获取当前应显示的歌词
function getCurrentLyric(currentTime) {
  if (bbPlayer.lrcData.length === 0) return null;
  
  for (let i = bbPlayer.lrcData.length - 1; i >= 0; i--) {
    if (currentTime >= bbPlayer.lrcData[i].time) {
      return bbPlayer.lrcData[i].text;
    }
  }
  return null;
}

// 更新进度条和歌词
function bbPlayerUpdateProgress() {
  if (!bbPlayer.audio) return;
  
  const current = bbPlayer.audio.currentTime;
  const duration = bbPlayer.audio.duration || 1;
  const percent = (current / duration) * 100;
  
  $('#bb-music-progress-fill').css('width', `${percent}%`);
  
  // 更新歌词显示
  const lyric = getCurrentLyric(current);
  const song = bbPlayer.playlist[bbPlayer.currentIndex];
  if (lyric) {
    $('#bb-music-title').text(lyric);
  } else if (song) {
    $('#bb-music-title').text(`🎵 ${song.name}`);
  }
}

// 更新UI显示
function bbPlayerUpdateUI() {
  const song = bbPlayer.playlist[bbPlayer.currentIndex];
  if (song) {
    if (bbPlayer.lrcData.length === 0) {
      $('#bb-music-title').text(`🎵 ${song.name}`);
    }
    $('#bb-music-toggle').text(bbPlayer.isPlaying ? '⏸' : '▶');
  } else {
    $('#bb-music-title').text('🎵 未播放');
    $('#bb-music-toggle').text('⏯');
  }
  
  // 更新设置面板中的歌单列表
  if ($('#bb-music-playlist-list').length > 0) {
    bbPlayerRenderPlaylist();
  }
}

// 渲染歌单列表（设置面板）
function bbPlayerRenderPlaylist() {
  const $list = $('#bb-music-playlist-list');
  if ($list.length === 0) return;
  
  if (bbPlayer.playlist.length === 0) {
    $list.html('<div class="bb-empty bb-text-muted">歌单为空，请添加歌曲</div>');
    return;
  }
  
  let html = '';
  bbPlayer.playlist.forEach((song, i) => {
    const active = i === bbPlayer.currentIndex ? 'bb-music-item-active' : '';
    html += `
      <div class="bb-music-playlist-item ${active}" data-index="${i}">
        <div class="bb-music-item-info">
          <span class="bb-music-item-name">${esc(song.name)}</span>
          <span class="bb-music-item-has-lrc">${song.lrc ? '📝' : ''}</span>
        </div>
        <div class="bb-music-item-actions">
          <button class="bb-sm-btn bb-btn-xs bb-music-play-btn" data-index="${i}">▶</button>
          <button class="bb-sm-btn bb-btn-xs bb-music-edit-btn" data-index="${i}">✏️</button>
          <button class="bb-sm-btn bb-btn-xs bb-btn-secondary bb-music-del-btn" data-index="${i}">🗑️</button>
        </div>
      </div>`;
  });
  
  $list.html(html);
  
  // 绑定事件
  $list.find('.bb-music-play-btn').on('click', function() {
    bbPlayerPlay(parseInt($(this).data('index')));
  });
  
  $list.find('.bb-music-del-btn').on('click', function() {
    if (confirm('确认删除这首歌？')) {
      bbPlayerRemoveSong(parseInt($(this).data('index')));
    }
  });
  
  $list.find('.bb-music-edit-btn').on('click', function() {
    const index = parseInt($(this).data('index'));
    bbPlayerEditSong(index);
  });
}

// 编辑歌曲（修改歌词）
function bbPlayerEditSong(index) {
  const song = bbPlayer.playlist[index];
  if (!song) return;
  
  const modal = $(`
    <div class="bb-modal-overlay">
      <div class="bb-modal-content bb-modal-lg">
        <h3 class="bb-modal-title">编辑歌曲：${esc(song.name)}</h3>
        <div class="bb-form-col">
          <label class="bb-label">歌曲名称：</label>
          <input id="bb-edit-song-name" type="text" class="bb-input" value="${esc(song.name)}" />
          
          <label class="bb-label">音频URL：</label>
          <input id="bb-edit-song-src" type="text" class="bb-input" value="${esc(song.src)}" />
          
          <label class="bb-label">LRC歌词（可选）：</label>
          <textarea id="bb-edit-song-lrc" class="bb-textarea" rows="10" placeholder="[00:12.00]第一句歌词\n[00:17.50]第二句歌词">${esc(song.lrc || '')}</textarea>
          <small class="bb-text-muted">格式：[分:秒.毫秒]歌词文本</small>
        </div>
        <div class="bb-btn-row bb-mt-md">
          <button class="bb-big-btn bb-flex-1" id="bb-edit-song-save">💾 保存</button>
          <button class="bb-sm-btn bb-btn-secondary" id="bb-edit-song-cancel">取消</button>
        </div>
      </div>
    </div>`);
  
  $('body').append(modal);
  
  modal.find('#bb-edit-song-save').on('click', function() {
    song.name = $('#bb-edit-song-name').val().trim() || song.name;
    song.src = $('#bb-edit-song-src').val().trim() || song.src;
    song.lrc = $('#bb-edit-song-lrc').val().trim();
    bbPlayerSavePlaylist();
    bbPlayerUpdateUI();
    modal.remove();
    toastr.success('歌曲信息已更新');
  });
  
  modal.find('#bb-edit-song-cancel').on('click', () => modal.remove());
  modal.on('click', function(e) {
    if ($(e.target).hasClass('bb-modal-overlay')) modal.remove();
  });
}

// 保存歌单到localStorage
function bbPlayerSavePlaylist() {
  try {
    localStorage.setItem('bb_music_playlist', JSON.stringify(bbPlayer.playlist));
  } catch (e) {
    console.error('[骨与血] 保存歌单失败:', e);
  }
}

// 加载歌单
function bbPlayerLoadPlaylist() {
  try {
    const saved = localStorage.getItem('bb_music_playlist');
    if (saved) {
      bbPlayer.playlist = JSON.parse(saved);
    }
  } catch (e) {
    console.error('[骨与血] 加载歌单失败:', e);
  }
}
//────────────────────────────────────────────
// 音乐搜索API功能（新增）
// ────────────────────────────────────────────

async function bbMusicSearch(keyword) {
  const s = getSettings();
  const apiUrl = s.music_search_api;
  if (!apiUrl) {
    toastr.warning('请先在设置面板中配置音乐搜索API地址');
    return [];
  }
  
  try {
    // 替换 {keyword} 占位符
    const url = apiUrl.replace('{keyword}', encodeURIComponent(keyword));
    toastr.info(`🔍 搜索中: ${keyword}...`);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    
    // 尝试多种常见API返回格式
    let songs = [];
    if (Array.isArray(json)) {
      songs = json;
    } else if (json.data && Array.isArray(json.data)) {
      songs = json.data;
    } else if (json.result && Array.isArray(json.result)) {
      songs = json.result;
    } else if (json.songs && Array.isArray(json.songs)) {
      songs = json.songs;
    } else if (json.result && json.result.songs) {
      songs = json.result.songs;
    }
    
    // 标准化歌曲数据
    return songs.slice(0, 20).map(song => ({
      name: song.name || song.title || song.songname || '未知歌曲',
      artist: song.artist || song.singer || (song.artists ? song.artists.map(a => a.name).join('/') : '') || '未知歌手',
      src: song.url || song.src || song.playUrl || song.mp3 || '',
      lrc: song.lrc || song.lyric || '',
      cover: song.cover || song.pic || song.album?.picUrl || '',
      id: song.id || '',}));
  } catch (err) {
    console.error('[骨与血] 音乐搜索失败:', err);
    toastr.error(`搜索失败: ${err.message}`);
    return [];
  }
}

async function bbMusicTestAPI() {
  const s = getSettings();
  const apiUrl = s.music_search_api;
  if (!apiUrl) {
    toastr.warning('请先填写音乐搜索API地址');
    return false;
  }
  
  try {
    const testUrl = apiUrl.replace('{keyword}', encodeURIComponent('test'));
    const res = await fetch(testUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    s.music_search_api_tested = true;
    saveSettings();
    toastr.success('✅ 音乐搜索API连接成功！');
    return true;
  } catch (err) {
    s.music_search_api_tested = false;
    saveSettings();
    toastr.error(`❌ API测试失败: ${err.message}`);
    return false;
  }
}

function showMusicSearchModal() {
  const modal = $(`
    <div class="bb-modal-overlay">
      <div class="bb-modal-content bb-modal-lg bb-modal-scroll">
        <h3 class="bb-modal-title">🔍 搜索音乐</h3>
        <div class="bb-form-col">
          <div class="bb-btn-row" style="gap:8px;">
            <input id="bb-music-search-input" type="text" class="bb-input bb-flex-1" placeholder="输入歌名或歌手..." />
            <button class="bb-sm-btn bb-btn-primary" id="bb-music-search-go">🔍 搜索</button>
          </div><div id="bb-music-search-results" class="bb-scroll-list" style="max-height:400px;margin-top:8px;"><div class="bb-empty">输入关键词开始搜索</div>
          </div>
        </div>
        <div class="bb-btn-row bb-mt-md">
          <button class="bb-sm-btn bb-btn-secondary bb-w-full" id="bb-music-search-close">关闭</button>
        </div>
      </div>
    </div>`);
  
  $('body').append(modal);
  async function doSearch() {
    const keyword = $('#bb-music-search-input').val().trim();
    if (!keyword) { toastr.warning('请输入搜索关键词'); return; }
    
    const $results = $('#bb-music-search-results');
    $results.html('<div class="bb-empty">🔍 搜索中...</div>');
    
    const songs = await bbMusicSearch(keyword);
    
    if (songs.length === 0) {
      $results.html('<div class="bb-empty">未找到结果，请尝试其他关键词</div>');
      return;
    }
    
    let html = '';
    songs.forEach((song, i) => {
      const hasSrc = song.src ? '' : 'bb-text-muted';
      html += `
        <div class="bb-music-search-item" data-index="${i}" style="display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:6px;background:var(--bb-bg-card);border:1px solid var(--bb-border-light);border-radius:8px;cursor:pointer;transition:all 0.2s;">
          ${song.cover ? `<img src="${esc(song.cover)}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;flex-shrink:0;" />` : '<div style="width:40px;height:40px;border-radius:6px;background:var(--bb-bg-secondary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">🎵</div>'}
          <div style="flex:1;min-width:0;">
            <div class="${hasSrc}" style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(song.name)}</div>
            <div class="bb-text-muted bb-text-xs">${esc(song.artist)}</div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;">
            ${song.src ? `<button class="bb-sm-btn bb-btn-xs bb-music-search-preview" data-idx="${i}" title="试听">▶</button>` : ''}
            ${song.src ? `<button class="bb-sm-btn bb-btn-xs bb-btn-primary bb-music-search-add" data-idx="${i}" title="添加到歌单">➕</button>` : `<span class="bb-text-muted bb-text-xs">无链接</span>`}
          </div>
        </div>`;
    });
    
    $results.html(html);
    
    // 存储搜索结果供后续使用
    $results.data('songs', songs);
    
    // 试听
    $results.find('.bb-music-search-preview').on('click', function(e) {
      e.stopPropagation();
      const idx = $(this).data('idx');
      const song = songs[idx];
      if (!song || !song.src) return;
      
      // 使用临时audio试听
      let previewAudio = $results.data('previewAudio');
      if (previewAudio) {
        previewAudio.pause();
        previewAudio = null;
      }
      previewAudio = new Audio(song.src);
      previewAudio.volume = 0.5;
      previewAudio.play().catch(err => toastr.error('试听失败'));
      $results.data('previewAudio', previewAudio);
      
      // 30秒后自动停止
      setTimeout(() => { if (previewAudio) previewAudio.pause(); }, 30000);
      
      toastr.info(`🎧 试听: ${song.name}`);
    });
    
    // 添加到歌单
    $results.find('.bb-music-search-add').on('click', function(e) {
      e.stopPropagation();
      const idx = $(this).data('idx');
      const song = songs[idx];
      if (!song || !song.src) return;
      
      bbPlayerAddSong(
        `${song.name} - ${song.artist}`,
        song.src,
        song.lrc || ''
      );
    });
  }
  
  modal.find('#bb-music-search-go').on('click', doSearch);
  modal.find('#bb-music-search-input').on('keypress', function(e) {
    if (e.which === 13) doSearch();
  });
  
  modal.find('#bb-music-search-close').on('click', function() {
    // 停止试听
    const previewAudio = $('#bb-music-search-results').data('previewAudio');
    if (previewAudio) previewAudio.pause();
    modal.remove();
  });
  
  modal.on('click', function(e) {
    if ($(e.target).hasClass('bb-modal-overlay')) {
      const previewAudio = $('#bb-music-search-results').data('previewAudio');
      if (previewAudio) previewAudio.pause();
      modal.remove();
    }
  });
  
  // 自动聚焦
  setTimeout(() => $('#bb-music-search-input').focus(), 100);
}

// ────────────────────────────────────────────
// 音乐搜索API功能结束
// ────────────────────────────────────────────

// ────────────────────────────────────────────
// 音乐播放器核心逻辑结束
// ────────────────────────────────────────────
// ────────────────────────────────────────────
// 错误日志系统
// ────────────────────────────────────────────

function bbLogError(source, message, detail = '') {
  const entry = {
    timestamp: new Date().toLocaleString('zh-CN'),
    source: source,
    message: message,
    detail: typeof detail === 'object' ? JSON.stringify(detail) : String(detail),
  };
  bbErrorLog.unshift(entry); // 最新的在前面
  if (bbErrorLog.length > 100) bbErrorLog.pop(); // 最多保留100条
  renderErrorLog();
  updateErrorBadge();
  console.error(`[骨与血] [${source}] ${message}`, detail);
}

function updateErrorBadge() {
  const count = bbErrorLog.length;
  const $badge = $('#bb-error-badge');
  if (count > 0) {
    if ($badge.length === 0) {
      // 在错误日志tab按钮上添加角标
      const $btn = $(`.bb-tab-btn[data-tab="errorlog"]`);
      $btn.css('position', 'relative');
      $btn.append(`<span id="bb-error-badge" class="bb-badge bb-badge-error">${count}</span>`);
    } else {
      $badge.text(count);
    }
  } else {
    $badge.remove();
  }
}

// ────────────────────────────────────────────
// 通知栏系统
// ────────────────────────────────────────────

function bbNotify(type, title, content = '') {
  const entry = {
    id: generateId(),
    timestamp: new Date().toLocaleString('zh-CN'),
    type: type, // 'diary', 'vibe', 'weather', 'fate', 'ooc', 'achievement', 'world', 'system'
    title: title,
    content: content,
    read: false,
  };
  bbNotifications.unshift(entry);
  if (bbNotifications.length > 200) bbNotifications.pop();
  renderNotifications();
  updateNotificationBadge();
  
  // 可选：播放提示音
  playNotificationSound();
}

function updateNotificationBadge() {
  const unread = bbNotifications.filter(n => !n.read).length;
  const $badge = $('#bb-notif-badge');
  if (unread > 0) {
    if ($badge.length === 0) {
      const $btn = $(`.bb-tab-btn[data-tab="notifications"]`);
      $btn.css('position', 'relative');
      $btn.append(`<span id="bb-notif-badge" class="bb-badge bb-badge-notif">${unread}</span>`);
    } else {
      $badge.text(unread);
    }
  } else {
    $badge.remove();
  }
}

function markAllNotificationsRead() {
  bbNotifications.forEach(n => n.read = true);
  renderNotifications();
  updateNotificationBadge();
}

function clearAllNotifications() {
  bbNotifications = [];
  renderNotifications();
  updateNotificationBadge();
}

function clearErrorLog() {
  bbErrorLog = [];
  renderErrorLog();
  updateErrorBadge();
}

//────────────────────────────────────────────
// 提示音系统（使用 Web Audio API，无需外部音频文件）
// ────────────────────────────────────────────

/**
 * 播放提示音
 * @param {'success'|'info'|'warning'|'error'} type - 提示音类型
 */
function playNotificationSound(type = 'success') {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    switch (type) {
      case 'success':
        // 上升双音 —叮咚♪
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523, now);       // C5
        oscillator.frequency.setValueAtTime(784, now + 0.12); // G5
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        oscillator.start(now);
        oscillator.stop(now + 0.35);
        break;
      case 'info':
        // 单音提示 — 叮
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now); // A5
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;
        
      case 'warning':
        // 下降音 — 嘟
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(660, now);
        oscillator.frequency.setValueAtTime(440, now + 0.15);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;
        
      case 'error':
        // 急促双音 — 嘟嘟
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(330, now);
        oscillator.frequency.setValueAtTime(220, now + 0.1);
        oscillator.frequency.setValueAtTime(330, now + 0.2);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        oscillator.start(now);
        oscillator.stop(now + 0.35);
        break;
    }
  } catch (e) {
    // 静默失败 — 某些浏览器可能阻止自动播放
  }
}
// ── 辅助函数（修复缺失定义）──

function getChatData() {
  return pluginData;
}

function getCurrentCharacterName() {
  const ctx = getContext();
  return ctx.name2 || ctx.characterId || null;
}

function getRecentMessages(count = 20) {
  return getRecentChat(count);
}

function getCurrentPromptPreset() {
  return getActivePreset();
}
// ═══════════════ 区块 B 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 C】 主面板 HTML 构建 & 显隐控制
// ═══════════════════════════════════════════

function injectFloatingUI() {
  if (document.getElementById('bb-trigger-btn')) return;

  const s = extension_settings[EXTENSION_NAME];

  // 1. 悬浮球
  const floatBtn = document.createElement('div');
  floatBtn.id = 'bb-trigger-btn';
  floatBtn.className = 'bb-trigger-btn';
  floatBtn.innerHTML = '🦴';
  floatBtn.title = '骨与血 Bone & Blood';
  floatBtn.style.display = (s.enabled && s.show_float_button !== false) ? 'flex' : 'none';
  floatBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleMainPanel();
  });
  document.body.appendChild(floatBtn);

  // 2. 主面板容器（初始隐藏）
  const panel = document.createElement('div');
  panel.id = 'bb-main-panel';
  panel.className = 'bb-main-panel';
  panel.style.display = 'none';
  document.body.appendChild(panel);

  // 3. 注入到SillyTavern扩展菜单
  injectToExtensionsMenu();

  // 4. 移动端悬浮球
  if (window.innerWidth <= 768) {
    createMobileFloatingButton();
  }

  // 5. 版权水印
  const watermark = document.createElement('div');
  watermark.className = 'bb-watermark';
  watermark.textContent = '骨与血 © SHADOW';
  document.body.appendChild(watermark);
}

function injectToExtensionsMenu() {
  if (document.getElementById('bb-ext-menu-item')) return;
  const waitForMenu = () => {
    const menu = document.getElementById('extensionsMenu');
    if (!menu) { setTimeout(waitForMenu, 500); return; }
    const menuItem = document.createElement('div');
    menuItem.id = 'bb-ext-menu-item';
    menuItem.className = 'list-group-item flex-container flexGap5bb-ext-menu-item';
    menuItem.innerHTML = `<span class="bb-ext-menu-icon">🦴</span><span>骨与血 Bone & Blood</span>`;
    menuItem.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const menuEl = document.getElementById('extensionsMenu');
      if (menuEl) { menuEl.style.display = 'none'; menuEl.classList.remove('openDrawer'); }
      toggleMainPanel();
    });
    if (menu.firstChild) { menu.insertBefore(menuItem, menu.firstChild); }else { menu.appendChild(menuItem); }
    console.log('[BB] Injected to extensions menu');
  };
  waitForMenu();
}

function toggleMainPanel() {
  const $panel = $('#bb-main-panel');
  if ($panel.is(':visible')) {
    $panel.fadeOut(200);} else {
    $panel.css('display', 'flex').hide().fadeIn(200);
    try {
      $('.drawer-content.openDrawer').removeClass('openDrawer');
      $('.openIcon').removeClass('openIcon');
    } catch (e) {}
  }
}


function refreshFloatingUI() {
  const panel = document.getElementById('bb-main-panel');
  if (!panel) return;
  const wasVisible = $('#bb-main-panel').is(':visible');
  panel.innerHTML = buildMainPanelHTML();
  bindMainPanelEvents(panel);
  renderAll();
  if (!wasVisible) {
    $('#bb-main-panel').hide();
  }
}


function createMobileFloatingButton() {
  if (document.getElementById('bb-mobile-float')) return;
  const s = extension_settings[EXTENSION_NAME];
  const btn = document.createElement('div');
  btn.id = 'bb-mobile-float';
  btn.className = 'bb-mobile-float';
  btn.style.display = (s.enabled && s.show_float_button !== false) ? 'flex' : 'none';

  const savedPos = localStorage.getItem('bb_float_pos');
  let posX = window.innerWidth - 60;
  let posY = window.innerHeight - 140;
  if (savedPos) {
    try {
      const p = JSON.parse(savedPos);
      posX = Math.min(p.x, window.innerWidth - 50);
      posY = Math.min(p.y, window.innerHeight - 50);
    } catch (e) {}
  }
  btn.style.left = posX + 'px';
  btn.style.top = posY + 'px';
  btn.innerHTML = '🦴';

  let isDragging = false, startX, startY, startLeft, startTop, hasMoved = false;

  btn.addEventListener('touchstart', (e) => {
    isDragging = true; hasMoved = false;
    const touch = e.touches[0];
    startX = touch.clientX; startY = touch.clientY;
    startLeft = btn.offsetLeft; startTop = btn.offsetTop;
    btn.classList.add('bb-dragging');
    btn.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startX, dy = touch.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
    let newX = Math.max(0, Math.min(startLeft + dx, window.innerWidth - 50));
    let newY = Math.max(0, Math.min(startTop + dy, window.innerHeight - 50));
    btn.style.left = newX + 'px';
    btn.style.top = newY + 'px';
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    btn.classList.remove('bb-dragging');
    btn.style.transition = 'left 0.3s ease, top 0.3s ease';
    const cx = btn.offsetLeft +24;
    const snapLeft = cx< window.innerWidth / 2 ? 6 : window.innerWidth - 54;
    btn.style.left = snapLeft + 'px';
    localStorage.setItem('bb_float_pos', JSON.stringify({ x: snapLeft, y: btn.offsetTop }));
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation(); e.preventDefault();
    if (!hasMoved) toggleMainPanel();
  });
  btn.addEventListener('touchend', (e) => {
    if (!hasMoved) { e.preventDefault(); toggleMainPanel(); }
  });

  document.body.appendChild(btn);
}

function buildMainPanelHTML() {
  const names = getTabNames();
  const layout = getSettings().home_layout || 'together';

  return `
    <!-- 标题栏 -->
    <div class="bb-panel-header">
      <div class="bb-panel-title">🦴 骨与血</div>
      <button class="bb-panel-close-btn" id="bb-close-btn">✖</button>
    </div>

    <!-- 音乐播放器条（新增 - MP3播放器） -->
    <div class="bb-music-bar" id="bb-music-bar">
      <div class="bb-music-bar-mini">
        <div class="bb-music-marquee"><span id="bb-music-title">🎵 未播放</span></div>
        <div class="bb-music-mini-controls">
          <button class="bb-music-ctrl-btn" id="bb-music-prev" title="上一首">⏮</button>
          <button class="bb-music-ctrl-btn" id="bb-music-toggle" title="播放/暂停">⏯</button>
          <button class="bb-music-ctrl-btn" id="bb-music-next" title="下一首">⏭</button>
        </div>
      </div>
      <div class="bb-music-progress-mini">
        <div class="bb-music-progress-fill" id="bb-music-progress-fill"></div>
      </div>
    </div>

    <!-- Tab导航 -->
    <div class="bb-tab-nav">
      ${TAB_KEYS.map((key, i) => `<button class="bb-tab-btn${i === 0 ? ' active' : ''}" data-tab="${key}">${names[key] || key}</button>`).join('')}
    </div>

    <!-- 内容区 -->
    <div class="bb-tab-content">
      <!--🏠 首页 -->
      <div id="bb-pane-home" class="bb-tab-pane active">
        ${buildHomeLayout(layout)}
      </div>

          <!--🌟 唱片机 -->
      <div id="bb-pane-scrapbook" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar bb-action-wrap">
          <button class="bb-sm-btn" id="bb-btn-music-search">🔍 搜索音乐</button>
          <button class="bb-sm-btn" id="bb-btn-export-md">📄 导出MD</button>
          <button class="bb-sm-btn" id="bb-btn-export-json">📦 导出JSON</button>
          <button class="bb-sm-btn" id="bb-btn-export-poster">🖼️ 导出海报</button>
        </div>
        <div id="bb-scrap-empty" class="bb-empty">暂无收藏的语录<br/>点击消息旁的🌟 收藏</div>
        <div id="bb-records-list"></div>
      </div>


           <div id="bb-pane-diary" class="bb-tab-pane bb-hidden">
        <!-- 自动总结状态栏 -->
        <div class="bb-auto-summary-bar" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bb-bg-secondary);border:1px solid var(--bb-border-light);border-radius:var(--bb-radius-md);margin-bottom:12px;font-size:12px;">
          <div>
            <span class="bb-text-dim">自动记录：</span>
            <span id="bb-auto-status" style="color:var(--bb-primary);">${getSettings().auto_diary_enabled ? '✅ 开启' : '❌ 关闭'}</span>
            <span class="bb-text-muted" style="margin-left:8px;">进度:</span>
            <span id="bb-msg-counter" style="color:var(--bb-accent);">${getSettings().message_counter || 0}/${getSettings().diary_trigger_count || 30}</span>
          </div>
          <button class="bb-sm-btn bb-btn-xs" id="bb-btn-toggle-auto" title="开关自动记录">${getSettings().auto_diary_enabled ? '⏸暂停' : '▶ 开启'}</button>
        </div>
        
             <!--📖 日记（含子Tab：日记/总结/编年史） -->
      <div id="bb-pane-diary" class="bb-tab-pane bb-hidden">
        
        <!-- 子Tab导航 -->
        <div class="bb-sub-tab-bar">
          <button class="bb-sub-tab-btn bb-sub-tab-active" data-subtab="diary-main">📖 日记</button>
          <button class="bb-sub-tab-btn" data-subtab="diary-summary">📜 总结</button>
          <button class="bb-sub-tab-btn" data-subtab="diary-chronicle">⭐ 编年史</button>
        </div>

        <!-- 子面板：日记 -->
        <div id="bb-subtab-diary-main" class="bb-sub-tab-pane">
          <div class="bb-action-bar">
            <button class="bb-sm-btn bb-btn-primary" id="bb-btn-gen-diary-tab">📖 生成日记</button>
          </div>
          <div id="bb-diary-box" class="bb-scroll-list">
            <div class="bb-empty">暂无日记</div>
          </div>
        </div>

        <!-- 子面板：总结 -->
        <div id="bb-subtab-diary-summary" class="bb-sub-tab-pane bb-hidden">
          <div class="bb-action-bar">
            <button class="bb-sm-btn bb-btn-primary" id="bb-btn-gen-summary-tab">📜 生成总结</button>
          </div>
          <div id="bb-summary-box" class="bb-scroll-list">
            <div class="bb-empty">暂无总结</div>
          </div>
        </div>

        <!-- 子面板：编年史 -->
        <div id="bb-subtab-diary-chronicle" class="bb-sub-tab-pane bb-hidden">
          <div class="bb-action-bar bb-action-wrap">
            <button class="bb-sm-btn bb-btn-primary" id="bb-chronicle-extract">🔍 从对话提取</button>
            <button class="bb-sm-btn" id="bb-chronicle-add-manual">➕ 手动添加</button>
            <button class="bb-sm-btn" id="bb-chronicle-from-diary">📖 从日记提取</button>
            <button class="bb-sm-btn" id="bb-chronicle-export">💾 导出</button>
          </div>

          <!--筛选栏 -->
          <div class="bb-chronicle-filter-bar">
            <select id="bb-chronicle-filter-category" class="bb-input" style="flex:1;">
              <option value="all">全部分类</option>
            </select>
            <select id="bb-chronicle-filter-importance" class="bb-input" style="flex:1;">
              <option value="all">全部重要度</option>
              <option value="5">★★★★★ 史诗</option>
              <option value="4">★★★★☆ 关键</option>
              <option value="3">★★★☆☆ 重要</option>
              <option value="2">★★☆☆☆ 普通</option>
              <option value="1">★☆☆☆☆琐事</option>
            </select>
            <input type="text" id="bb-chronicle-search" class="bb-input" placeholder="🔍 搜索事件..." style="flex:2;">
          </div>

          <!-- 统计 -->
          <div class="bb-chronicle-stats">
            <span id="bb-chronicle-stat-total">共 0 个事件</span>
            <span id="bb-chronicle-stat-chapters">0 个章节</span>
          </div>

          <!-- 时间轴 -->
          <div id="bb-chronicle-timeline" class="bb-chronicle-timeline">
            <div class="bb-empty">暂无编年史事件 ⭐<br/>
              点击"从对话提取"开始记录你的故事
            </div>
          </div>
        </div>
      </div>

      <!-- NPC动态 -->
      <div id="bb-pane-npc" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar">
          <button class="bb-sm-btn" id="bb-btn-add-npc">➕ 添加NPC</button>
          <button class="bb-sm-btn" id="bb-btn-auto-npc">🎲 随机窥探</button>
        </div>
        <div id="bb-npc-box"></div>
      </div>

      <!-- 环境雷达 -->
      <div id="bb-pane-weather" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar">
          <button class="bb-sm-btn" id="bb-btn-gen-weather-tab">☁️ 扫描环境</button>
        </div>
        <div class="bb-box" id="bb-weather-box">未检测</div>
      </div>

      <!-- 氛围心电图 -->
      <div id="bb-pane-vibe" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar">
          <button class="bb-sm-btn" id="bb-btn-gen-vibe-tab">❤️ 分析氛围</button>
        </div>
        <div class="bb-box" id="bb-vibe-box">未检测</div>
      </div>

      <!-- 平行宇宙 -->
      <div id="bb-pane-parallel" class="bb-tab-pane bb-hidden">
        <div id="bb-par-empty" class="bb-empty">暂无平行宇宙记录<br/>点击消息旁的 🦋 开启分支</div>
        <div id="bb-par-list"></div>
      </div>

      <!-- 命运盘 -->
      <div id="bb-pane-fate" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar bb-action-center">
          <button class="bb-big-btn" id="bb-btn-roll-fate">🎲 转动命运之轮</button>
        </div>
        <div id="bb-fate-result" class="bb-box bb-text-center">点击上方按钮，让命运降临...</div>
        <div class="bb-section">
         <h4 class="bb-section-title">📜 命运历史</h4>
          <div id="bb-fate-history-list"></div>
        </div>
      </div>

      <!-- Burning Star Chat -->
      <div id="bb-pane-ooc" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar bb-action-wrap">
          <button class="bb-sm-btn" id="bb-btn-open-ooc-win">💬 打开对话窗口</button>
          <button class="bb-sm-btn" id="bb-btn-export-ooc">📤 导出聊天</button>
          <button class="bb-sm-btn" id="bb-btn-clear-ooc">🗑️ 清空历史</button>
        </div>
        <div id="bb-ooc-preview" class="bb-box bb-ooc-preview-box">
          <div class="bb-empty">这里是跨越次元的聊天窗口<br/>点击上方按钮，和ta聊聊剧本之外的故事吧！</div>
        </div>
      </div>

      <!-- 世界频段 -->
      <div id="bb-pane-world" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar">
          <button class="bb-sm-btn" id="bb-btn-add-feed">➕ 添加消息</button>
          <button class="bb-sm-btn" id="bb-btn-gen-feed">🎲 生成消息</button>
          <button class="bb-sm-btn" id="bb-btn-clear-feed">🗑️ 清空</button>
        </div>
        <div class="bb-marquee-container">
          <div id="bb-marquee">🌍 世界频段广播中...</div>
        </div>
        <div id="bb-world-feed-list" class="bb-scroll-list"></div>
      </div>

      <!-- 🏆 成就殿堂 -->
      <div id="bb-pane-achievements" class="bb-tab-pane bb-hidden">
        <div class="bb-ach-summary">
          <span class="bb-text-muted">已解锁 </span>
          <span id="bb-ach-count" class="bb-text-primary bb-text-bold">0</span>
          <span class="bb-text-muted"> /</span>
          <span id="bb-ach-total">12</span>
        </div>
        <div id="bb-ach-list"></div>
      </div>

      <!-- 🖼️ 画廊 -->
      <div id="bb-pane-gallery" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar bb-action-wrap">
          <button class="bb-sm-btn" id="bb-btn-gen-gallery-img">🎨 手动生图</button>
          <button class="bb-sm-btn" id="bb-btn-clear-gallery">🗑️ 清空画廊</button>
        </div>
        <div id="bb-gallery-empty" class="bb-empty">暂无图片<br/>通过日记配图、破墙聊天等功能生成图片</div>
        <div id="bb-gallery-grid" class="bb-gallery-grid"></div>
      </div>

      <!-- 💕 情侣空间 -->
      <div id="bb-pane-couple" class="bb-tab-pane bb-hidden">
        ${buildCoupleSpaceHTML()}
      </div>
      <!-- ⚠️ 错误日志 -->
            <div id="bb-pane-errorlog" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar">
          <button class="bb-sm-btn" id="bb-btn-clear-errors">🗑️ 清空日志</button>
          <span class="bb-text-muted bb-text-xs" id="bb-error-count-label">共 0 条</span>
        </div>
        <div id="bb-error-list" class="bb-scroll-list"><div class="bb-empty">暂无错误 ✅<br/>一切运行正常</div>
        </div>
      </div>

      <!-- 🔔 通知栏 -->
      <div id="bb-pane-notifications" class="bb-tab-pane bb-hidden">
        <div class="bb-action-bar bb-action-wrap">
          <button class="bb-sm-btn" id="bb-btn-mark-all-read">✅ 全部已读</button>
          <button class="bb-sm-btn" id="bb-btn-clear-notifs">🗑️ 清空通知</button><span class="bb-text-muted bb-text-xs" id="bb-notif-count-label">共 0 条</span>
        </div>
        <div id="bb-notif-list" class="bb-scroll-list">
          <div class="bb-empty">暂无通知 🔔<br/>新内容生成时会在这里提醒你</div>
        </div>
      </div>
            <!-- 📌 记忆琥珀 -->
      <div id="bb-pane-amber" class="bb-tab-pane bb-hidden">
        <!-- 顶部操作栏 -->
        <div class="bb-action-bar bb-action-wrap">
          <button class="bb-sm-btn bb-btn-primary" id="bb-amber-extract-now">
            🔍 立即提取事实
          </button>
          <button class="bb-sm-btn" id="bb-amber-add-manual">
            ➕ 手动添加
          </button>
          <button class="bb-sm-btn" id="bb-amber-export">
            💾 导出
          </button>
          <button class="bb-sm-btn" id="bb-amber-import">
            📂 导入
          </button>
          <button class="bb-sm-btn" id="bb-amber-settings">
            ⚙️ 设置
          </button>
        </div>

        <!-- 筛选与搜索栏 -->
        <div class="bb-amber-filter-bar">
          <select id="bb-amber-filter-character" class="bb-input" style="flex:1;">
            <option value="all">全部角色</option>
          </select>
          <select id="bb-amber-filter-category" class="bb-input" style="flex:1;">
            <option value="all">全部分类</option>
          </select>
          <select id="bb-amber-filter-status" class="bb-input" style="flex:1;">
            <option value="all">全部状态</option>
            <option value="active">活跃</option>
            <option value="outdated">过时</option>
            <option value="conflicted">冲突</option>
          </select>
          <input type="text" id="bb-amber-search" class="bb-input" placeholder="🔍 搜索事实..." style="flex:2;">
        </div>

        <!-- 统计信息 -->
        <div class="bb-amber-stats">
          <span id="bb-amber-stat-total">总计: 0</span>
          <span id="bb-amber-stat-active">活跃: 0</span>
          <span id="bb-amber-stat-conflicted">冲突: 0</span>
          <span id="bb-amber-stat-outdated">过时: 0</span>
        </div>

        <!-- 待确认面板（折叠） -->
        <div id="bb-amber-pending-panel" class="bb-amber-pending bb-hidden">
          <div class="bb-amber-pending-header">
            <span>📋 待确认事实 (<span id="bb-amber-pending-count">0</span>)</span>
            <div>
              <button class="bb-sm-btn bb-btn-xs" id="bb-amber-confirm-all">✅ 全部确认</button>
              <button class="bb-sm-btn bb-btn-xs" id="bb-amber-reject-all">❌ 全部拒绝</button>
            </div>
          </div>
          <div id="bb-amber-pending-list" class="bb-amber-pending-list"></div>
        </div>

        <!-- 事实列表 -->
        <div id="bb-amber-fact-list" class="bb-scroll-list">
          <div class="bb-empty">
            暂无事实记录 📌<br/>
            点击"立即提取事实"开始分析对话
          </div>
        </div>
      </div>
    </div>`;
}

//═══════════════ 区块 C 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 D】 Tab 切换 & 风格/主题系统
// ═══════════════════════════════════════════

/**
 * 应用风格预设 —遍历所有 .bb-tab-btn[data-tab] 更新文字
 */
function applyStylePreset(presetName) {
  const preset = STYLE_PRESETS[presetName];
  if (!preset) return;

  TAB_KEYS.forEach(key => {
    const btn = document.querySelector(`.bb-tab-btn[data-tab="${key}"]`);
    if (btn && preset[key]) {
      btn.textContent = preset[key];
    }
  });

  // 同时设置面板class
  const panel = document.getElementById('bb-main-panel');
  if (panel) {
    panel.classList.remove('bb-style-modern', 'bb-style-ancient', 'bb-style-gothic', 'bb-style-custom');
    if (presetName && presetName !== 'modern') {
      panel.classList.add(`bb-style-${presetName}`);
    }
  }

  // 同时应用颜色主题
  applyColorTheme(presetName);
}

/**
 * 应用颜色主题 — 设置 body 的 data-bb-theme 属性，动态加载主题CSS文件
 */
function applyColorTheme(themeName) {
  document.body.removeAttribute('data-bb-theme');

  if (themeName && themeName !== 'modern') {
    document.body.setAttribute('data-bb-theme', themeName);
  }

  // 加载对应主题CSS
  if (themeName && themeName !== 'modern') {
    const themeId = `bb-theme-${themeName}`;
    if (!document.getElementById(themeId)) {
      const link = document.createElement('link');
      link.id = themeId;
      link.rel = 'stylesheet';
      link.href = `/scripts/extensions/${EXTENSION_NAME}/themes/${themeName}.css`;
      document.head.appendChild(link);
    }
  }
}

function restoreSettings() {
  const s = getSettings();
  if (s.style_preset) {
    applyStylePreset(s.style_preset);
  }
  if (s.custom_css) {
    applyCustomCSS(s.custom_css);
  }
}
// ── 构建并绑定主面板（修复：原代码缺失此函数） ──
function buildAndBindMainPanel() {
  const panel = document.getElementById('bb-main-panel');
  if (!panel) return;
  panel.innerHTML = buildMainPanelHTML();
  bindMainPanelEvents(panel);
  renderAll();
  // 初始化后隐藏
  $('#bb-main-panel').hide();
}

function applyCustomCSS(css) {
  let styleEl = document.getElementById('bb-custom-css-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'bb-custom-css-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css || '';
}
function applyCustomFont() {
  const s = getSettings();
  const url = s.custom_font_url;
  const name = s.custom_font_name;
  const apply = s.custom_font_apply || {};

  // 移除旧的字体样式
  $('#bb-custom-font-link').remove();
  $('#bb-custom-font-style').remove();

  if (!url || !name) return;

  // 加载字体
  const link = document.createElement('link');
  link.id = 'bb-custom-font-link';
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);

  // 构建应用CSS
  let css = '';
  const fontStack = `'${name}','Noto Serif SC', system-ui, sans-serif`;

  if (apply.panel) {
    css += `#bb-main-panel { font-family: ${fontStack} !important; }\n`;
  }
  if (apply.title) {
    css += `#bb-main-panel .bb-tab-btn,
#bb-main-panel .bb-section-title,
#bb-main-panel .bb-diary-header,
#bb-main-panel .bb-npc-name,
#bb-main-panel .bb-ach-title,
#bb-main-panel h3, #bb-main-panel h4, #bb-main-panel h5{ font-family: ${fontStack} !important; }\n`;
  }
  if (apply.content) {
    css += `#bb-main-panel .bb-diary-body,
#bb-main-panel .bb-record-text,
#bb-main-panel .bb-npc-desc,
#bb-main-panel .bb-parallel-body,
#bb-main-panel .bb-world-item,
#bb-main-panel .bb-letter-body,
#bb-summary-list .bb-diary-body { font-family: ${fontStack} !important; }\n`;
  }
  if (apply.ooc) {
    css += `#bb-ooc-win .bb-ooc-msg-bubble,
#bb-ooc-win .bb-ooc-input { font-family: ${fontStack} !important; }\n`;
  }

  if (css) {
    const style = document.createElement('style');
    style.id = 'bb-custom-font-style';
    style.textContent = css;
    document.head.appendChild(style);
  }
}


// ═══════════════ 区块 D 结束 ═══════════════
// ═══════════════════════════════════════════
// 【区块 E】 主页模块（三种布局）
// ═══════════════════════════════════════════

function buildHomeLayout(layout) {
  switch (layout) {
    case 'dashboard': return buildHomeDashboard();
    case 'minimalist': return buildHomeMinimalist();
    case 'together':
    default: return buildHomeTogether();
  }
}

function buildHomeTogether() {
  return `
    <div class="bb-home-card bb-home-together" id="bb-home-card">
      <div class="bb-home-top-row">
        <div class="bb-home-user-side">
          <div class="bb-home-avatar bb-avatar-clickable" id="bb-home-user-avatar" title="点击更换头像">👤</div>
          <div>
            <div id="bb-home-user-name" class="bb-home-name">用户名</div></div>
        </div>
        <div id="bb-home-link-emoji" contenteditable="true" class="bb-home-link-emoji" title="点击编辑">💕</div>
        <div class="bb-home-char-side">
          <div class="bb-home-name-right">
            <div id="bb-home-char-name" class="bb-home-name">角色名</div>
          </div>
          <div class="bb-home-avatar bb-avatar-clickable" id="bb-home-char-avatar" title="点击更换头像">🎭</div>
        </div>
      </div>

      <div class="bb-home-bubbles">
        <div class="bb-home-bubble-left">
          <div id="bb-home-user-bubble" class="bb-home-bubble" contenteditable="true" title="点击编辑">今天也要开心鸭~</div>
        </div>
        <div class="bb-home-bubble-right">
          <div id="bb-home-char-bubble" class="bb-home-bubble" contenteditable="true" title="点击编辑">嗯，一起加油！</div>
        </div>
      </div>

      <div class="bb-home-stats">
        <div class="bb-home-stats-row">
          <div class="bb-stat-item">
            <div id="bb-home-msg-count" class="bb-stat-number">0</div>
            <div class="bb-stat-label">💬 已聊天</div>
          </div>
          <div class="bb-stat-item">
            <div id="bb-home-time-count" class="bb-stat-number">0</div>
            <div class="bb-stat-label">⏱️ 分钟</div>
          </div>
        </div>
        <div class="bb-home-radio">
          <div class="bb-home-radio-label">🎵 正在一起听</div>
          <div id="bb-home-radio-text" contenteditable="true" class="bb-home-radio-text" title="点击编辑">骨与血电台</div>
        </div>
      </div>

      <div class="bb-home-actions">
        <button class="bb-sm-btn" id="bb-btn-set-home-bg">🖼️ 设置背景图</button>
        <button class="bb-sm-btn" id="bb-btn-save-home">💾 保存首页配置</button>
      </div>
    </div>
  `;
}

function buildHomeDashboard() {
  return `
    <div class="bb-home-card bb-home-dashboard" id="bb-home-card">
      <div class="bb-dashboard-header">
        <div class="bb-dashboard-avatar-row">
          <div class="bb-home-avatar bb-avatar-clickable" id="bb-home-user-avatar" title="点击更换头像">👤</div>
          <div id="bb-home-link-emoji" contenteditable="true" class="bb-home-link-emoji-sm" title="点击编辑">💕</div>
          <div class="bb-home-avatar bb-avatar-clickable" id="bb-home-char-avatar" title="点击更换头像">🎭</div>
        </div>
        <div class="bb-dashboard-names">
          <span id="bb-home-user-name" class="bb-home-name">用户名</span>
          <span class="bb-text-muted bb-mx-sm">&</span>
          <span id="bb-home-char-name" class="bb-home-name">角色名</span>
        </div>
      </div>

      <div class="bb-dashboard-grid">
        <div class="bb-dash-card">
          <div class="bb-dash-icon">💬</div>
          <div id="bb-home-msg-count" class="bb-dash-value">0</div>
          <div class="bb-dash-label">聊天消息</div>
        </div>
        <div class="bb-dash-card">
          <div class="bb-dash-icon">⏱️</div>
          <div id="bb-home-time-count" class="bb-dash-value">0</div>
          <div class="bb-dash-label">分钟</div>
        </div>
        <div class="bb-dash-card">
          <div class="bb-dash-icon">🌟</div>
          <div id="bb-home-scrap-count" class="bb-dash-value">0</div>
          <div class="bb-dash-label">收藏语录</div>
        </div>
        <div class="bb-dash-card">
          <div class="bb-dash-icon">📖</div>
          <div id="bb-home-diary-count" class="bb-dash-value">0</div>
          <div class="bb-dash-label">日记篇数</div>
        </div></div>

      <div class="bb-dashboard-quick">
        <h4 class="bb-section-title">⚡ 快捷操作</h4>
        <div class="bb-quick-actions">
          <button class="bb-sm-btn bb-quick-action" data-action="diary">📖 写日记</button>
          <button class="bb-sm-btn bb-quick-action" data-action="fate">🎲 命运骰</button>
          <button class="bb-sm-btn bb-quick-action" data-action="ooc">💬 聊天</button>
          <button class="bb-sm-btn bb-quick-action" data-action="weather">☁️ 环境</button>
          <button class="bb-sm-btn bb-quick-action" data-action="vibe">❤️ 氛围</button>
          <button class="bb-sm-btn bb-quick-action" data-action="genimg">🎨 生图</button>
        </div>
      </div>

      <div class="bb-dashboard-recent">
        <h4 class="bb-section-title">📖 最近日记</h4>
        <div id="bb-home-recent-diary" class="bb-text-muted bb-text-sm">暂无日记</div>
      </div>

      <div class="bb-home-bubbles">
        <div class="bb-home-bubble-left">
          <div id="bb-home-user-bubble" class="bb-home-bubble" contenteditable="true" title="点击编辑">今天也要开心鸭~</div>
        </div>
        <div class="bb-home-bubble-right">
          <div id="bb-home-char-bubble" class="bb-home-bubble" contenteditable="true" title="点击编辑">嗯，一起加油！</div>
        </div>
      </div>

      <div class="bb-home-radio">
        <div class="bb-home-radio-label">🎵 正在一起听</div>
        <div id="bb-home-radio-text" contenteditable="true" class="bb-home-radio-text" title="点击编辑">骨与血电台</div>
      </div>

      <div class="bb-home-actions">
        <button class="bb-sm-btn" id="bb-btn-set-home-bg">🖼️ 设置背景图</button>
        <button class="bb-sm-btn" id="bb-btn-save-home">💾 保存首页配置</button>
      </div>
    </div>
  `;
}

function buildHomeMinimalist() {
  return `
    <div class="bb-home-card bb-home-minimalist" id="bb-home-card">
      <div class="bb-mini-center">
        <div class="bb-mini-avatars">
          <div class="bb-home-avatar bb-avatar-clickable bb-mini-avatar-large" id="bb-home-user-avatar" title="点击更换头像">👤</div>
          <div id="bb-home-link-emoji" contenteditable="true" class="bb-mini-link" title="点击编辑">💕</div>
          <div class="bb-home-avatar bb-avatar-clickable bb-mini-avatar-large" id="bb-home-char-avatar" title="点击更换头像">🎭</div>
        </div>
        <div class="bb-mini-names">
          <span id="bb-home-user-name">用户名</span>
          <span class="bb-mini-sep">×</span>
          <span id="bb-home-char-name">角色名</span>
        </div>
        <div class="bb-mini-stats">
          <span><span id="bb-home-msg-count">0</span> 条对话</span>
          <span>·</span>
          <span><span id="bb-home-time-count">0</span> 分钟</span>
        </div>
        <div id="bb-home-radio-text" contenteditable="true" class="bb-mini-radio" title="点击编辑">骨与血电台</div><div class="bb-hidden">
          <div id="bb-home-user-bubble" contenteditable="true">今天也要开心鸭~</div>
          <div id="bb-home-char-bubble" contenteditable="true">嗯，一起加油！</div>
        </div>
      </div><div class="bb-home-actions bb-mt-lg">
        <button class="bb-sm-btn" id="bb-btn-set-home-bg">🖼️ 设置背景图</button>
        <button class="bb-sm-btn" id="bb-btn-save-home">💾 保存配置</button>
      </div>
    </div>
  `;
}

function applyHomeBackground() {
  const url = pluginData.home_config.background_url;
  const $card = $('#bb-home-card');
  if (url) {
    $card.css({
      'background-image': `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${url})`,
      'background-size': 'cover',
      'background-position': 'center',});
  } else {
    $card.css({ 'background-image': 'none', 'background': '' });
  }
}

function updateCharInfo() {
  const ctx = getContext();
  $('#bb-home-user-name').text(ctx.name1|| '用户名');
  $('#bb-home-char-name').text(ctx.name2 || '角色名');
  const msgCount = ctx.chat ? ctx.chat.length : 0;
  $('#bb-home-msg-count').text(msgCount);
  $('#bb-home-time-count').text(msgCount * 2);
  $('#bb-home-scrap-count').text(pluginData.records_bone.length);
  $('#bb-home-diary-count').text(pluginData.diary_blood.length);
  if (pluginData.diary_blood.length > 0) {
    const last = pluginData.diary_blood[pluginData.diary_blood.length - 1];
    $('#bb-home-recent-diary').html(`<div class="bb-text-sm">${esc(last.content.substring(0, 150))}...</div><div class="bb-text-xs bb-text-dim bb-mt-xs">${last.date}</div>`);
  }if (pluginData.home_config.user_avatar) {
    $('#bb-home-user-avatar').html(`<img src="${pluginData.home_config.user_avatar}" class="bb-avatar-img" />`);
  }if (pluginData.home_config.char_avatar) {
    $('#bb-home-char-avatar').html(`<img src="${pluginData.home_config.char_avatar}" class="bb-avatar-img" />`);
  }$('#bb-home-link-emoji').text(pluginData.home_config.link_emoji || '💕');
  $('#bb-home-user-bubble').text(pluginData.home_config.user_bubble || '今天也要开心鸭~');
  $('#bb-home-char-bubble').text(pluginData.home_config.char_bubble || '嗯，一起加油！');
  $('#bb-home-radio-text').text(pluginData.home_config.radio_text || '骨与血电台');
}

// ═══════════════ 区块 E 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 F】 语录收藏（唱片机/拾遗录）
// ═══════════════════════════════════════════

function renderRecords() {
  const container = document.getElementById('bb-records-list');
  if (!container) return;

  if (!pluginData.records_bone || pluginData.records_bone.length === 0) {
    container.innerHTML = `
      <div class="bb-empty">
        <span class="bb-empty-icon">🌟</span>
        还没有收藏任何语录<br/><span class="bb-text-xs bb-text-muted">在聊天消息上点击 🌟 按钮即可收藏</span>
      </div>`;
    return;
  }

  container.innerHTML = pluginData.records_bone.map((r, i) => `
    <div class="bb-record-item" data-index="${i}">
      <div class="bb-record-display" data-index="${i}">
        <div class="bb-record-text">${renderSafeHTML(r.text)}</div>
        <div class="bb-record-meta">
          <span>— ${r.who || r.character || '未知'} · ${r.time || r.timestamp || ''}</span>
          <div class="bb-record-actions">
            <button class="bb-record-edit-btn" data-index="${i}" title="编辑">✏️</button>
            <button class="bb-poster-btn" data-index="${i}" title="生成海报">🖼</button>
            <button class="bb-btn-del bb-record-del" data-index="${i}" title="删除">🗑</button>
          </div>
        </div>
      </div>
      <div class="bb-record-editor bb-hidden" data-index="${i}">
        <textarea class="bb-textarea bb-record-edit-area" data-index="${i}" rows="4">${escapeHtml(r.text)}</textarea>
        <div class="bb-btn-group bb-mt-sm">
          <button class="bb-btn bb-btn-sm bb-btn-primary bb-record-save" data-index="${i}">💾 保存</button>
          <button class="bb-btn bb-btn-sm bb-record-cancel" data-index="${i}">取消</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderScrapbook() {
  renderRecords();
  if (pluginData.records_bone.length === 0) {
    $('#bb-scrap-empty').show();
    $('.bb-action-bar').first().hide();
  } else {
    $('#bb-scrap-empty').hide();
    $('.bb-action-bar').first().show();
  }
}

// ═══════════════ 区块 F 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 G】 AI日记
// ═══════════════════════════════════════════

function renderDiary() {
  const list = $('#bb-diary-list'); list.empty();
  if (pluginData.diary_blood.length === 0) { $('#bb-diary-empty').show(); return; }
  $('#bb-diary-empty').hide();
  pluginData.diary_blood.forEach((d, idx) => {
    list.append(`
      <div class="bb-diary-item">
        <div class="bb-diary-header">
          <span>📅 ${d.date}</span>
          <span class="bb-diary-del bb-clickable" data-idx="${idx}" title="删除">🗑️</span>
        </div>
        <div class="bb-diary-body">${esc(d.content)}</div>
      </div>`);
  });
  list.find('.bb-diary-del').on('click', function () {
    const idx = $(this).data('idx');
    if (!confirm('确认删除该日记?')) return;
    pluginData.diary_blood.splice(idx, 1);
    saveChatData(); renderDiary(); toastr.info('已删除日记');
  });
}

async function generateDiary() {
  const ctx = getContext(); const cn = ctx.name2|| '角色';
  toastr.info(`📖 ${cn} 正在写日记...`);
  const recent = getRecentChat(30);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }
  const preset = getActivePreset();
  const result = await callSubAPI([{ role: 'system', content: `你是"${cn}"。${preset.prompts.diary}` }, { role: 'user', content: fmt(recent) }], 600);
  if (result) {
    pluginData.diary_blood.push({ date: new Date().toLocaleString('zh-CN'), content: result, character: cn });
    saveChatData(); renderDiary();
    toastr.success(`📖 ${cn} 的日记已更新！`);
    bbNotify('diary', `${cn} 的日记已更新`, result.substring(0, 100));
    playNotificationSound('success');
    checkAchievements();
  }
}

async function generateSummary() {
  toastr.info('📜 正在生成阿卡夏记录...');
  const recent = getRecentChat(40);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }
  const preset = getActivePreset();
  const result = await callSubAPI([{ role: 'system', content: preset.prompts.summary }, { role: 'user', content: fmt(recent) }], 500);
  if (result) {
    pluginData.summaries.push({ date: new Date().toLocaleString('zh-CN'), content: result });
    saveChatData(); toastr.success('📜 阿卡夏记录已更新！');
    bbNotify('summary', '阿卡夏记录已更新', result.substring(0, 100));
    playNotificationSound('success');

  }
}
function renderSummary() {
  const list = $('#bb-summary-list');
  const empty = $('#bb-summary-empty');
  list.empty();
  
  if (!pluginData.summaries || pluginData.summaries.length === 0) {
    empty.show();
    return;
  }
  empty.hide();
  
  //倒序显示（最新的在上面）
  [...pluginData.summaries].reverse().forEach((s, idx) => {
    const realIdx = pluginData.summaries.length - 1 - idx;
    list.append(`
      <div class="bb-diary-item">
        <div class="bb-diary-header">
          <span>📜 #${realIdx + 1} — ${esc(s.date)}</span>
          <span class="bb-record-actions">
            <button class="bb-sm-btn bb-btn-xs bb-btn-danger bb-del-summary" data-idx="${realIdx}" title="删除">🗑️</button>
          </span>
        </div>
<div class="bb-diary-body">${renderSafeHTML(s.content)}</div>
      </div>
    `);
  });
  
  // 删除事件
  list.find('.bb-del-summary').on('click', function () {
    const idx = parseInt($(this).data('idx'));
    if (confirm('确定删除这条总结？')) {
      pluginData.summaries.splice(idx, 1);
      saveChatData();
      renderSummary();
      toastr.info('总结已删除');
    }
  });
}

// 更新自动总结状态栏
function updateAutoSummaryBar() {
  const s = getSettings();
  $('#bb-auto-status').text(s.auto_diary_enabled ? '✅ 开启' : '❌ 关闭');
  $('#bb-msg-counter').text(`${s.message_counter || 0}/${s.diary_trigger_count || 30}`);$('#bb-btn-toggle-auto').text(s.auto_diary_enabled ? '⏸ 暂停' : '▶ 开启');
}

// ═══════════════ 区块 G 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 H】 NPC追踪
// ═══════════════════════════════════════════

function renderIntel() {
  const npcBox = $('#bb-npc-box'); npcBox.empty();
  const npcNames = Object.keys(pluginData.npc_status);
  if (npcNames.length === 0) {
    npcBox.html('<p class="bb-empty">暂无追踪的NPC<br/>点击上方添加</p>');
    return;
  }
  npcNames.forEach(name => {
    const info = pluginData.npc_status[name];
    npcBox.append(`
      <div class="bb-npc-card">
        <div class="bb-npc-header">
          <span class="bb-npc-name">🧑‍🤝‍🧑 ${esc(name)}</span>
          <span class="bb-npc-actions">
            <button class="bb-sm-btn bb-btn-xs bb-npc-peek" data-name="${esc(name)}" title="窥探">🔍</button>
            <button class="bb-sm-btn bb-btn-xs bb-npc-del" data-name="${esc(name)}" title="移除">🗑️</button>
          </span>
        </div>
        <div class="bb-npc-body">${esc(info.description || '等待窥探...')}</div>
        <div class="bb-npc-time">${info.lastUpdate || ''}</div>
      </div>`);
  });
  npcBox.find('.bb-npc-peek').on('click', function () { generateNPCStatus($(this).data('name')); });
  npcBox.find('.bb-npc-del').on('click', function () {
    const n = $(this).data('name');
    if (!confirm(`确认移除NPC: ${n}?`)) return;
    delete pluginData.npc_status[n]; saveChatData(); renderIntel();
    toastr.info(`已移除 ${n}`);
  });
}

async function generateNPCStatus(name) {
  toastr.info(`🔍 正在窥探 ${name}...`);
  const recent = getRecentChat(30); const preset = getActivePreset();
  const result = await callSubAPI([{ role: 'system', content: `${preset.prompts.npc}\nNPC名称: ${name}` }, { role: 'user', content: fmt(recent) }], 400);
  if (result) {
    pluginData.npc_status[name] = { description: result, lastUpdate: new Date().toLocaleString('zh-CN') };
    saveChatData(); renderIntel();
    toastr.success(`🔍 ${name} 的情报已更新！`);
  }
}

async function autoNPCPeek() {
  toastr.info('🎲 分析剧情中的NPC...');
  const recent = getRecentChat(40);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }
  const ctx = getContext();
  const result = await callSubAPI([{ role: 'system', content: `分析以下对话，提取出1-2个出现过的NPC名字（不包括用户"${ctx.name1}"和主角"${ctx.name2}"）。只返回名字，用逗号分隔，不要其他内容。如果没有NPC，返回"无"。` }, { role: 'user', content: fmt(recent) }], 100);
  if (!result || result === '无') { toastr.warning('未检测到NPC'); return; }
  const names = result.split(/[,，、]/).map(n => n.trim()).filter(Boolean).slice(0, 2);
  for (const name of names) {
    if (!pluginData.npc_status[name]) {
      pluginData.npc_status[name] = { description: '等待窥探...', lastUpdate: '' };
    }
    await generateNPCStatus(name);
  }
  saveChatData(); renderIntel();
}

// ═══════════════ 区块 H 结束 ═══════════════
// ═══════════════════════════════════════════
// 【区块 I】 环境雷达 &氛围心电图
// ═══════════════════════════════════════════

async function generateWeather() {
  toastr.info('☁️ 正在扫描环境...');
  const recent = getRecentChat(20);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }
  const preset = getActivePreset();
  const result = await callSubAPI([{ role: 'system', content: preset.prompts.weather }, { role: 'user', content: fmt(recent) }], 300);
  if (result) {
    pluginData.weather = result; saveChatData();
    $('#bb-weather-box').html(esc(result));
    toastr.success('☁️ 环境雷达已更新！');
    bbNotify('weather', '环境雷达已更新', result.substring(0, 80));
    playNotificationSound('success');

  }
}

async function generateVibe() {
  toastr.info('❤️ 正在分析氛围...');
  const recent = getRecentChat(20);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }
  const preset = getActivePreset();
  const result = await callSubAPI([{ role: 'system', content: preset.prompts.vibe }, { role: 'user', content: fmt(recent) }], 300);
  if (result) {
    pluginData.vibe = result; saveChatData();
    $('#bb-vibe-box').html(esc(result));
    toastr.success('❤️ 氛围心电图已更新！');
    bbNotify('vibe', '氛围心电图已更新', result.substring(0, 80));
    playNotificationSound('success');

  }
}

// ═══════════════ 区块 I 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 J】 平行宇宙（蝴蝶窗口）
// ═══════════════════════════════════════════

function renderParallel() {
  const list = $('#bb-par-list'); list.empty();
  if (pluginData.parallel_universes.length === 0) { $('#bb-par-empty').show(); return; }
  $('#bb-par-empty').hide();
  pluginData.parallel_universes.forEach((p, idx) => {
    list.append(`
      <div class="bb-par-item">
        <div class="bb-par-header">
          <span class="bb-text-primary bb-text-bold">🦋 #${p.floor} — ${p.date}</span>
          <span class="bb-par-del bb-clickable" data-idx="${idx}" title="删除">🗑️</span>
        </div>
        <div class="bb-par-origin"><b>原文:</b> ${esc((p.origin || '').substring(0, 60))}...</div>
        <div class="bb-par-body">${esc(p.content)}</div>
      </div>`);
  });
  list.find('.bb-par-del').on('click', function () {
    const idx = $(this).data('idx');
    if (!confirm('确认删除该平行宇宙记录?')) return;
    pluginData.parallel_universes.splice(idx, 1);
    saveChatData(); renderParallel(); toastr.info('已删除平行宇宙记录');
  });
}

function injectButterflyWindow() {
  if ($('#bb-bf-win').length > 0) return;
  $('body').append(`
    <div id="bb-bf-win" class="bb-sub-window bb-hidden">
      <div class="bb-bf-header">
        <div class="bb-bf-title">🦋 平行宇宙</div>
        <button class="bb-win-close-btn" id="bb-bf-close">✖</button>
      </div>
      <div id="bb-bf-origin" class="bb-bf-origin"></div>
      <div id="bb-bf-chat" class="bb-bf-chat"></div>
      <div class="bb-bf-input-area">
        <input id="bb-bf-input" type="text" class="bb-input" placeholder="输入消息..." />
        <button id="bb-bf-send" class="bb-sm-btn bb-btn-primary">发送</button>
        <button id="bb-bf-export" class="bb-sm-btn" title="导出对话">📄</button>
      </div>
    </div>
  `);
  $('#bb-bf-close').on('click', () => $('#bb-bf-win').addClass('bb-hidden'));
  $('#bb-bf-send').on('click', sendBfMsg);
  $('#bb-bf-input').on('keypress', (e) => { if (e.which === 13) sendBfMsg(); });
  $('#bb-bf-export').on('click', exportBfChat);
}

function openBfWin(messageId) {
  const ctx = getContext();
  const msg = ctx.chat[messageId];
  if (!msg) { toastr.error('未找到消息'); return; }
  butterflySession = { active: true, originFloor: messageId, originText: msg.mes, history: [] };
  $('#bb-bf-origin').html(`<b>原文(#${messageId}):</b> ${esc(msg.mes.substring(0, 200))}${msg.mes.length > 200 ? '...' : ''}`);
  $('#bb-bf-chat').empty();
  $('#bb-bf-win').removeClass('bb-hidden');
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
    const aiReply = await callSubAPI([{ role: 'system', content: preset.prompts.butterfly }, ...butterflySession.history], 500);
    if (aiReply) {
      addBfBubble('assistant', aiReply);
      butterflySession.history.push({ role: 'assistant', content: aiReply });
    }
  }
}

async function genBfFirst(userChoice) {
  toastr.info('🦋 生成平行宇宙中...');
  const preset = getActivePreset();
  const p = `${preset.prompts.butterfly}\n\n原文：\n${butterflySession.originText}\n\n用户选择：\n${userChoice}`;
  const result = await callSubAPI([{ role: 'system', content: p }], 600);
  if (result) {
    addBfBubble('assistant', result);
    butterflySession.history.push({ role: 'assistant', content: result });pluginData.parallel_universes.push({
      floor: butterflySession.originFloor,
      origin: butterflySession.originText,
      content: result,
      date: new Date().toLocaleString('zh-CN')
    });
    saveChatData(); renderParallel();
    toastr.success('🦋 平行宇宙已生成！');
  }
}

function addBfBubble(role, text) {
  const isUser = role === 'user';
  const bubble = `<div class="bb-bf-msg ${isUser ? 'bb-bf-msg-user' : 'bb-bf-msg-ai'}"><div class="bb-chat-bubble ${isUser ? 'bb-bubble-user' : 'bb-bubble-ai'}">${renderSafeHTML(text)}</div></div>`;
  $('#bb-bf-chat').append(bubble);
  $('#bb-bf-chat').scrollTop($('#bb-bf-chat')[0].scrollHeight);
}

function exportBfChat() {
  if (butterflySession.history.length === 0) { toastr.warning('暂无对话'); return; }
  let md = `# 🦋 平行宇宙对话\n\n## 原文 (#${butterflySession.originFloor})\n${butterflySession.originText}\n\n## 对话记录\n\n`;
  butterflySession.history.forEach(m => { md += `**${m.role === 'user' ? '你' : '角色'}:** ${m.content}\n\n`; });
  dl(`butterfly_${butterflySession.originFloor}_${Date.now()}.md`, md, 'text/markdown');
  toastr.success('📄 已导出蝴蝶对话');
}

// ═══════════════ 区块 J 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 K】 命运骰子
// ═══════════════════════════════════════════

async function rollFate() {
  toastr.info('🎲 命运之轮转动中...');
  const ctx = getContext(); const cn = ctx.name2 || '角色'; const recent = getRecentChat(15);
  const preset = getActivePreset();
  const result = await callSubAPI([{ role: 'system', content: `${preset.prompts.fate}\n角色名：${cn}` }, { role: 'user', content: recent.length > 0 ? fmt(recent) : '（新的冒险刚刚开始）' }], 300);
  if (result) {
    pluginData.chaos_event = result;
    const floor = ctx.chat ? ctx.chat.length : 0;
    pluginData.fate_history.push({ content: result, floor: floor, timestamp: new Date().toLocaleString('zh-CN') });
    $('#bb-fate-result').html(`
      <div class="bb-fate-dice-icon">🎲</div>
      <div class="bb-fate-content">${esc(result)}</div>
      <div class="bb-fate-hint">使用宏<code>{{bb_chaos_event}}</code> 插入到对话中<br/>（宏读取后会自动清空，只能使用一次）</div>`);
    saveChatData(); renderFateHistory();
    toastr.success('🎲 命运已降临！');
    bbNotify('fate', '命运已降临！', result.substring(0, 80));
    playNotificationSound('success');

    checkAchievements();
  }
}

function renderFateHistory() {
  const list = $('#bb-fate-history-list'); list.empty();
  if (pluginData.fate_history.length === 0) {
    list.html('<div class="bb-empty bb-p-md">暂无命运历史</div>');
    return;
  }
  pluginData.fate_history.slice(-5).reverse().forEach((f, idx) => {
    list.append(`
      <div class="bb-record-item">
        <div class="bb-fate-item-header">
          <span class="bb-text-primary bb-text-sm">[${f.timestamp}] #${f.floor}</span>
          <span class="bb-fate-del bb-clickable" data-idx="${pluginData.fate_history.length - 1 - idx}" title="删除">🗑️</span>
        </div>
        <div class="bb-fate-item-body">${esc(f.content)}</div>
      </div>`);
  });
  if (pluginData.fate_history.length > 5) {
    list.prepend('<div class="bb-text-center bb-text-muted bb-text-xs bb-mb-md">仅显示最近5条</div>');
  }
  list.find('.bb-fate-del').on('click', function () {
    const idx = $(this).data('idx');
    pluginData.fate_history.splice(idx, 1);
    saveChatData(); renderFateHistory(); toastr.info('已删除命运记录');
  });
}

// ═══════════════ 区块 K 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 L】 OOC 破墙聊天室（仿IM风格）
// ═══════════════════════════════════════════

/**
 * OOC Tab内的预览渲染
 */
function renderOOCPreview() {
  const preview = $('#bb-ooc-preview');
  preview.empty();
  if (pluginData.ooc_chat.length === 0) {
    preview.html('<div class="bb-empty">这里是跨越次元的聊天窗口<br/>点击上方按钮，和ta聊聊剧本之外的故事吧！</div>');
    return;
  }
  const ctx = getContext();
  pluginData.ooc_chat.slice(-5).forEach(m => {
    const isUser = m.role === 'user';
    const avatarText = isUser ? '👤' : '🎭';
    preview.append(`
      <div class="bb-ooc-msg ${isUser ? 'bb-msg-user' : 'bb-msg-ai'}">
        <div class="bb-ooc-msg-avatar">${avatarText}</div>
        <div>
          <div class="bb-ooc-msg-bubble bb-text-sm">${renderSafeHTML(m.content)}</div>
          <div class="bb-ooc-msg-time">${m.timestamp || ''}</div>
        </div>
      </div>`);
  });
  if (pluginData.ooc_chat.length > 5) {
    preview.prepend('<div class="bb-text-center bb-text-muted bb-text-xs bb-mb-md">... 仅显示最近5条，点击打开查看全部</div>');
  }
}

/**
 * 注入OOC窗口 — 仿微信/IG的IM风格
 */
function injectOOCWindow() {
  if ($('#bb-ooc-win').length > 0) return;

  const ctx = getContext();
  const charName = ctx.name2 || '角色';

  $('body').append(`
    <div id="bb-ooc-win" class="bb-ooc-win bb-hidden">
      <!-- 头部：头像 + 角色名 + 在线状态 + 关闭 -->
      <div class="bb-ooc-header">
        <div class="bb-ooc-header-left">
          <div class="bb-ooc-header-avatar">🎭</div>
          <div class="bb-ooc-header-info">
            <div class="bb-ooc-header-name" id="bb-ooc-char-name">${esc(charName)}</div>
            <div class="bb-ooc-header-status">● 在线</div>
          </div>
        </div>
        <button class="bb-win-close-btn" id="bb-ooc-close">✖</button>
      </div>

      <!-- 可折叠的预设选择栏 -->
      <div class="bb-ooc-preset-bar">
        <div class="bb-ooc-preset-toggle" id="bb-ooc-preset-toggle">⚙️ 预设设置 ▾</div>
        <div class="bb-ooc-preset-content bb-hidden" id="bb-ooc-preset-content">
          <select id="bb-ooc-win-preset-select" class="bb-select"></select>
          <div class="bb-ooc-preset-actions">
            <button class="bb-sm-btn bb-btn-xs" id="bb-ooc-win-preset-new">新建</button>
            <button class="bb-sm-btn bb-btn-xs" id="bb-ooc-win-preset-edit">编辑</button>
            <button class="bb-sm-btn bb-btn-xs" id="bb-ooc-win-preset-import">导入</button>
            <button class="bb-sm-btn bb-btn-xs" id="bb-ooc-win-preset-export">导出</button>
            <button class="bb-sm-btn bb-btn-xs bb-btn-danger" id="bb-ooc-win-preset-delete">删除</button>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="bb-ooc-messages" id="bb-ooc-chat"></div>

      <!-- 输入区域 -->
      <div class="bb-ooc-input-area">
        <div class="bb-ooc-input-wrapper">
          <div class="bb-sticker-panel bb-hidden" id="bb-ooc-sticker-panel"></div>
          <textarea class="bb-ooc-input" id="bb-ooc-input" placeholder="在这里，你可以和TA聊聊剧本之外的故事..." rows="1"></textarea>
          <button class="bb-ooc-sticker-btn" id="bb-ooc-sticker-btn" title="表情包">😊</button>
        </div>
        <button class="bb-ooc-send-btn" id="bb-ooc-send" title="发送">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `);

  // 事件绑定
  $('#bb-ooc-close').on('click', () => $('#bb-ooc-win').addClass('bb-hidden'));
  $('#bb-ooc-send').on('click', sendOOCMsg);
  $('#bb-ooc-input').on('keypress', (e) => {
    if (e.which === 13 && !e.shiftKey) { e.preventDefault(); sendOOCMsg(); }
  });

  // 表情包按钮 — 在输入框内右下角
  $('#bb-ooc-sticker-btn').on('click', function (e) {
    e.stopPropagation();
    const $panel = $('#bb-ooc-sticker-panel');
    if ($panel.hasClass('bb-hidden')) {
      renderStickerPanel($panel);
      $panel.removeClass('bb-hidden');
    } else {
      $panel.addClass('bb-hidden');
    }
  });

  // 预设折叠
  $('#bb-ooc-preset-toggle').on('click', () => {
    $('#bb-ooc-preset-content').toggleClass('bb-hidden');});

  // OOC窗口内预设管理
  bindOOCWindowPresetEvents();

  // 点击外部关闭表情面板
  $(document).on('click', (e) => {
    if (!$(e.target).closest('#bb-ooc-sticker-panel, #bb-ooc-sticker-btn').length) {
      $('#bb-ooc-sticker-panel').addClass('bb-hidden');
    }
  });

  renderOOCChat();
}

function renderStickerPanel($panel) {
  const packs = pluginData.sticker_packs || [];
  let tabsHtml = packs.map((pack, i) =>
    `<div class="bb-sticker-tab ${i === 0 ? 'active' : ''}" data-pack-idx="${i}">${esc(pack.name)}</div>`
  ).join('');
  tabsHtml += `<div class="bb-sticker-tab" data-action="manage-stickers">⚙️</div>`;

  const firstPack = packs[0];
  let gridHtml = '';
  if (firstPack && firstPack.stickers.length > 0) {
    gridHtml = firstPack.stickers.map((s) =>
      `<div class="bb-sticker-item" data-sticker-id="${esc(s.id)}" title="${esc(s.alt || s.id)}"><img src="${esc(s.url)}" alt="${esc(s.alt || s.id)}" /></div>`
    ).join('');
  } else {
    gridHtml = '<div class="bb-empty bb-p-md">暂无表情包<br/>点击 ⚙️ 管理</div>';
  }

  $panel.html(`
    <div class="bb-sticker-tabs-row">${tabsHtml}</div>
    <div class="bb-sticker-grid" id="bb-sticker-grid-content">${gridHtml}</div>
  `);

  $panel.off('click').on('click', '.bb-sticker-tab', function () {
    const action = $(this).data('action');
    if (action === 'manage-stickers') { showStickerManager(); return; }
    const idx = $(this).data('pack-idx');
    $panel.find('.bb-sticker-tab').removeClass('active');
    $(this).addClass('active');
    const pack = packs[idx];
    let html = '';
    if (pack && pack.stickers.length > 0) {
      html = pack.stickers.map((s) =>
        `<div class="bb-sticker-item" data-sticker-id="${esc(s.id)}" title="${esc(s.alt || s.id)}"><img src="${esc(s.url)}" alt="${esc(s.alt || s.id)}" /></div>`
      ).join('');
    } else {
      html = '<div class="bb-empty bb-p-md">此表情包为空</div>';
    }
    $('#bb-sticker-grid-content').html(html);
  });

  $panel.on('click', '.bb-sticker-item', function () {
    const stickerId = $(this).data('sticker-id');
    const $input = $('#bb-ooc-input');
    $input.val($input.val() + `[sticker:${stickerId}]`);
    $panel.addClass('bb-hidden');
  });
}

function bindOOCWindowPresetEvents() {
  const s = () => extension_settings[EXTENSION_NAME];

  function refreshWinPresetSelect() {
    const sel = $('#bb-ooc-win-preset-select').empty();
    (s().ooc_presets || []).forEach((p, i) => {
      sel.append(`<option value="${i}" ${i === s().active_ooc_preset ? 'selected' : ''}>${p.name}</option>`);
    });
  }
  refreshWinPresetSelect();

  $('#bb-ooc-win-preset-select').on('change', function () {
    s().active_ooc_preset = parseInt(this.value);
    saveSettingsDebounced();
    toastr.info(`OOC预设已切换: ${s().ooc_presets[s().active_ooc_preset]?.name}`);
  });

  $('#bb-ooc-win-preset-new').on('click', function () {
    const name = prompt('新OOC预设名称:');
    if (!name) return;
    if (!s().ooc_presets) s().ooc_presets = [];
    s().ooc_presets.push({ name, system_prompt: '', temperature: 0.8, max_tokens: 800 });
    s().active_ooc_preset = s().ooc_presets.length - 1;
    saveSettingsDebounced(); refreshWinPresetSelect();
    toastr.success(`OOC预设「${name}」已创建`);
  });

    $('#bb-ooc-win-preset-edit').on('click', function () {
    const preset = s().ooc_presets?.[s().active_ooc_preset];
    if (!preset) return;
    
    // 检查是否已有编辑面板展开
    if ($('#bb-ooc-win-edit-panel').length > 0) {
      $('#bb-ooc-win-edit-panel').remove();
      return;
    }
    
    const editPanel = $(`
      <div id="bb-ooc-win-edit-panel" class="bb-ooc-edit-panel">
        <div class="bb-form-col" style="gap:8px;">
          <label class="bb-label">预设名称：</label>
          <input id="bb-ooc-win-pe-name" type="text" class="bb-input" value="${esc(preset.name)}" />
          <label class="bb-label">系统提示词：</label>
          <textarea id="bb-ooc-win-pe-system" class="bb-textarea" rows="6" style="min-height:120px;">${esc(preset.system_prompt || '')}</textarea>
          
          <div class="bb-btn-row" style="gap:6px;">
            <div class="bb-form-col" style="flex:1;gap:4px;">
              <label class="bb-label bb-text-xs">Temperature</label>
              <input id="bb-ooc-win-pe-temp" type="number" class="bb-input" step="0.1" min="0" max="2" value="${preset.temperature ?? 0.8}" />
            </div>
            <div class="bb-form-col" style="flex:1;gap:4px;">
              <label class="bb-label bb-text-xs">Max Tokens</label>
              <input id="bb-ooc-win-pe-tokens" type="number" class="bb-input" min="50" max="4000" value="${preset.max_tokens ?? 800}" />
            </div></div>
          
          <div class="bb-btn-row" style="gap:6px;">
            <button class="bb-sm-btn bb-btn-primary bb-flex-1" id="bb-ooc-win-pe-save">💾 保存</button>
            <button class="bb-sm-btn bb-btn-secondary" id="bb-ooc-win-pe-cancel">取消</button>
          </div>
        </div>
      </div>
    `);
    
    $('#bb-ooc-preset-content').append(editPanel);
    
    editPanel.find('#bb-ooc-win-pe-save').on('click', function() {
      preset.name = $('#bb-ooc-win-pe-name').val().trim() || preset.name;
      preset.system_prompt = $('#bb-ooc-win-pe-system').val();
      preset.temperature = parseFloat($('#bb-ooc-win-pe-temp').val()) ||0.8;
      preset.max_tokens = parseInt($('#bb-ooc-win-pe-tokens').val()) || 800;
      saveSettingsDebounced();
      refreshWinPresetSelect();
      editPanel.remove();
      toastr.success(`OOC预设「${preset.name}」已保存`);
    });
    
    editPanel.find('#bb-ooc-win-pe-cancel').on('click', () => editPanel.remove());
  });


  $('#bb-ooc-win-preset-delete').on('click', function () {
    if (!s().ooc_presets || s().ooc_presets.length <= 1) { toastr.warning('至少保留一个OOC预设'); return; }
    const idx = s().active_ooc_preset;
    if (!confirm(`确定删除OOC预设「${s().ooc_presets[idx]?.name}」？`)) return;
    s().ooc_presets.splice(idx, 1);
    s().active_ooc_preset =0;
    saveSettingsDebounced(); refreshWinPresetSelect();
    toastr.info('OOC预设已删除');
  });

  $('#bb-ooc-win-preset-import').on('click', function () {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const text = await e.target.files[0].text();
        const data = JSON.parse(text);
        if (!data.name || data.system_prompt === undefined) throw new Error('无效的OOC预设文件');
        if (!s().ooc_presets) s().ooc_presets = [];
        s().ooc_presets.push(data);
        s().active_ooc_preset = s().ooc_presets.length - 1;
        saveSettingsDebounced(); refreshWinPresetSelect();
        toastr.success(`OOC预设「${data.name}」已导入`);
      } catch (err) { toastr.error(`导入失败: ${err.message}`); }
    };
    input.click();
  });

  $('#bb-ooc-win-preset-export').on('click', function () {
    const preset = s().ooc_presets?.[s().active_ooc_preset];
    if (!preset) return;
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bb_ooc_preset_${preset.name}.json`;
    a.click(); URL.revokeObjectURL(a.href);
    toastr.info('OOC预设已导出');
  });
}

/**
 * 渲染单条OOC消息气泡 — 仿IM风格
 */
function renderOOCMessage(msg) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  const ctx = getContext();
  const avatarText = isUser ? '👤' : '🎭';
  const content = isSystem ? msg.content : renderSafeHTML(msg.content);

  if (isSystem) {
    return `<div class="bb-ooc-msg bb-msg-system"><div class="bb-ooc-msg-bubble bb-bubble-system">${content}</div></div>`;
  }

  return `
    <div class="bb-ooc-msg ${isUser ? 'bb-msg-user' : 'bb-msg-ai'}">
      <div class="bb-ooc-msg-avatar">${avatarText}</div>
      <div>
        <div class="bb-ooc-msg-bubble">${content}</div>
        <div class="bb-ooc-msg-time">${msg.timestamp || ''}</div>
      </div>
    </div>`;
}

async function sendOOCMsg() {
  const input = $('#bb-ooc-input');
  const userMsg = input.val().trim();
  if (!userMsg) return;
  input.val('');

  const timestamp = new Date().toLocaleString('zh-CN');
  pluginData.ooc_chat.push({ role: 'user', content: userMsg, timestamp });
  oocSession.history.push({ role: 'user', content: userMsg });
  $('#bb-ooc-chat').append(renderOOCMessage({ role: 'user', content: userMsg, timestamp }));
  scrollOOCChat();
  saveChatData();

  const ctx = getContext();
  const oocPreset = getActiveOOCPreset();
  const systemPrompt = `${oocPreset.system_prompt}\n\n当前角色名: ${ctx.name2 || '角色'}\n用户名: ${ctx.name1 || '用户'}\n真实时间: ${new Date().toLocaleString('zh-CN')}\n${getStickerListForPrompt()}`;
  const messages = [{ role: 'system', content: systemPrompt }, ...oocSession.history];
  const aiReply = await callSubAPI(messages, oocPreset.max_tokens || 500, oocPreset.temperature || 0.8);

  if (aiReply) {
    const aiTimestamp = new Date().toLocaleString('zh-CN');
    pluginData.ooc_chat.push({ role: 'assistant', content: aiReply, timestamp: aiTimestamp });
    oocSession.history.push({ role: 'assistant', content: aiReply });
    $('#bb-ooc-chat').append(renderOOCMessage({ role: 'assistant', content: aiReply, timestamp: aiTimestamp }));
    scrollOOCChat();
    saveChatData();renderOOCPreview();
  }
}

function scrollOOCChat() {
  const el = document.getElementById('bb-ooc-chat');
  if (el) el.scrollTop = el.scrollHeight;
}

function renderOOCChat() {
  $('#bb-ooc-chat').empty();
  pluginData.ooc_chat.forEach(m => {
    $('#bb-ooc-chat').append(renderOOCMessage(m));
  });
  scrollOOCChat();

  // 更新角色名
  const ctx = getContext();
  $('#bb-ooc-char-name').text(ctx.name2 || '角色');
}

function exportOOCChat() {
  if (pluginData.ooc_chat.length === 0) { toastr.warning('暂无聊天记录'); return; }
  const ctx = getContext();
  const data = { exportTime: new Date().toISOString(), character: ctx.name2 || '角色', user: ctx.name1 || '用户', chatId: ctx.chatId, messages: pluginData.ooc_chat };
  dl(`burning_star_chat_${Date.now()}.json`, JSON.stringify(data, null, 2), 'application/json');
  toastr.success('📤Burning Star Chat 已导出为JSON');
}

// 表情包系统
function showStickerPicker(targetInputId) {
  $('#bb-sticker-picker').remove();
  const packs = pluginData.sticker_packs || [];
  let tabsHtml = packs.map((pack, i) => `<div class="bb-sticker-tab ${i === 0 ? 'active' : ''}" data-pack-idx="${i}">${esc(pack.name)}</div>`).join('');
  tabsHtml += `<div class="bb-sticker-tab" data-action="manage-stickers">⚙️</div>`;
  const firstPack = packs[0];
  let gridHtml = '';
  if (firstPack && firstPack.stickers.length > 0) {
    gridHtml = firstPack.stickers.map((s) => `<div class="bb-sticker-item" data-sticker-id="${esc(s.id)}" title="${esc(s.alt || s.id)}"><img src="${esc(s.url)}" alt="${esc(s.alt || s.id)}" /></div>`).join('');
  } else {
    gridHtml = '<div class="bb-empty bb-p-md">暂无表情包<br/>点击 ⚙️ 管理</div>';
  }
  const $picker = $(`<div id="bb-sticker-picker" class="bb-sticker-picker"><div class="bb-sticker-tabs-row">${tabsHtml}</div><div class="bb-sticker-grid" id="bb-sticker-grid-content">${gridHtml}</div></div>`);
  $(`#${targetInputId}`).parent().append($picker);
  $picker.on('click', '.bb-sticker-tab', function () {
    const action = $(this).data('action');
    if (action === 'manage-stickers') { showStickerManager(); return; }
    const idx = $(this).data('pack-idx');
    $picker.find('.bb-sticker-tab').removeClass('active');
    $(this).addClass('active');
    const pack = packs[idx];
    let html = '';
    if (pack && pack.stickers.length > 0) {
      html = pack.stickers.map((s) => `<div class="bb-sticker-item" data-sticker-id="${esc(s.id)}" title="${esc(s.alt || s.id)}"><img src="${esc(s.url)}" alt="${esc(s.alt || s.id)}" /></div>`).join('');
    } else {
      html = '<div class="bb-empty bb-p-md">此表情包为空</div>';
    }
    $('#bb-sticker-grid-content').html(html);
  });
  $picker.on('click', '.bb-sticker-item', function () {
    const stickerId = $(this).data('sticker-id');
    const $input = $(`#${targetInputId}`);
    $input.val($input.val() + `[sticker:${stickerId}]`);
    $picker.remove();
  });
  setTimeout(() => {
    $(document).one('click', function (e) {
      if (!$(e.target).closest('#bb-sticker-picker').length) { $('#bb-sticker-picker').remove(); }
    });
  }, 100);
}

function showStickerManager() {
  $('#bb-sticker-picker, #bb-ooc-sticker-panel').addClass('bb-hidden');
  const modal = $(`
    <div class="bb-modal-overlay">
      <div class="bb-modal-content bb-modal-lg">
        <h3 class="bb-modal-title">😀 表情包管理</h3>
        <div class="bb-section">
          <h4 class="bb-section-subtitle">添加表情包</h4>
          <div class="bb-form-col">
            <input id="bb-sticker-url" type="text" class="bb-input" placeholder="表情包图片URL" />
            <input id="bb-sticker-alt" type="text" class="bb-input" placeholder="表情包名称/描述" />
            <div class="bb-btn-row">
              <button class="bb-sm-btn" id="bb-btn-add-sticker">➕ 添加</button>
              <button class="bb-sm-btn" id="bb-btn-add-sticker-file">📁 上传文件</button>
            </div>
            <input type="file" id="bb-sticker-file-input" accept="image/*" class="bb-hidden" />
          </div>
        </div>
        <div class="bb-section">
          <h4 class="bb-section-subtitle">批量导入（JSON）</h4>
          <textarea id="bb-sticker-batch" class="bb-textarea bb-text-xs" rows="3" placeholder='[{"url":"https://...","alt":"开心"},...]'></textarea>
          <button class="bb-sm-btn bb-w-full bb-mt-xs" id="bb-btn-batch-sticker">📥 批量导入</button>
        </div>
        <div class="bb-section">
          <h4 class="bb-section-subtitle">当前表情包</h4>
          <div id="bb-sticker-manager-list" class="bb-sticker-manager-grid"></div>
        </div><button class="bb-sm-btn bb-w-full bb-btn-secondary" id="bb-sticker-manager-close">关闭</button>
      </div>
    </div>
  `);
  $('body').append(modal);
  refreshStickerManagerList();
  modal.find('#bb-btn-add-sticker').on('click', function () {
    const url = $('#bb-sticker-url').val().trim();
    const alt = $('#bb-sticker-alt').val().trim();
    if (!url) { toastr.warning('请输入表情包URL'); return; }
    addSticker(url, alt ||'sticker');
    $('#bb-sticker-url').val(''); $('#bb-sticker-alt').val('');
    refreshStickerManagerList();
  });
  modal.find('#bb-btn-add-sticker-file').on('click', () => $('#bb-sticker-file-input').click());
  modal.find('#bb-sticker-file-input').on('change', function () {
    const file = this.files[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toastr.error('表情包文件不能超过2MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => { addSticker(e.target.result, file.name.replace(/\.[^.]+$/, '')); refreshStickerManagerList(); toastr.success('表情包已添加'); };
    reader.readAsDataURL(file);
  });
  modal.find('#bb-btn-batch-sticker').on('click', function () {
    try {
      const arr = JSON.parse($('#bb-sticker-batch').val());
      if (!Array.isArray(arr)) throw new Error('格式错误');
      arr.forEach((item) => { if (item.url) addSticker(item.url, item.alt || 'sticker'); });
      refreshStickerManagerList(); $('#bb-sticker-batch').val('');
      toastr.success(`已导入 ${arr.length} 个表情包`);
    } catch (e) { toastr.error('JSON格式错误，请检查'); }
  });
  modal.find('#bb-sticker-manager-close').on('click', () => modal.remove());
  modal.on('click', function (e) { if ($(e.target).hasClass('bb-modal-overlay')) modal.remove(); });
}

function addSticker(url, alt) {
  const pack = pluginData.sticker_packs[0];
  const id = 'stk_' + generateId();
  pack.stickers.push({ id, url, alt });
  saveChatData();
}

function removeSticker(stickerId) {
  pluginData.sticker_packs.forEach((pack) => { pack.stickers = pack.stickers.filter((s) => s.id !== stickerId); });
  saveChatData();
}

function refreshStickerManagerList() {
  const $list = $('#bb-sticker-manager-list'); $list.empty();
  const allStickers = [];
  pluginData.sticker_packs.forEach((pack) => { pack.stickers.forEach((s) => allStickers.push(s)); });
  if (allStickers.length === 0) { $list.html('<div class="bb-empty bb-w-full bb-p-md">暂无表情包</div>'); return; }
  allStickers.forEach((s) => {
    $list.append(`
      <div class="bb-sticker-manage-item" data-sticker-id="${esc(s.id)}">
        <img src="${esc(s.url)}" alt="${esc(s.alt)}" class="bb-sticker-manage-img" />
        <div class="bb-sticker-manage-name">${esc(s.alt || s.id)}</div>
        <span class="bb-sticker-del" data-sticker-id="${esc(s.id)}" title="删除">✖</span>
      </div>`);
  });
  $list.find('.bb-sticker-del').on('click', function (e) {
    e.stopPropagation();
    removeSticker($(this).data('sticker-id'));
    refreshStickerManagerList();
    toastr.info('已删除表情包');
  });
}

function getStickerListForPrompt() {
  const allStickers = [];
  pluginData.sticker_packs.forEach((pack) => { pack.stickers.forEach((s) => allStickers.push(s)); });
  if (allStickers.length === 0) return '';
  return '\n\n可用表情包列表（你可以在回复中用[sticker:id] 来发送表情包）：\n' + allStickers.map((s) => `[sticker:${s.id}] - ${s.alt || '表情'}`).join('\n');
}

//═══════════════ 区块L结束 ═══════════════
//═══════════════════════════════════════════
// 【区块 M】 世界频段
// ═══════════════════════════════════════════

function renderWorldFeed() {
  const list = $('#bb-world-feed-list'); list.empty();
  if (pluginData.world_feed.length === 0) {
    list.html('<div class="bb-empty">暂无世界频段消息</div>');
    return;
  }
  pluginData.world_feed.forEach((f, idx) => {
    const icon = f.type === 'gossip' ? '💬' : f.type === 'news' ? '📰' : '✨';
    list.append(`
      <div class="bb-record-item">
        <div class="bb-feed-item-header">
          <span class="bb-text-primary">${icon} ${f.timestamp}</span>
          <span class="bb-feed-del bb-clickable" data-idx="${idx}" title="删除">🗑️</span>
        </div>
        <div class="bb-feed-item-body">${esc(f.content)}</div>
      </div>`);
  });
  list.find('.bb-feed-del').on('click', function () {
    const idx = $(this).data('idx');
    pluginData.world_feed.splice(idx, 1);
    saveChatData(); renderWorldFeed(); updateMarquee();
    toastr.info('已删除消息');
  });
}

async function generateWorldFeed() {
  toastr.info('📻 生成世界频段消息中...');
  const recent = getRecentChat(25); const preset = getActivePreset();
  const result = await callSubAPI([
    { role: 'system', content: `${preset.prompts.world}\n当前场景背景请根据对话推断。` },
    { role: 'user', content: recent.length > 0 ? fmt(recent) : '（新的世界刚刚展开）' }
  ], 300);
  if (result) {
    const messages = result.split('\n').filter(line => line.trim());
    messages.forEach(msg => {
      const type = msg.includes('八卦') || msg.includes('传闻') ? 'gossip'
        : msg.includes('新闻') || msg.includes('突发') ? 'news' : 'lore';
      pluginData.world_feed.push({
        type,
        content: msg.replace(/^[🌍📰💬✨\-\*\d\.]+\s*/, ''),
        timestamp: new Date().toLocaleString('zh-CN')
      });
    });
    saveChatData(); renderWorldFeed(); updateMarquee();
    toastr.success(`📻 已生成 ${messages.length} 条消息`);
    bbNotify('world', '世界频段更新', `生成了 ${messages.length} 条消息`);
    playNotificationSound('success');

  }
}

function startWorldFeed() {
  updateMarquee();
  setInterval(() => updateMarquee(), 30000);
}

function updateMarquee() {
  const marquee = $('#bb-marquee');
  if (pluginData.world_feed.length === 0) {
    marquee.text('🌍 世界频段广播中...暂无消息');
    return;
  }
  const samples = pluginData.world_feed.slice(-10).sort(() => Math.random() - 0.5).slice(0, 3);
  const text = samples.map(f => {
    const icon = f.type === 'gossip' ? '💬' : f.type === 'news' ? '📰' : '✨';
    return `${icon} ${f.content}`;
  }).join(' | ');
  marquee.text(text || '🌍 世界频段广播中...');
}

// ═══════════════ 区块 M 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 N】 成就 & 画廊 & 情侣空间
// ═══════════════════════════════════════════

//── 成就系统 ──

const ALL_ACHIEVEMENTS = [
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

function renderAchievements() {
  const list = $('#bb-ach-list'); list.empty();
  let unlockedCount = 0;
  ALL_ACHIEVEMENTS.forEach(ach => {
    const unlocked = ach.check();
    const saved = pluginData.achievements.find(a => a.id === ach.id);
    if (unlocked) unlockedCount++;
    list.append(`
      <div class="bb-ach-card ${unlocked ? 'bb-ach-unlocked' : 'bb-ach-locked'}">
        <div class="bb-ach-row">
          <div class="bb-ach-icon">${unlocked ? ach.icon : '🔒'}</div>
          <div class="bb-ach-info">
            <div class="bb-ach-name ${unlocked ? 'bb-text-primary' : 'bb-text-dim'}">${ach.name}</div>
            <div class="bb-ach-desc">${ach.desc}</div>${saved ? `<div class="bb-ach-date">解锁于: ${saved.date}</div>` : ''}
          </div>
        </div>
      </div>`);
  });
  $('#bb-ach-count').text(unlockedCount);
  $('#bb-ach-total').text(ALL_ACHIEVEMENTS.length);
}

function checkAchievements() {
  ALL_ACHIEVEMENTS.forEach(ach => {
    if (ach.check()) {
      const alreadyUnlocked = pluginData.achievements.some(a => a.id === ach.id);
      if (!alreadyUnlocked) { unlockAchievement(ach); }
    }
  });renderAchievements();
}

function unlockAchievement(ach) {
  pluginData.achievements.push({ id: ach.id, unlocked: true, date: new Date().toLocaleString('zh-CN') });
  saveChatData(); showAchievementPopup(ach);
  toastr.success(`🏆 解锁成就：${ach.name}`, '', { timeOut: 5000 });
  bbNotify('achievement', `解锁成就：${ach.name}`, ach.desc);
  playNotificationSound('success');

}

function showAchievementPopup(ach) {
  const popup = $(`
    <div class="bb-achievement-popup">
      <div class="bb-ach-popup-icon">${ach.icon}</div>
      <div class="bb-ach-popup-title">🏆 成就解锁</div>
      <div class="bb-ach-popup-name">${ach.name}</div>
      <div class="bb-ach-popup-desc">${ach.desc}</div></div>`);
  $('body').append(popup);
  setTimeout(() => popup.addClass('bb-ach-popup-show'), 50);
  setTimeout(() => { popup.removeClass('bb-ach-popup-show'); setTimeout(() => popup.remove(), 300); }, 3000);
}

// ── 画廊──

function renderGallery() {
  const $grid = $('#bb-gallery-grid'); const $empty = $('#bb-gallery-empty');
  $grid.empty();
  if (pluginData.gallery.length === 0) { $empty.show(); return; }
  $empty.hide();
  pluginData.gallery.forEach((item, idx) => {
    $grid.append(`
      <div class="bb-gallery-item">
        <img src="${esc(item.url)}" alt="${esc(item.prompt || '')}" loading="lazy" />
        <div class="bb-gallery-caption">${esc(item.source || '')} · ${item.timestamp}</div>
        <div class="bb-gallery-actions">
          <span class="bb-gallery-reroll bb-clickable" data-idx="${idx}" title="重新生成">🔄</span>
          <span class="bb-gallery-del bb-clickable" data-idx="${idx}" title="删除">🗑️</span>
        </div>
      </div>`);
  });
  $grid.find('.bb-gallery-del').on('click', function () {
    const idx = $(this).data('idx');
    if (!confirm('确认删除这张图片?')) return;
    pluginData.gallery.splice(idx, 1); saveChatData(); renderGallery();
    toastr.info('已删除图片');
  });
  $grid.find('.bb-gallery-reroll').on('click', async function () {
    const idx = $(this).data('idx');
    const item = pluginData.gallery[idx];
    if (!item || !item.prompt) { toastr.warning('无法重新生成：缺少提示词'); return; }
    toastr.info('🔄 重新生成中...');
    const newUrl = await callImgAPI(item.prompt);
    if (newUrl) {
      pluginData.gallery[idx].url = newUrl;
      pluginData.gallery[idx].timestamp = new Date().toLocaleString('zh-CN');
      saveChatData(); renderGallery(); toastr.success('🖼️ 已重新生成');
    }
  });
}

// ── 情侣空间 ──

function buildCoupleSpaceHTML() {
  return `
    <div class="bb-couple-container">
      <div class="bb-couple-tabs">
        <div class="bb-couple-tab active" data-ctab="messages">💌 留言板</div>
        <div class="bb-couple-tab" data-ctab="letters">💝 情书</div>
        <div class="bb-couple-tab" data-ctab="anniversaries">📅 纪念日</div>
        <div class="bb-couple-tab" data-ctab="photos">📸 照片墙</div>
      </div>

      <div id="bb-couple-messages" class="bb-couple-panel active">
        <div class="bb-action-bar bb-action-wrap">
          <button class="bb-sm-btn" id="bb-btn-couple-msg">✏️ 写留言</button>
          <button class="bb-sm-btn" id="bb-btn-couple-ai-msg">🤖 让TA留言</button>
        </div>
        <div id="bb-couple-msg-list" class="bb-couple-list"><div class="bb-empty">还没有留言哦~<br/>写下第一条留言吧 💕</div>
        </div>
      </div>

      <div id="bb-couple-letters" class="bb-couple-panel bb-hidden">
        <div class="bb-action-bar bb-action-wrap">
          <button class="bb-sm-btn" id="bb-btn-write-letter">✏️ 写情书</button>
          <button class="bb-sm-btn" id="bb-btn-ai-letter">🤖 让TA写情书</button>
        </div>
        <div id="bb-couple-letter-list" class="bb-couple-list">
          <div class="bb-empty">还没有情书~<br/>写下你的心意吧 💝</div>
        </div>
      </div>

      <div id="bb-couple-anniversaries" class="bb-couple-panel bb-hidden">
        <div class="bb-action-bar">
          <button class="bb-sm-btn" id="bb-btn-add-anniversary">➕ 添加纪念日</button>
        </div>
        <div id="bb-couple-anni-list" class="bb-couple-list">
          <div class="bb-empty">还没有纪念日~<br/>记录你们的重要时刻吧 📅</div>
        </div>
      </div>

      <div id="bb-couple-photos" class="bb-couple-panel bb-hidden">
        <div class="bb-action-bar bb-action-wrap">
          <button class="bb-sm-btn" id="bb-btn-couple-upload-photo">📷 上传照片</button>
          <button class="bb-sm-btn" id="bb-btn-couple-gen-photo">🎨 AI生成照片</button>
        </div>
        <div id="bb-couple-photo-grid" class="bb-gallery-grid">
          <div class="bb-empty">还没有照片~<br/>上传或生成你们的回忆吧 📸</div>
        </div>
      </div>
    </div>
  `;
}

function bindCoupleSpaceEvents() {
  $(document).off('click.bbcouplemsg').on('click.bbcouplemsg', '#bb-btn-couple-msg', function () {
    const msg = prompt('写下你的留言:');
    if (!msg) return;
    pluginData.couple_space.messages.push({ from: 'user', content: msg, timestamp: new Date().toLocaleString('zh-CN') });
    saveChatData(); renderCoupleMessages(); toastr.success('💌 留言已发送');
  });

  $(document).off('click.bbcoupleaimsg').on('click.bbcoupleaimsg', '#bb-btn-couple-ai-msg', async function () {
    const ctx = getContext();
    toastr.info(`💌 ${ctx.name2|| '角色'}正在写留言...`);
    const result = await callSubAPI([{ role: 'system', content: `你是"${ctx.name2 || '角色'}"，给"${ctx.name1 || '用户'}"的情侣空间留言板写一条温暖的短消息（30-80字）。可以分享日常、表达思念、或者说些甜蜜的话。` }], 200);
    if (result) {
      pluginData.couple_space.messages.push({ from: 'char', content: result, timestamp: new Date().toLocaleString('zh-CN'), isAuto: true });
      saveChatData(); renderCoupleMessages(); toastr.success(`💌 ${ctx.name2 || '角色'}留言了！`);
    }
  });

  $(document).off('click.bbwriteletter').on('click.bbwriteletter', '#bb-btn-write-letter', function () { showLetterEditor('user'); });

  $(document).off('click.bbailetter').on('click.bbailetter', '#bb-btn-ai-letter', async function () {
    const ctx = getContext();
    toastr.info(`💝 ${ctx.name2 || '角色'}正在写情书...`);
    const result = await callSubAPI([{ role: 'system', content: `你是"${ctx.name2 || '角色'}"，给"${ctx.name1 || '用户'}"写一封真挚的情书（100-300字）。用角色的语气和性格来写，要有真情实感。` }], 600);
    if (result) {
      pluginData.couple_space.love_letters.push({ id: generateId(), from: 'char', to: 'user', content: result, timestamp: new Date().toLocaleString('zh-CN'), reply: '' });
      saveChatData(); renderCoupleLetters(); toastr.success(`💝 收到${ctx.name2 || '角色'}的情书！`);
    }
  });

  $(document).off('click.bbaddanni').on('click.bbaddanni', '#bb-btn-add-anniversary', function () {
    const name = prompt('纪念日名称（如：认识纪念日）:');
    if (!name) return;
    const date = prompt('日期（格式：2026-01-15）:');
    if (!date) return;
    pluginData.couple_space.anniversaries.push({ id: generateId(), name, date });
    saveChatData(); renderCoupleAnniversaries(); toastr.success(`📅 已添加纪念日: ${name}`);
  });

  $(document).off('click.bbcouplephoto').on('click.bbcouplephoto', '#bb-btn-couple-upload-photo', function () {
    const modal = $(`
      <div class="bb-modal-overlay">
        <div class="bb-modal-content">
          <h3 class="bb-modal-title">📷 上传照片</h3>
          <div class="bb-form-col">
            <input id="bb-couple-photo-url" type="text" class="bb-input" placeholder="输入图片URL..." />
            <input id="bb-couple-photo-caption" type="text" class="bb-input" placeholder="照片说明（可选）" />
            <button class="bb-big-btn bb-w-full" id="bb-couple-photo-url-ok">🔗 通过URL添加</button>
            <button class="bb-big-btn bb-w-full" id="bb-couple-photo-file-btn">📁 上传文件</button>
            <input type="file" id="bb-couple-photo-file" accept="image/*" class="bb-hidden" />
            <button class="bb-sm-btn bb-w-full bb-btn-secondary" id="bb-couple-photo-cancel">取消</button>
          </div>
        </div>
      </div>`);
    $('body').append(modal);
    modal.find('#bb-couple-photo-url-ok').on('click', function () {
      const url = $('#bb-couple-photo-url').val().trim();
      if (!url) { toastr.warning('请输入URL'); return; }
      const caption = $('#bb-couple-photo-caption').val().trim();
      pluginData.couple_space.photo_wall.push({ id: generateId(), url, caption: caption || '', timestamp: new Date().toLocaleString('zh-CN') });
      saveChatData(); renderCouplePhotos(); modal.remove(); toastr.success('📷 照片已添加');
    });
    modal.find('#bb-couple-photo-file-btn').on('click', () => $('#bb-couple-photo-file').click());
    modal.find('#bb-couple-photo-file').on('change', function () {
      const file = this.files[0]; if (!file) return;
      if (file.size > 5 * 1024 * 1024) { toastr.error('文件过大，请选择小于5MB的图片'); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const caption = $('#bb-couple-photo-caption').val().trim();
        pluginData.couple_space.photo_wall.push({ id: generateId(), url: e.target.result, caption: caption || file.name, timestamp: new Date().toLocaleString('zh-CN') });
        saveChatData(); renderCouplePhotos(); modal.remove(); toastr.success('📷 照片已上传');
      };
      reader.readAsDataURL(file);
    });
    modal.find('#bb-couple-photo-cancel').on('click', () => modal.remove());
    modal.on('click', function (e) { if ($(e.target).hasClass('bb-modal-overlay')) modal.remove(); });
  });

  $(document).off('click.bbcouplegenphoto').on('click.bbcouplegenphoto', '#bb-btn-couple-gen-photo', async function () {
    const ctx = getContext();
    const p = prompt('描述你想生成的照片:', `${ctx.name1 || '用户'}和${ctx.name2 || '角色'}的温馨合照`);
    if (!p) return;
    const entry = await generateAndSaveImage(p,'couple');
    if (entry) {
      pluginData.couple_space.photo_wall.push({ id: generateId(), url: entry.url, caption: p, timestamp: new Date().toLocaleString('zh-CN') });
      saveChatData(); renderCouplePhotos();}
  });
}

function showLetterEditor(from) {
  const modal = $(`
    <div class="bb-modal-overlay">
      <div class="bb-modal-content bb-modal-md">
        <h3 class="bb-modal-title">💝 写情书</h3>
        <textarea id="bb-letter-content" class="bb-textarea" rows="8" placeholder="写下你的心意..."></textarea>
        <div class="bb-btn-row bb-mt-md">
          <button class="bb-big-btn bb-flex-1" id="bb-letter-send">💌 发送</button>
          <button class="bb-sm-btn bb-flex-1 bb-btn-secondary" id="bb-letter-cancel">取消</button>
        </div>
      </div>
    </div>`);
  $('body').append(modal);
  modal.find('#bb-letter-send').on('click', function () {
    const content = $('#bb-letter-content').val().trim();
    if (!content) { toastr.warning('请写些什么吧~'); return; }
    pluginData.couple_space.love_letters.push({ id: generateId(), from: from, to: from === 'user' ? 'char' : 'user', content, timestamp: new Date().toLocaleString('zh-CN'), reply: '' });
    saveChatData(); renderCoupleLetters(); modal.remove(); toastr.success('💝 情书已发送');
  });
  modal.find('#bb-letter-cancel').on('click', () => modal.remove());
  modal.on('click', function (e) { if ($(e.target).hasClass('bb-modal-overlay')) modal.remove(); });
}

function renderCoupleMessages() {
  const $list = $('#bb-couple-msg-list'); $list.empty();
  const msgs = pluginData.couple_space.messages || [];
  if (msgs.length === 0) { $list.html('<div class="bb-empty">还没有留言哦~<br/>写下第一条留言吧 💕</div>'); return; }
  const ctx = getContext();
  msgs.forEach((m, idx) => {
    const isUser = m.from === 'user';
    const name = isUser ? (ctx.name1 || '用户') : (ctx.name2 || '角色');
    $list.append(`
      <div class="bb-ooc-msg ${isUser ? 'bb-msg-user' : 'bb-msg-ai'}">
        <div class="bb-ooc-msg-avatar">${isUser ? '👤' : '🎭'}</div>
        <div>
          <div class="bb-ooc-msg-name">${esc(name)} · ${m.timestamp}</div>
          <div class="bb-ooc-msg-bubble">${renderSafeHTML(m.content)}</div>
          <div class="bb-ooc-msg-actions">
            <span class="bb-couple-msg-del bb-clickable" data-idx="${idx}">🗑️</span>
          </div>
        </div>
      </div>`);
  });
  $list.find('.bb-couple-msg-del').on('click', function () {
    const idx = $(this).data('idx');
    pluginData.couple_space.messages.splice(idx, 1);
    saveChatData(); renderCoupleMessages();
  });
}

function renderCoupleLetters() {
  const $list = $('#bb-couple-letter-list'); $list.empty();
  const letters = pluginData.couple_space.love_letters || [];
  if (letters.length === 0) { $list.html('<div class="bb-empty">还没有情书~<br/>写下你的心意吧 💝</div>'); return; }
  const ctx = getContext();
  letters.forEach((letter, idx) => {
    const fromName = letter.from === 'user' ? (ctx.name1 || '用户') : (ctx.name2 || '角色');
    const toName = letter.to === 'user' ? (ctx.name1 || '用户') : (ctx.name2 || '角色');
    $list.append(`
      <div class="bb-letter-card">
        <div class="bb-letter-header">
          <span class="bb-text-primary bb-text-bold">💝 来自 ${esc(fromName)} → ${esc(toName)}</span>
          <span class="bb-letter-meta"><span class="bb-text-muted bb-text-xs">${letter.timestamp}</span>
            <span class="bb-letter-del bb-clickable" data-idx="${idx}">🗑️</span>
          </span>
        </div>
        <div class="bb-letter-body">${renderSafeHTML(letter.content)}</div>
        ${letter.reply
          ? `<div class="bb-letter-reply"><div class="bb-text-primary bb-text-xs bb-mb-xs">💌 回信:</div><div>${renderSafeHTML(letter.reply)}</div></div>`
          : `<div class="bb-letter-reply-actions"><button class="bb-sm-btn bb-letter-reply-btn" data-idx="${idx}">✏️ 回信</button>
              <button class="bb-sm-btn bb-letter-ai-reply-btn" data-idx="${idx}">🤖 让TA回信</button>
            </div>`
        }
      </div>`);
  });
  $list.find('.bb-letter-del').on('click', function () {
    const idx = $(this).data('idx');
    if (!confirm('确认删除这封情书?')) return;
    pluginData.couple_space.love_letters.splice(idx, 1);
    saveChatData(); renderCoupleLetters();
  });
  $list.find('.bb-letter-reply-btn').on('click', function () {
    const idx = $(this).data('idx');
    const reply = prompt('写下你的回信:');
    if (!reply) return;
    pluginData.couple_space.love_letters[idx].reply = reply;
    saveChatData(); renderCoupleLetters(); toastr.success('💌 回信已发送');
  });
  $list.find('.bb-letter-ai-reply-btn').on('click', async function () {
    const idx = $(this).data('idx');
    const letter = pluginData.couple_space.love_letters[idx];
    const ctx = getContext();
    const replyFrom = letter.to === 'user' ? ctx.name1 : ctx.name2;
    toastr.info(`💌 ${replyFrom || '对方'}正在回信...`);
    const result = await callSubAPI([{ role: 'system', content: `你是"${replyFrom || '角色'}"，收到了一封情书，请写一封真挚的回信（80-200字）。\n\n收到的情书内容：\n${letter.content}` }], 400);
    if (result) {
      pluginData.couple_space.love_letters[idx].reply = result;
      saveChatData(); renderCoupleLetters();
      toastr.success(`💌 ${replyFrom || '对方'}回信了！`);
    }
  });
}

function renderCoupleAnniversaries() {
  const $list = $('#bb-couple-anni-list'); $list.empty();
  const annis = pluginData.couple_space.anniversaries || [];
  if (annis.length === 0) { $list.html('<div class="bb-empty">还没有纪念日~<br/>记录你们的重要时刻吧 📅</div>'); return; }
  annis.forEach((a, idx) => {
    const daysAgo = Math.floor((Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24));
    const daysText = daysAgo >= 0 ? `已经${daysAgo} 天` : `还有${Math.abs(daysAgo)} 天`;
    $list.append(`
      <div class="bb-anni-card">
        <div class="bb-anni-row">
          <div>
            <div class="bb-anni-name">📅 ${esc(a.name)}</div>
            <div class="bb-anni-date">${a.date} · ${daysText}</div>
          </div>
          <span class="bb-anni-del bb-clickable" data-idx="${idx}">🗑️</span>
        </div></div>`);
  });
  $list.find('.bb-anni-del').on('click', function () {
    const idx = $(this).data('idx');
    pluginData.couple_space.anniversaries.splice(idx, 1);
    saveChatData(); renderCoupleAnniversaries();
  });
}

function renderCouplePhotos() {
  const $grid = $('#bb-couple-photo-grid'); $grid.empty();
  const photos = pluginData.couple_space.photo_wall || [];
  if (photos.length === 0) { $grid.html('<div class="bb-empty">还没有照片~<br/>上传或生成你们的回忆吧 📸</div>'); return; }
  photos.forEach((p, idx) => {
    $grid.append(`
      <div class="bb-gallery-item">
        <img src="${esc(p.url)}" alt="${esc(p.caption)}" loading="lazy" />
        <div class="bb-gallery-caption">${esc(p.caption || '')}</div>
        <div class="bb-gallery-actions">
          <span class="bb-couple-photo-del bb-clickable" data-idx="${idx}">🗑️</span>
        </div>
      </div>`);
  });
  $grid.find('.bb-couple-photo-del').on('click', function () {
    const idx = $(this).data('idx');
    if (!confirm('确认删除这张照片?')) return;
    pluginData.couple_space.photo_wall.splice(idx, 1);
    saveChatData(); renderCouplePhotos();
  });
}
// ── 错误日志渲染 ──

function renderErrorLog() {
  const $list = $('#bb-error-list');
  if ($list.length === 0) return;
  $list.empty();
  
  if (bbErrorLog.length === 0) {
    $list.html('<div class="bb-empty">暂无错误 ✅<br/>一切运行正常</div>');
    $('#bb-error-count-label').text('共 0 条');
    return;
  }
  
  $('#bb-error-count-label').text(`共 ${bbErrorLog.length} 条`);
  
  bbErrorLog.forEach((err, idx) => {
    const detailHtml = err.detail ? `<div class="bb-text-xs bb-text-muted" style="margin-top:4px;word-break:break-all;">${esc(err.detail.substring(0, 300))}</div>` : '';
    $list.append(`
      <div class="bb-record-item" style="border-left:3px solid var(--bb-accent,#f0a8c8);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="bb-text-xs bb-text-dim">⚠️ [${esc(err.source)}] ${err.timestamp}</span>
          <span class="bb-error-del bb-clickable bb-text-xs" data-idx="${idx}" title="删除">✖</span>
        </div><div class="bb-text-sm" style="margin-top:4px;color:var(--bb-accent,#f0a8c8);">${esc(err.message)}</div>
        ${detailHtml}
      </div>
    `);
  });
  
  $list.find('.bb-error-del').on('click', function() {
    const idx = $(this).data('idx');
    bbErrorLog.splice(idx, 1);
    renderErrorLog();
    updateErrorBadge();
  });
}

// ── 通知栏渲染 ──

function renderNotifications() {
  const $list = $('#bb-notif-list');
  if ($list.length === 0) return;
  $list.empty();
  
  if (bbNotifications.length === 0) {
    $list.html('<div class="bb-empty">暂无通知 🔔<br/>新内容生成时会在这里提醒你</div>');
    $('#bb-notif-count-label').text('共 0 条');
    return;
  }
  
  const unread = bbNotifications.filter(n => !n.read).length;
  $('#bb-notif-count-label').text(`共 ${bbNotifications.length} 条 · ${unread} 条未读`);
  
  const typeIcons = {
    diary: '📖', vibe: '❤️', weather: '☁️', fate: '🎲',
    ooc: '💬', achievement: '🏆', world: '📻', system: '⚙️',npc: '🧑‍🤝‍🧑', parallel: '🦋', couple: '💕', gallery: '🖼️',
    summary: '📜', scrapbook: '🌟',
  };
  
  bbNotifications.forEach((notif, idx) => {
    const icon = typeIcons[notif.type] || '🔔';
    const unreadClass = notif.read ? '' : 'bb-notif-unread';
    $list.append(`
      <div class="bb-record-item ${unreadClass}" data-notif-idx="${idx}" style="${notif.read ? '' : 'border-left:3px solid var(--bb-primary,#c9a0dc);background:rgba(201,160,220,0.05);'}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="bb-text-sm">${icon} <strong>${esc(notif.title)}</strong></span>
          <span class="bb-text-xs bb-text-dim">${notif.timestamp}</span>
        </div>
        ${notif.content ? `<div class="bb-text-xs bb-text-muted" style="margin-top:4px;">${esc(notif.content.substring(0, 150))}</div>` : ''}<div style="display:flex;justify-content:flex-end;gap:6px;margin-top:4px;">
          ${!notif.read ? `<span class="bb-notif-read bb-clickable bb-text-xs" data-idx="${idx}">标为已读</span>` : ''}
          <span class="bb-notif-del bb-clickable bb-text-xs" data-idx="${idx}" title="删除">✖</span>
        </div>
      </div>
    `);
  });
  
  $list.find('.bb-notif-read').on('click', function() {
    const idx = $(this).data('idx');
    bbNotifications[idx].read = true;
    renderNotifications();
    updateNotificationBadge();
  });
  
  $list.find('.bb-notif-del').on('click', function() {
    const idx = $(this).data('idx');
    bbNotifications.splice(idx, 1);
    renderNotifications();
    updateNotificationBadge();
  });
}

//═══════════════ 区块 N 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 O】 生图API & 设置 & 初始化入口
// ═══════════════════════════════════════════

//── API调用 ──

async function fetchModelList() {
  const s = getSettings();
  const base = s.api_base?.replace(/\/+$/, '');
  const key = s.api_key;
  if (!base || !key) {
    toastr.warning('请先填写 API 地址和 Key');
    return;
  }

  $('#bb-api-status').html('<span class="bb-text-warning">⏳ 正在获取模型列表...</span>');
  $('#bb-fetch-models').prop('disabled', true);

  try {
    //尝试多种常见的模型列表端点
    let models = [];
    const urls = [];

    if (base.includes('/v1')) {
      urls.push(`${base}/models`);
    } else {
      urls.push(`${base}/v1/models`);urls.push(`${base}/models`);
    }

    let lastError = null;
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok) {
          lastError = new Error(`${res.status} ${res.statusText}`);
          continue;
        }
        const json = await res.json();

        //兼容多种API返回格式
        if (json.data && Array.isArray(json.data)) {
          models = json.data;
        } else if (json.models && Array.isArray(json.models)) {
          models = json.models;
        } else if (Array.isArray(json)) {
          models = json;
        }

        if (models.length > 0) break;
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    if (models.length === 0) {
      throw lastError || new Error('未找到可用模型');
    }

    // 提取模型ID并排序
    const modelIds = models
      .map(m => (typeof m === 'string' ? m : m.id || m.name || ''))
      .filter(Boolean)
      .sort((a, b) => {
        // 常用模型排在前面
        const priority = ['gpt-4', 'gpt-3.5', 'claude', 'gemini', 'deepseek', 'qwen', 'glm'];
        const aP = priority.findIndex(p => a.toLowerCase().includes(p));
        const bP = priority.findIndex(p => b.toLowerCase().includes(p));
        if (aP !== -1 && bP === -1) return -1;
        if (aP === -1 && bP !== -1) return 1;
        if (aP !== -1 && bP !== -1) return aP - bP;
        return a.localeCompare(b);
      });

    // 填充下拉框
    const $sel = $('#bb-api-model');
    $sel.empty();
    $sel.append('<option value="" disabled>— 选择模型 —</option>');

    modelIds.forEach(id => {
      $sel.append(`<option value="${id}">${id}</option>`);
    });

    // 如果之前有保存的模型且在列表中，恢复选择
    if (s.api_model && modelIds.includes(s.api_model)) {
      $sel.val(s.api_model);
    } else {
      // 否则选第一个
      s.api_model = modelIds[0];
      $sel.val(modelIds[0]);
      saveSettings();
    }

    // 保存模型列表到设置中（方便下次恢复）
    s.available_models = modelIds;
    saveSettings();

    $('#bb-api-status').html(
      `<span class="bb-text-success">✅ 连接成功！获取到 ${modelIds.length} 个模型</span>`
    );
    toastr.success(`🔗 已连接，获取到 ${modelIds.length} 个模型，当前: ${s.api_model}`);

  } catch (err) {
    $('#bb-api-status').html(
      `<span class="bb-text-error">❌ 获取模型失败: ${err.message}</span>`
    );
    toastr.error(`获取模型失败: ${err.message}`);
  } finally {
    $('#bb-fetch-models').prop('disabled', false);
  }
}

// 保留旧函数名兼容
async function testAPIConnection() {
  await fetchModelList();
}
async function callSubAPI(messages, maxTokens = 500, temperature = 0.85) {
  const s = getSettings();
  const base = s.api_base.replace(/\/+$/, '');
  const key = s.api_key;
  const model = s.api_model;
  if (!base || !key || !model) { toastr.error('请先配置并测试副API'); return null; }
  const preset = getActivePreset();
  if (preset.global) {
    messages = [{ role: 'system', content: preset.global }, ...messages];
  }

  // 记忆琥珀：对非事实提取/冲突解决类请求，自动注入事实上下文到第一条system消息
  const isAmberInternalCall = messages.some(m =>
    m.content && (
      m.content.includes('提取关键事实') ||
      m.content.includes('事实存在冲突') ||
      m.content.includes('记忆分析助手') ||
      m.content.includes('逻辑分析助手')
    )
  );
  if (!isAmberInternalCall && typeof injectAmberContext === 'function') {
    const sysMsg = messages.find(m => m.role === 'system');
    if (sysMsg) {
      sysMsg.content = injectAmberContext(sysMsg.content);
    }
  }

  try {
    const url = base.includes('/v1') ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json();
    let content = json.choices?.[0]?.message?.content || '';

    // 屏蔽词处理（防御性：确保blacklist是数组）
    let blacklist = preset.blacklist || [];
    if (typeof blacklist === 'string') {
      blacklist = blacklist.split(',').map(w => w.trim()).filter(Boolean);
    }
    if (Array.isArray(blacklist) && blacklist.length > 0) {
      blacklist.forEach((word) => {
        if (word) {
          const reg = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          content = content.replace(reg, '***');
        }
      });
    }

    return content.trim();
  } catch (err) {
    if (typeof bbLogError === 'function') {
      bbLogError('API调用', `${err.message}`, `模型: ${model}, URL: ${base}`);
    }
    if (typeof playNotificationSound === 'function') {
      playNotificationSound('error');
    }
    toastr.error(`API 调用失败: ${err.message}`);
    return null;
  }
}

// ── 生图API ──

async function callImgAPI(prompt) {
  const s = getSettings();
  const provider = s.img_provider || 'placeholder';
  if (provider === 'placeholder') {
    const seed = encodeURIComponent(prompt).substring(0, 20) + Date.now();
    return `https://picsum.photos/seed/${seed}/512/768`;
  }
  const providerConfig = IMAGE_PROVIDERS[provider];
  if (!providerConfig) { toastr.error('未知的生图提供商'); return null; }
  const apiKey = s.img_api_key;
  const apiBase = s.img_api_base || providerConfig.endpoint;
  if (!apiKey && providerConfig.authType !== 'None') { toastr.error('请先配置生图 API Key'); return null; }
  try {
    if (provider === 'novelai') return await callNovelAI(apiBase, apiKey, prompt, s);
    else if (provider === 'stablediffusion') return await callStableDiffusion(apiBase, prompt, s);
  } catch (err) {
    console.error('[骨与血] 生图失败:', err);
    toastr.error(`生图失败: ${err.message}`);
    return null;
  }
}

async function callNovelAI(endpoint, apiKey, prompt, settings) {
  const fullPrompt = settings.img_artist_tags ? `${prompt}, ${settings.img_artist_tags}` : prompt;
  const payload = {
    input: fullPrompt, model: 'nai-diffusion-3', action: 'generate',
    parameters: { width: 512, height: 768, scale: 11, sampler: 'k_euler', steps: 28, n_samples: 1, ucPreset: 0, qualityToggle: true, negative_prompt: settings.img_negative_prompt || '' },
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`NovelAI: ${res.status} ${res.statusText}`);
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return `data:image/png;base64,${base64}`;
}

async function callStableDiffusion(endpoint, prompt, settings) {
  const fullPrompt = settings.img_artist_tags ? `${prompt}, ${settings.img_artist_tags}` : prompt;
  const payload = {
    prompt: fullPrompt, negative_prompt: settings.img_negative_prompt || '',
    steps: 20, width: 512, height: 768, cfg_scale: 7, sampler_name: 'Euler a', n_iter: 1, batch_size: 1,};
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`SD WebUI: ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.images && json.images[0]) return `data:image/png;base64,${json.images[0]}`;
  throw new Error('SD WebUI 未返回图片');
}

async function generateAndSaveImage(prompt, source = 'manual') {
  toastr.info('🎨 正在生成图片...');
  const imageUrl = await callImgAPI(prompt);
  if (!imageUrl) return null;
  const entry = {
    id: generateId(), url: imageUrl, prompt: prompt,
    source: source, timestamp: new Date().toLocaleString('zh-CN'),
  };
  pluginData.gallery.push(entry);
  saveChatData(); renderGallery();
  toastr.success('🖼️ 图片已生成并保存到画廊！');
  return entry;
}

// ── 海报系统 ──

function showPosterEditor() {
  if (pluginData.records_bone.length === 0) { toastr.warning('暂无收藏的语录'); return; }
  const s = getSettings();
  let recordOptions = pluginData.records_bone.map((r, i) => `<option value="${i}">${esc(r.character)}: ${esc(r.text.substring(0, 40))}...</option>`).join('');
  const modal = $(`
    <div class="bb-modal-overlay">
      <div class="bb-modal-content bb-modal-lg bb-modal-scroll">
        <h3 class="bb-modal-title">🖼️ 语录海报生成器</h3>
        <div class="bb-form-col">
          <label class="bb-label">选择语录:</label>
          <select id="bb-poster-record" class="bb-select">${recordOptions}</select>
          <label class="bb-label">背景图URL:</label>
          <input id="bb-poster-bg" type="text" class="bb-input" placeholder="输入背景图URL（留空使用默认）" value="${esc(s.poster_bg_url || '')}" />
          <div class="bb-btn-row bb-mt-xs">
            <button class="bb-sm-btn bb-btn-xs bb-poster-bg-preset" data-url="https://picsum.photos/seed/poster1/800/1200">🌄 风景</button>
            <button class="bb-sm-btn bb-btn-xs bb-poster-bg-preset" data-url="https://picsum.photos/seed/poster2/800/1200">🌃 城市</button>
            <button class="bb-sm-btn bb-btn-xs bb-poster-bg-preset" data-url="https://picsum.photos/seed/poster3/800/1200">🌸 花朵</button>
            <button class="bb-sm-btn bb-btn-xs bb-poster-bg-preset" data-url="https://picsum.photos/seed/poster4/800/1200">🌊 海洋</button>
          </div>
          <label class="bb-label">字体URL（可选）:</label>
          <input id="bb-poster-font-url" type="text" class="bb-input" placeholder="https://fonts.googleapis.com/css2?family=..." value="${esc(s.poster_font_url || '')}" />
          <label class="bb-label">字体名称:</label>
          <input id="bb-poster-font-name" type="text" class="bb-input" placeholder="Noto Serif SC" value="${esc(s.poster_font_name ||'Noto Serif SC')}" />
          <label class="bb-label">文字颜色:</label>
          <input id="bb-poster-color" type="color" class="bb-input-color" value="${s.poster_text_color || '#ffffff'}" />
        </div>
        <div id="bb-poster-preview" class="bb-poster-preview"></div>
        <div class="bb-btn-row bb-mt-md">
          <button class="bb-sm-btn" id="bb-poster-preview-btn">👁️ 预览</button>
          <button class="bb-big-btn bb-flex-1" id="bb-poster-download">📥 下载海报</button>
          <button class="bb-sm-btn bb-btn-secondary" id="bb-poster-cancel">取消</button>
        </div>
      </div>
    </div>`);
  $('body').append(modal);
  modal.find('.bb-poster-bg-preset').on('click', function () { $('#bb-poster-bg').val($(this).data('url')); updatePosterPreview(); });
  modal.find('#bb-poster-preview-btn').on('click', updatePosterPreview);
  modal.find('#bb-poster-record, #bb-poster-bg, #bb-poster-font-name, #bb-poster-color').on('change input', debounce(updatePosterPreview, 300));
  modal.find('#bb-poster-download').on('click', downloadPoster);
  modal.find('#bb-poster-cancel').on('click', () => modal.remove());modal.on('click', function (e) { if ($(e.target).hasClass('bb-modal-overlay')) modal.remove(); });
  setTimeout(updatePosterPreview, 200);
}

function updatePosterPreview() {
  const idx = parseInt($('#bb-poster-record').val()) || 0;
  const record = pluginData.records_bone[idx]; if (!record) return;
  const bgUrl = $('#bb-poster-bg').val().trim();
  const fontName = $('#bb-poster-font-name').val().trim() || 'Noto Serif SC';
  const textColor = $('#bb-poster-color').val() || '#ffffff';
  const $preview = $('#bb-poster-preview');
  const bgStyle = bgUrl ? `background-image:url(${bgUrl});background-size:cover;background-position:center;` : 'background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);';
  $preview.html(`
    <div class="bb-poster-bg" style="${bgStyle}"></div>
    <div class="bb-poster-overlay"></div>
    <div class="bb-poster-text-wrap">
      <div class="bb-poster-quote" style="color:${textColor};font-family:'${fontName}',serif;">"${esc(record.text.substring(0, 200))}"</div>
      <div class="bb-poster-author" style="color:${textColor};font-family:'${fontName}',serif;">— ${esc(record.character)}</div>
      <div class="bb-poster-brand" style="color:${textColor};">骨与血 · Bone & Blood</div>
    </div>`);
}

function downloadPoster() {
  const idx = parseInt($('#bb-poster-record').val()) || 0;
  const record = pluginData.records_bone[idx]; if (!record) return;
  const bgUrl = $('#bb-poster-bg').val().trim();
  const fontName = $('#bb-poster-font-name').val().trim() || 'Noto Serif SC';
  const textColor = $('#bb-poster-color').val() || '#ffffff';
  const s = getSettings();
  s.poster_bg_url = bgUrl; s.poster_font_name = fontName; s.poster_text_color = textColor;
  s.poster_font_url = $('#bb-poster-font-url').val().trim(); saveSettings();

  const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 1200;
  const ctx2d = canvas.getContext('2d');
  const drawText = () => {
    ctx2d.fillStyle = 'rgba(0,0,0,0.5)'; ctx2d.fillRect(0, 0, 800, 1200);
    ctx2d.fillStyle = textColor; ctx2d.font = `24px "${fontName}", serif`; ctx2d.textAlign = 'center';
    ctx2d.shadowColor = 'rgba(0,0,0,0.8)'; ctx2d.shadowBlur = 4;
    const text = `"${record.text.substring(0, 300)}"`;
    const words = text.split(''); let line = ''; let y = 400; const maxWidth = 700; const lineHeight = 40;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx2d.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) { ctx2d.fillText(line, 400, y); line = words[i]; y += lineHeight; }
      else { line = testLine; }
    }
    ctx2d.fillText(line, 400, y);
    ctx2d.font = `18px "${fontName}", serif`; ctx2d.globalAlpha = 0.7;
    ctx2d.fillText(`— ${record.character}`, 400, y + 60);
    ctx2d.font = '14px sans-serif'; ctx2d.globalAlpha = 0.5;
    ctx2d.fillText('骨与血 · Bone & Blood', 400, y + 90); ctx2d.globalAlpha = 1;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `bone_blood_poster_${Date.now()}.png`;
      a.click(); URL.revokeObjectURL(url); toastr.success('🖼️ 海报已下载');
    });
  };
  if (bgUrl) {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => { ctx2d.drawImage(img, 0, 0, 800, 1200); drawText(); };
    img.onerror = () => {
      const gradient = ctx2d.createLinearGradient(0, 0, 800, 1200);
      gradient.addColorStop(0, '#1a1a2e'); gradient.addColorStop(0.5, '#16213e'); gradient.addColorStop(1, '#0f3460');
      ctx2d.fillStyle = gradient; ctx2d.fillRect(0, 0, 800, 1200); drawText();
    };
    img.src = bgUrl;
  } else {
    const gradient = ctx2d.createLinearGradient(0, 0, 800, 1200);
    gradient.addColorStop(0, '#1a1a2e'); gradient.addColorStop(0.5, '#16213e'); gradient.addColorStop(1, '#0f3460');
    ctx2d.fillStyle = gradient; ctx2d.fillRect(0, 0, 800, 1200); drawText();
  }
}

// ── 渲染总调度 ──

function renderAll() {
  renderScrapbook();
  renderDiary();
  renderSummary();
  updateAutoSummaryBar();
  renderIntel();
  renderParallel();
  renderFateHistory();
  renderWorldFeed();
  renderAchievements();
  renderOOCPreview();
  renderGallery();
  renderCoupleMessages();
  renderCoupleLetters();
  renderCoupleAnniversaries();
  renderCouplePhotos();
  updateCharInfo();
  updateMarquee();
  applyHomeBackground();
  applyCustomFont();
  renderErrorLog();
  renderNotifications();
  // 新增：记忆琥珀
  refreshAmberCharacterFilter();
  refreshAmberCategoryFilter();
  renderAmberFacts();
  updateAmberStats();
    // 编年史
  renderChronicleTimeline();
  updateChronicleStats();
}

// ── 主面板事件绑定 ──
function bindMainPanelEvents(panel) {
  if (!panel) panel = document.getElementById('bb-main-panel');
  if (!panel) return;

  // 关闭按钮
  $(panel).find('#bb-close-btn').on('click', () => $('#bb-main-panel').fadeOut(200));

  // 生成总结按钮
  $(panel).find('#bb-btn-gen-summary-tab').on('click', async () => {
    await generateSummary();
    renderSummary();
  });

  // 自动记录开关
  $(panel).find('#bb-btn-toggle-auto').on('click', () => {
    const s = getSettings();
    s.auto_diary_enabled = !s.auto_diary_enabled;
    saveSettingsDebounced();
    updateAutoSummaryBar();
    toastr.info(s.auto_diary_enabled ? '✅ 自动记录已开启' : '⏸ 自动记录已暂停');
  });

  // 子Tab切换
  $(panel).off('click.bbsubtab').on('click.bbsubtab', '.bb-sub-tab-btn', function () {
    const targetSubTab = $(this).data('subtab');
    const $parent = $(this).closest('.bb-tab-pane');
    $parent.find('.bb-sub-tab-btn').removeClass('bb-sub-tab-active');
    $(this).addClass('bb-sub-tab-active');
    $parent.find('.bb-sub-tab-pane').addClass('bb-hidden');
    $parent.find(`#bb-subtab-${targetSubTab}`).removeClass('bb-hidden');
  });

  // 记忆琥珀事件绑定
  bindAmberPanelEvents();

  // 编年史事件绑定
  bindChroniclePanelEvents();

  // ── 音乐播放器事件 ──
  $(panel).off('click.bbmusictoggle').on('click.bbmusictoggle', '#bb-music-toggle', bbPlayerToggle);
  $(panel).off('click.bbmusicprev').on('click.bbmusicprev', '#bb-music-prev', bbPlayerPrev);
  $(panel).off('click.bbmusicnext').on('click.bbmusicnext', '#bb-music-next', bbPlayerNext);

  $(panel).off('click.bbmusicprogress').on('click.bbmusicprogress', '.bb-music-progress-mini', function(e) {
    if (!bbPlayer.audio || !bbPlayer.audio.duration) return;
    const rect = this.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    bbPlayerSeek(bbPlayer.audio.duration * percent);
  });

  $(panel).off('click.bbmusicsearch').on('click.bbmusicsearch', '#bb-btn-music-search', showMusicSearchModal);

  // ── Tab切换 ──
  $(panel).off('click.bbtab').on('click.bbtab', '.bb-tab-btn', function () {
    const tab = $(this).data('tab');
    $(panel).find('.bb-tab-btn').removeClass('active');
    $(this).addClass('active');
    $(panel).find('.bb-tab-pane').addClass('bb-hidden').removeClass('active');
    $(panel).find(`#bb-pane-${tab}`).removeClass('bb-hidden').addClass('active');
  });

  // ── 情侣空间子Tab ──
  $(panel).off('click.bbctab').on('click.bbctab', '.bb-couple-tab', function () {
    const ctab = $(this).data('ctab');
    $(panel).find('.bb-couple-tab').removeClass('active');
    $(this).addClass('active');
    $(panel).find('.bb-couple-panel').addClass('bb-hidden').removeClass('active');
    $(panel).find(`#bb-couple-${ctab}`).removeClass('bb-hidden').addClass('active');
  });

  // ── 首页：头像点击 ──
  $(panel).off('click.bbavatar').on('click.bbavatar', '.bb-avatar-clickable', function () {
    const avatarEl = $(this);
    const isUser = $(this).attr('id') === 'bb-home-user-avatar';
    const modal = $(`
      <div class="bb-modal-overlay">
        <div class="bb-modal-content">
          <h3 class="bb-modal-title">设置${isUser ? '用户' : '角色'}头像</h3>
          <div class="bb-form-col">
            <button class="bb-big-btn bb-w-full" id="bb-avatar-url">🔗 输入URL</button>
            <button class="bb-big-btn bb-w-full" id="bb-avatar-file">📁 上传文件</button>
            <button class="bb-sm-btn bb-w-full bb-btn-secondary" id="bb-avatar-cancel">取消</button>
          </div>
        </div>
      </div>`);
    $('body').append(modal);
    modal.find('#bb-avatar-url').on('click', function () {
      modal.remove();
      const url = prompt('请输入头像URL:');
      if (url) {
        avatarEl.html(`<img src="${url}" class="bb-avatar-img" />`);
        if (isUser) pluginData.home_config.user_avatar = url;
        else pluginData.home_config.char_avatar = url;
        saveChatData(); toastr.success('头像已更新');
      }
    });
    modal.find('#bb-avatar-file').on('click', function () {
      modal.remove();
      const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toastr.error('文件过大，请选择小于5MB的图片'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          avatarEl.html(`<img src="${ev.target.result}" class="bb-avatar-img" />`);
          if (isUser) pluginData.home_config.user_avatar = ev.target.result;
          else pluginData.home_config.char_avatar = ev.target.result;
          saveChatData(); toastr.success('头像已上传');
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
    modal.find('#bb-avatar-cancel').on('click', () => modal.remove());
    modal.on('click', function (e) { if ($(e.target).hasClass('bb-modal-overlay')) modal.remove(); });
  });

  // ── 首页：设置背景图 ──
  $(panel).off('click.bbbg').on('click.bbbg', '#bb-btn-set-home-bg', function () {
    const modal = $(`
      <div class="bb-modal-overlay">
        <div class="bb-modal-content">
          <h3 class="bb-modal-title">🖼️ 设置首页背景图</h3>
          <div class="bb-form-col">
            <input id="bb-home-bg-url" type="text" class="bb-input" placeholder="输入背景图URL..." value="${esc(pluginData.home_config.background_url || '')}" />
            <button class="bb-big-btn bb-w-full" id="bb-home-bg-apply">✅ 应用</button>
            <button class="bb-sm-btn bb-w-full" id="bb-home-bg-clear">🗑️ 清除背景</button>
            <button class="bb-sm-btn bb-w-full bb-btn-secondary" id="bb-home-bg-cancel">取消</button>
          </div>
        </div>
      </div>`);
    $('body').append(modal);
    modal.find('#bb-home-bg-apply').on('click', function () {
      pluginData.home_config.background_url = $('#bb-home-bg-url').val().trim();
      saveChatData(); applyHomeBackground(); modal.remove(); toastr.success('背景图已设置');
    });
    modal.find('#bb-home-bg-clear').on('click', function () {
      pluginData.home_config.background_url = '';
      saveChatData(); applyHomeBackground(); modal.remove(); toastr.info('背景图已清除');
    });
    modal.find('#bb-home-bg-cancel').on('click', () => modal.remove());
    modal.on('click', function (e) { if ($(e.target).hasClass('bb-modal-overlay')) modal.remove(); });
  });

  // ── 首页：保存配置 ──
  $(panel).off('click.bbsavehome').on('click.bbsavehome', '#bb-btn-save-home', function () {
    pluginData.home_config.link_emoji = $('#bb-home-link-emoji').text();
    pluginData.home_config.user_bubble = $('#bb-home-user-bubble').text();
    pluginData.home_config.char_bubble = $('#bb-home-char-bubble').text();
    pluginData.home_config.radio_text = $('#bb-home-radio-text').text();
    saveChatData(); toastr.success('💾 首页配置已保存');
  });

  // ── 仪表盘快捷操作 ──
  $(panel).off('click.bbquick').on('click.bbquick', '.bb-quick-action', function () {
    const action = $(this).data('action');
    switch (action) {
      case 'diary': generateDiary(); break;
      case 'fate': rollFate(); break;
      case 'ooc': $('#bb-ooc-win').removeClass('bb-hidden'); break;
      case 'weather': generateWeather(); break;
      case 'vibe': generateVibe(); break;
      case 'genimg':
        const p = prompt('输入生图提示词:');
        if (p) generateAndSaveImage(p, 'manual');
        break;
    }
  });

  // ── 导出按钮 ──
  $(panel).off('click.bbexmd').on('click.bbexmd', '#bb-btn-export-md', exportAsMarkdown);
  $(panel).off('click.bbexjson').on('click.bbexjson', '#bb-btn-export-json', exportAsJSON);
  $(panel).off('click.bbexposter').on('click.bbexposter', '#bb-btn-export-poster', showPosterEditor);

  // ── 生成按钮 ──
  $(panel).off('click.bbgendiary').on('click.bbgendiary', '#bb-btn-gen-diary-tab', generateDiary);
  $(panel).off('click.bbgendiaryimg').on('click.bbgendiaryimg', '#bb-btn-gen-diary-img', async function () {
    if (pluginData.diary_blood.length === 0) { toastr.warning('请先生成日记'); return; }
    const lastDiary = pluginData.diary_blood[pluginData.diary_blood.length - 1];
    await generateAndSaveImage(lastDiary.content.substring(0, 200), 'diary');
  });

  $(panel).off('click.bbaddnpc').on('click.bbaddnpc', '#bb-btn-add-npc', () => {
    const name = prompt('输入NPC名称:');
    if (!name) return;
    if (pluginData.npc_status[name]) { toastr.info('该NPC已存在'); return; }
    pluginData.npc_status[name] = { description: '等待窥探...', lastUpdate: '' };
    saveChatData(); renderIntel(); toastr.success(`➕ 已添加NPC: ${name}`);
  });

  $(panel).off('click.bbautonpc').on('click.bbautonpc', '#bb-btn-auto-npc', autoNPCPeek);
  $(panel).off('click.bbgenweather').on('click.bbgenweather', '#bb-btn-gen-weather-tab', generateWeather);
  $(panel).off('click.bbgenvibe').on('click.bbgenvibe', '#bb-btn-gen-vibe-tab', generateVibe);
  $(panel).off('click.bbrollfate').on('click.bbrollfate', '#bb-btn-roll-fate', rollFate);

  // ── 破墙聊天室 ──
  $(panel).off('click.bbopenooc').on('click.bbopenooc', '#bb-btn-open-ooc-win', () => $('#bb-ooc-win').removeClass('bb-hidden'));
  $(panel).off('click.bbexportooc').on('click.bbexportooc', '#bb-btn-export-ooc', exportOOCChat);
  $(panel).off('click.bbclearooc').on('click.bbclearooc', '#bb-btn-clear-ooc', () => {
    if (!confirm('确认清空Burning Star Chat历史?')) return;
    pluginData.ooc_chat = []; oocSession.history = [];
    saveChatData(); renderOOCPreview(); toastr.info('🗑️ 已清空');
  });

  // ── 世界频段 ──
  $(panel).off('click.bbaddfeed').on('click.bbaddfeed', '#bb-btn-add-feed', () => {
    const content = prompt('输入消息内容:');
    if (!content) return;
    pluginData.world_feed.push({ type: 'custom', content, timestamp: new Date().toLocaleString('zh-CN') });
    saveChatData(); renderWorldFeed(); updateMarquee();
  });
  $(panel).off('click.bbgenfeed').on('click.bbgenfeed', '#bb-btn-gen-feed', generateWorldFeed);
  $(panel).off('click.bbclearfeed').on('click.bbclearfeed', '#bb-btn-clear-feed', () => {
    if (!confirm('确认清空世界频段?')) return;
    pluginData.world_feed = []; saveChatData(); renderWorldFeed(); updateMarquee(); toastr.info('🗑️ 已清空');
  });

  // ── 画廊 ──
  $(panel).off('click.bbgenimg').on('click.bbgenimg', '#bb-btn-gen-gallery-img', async function () {
    const p = prompt('输入生图提示词:');
    if (p) await generateAndSaveImage(p, 'manual');
  });
  $(panel).off('click.bbcleargallery').on('click.bbcleargallery', '#bb-btn-clear-gallery', () => {
    if (!confirm('确认清空画廊?')) return;
    pluginData.gallery = []; saveChatData(); renderGallery(); toastr.info('🗑️ 画廊已清空');
  });

  // ── 情侣空间 ──
  bindCoupleSpaceEvents();

  // ── 错误日志 & 通知栏 ──
  $(panel).off('click.bbclearerrors').on('click.bbclearerrors', '#bb-btn-clear-errors', () => {
    if (!confirm('确认清空所有错误日志？')) return;
    clearErrorLog();
    toastr.info('错误日志已清空');
  });

  $(panel).off('click.bbmarkread').on('click.bbmarkread', '#bb-btn-mark-all-read', () => {
    markAllNotificationsRead();
    toastr.info('已全部标为已读');
  });

  $(panel).off('click.bbclearnotifs').on('click.bbclearnotifs', '#bb-btn-clear-notifs', () => {
    if (!confirm('确认清空所有通知？')) return;
    clearAllNotifications();
    toastr.info('通知已清空');
  });

  // ── 语录编辑 ──
  $(panel).on('click', '.bb-record-edit-btn', function () {
    const item = $(this).closest('.bb-record-item');
    item.find('.bb-record-display').addClass('bb-hidden');
    item.find('.bb-record-editor').removeClass('bb-hidden');
    item.find('.bb-record-edit-area').focus();
  });
  $(panel).on('click', '.bb-record-cancel', function () {
    const idx = $(this).data('index');
    const item = $(this).closest('.bb-record-item');
    item.find('.bb-record-edit-area').val(pluginData.records_bone[idx]?.text || '');
    item.find('.bb-record-editor').addClass('bb-hidden');
    item.find('.bb-record-display').removeClass('bb-hidden');
  });
  $(panel).on('click', '.bb-record-save', function () {
    const idx = $(this).data('index');
    const item = $(this).closest('.bb-record-item');
    const newText = item.find('.bb-record-edit-area').val().trim();
    if (!newText) { toastr.warning('语录内容不能为空'); return; }
    if (pluginData.records_bone[idx]) {
      pluginData.records_bone[idx].text = newText;
      pluginData.records_bone[idx].edited = true;
      pluginData.records_bone[idx].edit_time = new Date().toLocaleString();
      saveChatData(); renderRecords(); toastr.success('语录已更新');
    }
  });
  $(panel).on('click', '.bb-record-del', function () {
    const idx = $(this).data('index');
    if (!confirm('确认删除该语录?')) return;
    pluginData.records_bone.splice(idx, 1);
    saveChatData(); renderScrapbook(); toastr.info('已删除语录');
  });
}

// ── 设置面板 ──

function buildSettingsPanelHTML() { return ''; }

async function loadSettingsHTML() {
  try {
    const url = `/scripts/extensions/${EXTENSION_NAME}/settings.html`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();
    const $target = $('#extensions_settings2').length > 0 ? $('#extensions_settings2') : $('#extensions_settings');
    $target.append(html);
    console.log('[BB] settings.html loaded successfully');
  } catch (err) {
    console.error('[BB] Failed to load settings.html:', err);const $target = $('#extensions_settings2').length > 0 ? $('#extensions_settings2') : $('#extensions_settings');
    $target.append(`
      <div id="bb-settings-panel">
        <div class="inline-drawer">
          <div class="inline-drawer-toggle inline-drawer-header">
            <b>🦴骨与血 Bone & Blood</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
          </div>
          <div class="inline-drawer-content">
            <p class="bb-text-error">⚠️ 无法加载 settings.html，请检查文件是否存在。</p>
            <label class="checkbox_label">
              <input type="checkbox" id="bb-enabled" />
              <span>启用插件</span>
            </label>
          </div>
        </div>
      </div>`);
  }
}

function bindSettingsPanelEvents() {
  const s = () => extension_settings[EXTENSION_NAME];

    // 基础开关
  $('#bb-enabled').prop('checked', s().enabled).on('change', function () {
    s().enabled = this.checked; saveSettingsDebounced();
    if (this.checked) {
      if (s().show_float_button !== false) {
        $('#bb-trigger-btn').show();
        $('#bb-mobile-float').show();
      }
      toastr.success('骨与血已启用 🦴');
    } else {
      $('#bb-trigger-btn').hide();
      $('#bb-mobile-float').hide();
      $('#bb-main-panel').fadeOut(200);
      toastr.info('骨与血已禁用');
    }
  });

  // 悬浮球显示开关
  $('#bb-show-float').prop('checked', s().show_float_button !== false).on('change', function () {
    s().show_float_button = this.checked;
    saveSettingsDebounced();
    if (this.checked) {
      $('#bb-trigger-btn').show();
      $('#bb-mobile-float').show();
      toastr.info('悬浮球已显示');
    } else {
      $('#bb-trigger-btn').hide();
      $('#bb-mobile-float').hide();
      toastr.info('悬浮球已隐藏，可通过设置面板底部按钮打开主面板');
    }
  });

  // 备用入口按钮（无悬浮球时使用）
  $('#bb-open-panel-btn').on('click', function () {
    toggleMainPanel();
  });

  $('#bb-auto-diary').prop('checked', s().auto_diary_enabled).on('change', function () {
    s().auto_diary_enabled = this.checked; saveSettingsDebounced();
  });

  $('#bb-diary-trigger').val(s().diary_trigger_count || 10).on('change', function () {
    s().diary_trigger_count = parseInt(this.value) || 10; saveSettingsDebounced();
  });

   // 副API
  $('#bb-api-base').val(s().api_base || '').on('input', function () { s().api_base = this.value.trim(); saveSettingsDebounced(); });
  $('#bb-api-key').val(s().api_key || '').on('input', function () { s().api_key = this.value.trim(); saveSettingsDebounced(); });
  $('#bb-toggle-key-vis').on('click', function () {
    const inp = $('#bb-api-key');
    inp.attr('type', inp.attr('type') === 'password' ? 'text' : 'password');
  });
  // 恢复已缓存的模型列表
  if (s().available_models && s().available_models.length > 0) {
    const $sel = $('#bb-api-model');
    $sel.empty();
    $sel.append('<option value="" disabled>— 选择模型 —</option>');
    s().available_models.forEach(id => {
      $sel.append(`<option value="${id}">${id}</option>`);
    });}
  // 模型下拉框 —恢复已保存的模型
  if (s().api_model) {
    const $sel = $('#bb-api-model');
    // 如果下拉框中没有已保存的模型，先添加一个option
    if ($sel.find(`option[value="${s().api_model}"]`).length === 0) {
      $sel.append(`<option value="${s().api_model}">${s().api_model}</option>`);
    }
    $sel.val(s().api_model);}

  // 模型下拉框 — 切换模型
  $('#bb-api-model').on('change', function () {
    s().api_model = this.value;
    saveSettingsDebounced();
    if (this.value) {
      toastr.info(`模型已切换: ${this.value}`);
    }
  });

  // 连接并获取模型列表
  $('#bb-fetch-models').on('click', async function () {
    await fetchModelList();
  });

  //刷新模型列表
  $('#bb-refresh-models').on('click', async function () {
    await fetchModelList();
  });

  // 手动输入模型名— 切换显示
  $('#bb-model-manual-toggle').on('click', function () {
    $('#bb-model-manual-row').toggle();
  });

  // 手动输入模型名 — 应用
  $('#bb-model-manual-apply').on('click', function () {
    const manualModel = $('#bb-api-model-manual').val().trim();
    if (!manualModel) { toastr.warning('请输入模型名称'); return; }
    const $sel = $('#bb-api-model');
    // 添加到下拉框（如果不存在）
    if ($sel.find(`option[value="${manualModel}"]`).length === 0) {
      $sel.append(`<option value="${manualModel}">${manualModel} (手动)</option>`);
    }
    $sel.val(manualModel);
    s().api_model = manualModel;
    saveSettingsDebounced();
    $('#bb-model-manual-row').hide();
    $('#bb-api-model-manual').val('');
    toastr.success(`模型已设置: ${manualModel}`);
  });

  // 测试发送（用当前选中的模型）
  $('#bb-test-api').on('click', async function () {
    if (!s().api_base || !s().api_key) { toastr.warning('请先填写API地址和Key'); return; }
    if (!s().api_model) { toastr.warning('请先选择模型'); return; }
    try {
      toastr.info('正在测试连接...');
      const res = await callSubAPI([{ role: 'user', content: '回复"连接成功"两个字。' }], 20);
      if (res) {
        toastr.success(`✅ 测试成功！回复: ${res.substring(0, 50)}`);
        $('#bb-api-status').html(`<span class="bb-text-success">✅ 模型 ${s().api_model} 测试通过</span>`);
      }
    } catch (e) { toastr.error(`连接失败: ${e.message}`); }
  });


  // 通用预设管理
  function refreshPresetSelect() {
    const sel = $('#bb-preset-select').empty();
    (s().prompt_presets || []).forEach((p, i) => {
      sel.append(`<option value="${i}" ${i === s().active_preset ? 'selected' : ''}>${p.name}</option>`);
    });
  }
  refreshPresetSelect();

  $('#bb-preset-select').on('change', function () { s().active_preset = parseInt(this.value); saveSettingsDebounced(); toastr.info(`已切换预设: ${s().prompt_presets[s().active_preset]?.name}`); });
  $('#bb-preset-new').on('click', function () {
    const name = prompt('新预设名称:'); if (!name) return;
    if (!s().prompt_presets) s().prompt_presets = [];
    s().prompt_presets.push({ name, global: '', prompts: { diary: '', summary: '', weather: '', vibe: '', npc: '', chaos: '', parallel: '', world: '', couple: '' }, blacklist: '' });
    s().active_preset = s().prompt_presets.length - 1; saveSettingsDebounced(); refreshPresetSelect();
    toastr.success(`预设「${name}」已创建`);
  });
  $('#bb-preset-delete').on('click', function () {
    const idx = s().active_preset;
    if (!s().prompt_presets || s().prompt_presets.length <= 1) { toastr.warning('至少保留一个预设'); return; }
    if (!confirm(`确定删除预设「${s().prompt_presets[idx]?.name}」？`)) return;
    s().prompt_presets.splice(idx, 1); s().active_preset = 0; saveSettingsDebounced(); refreshPresetSelect(); toastr.info('预设已删除');
  });
    $('#bb-preset-edit').on('click', function () {
    const preset = s().prompt_presets?.[s().active_preset];
    if (!preset) return;
    
    // 如果编辑器已存在，先移除
    $('#bb-preset-editor-inline').remove();
    
    const editorHTML = `
      <div id="bb-preset-editor-inline" class="bb-preset-editor-inline" style="margin-top:10px; padding:12px; border:1px solid rgba(255,255,255,0.1); border-radius:8px; background:rgba(0,0,0,0.15);">
        <h5 id="bb-preset-editor-title" style="color:var(--bb-primary,#c9a0dc); margin:0 0 10px;">编辑预设: ${esc(preset.name)}</h5>
        
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="bb-field">
            <label class="bb-field-label">预设名称</label>
            <input id="bb-pe-name" type="text" class="text_pole" value="${esc(preset.name)}" />
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">🌐 全局氛围提示词</label>
            <textarea id="bb-pe-global" class="text_pole" rows="3" placeholder="全局氛围提示词，会附加到所有AI调用前">${esc(preset.global || '')}</textarea>
          </div>
          
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:4px 0;">
          <div class="bb-field-label" style="font-weight:600;">📝 各功能提示词</div>
          
          <div class="bb-field">
            <label class="bb-field-label">📖 日记</label>
            <textarea id="bb-pe-diary" class="text_pole" rows="2">${esc(preset.prompts?.diary || '')}</textarea>
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">📜 总结</label>
            <textarea id="bb-pe-summary" class="text_pole" rows="2">${esc(preset.prompts?.summary || '')}</textarea>
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">☁️ 环境</label>
            <textarea id="bb-pe-weather" class="text_pole" rows="2">${esc(preset.prompts?.weather || '')}</textarea>
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">❤️ 氛围</label>
            <textarea id="bb-pe-vibe" class="text_pole" rows="2">${esc(preset.prompts?.vibe || '')}</textarea>
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">🧑‍🤝‍🧑 NPC</label>
            <textarea id="bb-pe-npc" class="text_pole" rows="2">${esc(preset.prompts?.npc || '')}</textarea>
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">🎲 命运</label>
            <textarea id="bb-pe-chaos" class="text_pole" rows="2">${esc(preset.prompts?.fate || preset.prompts?.chaos || '')}</textarea>
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">🦋 平行宇宙</label>
            <textarea id="bb-pe-parallel" class="text_pole" rows="2">${esc(preset.prompts?.butterfly || preset.prompts?.parallel || '')}</textarea>
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">📻 世界频段</label>
            <textarea id="bb-pe-world" class="text_pole" rows="2">${esc(preset.prompts?.world || '')}</textarea>
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">💕 情侣空间</label>
            <textarea id="bb-pe-couple" class="text_pole" rows="2">${esc(preset.prompts?.couple || '')}</textarea>
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">🚫屏蔽词（逗号分隔）</label>
            <input id="bb-pe-blacklist" type="text" class="text_pole" value="${esc(Array.isArray(preset.blacklist) ? preset.blacklist.join(',') : (preset.blacklist || ''))}" placeholder="词1,词2,词3" />
          </div>
          
          <div class="bb-btn-group" style="margin-top:6px;">
            <button class="menu_button bb-btn-primary" id="bb-pe-save">💾 保存预设</button>
            <button class="menu_button" id="bb-pe-cancel">取消</button>
          </div>
        </div>
      </div>
    `;
    
    // 插入到预设选择器后面
    const $target = $('#bb-preset-edit').closest('.bb-settings-section, .bb-btn-group, div').parent();
    if ($target.length) {
      $target.append(editorHTML);
    } else {
      $('#bb-preset-edit').parent().after(editorHTML);
    }
    
    // 绑定保存和取消
    $('#bb-pe-save').on('click', function () {
      const idx = s().active_preset;
      const p = s().prompt_presets?.[idx];
      if (!p) return;
      p.name = $('#bb-pe-name').val().trim() || p.name;
      p.global = $('#bb-pe-global').val();
      const bl = $('#bb-pe-blacklist').val();
      p.blacklist = bl ? bl.split(',').map(w => w.trim()).filter(Boolean) : [];
      p.prompts = {
        diary: $('#bb-pe-diary').val(),
        summary: $('#bb-pe-summary').val(),
        weather: $('#bb-pe-weather').val(),
        vibe: $('#bb-pe-vibe').val(),
        npc: $('#bb-pe-npc').val(),
        fate: $('#bb-pe-chaos').val(),
        chaos: $('#bb-pe-chaos').val(),
        butterfly: $('#bb-pe-parallel').val(),
        parallel: $('#bb-pe-parallel').val(),
        world: $('#bb-pe-world').val(),
        couple: $('#bb-pe-couple').val(),
        ooc: p.prompts?.ooc || '',};
      saveSettingsDebounced();
      refreshPresetSelect();
      $('#bb-preset-editor-inline').remove();
      toastr.success(`预设「${p.name}」已保存`);
    });
    
    $('#bb-pe-cancel').on('click', () => $('#bb-preset-editor-inline').remove());
  });
  $('#bb-preset-import').on('click', function () {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const text = await e.target.files[0].text(); const data = JSON.parse(text);
        if (!data.name || !data.prompts) throw new Error('无效的预设文件');
        if (!s().prompt_presets) s().prompt_presets = [];
        s().prompt_presets.push(data); s().active_preset = s().prompt_presets.length - 1;
        saveSettingsDebounced(); refreshPresetSelect(); toastr.success(`预设「${data.name}」已导入`);
      } catch (err) { toastr.error(`导入失败: ${err.message}`); }
    };
    input.click();
  });
  $('#bb-preset-export').on('click', function () {
    const preset = s().prompt_presets?.[s().active_preset]; if (!preset) return;
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `bb_preset_${preset.name}.json`; a.click(); URL.revokeObjectURL(a.href); toastr.info('预设已导出');
  });

  // OOC预设管理（设置面板中的）
  function refreshOOCPresetSelect() {
    const sel = $('#bb-ooc-preset-select').empty();
    (s().ooc_presets || []).forEach((p, i) => {
      sel.append(`<option value="${i}" ${i === s().active_ooc_preset ? 'selected' : ''}>${p.name}</option>`);
    });
  }
  refreshOOCPresetSelect();

  $('#bb-ooc-preset-select').on('change', function () { s().active_ooc_preset = parseInt(this.value); saveSettingsDebounced(); toastr.info(`OOC预设已切换: ${s().ooc_presets[s().active_ooc_preset]?.name}`); });
  $('#bb-ooc-preset-new').on('click', function () {
    const name = prompt('新OOC预设名称:'); if (!name) return;
    if (!s().ooc_presets) s().ooc_presets = [];
    s().ooc_presets.push({ name, system_prompt: '', temperature: 0.8, max_tokens: 800});
    s().active_ooc_preset = s().ooc_presets.length - 1; saveSettingsDebounced(); refreshOOCPresetSelect();
    toastr.success(`OOC预设「${name}」已创建`);
  });
  $('#bb-ooc-preset-delete').on('click', function () {
    const idx = s().active_ooc_preset;
    if (!s().ooc_presets || s().ooc_presets.length <= 1) { toastr.warning('至少保留一个OOC预设'); return; }
    if (!confirm(`确定删除OOC预设「${s().ooc_presets[idx]?.name}」？`)) return;
    s().ooc_presets.splice(idx, 1); s().active_ooc_preset = 0; saveSettingsDebounced(); refreshOOCPresetSelect(); toastr.info('OOC预设已删除');
  });
   $('#bb-ooc-preset-edit').on('click', function () {
    const preset = s().ooc_presets?.[s().active_ooc_preset];
    if (!preset) return;
    
    // 如果编辑器已存在，先移除
    $('#bb-ooc-preset-editor-inline').remove();
    
    const editorHTML = `
      <div id="bb-ooc-preset-editor-inline" style="margin-top:10px; padding:12px; border:1px solid rgba(255,255,255,0.1); border-radius:8px; background:rgba(0,0,0,0.15);">
        <h5 id="bb-ooc-pe-title" style="color:var(--bb-primary,#c9a0dc); margin:0 0 10px;">编辑OOC预设: ${esc(preset.name)}</h5>
        
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="bb-field">
            <label class="bb-field-label">预设名称</label>
            <input id="bb-ooc-pe-name" type="text" class="text_pole" value="${esc(preset.name)}" />
          </div>
          
          <div class="bb-field">
            <label class="bb-field-label">系统提示词</label>
            <textarea id="bb-ooc-pe-system" class="text_pole" rows="6" style="min-height:120px;">${esc(preset.system_prompt || '')}</textarea>
          </div>
          
          <div style="display:flex;gap:8px;">
            <div class="bb-field" style="flex:1;">
              <label class="bb-field-label">Temperature</label>
              <input id="bb-ooc-pe-temp" type="number" class="text_pole" step="0.1" min="0" max="2" value="${preset.temperature ?? 0.8}" />
            </div>
            <div class="bb-field" style="flex:1;">
              <label class="bb-field-label">Max Tokens</label>
              <input id="bb-ooc-pe-tokens" type="number" class="text_pole" min="50" max="4000" value="${preset.max_tokens ?? 800}" />
            </div>
          </div>
          
          <div class="bb-btn-group" style="margin-top:6px;">
            <button class="menu_button bb-btn-primary" id="bb-ooc-pe-save">💾 保存</button>
            <button class="menu_button" id="bb-ooc-pe-cancel">取消</button>
          </div>
        </div>
      </div>
    `;
    
    const $target = $('#bb-ooc-preset-edit').closest('.bb-settings-section, div').parent();
    if ($target.length) {
      $target.append(editorHTML);
    } else {
      $('#bb-ooc-preset-edit').parent().after(editorHTML);
    }
    
    $('#bb-ooc-pe-save').on('click', function () {
      const idx = s().active_ooc_preset;
      const p = s().ooc_presets?.[idx];
      if (!p) return;
      p.name = $('#bb-ooc-pe-name').val().trim() || p.name;
      p.system_prompt = $('#bb-ooc-pe-system').val();
      p.temperature = parseFloat($('#bb-ooc-pe-temp').val()) || 0.8;
      p.max_tokens = parseInt($('#bb-ooc-pe-tokens').val()) || 800;
      saveSettingsDebounced();
      refreshOOCPresetSelect();
      $('#bb-ooc-preset-editor-inline').remove();
      toastr.success(`OOC预设「${p.name}」已保存`);
    });
    
    $('#bb-ooc-pe-cancel').on('click', () => $('#bb-ooc-preset-editor-inline').remove());
  });

  $('#bb-ooc-pe-save').on('click', function () {
    const idx = s().active_ooc_preset; const preset = s().ooc_presets?.[idx]; if (!preset) return;
    preset.name = $('#bb-ooc-pe-name').val().trim() || preset.name;
    preset.system_prompt = $('#bb-ooc-pe-system').val();
    preset.temperature = parseFloat($('#bb-ooc-pe-temp').val()) || 0.8;
    preset.max_tokens = parseInt($('#bb-ooc-pe-tokens').val()) || 800;
    saveSettingsDebounced(); refreshOOCPresetSelect(); $('#bb-ooc-preset-editor').slideUp(200);
    toastr.success(`OOC预设「${preset.name}」已保存`);
  });
  $('#bb-ooc-preset-import').on('click', function () {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const text = await e.target.files[0].text(); const data = JSON.parse(text);
        if (!data.name || data.system_prompt === undefined) throw new Error('无效的OOC预设文件');
        if (!s().ooc_presets) s().ooc_presets = [];
        s().ooc_presets.push(data); s().active_ooc_preset = s().ooc_presets.length - 1;
        saveSettingsDebounced(); refreshOOCPresetSelect(); toastr.success(`OOC预设「${data.name}」已导入`);
      } catch (err) { toastr.error(`导入失败: ${err.message}`); }
    };
    input.click();
  });
  $('#bb-ooc-preset-export').on('click', function () {
    const preset = s().ooc_presets?.[s().active_ooc_preset]; if (!preset) return;
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `bb_ooc_preset_${preset.name}.json`; a.click(); URL.revokeObjectURL(a.href); toastr.info('OOC预设已导出');
  });

  // 生图配置
  $('#bb-img-provider').val(s().img_provider || 'placeholder').on('change', function () { s().img_provider = this.value; saveSettingsDebounced(); $('#bb-img-config-detail').toggle(this.value !== 'placeholder'); });
  $('#bb-img-config-detail').toggle((s().img_provider || 'placeholder') !== 'placeholder');
  $('#bb-img-api-base').val(s().img_api_base || '').on('input', function () { s().img_api_base = this.value.trim(); saveSettingsDebounced(); });
  $('#bb-img-api-key').val(s().img_api_key || '').on('input', function () { s().img_api_key = this.value.trim(); saveSettingsDebounced(); });
  $('#bb-img-artist-tags').val(s().img_artist_tags || '').on('input', function () { s().img_artist_tags = this.value; saveSettingsDebounced(); });
  $('#bb-img-negative').val(s().img_negative_prompt || '').on('input', function () { s().img_negative_prompt = this.value; saveSettingsDebounced(); });
  $('#bb-img-template').val(s().img_prompt_template || '').on('input', function () { s().img_prompt_template = this.value; saveSettingsDebounced(); });
  $('#bb-img-auto').prop('checked', s().img_auto_generate || false).on('change', function () { s().img_auto_generate = this.checked; saveSettingsDebounced(); });

  // 海报配置
  $('#bb-poster-bg').val(s().poster_bg_url || '').on('input', function () { s().poster_bg_url = this.value.trim(); saveSettingsDebounced(); });
  $('#bb-poster-font-url').val(s().poster_font_url || '').on('input', function () { s().poster_font_url = this.value.trim(); saveSettingsDebounced(); });
  $('#bb-poster-font-name').val(s().poster_font_name || '').on('input', function () { s().poster_font_name = this.value.trim(); saveSettingsDebounced(); });
  $('#bb-poster-text-color').val(s().poster_text_color || '#ffffff').on('input', function () { s().poster_text_color = this.value; saveSettingsDebounced(); });

  // 主页布局
  function updateLayoutUI() {
    $('.bb-layout-option').removeClass('active');
    $(`.bb-layout-option[data-layout="${s().home_layout || 'together'}"]`).addClass('active');}
  updateLayoutUI();
  $(document).on('click', '.bb-layout-option', function () {
    s().home_layout = $(this).data('layout'); saveSettingsDebounced(); updateLayoutUI();
    toastr.info(`主页布局已切换: ${s().home_layout}`);
  });

  // 风格预设
  $('#bb-style-preset').val(s().style_preset || 'modern').on('change', function () {
    s().style_preset = this.value; saveSettingsDebounced();
    applyStylePreset(this.value);
    toastr.info(`主题风格已切换: ${this.value}`);
  });

  // 自定义CSS
  $('#bb-custom-css').val(s().custom_css || '');
  $(document).on('click', '.bb-css-tpl-btn', function () {
    const tpl = $(this).data('tpl'); const code = CSS_TEMPLATES[tpl];
    if (code) {
      const current = $('#bb-custom-css').val();
      $('#bb-custom-css').val(current ? current + '\n\n' + code : code);
      toastr.info(`已插入「${$(this).text().trim()}」模板`);
    }
  });
  $('#bb-css-apply').on('click', function () {
    const css = $('#bb-custom-css').val(); s().custom_css = css; saveSettingsDebounced();
    applyCustomCSS(css); toastr.success('自定义CSS已应用');
  });
  $('#bb-css-reset').on('click', function () {
    if (!confirm('确定清空自定义CSS？')) return;
    $('#bb-custom-css').val(''); s().custom_css = ''; saveSettingsDebounced();
    applyCustomCSS(''); toastr.info('自定义CSS已清空');
  });
  $('#bb-css-copy-prompt').on('click', function () {
    navigator.clipboard.writeText(CSS_AI_PROMPT).then(() => {
      toastr.success('AI提示词已复制到剪贴板！');
    }).catch(() => {
      const ta = document.createElement('textarea'); ta.value = CSS_AI_PROMPT;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta); toastr.success('AI提示词已复制！');
    });
  });
  $('#bb-css-ai-prompt-preview').text(CSS_AI_PROMPT);
    // 自定义字体
  $('#bb-custom-font-url').val(s().custom_font_url || '').on('input', function () {
    s().custom_font_url = this.value.trim(); saveSettingsDebounced();
    updateFontPreview();
  });
  $('#bb-custom-font-name').val(s().custom_font_name || '').on('input', function () {
    s().custom_font_name = this.value.trim(); saveSettingsDebounced();
    updateFontPreview();
  });

  const fontApply = s().custom_font_apply || {};
  $('#bb-font-apply-panel').prop('checked', !!fontApply.panel);
  $('#bb-font-apply-title').prop('checked', !!fontApply.title);
  $('#bb-font-apply-content').prop('checked', !!fontApply.content);
  $('#bb-font-apply-ooc').prop('checked', !!fontApply.ooc);

  // 快捷字体选择
  $('.bbs-font-quick').on('click', function () {
    const url = $(this).data('url');
    const name = $(this).data('name');
    $('#bb-custom-font-url').val(url).trigger('input');
    $('#bb-custom-font-name').val(name).trigger('input');
    toastr.info(`已选择字体: ${name}`);
  });

  // 应用字体
  $('#bb-font-apply').on('click', function () {
    s().custom_font_apply = {
      panel: $('#bb-font-apply-panel').is(':checked'),
      title: $('#bb-font-apply-title').is(':checked'),
      content: $('#bb-font-apply-content').is(':checked'),
      ooc: $('#bb-font-apply-ooc').is(':checked'),
    };
    saveSettingsDebounced();
    applyCustomFont();
    toastr.success(`字体已应用: ${s().custom_font_name || '默认'}`);
  });

  // 恢复默认字体
  $('#bb-font-reset').on('click', function () {
    s().custom_font_url = '';
    s().custom_font_name = '';
    s().custom_font_apply = { panel: false, title: false, content: false, ooc: false };
    saveSettingsDebounced();
    $('#bb-custom-font-url').val('');
    $('#bb-custom-font-name').val('');
    $('#bb-font-apply-panel').prop('checked', false);
    $('#bb-font-apply-title').prop('checked', false);
    $('#bb-font-apply-content').prop('checked', false);
    $('#bb-font-apply-ooc').prop('checked', false);
    $('#bb-custom-font-link').remove();
    $('#bb-custom-font-style').remove();
    $('#bb-font-preview').hide();
    toastr.info('已恢复默认字体');
  });

  // 字体预览
  function updateFontPreview() {
    const url = $('#bb-custom-font-url').val();
    const name = $('#bb-custom-font-name').val();
    if (url && name) {
      // 临时加载字体预览
      let tempLink = document.getElementById('bb-font-preview-link');
      if (!tempLink) {
        tempLink = document.createElement('link');
        tempLink.id = 'bb-font-preview-link';
        tempLink.rel = 'stylesheet';
        document.head.appendChild(tempLink);
      }
      tempLink.href = url;
      $('#bb-font-preview-text').css('font-family', `'${name}', serif`);
      $('#bb-font-preview').show();
    } else {
      $('#bb-font-preview').hide();
    }
  }
  updateFontPreview();

  
    // 音乐搜索API配置
  $('#bb-music-search-api').val(s().music_search_api || '').on('input', function() {
    s().music_search_api = this.value.trim();
    s().music_search_api_tested = false;
    saveSettingsDebounced();
  });
  $('#bb-music-test-search-api').on('click', async function() {
    await bbMusicTestAPI();
  });

    // 音乐播放器设置（新增 - MP3播放器）
  bbPlayerLoadPlaylist();
  bbPlayerRenderPlaylist();
  
  $('#bb-music-upload').on('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      toastr.error('请选择音频文件');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toastr.error('文件过大，请选择小于50MB的文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(ev) {
      const name = file.name.replace(/\.[^/.]+$/, '');
      bbPlayerAddSong(name, ev.target.result);
    };
    reader.readAsDataURL(file);
    this.value = '';
  });
  
  $('#bb-music-add-url-btn').on('click', function() {
    const modal = $(`
      <div class="bb-modal-overlay">
        <div class="bb-modal-content">
          <h3 class="bb-modal-title">添加音频URL</h3>
          <div class="bb-form-col">
            <label class="bb-label">歌曲名称：</label>
            <input id="bb-music-url-name" type="text" class="bb-input" placeholder="输入歌曲名称" />
            
            <label class="bb-label">音频URL：</label>
            <input id="bb-music-url-src" type="text" class="bb-input" placeholder="https://example.com/song.mp3" />
            
            <label class="bb-label">LRC歌词（可选）：</label>
            <textarea id="bb-music-url-lrc" class="bb-textarea" rows="8" placeholder="[00:12.00]第一句歌词&#10;[00:17.50]第二句歌词"></textarea>
            <small class="bb-text-muted">支持LRC格式歌词，时间轴格式：[分:秒.毫秒]</small>
          </div>
          <div class="bb-btn-row bb-mt-md">
            <button class="bb-big-btn bb-flex-1" id="bb-music-url-add">✅ 添加</button>
            <button class="bb-sm-btn bb-btn-secondary" id="bb-music-url-cancel">取消</button>
          </div>
        </div>
      </div>`);
    
    $('body').append(modal);
    
    modal.find('#bb-music-url-add').on('click', function() {
      const name = $('#bb-music-url-name').val().trim();
      const src = $('#bb-music-url-src').val().trim();
      const lrc = $('#bb-music-url-lrc').val().trim();
      
      if (!name || !src) {
        toastr.warning('请填写歌曲名称和URL');
        return;
      }
      
      bbPlayerAddSong(name, src, lrc);
      modal.remove();
    });
    
    modal.find('#bb-music-url-cancel').on('click', () => modal.remove());
    modal.on('click', function(e) {
      if ($(e.target).hasClass('bb-modal-overlay')) modal.remove();
    });
  });
  
  $('#bb-music-volume').val(s().music_volume ?? 0.7).on('input', function() {
    bbPlayerSetVolume(parseFloat(this.value));
    $('#bb-music-volume-val').text(Math.round(this.value * 100) + '%');
  });
  $('#bb-music-volume-val').text(Math.round((s().music_volume ?? 0.7) * 100) + '%');
  
  $('#bb-music-clear-playlist').on('click', function() {
    if (!confirm('确认清空整个歌单？')) return;
    bbPlayer.playlist = [];
    bbPlayer.currentIndex = 0;
    bbPlayerPause();
    bbPlayerSavePlaylist();
    bbPlayerUpdateUI();
    toastr.info('歌单已清空');
  });
  
  $('#bb-music-export-playlist').on('click', function() {
    if (bbPlayer.playlist.length === 0) {
      toastr.warning('歌单为空');
      return;
    }
    const data = JSON.stringify(bbPlayer.playlist, null, 2);
    dl(`bb_playlist_${Date.now()}.json`, data, 'application/json');
    toastr.success('歌单已导出');
  });
  
  $('#bb-music-import-playlist').on('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const text = await e.target.files[0].text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('无效的歌单文件');
        bbPlayer.playlist = data;
        bbPlayerSavePlaylist();
        bbPlayerUpdateUI();
        toastr.success(`已导入 ${data.length} 首歌曲`);
      } catch (err) {
        toastr.error(`导入失败: ${err.message}`);
      }
    };
    input.click();
  });

  // 数据管理
  $('#bb-export-md').on('click', () => exportAsMarkdown());
  $('#bb-export-json').on('click', () => exportAsJSON());
  $('#bb-clear-data').on('click', function () {
    const ctx = getContext();
    if (!ctx.chatId) { toastr.warning('当前没有活跃的聊天'); return; }
    if (!confirm(`确定清空「${ctx.chatId}」的所有骨与血数据？此操作不可撤销！`)) return;
    localStorage.removeItem(`bb_data_${ctx.chatId}`);
    Object.assign(pluginData, createDefaultPluginData());
    renderAll(); toastr.info('数据已清空');
  });
    // 📌 记忆琥珀设置绑定
  // ═══════════════════════════════════════════
  // 安全检查：如果settings.html中没有记忆琥珀的设置项，跳过
  if ($('#bb-set-amber-enabled').length > 0) {
    const ma = s().memory_amber || {};

    // 加载当前值到UI
    $('#bb-set-amber-enabled').prop('checked', ma.enabled !== false);
    $('#bb-set-amber-auto-extract').prop('checked', ma.auto_extract !== false);
    $('#bb-set-amber-interval').val(ma.extract_interval || 15);
    $('#bb-set-amber-auto-confirm').prop('checked', !!ma.auto_confirm);
    $('#bb-set-amber-max-facts').val(ma.max_facts_per_character || 100);
    $('#bb-set-amber-priority').val(ma.priority_algorithm || 'weighted');
    $('#bb-set-amber-show-confidence').prop('checked', ma.show_confidence !== false);
    $('#bb-set-amber-show-refs').prop('checked', ma.show_references !== false);
    $('#bb-set-amber-conflict').prop('checked', ma.conflict_detection !== false);
    $('#bb-set-amber-threshold').val(ma.conflict_threshold || 0.7);
    $('#bb-set-amber-threshold-val').text(ma.conflict_threshold || 0.7);
    $('#bb-set-amber-multi-char').prop('checked', ma.multi_character !== false);
    $('#bb-set-amber-export-format').val(ma.export_format || 'json');

    // 监听变化 — 启用开关
    $('#bb-set-amber-enabled').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.enabled = $(this).is(':checked');
      saveSettingsDebounced();
      toastr.info(s().memory_amber.enabled ? '记忆琥珀已启用' : '记忆琥珀已关闭');
    });

    // 自动提取开关
    $('#bb-set-amber-auto-extract').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.auto_extract = $(this).is(':checked');
      saveSettingsDebounced();
      if ($(this).is(':checked') && typeof hookFactExtractionToMessageCounter === 'function') {
        hookFactExtractionToMessageCounter();
        toastr.info('自动提取已启用');
      } else {
        toastr.info('自动提取已关闭');
      }
    });

    // 提取间隔
    $('#bb-set-amber-interval').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.extract_interval = parseInt($(this).val()) || 15;
      saveSettingsDebounced();
    });

    // 自动确认
    $('#bb-set-amber-auto-confirm').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.auto_confirm = $(this).is(':checked');
      saveSettingsDebounced();
      if ($(this).is(':checked')) {
        toastr.warning('⚠️ 自动确认已启用，事实将不经审核直接添加');
      }
    });

    // 每角色最大事实数
    $('#bb-set-amber-max-facts').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.max_facts_per_character = parseInt($(this).val()) || 100;
      saveSettingsDebounced();
    });

    // 优先级算法
    $('#bb-set-amber-priority').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.priority_algorithm = $(this).val();
      saveSettingsDebounced();if (typeof renderAmberFacts === 'function') renderAmberFacts();
    });

    // 显示置信度
    $('#bb-set-amber-show-confidence').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.show_confidence = $(this).is(':checked');
      saveSettingsDebounced();
      if (typeof renderAmberFacts === 'function') renderAmberFacts();
    });

    // 显示引用次数
    $('#bb-set-amber-show-refs').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.show_references = $(this).is(':checked');
      saveSettingsDebounced();
      if (typeof renderAmberFacts === 'function') renderAmberFacts();
    });

    // 冲突检测开关
    $('#bb-set-amber-conflict').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.conflict_detection = $(this).is(':checked');
      saveSettingsDebounced();});

    // 冲突检测阈值
    $('#bb-set-amber-threshold').on('input', function () {
      if (!s().memory_amber) s().memory_amber = {};
      const val = parseFloat($(this).val());
      s().memory_amber.conflict_threshold = val;
      $('#bb-set-amber-threshold-val').text(val.toFixed(2));
      saveSettingsDebounced();
    });

    // 多角色支持
    $('#bb-set-amber-multi-char').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.multi_character = $(this).is(':checked');
      saveSettingsDebounced();
    });

    // 导出格式
    $('#bb-set-amber-export-format').on('change', function () {
      if (!s().memory_amber) s().memory_amber = {};
      s().memory_amber.export_format = $(this).val();
      saveSettingsDebounced();
    });

    console.log('[骨与血] 记忆琥珀设置绑定完成');
  }
    $(panel).off('click.bbsubtab').on('click.bbsubtab', '.bb-sub-tab-btn', function () {
    const targetSubTab = $(this).data('subtab');
    const $parent = $(this).closest('.bb-tab-pane');
    
    // 切换按钮高亮
    $parent.find('.bb-sub-tab-btn').removeClass('bb-sub-tab-active');
    $(this).addClass('bb-sub-tab-active');
    
    // 切换面板
    $parent.find('.bb-sub-tab-pane').addClass('bb-hidden');
    $parent.find(`#bb-subtab-${targetSubTab}`).removeClass('bb-hidden');
  });

    // ═══════════════════════════════════════════
  // ⭐ 编年史设置绑定
  // ═══════════════════════════════════════════
  if ($('#bb-set-chronicle-enabled').length > 0) {
    const ch = s().chronicle || {};

    $('#bb-set-chronicle-enabled').prop('checked', ch.enabled !== false);
    $('#bb-set-chronicle-auto').prop('checked', ch.auto_extract !== false);
    $('#bb-set-chronicle-interval').val(ch.extract_interval || 20);
    $('#bb-set-chronicle-auto-chapter').prop('checked', ch.auto_chapter !== false);
    $('#bb-set-chronicle-chapter-threshold').val(ch.chapter_threshold || 5);
    $('#bb-set-chronicle-export-format').val(ch.export_format || 'markdown');

    $('#bb-set-chronicle-enabled').on('change', function () {
      if (!s().chronicle) s().chronicle = {};
      s().chronicle.enabled = $(this).is(':checked');
      saveSettingsDebounced();
      toastr.info(s().chronicle.enabled ? '编年史已启用' : '编年史已关闭');
    });

    $('#bb-set-chronicle-auto').on('change', function () {
      if (!s().chronicle) s().chronicle = {};
      s().chronicle.auto_extract = $(this).is(':checked');
      saveSettingsDebounced();
      if ($(this).is(':checked') && typeof hookChronicleToMessageCounter === 'function') {
        hookChronicleToMessageCounter();
        toastr.info('编年史自动提取已启用');
      } else {
        toastr.info('编年史自动提取已关闭');
      }
    });

    $('#bb-set-chronicle-interval').on('change', function () {
      if (!s().chronicle) s().chronicle = {};
      s().chronicle.extract_interval = parseInt($(this).val()) || 20;
      saveSettingsDebounced();
    });

    $('#bb-set-chronicle-auto-chapter').on('change', function () {
      if (!s().chronicle) s().chronicle = {};
      s().chronicle.auto_chapter = $(this).is(':checked');
      saveSettingsDebounced();
    });

    $('#bb-set-chronicle-chapter-threshold').on('change', function () {
      if (!s().chronicle) s().chronicle = {};
      s().chronicle.chapter_threshold = parseInt($(this).val()) || 5;
      saveSettingsDebounced();
    });

    $('#bb-set-chronicle-export-format').on('change', function () {
      if (!s().chronicle) s().chronicle = {};
      s().chronicle.export_format = $(this).val();
      saveSettingsDebounced();
    });

    console.log('[骨与血] 编年史设置绑定完成');
  }

}

// ── 导出功能 ──

function exportAsMarkdown() {
  const ctx = getContext(); const cn = ctx.name2|| '角色'; const un = ctx.name1 || '用户';
  let md = `# 🦴骨与血 — ${cn} & ${un}\n\n> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  if (pluginData.records_bone.length > 0) { md += `##🌟 唱片机（语录收藏）\n\n`; pluginData.records_bone.forEach(r => { md += `**${r.character}** (${r.timestamp}):\n> ${r.text}\n\n`; }); }
  if (pluginData.diary_blood.length > 0) { md += `## 📖 日记本\n\n`; pluginData.diary_blood.forEach(d => { md += `### ${d.date}\n${d.content}\n\n`; }); }
  if (pluginData.summaries.length > 0) { md += `## 📜阿卡夏记录\n\n`; pluginData.summaries.forEach(s => { md += `### ${s.date}\n${s.content}\n\n`; }); }
  if (pluginData.weather) md += `## ☁️ 环境\n${pluginData.weather}\n\n`;
  if (pluginData.vibe) md += `## ❤️ 氛围\n${pluginData.vibe}\n\n`;
  const npcNames = Object.keys(pluginData.npc_status);
  if (npcNames.length > 0) { md += `## 🗺️ NPC 动态\n\n`; npcNames.forEach(n => { md += `### ${n}\n${pluginData.npc_status[n].description || '未知'}\n*更新时间: ${pluginData.npc_status[n].lastUpdate}*\n\n`; }); }
  if (pluginData.parallel_universes.length > 0) { md += `## 🦋 平行宇宙\n\n`; pluginData.parallel_universes.forEach(p => { md += `### #${p.floor} — ${p.date}\n> **原文:** ${p.origin}\n\n${p.content}\n\n`; }); }
  if (pluginData.fate_history.length > 0) { md += `## 🎲 命运之轮\n\n`; pluginData.fate_history.forEach(f => { md += `**[#${f.floor} ${f.timestamp}]** ${f.content}\n\n`; }); }
  if (pluginData.world_feed.length > 0) { md += `## 📻 世界频段\n\n`; pluginData.world_feed.forEach(f => { const icon = f.type === 'gossip' ? '💬' : f.type === 'news' ? '📰' : '✨'; md += `${icon} **[${f.timestamp}]** ${f.content}\n\n`; }); }
  if (pluginData.achievements.length > 0) { md += `## 🏆 成就殿堂\n\n`; pluginData.achievements.forEach(a => { md += `- ${a.id} (${a.date})\n`; }); }
  md += `\n---\n*© 2026SHADOW<安息之影>*\n`;
  dl(`bone_blood_${cn}_${Date.now()}.md`, md, 'text/markdown');
  toastr.success('📄Markdown 已导出！');
}

function exportAsJSON() {
  const ctx = getContext(); const cn = ctx.name2 || '角色';
  const data = { exportTime: new Date().toISOString(), character: cn, user: ctx.name1, chatId: ctx.chatId, pluginData: pluginData };
  dl(`bone_blood_${cn}_${Date.now()}.json`, JSON.stringify(data, null, 2), 'application/json');
  toastr.success('📦JSON 已导出！');
}

// ── 事件监听 ──

function registerEventListeners() {
  eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (msgId) => {
    if (!getSettings().enabled) return;
    injectMessageButtons(msgId); incrementMessageCounter();
  });
  eventSource.on(event_types.USER_MESSAGE_RENDERED, (msgId) => {
    if (!getSettings().enabled) return;
    injectMessageButtons(msgId);
  });
    eventSource.on(event_types.CHAT_CHANGED, () => {
    loadChatData();
    getSettings().message_counter = 0; saveSettings();
    updateCharInfo();
    setTimeout(() => injectButtonsToExistingMessages(), 500);

    // 记忆琥珀：切换角色/聊天时刷新数据
    amberMessageCounter = 0;
    if (typeof refreshAmberCharacterFilter === 'function') {
      refreshAmberCharacterFilter();renderAmberFacts();
      updateAmberStats();
    }
      //编年史//
          chronicleMessageCounter = 0;
    if (typeof renderChronicleTimeline === 'function') {
      renderChronicleTimeline();
      updateChronicleStats();
    }
  });
  
  amberMessageCounter = 0;
    if (typeof refreshAmberCharacterFilter === 'function') {
      refreshAmberCharacterFilter();renderAmberFacts();
      updateAmberStats();
    }
}

function incrementMessageCounter() {
  const s = getSettings();
  s.message_counter = (s.message_counter || 0) + 1; saveSettings();
  updateAutoSummaryBar();  // ← 新增：实时更新进度
  if (s.auto_diary_enabled && s.message_counter >= s.diary_trigger_count) {
    s.message_counter = 0; saveSettings(); autoGenerate();
  }
  checkAchievements();
}

async function autoGenerate() {
  console.log('[骨与血]🔄 触发自动生成...');
  toastr.info('🔄 自动生成日记和总结中...');
  bbNotify('system', '自动生成触发', `已达到 ${getSettings().diary_trigger_count} 条消息，正在自动生成日记和总结...`);
  playNotificationSound('info');
  await generateDiary();
  await generateSummary();
  renderDiary();      // ← 新增
  renderSummary();    // ← 新增
  updateAutoSummaryBar(); // ← 新增
}

// ── 按钮注入 ──

function injectButtonsToExistingMessages() {
  const ctx = getContext(); if (!ctx.chat) return;
  ctx.chat.forEach((_, idx) => injectMessageButtons(idx));
  console.log(`[骨与血] 已为${ctx.chat.length} 条消息注入按钮`);
}

function injectMessageButtons(messageId) {
  const mesEl = $(`.mes[mesid="${messageId}"]`);
  if (mesEl.length === 0 || mesEl.find('.bb-msg-btns').length > 0) return;
  const btnHtml = `<span class="bb-msg-btns"><span class="bb-btn-star" title="🌟 收藏语录" data-mid="${messageId}">🌟</span><span class="bb-btn-butterfly" title="🦋 平行宇宙" data-mid="${messageId}">🦋</span></span>`;
  const targets = [mesEl.find('.extraMesButtons'), mesEl.find('.mes_buttons'), mesEl.find('.mes_block'), mesEl];
  for (const target of targets) {
    if (target.length > 0) { target.first().append(btnHtml); break; }
  }
  mesEl.find('.bb-btn-star').off('click').on('click', function () { collectMessage($(this).data('mid')); });
  mesEl.find('.bb-btn-butterfly').off('click').on('click', function () { openBfWin($(this).data('mid')); });
}

function collectMessage(messageId) {
  const ctx = getContext(); const msg = ctx.chat[messageId];
  if (!msg) { toastr.error('未找到消息'); return; }
  if (pluginData.records_bone.some(r => r.messageId === messageId)) { toastr.info('已收藏过该条语录'); return; }
  pluginData.records_bone.push({ messageId, character: msg.name || (msg.is_user ? ctx.name1 : ctx.name2), text: msg.mes, timestamp: new Date().toLocaleString('zh-CN'), isUser: msg.is_user });
  saveChatData(); renderScrapbook(); toastr.success(`🌟 已收藏 #${messageId}`); checkAchievements();
}

//──宏注册（通过事件监听实现宏替换） ──

function registerAllMacros() {
  // 在SillyTavern标准扩展环境中，registerMacroLike 和 MacrosParser 均不可用
  // 使用 eventSource 事件监听方式，在AI生成前替换宏文本
  
  try {
    // 方式1: 通过 GENERATE_AFTER_COMBINE_PROMPTS 事件替换 prompt 中的宏
    if (eventSource && event_types.GENERATE_AFTER_COMBINE_PROMPTS) {
      eventSource.on(event_types.GENERATE_AFTER_COMBINE_PROMPTS, (data) => {
        if (!data || !data.prompt || !pluginData) return;
        data.prompt = replaceBBMacros(data.prompt);});
      console.log('[骨与血]📝 宏替换已通过 GENERATE_AFTER_COMBINE_PROMPTS 事件注册');
    }
    
    // 方式2: 通过 CHAT_COMPLETION_PROMPT_READY 事件替换 chat messages中的宏
    if (eventSource && event_types.CHAT_COMPLETION_PROMPT_READY) {
      eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, (eventData) => {
        if (!eventData || !eventData.chat || !pluginData) return;
        eventData.chat.forEach(msg => {
          if (msg.content && typeof msg.content === 'string') {
            msg.content = replaceBBMacros(msg.content);
          }
        });
      });
      console.log('[骨与血] 📝 宏替换已通过 CHAT_COMPLETION_PROMPT_READY 事件注册');
    }
    
    // 方式3: 通过 GENERATE_AFTER_DATA事件替换（覆盖更多场景）
    if (eventSource && event_types.GENERATE_AFTER_DATA) {
      eventSource.on(event_types.GENERATE_AFTER_DATA, (generateData) => {
        if (!generateData || !generateData.prompt || !pluginData) return;
        if (Array.isArray(generateData.prompt)) {
          generateData.prompt.forEach(msg => {
            if (msg.content && typeof msg.content === 'string') {
              msg.content = replaceBBMacros(msg.content);
            }
          });
        }
      });
      console.log('[骨与血] 📝 宏替换已通过 GENERATE_AFTER_DATA 事件注册');
    }
    
    if (!eventSource) {
      console.warn('[骨与血] ⚠️ eventSource 不可用，宏替换未注册');
    }
  } catch (e) {
    console.error('[骨与血] 宏注册失败:', e);
  }
}

/**
 * 替换文本中的所有骨与血宏
 * @param {string} text - 要替换的文本
 * @returns {string} 替换后的文本
 */
function replaceBBMacros(text) {
  if (!text || typeof text !== 'string' || !pluginData) return text;
  
  // 检查是否包含任何 bb_宏，避免无谓的替换操作
  if (!text.includes('{{bb_')) return text;
  
  // {{bb_diary}} — 最新日记
  text = text.replace(/\{\{bb_diary\}\}/gi, () => {
    if (!pluginData.diary_blood || pluginData.diary_blood.length === 0) return '(暂无日记)';
    return pluginData.diary_blood[pluginData.diary_blood.length - 1].content;
  });
  
  // {{bb_summary}} — 最新总结
  text = text.replace(/\{\{bb_summary\}\}/gi, () => {
    if (!pluginData.summaries || pluginData.summaries.length === 0) return '(暂无总结)';
    return pluginData.summaries[pluginData.summaries.length - 1].content;
  });
  
  // {{bb_weather}} — 环境
  text = text.replace(/\{\{bb_weather\}\}/gi, () => {
    return pluginData.weather || '(环境未知)';
  });
  
  // {{bb_vibe}} — 氛围
  text = text.replace(/\{\{bb_vibe\}\}/gi, () => {
    return pluginData.vibe || '(氛围未知)';
  });
  
  // {{bb_chaos_event}} — 命运事件（一次性，读取后清空）
  text = text.replace(/\{\{bb_chaos_event\}\}/gi, () => {
    const evt = pluginData.chaos_event;
    if (!evt) return '(无事件)';
    pluginData.chaos_event = '';
    saveChatData();
    return evt;
  });
  
  // {{bb_npc_status}} — 所有NPC状态
  text = text.replace(/\{\{bb_npc_status\}\}/gi, () => {
    const names = Object.keys(pluginData.npc_status || {});
    if (names.length === 0) return '(无NPC追踪)';
    return names.map(n => `【${n}】${pluginData.npc_status[n].description || '未知'}`).join('\n');
  });
  
  // {{bb_npc:角色名}} — 指定NPC状态
  text = text.replace(/\{\{bb_npc:(.+?)\}\}/gi, (match, npcName) => {
    const info = (pluginData.npc_status || {})[npcName.trim()];
    if (!info) return `(未追踪NPC: ${npcName.trim()})`;
    return info.description || '未知';
  });
  
  // {{bb_records_count}} — 语录数量
  text = text.replace(/\{\{bb_records_count\}\}/gi, () => {
    return String(pluginData.records_bone?.length || 0);
  });
  
  // {{bb_diary_count}} — 日记数量
  text = text.replace(/\{\{bb_diary_count\}\}/gi, () => {
    return String(pluginData.diary_blood?.length || 0);
  });
  
  // {{bb_world_feed}} — 最近3条世界频段
  text = text.replace(/\{\{bb_world_feed\}\}/gi, () => {
    if (!pluginData.world_feed || pluginData.world_feed.length === 0) return '(暂无世界频段消息)';
    return pluginData.world_feed.slice(-3).map(f => f.content).join('\n');
  });
    // {{bb_facts}} — 记忆琥珀事实摘要
  text = text.replace(/\{\{bb_facts\}\}/gi, () => {
    if (typeof generateFactsMacro === 'function') {
      return generateFactsMacro() || '(暂无事实记录)';
    }
    return '(记忆琥珀未加载)';
  });

  // {{bb_facts:角色名}} — 指定角色的事实
  text = text.replace(/\{\{bb_facts:([^:}]+)\}\}/gi, (match, charName) => {
    if (typeof generateFactsMacro === 'function') {
      return generateFactsMacro(charName.trim()) || `(暂无${charName.trim()}的事实)`;
    }
    return '(记忆琥珀未加载)';
  });

  // {{bb_facts:category:xxx}} — 指定分类的事实
  text = text.replace(/\{\{bb_facts:category:([^}]+)\}\}/gi, (match, cat) => {
    if (typeof generateFactsMacro === 'function') {
      return generateFactsMacro(null, { category: cat.trim() }) || `(暂无${cat.trim()}分类事实)`;
    }
    return '(记忆琥珀未加载)';
  });
    // {{bb_chronicle}} — 最近编年史事件摘要
  text = text.replace(/\{\{bb_chronicle\}\}/gi, () => {
    if (typeof generateChronicleMacro === 'function') {
      return generateChronicleMacro() || '(暂无编年史事件)';
    }
    return '(编年史未加载)';
  });
  return text;
}

//── 动态CSS注入 ──

function injectDynamicCSS() {
  if ($('#bb-dynamic-style').length > 0) return;
  
  const styleContent = `
    @keyframes bb-scroll {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    @keyframes bb-float-pulse {
      0%, 100% { box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 0 0 rgba(102,126,234,0.5); }
      50% { box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 0 12px rgba(102,126,234,0); }
    }
    
    .bb-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 700;
      line-height: 16px;
      text-align: center;
      color: #fff;
      pointer-events: none;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      z-index: 2;
    }
    .bb-badge-error {
      background: #e74c3c;
    }
    .bb-badge-notif {
      background: linear-gradient(135deg, var(--bb-primary-dark), var(--bb-accent-dark));
    }
    .bb-notif-unread {
      font-weight: 500;
    }
    .bb-tab-btn {
      position: relative;
    }
  `;
  
  const styleEl = document.createElement('style');
  styleEl.id = 'bb-dynamic-style';
  styleEl.textContent = styleContent;
  document.head.appendChild(styleEl);
}


// ══════════════════════════════════════
// 主初始化函数
// ══════════════════════════════════════

jQuery(async () => {
  console.log('[BB]骨与血 v6.1initializing...');

  // 1. 初始化默认设置
  if (!extension_settings[EXTENSION_NAME]) {
    extension_settings[EXTENSION_NAME] = {};
  }
  const s = extension_settings[EXTENSION_NAME];
  Object.keys(DEFAULT_SETTINGS).forEach(k => {
    if (s[k] === undefined) s[k] = JSON.parse(JSON.stringify(DEFAULT_SETTINGS[k]));
  });
  saveSettingsDebounced();

  // 2. 初始化运行时数据
  pluginData = createDefaultPluginData();

  // 3. 注入动态CSS
  injectDynamicCSS();

  // 4. 加载设置面板HTML
  await loadSettingsHTML();

  // 5. 绑定设置面板事件
  bindSettingsPanelEvents();

  // 6. 注入悬浮UI
  injectFloatingUI();

  // 7. 加载当前聊天数据
  const ctx = getContext();
  if (ctx.chatId) { loadChatData(); }

  // 8. 构建主面板内容
  buildAndBindMainPanel();

  // 9. 注入蝴蝶窗口
  injectButterflyWindow();

  // 10. 注入OOC窗口
  injectOOCWindow();

  // 11. 应用风格预设 & 主题
  restoreSettings();

  // 12. 注册事件监听
  registerEventListeners();

  // 13. 注册宏
  registerAllMacros();

  // 14. 为已有消息注入按钮
  setTimeout(() => injectButtonsToExistingMessages(), 1000);

  // 15. 启动世界频段
  startWorldFeed();

  // 15.5初始化记忆琥珀系统
  if (typeof initMemoryAmber === 'function') {
    initMemoryAmber();
  }


  // 16. 检查成就
  checkAchievements();

  // 17. 确保弹窗初始隐藏
  $('#bb-main-panel').css('display', 'none');
  $('#bb-ooc-win').addClass('bb-hidden');
  $('#bb-bf-win').addClass('bb-hidden');

  // 第18步：初始化记忆琥珀系统
  initMemoryAmber();
  
  console.log(`[骨与血] v${VERSION} 全部初始化完成（含记忆琥珀）`);

  // 19. 移动端确保悬浮球可见
  if (window.innerWidth <= 768) {
    const s = extension_settings[EXTENSION_NAME];
    if (s.enabled) {
      createMobileFloatingButton();
    }
    console.log('[BB] 移动端模式已激活, 视口宽度:', window.innerWidth);
  }

  console.log('[BB] 骨与血 v7.1 initialized ✓');
});

// ═══════════════ 区块 O结束 ═══════════════
// ═══════════════════════════════════════════
// 【区块 U】记忆琥珀系统 - Memory Amber
// ═══════════════════════════════════════════

// ────────────────────────────────────────────
// U1. 数据管理
// ────────────────────────────────────────────

/**
 * 获取当前角色的所有事实
 */
function getAmberFacts(characterName = null) {
  const cn = characterName || getCurrentCharacterName();
  if (!cn) return [];
  
  const chatData = getChatData();
  if (!chatData.amber_facts) chatData.amber_facts = {};
  if (!chatData.amber_facts[cn]) chatData.amber_facts[cn] = [];
  
  return chatData.amber_facts[cn];
}

/**
 * 保存事实到当前角色
 */
function saveAmberFacts(facts, characterName = null) {
  const cn = characterName || getCurrentCharacterName();
  if (!cn) return;
  
  const chatData = getChatData();
  if (!chatData.amber_facts) chatData.amber_facts = {};
  chatData.amber_facts[cn] = facts;
  
  saveChatData();
  renderAmberFacts();
  updateAmberStats();
}

/**
 * 添加单个事实
 */
function addAmberFact(fact, characterName = null) {
  const facts = getAmberFacts(characterName);
  
  // 生成ID
  fact.id = fact.id || generateId();
  fact.timestamp = fact.timestamp || new Date().toISOString();
  fact.lastUpdated = fact.lastUpdated || fact.timestamp;
  fact.status = fact.status || 'active';
  fact.references = fact.references || 0;
  fact.confidence = fact.confidence || 0.8;
  fact.conflictWith = fact.conflictWith || [];
  fact.tags = fact.tags || [];
  
  facts.push(fact);
  saveAmberFacts(facts, characterName);
  
  bbNotify('amber', '新事实已添加', fact.content.substring(0, 50));
  playNotificationSound('success');
}

/**
 * 更新事实
 */
function updateAmberFact(factId, updates, characterName = null) {
  const facts = getAmberFacts(characterName);
  const idx = facts.findIndex(f => f.id === factId);
  
  if (idx === -1) return false;
  
  facts[idx] = { ...facts[idx], ...updates, lastUpdated: new Date().toISOString() };
  saveAmberFacts(facts, characterName);
  
  return true;
}

/**
 * 删除事实
 */
function deleteAmberFact(factId, characterName = null) {
  const facts = getAmberFacts(characterName);
  const filtered = facts.filter(f => f.id !== factId);
  
  saveAmberFacts(filtered, characterName);
  toastr.success('事实已删除');
}

/**
 * 标记事实为过时
 */
function markAmberFactOutdated(factId, characterName = null) {
  updateAmberFact(factId, { status: 'outdated' }, characterName);
  toastr.info('事实已标记为过时');
}

/**
 * 增加事实引用次数
 */
function incrementAmberFactReference(factId, characterName = null) {
  const facts = getAmberFacts(characterName);
  const fact = facts.find(f => f.id === factId);
  
  if (fact) {
    fact.references = (fact.references || 0) + 1;
    fact.lastUpdated = new Date().toISOString();
    saveAmberFacts(facts, characterName);
  }
}

// ────────────────────────────────────────────
// U2. 优先级计算
// ────────────────────────────────────────────

/**
 * 计算事实优先级
 * 综合考虑：分类权重 + 置信度 + 引用次数 + 新鲜度
 */
function calculateFactPriority(fact) {
  const s = extension_settings[EXTENSION_NAME];
  
  // 分类权重
  const categoryWeight = FACT_CATEGORIES[fact.category]?.weight || 1.0;
  
  // 置信度 (0-1)
  const confidence = fact.confidence || 0.5;
  
  // 引用次数（归一化到0-1）
  const references = fact.references || 0;
  const refScore = Math.min(references / 10, 1.0);
  
  // 新鲜度（最近30天内的事实得分更高）
  const daysSinceUpdate = (Date.now() - new Date(fact.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
  const freshnessScore = Math.max(0, 1 - daysSinceUpdate / 30);
  
  // 状态惩罚
  let statusPenalty = 1.0;
  if (fact.status === 'outdated') statusPenalty = 0.3;
  if (fact.status === 'conflicted') statusPenalty = 0.5;
  
  // 加权计算
  if (s.memory_amber.priority_algorithm === 'weighted') {
    return (
      categoryWeight * 0.3 +
      confidence * 0.25 +
      refScore * 0.25 +
      freshnessScore * 0.2
    ) * statusPenalty;
  } else {
    // 简单算法
    return (confidence + refScore + freshnessScore) / 3 * statusPenalty;
  }
}

/**
 * 获取排序后的事实（按优先级）
 */
function getSortedAmberFacts(characterName = null, limit = null) {
  const facts = getAmberFacts(characterName);
  
  // 计算优先级
  const factsWithPriority = facts.map(f => ({
    ...f,
    priority: calculateFactPriority(f),
  }));
  
  // 排序
  factsWithPriority.sort((a, b) => b.priority - a.priority);
  
  // 限制数量
  if (limit) return factsWithPriority.slice(0, limit);
  
  return factsWithPriority;
}

// ────────────────────────────────────────────
// U3. 自动提取引擎
// ────────────────────────────────────────────

/**
 * 从最近对话中提取事实
 */
async function extractFactsFromChat() {
  const s = extension_settings[EXTENSION_NAME];
  if (!s.memory_amber.enabled || amberExtracting) return;
  
  const cn = getCurrentCharacterName();
  if (!cn) {
    toastr.warning('请先选择角色');
    return;
  }
  
  amberExtracting = true;
  toastr.info('🔍 正在分析对话，提取关键事实...');
  
  try {
    // 获取最近30条消息
    const messages = getRecentMessages(30);
    if (messages.length < 5) {
      toastr.warning('对话内容太少，无法提取事实');
      amberExtracting = false;
      return;
    }
    
    // 构建提示词
    const prompt = buildFactExtractionPrompt(messages, cn);
    
    // 调用副API
    const result = await callSubAPI(prompt, 'fact_extraction', 1500);
    
    if (!result) {
      amberExtracting = false;
      return;
    }
    
    // 解析结果
    const extractedFacts = parseExtractedFacts(result, cn);
    
    if (extractedFacts.length === 0) {
      toastr.info('未发现新的关键事实');
      amberExtracting = false;
      return;
    }
    
    // 添加到待确认列表
    amberPendingFacts = extractedFacts;
    renderAmberPendingFacts();
    
    toastr.success(`✅ 提取到 ${extractedFacts.length} 条事实，请确认`);
    bbNotify('amber', `提取到 ${extractedFacts.length} 条新事实`, '请在记忆琥珀中确认');
    playNotificationSound('success');
    
  } catch (err) {
    console.error('[记忆琥珀] 提取失败:', err);
    bbLogError('记忆琥珀', '事实提取失败', err.message);
    toastr.error('事实提取失败');
  } finally {
    amberExtracting = false;
  }
}

/**
 * 构建事实提取提示词
 */
function buildFactExtractionPrompt(messages, characterName) {
  const s = extension_settings[EXTENSION_NAME];
  const preset = getCurrentPromptPreset();
  
  // 对话内容
  const chatContext = messages.map(m => `${m.name}: ${m.mes}`).join('\n');
  
  // 分类说明
  const categoryDesc = Object.entries(FACT_CATEGORIES)
    .map(([key, val]) => `- ${key}: ${val.name}`)
    .join('\n');
  
  const systemPrompt = `你是一个专业的记忆分析助手，负责从对话中提取关于角色"${characterName}"的关键事实。

## 任务要求
1. 仔细阅读对话内容
2. 提取关于"${characterName}"的重要事实信息
3. 每条事实必须：
   - 明确、具体、可验证
   - 包含足够的上下文
   - 避免主观臆测
   - 不要重复已知信息

## 事实分类
${categoryDesc}

## 输出格式（JSON数组）
[
  {
    "category": "分类key",
    "content": "事实内容（一句话，清晰明确）",
    "confidence": 0.9,
    "source": "来源消息摘要",
    "tags": ["标签1", "标签2"]
  }
]

## 对话内容
${chatContext}

请提取3-8条最重要的事实，以JSON数组格式输出。`;

  return systemPrompt;
}

/**
 * 解析提取的事实
 */
function parseExtractedFacts(apiResponse, characterName) {
  try {
    // 尝试提取JSON
    let jsonStr = apiResponse.trim();
    
    // 移除markdown代码块标记
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // 尝试解析
    const parsed = JSON.parse(jsonStr);
    
    if (!Array.isArray(parsed)) {
      console.warn('[记忆琥珀] API返回的不是数组');
      return [];
    }
    
    // 转换为标准格式
    return parsed.map(item => ({
      id: generateId(),
      character: characterName,
      category: item.category || 'custom',
      content: item.content || '',
      confidence: parseFloat(item.confidence) || 0.7,
      source: item.source || '自动提取',
      tags: Array.isArray(item.tags) ? item.tags : [],
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'active',
      references: 0,
      conflictWith: [],
    })).filter(f => f.content.trim().length > 0);
    
  } catch (err) {
    console.error('[记忆琥珀] 解析失败:', err);
    bbLogError('记忆琥珀', 'JSON解析失败', apiResponse);
    return [];
  }
}

// ────────────────────────────────────────────
// U4. 冲突检测
// ────────────────────────────────────────────

/**
 * 检测事实冲突
 */
function detectFactConflicts(characterName = null) {
  const s = extension_settings[EXTENSION_NAME];
  if (!s.memory_amber.conflict_detection) return;
  
  const facts = getAmberFacts(characterName);
  const threshold = s.memory_amber.conflict_threshold;
  
  // 清除旧的冲突标记
  facts.forEach(f => f.conflictWith = []);
  
  // 两两比较（仅比较同分类）
  for (let i = 0; i < facts.length; i++) {
    for (let j = i + 1; j < facts.length; j++) {
      const f1 = facts[i];
      const f2 = facts[j];
      
      // 仅比较同分类
      if (f1.category !== f2.category) continue;
      
      // 计算相似度
      const similarity = calculateTextSimilarity(f1.content, f2.content);
      
      // 如果相似度高但内容不完全一致，可能是冲突
      if (similarity > threshold && f1.content !== f2.content) {
        // 检查是否语义矛盾
        if (isSemanticConflict(f1.content, f2.content)) {
          f1.conflictWith.push(f2.id);
          f2.conflictWith.push(f1.id);
          f1.status = 'conflicted';
          f2.status = 'conflicted';
        }
      }
    }
  }
  
  saveAmberFacts(facts, characterName);
}

/**
 * 计算文本相似度（简单版：Jaccard相似度）
 */
function calculateTextSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * 判断是否语义冲突（简单版：关键词否定检测）
 */
function isSemanticConflict(text1, text2) {
  const negations = ['不', '没', '非', '无', '否', '未', '别', 'not', 'no', 'never', 'neither'];
  
  // 检查是否一个包含否定词而另一个不包含
  const hasNeg1 = negations.some(neg => text1.includes(neg));
  const hasNeg2 = negations.some(neg => text2.includes(neg));
  
  return hasNeg1 !== hasNeg2;
}

/**
 * AI辅助解决冲突（手动触发）
 */
async function resolveFactConflictWithAI(factId1, factId2, characterName = null) {
  const facts = getAmberFacts(characterName);
  const f1 = facts.find(f => f.id === factId1);
  const f2 = facts.find(f => f.id === factId2);
  
  if (!f1 || !f2) {
    toastr.error('事实不存在');
    return;
  }
  
  toastr.info('🤖 AI正在分析冲突...');
  
  try {
    const prompt = `你是一个逻辑分析助手。以下两条关于"${characterName}"的事实存在冲突，请分析并给出建议。

事实1: ${f1.content}
来源: ${f1.source}
时间: ${new Date(f1.timestamp).toLocaleString()}

事实2: ${f2.content}
来源: ${f2.source}
时间: ${new Date(f2.timestamp).toLocaleString()}

请分析：
1. 这两条事实是否真的冲突？
2. 如果冲突，哪一条更可信？为什么？
3. 是否可以合并或修正？

以JSON格式输出：
{
  "is_conflict": true/false,
  "recommended_action": "keep_fact1" | "keep_fact2" | "merge" | "keep_both",
  "reason": "原因说明",
  "merged_content": "如果选择merge，这里是合并后的内容"
}`;

    const result = await callSubAPI(prompt, 'conflict_resolution', 800);
    
    if (!result) return;
    
    // 解析结果
    let jsonStr = result.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const analysis = JSON.parse(jsonStr);
    
    // 显示结果给用户
    showConflictResolutionModal(f1, f2, analysis);
    
  } catch (err) {
    console.error('[记忆琥珀] AI冲突解决失败:', err);
    bbLogError('记忆琥珀', 'AI冲突解决失败', err.message);
    toastr.error('AI分析失败');
  }
}

// ────────────────────────────────────────────
// U5. 渲染函数
// ────────────────────────────────────────────

/**
 * 渲染事实列表
 */
function renderAmberFacts() {
  const $list = $('#bb-amber-fact-list');
  if ($list.length === 0) return;
  
  const cn = getCurrentCharacterName();
  if (!cn) {
    $list.html('<div class="bb-empty">请先选择角色</div>');
    return;
  }
  
  // 获取筛选条件
  const filterChar = $('#bb-amber-filter-character').val();
  const filterCat = $('#bb-amber-filter-category').val();
  const filterStatus = $('#bb-amber-filter-status').val();
  const searchText = $('#bb-amber-search').val().toLowerCase();
  
    // 获取事实
  let facts = getSortedAmberFacts(filterChar === 'all' ? cn : filterChar);
  
  // 应用筛选
  if (filterCat !== 'all') {
    facts = facts.filter(f => f.category === filterCat);
  }
  if (filterStatus !== 'all') {
    facts = facts.filter(f => f.status === filterStatus);
  }
  if (searchText) {
    facts = facts.filter(f => 
      f.content.toLowerCase().includes(searchText) ||
      f.tags.some(t => t.toLowerCase().includes(searchText))
    );
  }
  
  $list.empty();
  
  if (facts.length === 0) {
    $list.html('<div class="bb-empty">暂无符合条件的事实</div>');
    return;
  }
  
  // 渲染每条事实
  facts.forEach(fact => {
    const cat = FACT_CATEGORIES[fact.category] || FACT_CATEGORIES.custom;
    const status = FACT_STATUS[fact.status] || FACT_STATUS.active;
    const s = extension_settings[EXTENSION_NAME];
    
    // 冲突标记
    const conflictBadge = fact.conflictWith.length > 0 
      ? `<span class="bb-badge bb-badge-error" title="与${fact.conflictWith.length}条事实冲突">⚠️ 冲突</span>` 
      : '';
    
    // 置信度显示
    const confidenceBar = s.memory_amber.show_confidence 
      ? `<div class="bb-amber-confidence-bar">
           <div class="bb-amber-confidence-fill" style="width:${fact.confidence * 100}%"></div>
         </div>
         <span class="bb-text-xs bb-text-muted">置信度: ${(fact.confidence * 100).toFixed(0)}%</span>`
      : '';
    
    // 引用次数
    const refCount = s.memory_amber.show_references && fact.references > 0
      ? `<span class="bb-text-xs bb-text-muted">📌 引用 ${fact.references} 次</span>`
      : '';
    
    // 标签
    const tagsHtml = fact.tags.length > 0
      ? fact.tags.map(tag => `<span class="bb-amber-tag">${esc(tag)}</span>`).join('')
      : '';
    
    $list.append(`
      <div class="bb-amber-fact-card" data-fact-id="${fact.id}" style="border-left: 3px solid ${cat.color};">
        <div class="bb-amber-fact-header">
          <span class="bb-amber-category" style="color:${cat.color};">
            ${cat.icon} ${cat.name}
          </span>
          <div class="bb-amber-fact-actions">
            ${conflictBadge}
            <span class="bb-amber-status" style="color:${status.color};">${status.name}</span>
            <button class="bb-amber-fact-btn" data-action="edit" title="编辑">✏️</button>
            <button class="bb-amber-fact-btn" data-action="outdated" title="标记过时">⏳</button>
            <button class="bb-amber-fact-btn" data-action="delete" title="删除">🗑️</button>
          </div>
        </div>
        
        <div class="bb-amber-fact-content">
          ${esc(fact.content)}
        </div>
        
        <div class="bb-amber-fact-meta">
          <span class="bb-text-xs bb-text-dim">来源: ${esc(fact.source)}</span>
          <span class="bb-text-xs bb-text-dim">更新: ${new Date(fact.lastUpdated).toLocaleString('zh-CN')}</span>
          ${refCount}
        </div>
        
        ${confidenceBar}
        
        ${tagsHtml ? `<div class="bb-amber-tags">${tagsHtml}</div>` : ''}
        
        ${fact.conflictWith.length > 0 ? `
          <div class="bb-amber-conflict-notice">
            ⚠️ 此事实与 ${fact.conflictWith.length} 条事实存在冲突
            <button class="bb-sm-btn bb-btn-xs" data-action="resolve-conflict">🤖 AI解决</button>
          </div>
        ` : ''}
      </div>
    `);
  });
  
  // 绑定事件
  bindAmberFactCardEvents();
}

/**
 * 渲染待确认事实
 */
function renderAmberPendingFacts() {
  const $panel = $('#bb-amber-pending-panel');
  const $list = $('#bb-amber-pending-list');
  const $count = $('#bb-amber-pending-count');
  
  if (amberPendingFacts.length === 0) {
    $panel.addClass('bb-hidden');
    return;
  }
  
  $panel.removeClass('bb-hidden');
  $count.text(amberPendingFacts.length);
  $list.empty();
  
  amberPendingFacts.forEach((fact, idx) => {
    const cat = FACT_CATEGORIES[fact.category] || FACT_CATEGORIES.custom;
    
    $list.append(`
      <div class="bb-amber-pending-card" data-pending-idx="${idx}">
        <div class="bb-amber-pending-header">
          <span style="color:${cat.color};">${cat.icon} ${cat.name}</span>
          <span class="bb-text-xs bb-text-muted">置信度: ${(fact.confidence * 100).toFixed(0)}%</span>
        </div>
        <div class="bb-amber-pending-content">
          ${esc(fact.content)}
        </div>
        <div class="bb-amber-pending-meta">
          <span class="bb-text-xs bb-text-dim">来源: ${esc(fact.source)}</span>
        </div>
        <div class="bb-amber-pending-actions">
          <button class="bb-sm-btn bb-btn-success bb-btn-xs" data-action="confirm">✅ 确认</button>
          <button class="bb-sm-btn bb-btn-xs" data-action="edit">✏️ 编辑</button>
          <button class="bb-sm-btn bb-btn-error bb-btn-xs" data-action="reject">❌ 拒绝</button>
        </div>
      </div>
    `);
  });
  
  // 绑定事件
  bindAmberPendingEvents();
}

/**
 * 更新统计信息
 */
function updateAmberStats() {
  const facts = getAmberFacts();
  
  const total = facts.length;
  const active = facts.filter(f => f.status === 'active').length;
  const conflicted = facts.filter(f => f.status === 'conflicted').length;
  const outdated = facts.filter(f => f.status === 'outdated').length;
  
  $('#bb-amber-stat-total').text(`总计: ${total}`);
  $('#bb-amber-stat-active').text(`活跃: ${active}`);
  $('#bb-amber-stat-conflicted').text(`冲突: ${conflicted}`);
  $('#bb-amber-stat-outdated').text(`过时: ${outdated}`);
}

/**
 * 刷新角色筛选下拉框
 */
function refreshAmberCharacterFilter() {
  const $select = $('#bb-amber-filter-character');
  const chatData = getChatData();
  
  if (!chatData.amber_facts) return;
  
  const characters = Object.keys(chatData.amber_facts);
  
  $select.empty();
  $select.append('<option value="all">全部角色</option>');
  
  characters.forEach(char => {
    $select.append(`<option value="${esc(char)}">${esc(char)}</option>`);
  });
  
  // 默认选中当前角色
  const cn = getCurrentCharacterName();
  if (cn && characters.includes(cn)) {
    $select.val(cn);
  }
}

/**
 * 刷新分类筛选下拉框
 */
function refreshAmberCategoryFilter() {
  const $select = $('#bb-amber-filter-category');
  
  $select.empty();
  $select.append('<option value="all">全部分类</option>');
  
  Object.entries(FACT_CATEGORIES).forEach(([key, val]) => {
    $select.append(`<option value="${key}">${val.icon} ${val.name}</option>`);
  });
}

// ────────────────────────────────────────────
// U6. 事件绑定
// ────────────────────────────────────────────

/**
 * 绑定记忆琥珀主面板事件
 */
function bindAmberPanelEvents() {
  const panel = '#bb-main-panel';
  
  // 立即提取事实
  $(panel).off('click.amberextract').on('click.amberextract', '#bb-amber-extract-now', () => {
    extractFactsFromChat();
  });
  
  // 手动添加事实
  $(panel).off('click.amberadd').on('click.amberadd', '#bb-amber-add-manual', () => {
    showAmberFactEditModal();
  });
  
  // 导出
  $(panel).off('click.amberexport').on('click.amberexport', '#bb-amber-export', () => {
    exportAmberFacts();
  });
  
  // 导入
  $(panel).off('click.amberimport').on('click.amberimport', '#bb-amber-import', () => {
    importAmberFacts();
  });
  
  // 设置
  $(panel).off('click.ambersettings').on('click.ambersettings', '#bb-amber-settings', () => {
    toastr.info('请在插件设置中配置记忆琥珀');
    // 可以跳转到settings页面
  });
  
  // 筛选变化
  $(panel).off('change.amberfilter').on('change.amberfilter', '#bb-amber-filter-character, #bb-amber-filter-category, #bb-amber-filter-status', () => {
    renderAmberFacts();
  });
  
  // 搜索
  $(panel).off('input.ambersearch').on('input.ambersearch', '#bb-amber-search', debounce(() => {
    renderAmberFacts();
  }, 300));
  
  // 待确认面板 - 全部确认
  $(panel).off('click.amberconfirmall').on('click.amberconfirmall', '#bb-amber-confirm-all', () => {
    if (amberPendingFacts.length === 0) return;
    
    amberPendingFacts.forEach(fact => {
      addAmberFact(fact);
    });
    
    amberPendingFacts = [];
    renderAmberPendingFacts();
    
    toastr.success('所有事实已确认');
    
    // 检测冲突
    detectFactConflicts();
  });
  
  // 待确认面板 - 全部拒绝
  $(panel).off('click.amberrejectall').on('click.amberrejectall', '#bb-amber-reject-all', () => {
    if (!confirm('确认拒绝所有待确认事实？')) return;
    
    amberPendingFacts = [];
    renderAmberPendingFacts();
    
    toastr.info('已拒绝所有待确认事实');
  });
}

/**
 * 绑定事实卡片事件
 */
function bindAmberFactCardEvents() {
  $('.bb-amber-fact-card').off('click.factaction').on('click.factaction', '.bb-amber-fact-btn', function() {
    const action = $(this).data('action');
    const factId = $(this).closest('.bb-amber-fact-card').data('fact-id');
    
    switch (action) {
      case 'edit':
        showAmberFactEditModal(factId);
        break;
      case 'outdated':
        markAmberFactOutdated(factId);
        break;
      case 'delete':
        if (confirm('确认删除此事实？')) {
          deleteAmberFact(factId);
        }
        break;
    }
  });
  
  // 解决冲突
  $('.bb-amber-fact-card').off('click.resolveconflict').on('click.resolveconflict', '[data-action="resolve-conflict"]', function() {
    const factId = $(this).closest('.bb-amber-fact-card').data('fact-id');
    const facts = getAmberFacts();
    const fact = facts.find(f => f.id === factId);
    
    if (fact && fact.conflictWith.length > 0) {
      // 简化：只解决第一个冲突
      resolveFactConflictWithAI(factId, fact.conflictWith[0]);
    }
  });
}

/**
 * 绑定待确认事实事件
 */
function bindAmberPendingEvents() {
  $('.bb-amber-pending-card').off('click.pendingaction').on('click.pendingaction', '.bb-amber-pending-actions button', function() {
    const action = $(this).data('action');
    const idx = $(this).closest('.bb-amber-pending-card').data('pending-idx');
    const fact = amberPendingFacts[idx];
    
    if (!fact) return;
    
    switch (action) {
      case 'confirm':
        addAmberFact(fact);
        amberPendingFacts.splice(idx, 1);
        renderAmberPendingFacts();
        detectFactConflicts();
        break;
        
      case 'edit':
        showAmberPendingEditModal(idx);
        break;
        
      case 'reject':
        amberPendingFacts.splice(idx, 1);
        renderAmberPendingFacts();
        toastr.info('已拒绝该事实');
        break;
    }
  });
}

// ────────────────────────────────────────────
// U7. 模态框
// ────────────────────────────────────────────

/**
 * 显示事实编辑模态框
 */
function showAmberFactEditModal(factId = null) {
  const cn = getCurrentCharacterName();
  if (!cn) {
    toastr.warning('请先选择角色');
    return;
  }
  
  const isEdit = !!factId;
  let fact = null;
  
  if (isEdit) {
    const facts = getAmberFacts();
    fact = facts.find(f => f.id === factId);
    if (!fact) {
      toastr.error('事实不存在');
      return;
    }
  }
  
  // 分类选项
  const categoryOptions = Object.entries(FACT_CATEGORIES)
    .map(([key, val]) => `<option value="${key}" ${fact && fact.category === key ? 'selected' : ''}>${val.icon} ${val.name}</option>`)
    .join('');
  
  const modalHtml = `
    <div class="bb-modal-overlay" id="bb-amber-edit-modal">
      <div class="bb-modal-content" style="max-width:600px;">
        <div class="bb-modal-header">
          <h3>${isEdit ? '✏️ 编辑事实' : '➕ 添加事实'}</h3>
          <button class="bb-modal-close">✖</button>
        </div>
        <div class="bb-modal-body">
          <div class="bb-form-group">
            <label>分类</label>
            <select id="bb-amber-edit-category" class="bb-input">
              ${categoryOptions}
            </select>
          </div>
          
          <div class="bb-form-group">
            <label>事实内容 *</label>
            <textarea id="bb-amber-edit-content" class="bb-input" rows="4" placeholder="输入事实内容...">${fact ? esc(fact.content) : ''}</textarea>
          </div>
          
          <div class="bb-form-group">
            <label>置信度 (0-1)</label>
            <input type="number" id="bb-amber-edit-confidence" class="bb-input" min="0" max="1" step="0.1" value="${fact ? fact.confidence : 0.8}">
          </div>
          
          <div class="bb-form-group">
            <label>来源</label>
            <input type="text" id="bb-amber-edit-source" class="bb-input" placeholder="例如：第3章对话" value="${fact ? esc(fact.source) : '手动添加'}">
          </div>
          
          <div class="bb-form-group">
            <label>标签（逗号分隔）</label>
            <input type="text" id="bb-amber-edit-tags" class="bb-input" placeholder="例如：重要,核心" value="${fact ? fact.tags.join(', ') : ''}">
          </div>
        </div>
        <div class="bb-modal-footer">
          <button class="bb-btn bb-btn-secondary" id="bb-amber-edit-cancel">取消</button>
          <button class="bb-btn bb-btn-primary" id="bb-amber-edit-save">${isEdit ? '保存' : '添加'}</button>
        </div>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  
  // 绑定事件
  $('#bb-amber-edit-modal .bb-modal-close, #bb-amber-edit-cancel').on('click', () => {
    $('#bb-amber-edit-modal').remove();
  });
  
  $('#bb-amber-edit-save').on('click', () => {
    const content = $('#bb-amber-edit-content').val().trim();
    if (!content) {
      toastr.warning('请输入事实内容');
      return;
    }
    
    const factData = {
      category: $('#bb-amber-edit-category').val(),
      content: content,
      confidence: parseFloat($('#bb-amber-edit-confidence').val()) || 0.8,
      source: $('#bb-amber-edit-source').val().trim() || '手动添加',
      tags: $('#bb-amber-edit-tags').val().split(',').map(t => t.trim()).filter(Boolean),
    };
    
    if (isEdit) {
      updateAmberFact(factId, factData);
      toastr.success('事实已更新');
    } else {
      addAmberFact(factData);
      toastr.success('事实已添加');
    }
    
    $('#bb-amber-edit-modal').remove();
    detectFactConflicts();
  });
}

/**
 * 显示待确认事实编辑模态框
 */
function showAmberPendingEditModal(idx) {
  const fact = amberPendingFacts[idx];
  if (!fact) return;
  
  // 复用编辑模态框逻辑，但保存时更新待确认列表
  const categoryOptions = Object.entries(FACT_CATEGORIES)
    .map(([key, val]) => `<option value="${key}" ${fact.category === key ? 'selected' : ''}>${val.icon} ${val.name}</option>`)
    .join('');
  
  const modalHtml = `
    <div class="bb-modal-overlay" id="bb-amber-pending-edit-modal">
      <div class="bb-modal-content" style="max-width:600px;">
        <div class="bb-modal-header">
          <h3>✏️ 编辑待确认事实</h3>
          <button class="bb-modal-close">✖</button>
        </div>
        <div class="bb-modal-body">
          <div class="bb-form-group">
            <label>分类</label>
            <select id="bb-amber-pending-edit-category" class="bb-input">
              ${categoryOptions}
            </select>
          </div>
          
          <div class="bb-form-group">
            <label>事实内容 *</label>
            <textarea id="bb-amber-pending-edit-content" class="bb-input" rows="4">${esc(fact.content)}</textarea>
          </div>
          
          <div class="bb-form-group">
            <label>置信度 (0-1)</label>
            <input type="number" id="bb-amber-pending-edit-confidence" class="bb-input" min="0" max="1" step="0.1" value="${fact.confidence}">
          </div>
        </div>
        <div class="bb-modal-footer">
          <button class="bb-btn bb-btn-secondary" id="bb-amber-pending-edit-cancel">取消</button>
          <button class="bb-btn bb-btn-primary" id="bb-amber-pending-edit-save">保存</button>
        </div>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  
  $('#bb-amber-pending-edit-modal .bb-modal-close, #bb-amber-pending-edit-cancel').on('click', () => {
    $('#bb-amber-pending-edit-modal').remove();
  });
  
  $('#bb-amber-pending-edit-save').on('click', () => {
    const content = $('#bb-amber-pending-edit-content').val().trim();
    if (!content) {
      toastr.warning('请输入事实内容');
      return;
    }
    
    amberPendingFacts[idx].category = $('#bb-amber-pending-edit-category').val();
    amberPendingFacts[idx].content = content;
    amberPendingFacts[idx].confidence = parseFloat($('#bb-amber-pending-edit-confidence').val()) || 0.8;
    
    renderAmberPendingFacts();
    $('#bb-amber-pending-edit-modal').remove();
    toastr.success('已更新');
  });
}

/**
 * 显示冲突解决模态框
 */
function showConflictResolutionModal(fact1, fact2, analysis) {
  const modalHtml = `
    <div class="bb-modal-overlay" id="bb-amber-conflict-modal">
      <div class="bb-modal-content" style="max-width:700px;">
        <div class="bb-modal-header">
          <h3>🤖 AI冲突分析</h3>
          <button class="bb-modal-close">✖</button>
        </div>
        <div class="bb-modal-body">
          <div class="bb-amber-conflict-comparison">
            <div class="bb-amber-conflict-fact">
              <h4>事实 1</h4>
              <p>${esc(fact1.content)}</p>
              <span class="bb-text-xs bb-text-dim">来源: ${esc(fact1.source)} | ${new Date(fact1.timestamp).toLocaleString('zh-CN')}</span>
            </div>
            
            <div class="bb-amber-conflict-vs">VS</div>
            
            <div class="bb-amber-conflict-fact">
              <h4>事实 2</h4>
              <p>${esc(fact2.content)}</p>
              <span class="bb-text-xs bb-text-dim">来源: ${esc(fact2.source)} | ${new Date(fact2.timestamp).toLocaleString('zh-CN')}</span>
            </div>
          </div>
          
          <div class="bb-amber-conflict-analysis">
            <h4>AI分析结果</h4>
            <p><strong>是否冲突：</strong> ${analysis.is_conflict ? '是' : '否'}</p>
            <p><strong>建议操作：</strong> ${analysis.recommended_action}</p>
            <p><strong>原因：</strong> ${esc(analysis.reason)}</p>
            ${analysis.merged_content ? `<p><strong>合并内容：</strong> ${esc(analysis.merged_content)}</p>` : ''}
          </div>
        </div>
        <div class="bb-modal-footer">
          <button class="bb-btn bb-btn-secondary" data-action="cancel">取消</button>
          <button class="bb-btn" data-action="keep1">保留事实1</button>
          <button class="bb-btn" data-action="keep2">保留事实2</button>
          ${analysis.merged_content ? '<button class="bb-btn bb-btn-primary" data-action="merge">使用合并内容</button>' : ''}
        </div>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  
  $('#bb-amber-conflict-modal .bb-modal-close, [data-action="cancel"]').on('click', () => {
    $('#bb-amber-conflict-modal').remove();
  });
  
  $('#bb-amber-conflict-modal [data-action]').on('click', function() {
    const action = $(this).data('action');
    
    switch (action) {
      case 'keep1':
        markAmberFactOutdated(fact2.id);
        updateAmberFact(fact1.id, { status: 'active', conflictWith: [] });
        toastr.success('已保留事实1');
        break;
        
      case 'keep2':
        markAmberFactOutdated(fact1.id);
        updateAmberFact(fact2.id, { status: 'active', conflictWith: [] });
        toastr.success('已保留事实2');
        break;
        
      case 'merge':
        if (analysis.merged_content) {
          updateAmberFact(fact1.id, { 
            content: analysis.merged_content, 
            status: 'active', 
            conflictWith: [],
            lastUpdated: new Date().toISOString(),
          });
          deleteAmberFact(fact2.id);
          toastr.success('已合并事实');
        }
        break;
    }
    
    $('#bb-amber-conflict-modal').remove();
  });
}

// ────────────────────────────────────────────
// U8. 导出/导入
// ────────────────────────────────────────────

/**
 * 导出事实
 */
function exportAmberFacts() {
  const cn = getCurrentCharacterName();
  if (!cn) {
    toastr.warning('请先选择角色');
    return;
  }
  
  const facts = getAmberFacts();
  
  if (facts.length === 0) {
    toastr.warning('暂无事实可导出');
    return;
  }
  
  const s = extension_settings[EXTENSION_NAME];
  const format = s.memory_amber.export_format;
  
  if (format === 'json') {
    const json = JSON.stringify(facts, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amber_facts_${cn}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toastr.success('已导出JSON文件');
  } else {
    // Markdown格式
    let md = `# 记忆琥珀 - ${cn}\n\n`;
    md += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    
    Object.entries(FACT_CATEGORIES).forEach(([key, val]) => {
      const catFacts = facts.filter(f => f.category === key);
      if (catFacts.length === 0) return;
      
      md += `## ${val.icon} ${val.name}\n\n`;
      catFacts.forEach(f => {
        md += `- **${f.content}**\n`;
        md += `  - 置信度: ${(f.confidence * 100).toFixed(0)}%\n`;
        md += `  - 来源: ${f.source}\n`;
        md += `  - 更新: ${new Date(f.lastUpdated).toLocaleString('zh-CN')}\n`;
        if (f.tags.length > 0) md += `  - 标签: ${f.tags.join(', ')}\n`;
        md += `\n`;
      });
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amber_facts_${cn}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toastr.success('已导出Markdown文件');
  }
}

/**
 * 导入事实
 */
function importAmberFacts() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        if (!Array.isArray(imported)) {
          toastr.error('文件格式错误');
          return;
        }
        
        const cn = getCurrentCharacterName();
        if (!cn) {
          toastr.warning('请先选择角色');
          return;
        }
        
        // 合并导入
        const existing = getAmberFacts();
        const merged = [...existing, ...imported];
        
        saveAmberFacts(merged);
        toastr.success(`已导入 ${imported.length} 条事实`);
        
        detectFactConflicts();
        
      } catch (err) {
        console.error('[记忆琥珀] 导入失败:', err);
        toastr.error('导入失败：文件格式错误');
      }
    };
    
        reader.readAsText(file);
    };
    
    input.click();
}

//────────────────────────────────────────────
// U9.宏注入系统
// ────────────────────────────────────────────

/**
 * 生成 {{bb_facts}} 宏内容
 *按优先级排序，输出最重要的事实摘要
 */
function generateFactsMacro(characterName = null, options = {}) {
  const cn = characterName || getCurrentCharacterName();
  if (!cn) return '';
  
  const s = extension_settings[EXTENSION_NAME];
  if (!s.memory_amber.enabled) return '';
  
  const maxFacts = options.limit || 20;
  const category = options.category || null;
  
  let facts = getSortedAmberFacts(cn, maxFacts);
  
  // 只取活跃状态的事实
  facts = facts.filter(f => f.status === 'active');
  
  // 按分类筛选
  if (category) {
    facts = facts.filter(f => f.category === category);
  }
  
  if (facts.length === 0) return '';
  
  // 按分类分组输出
  const grouped = {};
  facts.forEach(f => {
    const cat = FACT_CATEGORIES[f.category] || FACT_CATEGORIES.custom;
    if (!grouped[f.category]) {
      grouped[f.category] = { name: cat.name, icon: cat.icon, items: [] };
    }
    grouped[f.category].items.push(f.content);
  });
  
  let output = `[关于${cn}的已知事实]\n`;
  
  Object.values(grouped).forEach(group => {
    output += `${group.icon} ${group.name}:\n`;
    group.items.forEach(item => {
      output += `  - ${item}\n`;
    });
  });
  
  return output.trim();
}

/**
 * 注册宏到SillyTavern
 *支持:
 *   {{bb_facts}}                — 当前角色全部事实
 *   {{bb_facts:角色名}}           — 指定角色事实
 *   {{bb_facts:category:xxx}}     — 指定分类事实
 */
function registerAmberMacros() {
  try {
    const context = getContext();
    
    if (typeof context.registerMacro === 'function') {
      // ST 原生宏注册（如果支持）
      context.registerMacro('bb_facts', (args) => {
        if (!args || args.length === 0) {
          return generateFactsMacro();
        }
        
        const arg = args[0];
        
        // {{bb_facts:category:xxx}}
        if (arg.startsWith('category:')) {
          const cat = arg.replace('category:', '');
          return generateFactsMacro(null, { category: cat });
        }
        
        // {{bb_facts:角色名}}
        return generateFactsMacro(arg);
      });
    }
    
    // 备用方案：通过消息预处理注入
    if (eventSource) {
      eventSource.on('chat_message_sent', (data) => {
        if (!data || !data.message) return;
        
        // 替换 {{bb_facts}} 宏
        if (data.message.includes('{{bb_facts}}')) {
          data.message = data.message.replace(/\{\{bb_facts\}\}/g, generateFactsMacro());
        }
        
        // 替换 {{bb_facts:xxx}} 宏
        const macroRegex = /\{\{bb_facts:([^}]+)\}\}/g;
        let match;
        while ((match = macroRegex.exec(data.message)) !== null) {
          const arg = match[1];
          let replacement = '';
          
          if (arg.startsWith('category:')) {
            replacement = generateFactsMacro(null, { category: arg.replace('category:', '') });
          } else {
            replacement = generateFactsMacro(arg);
          }
          
          data.message = data.message.replace(match[0], replacement);
        }
      });
    }
    
    console.log('[记忆琥珀] 宏注册完成');
    
  } catch (err) {
    console.warn('[记忆琥珀] 宏注册失败（不影响核心功能）:', err);
  }
}

// ────────────────────────────────────────────
// U10. 引用追踪
// ────────────────────────────────────────────

/**
 * 扫描新消息，检查是否引用了已知事实
 * 在每条新消息到达时调用
 */
function trackFactReferences(messageText) {
  const s = extension_settings[EXTENSION_NAME];
  if (!s.memory_amber.enabled) return;
  
  const cn = getCurrentCharacterName();
  if (!cn) return;
  
  const facts = getAmberFacts();
  if (facts.length === 0) return;
  
  const textLower = messageText.toLowerCase();
  let updated = false;
  
  facts.forEach(fact => {
    if (fact.status !== 'active') return;
    
    // 提取事实中的关键词（取前3个实词，长度>=2）
    const keywords = extractKeywords(fact.content);
    
    // 如果消息中包含多个关键词，视为引用
    const matchCount = keywords.filter(kw => textLower.includes(kw.toLowerCase())).length;
    
    if (matchCount >= Math.min(2, keywords.length)) {
      fact.references = (fact.references || 0) + 1;
      fact.lastUpdated = new Date().toISOString();
      updated = true;
    }
  });
  
  if (updated) {
    saveAmberFacts(facts);
  }
}

/**
 * 从文本中提取关键词
 */
function extractKeywords(text) {
    // 移除标点符号
  const cleaned = text.replace(/[，。！？、；：""''（）【】《》\-—…,.!?;:'"()\[\]{}<>]/g, ' ');
  
  // 分词（简单版：按空格和常见分隔符拆分）
  const words = cleaned.split(/\s+/).filter(w => w.length >= 2);
  
  // 过滤停用词
  const stopWords = new Set([
    '的', '了', '是', '在', '有', '和', '与', '或', '但', '而', '也', '都', '就',
    '会', '能', '可以', '这', '那', '他', '她', '它', '我', '你', '们', '着', '过',
    '被', '把', '给', '让', '向', '从', '到', '对', '于', '以', '为', '因', '所',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'like',
    'and', 'or', 'but', 'not', 'no', 'if', 'then', 'so', 'than',
    'that', 'this', 'it', 'he', 'she', 'they', 'we', 'you', 'i',]);
  
  return words.filter(w => !stopWords.has(w.toLowerCase())).slice(0, 5);
}

// ────────────────────────────────────────────
// U11. 自动提取钩子
// ────────────────────────────────────────────

/**
 * 将事实提取挂钩到消息计数器
 * 每N条消息自动触发一次提取
 */
function hookFactExtractionToMessageCounter() {
  const s = extension_settings[EXTENSION_NAME];
  if (!s.memory_amber.enabled || !s.memory_amber.auto_extract) return;
  
  if (eventSource) {
    eventSource.on(event_types.MESSAGE_RECEIVED, (data) => {
      amberMessageCounter++;
      
      // 引用追踪
      if (data && data.message) {
        trackFactReferences(data.message);
      }
      
      // 达到触发阈值
      if (amberMessageCounter >= s.memory_amber.extract_interval) {
        amberMessageCounter = 0;
        // 延迟执行，避免阻塞
        setTimeout(() => {
          extractFactsFromChat().then(() => {
            // 自动确认模式
            if (s.memory_amber.auto_confirm && amberPendingFacts.length > 0) {
              amberPendingFacts.forEach(fact => addAmberFact(fact));
              amberPendingFacts = [];
              renderAmberPendingFacts();
              detectFactConflicts();
            }
          });
        }, 2000);
      }
    });
    console.log(`[记忆琥珀] 自动提取已启用，每 ${s.memory_amber.extract_interval} 条消息触发`);
  }
}

// ────────────────────────────────────────────
// U12. 与预设联动— callSubAPI扩展
// ────────────────────────────────────────────

/**
 * 在callSubAPI 的prompt 中自动注入事实上下文
 * 需要在 callSubAPI 函数中调用此函数
 */
function injectAmberContext(prompt) {
  const s = extension_settings[EXTENSION_NAME];
  if (!s.memory_amber.enabled) return prompt;
  
  const factsMacro = generateFactsMacro();
  if (!factsMacro) return prompt;
  
  // 在 prompt 末尾注入事实上下文
  return prompt + '\n\n' + factsMacro;
}

// ────────────────────────────────────────────
// U13. 初始化
// ────────────────────────────────────────────

/**
 * 初始化记忆琥珀系统
 */
function initMemoryAmber() {
  const s = extension_settings[EXTENSION_NAME];
  if (!s.memory_amber) {
    s.memory_amber = {
      enabled: true,
      auto_extract: true,
      extract_interval: 15,
      auto_confirm: false,
      max_facts_per_character: 100,
      priority_algorithm: 'weighted',
      show_confidence: true,
      show_references: true,
      conflict_detection: true,
      conflict_threshold: 0.7,
      multi_character: true,
      export_format: 'json',};
    saveSettingsDebounced();
  }
  
  //刷新筛选器
  refreshAmberCharacterFilter();
  refreshAmberCategoryFilter();
  
  // 渲染
  renderAmberFacts();
  updateAmberStats();
  
  // 绑定事件
  bindAmberPanelEvents();
  
  // 注册宏
  registerAmberMacros();
  
  // 挂钩自动提取
  if (s.memory_amber.enabled && s.memory_amber.auto_extract) {
    hookFactExtractionToMessageCounter();
  }
  
  console.log('[骨与血] 记忆琥珀系统初始化完成');
}

// ═══════════════════════════════════════════
// 【区块U 结束】
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// 【区块 P】时间线编年史系统 - Chronicle
// ═══════════════════════════════════════════

//────────────────────────────────────────────
// P1. 数据管理
// ────────────────────────────────────────────

/**
 * 获取编年史事件列表
 */
function getChronicleEvents() {
  const chatData = getChatData();
  if (!chatData.chronicle_events) chatData.chronicle_events = [];
  return chatData.chronicle_events;
}

/**
 * 获取编年史章节列表
 */
function getChronicleChapters() {
  const chatData = getChatData();
  if (!chatData.chronicle_chapters) chatData.chronicle_chapters = [];
  return chatData.chronicle_chapters;
}

/**
 * 保存编年史数据
 */
function saveChronicleData() {
  saveChatData();
  renderChronicleTimeline();
  updateChronicleStats();
}

/**
 * 添加编年史事件
 */
function addChronicleEvent(event) {
  const events = getChronicleEvents();
  event.id = event.id || generateId();
  event.timestamp = event.timestamp || new Date().toISOString();
  event.category = event.category || 'custom';
  event.importance = event.importance || 3;
  event.characters = event.characters || [];
  event.location = event.location || '';
  event.image = event.image || '';
  event.source = event.source || 'manual';
  event.chapter = event.chapter || '';
  events.push(event);
  
  // 按时间排序
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // 自动分章
  const s = extension_settings[EXTENSION_NAME];
  if (s.chronicle.auto_chapter) {
    autoAssignChapters();
  }
  
  saveChronicleData();
  
  if (typeof bbNotify === 'function') {
    bbNotify('chronicle', '新事件已记录', event.title);
  }
  if (typeof playNotificationSound === 'function') {
    playNotificationSound('success');
  }
  
  return event;
}

/**
 * 更新编年史事件
 */
function updateChronicleEvent(eventId, updates) {
  const events = getChronicleEvents();
  const idx = events.findIndex(e => e.id === eventId);
  if (idx === -1) return false;
  
  events[idx] = { ...events[idx], ...updates };
  saveChronicleData();
  return true;
}

/**
 * 删除编年史事件
 */
function deleteChronicleEvent(eventId) {
  const chatData = getChatData();
  chatData.chronicle_events = (chatData.chronicle_events || []).filter(e => e.id !== eventId);
  saveChronicleData();
  toastr.success('事件已删除');
}

// ────────────────────────────────────────────
// P2. 自动章节分组
// ────────────────────────────────────────────

/**
 * 自动为事件分配章节
 */
function autoAssignChapters() {
  const s = extension_settings[EXTENSION_NAME];
  const events = getChronicleEvents();
  const chapters = getChronicleChapters();
  const threshold = s.chronicle.chapter_threshold || 5;
  
  if (events.length === 0) return;
  
  // 如果没有章节，创建第一个
  if (chapters.length === 0) {
    chapters.push({
      id: generateId(),
      name: '第一章：序幕',
      startIndex: 0,
      timestamp: events[0].timestamp,
    });
  }
  
  // 检查是否需要新章节
  const lastChapter = chapters[chapters.length - 1];
  const eventsInLastChapter = events.filter(e => e.chapter === lastChapter.id || !e.chapter).length;
  
  if (eventsInLastChapter >= threshold) {
    const chapterNum = chapters.length + 1;
    const newChapter = {
      id: generateId(),
      name: `第${chapterNum}章`,
      startIndex: events.length -1,
      timestamp: new Date().toISOString(),
    };
    chapters.push(newChapter);
    
    // 将未分配章节的事件分配到最新章节
    events.forEach(e => {
      if (!e.chapter) e.chapter = lastChapter.id;
    });}
  
  // 确保所有事件都有章节
  const currentChapterId = chapters[chapters.length - 1].id;
  events.forEach(e => {
    if (!e.chapter) e.chapter = currentChapterId;
  });
}

/**
 * 手动重命名章节
 */
function renameChapter(chapterId, newName) {
  const chapters = getChronicleChapters();
  const chapter = chapters.find(c => c.id === chapterId);
  if (chapter) {
    chapter.name = newName;
    saveChronicleData();
    toastr.success('章节已重命名');
  }
}

// ────────────────────────────────────────────
// P3. 自动提取引擎
// ────────────────────────────────────────────

/**
 * 从对话中提取编年史事件
 */
async function extractChronicleFromChat() {
  const s = extension_settings[EXTENSION_NAME];
  if (!s.chronicle.enabled || chronicleExtracting) return;
  
  const cn = getCurrentCharacterName();
  if (!cn) {
    toastr.warning('请先选择角色');
    return;
  }
  
  chronicleExtracting = true;
  toastr.info('⭐ 正在从对话中提取关键事件...');
  
  try {
    const recent = getRecentChat(30);
    if (recent.length < 5) {
      toastr.warning('对话内容太少');
      chronicleExtracting = false;
      return;
    }
    
    const chatContext = recent.map(m => `${m.name}: ${m.mes}`).join('\n');
    const preset = getActivePreset();
    
    const prompt = `你是一个故事编年史记录员。请从以下对话中提取重要的故事事件。

## 事件分类
${Object.entries(CHRONICLE_CATEGORIES).map(([k, v]) => `- ${k}: ${v.icon} ${v.name}`).join('\n')}

## 重要度标准
1=琐事（日常闲聊）
2 = 普通（小互动）
3 = 重要（推动剧情）
4 = 关键（转折点）
5 = 史诗（改变命运）

## 对话内容
${chatContext}

## 输出要求
提取2-5个最重要的事件，以JSON数组格式输出：
[
  {
    "title": "事件标题（简短有力，10字以内）",
    "content": "事件描述（30-80字，叙事风格）",
    "category": "分类key",
    "importance": 3,
    "characters": ["涉及的角色名"],
    "location": "发生地点（如果能推断）"
  }
]`;const result = await callSubAPI([
      { role: 'system', content: prompt },
      { role: 'user', content: '请提取事件。' }
    ], 1200);
    
    if (!result) {
      chronicleExtracting = false;
      return;
    }
    
    // 解析结果
    const parsed = parseChronicleExtraction(result);
    
    if (parsed.length === 0) {
      toastr.info('未发现重要事件');
      chronicleExtracting = false;
      return;
    }
    
    // 直接添加（编年史不需要确认流程，因为事件更客观）
    parsed.forEach(event => {
      addChronicleEvent({
        ...event,
        source: 'auto_chat',
      });
    });
    
    toastr.success(`⭐ 提取到 ${parsed.length} 个事件`);
    
  } catch (err) {
    console.error('[编年史] 提取失败:', err);
    if (typeof bbLogError === 'function') {
      bbLogError('编年史', '事件提取失败', err.message);
    }
    toastr.error('事件提取失败');
  } finally {
    chronicleExtracting = false;
  }
}

/**
 * 从日记/总结中批量提取事件
 */
async function extractChronicleFromDiary() {
  const diaries = pluginData.diary_blood || [];
  const summaries = pluginData.summaries || [];
  
  if (diaries.length === 0 && summaries.length === 0) {
    toastr.warning('没有日记或总结可供提取');
    return;
  }
  
  chronicleExtracting = true;
  toastr.info('📖 正在从日记和总结中提取事件...');
  
  try {
    // 合并日记和总结内容
    let sourceText = '';
    
    diaries.forEach(d => {
      sourceText += `[日记 ${d.date}] ${d.content}\n\n`;
    });
    summaries.forEach(s => {
      sourceText += `[总结 ${s.date}] ${s.content}\n\n`;
    });
    
    // 截取最近的内容（避免超长）
    if (sourceText.length > 3000) {
      sourceText = sourceText.substring(sourceText.length - 3000);
    }
    
    const prompt = `你是一个故事编年史记录员。请从以下日记和总结中提取重要的故事事件。

## 事件分类
${Object.entries(CHRONICLE_CATEGORIES).map(([k, v]) => `- ${k}: ${v.icon} ${v.name}`).join('\n')}

## 源材料
${sourceText}

## 输出要求
提取3-8个最重要的事件，按时间顺序排列，以JSON数组格式输出：
[
  {
    "title": "事件标题（简短有力）",
    "content": "事件描述（30-80字）",
    "category": "分类key",
    "importance": 3,
    "characters": ["角色名"],
    "location": "地点"
  }
]`;

    const result = await callSubAPI([
      { role: 'system', content: prompt },
      { role: 'user', content: '请提取事件。' }
    ], 1500);
    
    if (!result) {
      chronicleExtracting = false;
      return;
    }
    
    const parsed = parseChronicleExtraction(result);
    
    if (parsed.length === 0) {
      toastr.info('未发现重要事件');
      chronicleExtracting = false;
      return;
    }
    
    parsed.forEach(event => {
      addChronicleEvent({
        ...event,
        source: 'diary_summary',
      });
    });
    
    toastr.success(`📖 从日记/总结中提取到 ${parsed.length} 个事件`);
    
  } catch (err) {
    console.error('[编年史] 日记提取失败:', err);
    if (typeof bbLogError === 'function') {
      bbLogError('编年史', '日记提取失败', err.message);
    }
    toastr.error('提取失败');
  } finally {
    chronicleExtracting = false;
  }
}

/**
 * 解析AI提取结果
 */
function parseChronicleExtraction(apiResponse) {
  try {
    let jsonStr = apiResponse.trim();
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    //尝试找到JSON数组
    const startIdx = jsonStr.indexOf('[');
    const endIdx = jsonStr.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    }
    
    const parsed = JSON.parse(jsonStr);
    
    if (!Array.isArray(parsed)) return [];
    
    return parsed.map(item => ({
      title: item.title || '未命名事件',
      content: item.content || '',
      category: CHRONICLE_CATEGORIES[item.category] ? item.category : 'custom',
      importance: Math.min(5, Math.max(1, parseInt(item.importance) || 3)),
      characters: Array.isArray(item.characters) ? item.characters : [],
      location: item.location || '',})).filter(e => e.title && e.content);
    
  } catch (err) {
    console.error('[编年史] JSON解析失败:', err);
    if (typeof bbLogError === 'function') {
      bbLogError('编年史', 'JSON解析失败', apiResponse.substring(0, 200));
    }
    return [];
  }
}

// ────────────────────────────────────────────
// P4. 渲染 — 时间轴可视化
// ────────────────────────────────────────────

/**
 * 渲染编年史时间轴
 */
function renderChronicleTimeline() {
  const $timeline = $('#bb-chronicle-timeline');
  if ($timeline.length === 0) return;
  
  // 获取筛选条件
  const filterCat = $('#bb-chronicle-filter-category').val();
  const filterImp = $('#bb-chronicle-filter-importance').val();
  const searchText = ($('#bb-chronicle-search').val() || '').toLowerCase();
  
  let events = getChronicleEvents();
  const chapters = getChronicleChapters();
  
  // 应用筛选
  if (filterCat && filterCat !== 'all') {
    events = events.filter(e => e.category === filterCat);
  }
  if (filterImp && filterImp !== 'all') {
    events = events.filter(e => e.importance >= parseInt(filterImp));
  }
  if (searchText) {
    events = events.filter(e =>
      e.title.toLowerCase().includes(searchText) ||
      e.content.toLowerCase().includes(searchText) ||
      e.characters.some(c => c.toLowerCase().includes(searchText))
    );
  }
  
  $timeline.empty();
  
  if (events.length === 0) {
    $timeline.html(`
      <div class="bb-empty">
        暂无编年史事件 ⭐<br/>
        点击"从对话提取"开始记录你的故事
      </div>
    `);
    return;
  }
  
  // 中线
  $timeline.append('<div class="bb-chronicle-line"></div>');
  
  // 按章节分组渲染
  let currentChapterId = null;
  
  events.forEach((event, idx) => {
    const cat = CHRONICLE_CATEGORIES[event.category] || CHRONICLE_CATEGORIES.custom;
    const imp = CHRONICLE_IMPORTANCE[event.importance] || CHRONICLE_IMPORTANCE[3];
    const side = idx % 2 === 0 ? 'left' : 'right';
    
    // 章节标题
    if (event.chapter && event.chapter !== currentChapterId) {
      currentChapterId = event.chapter;
      const chapter = chapters.find(c => c.id === currentChapterId);
      if (chapter) {
        $timeline.append(`
          <div class="bb-chronicle-chapter-header">
            <span class="bb-chronicle-chapter-name" data-chapter-id="${chapter.id}">
              📖 ${esc(chapter.name)}
            </span>
            <button class="bb-chronicle-chapter-rename bb-text-xs bb-clickable" data-chapter-id="${chapter.id}" title="重命名">✏️</button>
          </div>
        `);
      }
    }
    
    // 事件节点
    const dateStr = new Date(event.timestamp).toLocaleString('zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    const charsHtml = event.characters.length > 0
      ? `<div class="bb-chronicle-chars">${event.characters.map(c => `<span class="bb-chronicle-char-tag">${esc(c)}</span>`).join('')}</div>`
      : '';
    
    const locationHtml = event.location
      ? `<span class="bb-text-xs bb-text-dim">📍 ${esc(event.location)}</span>`
      : '';
    
    const imageHtml = event.image
      ? `<div class="bb-chronicle-image"><img src="${esc(event.image)}" alt="${esc(event.title)}" loading="lazy"></div>`
      : '';
    
    const sourceIcon = event.source === 'auto_chat' ? '🤖' : event.source === 'diary_summary' ? '📖' : '✍️';
    
    $timeline.append(`
      <div class="bb-chronicle-node bb-chronicle-${side}" data-event-id="${event.id}">
        <div class="bb-chronicle-dot" style="background:${cat.color};"></div>
        <div class="bb-chronicle-card" style="border-top:3px solid ${cat.color};">
          <div class="bb-chronicle-card-header">
            <span class="bb-chronicle-category" style="color:${cat.color};">
              ${cat.icon} ${cat.name}
            </span>
            <div class="bb-chronicle-card-actions">
              <span class="bb-text-xs bb-text-dim" title="来源">${sourceIcon}</span>
              <span class="bb-text-xs bb-text-dim">${imp.label}</span>
              <button class="bb-chronicle-btn" data-action="edit" title="编辑">✏️</button>
              <button class="bb-chronicle-btn" data-action="delete" title="删除">🗑️</button>
            </div>
          </div>
          
          <h4 class="bb-chronicle-title">${esc(event.title)}</h4>
          
          ${imageHtml}
          
          <p class="bb-chronicle-content">${esc(event.content)}</p>
          
          <div class="bb-chronicle-meta">
            <span class="bb-text-xs bb-text-dim">🕐 ${dateStr}</span>
            ${locationHtml}
          </div>
          ${charsHtml}
        </div>
      </div>
    `);
  });
  
  // 绑定事件
  bindChronicleCardEvents();
}

/**
 * 更新统计信息
 */
function updateChronicleStats() {
  const events = getChronicleEvents();
  const chapters = getChronicleChapters();
  
  $('#bb-chronicle-stat-total').text(`共 ${events.length} 个事件`);
  $('#bb-chronicle-stat-chapters').text(`${chapters.length} 个章节`);
}

/**
 * 刷新分类筛选下拉框
 */
function refreshChronicleCategoryFilter() {
  const $select = $('#bb-chronicle-filter-category');
  if ($select.length === 0) return;
  
  $select.empty();
  $select.append('<option value="all">全部分类</option>');
  
  Object.entries(CHRONICLE_CATEGORIES).forEach(([key, val]) => {
    $select.append(`<option value="${key}">${val.icon} ${val.name}</option>`);
  });
}

// ────────────────────────────────────────────
// P5. 事件绑定
// ────────────────────────────────────────────

/**
 * 绑定编年史主面板事件
 */
function bindChroniclePanelEvents() {
  const panel = '#bb-main-panel';
  
  // 从对话提取
  $(panel).off('click.chronextract').on('click.chronextract', '#bb-chronicle-extract', () => {
    extractChronicleFromChat();
  });
  
  // 手动添加
  $(panel).off('click.chronadd').on('click.chronadd', '#bb-chronicle-add-manual', () => {
    showChronicleEditModal();
  });
  
  // 从日记提取
  $(panel).off('click.chronfromdiary').on('click.chronfromdiary', '#bb-chronicle-from-diary', () => {
    extractChronicleFromDiary();
  });
  
  // 导出
  $(panel).off('click.chronexport').on('click.chronexport', '#bb-chronicle-export', () => {
    exportChronicle();
  });
  
  // 筛选变化
  $(panel).off('change.chronfilter').on('change.chronfilter', '#bb-chronicle-filter-category, #bb-chronicle-filter-importance', () => {
    renderChronicleTimeline();
  });
  
  // 搜索
  $(panel).off('input.chronsearch').on('input.chronsearch', '#bb-chronicle-search', debounce(() => {
    renderChronicleTimeline();
  }, 300));
  
  // 章节重命名
  $(panel).off('click.chronrename').on('click.chronrename', '.bb-chronicle-chapter-rename', function () {
    const chapterId = $(this).data('chapter-id');
    const chapters = getChronicleChapters();
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    const newName = prompt('输入新章节名称:', chapter.name);
    if (newName && newName.trim()) {
      renameChapter(chapterId, newName.trim());
    }
  });
}

/**
 * 绑定事件卡片操作
 */
function bindChronicleCardEvents() {
  $('.bb-chronicle-node').off('click.chronaction').on('click.chronaction', '.bb-chronicle-btn', function () {
    const action = $(this).data('action');
    const eventId = $(this).closest('.bb-chronicle-node').data('event-id');
    
    switch (action) {
      case 'edit':
        showChronicleEditModal(eventId);
        break;
      case 'delete':
        if (confirm('确认删除此事件？')) {
          deleteChronicleEvent(eventId);
        }
        break;}
  });
}

// ────────────────────────────────────────────
// P6. 模态框
// ────────────────────────────────────────────

/**
 * 显示编年史事件编辑模态框
 */
function showChronicleEditModal(eventId = null) {
  const isEdit = !!eventId;
  let event = null;
  
  if (isEdit) {
    const events = getChronicleEvents();
    event = events.find(e => e.id === eventId);
    if (!event) {
      toastr.error('事件不存在');
      return;
    }
  }
  
  // 分类选项
  const categoryOptions = Object.entries(CHRONICLE_CATEGORIES)
    .map(([key, val]) => `<option value="${key}" ${event && event.category === key ? 'selected' : ''}>${val.icon} ${val.name}</option>`)
    .join('');
  
  // 重要度选项
  const importanceOptions = Object.entries(CHRONICLE_IMPORTANCE)
    .map(([key, val]) => `<option value="${key}" ${event && event.importance == key ? 'selected' : ''}>${val.label} ${val.name}</option>`)
    .join('');
  
  const modalHtml = `
    <div class="bb-modal-overlay" id="bb-chronicle-edit-modal">
      <div class="bb-modal-content" style="max-width:650px;">
        <div class="bb-modal-header">
          <h3>${isEdit ? '✏️ 编辑事件' : '➕ 添加事件'}</h3>
          <button class="bb-modal-close">✖</button>
        </div><div class="bb-modal-body">
          <div class="bb-form-group">
            <label>事件标题 *</label>
            <input type="text" id="bb-chron-edit-title" class="bb-input" placeholder="简短有力的标题" value="${event ?esc(event.title) : ''}">
          </div>
          
          <div class="bb-form-group">
            <label>事件描述 *</label>
            <textarea id="bb-chron-edit-content" class="bb-input" rows="4" placeholder="描述发生了什么...">${event ? esc(event.content) : ''}</textarea>
          </div>
          
          <div style="display:flex;gap:10px;">
            <div class="bb-form-group" style="flex:1;">
              <label>分类</label>
              <select id="bb-chron-edit-category" class="bb-input">
                ${categoryOptions}
              </select>
            </div>
            <div class="bb-form-group" style="flex:1;">
              <label>重要度</label>
              <select id="bb-chron-edit-importance" class="bb-input">
                ${importanceOptions}
              </select>
            </div>
          </div>
          
          <div style="display:flex;gap:10px;">
            <div class="bb-form-group" style="flex:1;">
              <label>涉及角色（逗号分隔）</label>
              <input type="text" id="bb-chron-edit-characters" class="bb-input" placeholder="角色A, 角色B" value="${event ? event.characters.join(', ') : ''}">
            </div>
            <div class="bb-form-group" style="flex:1;">
              <label>地点</label>
              <input type="text" id="bb-chron-edit-location" class="bb-input" placeholder="发生地点" value="${event ? esc(event.location) : ''}">
            </div>
          </div>
          
          <div class="bb-form-group">
            <label>配图URL（可选）</label>
            <input type="text" id="bb-chron-edit-image" class="bb-input" placeholder="https://..." value="${event ? esc(event.image) : ''}">
          </div>
        </div>
        <div class="bb-modal-footer">
          <button class="bb-btn bb-btn-secondary" id="bb-chron-edit-cancel">取消</button>
          <button class="bb-btn bb-btn-primary" id="bb-chron-edit-save">${isEdit ? '保存' : '添加'}</button>
        </div>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  
  // 绑定事件
  $('#bb-chronicle-edit-modal .bb-modal-close, #bb-chron-edit-cancel').on('click', () => {
    $('#bb-chronicle-edit-modal').remove();
  });
  
  $('#bb-chron-edit-save').on('click', () => {
    const title = $('#bb-chron-edit-title').val().trim();
    const content = $('#bb-chron-edit-content').val().trim();
    
    if (!title || !content) {
      toastr.warning('请填写标题和描述');
      return;
    }
    
    const eventData = {
      title: title,
      content: content,
      category: $('#bb-chron-edit-category').val(),
      importance: parseInt($('#bb-chron-edit-importance').val()) || 3,
      characters: $('#bb-chron-edit-characters').val().split(',').map(c => c.trim()).filter(Boolean),
      location: $('#bb-chron-edit-location').val().trim(),
      image: $('#bb-chron-edit-image').val().trim(),};
    
    if (isEdit) {
      updateChronicleEvent(eventId, eventData);
      toastr.success('事件已更新');
    } else {
      addChronicleEvent({ ...eventData, source: 'manual' });
      toastr.success('事件已添加');
    }
    
    $('#bb-chronicle-edit-modal').remove();
  });
}

// ────────────────────────────────────────────
// P7. 导出
// ────────────────────────────────────────────

/**
 * 导出编年史
 */
function exportChronicle() {
  const events = getChronicleEvents();
  const chapters = getChronicleChapters();
  
  if (events.length === 0) {
    toastr.warning('暂无事件可导出');
    return;
  }
  
  const s = extension_settings[EXTENSION_NAME];
  const cn = getCurrentCharacterName() || '角色';
  
  if (s.chronicle.export_format === 'json') {
    const data = { character: cn, exportTime: new Date().toISOString(), chapters, events };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronicle_${cn}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);toastr.success('编年史JSON已导出');
  } else {
    // Markdown格式
    let md = `# ⭐ 编年史 — ${cn}\n\n`;
    md += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    md += `---\n\n`;
    
    let currentChapterId = null;
    
    events.forEach(event => {
      // 章节标题
      if (event.chapter && event.chapter !== currentChapterId) {
        currentChapterId = event.chapter;
        const chapter = chapters.find(c => c.id === currentChapterId);
        if (chapter) {
          md += `\n## 📖 ${chapter.name}\n\n`;
        }
      }
      
      const cat = CHRONICLE_CATEGORIES[event.category] || CHRONICLE_CATEGORIES.custom;
      const imp = CHRONICLE_IMPORTANCE[event.importance] || CHRONICLE_IMPORTANCE[3];
      const date = new Date(event.timestamp).toLocaleString('zh-CN');
      
      md += `### ${cat.icon} ${event.title}\n\n`;
      md += `- **分类:** ${cat.name} | **重要度:** ${imp.label}\n`;
      md += `- **时间:** ${date}\n`;
      if (event.characters.length > 0) md += `- **角色:** ${event.characters.join(', ')}\n`;
      if (event.location) md += `- **地点:** ${event.location}\n`;
      md += `\n${event.content}\n\n`;md += `---\n\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronicle_${cn}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toastr.success('编年史Markdown已导出');
  }
}

// ────────────────────────────────────────────
// P8. 宏注入
// ────────────────────────────────────────────

/**
 * 生成 {{bb_chronicle}} 宏内容
 */
function generateChronicleMacro() {
  const events = getChronicleEvents();
  if (events.length === 0) return '';
  
  // 取最近10个事件
  const recent = events.slice(-10);
  
  let output = '[最近的故事事件]\n';
  recent.forEach(e => {
    const cat = CHRONICLE_CATEGORIES[e.category] || CHRONICLE_CATEGORIES.custom;
    output += `${cat.icon} ${e.title}: ${e.content}\n`;
  });
  
  return output.trim();
}

// ────────────────────────────────────────────
// P9. 自动提取钩子
// ────────────────────────────────────────────

let chronicleMessageCounter = 0;

/**
 * 将编年史提取挂钩到消息计数器
 */
function hookChronicleToMessageCounter() {
  const s = extension_settings[EXTENSION_NAME];
  if (!s.chronicle.enabled || !s.chronicle.auto_extract) return;
  
  if (eventSource) {
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, () => {
      chronicleMessageCounter++;
      
      if (chronicleMessageCounter >= s.chronicle.extract_interval) {
        chronicleMessageCounter = 0;
        setTimeout(() => {
          extractChronicleFromChat();
        },3000); // 延迟3秒，避免与记忆琥珀冲突
      }
    });console.log(`[编年史] 自动提取已启用，每${s.chronicle.extract_interval} 条消息触发`);
  }
}

// ────────────────────────────────────────────
// P10. 初始化
// ────────────────────────────────────────────

/**
 * 初始化编年史系统
 */
function initChronicle() {
  const s = extension_settings[EXTENSION_NAME];
  
  // 确保配置存在
  if (!s.chronicle) {
    s.chronicle = {
      enabled: true,
      auto_extract: true,
      extract_interval: 20,
      auto_chapter: true,
      chapter_threshold: 5,
      show_importance: true,
      default_importance: 3,
      export_format: 'markdown',
    };
    saveSettingsDebounced();
  }
  
  // 刷新筛选器
  refreshChronicleCategoryFilter();
  
  //渲染
  renderChronicleTimeline();
  updateChronicleStats();
  
  // 绑定事件
  bindChroniclePanelEvents();
  
  // 挂钩自动提取
  if (s.chronicle.enabled && s.chronicle.auto_extract) {
    hookChronicleToMessageCounter();
  }
  console.log('[骨与血] 编年史系统初始化完成');
}

// ═══════════════════════════════════════════
// 【区块P结束】
// ═══════════════════════════════════════════













