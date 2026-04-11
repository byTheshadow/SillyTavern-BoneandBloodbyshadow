// ============================================
// 🦴 骨与血 (Bone & Blood) v0.3.0
// SillyTavern 沉浸式风味增强与记忆手账插件
// ============================================

import { extension_settings, getContext } from '../../../extensions.js';
import { saveSettingsDebounced, eventSource, event_types } from '../../../../script.js';

const EXTENSION_NAME = 'third-party/SillyTavern-BoneandBloodbyshadow';

// ---- 默认设置 ----
const defaultSettings = {
  enabled: true,
  api_base: '',
  api_key: '',
  api_model: '',
  auto_diary_enabled: true,
  diary_trigger_count: 30,
  message_counter: 0,
};

// ---- 运行时数据 ----
let pluginData = {
  records_bone: [],
  diary_blood: [],
  summaries: [],
  weather: '',
  npc_status: {},
  chaos_event: '',
  vibe: '',
  parallel_universes: [],
};

// ---- 蝴蝶分支会话 ----
let butterflySession = {
  active: false,
  originFloor: null,
  originText: '',
  history: [],
};

// ============================================
// 入口
// ============================================

jQuery(async () => {
  console.log('[骨与血] 🦴 v0.3.0 开始加载...');

  // 1. 初始化设置
  if (!extension_settings[EXTENSION_NAME]) {
    extension_settings[EXTENSION_NAME] = {};
  }
  extension_settings[EXTENSION_NAME] = Object.assign(
    {},
    defaultSettings,
    extension_settings[EXTENSION_NAME],
  );

  // 2. 直接注入设置面板 HTML（不依赖外部文件，最稳定）
  $('#extensions_settings').append(buildSettingsPanelHTML());

  // 3. 填入已保存的设置
  loadSettingsToForm();

  // 4. 绑定设置面板事件
  bindSettingsPanelEvents();

  // 5. 注入悬浮UI
  injectFloatingUI();

  // 6. 注入蝴蝶窗口
  injectButterflyWindow();

  // 7. 注册事件
  registerEventListeners();

  // 8. 注册宏
  registerAllMacros();

  // 9. 加载聊天数据
  loadChatData();

  // 10. 为已有消息注入按钮
  setTimeout(() => injectButtonsToExistingMessages(), 800);

  console.log('[骨与血] ✅ v0.3.0 加载完成！');
});

// ============================================
// 设置面板 HTML 构建（内联，不依赖外部文件）
// ============================================

