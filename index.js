// ============================================
// 🦴 骨与血 (Bone & Blood) v0.2.0
// SillyTavern 沉浸式风味增强与记忆手账插件
// ============================================

import { extension_settings, getContext, renderExtensionTemplateAsync } from '../../../extensions.js';
import { saveSettingsDebounced, eventSource, event_types } from '../../../../script.js';

const EXTENSION_NAME = 'third-party/SillyTavern-BoneandBloodbyshadow';
const EXTENSION_FOLDER = 'third-party/SillyTavern-BoneandBloodbyshadow';

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

// ---- 蝴蝶分支对话窗口的当前会话 ----
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
  console.log('[骨与血] 🦴 v0.2.0 开始加载...');

  // 1. 初始化设置
  if (!extension_settings[EXTENSION_NAME]) {
    extension_settings[EXTENSION_NAME] = {};
  }
  Object.assign(extension_settings[EXTENSION_NAME], {
    ...defaultSettings,
    ...extension_settings[EXTENSION_NAME],
  });

  // 2. 加载扩展设置面板
  try {
    const settingsHtml = await renderExtensionTemplateAsync(EXTENSION_FOLDER, 'settings');
    $('#extensions_settings').append(settingsHtml);
  } catch (e) {
    console.error('[骨与血] 无法加载settings.html:', e);
  }

  // 3. 填入设置
  loadSettingsToForm();

  // 4. 绑定扩展面板事件
  bindExtensionPanelEvents();

  // 5. 注入悬浮UI
  injectFloatingUI();

  // 6. 注入蝴蝶窗口
  injectButterflyWindow();

  // 7. 注册事件
  registerEventListeners();

  // 8. 注册宏
  registerAllMacros();

  // 9. 加载数据
  loadChatData();

  // 10. 为已有消息注入按钮
  injectButtonsToExistingMessages();

  console.log('[骨与血] ✅ v0.2.0 加载完成！');
});

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
  $('#bb-api-endpoint').val(s.api_base);
  $('#bb-api-key').val(s.api_key);
  $('#bb-diary-trigger').val(s.diary_trigger_count);
  $('#bb-auto-diary').prop('checked', s.auto_diary_enabled);
  // 如果已有保存的模型，添加到下拉栏
  if (s.api_model) {
    const select = $('#bb-api-model');
    select.empty().append(`<option value="${s.api_model}" selected>${s.api_model}</option>`);
  }
}

