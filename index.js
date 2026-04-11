// ============================================
// 🦴 骨与血 (Bone & Blood) v6.0
// SillyTavern 沉浸式风味增强与记忆手账插件
// By SHADOW <安息之影> © 2026
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
    gallery: '📸 幻像画廊',
    scrapbook: '🌟 唱片机',
    diary: '📖 日记本',
    npc: '🧑‍🤝‍🧑 情报站',
    weather: '☁️ 环境雷达',
    vibe: '❤️ 氛围心电图',
    parallel: '🦋 平行宇宙',
    fate: '🎲 命运盘',
    ooc: '💬 破墙沟通',
    world: '📻 世界频段',
    achievements: '🏆 成就殿堂',
  },
  ancient: {
    home: '🏮 归处',
    gallery: '🖼️ 浮生绘卷',
    scrapbook: '📜 拾遗录',
    diary: '🖋️ 手札',
    npc: '👤 人物志',
    weather: '🌸 时节录',
    vibe: '💭 心境图',
    parallel: '🌀 镜花水月',
    fate: '🎴 卦象台',
    ooc: '💌 私语阁',
    world: '📰 江湖传闻',
    achievements: '🎖️ 功绩榜',
  },
  gothic: {
    home: '🕯️ 庭院',
    gallery: '🩸 血印相册',
    scrapbook: '🦴 骸骨之语',
    diary: '🩸 血迹手记',
    npc: '👻 幽影名录',
    weather: '⚰️ 天气',
    vibe: '🕷️ 血脉共鸣',
    parallel: '🌑 暗面分支',
    fate: '🗡️ 命运之骰',
    ooc: '🚪 跨界暗室',
    world: '📡 亡者电台',
    achievements: '💀 死亡勋章',
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
  
  style_preset: 'gothic',  // modern|ancient|gothic|custom
  custom_names: {},
  
  // 生图 API 预留配置
  img_api_enabled: false,
  img_api_type: 'novelai', // novelai | sd | openai
  img_api_base: '',
  img_api_key: '',
  
  prompt_presets: [
    {
      name: '默认全局预设',
      global: '请用简洁、有情感张力的叙事风格回应。避免过度说教和空洞抒情。',
      prompts: {
        diary: '根据以下对话，以角色第一人称写一篇简短日记（100-200字）。带有时间感和情感细节。',
        summary: '用简洁的故事进度总结风格，概括主要事件、关系变化、未解决的线索（100-150字）。',
        weather: '推断当前场景的环境信息：时间、天气、地点、氛围（50-100字）。',
        vibe: '分析对话的情感氛围和关系状态。用诗意短评（50-100字），包含情感基调、张力指数（1-10）、关键词。',
        npc: '描述NPC当前状态：外貌、情绪、行为动向、与主角关系（80-150字）。',
        fate: '生成一个突发随机事件（可好可坏可离谱），简短有力（50-100字），可直接融入RP，带戏剧性。',
        butterfly: '基于用户选择的消息，生成一个平行宇宙分支剧情（150-300字）。风格应与原对话一致但走向不同。',
        world: '根据当前剧情背景，生成1-2条世界背景"噪音"信息（路人八卦/新闻/世界观彩蛋），每条30-50字。',
      },
      blacklist: [],
    }
  ],
  active_preset: 0,
  
  // 独立的破墙(OOC)预设系统
  ooc_presets: [
    {
      name: '默认星辰破墙',
      prompt: '你作为角色扮演者，与用户进行OOC（脱离角色）沟通。这是一个跨越次元的对话，用户会和你讨论剧情、角色塑造等元层面问题。请诚恳、专业、温柔地回应。如果用户只是闲聊，给予温暖治愈的陪伴。'
    }
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
  gallery: [], // 画廊数据
  
  home_config: {
    layout: 'music', // music | idcard | minimal
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
// 入口与基础工具
// ============================================

jQuery(async () => {
  console.log('[骨与血] 🦴 v6.0 开始加载...');

  if (!extension_settings[EXTENSION_NAME]) {
    extension_settings[EXTENSION_NAME] = {};
  }
  extension_settings[EXTENSION_NAME] = Object.assign(
    {},
    defaultSettings,
    extension_settings[EXTENSION_NAME],
  );

  // 确保兼容旧版本数据升级
  if (!extension_settings[EXTENSION_NAME].ooc_presets) {
    extension_settings[EXTENSION_NAME].ooc_presets = [...defaultSettings.ooc_presets];
    extension_settings[EXTENSION_NAME].active_ooc_preset = 0;
  }

  $('#extensions_settings').append(buildSettingsPanelHTML());
  loadSettingsToForm();
  bindSettingsPanelEvents();
  applyCustomCSS();
  
  injectFloatingUI();
  injectButterflyWindow();
  injectOOCWindow();

  registerEventListeners();
  registerAllMacros();
  loadChatData();
  
  setTimeout(() => injectButtonsToExistingMessages(), 800);
  startWorldFeed();
  checkAchievements();

  console.log('[骨与血] ✅ v6.0 加载完成！');
});

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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
      <div class="inline-drawer-content">

        <div style="margin:6px 0;">
          <label class="checkbox_label" for="bb-enabled">
            <input id="bb-enabled" type="checkbox" />
            <span>启用插件</span>
          </label>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">📡 文本大模型配置</h4>
        <div style="margin:6px 0;">
          <label for="bb-api-base" style="font-size:13px;">API Base URL:</label>
          <input id="bb-api-base" type="text" class="text_pole" placeholder="https://api.openai.com/v1" style="width:100%;" />
        </div>
        <div style="margin:6px 0;">
          <label for="bb-api-key" style="font-size:13px;">API Key:</label>
          <input id="bb-api-key" type="password" class="text_pole" placeholder="sk-..." style="width:100%;" />
        </div>
        <div style="margin:8px 0;">
          <input id="bb-btn-test-api" class="menu_button" type="button" value="🔗 测试连接 & 获取模型" style="width:100%;" />
          <div id="bb-api-status" style="margin-top:4px;font-size:13px;min-height:20px;"></div>
        </div>
        <div style="margin:6px 0;">
          <label for="bb-api-model" style="font-size:13px;">选择模型:</label>
          <select id="bb-api-model" class="text_pole" style="width:100%;padding:6px;"></select>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">🖼️ 幻像画廊 API (生图预留)</h4>
        <div style="margin:6px 0;">
          <label for="bb-img-api-type" style="font-size:13px;">生图服务类型:</label>
          <select id="bb-img-api-type" class="text_pole" style="width:100%;padding:6px;">
            <option value="novelai">NovelAI</option>
            <option value="sd">Stable Diffusion (WebUI)</option>
            <option value="openai">OpenAI (DALL-E 3)</option>
          </select>
        </div>
        <div style="margin:6px 0;">
          <label for="bb-img-api-base" style="font-size:13px;">Image API Base (仅SD/自定义所需):</label>
          <input id="bb-img-api-base" type="text" class="text_pole" placeholder="http://127.0.0.1:7860" style="width:100%;" />
        </div>
        <div style="margin:6px 0;">
          <label for="bb-img-api-key" style="font-size:13px;">Image API Key:</label>
          <input id="bb-img-api-key" type="password" class="text_pole" style="width:100%;" />
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
        <h4 style="margin:8px 0 4px;">🎨 风格与布局</h4>
        <div style="margin:6px 0;">
          <label for="bb-style-preset" style="font-size:13px;">界面文案风格:</label>
          <select id="bb-style-preset" class="text_pole" style="width:100%;padding:6px;">
            <option value="modern">🌃 现代风</option>
            <option value="ancient">🏯 古风</option>
            <option value="gothic">🦇 哥特风</option>
            <option value="custom">✏️ 自定义</option>
          </select>
        </div>
        <div id="bb-custom-style-names" style="display:none;margin-top:12px;padding:12px;background:#222;border:1px solid #444;border-radius:6px;">
          <!-- Custom names fields -->
          <button id="bb-save-custom-names" class="menu_button" style="width:100%;margin-top:10px;">💾 保存自定义名称</button>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">📝 全局剧情提示词预设</h4>
        <div style="margin:6px 0;">
          <select id="bb-active-preset" class="text_pole" style="width:100%;padding:6px;"></select>
        </div>
        <div style="display:flex;gap:4px;margin:6px 0;">
          <input id="bb-btn-new-preset" class="menu_button" type="button" value="➕ 新建" style="flex:1;" />
          <input id="bb-btn-del-preset" class="menu_button" type="button" value="🗑️ 删除" style="flex:1;" />
        </div>
        <div style="margin-top:12px;">
          <button id="bb-toggle-preset-editor" class="menu_button" style="width:100%;">✏️ 展开全局预设编辑器</button>
        </div>
        <div id="bb-preset-editor" style="display:none;margin-top:12px;padding:12px;background:#222;border:1px solid #444;border-radius:6px;">
          <div style="margin-bottom:10px;"><label style="font-size:12px;color:#aaa;">预设名称:</label><input id="bb-preset-name" type="text" class="text_pole" style="width:100%;" /></div>
          <div style="margin-bottom:10px;"><label style="font-size:12px;color:#aaa;">全局指导:</label><textarea id="bb-preset-global" class="text_pole" rows="3" style="width:100%;"></textarea></div>
          <details style="margin-bottom:10px;">
            <summary style="cursor:pointer;color:var(--bb-primary);font-size:13px;font-weight:bold;">📖 模块提示词（点击展开）</summary>
            <div style="margin-top:8px;display:flex;flex-direction:column;gap:8px;">
              <textarea id="bb-preset-diary" class="text_pole" rows="2" style="width:100%;" placeholder="日记..."></textarea>
              <textarea id="bb-preset-summary" class="text_pole" rows="2" style="width:100%;" placeholder="总结..."></textarea>
              <textarea id="bb-preset-vibe" class="text_pole" rows="2" style="width:100%;" placeholder="氛围..."></textarea>
              <textarea id="bb-preset-npc" class="text_pole" rows="2" style="width:100%;" placeholder="NPC..."></textarea>
              <textarea id="bb-preset-fate" class="text_pole" rows="2" style="width:100%;" placeholder="命运..."></textarea>
              <textarea id="bb-preset-butterfly" class="text_pole" rows="2" style="width:100%;" placeholder="平行宇宙..."></textarea>
            </div>
          </details>
          <button id="bb-save-preset-editor" class="menu_button" style="width:100%;">💾 保存剧情预设</button>
        </div>

        <hr />
        <h4 style="margin:8px 0 4px;">💬 破墙 (OOC) 独立预设</h4>
        <div style="margin:6px 0;">
          <select id="bb-active-ooc-preset" class="text_pole" style="width:100%;padding:6px;"></select>
        </div>
        <div style="display:flex;gap:4px;margin:6px 0;">
          <input id="bb-btn-new-ooc-preset" class="menu_button" type="button" value="➕ 新建" style="flex:1;" />
          <input id="bb-btn-del-ooc-preset" class="menu_button" type="button" value="🗑️ 删除" style="flex:1;" />
        </div>
        <div style="margin-top:12px;">
          <button id="bb-toggle-ooc-editor" class="menu_button" style="width:100%;">✏️ 展开破墙预设编辑器</button>
        </div>
        <div id="bb-ooc-editor" style="display:none;margin-top:12px;padding:12px;background:#222;border:1px solid #444;border-radius:6px;">
          <div style="margin-bottom:10px;"><label style="font-size:12px;color:#aaa;">预设名称:</label><input id="bb-ooc-preset-name" type="text" class="text_pole" style="width:100%;" /></div>
          <div style="margin-bottom:10px;"><label style="font-size:12px;color:#aaa;">破墙沟通提示词:</label><textarea id="bb-ooc-preset-prompt" class="text_pole" rows="5" style="width:100%;"></textarea></div>
          <button id="bb-save-ooc-editor" class="menu_button" style="width:100%;">💾 保存破墙预设</button>
        </div>

        <hr />
        <div style="color:#888;font-size:11px;padding:8px 0;text-align:center;">
          💡 点击右下角 🦴 打开主面板<br/>
          © 2026 SHADOW &lt;安息之影&gt;
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================
// 设置逻辑绑定
// ============================================

function getSettings() { return extension_settings[EXTENSION_NAME]; }
function saveSettings() { saveSettingsDebounced(); }

function loadSettingsToForm() {
  const s = getSettings();
  $('#bb-enabled').prop('checked', s.enabled);
  $('#bb-api-base').val(s.api_base);
  $('#bb-api-key').val(s.api_key);
  $('#bb-diary-trigger').val(s.diary_trigger_count);
  $('#bb-auto-diary').prop('checked', s.auto_diary_enabled);
  $('#bb-style-preset').val(s.style_preset);
  
  // 生图API
  $('#bb-img-api-type').val(s.img_api_type || 'novelai');
  $('#bb-img-api-base').val(s.img_api_base || '');
  $('#bb-img-api-key').val(s.img_api_key || '');

  if (s.api_model) {
    $('#bb-api-model').empty().append(`<option value="${s.api_model}" selected>${s.api_model}</option>`);
  }
  refreshPresetSelector();
  refreshOOCPresetSelector();
}

function bindSettingsPanelEvents() {
  $('#bb-enabled').on('change', function () { getSettings().enabled = $(this).is(':checked'); saveSettings(); });
  $('#bb-api-base').on('input', function () { getSettings().api_base = $(this).val().replace(/\/+$/, ''); saveSettings(); });
  $('#bb-api-key').on('input', function () { getSettings().api_key = $(this).val(); saveSettings(); });
  $('#bb-btn-test-api').on('click', testAPIConnection);
  $('#bb-api-model').on('change', function () { getSettings().api_model = $(this).val(); saveSettings(); });
  
  // Img API settings
  $('#bb-img-api-type').on('change', function () { getSettings().img_api_type = $(this).val(); saveSettings(); });
  $('#bb-img-api-base').on('input', function () { getSettings().img_api_base = $(this).val(); saveSettings(); });
  $('#bb-img-api-key').on('input', function () { getSettings().img_api_key = $(this).val(); saveSettings(); });

  $('#bb-style-preset').on('change', function () {
    getSettings().style_preset = $(this).val(); saveSettings(); refreshFloatingUI();
  });

  // 全局预设
  $('#bb-active-preset').on('change', function () { getSettings().active_preset = parseInt($(this).val()); saveSettings(); });
  $('#bb-btn-new-preset').on('click', createNewPreset);
  $('#bb-btn-del-preset').on('click', deleteCurrentPreset);
  $('#bb-toggle-preset-editor').on('click', function () {
    const editor = $('#bb-preset-editor');
    if (editor.is(':visible')) { editor.slideUp(); $(this).text('✏️ 展开全局预设编辑器'); }
    else { loadPresetToEditor(); editor.slideDown(); $(this).text('🔼 收起编辑器'); }
  });
  $('#bb-save-preset-editor').on('click', savePresetFromEditor);

  // OOC 预设
  $('#bb-active-ooc-preset').on('change', function () { getSettings().active_ooc_preset = parseInt($(this).val()); saveSettings(); });
  $('#bb-btn-new-ooc-preset').on('click', createNewOOCPreset);
  $('#bb-btn-del-ooc-preset').on('click', deleteCurrentOOCPreset);
  $('#bb-toggle-ooc-editor').on('click', function () {
    const editor = $('#bb-ooc-editor');
    if (editor.is(':visible')) { editor.slideUp(); $(this).text('✏️ 展开破墙预设编辑器'); }
    else { loadOOCPresetToEditor(); editor.slideDown(); $(this).text('🔼 收起破墙编辑器'); }
  });
  $('#bb-save-ooc-editor').on('click', saveOOCPresetFromEditor);
}

// OOC 预设管理
function refreshOOCPresetSelector() {
  const s = getSettings();
  const sel = $('#bb-active-ooc-preset');
  sel.empty();
  s.ooc_presets.forEach((p, i) => sel.append(`<option value="${i}">${esc(p.name)}</option>`));
  sel.val(s.active_ooc_preset);
}

function getActiveOOCPreset() {
  const s = getSettings();
  return s.ooc_presets[s.active_ooc_preset] || s.ooc_presets[0];
}

function createNewOOCPreset() {
  const name = prompt('新破墙预设名称:', `星辰破墙 ${Date.now()}`);
  if (!name) return;
  const s = getSettings();
  s.ooc_presets.push({ name, prompt: defaultSettings.ooc_presets[0].prompt });
  s.active_ooc_preset = s.ooc_presets.length - 1;
  saveSettings(); refreshOOCPresetSelector(); toastr.success('➕ 破墙预设已创建');
}

function deleteCurrentOOCPreset() {
  const s = getSettings();
  if (s.ooc_presets.length <= 1) return toastr.warning('至少保留一个破墙预设');
  if (!confirm(`确认删除: ${getActiveOOCPreset().name}?`)) return;
  s.ooc_presets.splice(s.active_ooc_preset, 1);
  s.active_ooc_preset = 0;
  saveSettings(); refreshOOCPresetSelector(); toastr.success('🗑️ 预设已删除');
}

function loadOOCPresetToEditor() {
  const preset = getActiveOOCPreset();
  $('#bb-ooc-preset-name').val(preset.name);
  $('#bb-ooc-preset-prompt').val(preset.prompt);
}

function saveOOCPresetFromEditor() {
  const s = getSettings();
  s.ooc_presets[s.active_ooc_preset] = {
    name: $('#bb-ooc-preset-name').val() || '未命名',
    prompt: $('#bb-ooc-preset-prompt').val()
  };
  saveSettings(); refreshOOCPresetSelector(); toastr.success('💾 破墙预设已保存');
}

// 主预设管理
function getActivePreset() {
  const s = getSettings();
  return s.prompt_presets[s.active_preset] || s.prompt_presets[0];
}
function refreshPresetSelector() {
  const s = getSettings();
  const sel = $('#bb-active-preset');
  sel.empty();
  s.prompt_presets.forEach((p, i) => sel.append(`<option value="${i}">${esc(p.name)}</option>`));
  sel.val(s.active_preset);
}
function createNewPreset() {
  const name = prompt('预设名称:'); if(!name) return;
  const s = getSettings();
  s.prompt_presets.push({ name, global: '', prompts: {...defaultSettings.prompt_presets[0].prompts}, blacklist: [] });
  s.active_preset = s.prompt_presets.length - 1;
  saveSettings(); refreshPresetSelector();
}
function deleteCurrentPreset() {
  const s = getSettings(); if(s.prompt_presets.length <= 1) return toastr.warning('保留至少一个');
  s.prompt_presets.splice(s.active_preset, 1); s.active_preset = 0; saveSettings(); refreshPresetSelector();
}
function loadPresetToEditor() {
  const p = getActivePreset();
  $('#bb-preset-name').val(p.name); $('#bb-preset-global').val(p.global || '');
  ['diary','summary','vibe','npc','fate','butterfly'].forEach(k => $(`#bb-preset-${k}`).val(p.prompts[k]||''));
}
function savePresetFromEditor() {
  const s = getSettings(); const p = s.prompt_presets[s.active_preset];
  p.name = $('#bb-preset-name').val(); p.global = $('#bb-preset-global').val();
  ['diary','summary','vibe','npc','fate','butterfly'].forEach(k => p.prompts[k] = $(`#bb-preset-${k}`).val());
  saveSettings(); refreshPresetSelector(); toastr.success('💾 全局预设已保存');
}

// ============================================
// API 调用 (Text & Img)
// ============================================

async function testAPIConnection() {
  const s = getSettings();
  const base = s.api_base.replace(/\/+$/, '');
  if (!base || !s.api_key) return toastr.warning('请填写 API Base 和 Key');
  $('#bb-api-status').html('<span style="color:orange;">⏳ 连接中...</span>');
  try {
    const res = await fetch(base.includes('/v1') ? `${base}/models` : `${base}/v1/models`, { headers: { Authorization: `Bearer ${s.api_key}` } });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    const models = json.data || json.models || [];
    if (!models.length) throw new Error('未找到可用模型');
    $('#bb-api-model').empty();
    models.forEach(m => $('#bb-api-model').append(`<option value="${m.id || m}">${m.id || m}</option>`));
    s.api_model = models[0].id || models[0]; saveSettings();
    $('#bb-api-status').html(`<span style="color:green;">✅ 成功获取 ${models.length} 个模型</span>`);
  } catch (e) { $('#bb-api-status').html(`<span style="color:red;">❌ ${e.message}</span>`); }
}

async function callSubAPI(messages, maxTokens = 500) {
  const s = getSettings();
  if (!s.api_base || !s.api_key || !s.api_model) { toastr.error('请配置大模型文本 API'); return null; }
  const preset = getActivePreset();
  if (preset.global) messages = [{ role: 'system', content: preset.global }, ...messages];
  try {
    const url = s.api_base.includes('/v1') ? `${s.api_base}/chat/completions` : `${s.api_base}/v1/chat/completions`;
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.api_key}` },
      body: JSON.stringify({ model: s.api_model, messages, max_tokens: maxTokens, temperature: 0.85 })
    });
    const json = await res.json();
    return (json.choices?.[0]?.message?.content || '').trim();
  } catch (e) { toastr.error(`API 异常: ${e.message}`); return null; }
}

// 生图占位接口 (支持简单扩展到真实SD/NAI)
async function callImgAPI(prompt) {
  const s = getSettings();
  // 此处预留真实请求的拼装逻辑
  // 仅作占位演示：返回Picsum带有随机Seed的图片
  return `https://picsum.photos/seed/${encodeURIComponent(prompt).substring(0,20) + Date.now()}/512/512`;
}

// ============================================
// 悬浮UI与主面板
// ============================================

function injectFloatingUI() {
  if ($('#bb-float-btn').length > 0) return;

  $('body').append(`
    <div id="bb-float-btn" title="骨与血面板" style="position:fixed;bottom:20px;right:20px;width:50px;height:50px;background:#000;border:2px solid #8b0000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.5);transition:transform 0.2s;">
      🦴
    </div>
  `);

  $('#bb-float-btn').on('click', () => {
    const p = $('#bb-main-panel');
    if(p.is(':visible')) p.hide(); else p.css('display', 'flex');
  });

  $('body').append(buildMainPanelHTML());
  bindMainPanelEvents();
  renderAll();
}

function buildMainPanelHTML() {
  const names = getTabNames();

  // 这里的核心修复：只使用单独的 display:none，并使用 flex-direction 备用
  return `
    <div id="bb-main-panel" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:800px;height:80%;max-height:700px;background:#1a1a1a;border:3px solid #8b0000;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.8);z-index:10000;overflow:hidden;flex-direction:column;">
      
      <div class="bb-header" style="background:#000;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #8b0000;">
        <div style="font-size:18px;font-weight:bold;">🦴 骨与血</div>
        <button id="bb-close-btn" style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer;">✖</button>
      </div>

      <div class="bb-nav" style="background:#222;display:flex;overflow-x:auto;border-bottom:1px solid #444;">
        <div class="bb-tab active" data-tab="home">${names.home}</div>
        <div class="bb-tab" data-tab="gallery">${names.gallery || '📸 画廊'}</div>
        <div class="bb-tab" data-tab="scrapbook">${names.scrapbook}</div>
        <div class="bb-tab" data-tab="diary">${names.diary}</div>
        <div class="bb-tab" data-tab="npc">${names.npc}</div>
        <div class="bb-tab" data-tab="parallel">${names.parallel}</div>
        <div class="bb-tab" data-tab="fate">${names.fate}</div>
        <div class="bb-tab" data-tab="ooc">${names.ooc}</div>
      </div>

      <div class="bb-content" style="flex:1;overflow-y:auto;padding:16px;background:#1a1a1a;color:#ddd;">
        
        <!-- 🏠 首页 (动态布局容器) -->
        <div id="bb-tab-home" class="bb-tab-panel active">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <select id="bb-home-layout-select" class="text_pole" style="padding:4px; font-size:12px;">
              <option value="music">🎵 一起听 (经典)</option>
              <option value="idcard">📇 档案卡</option>
              <option value="minimal">🌌 星空极简</option>
            </select>
          </div>
          <div id="bb-home-dynamic-layout" class="bb-home-card" style="background:#222;border:2px solid #444;border-radius:8px;padding:20px;margin-bottom:16px;">
            <!-- 由 JS 渲染注入 -->
          </div>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <button class="bb-sm-btn" id="bb-btn-set-user-avatar">📷 设置用户头像</button>
            <button class="bb-sm-btn" id="bb-btn-set-char-avatar">📷 设置角色头像</button>
            <button class="bb-sm-btn" id="bb-btn-save-home" style="background:#8b0000;border-color:#8b0000;">💾 保存首页配置</button>
          </div>
        </div>

        <!-- 📸 幻像画廊 -->
        <div id="bb-tab-gallery" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-gen-img">🎨 捕捉潜意识幻像</button>
          </div>
          <div id="bb-gallery-list" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:16px;"></div>
        </div>

        <!-- 🌟 唱片机 -->
        <div id="bb-tab-scrapbook" class="bb-tab-panel" style="display:none;">
          <div class="bb-export-bar" style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-export-md">📄 导出MD</button>
          </div>
          <div id="bb-records-list"></div>
        </div>

        <!-- 📖 日记本 -->
        <div id="bb-tab-diary" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-gen-diary-tab">📖 执笔</button>
          </div>
          <div id="bb-diary-list"></div>
        </div>

        <!-- 🧑‍🤝‍🧑 情报站 -->
        <div id="bb-tab-npc" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-add-npc">➕ 添加追踪</button>
            <button class="bb-sm-btn" id="bb-btn-auto-npc">🎲 自动感知</button>
          </div>
          <div id="bb-npc-box"></div>
        </div>

        <!-- 🦋 平行宇宙 -->
        <div id="bb-tab-parallel" class="bb-tab-panel" style="display:none;">
          <div id="bb-par-list"></div>
        </div>

        <!-- 🎲 命运盘 -->
        <div id="bb-tab-fate" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;justify-content:center;">
            <button class="bb-big-btn" id="bb-btn-roll-fate">🎲 转动命运之轮</button>
          </div>
          <div id="bb-fate-result" style="background:#222;border:2px solid #8b0000;border-radius:8px;padding:16px;text-align:center;min-height:80px;">等待命运降临...</div>
          <div id="bb-fate-history-list" style="margin-top:16px;"></div>
        </div>

        <!-- 💬 破墙聊天 (OOC) -->
        <div id="bb-tab-ooc" class="bb-tab-panel" style="display:none;">
          <div style="margin-bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
            <button class="bb-sm-btn" id="bb-btn-open-ooc-win">💬 打开 Burning Star chat</button>
            <button class="bb-sm-btn" id="bb-btn-clear-ooc">🗑️ 清空连结</button>
          </div>
          <div id="bb-ooc-preview" style="background:#222;border:2px solid #444;border-radius:8px;padding:16px;min-height:200px;overflow-y:auto;">
          </div>
        </div>

      </div>
    </div>
  `;
}

function getTabNames() {
  const s = getSettings();
  return STYLE_PRESETS[s.style_preset] || STYLE_PRESETS.gothic;
}

function refreshFloatingUI() {
  $('#bb-main-panel').remove();
  $('body').append(buildMainPanelHTML());
  bindMainPanelEvents();
  renderAll();
}

function bindMainPanelEvents() {
  $('#bb-close-btn').on('click', () => $('#bb-main-panel').hide());

  $('.bb-tab').on('click', function () {
    $('.bb-tab').removeClass('active'); $(this).addClass('active');
    $('.bb-tab-panel').hide(); $(`#bb-tab-${$(this).data('tab')}`).show();
  });

  // 头像上传统合逻辑
  $(document).on('click', '#bb-btn-set-user-avatar, #bb-btn-set-char-avatar', function () {
    const isUser = $(this).attr('id') === 'bb-btn-set-user-avatar';
    const url = prompt('输入图像 URL (或在日后更新支持本地上传):', isUser ? pluginData.home_config.user_avatar : pluginData.home_config.char_avatar);
    if(url !== null) {
       if (isUser) pluginData.home_config.user_avatar = url;
       else pluginData.home_config.char_avatar = url;
       saveChatData(); renderHomeLayout(); toastr.success('头像已更新');
    }
  });

  $('#bb-btn-save-home').on('click', function () {
    pluginData.home_config.link_emoji = $('#bb-home-link-emoji').text() || '💕';
    pluginData.home_config.user_bubble = $('#bb-home-user-bubble').text() || '...';
    pluginData.home_config.char_bubble = $('#bb-home-char-bubble').text() || '...';
    pluginData.home_config.radio_text = $('#bb-home-radio-text').text() || 'FM';
    saveChatData(); toastr.success('💾 首页配置已保存');
  });

  $('#bb-home-layout-select').on('change', function () {
    pluginData.home_config.layout = $(this).val();
    saveChatData(); renderHomeLayout();
  });

  $('#bb-btn-gen-img').on('click', generateGalleryImage);
  $('#bb-btn-export-md').on('click', exportAsMarkdown);
  $('#bb-btn-gen-diary-tab').on('click', generateDiary);
  $('#bb-btn-add-npc').on('click', () => {
    const n = prompt('NPC 名称:'); if(!n) return;
    pluginData.npc_status[n] = { description: '等待窥探...' }; saveChatData(); renderIntel();
  });
  $('#bb-btn-auto-npc').on('click', autoNPCPeek);
  $('#bb-btn-roll-fate').on('click', rollFate);
  $('#bb-btn-open-ooc-win').on('click', () => $('#bb-ooc-win').css('display', 'flex'));
  $('#bb-btn-clear-ooc').on('click', () => {
    if(!confirm('清空破墙记录?')) return;
    pluginData.ooc_chat = []; oocSession.history = []; saveChatData(); renderOOCPreview();
  });
}

// ============================================
// 子窗口系统 (破墙与平行宇宙)
// ============================================

function injectButterflyWindow() {
  if ($('#bb-bf-win').length > 0) return;
  // 核心修复：纯 display:none
  $('body').append(`
    <div id="bb-bf-win" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:600px;height:70%;background:#1a1a1a;border:3px solid #8b0000;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.8);z-index:10001;flex-direction:column;">
      <div style="background:#000;padding:12px;display:flex;justify-content:space-between;border-bottom:2px solid #8b0000;">
        <b style="color:#fff;">🦋 平行宇宙</b><button id="bb-bf-close" style="background:none;border:none;color:#fff;cursor:pointer;">✖</button>
      </div>
      <div id="bb-bf-origin" style="background:#222;padding:12px;color:#aaa;font-size:13px;max-height:80px;overflow-y:auto;"></div>
      <div id="bb-bf-chat" style="flex:1;overflow-y:auto;padding:12px;background:#1a1a1a;"></div>
      <div style="padding:12px;background:#222;display:flex;gap:8px;">
        <input id="bb-bf-input" type="text" style="flex:1;padding:8px;background:#333;color:#fff;border:1px solid #555;border-radius:4px;" />
        <button id="bb-bf-send" class="bb-sm-btn" style="background:#8b0000;border-color:#8b0000;">发送</button>
      </div>
    </div>
  `);
  $('#bb-bf-close').on('click', () => $('#bb-bf-win').hide());
  $('#bb-bf-send').on('click', sendBfMsg);
  $('#bb-bf-input').on('keypress', (e) => { if(e.which === 13) sendBfMsg(); });
}

function injectOOCWindow() {
  if ($('#bb-ooc-win').length > 0) return;
  $('body').append(`
    <div id="bb-ooc-win" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:600px;height:70%;background:#1a1a1a;border:3px solid #8b0000;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.8);z-index:10001;flex-direction:column;">
      <div style="background:#000;padding:12px;display:flex;justify-content:space-between;border-bottom:2px solid #8b0000;">
        <b style="color:#fff;">Burning Star chat</b><button id="bb-ooc-close" style="background:none;border:none;color:#fff;cursor:pointer;">✖</button>
      </div>
      <div id="bb-ooc-chat" style="flex:1;overflow-y:auto;padding:12px;background:#1a1a1a;"></div>
      <div style="padding:12px;background:#222;display:flex;gap:8px;">
        <input id="bb-ooc-input" type="text" placeholder="穿越屏幕的讯息..." style="flex:1;padding:8px;background:#333;color:#fff;border:1px solid #555;border-radius:4px;" />
        <button id="bb-ooc-send" class="bb-sm-btn" style="background:#8b0000;border-color:#8b0000;">发送</button>
      </div>
    </div>
  `);
  $('#bb-ooc-close').on('click', () => $('#bb-ooc-win').hide());
  $('#bb-ooc-send').on('click', sendOOCMsg);
  $('#bb-ooc-input').on('keypress', (e) => { if(e.which === 13) sendOOCMsg(); });
}

// ============================================
// OOC & BF 逻辑
// ============================================

function openBfWin(messageId) {
  const msg = getContext().chat[messageId]; if (!msg) return;
  butterflySession = { active: true, originFloor: messageId, originText: msg.mes, history: [] };
  $('#bb-bf-origin').html(`<b>原文 #${messageId}:</b> ${esc(msg.mes.substring(0, 150))}...`);
  $('#bb-bf-chat').empty();
  $('#bb-bf-win').css('display', 'flex'); // 唤起窗口
}

async function sendBfMsg() {
  const input = $('#bb-bf-input'); const text = input.val().trim(); if(!text) return;
  input.val(''); addChatBubble('#bb-bf-chat', 'user', text);
  butterflySession.history.push({role:'user', content:text});
  
  if (butterflySession.history.length === 1) {
    const preset = getActivePreset();
    const result = await callSubAPI([{role:'system', content: `${preset.prompts.butterfly}\n原文:${butterflySession.originText}\n选择:${text}`}], 600);
    if(result) {
      addChatBubble('#bb-bf-chat', 'assistant', result);
      butterflySession.history.push({role:'assistant', content:result});
      pluginData.parallel_universes.push({ floor: butterflySession.originFloor, origin: butterflySession.originText, content: result, date: new Date().toLocaleString() });
      saveChatData(); renderParallel();
    }
  } else {
    const reply = await callSubAPI([{role:'system', content: getActivePreset().prompts.butterfly}, ...butterflySession.history]);
    if(reply) { addChatBubble('#bb-bf-chat', 'assistant', reply); butterflySession.history.push({role:'assistant', content:reply}); }
  }
}

async function sendOOCMsg() {
  const input = $('#bb-ooc-input'); const text = input.val().trim(); if(!text) return;
  input.val(''); addChatBubble('#bb-ooc-chat', 'user', text);
  pluginData.ooc_chat.push({role:'user', content:text, timestamp:new Date().toLocaleString()});
  oocSession.history.push({role:'user', content:text}); saveChatData(); renderOOCPreview();

  const ctx = getContext();
  const oocPreset = getActiveOOCPreset().prompt;
  const sysPrompt = `${oocPreset}\n\n当前角色名: ${ctx.name2}\n用户名: ${ctx.name1}`;
  
  const reply = await callSubAPI([{role:'system', content: sysPrompt}, ...oocSession.history], 400);
  if(reply) {
    pluginData.ooc_chat.push({role:'assistant', content:reply, timestamp:new Date().toLocaleString()});
    oocSession.history.push({role:'assistant', content:reply});
    addChatBubble('#bb-ooc-chat', 'assistant', reply); saveChatData(); renderOOCPreview();
  }
}

function addChatBubble(container, role, text) {
  const isUser = role === 'user';
  $(container).append(`
    <div style="display:flex;justify-content:${isUser?'flex-end':'flex-start'};margin-bottom:12px;">
      <div style="background:${isUser?'#444':'#8b0000'};color:#fff;padding:10px 14px;border-radius:${isUser?'18px 18px 4px 18px':'18px 18px 18px 4px'};max-width:80%;font-size:14px;word-wrap:break-word;">
        ${esc(text)}
      </div>
    </div>
  `);
  $(container).scrollTop($(container)[0].scrollHeight);
}

// ============================================
// 渲染逻辑
// ============================================

function renderAll() {
  renderHomeLayout();
  renderGallery();
  renderScrapbook();
  renderDiary();
  renderIntel();
  renderParallel();
  renderFateHistory();
  renderOOCPreview();
  // 保持恢复 OOC DOM
  $('#bb-ooc-chat').empty(); pluginData.ooc_chat.forEach(m => addChatBubble('#bb-ooc-chat', m.role, m.content));
}

// 动态渲染不同首页布局
function renderHomeLayout() {
  const ctx = getContext();
  const layout = pluginData.home_config.layout || 'music';
  $('#bb-home-layout-select').val(layout);
  
  const cAvatar = pluginData.home_config.char_avatar || 'https://via.placeholder.com/60/8b0000/fff?text=C';
  const uAvatar = pluginData.home_config.user_avatar || 'https://via.placeholder.com/60/444444/fff?text=U';
  const cName = ctx.name2 || '角色';
  const uName = ctx.name1 || '用户';
  const cBub = pluginData.home_config.char_bubble;
  const uBub = pluginData.home_config.user_bubble;
  const emo = pluginData.home_config.link_emoji;
  const rad = pluginData.home_config.radio_text;

  let html = '';

  if (layout === 'music') {
    // 经典 一起听 布局
    html = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${uAvatar}" id="bb-home-user-avatar-img" style="width:60px;height:60px;border-radius:50%;border:2px solid #8b0000;object-fit:cover;" />
          <b style="color:#fff;">${esc(uName)}</b>
        </div>
        <div id="bb-home-link-emoji" contenteditable="true" style="font-size:36px;">${emo}</div>
        <div style="display:flex;align-items:center;gap:12px;">
          <b style="color:#fff;">${esc(cName)}</b>
          <img src="${cAvatar}" id="bb-home-char-avatar-img" style="width:60px;height:60px;border-radius:50%;border:2px solid #8b0000;object-fit:cover;" />
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
        <div style="align-self:flex-start;background:#444;padding:10px 14px;border-radius:18px 18px 18px 4px;"><div id="bb-home-user-bubble" contenteditable="true">${esc(uBub)}</div></div>
        <div style="align-self:flex-end;background:#8b0000;padding:10px 14px;border-radius:18px 18px 4px 18px;"><div id="bb-home-char-bubble" contenteditable="true">${esc(cBub)}</div></div>
      </div>
      <div style="text-align:center;background:#1a1a1a;padding:16px;border-radius:8px;">
        <div style="font-size:12px;color:#aaa;">🎵 正在一起听</div>
        <div id="bb-home-radio-text" contenteditable="true" style="font-size:18px;color:#fff;margin-top:8px;">${esc(rad)}</div>
      </div>
    `;
  } else if (layout === 'idcard') {
    // 档案卡布局
    html = `
      <div style="display:flex;gap:16px;">
        <div style="flex:1;background:#1a1a1a;padding:16px;border-radius:8px;text-align:center;border-top:3px solid #444;">
          <img src="${uAvatar}" style="width:80px;height:80px;border-radius:8px;object-fit:cover;margin-bottom:12px;"/>
          <div style="color:#fff;font-weight:bold;">${esc(uName)}</div>
          <div id="bb-home-user-bubble" contenteditable="true" style="color:#aaa;font-size:12px;margin-top:8px;">${esc(uBub)}</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
           <div id="bb-home-link-emoji" contenteditable="true" style="font-size:32px;">${emo}</div>
           <div id="bb-home-radio-text" contenteditable="true" style="font-size:11px;color:#888;">${esc(rad)}</div>
        </div>
        <div style="flex:1;background:#1a1a1a;padding:16px;border-radius:8px;text-align:center;border-top:3px solid #8b0000;">
          <img src="${cAvatar}" style="width:80px;height:80px;border-radius:8px;object-fit:cover;margin-bottom:12px;"/>
          <div style="color:#fff;font-weight:bold;">${esc(cName)}</div>
          <div id="bb-home-char-bubble" contenteditable="true" style="color:#aaa;font-size:12px;margin-top:8px;">${esc(cBub)}</div>
        </div>
      </div>
    `;
  } else {
    // 星空极简
    html = `
      <div style="text-align:center;padding:20px 0;">
        <div style="display:flex;justify-content:center;align-items:center;margin-bottom:16px;">
           <img src="${uAvatar}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;border:1px solid #444;transform:translateX(15px);z-index:2;"/>
           <img src="${cAvatar}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;border:1px solid #8b0000;transform:translateX(-15px);z-index:1;"/>
        </div>
        <div style="font-size:18px;letter-spacing:2px;color:#fff;margin-bottom:8px;">
          ${esc(uName)} <span id="bb-home-link-emoji" contenteditable="true" style="font-size:14px;color:#8b0000;">${emo}</span> ${esc(cName)}
        </div>
        <div style="font-size:12px;color:#666;font-style:italic;">
           "<span id="bb-home-char-bubble" contenteditable="true">${esc(cBub)}</span>"
           <span style="display:none;" id="bb-home-user-bubble">${esc(uBub)}</span>
           <span style="display:none;" id="bb-home-radio-text">${esc(rad)}</span>
        </div>
      </div>
    `;
  }
  $('#bb-home-dynamic-layout').html(html);
}

function renderGallery() {
  const list = $('#bb-gallery-list'); list.empty();
  if (pluginData.gallery.length === 0) { list.html('<div style="width:100%;text-align:center;color:#666;padding:20px;">潜意识海洋空空如也...</div>'); return; }
  pluginData.gallery.slice().reverse().forEach((img, idx) => {
    list.append(`
      <div style="background:#222;border:1px solid #444;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;">
        <img src="${img.url}" style="width:100%;height:150px;object-fit:cover;" />
        <div style="padding:8px;font-size:11px;color:#aaa;line-height:1.4;">
          ${esc(img.prompt)}<br/>
          <div style="margin-top:6px;display:flex;justify-content:space-between;">
             <span>${img.date}</span>
             <span class="bb-img-del" data-id="${img.id}" style="cursor:pointer;color:#8b0000;">🗑️</span>
          </div>
        </div>
      </div>
    `);
  });
  $('.bb-img-del').on('click', function() {
    pluginData.gallery = pluginData.gallery.filter(i => i.id != $(this).data('id'));
    saveChatData(); renderGallery();
  });
}

async function generateGalleryImage() {
  toastr.info('🎨 正在从意象海洋中打捞画作...');
  const promptTxt = await callSubAPI([{role:'system', content:'Summarize current scene visual keywords in english, comma separated.'}, {role:'user', content:fmt(getRecentChat(10))}], 50);
  const prompt = promptTxt || 'masterpiece, abstract, mysterious scene';
  
  const imgUrl = await callImgAPI(prompt);
  if(imgUrl) {
    pluginData.gallery.push({ id: Date.now(), url: imgUrl, prompt: prompt, date: new Date().toLocaleDateString() });
    saveChatData(); renderGallery(); toastr.success('🎨 画作具现完成');
  }
}

function renderScrapbook() {
  const list = $('#bb-records-list'); list.empty();
  pluginData.records_bone.forEach((r, i) => list.append(`
    <div style="background:#222;border:1px solid #444;border-radius:8px;padding:12px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;color:#8b0000;font-weight:bold;margin-bottom:8px;">
        <span>${esc(r.character)}</span>
        <span class="bb-scrap-del" data-idx="${i}" style="cursor:pointer;">🗑️</span>
      </div>
      <div>${esc(r.text)}</div>
    </div>
  `));
  $('.bb-scrap-del').on('click', function(){ pluginData.records_bone.splice($(this).data('idx'),1); saveChatData(); renderScrapbook(); });
}

function renderDiary() {
  const list = $('#bb-diary-list'); list.empty();
  pluginData.diary_blood.forEach((d, i) => list.append(`
    <div style="background:#222;border:1px solid #444;border-radius:8px;padding:12px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;color:#8b0000;margin-bottom:8px;"><span>${d.date}</span><span class="bb-diary-del" data-idx="${i}" style="cursor:pointer;">🗑️</span></div>
      <div style="white-space:pre-wrap;">${esc(d.content)}</div>
    </div>
  `));
  $('.bb-diary-del').on('click', function(){ pluginData.diary_blood.splice($(this).data('idx'),1); saveChatData(); renderDiary(); });
}

function renderIntel() {
  const box = $('#bb-npc-box'); box.empty();
  Object.keys(pluginData.npc_status).forEach(k => box.append(`
    <div style="background:#222;padding:12px;border:1px solid #444;border-radius:8px;margin-bottom:12px;">
       <b style="color:#8b0000;">${esc(k)}</b>
       <div style="margin:8px 0;font-size:13px;">${esc(pluginData.npc_status[k].description)}</div>
       <button class="bb-sm-btn bb-npc-peek" data-k="${esc(k)}">刷新状态</button>
       <button class="bb-sm-btn bb-npc-del" data-k="${esc(k)}">移除</button>
    </div>
  `));
  $('.bb-npc-peek').on('click', function(){ generateNPCStatus($(this).data('k')); });
  $('.bb-npc-del').on('click', function(){ delete pluginData.npc_status[$(this).data('k')]; saveChatData(); renderIntel(); });
}

function renderParallel() {
  const list = $('#bb-par-list'); list.empty();
  pluginData.parallel_universes.forEach((p,i) => list.append(`
    <div style="background:#222;padding:12px;border:1px solid #444;border-radius:8px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;color:#8b0000;"><b>#${p.floor}</b><span class="bb-par-del" data-idx="${i}" style="cursor:pointer;">🗑️</span></div>
      <div style="color:#aaa;font-size:12px;margin:8px 0;">原点: ${esc(p.origin.substring(0,50))}...</div>
      <div>${esc(p.content)}</div>
    </div>
  `));
  $('.bb-par-del').on('click', function(){ pluginData.parallel_universes.splice($(this).data('idx'),1); saveChatData(); renderParallel(); });
}

function renderFateHistory() {
  const list = $('#bb-fate-history-list'); list.empty();
  pluginData.fate_history.slice(-5).forEach(f => list.append(`<div style="background:#111;padding:8px;border-radius:4px;margin-bottom:8px;font-size:13px;border-left:2px solid #8b0000;">${esc(f.content)}</div>`));
}

function renderOOCPreview() {
  const box = $('#bb-ooc-preview'); box.empty();
  if (pluginData.ooc_chat.length === 0) {
    box.html('<div style="text-align:center;color:#666;padding:40px;">这里是跨越次元的聊天窗口，点击上方按钮，和ta聊聊剧本之外的故事吧！</div>');
    return;
  }
  pluginData.ooc_chat.slice(-5).forEach(m => {
    box.append(`<div style="margin-bottom:8px;color:${m.role==='user'?'#aaa':'#ddd'};"><b>${m.role==='user'?'你':'TA'}:</b> ${esc(m.content)}</div>`);
  });
}

// ============================================
// 核心互动逻辑
// ============================================

async function generateDiary() {
  toastr.info('📖 正在落笔...');
  const res = await callSubAPI([{role:'system', content: getActivePreset().prompts.diary}, {role:'user', content:fmt(getRecentChat(20))}]);
  if(res){ pluginData.diary_blood.push({date:new Date().toLocaleString(), content:res}); saveChatData(); renderDiary(); }
}
async function generateNPCStatus(name) {
  toastr.info(`🔍 探查 ${name}...`);
  const res = await callSubAPI([{role:'system', content: `${getActivePreset().prompts.npc}\nNPC: ${name}`}, {role:'user', content:fmt(getRecentChat(30))}]);
  if(res){ pluginData.npc_status[name] = {description:res}; saveChatData(); renderIntel(); }
}
async function autoNPCPeek() {
  const res = await callSubAPI([{role:'system', content:'提取对话中的1个NPC名字，只返回名字，无则返回空'}, {role:'user', content:fmt(getRecentChat(10))}], 50);
  if(res && res.length<20) { if(!pluginData.npc_status[res]) pluginData.npc_status[res]={description:'...'}; generateNPCStatus(res); }
}
async function rollFate() {
  toastr.info('🎲 命运转动...');
  const res = await callSubAPI([{role:'system', content: getActivePreset().prompts.fate}, {role:'user', content:fmt(getRecentChat(10))}]);
  if(res){ 
    $('#bb-fate-result').text(res);
    pluginData.fate_history.push({content:res}); saveChatData(); renderFateHistory(); 
  }
}

// 事件挂载
function registerEventListeners() {
  eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (id) => { injectMessageButtons(id); });
  eventSource.on(event_types.USER_MESSAGE_RENDERED, (id) => { injectMessageButtons(id); });
  eventSource.on(event_types.CHAT_CHANGED, () => { loadChatData(); setTimeout(() => injectButtonsToExistingMessages(), 500); });
}

function injectButtonsToExistingMessages() {
  const ctx = getContext(); if(!ctx.chat) return;
  ctx.chat.forEach((_, idx) => injectMessageButtons(idx));
}

function injectMessageButtons(mid) {
  const el = $(`.mes[mesid="${mid}"]`); if(el.length===0 || el.find('.bb-btn-star').length>0) return;
  el.find('.extraMesButtons').first().append(`<span style="cursor:pointer;margin-left:6px;" class="bb-btn-star" data-mid="${mid}">🌟</span><span style="cursor:pointer;margin-left:6px;" class="bb-btn-butterfly" data-mid="${mid}">🦋</span>`);
  el.find('.bb-btn-star').on('click', function(){ collectMessage($(this).data('mid')); });
  el.find('.bb-btn-butterfly').on('click', function(){ openBfWin($(this).data('mid')); });
}

function collectMessage(mid) {
  const msg = getContext().chat[mid]; if(!msg) return;
  pluginData.records_bone.push({ character: msg.name||(msg.is_user?'你':'TA'), text: msg.mes, timestamp: new Date().toLocaleString() });
  saveChatData(); renderScrapbook(); toastr.success('🌟 语录已收藏');
}

// 辅助工具
function getRecentChat(n=20){ const ctx=getContext(); return ctx.chat ? ctx.chat.slice(-n) : []; }
function fmt(msgs){ const ctx=getContext(); return msgs.map(m=>`${m.is_user?ctx.name1:ctx.name2}: ${m.mes}`).join('\n\n'); }
function esc(t){ return $('<div>').text(t||'').html(); }
function startWorldFeed(){} // Placeholder
function checkAchievements(){} // Placeholder

// 宏注册
function registerAllMacros() {
  if (typeof MacrosParser !== 'undefined') {
    MacrosParser.registerMacro('bb_diary', () => pluginData.diary_blood.length ? pluginData.diary_blood[pluginData.diary_blood.length-1].content : '');
  }
}

// 数据读写
function saveChatData() { const ctx = getContext(); if(ctx.chatId) localStorage.setItem(`bb_data_${ctx.chatId}`, JSON.stringify(pluginData)); }
function loadChatData() {
  pluginData.gallery = []; pluginData.records_bone = []; pluginData.diary_blood = []; pluginData.ooc_chat = [];
  const ctx = getContext(); if(ctx.chatId) {
    try { const d = localStorage.getItem(`bb_data_${ctx.chatId}`); if(d) Object.assign(pluginData, JSON.parse(d)); }catch(e){}
  }
  if (!pluginData.gallery) pluginData.gallery = [];
  renderAll();
}

// 导出
function exportAsMarkdown() {
  let md = `# 🦴 骨与血记录\n\n`;
  pluginData.records_bone.forEach(r => md+=`> **${r.character}**: ${r.text}\n\n`);
  const blob = new Blob([md], {type:'text/markdown'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `BB_${Date.now()}.md`; a.click();
}

function applyCustomCSS() {
  $('#bb-custom-style').remove();
  $('head').append(`<style id="bb-custom-style">${getSettings().custom_css || ''}</style>`);
}







