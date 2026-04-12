// ============================================
// 🦴 骨与血 (Bone & Blood) v7.1
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
    gallery: '🖼️ 画廊', couple: '💕 情侣空间',},
  ancient: {
    home: '🏮 归处', scrapbook: '📜拾遗录', diary: '🖋️ 手札',
    npc: '👤 人物志', weather: '🌸 时节录', vibe: '💭 心境图',
    parallel: '🌀镜花水月', fate: '🎴卦象台', ooc: '💌 私语阁',
    world: '📰 江湖传闻', achievements: '🎖️ 功绩榜',
    gallery: '🎨 丹青阁', couple: '🌙鸳鸯谱',
  },

  gothic: {
    home: '🕯️ 庭院', scrapbook: '🦴骸骨之语', diary: '🩸 血迹手记',
    npc: '👻 幽影名录', weather: '⚰️ 天气', vibe: '🕷️ 血脉共鸣',
    parallel: '🌑暗面分支', fate: '🗡️ 命运之骰', ooc: '🚪 Burning Star',
    world: '📡亡者电台', achievements: '💀 死亡勋章',
    gallery: '🖤暗影画廊', couple: '🥀 血契空间',
  },
  monochrome: {
    home: '🏠 主页', scrapbook: '📀唱片机', diary: '📓 日记本',
    npc: '👥 情报站', weather: '🌫️ 环境雷达', vibe: '🤍 氛围心电图',
    parallel: '🔲 平行宇宙', fate: '🎲 命运盘', ooc: '💬 Burning Star',
    world: '📡 世界频段', achievements: '🏅 成就殿堂',
    gallery: '🖼️ 画廊', couple: '🤍 情侣空间',},
};

};


const TAB_KEYS = ['home','scrapbook','diary','npc','weather','vibe','parallel','fate','ooc','world','achievements','gallery','couple'];

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
let oocSession = { active: false, history: [] };

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
  floatBtn.style.display = s.enabled ? 'flex' : 'none';
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
  btn.style.display = s.enabled ? 'flex' : 'none';

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
        
        <!-- 日记区域 -->
        <div class="bb-section">
          <h4 class="bb-section-title">📖 日记</h4>
          <div class="bb-action-bar">
            <button class="bb-sm-btn" id="bb-btn-gen-diary-tab">📖 生成日记</button>
            <button class="bb-sm-btn" id="bb-btn-gen-diary-img">🎨 为最新日记配图</button>
          </div>
          <div id="bb-diary-empty" class="bb-empty">暂无日记<br/>点击上方按钮生成</div>
          <div id="bb-diary-list"></div>
        </div>
        
        <!-- 总结区域 -->
        <div class="bb-section" style="margin-top:16px;">
          <h4 class="bb-section-title">📜 阿卡夏记录（总结）</h4>
          <div class="bb-action-bar">
            <button class="bb-sm-btn" id="bb-btn-gen-summary-tab">📜 生成总结</button>
            <button class="bb-sm-btn bb-btn-danger" id="bb-btn-clear-summaries">🗑️ 清空总结</button>
          </div>
          <div id="bb-summary-empty" class="bb-empty">暂无总结<br/>每${getSettings().diary_trigger_count || 30}条消息自动生成，或手动点击生成</div>
          <div id="bb-summary-list"></div>
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
          <h4class="bb-section-title">📜 命运历史</h4>
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
        <div class="bb-diary-body">${formatText(s.content)}</div>
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

//═══════════════ 区块 N 结束 ═══════════════


// ═══════════════════════════════════════════
// 【区块 O】 生图API & 设置 & 初始化入口
// ═══════════════════════════════════════════

//── API调用 ──