function bindExtensionPanelEvents() {
  $('#bb-enabled').on('change', function () {
    getSettings().enabled = $(this).is(':checked');
    saveSettings();
  });
  $('#bb-api-endpoint').on('input', function () {
    getSettings().api_base = $(this).val().replace(/\/+$/, ''); // 去掉末尾斜杠
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

  // 测试连接按钮
  $('#bb-btn-test-api').on('click', () => testAPIConnection());

  // 手动操作按钮
  $('#bb-btn-diary').on('click', () => generateDiary());
  $('#bb-btn-summary').on('click', () => generateSummary());
  $('#bb-btn-weather').on('click', () => generateWeather());
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
    statusEl.html('<span style="color:#ff6b6b;">❌ 请先填写 API Base URL 和 Key</span>');
    return;
  }

  btn.val('⏳ 连接中...').prop('disabled', true);
  statusEl.html('<span style="color:#f0ad4e;">⏳ 正在连接...</span>');

  try {
    // 尝试获取模型列表
    let baseUrl = s.api_base.replace(/\/+$/, '');
    // 兼容：如果用户填了 /chat/completions 结尾，帮他截取
    if (baseUrl.endsWith('/chat/completions')) {
      baseUrl = baseUrl.replace('/chat/completions', '');
    }

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${s.api_key}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data || data.models || [];

    if (models.length === 0) {
      statusEl.html('<span style="color:#f0ad4e;">⚠️ 连接成功，但没有获取到模型列表</span>');
      selectEl.empty().append('<option value="">-- 请手动输入模型名 --</option>');
    } else {
      // 排序模型列表
      const modelIds = models.map(m => m.id || m).sort();
      selectEl.empty();
      modelIds.forEach(id => {
        const selected = id === s.api_model ? 'selected' : '';
        selectEl.append(`<option value="${id}" ${selected}>${id}</option>`);
      });

      // 如果之前没选过模型，自动选第一个
      if (!s.api_model && modelIds.length > 0) {
        s.api_model = modelIds[0];
        saveSettings();
      }

      statusEl.html(`<span style="color:#4ecdc4;">✅ 连接成功！找到 ${modelIds.length} 个模型</span>`);
    }
  } catch (error) {
    console.error('[骨与血] API连接测试失败:', error);
    statusEl.html(`<span style="color:#ff6b6b;">❌ 连接失败: ${error.message}</span>`);
    selectEl.empty().append('<option value="">-- 连接失败 --</option>');
  }

  btn.val('🔗 测试连接 & 获取模型').prop('disabled', false);
}

// ============================================
// 副 API 调用（通用）
// ============================================

async function callSubAPI(messages, maxTokens = 500) {
  const s = getSettings();
  if (!s.api_base || !s.api_key || !s.api_model) {
    toastr.warning('请先配置并测试副 API 连接');
    return null;
  }

  try {
    let baseUrl = s.api_base.replace(/\/+$/, '');
    if (baseUrl.endsWith('/chat/completions')) {
      baseUrl = baseUrl.replace('/chat/completions', '');
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${s.api_key}`,
      },
      body: JSON.stringify({
        model: s.api_model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`${response.status}: ${errText.substring(0, 200)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('[骨与血] API调用失败:', error);
    toastr.error(`副API调用失败: ${error.message}`);
    return null;
  }
}

function getRecentChat(count = 30) {
  const context = getContext();
  const chat = context.chat;
  if (!chat || chat.length === 0) return [];
  return chat.slice(-count).map(msg => ({
    role: msg.is_user ? 'user' : 'assistant',
    name: msg.name,
    content: msg.mes,
  }));
}

function formatChatForPrompt(messages) {
  return messages.map(m => `${m.name}: ${m.content}`).join('\n').substring(0, 3000);
}

// ============================================
// 悬浮 UI
// ============================================

function injectFloatingUI() {
  const floatBtn = $(`<div id="bb-float-button" title="骨与血 Bone & Blood">🦴</div>`);
  $('body').append(floatBtn);

  const panel = $(`
    <div id="bb-panel" class="bb-panel-hidden">
      <div class="bb-panel-header">
        <span class="bb-panel-title">🦴 骨与血</span>
        <span class="bb-panel-char-info" id="bb-char-info"></span>
        <button class="bb-panel-close">✕</button>
      </div>
      <div class="bb-panel-content">

        <!-- 🌟 唱片机 -->
        <div class="bb-tab-content" id="bb-tab-scrapbook">
          <h3>🌟 唱片机 — 语录收藏</h3>
          <div class="bb-export-bar" style="display:none;">
            <button class="bb-export-btn" id="bb-export-md">📄 Markdown</button>
            <button class="bb-export-btn" id="bb-export-json">📦 JSON</button>
          </div>
          <p class="bb-empty-hint" id="bb-scrap-empty">还没有收藏任何语录~<br/>点击消息旁的 🌟 收藏吧</p>
          <div class="bb-records-list"></div>
        </div>

        <!-- 📖 日记本 -->
        <div class="bb-tab-content bb-hidden" id="bb-tab-diary">
          <h3>📖 日记本</h3>
          <button class="bb-inline-btn" id="bb-gen-diary-inline">✍️ 立即生成</button>
          <p class="bb-empty-hint" id="bb-diary-empty">角色还没有写日记...</p>
          <div class="bb-diary-list"></div>
        </div>

        <!-- 📻 情报站 -->
        <div class="bb-tab-content bb-hidden" id="bb-tab-intel">
          <h3>📻 情报站</h3>

          <div class="bb-intel-section">
            <div class="bb-intel-header">
              <h4>📜 阿卡夏记录</h4>
              <button class="bb-inline-btn bb-refresh-summary">🔄</button>
            </div>
            <div class="bb-summary-content">暂无总结</div>
          </div>

          <div class="bb-intel-section">
            <div class="bb-intel-header">
              <h4>☁️ 环境雷达</h4>
              <button class="bb-inline-btn bb-refresh-weather">🔄</button>
            </div>
            <div class="bb-weather-content">未检测</div>
          </div>

          <div class="bb-intel-section">
            <div class="bb-intel-header">
              <h4>❤️ 氛围心电图</h4>
              <button class="bb-inline-btn bb-refresh-vibe">🔄</button>
            </div>
            <div class="bb-vibe-content">未检测</div>
          </div>

          <div class="bb-intel-section">
            <div class="bb-intel-header">
              <h4>🗺️ NPC 动态</h4>
              <button class="bb-inline-btn bb-add-npc">➕ 添加NPC</button>
            </div>
            <div class="bb-npc-list"></div>
          </div>
        </div>

        <!-- 🦋 观测站 -->
        <div class="bb-tab-content bb-hidden" id="bb-tab-parallel">
          <h3>🦋 观测站 — 平行宇宙</h3>
          <p class="bb-empty-hint" id="bb-parallel-empty">点击消息旁的 🦋 按钮探索平行宇宙</p>
          <div class="bb-parallel-list"></div>
        </div>

        <!-- 🃏 命运盘 -->
        <div class="bb-tab-content bb-hidden" id="bb-tab-fate">
          <h3>🃏 命运盘</h3>
          <p class="bb-hint-text">点击骰子生成突发事件<br/>通过 <code>{{bb_chaos_event}}</code> 注入预设</p>
          <button id="bb-roll-fate" class="bb-big-button">🎲 摇骰子！</button>
          <div class="bb-fate-result"></div>
        </div>

      </div>

      <!-- 底部导航 -->
      <div class="bb-panel-nav">
        <button class="bb-nav-btn bb-nav-active" data-tab="scrapbook" title="唱片机">🌟</button>
        <button class="bb-nav-btn" data-tab="diary" title="日记本">📖</button>
        <button class="bb-nav-btn" data-tab="intel" title="情报站">📻</button>
        <button class="bb-nav-btn" data-tab="parallel" title="观测站">🦋</button>
        <button class="bb-nav-btn" data-tab="fate" title="命运盘">🃏</button>
      </div>
    </div>
  `);
  $('body').append(panel);

  // ---- 绑定事件 ----
  $('#bb-float-button').on('click', () => {
    $('#bb-panel').toggleClass('bb-panel-hidden');
    updateCharInfo();
  });
  $('.bb-panel-close').on('click', () => $('#bb-panel').addClass('bb-panel-hidden'));

  // 导航
  $('.bb-nav-btn').on('click', function () {
    const tab = $(this).data('tab');
    $('.bb-nav-btn').removeClass('bb-nav-active');
    $(this).addClass('bb-nav-active');
    $('.bb-tab-content').addClass('bb-hidden');
    $(`#bb-tab-${tab}`).removeClass('bb-hidden');
  });

  // 功能按钮
  $('#bb-roll-fate').on('click', () => rollFate());
  $('#bb-export-md').on('click', () => exportAsMarkdown());
  $('#bb-export-json').on('click', () => exportAsJSON());
  $('#bb-gen-diary-inline').on('click', () => generateDiary());

  // 情报站刷新按钮
  $('.bb-refresh-summary').on('click', () => generateSummary());
  $('.bb-refresh-weather').on('click', () => generateWeather());
  $('.bb-refresh-vibe').on('click', () => generateVibe());

  // NPC 添加
  $('.bb-add-npc').on('click', () => {
    const name = prompt('输入NPC名字：');
    if (name && name.trim()) {
      generateNPCStatus(name.trim());
    }
  });
}

function updateCharInfo() {
  const context = getContext();
  const charName = context.name2 || '';
  $('#bb-char-info').text(charName ? `💬 ${charName}` : '');
}

// ============================================
// 🦋 蝴蝶窗口（平行宇宙分支对话）
// ============================================

function injectButterflyWindow() {
  const bfWindow = $(`
    <div id="bb-butterfly-window" class="bb-hidden">
      <div class="bb-bf-header">
        <span class="bb-bf-title">🦋 平行宇宙分支</span>
        <div class="bb-bf-actions">
          <button class="bb-bf-export" title="导出对话">📄</button>
          <button class="bb-bf-close" title="关闭">✕</button>
        </div>
      </div>
      <div class="bb-bf-origin"></div>
      <div class="bb-bf-chat"></div>
      <div class="bb-bf-input-area">
        <textarea class="bb-bf-input" placeholder="在平行宇宙中说些什么..." rows="2"></textarea>
        <button class="bb-bf-send">发送</button>
      </div>
    </div>
  `);
  $('body').append(bfWindow);

  // 关闭
  $('.bb-bf-close').on('click', () => {
    $('#bb-butterfly-window').addClass('bb-hidden');
    butterflySession.active = false;
  });

  // 发送
  $('.bb-bf-send').on('click', () => sendButterflyMessage());
  $('.bb-bf-input').on('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendButterflyMessage();
    }
  });

  // 导出
  $('.bb-bf-export').on('click', () => exportButterflyChat());
}

function openButterflyWindow(messageId) {
  const context = getContext();
  const message = context.chat[messageId];
  if (!message) return;

  butterflySession = {
    active: true,
    originFloor: messageId,
    originText: message.mes,
    history: [],
  };

  // 填入原文
  $('.bb-bf-origin').html(`<strong>📍 原文 #${messageId}:</strong> ${escapeHtml(message.mes.substring(0, 200))}...`);
  $('.bb-bf-chat').empty();
  $('.bb-bf-input').val('');
  $('#bb-butterfly-window').removeClass('bb-hidden');

  // 自动生成第一条平行宇宙回复
  generateButterflyFirst(message);
}

async function generateButterflyFirst(message) {
  const context = getContext();
  const charName = context.name2 || '角色';

  appendButterflyMessage('system', '🌀 正在撕裂时空...');

  const messages = [
    {
      role: 'system',
      content: `你正在进行一个"平行宇宙"分支剧情。原始剧情中角色说了以下这段话。现在，在这个平行宇宙中，角色做出了截然相反或极其离谱的选择。请以"${charName}"的身份，用角色扮演的方式写出这个平行宇宙的开端（100-200字）。之后用户可能会继续和你互动，请保持这个平行宇宙的设定继续角色扮演。`,
    },
    {
      role: 'user',
      content: `原文："${message.mes.substring(0, 800)}"\n\n请开始平行宇宙分支：`,
    },
  ];

  const result = await callSubAPI(messages, 800);

  // 移除 loading 消息
  $('.bb-bf-chat .bb-bf-msg-system').last().remove();

  if (result) {
    butterflySession.history = [...messages, { role: 'assistant', content: result }];
    appendButterflyMessage('assistant', result);

    // 保存到观测站
    pluginData.parallel_universes.push({
      id: `par-${Date.now()}`,
      origin: message.mes.substring(0, 80),
      content: result,
      floor: butterflySession.originFloor,
      date: new Date().toLocaleString('zh-CN'),
    });
    saveChatData();
    renderParallel();
  } else {
    appendButterflyMessage('system', '❌ 生成失败，请检查API设置');
  }
}

async function sendButterflyMessage() {
  const input = $('.bb-bf-input');
  const text = input.val().trim();
  if (!text || !butterflySession.active) return;

  input.val('');
  appendButterflyMessage('user', text);

  butterflySession.history.push({ role: 'user', content: text });

  appendButterflyMessage('system', '🌀 思考  appendButterflyMessage('system', '🌀 思考中...');

  const result = await callSubAPI(butterflySession.history, 800);

  // 移除 loading
  $('.bb-bf-chat .bb-bf-msg-system').last().remove();

  if (result) {
    butterflySession.history.push({ role: 'assistant', content: result });
    appendButterflyMessage('assistant', result);
  } else {
    appendButterflyMessage('system', '❌ 回复失败');
  }
}

function appendButterflyMessage(role, text) {
  const chatEl = $('.bb-bf-chat');
  const roleLabel = role === 'user' ? '🧑 你' : role === 'assistant' ? '🦋 平行宇宙' : '⚙️';
  const cssClass = `bb-bf-msg bb-bf-msg-${role}`;
  chatEl.append(`<div class="${cssClass}"><strong>${roleLabel}:</strong> ${escapeHtml(text)}</div>`);
  chatEl.scrollTop(chatEl[0].scrollHeight);
}

function exportButterflyChat() {
  if (butterflySession.history.length === 0) {
    toastr.info('没有可导出的对话');
    return;
  }

  const context = getContext();
  const charName = context.name2 || '角色';

  let md = `# 🦋 平行宇宙分支对话\n\n`;
  md += `> 角色: ${charName}\n`;
  md += `> 原文楼层: #${butterflySession.originFloor}\n`;
  md += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  md += `**📍 原文:** ${butterflySession.originText.substring(0, 200)}...\n\n---\n\n`;

  butterflySession.history.forEach((msg) => {
    if (msg.role === 'system') return;
    const label = msg.role === 'user' ? '🧑 你' : `🦋 ${charName}（平行）`;
    md += `**${label}:**\n\n${msg.content}\n\n---\n\n`;
  });

  downloadFile(`butterfly_${charName}_${Date.now()}.md`, md, 'text/markdown');
  toastr.success('📄 平行宇宙对话已导出');
}

// ============================================
// 酒馆事件监听
// ============================================

function registerEventListeners() {
  eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (messageId) => {
    if (!getSettings().enabled) return;
    injectMessageButtons(messageId);
    incrementMessageCounter();
  });

  eventSource.on(event_types.USER_MESSAGE_RENDERED, (messageId) => {
    if (!getSettings().enabled) return;
    injectMessageButtons(messageId);
  });

  eventSource.on(event_types.CHAT_CHANGED, () => {
    loadChatData();
    getSettings().message_counter = 0;
    saveSettings();
    updateCharInfo();
    // 为新聊天中已有的消息注入按钮
    setTimeout(() => injectButtonsToExistingMessages(), 500);
  });
}

// 为页面上已存在的消息注入按钮
function injectButtonsToExistingMessages() {
  if (!getSettings().enabled) return;
  $('#chat .mes').each(function () {
    const mesId = $(this).attr('mesid');
    if (mesId !== undefined) {
      injectMessageButtons(parseInt(mesId));
    }
  });
}

// 在消息气泡旁注入 🌟🦋 按钮
function injectMessageButtons(messageId) {
  const msg = $(`.mes[mesid="${messageId}"]`);
  if (msg.length === 0 || msg.find('.bb-msg-buttons').length > 0) return;

  const btns = $(`
    <div class="bb-msg-buttons" style="display:inline-flex;gap:2px;margin-left:4px;">
      <span class="bb-msg-btn bb-collect-btn" title="收藏到唱片机" style="cursor:pointer;opacity:0.5;font-size:14px;">🌟</span>
      <span class="bb-msg-btn bb-butterfly-btn" title="打开平行宇宙" style="cursor:pointer;opacity:0.5;font-size:14px;">🦋</span>
    </div>
  `);

  // 尝试多种注入位置以兼容不同版本酒馆
  const extraBtns = msg.find('.mes_buttons .extraMesButtons');
  const mesButtons = msg.find('.mes_buttons');
  const mesBlock = msg.find('.mes_block');

  if (extraBtns.length > 0) {
    extraBtns.prepend(btns);
  } else if (mesButtons.length > 0) {
    mesButtons.prepend(btns);
  } else if (mesBlock.length > 0) {
    mesBlock.append(btns);
  } else {
    msg.append(btns);
  }

  // 绑定事件
  btns.find('.bb-collect-btn').on('click', function (e) {
    e.stopPropagation();
    collectMessage(messageId);
  });
  btns.find('.bb-butterfly-btn').on('click', function (e) {
    e.stopPropagation();
    openButterflyWindow(messageId);
  });

  // hover效果
  btns.find('.bb-msg-btn').on('mouseenter', function () {
    $(this).css('opacity', '1').css('transform', 'scale(1.2)');
  }).on('mouseleave', function () {
    $(this).css('opacity', '0.5').css('transform', 'scale(1)');
  });
}

// ============================================
// 🌟 收藏功能
// ============================================

function collectMessage(messageId) {
  const context = getContext();
  const chat = context.chat;
  const message = chat[messageId];
  if (!message) return;

  if (pluginData.records_bone.some(r => r.floor === messageId)) {
    toastr.info('这条消息已经收藏过了');
    return;
  }

  const prevMsg = messageId > 0 ? chat[messageId - 1] : null;

  pluginData.records_bone.push({
    id: `rec-${Date.now()}`,
    who: message.name,
    text: message.mes,
    context: prevMsg ? prevMsg.mes : '',
    floor: messageId,
    date: new Date().toLocaleString('zh-CN'),
    is_user: message.is_user,
  });

  saveChatData();
  renderScrapbook();

  const btn = $(`.mes[mesid="${messageId}"] .bb-collect-btn`);
  btn.text('✅').css('opacity', '1');
  setTimeout(() => btn.text('🌟').css('opacity', '0.5'), 1500);

  toastr.success('已收藏到唱片机 🌟');
}

// ============================================
// 渲染函数
// ============================================

function renderScrapbook() {
  const container = $('#bb-tab-scrapbook .bb-records-list');
  container.empty();

  if (pluginData.records_bone.length === 0) {
    $('#bb-scrap-empty').show();
    $('#bb-tab-scrapbook .bb-export-bar').hide();
    return;
  }

  $('#bb-scrap-empty').hide();
  $('#bb-tab-scrapbook .bb-export-bar').show();

  [...pluginData.records_bone].reverse().forEach((record) => {
    const card = $(`
      <div class="bb-record-card" data-record-id="${record.id}">
        <div class="bb-card-who">${escapeHtml(record.who)}</div>
        <div class="bb-card-text">${escapeHtml(record.text)}</div>
        ${record.context ? `<div class="bb-card-context">↩ ${escapeHtml(record.context.substring(0, 120))}</div>` : ''}
        <div class="bb-card-meta">
          <span>#${record.floor} · ${record.date}</span>
          <button class="bb-card-delete" data-id="${record.id}">🗑️</button>
        </div>
      </div>
    `);
    container.append(card);
  });

  container.find('.bb-card-delete').on('click', function () {
    const id = $(this).data('id');
    pluginData.records_bone = pluginData.records_bone.filter(r => r.id !== id);
    saveChatData();
    renderScrapbook();
    toastr.info('已删除');
  });
}

function renderDiary() {
  const container = $('#bb-tab-diary .bb-diary-list');
  container.empty();

  if (pluginData.diary_blood.length === 0) {
    $('#bb-diary-empty').show();
    return;
  }

  $('#bb-diary-empty').hide();

  [...pluginData.diary_blood].reverse().forEach((entry) => {
    container.append(`
      <div class="bb-diary-entry">
        <div class="bb-diary-date">📅 ${entry.date}</div>
        <div class="bb-diary-text">${escapeHtml(entry.content)}</div>
      </div>
    `);
  });
}

function renderIntel() {
  const lastSummary = pluginData.summaries.length > 0
    ? pluginData.summaries[pluginData.summaries.length - 1].content
    : '暂无总结';
  $('.bb-summary-content').text(lastSummary);
  $('.bb-weather-content').text(pluginData.weather || '未检测');
  $('.bb-vibe-content').text(pluginData.vibe || '未检测');

  const npcContainer = $('.bb-npc-list');
  npcContainer.empty();
  const npcEntries = Object.entries(pluginData.npc_status);
  if (npcEntries.length === 0) {
    npcContainer.html('<span class="bb-empty-small">暂无NPC追踪，点击 ➕ 添加</span>');
  } else {
    npcEntries.forEach(([name, status]) => {
      const npcCard = $(`
        <div class="bb-npc-card">
          <div class="bb-npc-name">${escapeHtml(name)}</div>
          <div class="bb-npc-status">${escapeHtml(status)}</div>
          <div class="bb-npc-actions">
            <button class="bb-inline-btn bb-npc-spy" data-name="${escapeHtml(name)}">🔍 窥探</button>
            <button class="bb-inline-btn bb-npc-remove" data-name="${escapeHtml(name)}">🗑️</button>
          </div>
        </div>
      `);
      npcContainer.append(npcCard);
    });

    // 绑定窥探按钮
    npcContainer.find('.bb-npc-spy').on('click', function () {
      const name = $(this).data('name');
      generateNPCStatus(name);
    });
    // 绑定移除按钮
    npcContainer.find('.bb-npc-remove').on('click', function () {
      const name = $(this).data('name');
      delete pluginData.npc_status[name];
      saveChatData();
      renderIntel();
      toastr.info(`已移除 ${name}`);
    });
  }
}

function renderParallel() {
  const container = $('#bb-tab-parallel .bb-parallel-list');
  container.empty();

  const list = pluginData.parallel_universes || [];
  if (list.length === 0) {
    $('#bb-parallel-empty').show();
    return;
  }

  $('#bb-parallel-empty').hide();

  [...list].reverse().forEach((p) => {
    container.append(`
      <div class="bb-parallel-card">
        <div class="bb-parallel-origin">📍 原文 #${p.floor}: "${escapeHtml(p.origin)}..."</div>
        <div class="bb-parallel-text">🦋 ${escapeHtml(p.content)}</div>
        <div class="bb-parallel-date">${p.date}</div>
      </div>
    `);
  });
}

function renderAll() {
  renderScrapbook();
  renderDiary();
  renderIntel();
  renderParallel();
}

// ============================================
// 功能：日记生成
// ============================================

async function generateDiary() {
  const context = getContext();
  const charName = context.name2 || '角色';
  const userName = context.name1 || '用户';
  const recent = getRecentChat(30);
  if (recent.length < 5) {
    toastr.info('聊天消息太少，至少需要5条');
    return;
  }

  toastr.info('📖 正在生成日记...');

  const result = await callSubAPI([
    {
      role: 'system',
      content: `你是一位文学助手。请以"${charName}"的第一人称视角写一篇私密日记。总结最近发生的事件，流露对${userName}的真实情感。风格：文学性强、情感细腻、150-250字。不要使用markdown格式。`,
    },
    {
      role: 'user',
      content: `最近的对话记录：\n\n${formatChatForPrompt(recent)}`,
    },
  ]);

  if (result) {
    pluginData.diary_blood.push({
      id: `diary-${Date.now()}`,
      content: result,
      date: new Date().toLocaleString('zh-CN'),
    });
    saveChatData();
    renderDiary();
    toastr.success('📖 日记已生成！');
  }
}

// ============================================
// 功能：阿卡夏总结
// ============================================

async function generateSummary() {
  const recent = getRecentChat(40);
  if (recent.length < 10) {
    toastr.info('聊天消息太少，至少需要10条');
    return;
  }

  toastr.info('📜 正在生成总结...');

  const result = await callSubAPI([
    {
      role: 'system',
      content: '你是一位冒险日志记录员。用简洁的"情报简报"风格，总结以下对话中发生的重要事件、关键决策和人物关系变化。分条列出，每条不超过一句话，总计不超过200字。',
    },
    {
      role: 'user',
      content: formatChatForPrompt(recent),
    },
  ]);

  if (result) {
    pluginData.summaries.push({
      id: `sum-${Date.now()}`,
      content: result,
      date: new Date().toLocaleString('zh-CN'),
    });
    saveChatData();
    renderIntel();
    toastr.success('📜 总结已生成！');
  }
}

// ============================================
// 功能：环境雷达
// ============================================

async function generateWeather() {
  const recent = getRecentChat(10);
  if (recent.length < 3) {
    toastr.info('聊天消息太少');
    return;
  }

  toastr.info('☁️ 正在感知环境...');

  const result = await callSubAPI([
    {
      role: 'system',
      content: '根据以下对话推断当前场景的环境。用一段文字描述天气、光线、声音和气味。要有画面感和文学性。100字以内。',
    },
    {
      role: 'user',
      content: formatChatForPrompt(recent),
    },
  ]);

  if (result) {
    pluginData.weather = result;
    saveChatData();
    renderIntel();
    toastr.success('☁️ 环境已更新！');
  }
}

// ============================================
// 功能：氛围心电图
// ============================================

async function generateVibe() {
  const recent = getRecentChat(10);
  if (recent.length < 3) {
    toastr.info('聊天消息太少');
    return;
  }

  toastr.info('❤️ 正在分析氛围...');

  const result = await callSubAPI([
    {
      role: 'system',
      content: '你是一位情感分析师/心理咨询师。请分析以下对话的情绪基调与人物心理状态。分两部分：1）当前氛围关键词（2-4个词）；2）简短的心理分析（角色可能在想什么、情绪张力在哪里）。总计不超过100字。',
    },
    {
      role: 'user',
      content: formatChatForPrompt(recent),
    },
  ]);

  if (result) {
    pluginData.vibe = result;
    saveChatData();
    renderIntel();
    toastr.success('❤️ 氛围已更新！');
  }
}

// ============================================
// 功能：NPC 追踪
// ============================================

async function generateNPCStatus(npcName) {
  const context = getContext();
  const charName = context.name2 || '角色';
  const userName = context.name1 || '用户';
  const recent = getRecentChat(20);

  toastr.info(`🔍 正在窥探 ${npcName}...`);

  const result = await callSubAPI([
    {
      role: 'system',
      content: `${charName}和${userName}正在进行剧情。请用一小段文字（50-100字）描述此时不在场的NPC "${npcName}" 正在另一个地方干什么？要求：符合人物性格和当前世界观，有趣且具体，有画面感。`,
    },
    {
      role: 'user',
      content: `当前场景对话：\n${formatChatForPrompt(recent)}\n\nNPC "${npcName}" 此刻在做什么？`,
    },
  ]);

  if (result) {
    pluginData.npc_status[npcName] = result;
    saveChatData();
    renderIntel();
    toastr.success(`🔍 ${npcName} 的动态已更新！`);
  }
}

// ============================================
// 功能：命运梭哈
// ============================================

async function rollFate() {
  const btn = $('#bb-roll-fate');
  const resultDiv = $('.bb-fate-result');

  btn.addClass('bb-loading').text('🎲 命运旋转中...');
  resultDiv.text('正在召唤命运...');

  const context = getContext();
  const charName = context.name2 || '角色';
  const userName = context.name1 || '用户';
  const recent = getRecentChat(10);

  const result = await callSubAPI([
    {
      role: 'system',
      content: `你是TRPG的命运骰子。基于当前场景生成一个突发事件。要求：有戏剧性冲击力，可以是危险/搞笑/浪漫/诡异的。一两句话，不超过60字。不要markdown。
示例："一颗流星坠落在附近山丘，大地震颤，远处传来不明生物嚎叫。"
示例："${charName}的口袋里掉出一封不属于自己的情书，字迹居然是${userName}的。"`,
    },
    {
      role: 'user',
      content: `当前场景：\n${formatChatForPrompt(recent)}\n\n投掷命运骰子：`,
    },
  ]);

  btn.removeClass('bb-loading').text('🎲 摇骰子！');

  if (result) {
    pluginData.chaos_event = result;
    saveChatData();
    resultDiv.html(`<strong>🔥 命运已定：</strong><br>${escapeHtml(result)}`);
    toastr.success('🃏 命运事件已生成！通过 {{bb_chaos_event}} 注入预设');
  } else {
    resultDiv.text('❌ 命运沉默了...（检查API设置）');
  }
}

// ============================================
// 消息计数器
// ============================================

function incrementMessageCounter() {
  const s = getSettings();
  s.message_counter = (s.message_counter || 0) + 1;

  if (s.auto_diary_enabled && s.message_counter >= s.diary_trigger_count) {
    console.log(`[骨与血] 📊 消息计数 ${s.message_counter}，触发自动生成`);
    s.message_counter = 0;
    saveSettings();
    autoGenerate();
  } else {
    saveSettings();
  }
}

async function autoGenerate() {
  const s = getSettings();
  if (!s.api_base || !s.api_key || !s.api_model) return;

  console.log('[骨与血] ⚙️ 自动生成...');
  try {
    await Promise.allSettled([
      generateDiary(),
      generateSummary(),
      generateWeather(),
      generateVibe(),
    ]);
    console.log('[骨与血] ✅ 自动生成完成');
  } catch (error) {
    console.error('[骨与血] 自动生成出错:', error);
  }
}

// ============================================
// 宏注册
// ============================================

function registerAllMacros() {
  registerMacroLike(
    /\{\{bb_diary\}\}/gi,
    () => {
      if (pluginData.diary_blood.length > 0) {
        return pluginData.diary_blood[pluginData.diary_blood.length - 1].content;
      }
      return '';
    }
  );

  registerMacroLike(
    /\{\{bb_summary\}\}/gi,
    () => {
      if (pluginData.summaries.length > 0) {
        return pluginData.summaries[pluginData.summaries.length - 1].content;
      }
      return '';
    }
  );

  registerMacroLike(
    /\{\{bb_weather\}\}/gi,
    () => pluginData.weather || '未知环境'
  );

  registerMacroLike(
    /\{\{bb_chaos_event\}\}/gi,
    () => {
      const evt = pluginData.chaos_event;
      if (evt) {
        pluginData.chaos_event = '';
        saveChatData();
      }
      return evt || '';
    }
  );

  registerMacroLike(
    /\{\{bb_vibe\}\}/gi,
    () => pluginData.vibe || '平静'
  );

  registerMacroLike(
    /\{\{bb_npc_status\}\}/gi,
    () => {
      const entries = Object.entries(pluginData.npc_status);
      if (entries.length === 0) return '';
      return entries.map(([name, status]) => `${name}: ${status}`).join('\n');
    }
  );

  console.log('[骨与血] 📡 所有宏已注册');
}

// ============================================
// 数据持久化
// ============================================

function getChatDataKey() {
  const context = getContext();
  if (!context.chatId) return null;
  return `bb_data_${context.chatId}`;
}

function saveChatData() {
  const key = getChatDataKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(pluginData));
  } catch (error) {
    console.error('[骨与血] 存储失败:', error);
  }
}