function buildSettingsPanelHTML() {
  return `
  <div id="bb-extension-settings">
    <div class="inline-drawer">
      <div class="inline-drawer-toggle inline-drawer-header">
        <b>🦴 骨与血 (Bone & Blood)</b>
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
        <h4 style="margin:8px 0 4px;">📡 副 API 配置</h4>

        <div style="margin:6px 0;">
          <label for="bb-api-base" style="font-size:13px;display:block;margin-bottom:2px;">API Base URL:</label>
          <input id="bb-api-base" type="text" class="text_pole" placeholder="https://api.openai.com/v1" style="width:100%;" />
          <small style="color:#888;font-size:11px;">填到 /v1 即可，不要带 /chat/completions</small>
        </div>

        <div style="margin:6px 0;">
          <label for="bb-api-key" style="font-size:13px;display:block;margin-bottom:2px;">API Key:</label>
          <input id="bb-api-key" type="password" class="text_pole" placeholder="sk-..." style="width:100%;" />
        </div>

        <div style="margin:8px 0;">
          <input id="bb-btn-test-api" class="menu_button" type="button" value="🔗 测试连接 & 获取模型" style="width:100%;" />
          <div id="bb-api-status" style="margin-top:4px;font-size:13px;min-height:20px;"></div>
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
        <h4 style="margin:8px 0 4px;">🔧 手动操作</h4>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          <input id="bb-btn-diary" class="menu_button" type="button" value="📖 生成日记" />
          <input id="bb-btn-summary" class="menu_button" type="button" value="📜 生成总结" />
          <input id="bb-btn-weather" class="menu_button" type="button" value="☁️ 刷新环境" />
          <input id="bb-btn-vibe" class="menu_button" type="button" value="❤️ 分析氛围" />
        </div>

        <hr />
        <div style="color:#888;font-size:11px;padding:4px 0;">
          💡 点击右下角 🦴 打开主面板 | v0.3.0
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================
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
  if (s.api_model) {
    $('#bb-api-model').empty().append(`<option value="${s.api_model}" selected>${s.api_model}</option>`);
  }
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
  $('#bb-api-model').on('change', function () {
    getSettings().api_model = $(this).val();
    saveSettings();
  });
  $('#bb-diary-trigger').on('input', function () {
    getSettings().diary_trigger_count = parseInt($(this).val()) || 30;
    saveSettings();
  });
  $('#bb-auto-diary').on('change', function () {
    getSettings().auto_diary_enabled = $(this).is(':checked');
    saveSettings();
  });

  $('#bb-btn-test-api').on('click', () => testAPIConnection());
  $('#bb-btn-diary').on('click', () => generateDiary());
  $('#bb-btn-summary').on('click', () => generateSummary());
  $('#bb-btn-weather').on('click', () => generateWeather());
  $('#bb-btn-vibe').on('click', () => generateVibe());
}

// ============================================
// API 连接测试 & 模型获取
// ============================================

async function testAPIConnection() {
  const s = getSettings();
  const statusEl = $('#bb-api-status');
  const selectEl = $('#bb-api-model');
  const btn = $('#bb-btn-test-api');

  if (!s.api_base || !s.api_key) {
    statusEl.html('<span style="color:#ff6b6b;">❌ 请先填写 Base URL 和 Key</span>');
    return;
  }

  btn.val('⏳ 连接中...').prop('disabled', true);
  statusEl.html('<span style="color:#f0ad4e;">⏳ 正在连接...</span>');

  try {
    let base = s.api_base.replace(/\/+$/, '');
    if (base.endsWith('/chat/completions')) base = base.replace('/chat/completions', '');
    if (!base.endsWith('/v1') && !base.includes('/v1/')) {
      // 如果用户没填 /v1 尝试自动补
    }

    const res = await fetch(`${base}/models`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${s.api_key}` },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data = await res.json();
    const models = data.data || data.models || [];

    if (!Array.isArray(models) || models.length === 0) {
      statusEl.html('<span style="color:#f0ad4e;">⚠️ 连接成功，但未获取到模型</span>');
      selectEl.empty().append('<option value="">-- 未找到模型 --</option>');
    } else {
      const ids = models.map(m => (typeof m === 'string' ? m : m.id)).filter(Boolean).sort();
      selectEl.empty();
      ids.forEach(id => {
        const sel = id === s.api_model ? 'selected' : '';
        selectEl.append(`<option value="${id}" ${sel}>${id}</option>`);
      });
      if (!s.api_model && ids.length > 0) {
        s.api_model = ids[0];
        selectEl.val(ids[0]);
        saveSettings();
      }
      statusEl.html(`<span style="color:#4ecdc4;">✅ 连接成功！共 ${ids.length} 个模型</span>`);
    }
  } catch (err) {
    console.error('[骨与血] API测试失败:', err);
    statusEl.html(`<span style="color:#ff6b6b;">❌ 失败: ${err.message}</span>`);
  }

  btn.val('🔗 测试连接 & 获取模型').prop('disabled', false);
}

// ============================================
// 副 API 通用调用
// ============================================