async function testAPIConnection() {
  const s = getSettings();
  const base = s.api_base.replace(/\/+$/, '');
  const key = s.api_key;
  if (!base || !key) { toastr.warning('请先填写 API Base和 Key'); return; }
  $('#bb-api-status').html('<span class="bb-text-warning">⏳ 连接中...</span>');
  try {
    const url = base.includes('/v1') ? `${base}/models` : `${base}/v1/models`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json();
    const models = json.data || json.models || [];
    if (models.length === 0) throw new Error('未找到可用模型');
    $('#bb-api-model').empty();
    models.forEach((m) => {
      const id = m.id || m;
      $('#bb-api-model').append(`<option value="${id}">${id}</option>`);
    });
    s.api_model = models[0].id || models[0];
    $('#bb-api-model').val(s.api_model);
    saveSettings();
    $('#bb-api-status').html(`<span class="bb-text-success">✅ 连接成功！获取到${models.length} 个模型</span>`);toastr.success(`🔗 已连接，默认模型: ${s.api_model}`);
  } catch (err) {
    $('#bb-api-status').html(`<span class="bb-text-error">❌ 连接失败: ${err.message}</span>`);
    toastr.error(`连接失败: ${err.message}`);
  }
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
    if (preset.blacklist && preset.blacklist.length > 0) {
      preset.blacklist.forEach((word) => {
        const reg = new RegExp(word, 'gi');
        content = content.replace(reg, '***');
      });
    }
    return content.trim();
  } catch (err) {
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
  renderSummary();          // ← 新增
  updateAutoSummaryBar();   // ← 新增renderIntel();
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
  
  // 清空总结
  $(panel).find('#bb-btn-clear-summaries').on('click', () => {
    if (!confirm('确定清空所有总结？')) return;
    pluginData.summaries = [];
    saveChatData();
    renderSummary();
    toastr.info('总结已清空');
  });
  
  // 自动记录开关
  $(panel).find('#bb-btn-toggle-auto').on('click', () => {
    const s = getSettings();
    s.auto_diary_enabled = !s.auto_diary_enabled;
    saveSettingsDebounced();
    updateAutoSummaryBar();
    toastr.info(s.auto_diary_enabled ? '✅ 自动记录已开启' : '⏸ 自动记录已暂停');
  });


  // ──────────────────────────────────────────
  // 音乐播放器事件（新增 - MP3播放器）
  // ──────────────────────────────────────────
  $(panel).off('click.bbmusictoggle').on('click.bbmusictoggle', '#bb-music-toggle', bbPlayerToggle);
  $(panel).off('click.bbmusicprev').on('click.bbmusicprev', '#bb-music-prev', bbPlayerPrev);
  $(panel).off('click.bbmusicnext').on('click.bbmusicnext', '#bb-music-next', bbPlayerNext);
  
  // 进度条点击跳转
  $(panel).off('click.bbmusicprogress').on('click.bbmusicprogress', '.bb-music-progress-mini', function(e) {
    if (!bbPlayer.audio || !bbPlayer.audio.duration) return;
    const rect = this.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    bbPlayerSeek(bbPlayer.audio.duration * percent);
  });
  // ──────────────────────────────────────────
    // 音乐搜索
  $(panel).off('click.bbmusicsearch').on('click.bbmusicsearch', '#bb-btn-music-search', showMusicSearchModal);

  // Tab切换 — 使用 bb-tab-pane 和 bb-hidden
  $(panel).off('click.bbtab').on('click.bbtab', '.bb-tab-btn', function () {
    const tab = $(this).data('tab');
    $(panel).find('.bb-tab-btn').removeClass('active');
    $(this).addClass('active');
    $(panel).find('.bb-tab-pane').addClass('bb-hidden').removeClass('active');
    $(panel).find(`#bb-pane-${tab}`).removeClass('bb-hidden').addClass('active');
  });

  // 情侣空间子Tab切换
  $(panel).off('click.bbctab').on('click.bbctab', '.bb-couple-tab', function () {
    const ctab = $(this).data('ctab');
    $(panel).find('.bb-couple-tab').removeClass('active');
    $(this).addClass('active');
    $(panel).find('.bb-couple-panel').addClass('bb-hidden').removeClass('active');
    $(panel).find(`#bb-couple-${ctab}`).removeClass('bb-hidden').addClass('active');
  });

  // 首页：头像点击
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

  // 首页：设置背景图
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

  // 首页：保存配置
  $(panel).off('click.bbsavehome').on('click.bbsavehome', '#bb-btn-save-home', function () {
    pluginData.home_config.link_emoji = $('#bb-home-link-emoji').text();
    pluginData.home_config.user_bubble = $('#bb-home-user-bubble').text();
    pluginData.home_config.char_bubble = $('#bb-home-char-bubble').text();
    pluginData.home_config.radio_text = $('#bb-home-radio-text').text();
    saveChatData(); toastr.success('💾 首页配置已保存');
  });

  // 仪表盘快捷操作
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

  // 导出按钮
  $(panel).off('click.bbexmd').on('click.bbexmd', '#bb-btn-export-md', exportAsMarkdown);
  $(panel).off('click.bbexjson').on('click.bbexjson', '#bb-btn-export-json', exportAsJSON);
  $(panel).off('click.bbexposter').on('click.bbexposter', '#bb-btn-export-poster', showPosterEditor);

  // 生成按钮
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

  // 破墙聊天室
  $(panel).off('click.bbopenooc').on('click.bbopenooc', '#bb-btn-open-ooc-win', () => $('#bb-ooc-win').removeClass('bb-hidden'));
  $(panel).off('click.bbexportooc').on('click.bbexportooc', '#bb-btn-export-ooc', exportOOCChat);
  $(panel).off('click.bbclearooc').on('click.bbclearooc', '#bb-btn-clear-ooc', () => {
    if (!confirm('确认清空Burning Star Chat历史?')) return;
    pluginData.ooc_chat = []; oocSession.history = [];
    saveChatData(); renderOOCPreview(); toastr.info('🗑️ 已清空');
  });

  // 世界频段
  $(panel).off('click.bbaddfeed').on('click.bbaddfeed', '#bb-btn-add-feed', () => {
    const content = prompt('输入消息内容:');
    if (!content) return;
    pluginData.world_feed.push({ type: 'custom', content, timestamp: new Date().toLocaleString('zh-CN') });
    saveChatData(); renderWorldFeed(); updateMarquee();
  });$(panel).off('click.bbgenfeed').on('click.bbgenfeed', '#bb-btn-gen-feed', generateWorldFeed);
  $(panel).off('click.bbclearfeed').on('click.bbclearfeed', '#bb-btn-clear-feed', () => {
    if (!confirm('确认清空世界频段?')) return;
    pluginData.world_feed = []; saveChatData(); renderWorldFeed(); updateMarquee(); toastr.info('🗑️ 已清空');
  });

  // 画廊
  $(panel).off('click.bbgenimg').on('click.bbgenimg', '#bb-btn-gen-gallery-img', async function () {
    const p = prompt('输入生图提示词:');
    if (p) await generateAndSaveImage(p, 'manual');
  });
  $(panel).off('click.bbcleargallery').on('click.bbcleargallery', '#bb-btn-clear-gallery', () => {
    if (!confirm('确认清空画廊?')) return;
    pluginData.gallery = []; saveChatData(); renderGallery(); toastr.info('🗑️ 画廊已清空');
  });

  // 情侣空间事件
  bindCoupleSpaceEvents();

  // 语录编辑
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
      $('#bb-trigger-btn').show(); toastr.success('骨与血已启用 🦴');
    } else {
      $('#bb-trigger-btn').hide();$('#bb-main-panel').fadeOut(200);
      toastr.info('骨与血已禁用');
    }
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
    inp.attr('type', inp.attr('type') === 'password' ? 'text' : 'password');});
  $('#bb-api-model').val(s().api_model || '').on('input', function () { s().api_model = this.value.trim(); saveSettingsDebounced(); });
  $('#bb-test-api').on('click', async function () {
    if (!s().api_base || !s().api_key) { toastr.warning('请先填写API地址和Key'); return; }
    try {
      toastr.info('正在测试连接...');
      const res = await callSubAPI([{ role: 'user', content: '回复"连接成功"两个字。' }],20);
      toastr.success(`连接成功！回复: ${res.substring(0, 50)}`);
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

  $('#bb-pe-save').on('click', function () {
    const idx = s().active_preset; const preset = s().prompt_presets?.[idx]; if (!preset) return;
    preset.name = $('#bb-pe-name').val().trim() || preset.name;
    preset.global = $('#bb-pe-global').val(); preset.blacklist = $('#bb-pe-blacklist').val();
    preset.prompts = { diary: $('#bb-pe-diary').val(), summary: $('#bb-pe-summary').val(), weather: $('#bb-pe-weather').val(), vibe: $('#bb-pe-vibe').val(), npc: $('#bb-pe-npc').val(), chaos: $('#bb-pe-chaos').val(), parallel: $('#bb-pe-parallel').val(), world: $('#bb-pe-world').val(), couple: $('#bb-pe-couple').val() };
    saveSettingsDebounced(); refreshPresetSelect(); $('#bb-preset-editor').slideUp(200);
    toastr.success(`预设「${preset.name}」已保存`);
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
  });
}

function incrementMessageCounter() {
  const s = getSettings();
  s.message_counter = (s.message_counter || 0) + 1; saveSettings();
  if (s.auto_diary_enabled && s.message_counter >= s.diary_trigger_count) {
    s.message_counter = 0; saveSettings(); autoGenerate();
  }
  checkAchievements();
}

async function autoGenerate() {
  console.log('[骨与血]🔄 触发自动生成...');
  toastr.info('🔄 自动生成日记和总结中...');
  await generateDiary(); await generateSummary();
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
      0%, 100% { box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 0 0rgba(102,126,234,0.5); }
      50% { box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 0 12px rgba(102,126,234,0); }
    }`;
  
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

  // 16. 检查成就
  checkAchievements();

  // 17. 确保弹窗初始隐藏
  $('#bb-main-panel').css('display', 'none');
  $('#bb-ooc-win').addClass('bb-hidden');
  $('#bb-bf-win').addClass('bb-hidden');

  // 18. 移动端确保悬浮球可见
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