function loadChatData() {
  const key = getChatDataKey();
  if (!key) {
    resetPluginData();
    renderAll();
    return;
  }

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      pluginData.records_bone = parsed.records_bone || [];
      pluginData.diary_blood = parsed.diary_blood || [];
      pluginData.summaries = parsed.summaries || [];
      pluginData.weather = parsed.weather || '';
      pluginData.npc_status = parsed.npc_status || {};
      pluginData.chaos_event = parsed.chaos_event || '';
      pluginData.vibe = parsed.vibe || '';
      pluginData.parallel_universes = parsed.parallel_universes || [];
    } else {
      resetPluginData();
    }
  } catch (error) {
    console.error('[骨与血] 读取失败:', error);
    resetPluginData();
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
  if (pluginData.records_bone.length === 0) {
    toastr.info('没有可导出的语录');
    return;
  }

  const context = getContext();
  const charName = context.name2 || '角色';

  let md = `# 🦴 骨与血 — ${charName} 语录集\n\n`;
  md += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n---\n\n`;

  pluginData.records_bone.forEach((record, index) => {
    md += `### ${index + 1}. ${record.who}\n\n`;
    md += `> ${record.text}\n\n`;
    if (record.context) {
      md += `*上文: ${record.context.substring(0, 100)}...*\n\n`;
    }
    md += `📅 ${record.date} | #${record.floor}\n\n---\n\n`;
  });

  downloadFile(`bone_and_blood_${charName}.md`, md, 'text/markdown');
  toastr.success('📄 Markdown 已导出');
}

function exportAsJSON() {
  if (pluginData.records_bone.length === 0) {
    toastr.info('没有可导出的数据');
    return;
  }

  const context = getContext();
  const charName = context.name2 || '角色';

  const exportData = {
    export_time: new Date().toISOString(),
    character: charName,
    records: pluginData.records_bone,
    diaries: pluginData.diary_blood,
    summaries: pluginData.summaries,
  };

  downloadFile(
    `bone_and_blood_${charName}.json`,
    JSON.stringify(exportData, null, 2),
    'application/json'
  );
  toastr.success('📦 JSON 已导出');
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// 工具函数
// ============================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}