async function callSubAPI(messages, maxTokens = 500) {
  const s = getSettings();
  if (!s.api_base || !s.api_key || !s.api_model) {
    toastr.warning('请先配置并测试副 API');
    return null;
  }

  try {
    let base = s.api_base.replace(/\/+$/, '');
    if (base.endsWith('/chat/completions')) base = base.replace('/chat/completions', '');

    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${s.api_key}`,
      },
      body: JSON.stringify({
        model: s.api_model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.8,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`${res.status}: ${txt.substring(0, 200)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('[骨与血] API调用失败:', err);
    toastr.error(`API调用失败: ${err.message}`);
    return null;
  }
}

function getRecentChat(count = 30) {
  const ctx = getContext();
  const chat = ctx.chat;
  if (!chat || chat.length === 0) return [];
  return chat.slice(-count).map(m => ({
    role: m.is_user ? 'user' : 'assistant',
    name: m.name,
    content: m.mes,
  }));
}

function fmt(messages) {
  return messages.map(m => `${m.name}: ${m.content}`).join('\n').substring(0, 3000);
}

// ============================================
// 悬浮 UI
// ============================================

function injectFloatingUI() {
  $('body').append(`<div id="bb-float-button" title="骨与血">🦴</div>`);

  const panel = $(`
  <div id="bb-panel" class="bb-panel-hidden">
    <div class="bb-panel-header">
      <span class="bb-panel-title">🦴 骨与血</span>
      <span id="bb-char-info" class="bb-panel-char"></span>
      <button class="bb-panel-close">✕</button>
    </div>
    <div class="bb-panel-content">

      <!-- 🌟 唱片机 -->
      <div class="bb-tab" id="bb-tab-scrapbook">
        <h3>🌟 唱片机</h3>
        <div class="bb-export-bar" style="display:none;">
          <button class="bb-sm-btn" id="bb-export-md">📄 MD</button>
          <button class="bb-sm-btn" id="bb-export-json">📦 JSON</button>
        </div>
        <p class="bb-empty" id="bb-scrap-empty">点击消息旁的 🌟 收藏语录</p>
        <div id="bb-records-list"></div>
      </div>

      <!-- 📖 日记本 -->
      <div class="bb-tab bb-hidden" id="bb-tab-diary">
        <h3>📖 日记本 <button class="bb-sm-btn" id="bb-gen-diary">✍️ 生成</button></h3>
        <p class="bb-empty" id="bb-diary-empty">角色还没有写日记...</p>
        <div id="bb-diary-list"></div>
      </div>

      <!-- 📻 情报站 -->
      <div class="bb-tab bb-hidden" id="bb-tab-intel">
        <h3>📻 情报站</h3>
        <div class="bb-section">
          <h4>📜 阿卡夏记录 <button class="bb-sm-btn bb-do-summary">🔄</button></h4>
          <div id="bb-summary-box" class="bb-box">暂无总结</div>
        </div>
        <div class="bb-section">
          <h4>☁️ 环境雷达 <button class="bb-sm-btn bb-do-weather">🔄</button></h4>
          <div id="bb-weather-box" class="bb-box">未检测</div>
        </div>
        <div class="bb-section">
          <h4>❤️ 氛围心电图 <button class="bb-sm-btn bb-do-vibe">🔄</button></h4>
          <div id="bb-vibe-box" class="bb-box">未检测</div>
        </div>
        <div class="bb-section">
          <h4>🗺️ NPC 动态 <button class="bb-sm-btn bb-add-npc">➕</button></h4>
          <div id="bb-npc-box"></div>
        </div>
      </div>

      <!-- 🦋 观测站 -->
      <div class="bb-tab bb-hidden" id="bb-tab-parallel">
        <h3>🦋 观测站</h3>
        <p class="bb-empty" id="bb-par-empty">点击消息旁 🦋 探索平行宇宙</p>
        <div id="bb-par-list"></div>
      </div>

      <!-- 🃏 命运盘 -->
      <div class="bb-tab bb-hidden" id="bb-tab-fate">
        <h3>🃏 命运盘</h3>
        <p class="bb-hint">骰子生成突发事件 → <code>{{bb_chaos_event}}</code></p>
        <button id="bb-roll-fate" class="bb-big-btn">🎲 摇骰子！</button>
        <div id="bb-fate-result" class="bb-box"></div>
      </div>

    </div>
    <div class="bb-panel-nav">
      <button class="bb-nav bb-nav-active" data-t="scrapbook">🌟</button>
      <button class="bb-nav" data-t="diary">📖</button>
      <button class="bb-nav" data-t="intel">📻</button>
      <button class="bb-nav" data-t="parallel">🦋</button>
      <button class="bb-nav" data-t="fate">🃏</button>
    </div>
  </div>`);
  $('body').append(panel);

  // 绑定
  $('#bb-float-button').on('click', () => {
    $('#bb-panel').toggleClass('bb-panel-hidden');
    updateCharInfo();
  });
  $('.bb-panel-close').on('click', () => $('#bb-panel').addClass('bb-panel-hidden'));

  // 导航
  $('.bb-nav').on('click', function () {
    const t = $(this).data('t');
    $('.bb-nav').removeClass('bb-nav-active');
    $(this).addClass('bb-nav-active');
    $('.bb-tab').addClass('bb-hidden');
    $(`#bb-tab-${t}`).removeClass('bb-hidden');
  });

  // 按钮
  $('#bb-roll-fate').on('click', () => rollFate());
  $('#bb-export-md').on('click', () => exportAsMarkdown());
  $('#bb-export-json').on('click', () => exportAsJSON());
  $('#bb-gen-diary').on('click', () => generateDiary());
  $('.bb-do-summary').on('click', () => generateSummary());
  $('.bb-do-weather').on('click', () => generateWeather());
  $('.bb-do-vibe').on('click', () => generateVibe());
  $('.bb-add-npc').on('click', () => {
    const n = prompt('输入NPC名字:');
    if (n && n.trim()) generateNPCStatus(n.trim());
  });
}

function updateCharInfo() {
  const ctx = getContext();
  $('#bb-char-info').text(ctx.name2 ? `💬 ${ctx.name2}` : '');
}

// ============================================
// 🦋 蝴蝶窗口
// ============================================

function injectButterflyWindow() {
  $('body').append(`
  <div id="bb-bf-win" class="bb-hidden">
    <div class="bb-bf-hdr">
      <span>🦋 平行宇宙</span>
      <div>
        <button class="bb-bf-export" title="导出">📄</button>
        <button class="bb-bf-close" title="关闭">✕</button>
      </div>
    </div>
    <div class="bb-bf-origin"></div>
    <div class="bb-bf-chat"></div>
    <div class="bb-bf-input-row">
      <textarea class="bb-bf-input" placeholder="在平行宇宙中说点什么..." rows="2"></textarea>
      <button class="bb-bf-send">发送</button>
    </div>
  </div>`);

  $('.bb-bf-close').on('click', () => {
    $('#bb-bf-win').addClass('bb-hidden');
    butterflySession.active = false;
  });
  $('.bb-bf-send').on('click', () => sendBfMsg());
  $('.bb-bf-input').on('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBfMsg(); }
  });
  $('.bb-bf-export').on('click', () => exportBfChat());
}

function openBfWin(msgId) {
  const ctx = getContext();
  const msg = ctx.chat[msgId];
  if (!msg) return;

  butterflySession = { active: true, originFloor: msgId, originText: msg.mes, history: [] };
  $('.bb-bf-origin').html(`<b>#${msgId}:</b> ${esc(msg.mes.substring(0, 200))}...`);
  $('.bb-bf-chat').empty();
  $('.bb-bf-input').val('');
  $('#bb-bf-win').removeClass('bb-hidden');

  genBfFirst(msg);
}

async function genBfFirst(msg) {
  const ctx = getContext();
  const cn = ctx.name2 || '角色';
  addBfBubble('sys', '🌀 撕裂时空中...');

  const msgs = [
    { role: 'system', content: `你正在一个"平行宇宙"分支中。原剧情中角色说了如下内容。在平行宇宙中，角色做出截然相反或离谱的选择。请以"${cn}"身份角色扮演这个分支（100-200字）。之后用户会继续互动，保持设定。` },
    { role: 'user', content: `原文："${msg.mes.substring(0, 800)}"\n\n开始平行宇宙：` },
  ];

  const r = await callSubAPI(msgs, 800);
  $('.bb-bf-chat .bb-bf-sys').last().remove();

  if (r) {
    butterflySession.history = [...msgs, { role: 'assistant', content: r }];
    addBfBubble('ai', r);
    pluginData.parallel_universes.push({
      id: `par-${Date.now()}`, origin: msg.mes.substring(0, 80),
      content: r, floor: butterflySession.originFloor,
      date: new Date().toLocaleString('zh-CN'),
    });
    saveChatData();
    renderParallel();
  } else {
    addBfBubble('sys', '❌ 生成失败');
  }
}

async function sendBfMsg() {
  const txt = $('.bb-bf-input').val().trim();
  if (!txt || !butterflySession.active) return;
  $('.bb-bf-input').val('');
  addBfBubble('user', txt);
  butterflySession.history.push({ role: 'user', content: txt });
  addBfBubble('sys', '🌀 思考中...');
  const r = await callSubAPI(butterflySession.history, 800);
  $('.bb-bf-chat .bb-bf-sys').last().remove();
  if (r) {
    butterflySession.history.push({ role: 'assistant', content: r });
    addBfBubble('ai', r);
  } else {
    addBfBubble('sys', '❌ 回复失败');
  }
}

function addBfBubble(type, text) {
  const cls = type === 'user' ? 'bb-bf-user' : type === 'ai' ? 'bb-bf-ai' : 'bb-bf-sys';
  const label = type === 'user' ? '🧑 你' : type === 'ai' ? '🦋 平行' : '⚙️';
  const el = $('.bb-bf-chat');
  el.append(`<div class="${cls}"><b>${label}:</b> ${esc(text)}</div>`);
  el.scrollTop(el[0].scrollHeight);
}

function exportBfChat() {
  if (!butterflySession.history.length) { toastr.info('没有对话'); return; }
  const cn = getContext().name2 || '角色';
  let md = `# 🦋 平行宇宙 — ${cn}\n\n> 原文#${butterflySession.originFloor}\n> 导出: ${new Date().toLocaleString('zh-CN')}\n\n---\n\n`;
  butterflySession.history.forEach(m => {
    if (m.role === 'system') return;
    md += `**${m.role === 'user' ? '🧑 你' : `🦋 ${cn}`}:**\n\n${m.content}\n\n---\n\n`;
  });
  dl(`butterfly_${cn}_${Date.now()}.md`, md, 'text/markdown');
  toastr.success('📄 已导出');
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
  console.log(`[骨与血] 已为 ${ctx.chat.length} 条消息注入按钮`);
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
}

// ============================================
// 渲染函数
// ============================================

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
      <div class="bb-record-item">
        <div class="bb-record-header">
          <span class="bb-record-char">${esc(r.character)}</span>
          <span class="bb-record-time">${r.timestamp}</span>
          <span class="bb-record-del" data-idx="${idx}" style="cursor:pointer;" title="删除">🗑️</span>
        </div>
        <div class="bb-record-text">${esc(r.text)}</div>
      </div>
    `);
  });

  list.find('.bb-record-del').on('click', function () {
    const idx = $(this).data('idx');
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
      <div class="bb-diary-item">
        <div class="bb-diary-header">
          <span>📅 ${d.date}</span>
          <span class="bb-diary-del" data-idx="${idx}" style="cursor:pointer;" title="删除">🗑️</span>
        </div>
        <div class="bb-diary-body">${esc(d.content)}</div>
      </div>
    `);
  });

  list.find('.bb-diary-del').on('click', function () {
    const idx = $(this).data('idx');
    pluginData.diary_blood.splice(idx, 1);
    saveChatData();
    renderDiary();
    toastr.info('已删除日记');
  });
}

function renderIntel() {
  // 总结
  const summary = pluginData.summaries.length > 0
    ? pluginData.summaries[pluginData.summaries.length - 1].content
    : '暂无总结';
  $('#bb-summary-box').html(esc(summary));

  // 天气/环境
  $('#bb-weather-box').html(pluginData.weather ? esc(pluginData.weather) : '未检测');

  // 氛围
  $('#bb-vibe-box').html(pluginData.vibe ? esc(pluginData.vibe) : '未检测');

  // NPC
  const npcBox = $('#bb-npc-box');
  npcBox.empty();
  const npcNames = Object.keys(pluginData.npc_status);
  if (npcNames.length === 0) {
    npcBox.html('<p class="bb-empty">暂无追踪的 NPC</p>');
    return;
  }

  npcNames.forEach(name => {
    const info = pluginData.npc_status[name];
    npcBox.append(`
      <div class="bb-npc-card">
        <div class="bb-npc-header">
          <b>🧑‍🤝‍🧑 ${esc(name)}</b>
          <span>
            <button class="bb-sm-btn bb-npc-peek" data-name="${esc(name)}" title="窥探">🔍</button>
            <button class="bb-sm-btn bb-npc-del" data-name="${esc(name)}" title="移除">🗑️</button>
          </span>
        </div>
        <div class="bb-npc-body">${esc(info.description || '等待窥探...')}</div>
        <div class="bb-npc-time">${info.lastUpdate || ''}</div>
      </div>
    `);
  });

  npcBox.find('.bb-npc-peek').on('click', function () {
    generateNPCStatus($(this).data('name'));
  });
  npcBox.find('.bb-npc-del').on('click', function () {
    const n = $(this).data('name');
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
      <div class="bb-par-item">
        <div class="bb-par-header">
          <span>🦋 #${p.floor} — ${p.date}</span>
          <span class="bb-par-del" data-idx="${idx}" style="cursor:pointer;" title="删除">🗑️</span>
        </div>
        <div class="bb-par-origin">原文: ${esc((p.origin || '').substring(0, 60))}...</div>
        <div class="bb-par-body">${esc(p.content)}</div>
      </div>
    `);
  });

  list.find('.bb-par-del').on('click', function () {
    const idx = $(this).data('idx');
    pluginData.parallel_universes.splice(idx, 1);
    saveChatData();
    renderParallel();
    toastr.info('已删除平行宇宙记录');
  });
}

function renderAll() {
  renderScrapbook();
  renderDiary();
  renderIntel();
  renderParallel();
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

  const result = await callSubAPI([
    { role: 'system', content: `你是"${cn}"。根据以下最近对话，写一篇第一人称角色日记（100-200字，带时间感和情感细节）。用角色的口吻和性格来写。` },
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
  }
}

async function generateSummary() {
  toastr.info('📜 正在生成阿卡夏记录...');

  const recent = getRecentChat(40);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }

  const result = await callSubAPI([
    { role: 'system', content: '根据以下对话记录，用简洁叙事风格写一段故事进度总结（100-150字）。包含：主要事件、关系变化、未解决的线索。' },
    { role: 'user', content: fmt(recent) },
  ], 500);

  if (result) {
    pluginData.summaries.push({
      date: new Date().toLocaleString('zh-CN'),
      content: result,
    });
    saveChatData();
    renderIntel();
    toastr.success('📜 阿卡夏记录已更新！');
  }
}

async function generateWeather() {
  toastr.info('☁️ 正在扫描环境...');

  const recent = getRecentChat(20);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }

  const result = await callSubAPI([
    { role: 'system', content: '根据以下对话内容，推断当前场景的环境信息（时间、天气、地点、氛围）。用简短的描写风格，50-100字。如果对话中没有明确提及，请合理推测。' },
    { role: 'user', content: fmt(recent) },
  ], 300);

  if (result) {
    pluginData.weather = result;
    saveChatData();
    renderIntel();
    toastr.success('☁️ 环境雷达已更新！');
  }
}

async function generateVibe() {
  toastr.info('❤️ 正在分析氛围...');

  const recent = getRecentChat(20);
  if (recent.length === 0) { toastr.warning('没有聊天记录'); return; }

  const result = await callSubAPI([
    { role: 'system', content: '分析以下对话的情感氛围和角色关系状态。用诗意的短评风格描述（50-100字），可以用比喻。包含：情感基调、张力指数（1-10）、关键情感关键词。' },
    { role: 'user', content: fmt(recent) },
  ], 300);

  if (result) {
    pluginData.vibe = result;
    saveChatData();
    renderIntel();
    toastr.success('❤️ 氛围心电图已更新！');
  }
}

async function generateNPCStatus(name) {
  toastr.info(`🔍 正在窥探 ${name}...`);

  const recent = getRecentChat(30);
  const result = await callSubAPI([
    { role: 'system', content: `根据以下对话，描述NPC"${name}"的当前状态。包含：外貌、情绪、行为动向、与主角的关系。如果对话中未提及此NPC，请根据语境合理推测。80-150字。` },
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

async function rollFate() {
  toastr.info('🎲 命运之轮转动中...');

  const ctx = getContext();
  const cn = ctx.name2 || '角色';
  const recent = getRecentChat(15);

  const result = await callSubAPI([
    { role: 'system', content: `你是命运之轮。根据当前剧情，生成一个突发随机事件（可以是好事、坏事、离谱事件）。要求：1) 简短有力（50-100字）2) 可以直接融入RP 3) 带一点戏剧性。角色名：${cn}。` },
    { role: 'user', content: recent.length > 0 ? fmt(recent) : '（新的冒险刚刚开始）' },
  ], 300);

  if (result) {
    pluginData.chaos_event = result;
    $('#bb-fate-result').html(`<div class="bb-fate-text">🎲 ${esc(result)}</div><small style="color:#888;">使用 <code>{{bb_chaos_event}}</code> 宏插入到对话中（一次性）</small>`);
    saveChatData();
    toastr.success('🎲 命运已降临！');
  }
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
}

async function autoGenerate() {
  console.log('[骨与血] 🔄 触发自动生成...');
  toastr.info('🔄 自动生成日记和总结中...');
  await generateDiary();
  await generateSummary();
}

// ============================================
// 宏注册
// ============================================

function registerAllMacros() {
  // SillyTavern 全局宏注册
  const macroProvider = (key, fn) => {
    try {
      if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) {
        const ctx = SillyTavern.getContext();
        if (ctx.registerMacro) {
          ctx.registerMacro(key, fn);
          return;
        }
      }
      // fallback: 尝试 getContext
      const ctx = getContext();
      if (ctx.registerMacro) {
        ctx.registerMacro(key, fn);
      }
    } catch (e) {
      console.warn(`[骨与血] 宏 ${key} 注册失败:`, e);
    }
  };

  macroProvider('bb_diary', () => {
    if (pluginData.diary_blood.length === 0) return '(暂无日记)';
    return pluginData.diary_blood[pluginData.diary_blood.length - 1].content;
  });

  macroProvider('bb_summary', () => {
    if (pluginData.summaries.length === 0) return '(暂无总结)';
    return pluginData.summaries[pluginData.summaries.length - 1].content;
  });

  macroProvider('bb_weather', () => {
    return pluginData.weather || '(环境未知)';
  });

  macroProvider('bb_chaos_event', () => {
    const evt = pluginData.chaos_event;
    if (!evt) return '(无事件)';
    // 一次性读取后清空
    pluginData.chaos_event = '';
    saveChatData();
    return evt;
  });

  macroProvider('bb_vibe', () => {
    return pluginData.vibe || '(氛围未知)';
  });

  macroProvider('bb_npc_status', () => {
    const names = Object.keys(pluginData.npc_status);
    if (names.length === 0) return '(无NPC追踪)';
    return names.map(n => `【${n}】${pluginData.npc_status[n].description || '未知'}`).join('\n');
  });

  console.log('[骨与血] 📝 6个宏已注册');
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
  };
}

// ============================================
// 导出功能
// ============================================

function exportAsMarkdown() {
  const ctx = getContext();
  const cn = ctx.name2 || '角色';
  let md = `# 🦴 骨与血 — ${cn}\n\n> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

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
    md += `## 📜 阿卡夏记录\n\n`;
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
      md += `### ${n}\n${pluginData.npc_status[n].description || '未知'}\n\n`;
    });
  }

  // 平行宇宙
  if (pluginData.parallel_universes.length > 0) {
    md += `## 🦋 平行宇宙\n\n`;
    pluginData.parallel_universes.forEach(p => {
      md += `### #${p.floor} — ${p.date}\n> 原文: ${p.origin}\n\n${p.content}\n\n`;
    });
  }

  dl(`bone_blood_${cn}_${Date.now()}.md`, md, 'text/markdown');
  toastr.success('📄 Markdown 已导出！');
}

function exportAsJSON() {
  const ctx = getContext();
  const cn = ctx.name2 || '角色';
  const data = {
    exportTime: new Date().toISOString(),
    character: cn,
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

function esc(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}






