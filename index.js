// ============================================
// 🦴 骨与血 (Bone & Blood) - SillyTavern 插件
// ============================================

import { extension_settings, getContext } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';
import { eventSource, event_types } from '../../../../script.js';

// 插件标识
const EXTENSION_NAME = 'bone-and-blood';

// 默认设置
const defaultSettings = {
  // 副API配置
  api_endpoint: '',
  api_key: '',
  api_model: 'gpt-4o-mini',
  
  // 功能开关
  auto_diary_enabled: true,
  diary_trigger_count: 30,
  
  // 主题
  theme: 'default_dark',
  
  // 当前消息计数
  message_counter: 0,
};

// 数据存储结构
let pluginData = {
  records_bone: [],  // 收藏的语录
  diary_blood: [],   // 生成的日记
  summaries: [],     // 阿卡夏总结
  weather: '',       // 当前环境
  npc_status: {},    // NPC状态
  chaos_event: '',   // 突发事件
  vibe: '',          // 氛围
};

// ============================================
// 初始化
// ============================================

jQuery(async () => {
  console.log(`[${EXTENSION_NAME}] 🦴 骨与血插件加载中...`);
  
  // 加载设置
  loadSettings();
  
  // 注入UI
  await injectUI();
  
  // 注册事件监听
  registerEventListeners();
  
  // 注册宏
  registerMacros();
  
  console.log(`[${EXTENSION_NAME}] ✅ 插件加载完成！`);
});

// ============================================
// 设置管理
// ============================================

function loadSettings() {
  // 初始化插件设置
  if (!extension_settings[EXTENSION_NAME]) {
    extension_settings[EXTENSION_NAME] = {};
  }
  
  // 合并默认设置
  extension_settings[EXTENSION_NAME] = Object.assign(
    {},
    defaultSettings,
    extension_settings[EXTENSION_NAME]
  );
}

function getSettings() {
  return extension_settings[EXTENSION_NAME];
}

function saveSettings() {
  saveSettingsDebounced();
}

// ============================================
// UI 注入
// ============================================

async function injectUI() {
  // 1. 注入悬浮按钮
  const floatButton = $(`
    <div id="bb-float-button" title="骨与血">
      🦴
    </div>
  `);
  $('body').append(floatButton);
  
  // 2. 注入主面板
  const mainPanel = $(`
    <div id="bb-panel" class="bb-panel-hidden">
      <div class="bb-panel-header">
        <span class="bb-panel-title">🦴 骨与血</span>
        <button class="bb-panel-close">✕</button>
      </div>
      
      <div class="bb-panel-content">
        <div class="bb-tab-content" id="bb-tab-scrapbook">
          <h3>🌟 唱片机</h3>
          <p class="bb-empty-hint">还没有收藏任何语录哦~</p>
          <div class="bb-records-list"></div>
        </div>
        
        <div class="bb-tab-content bb-hidden" id="bb-tab-diary">
          <h3>📖 日记本</h3>
          <p class="bb-empty-hint">角色还没有写日记...</p>
          <div class="bb-diary-list"></div>
        </div>
        
        <div class="bb-tab-content bb-hidden" id="bb-tab-intel">
          <h3>📻 情报站</h3>
          <div class="bb-intel-section">
            <h4>📜 阿卡夏记录</h4>
            <div class="bb-summary-content">暂无总结</div>
          </div>
          <div class="bb-intel-section">
            <h4>🗺️ 活点地图</h4>
            <div class="bb-npc-list">暂无NPC追踪</div>
          </div>
          <div class="bb-intel-section">
            <h4>☁️ 环境雷达</h4>
            <div class="bb-weather-content">未检测</div>
          </div>
        </div>
        
        <div class="bb-tab-content bb-hidden" id="bb-tab-parallel">
          <h3>🦋 观测站</h3>
          <p class="bb-empty-hint">点击消息旁的🦋按钮生成平行宇宙</p>
          <div class="bb-parallel-list"></div>
        </div>
        
        <div class="bb-tab-content bb-hidden" id="bb-tab-fate">
          <h3>🃏 命运盘</h3>
          <button id="bb-roll-fate" class="bb-big-button">🎲 摇骰子</button>
          <div class="bb-fate-result"></div>
        </div>
        
        <div class="bb-tab-content bb-hidden" id="bb-tab-settings">
          <h3>⚙️ 设置</h3>
          <div class="bb-settings-form">
            <label>
              <span>API Endpoint:</span>
              <input type="text" id="bb-api-endpoint" placeholder="https://api.openai.com/v1/chat/completions">
            </label>
            <label>
              <span>API Key:</span>
              <input type="password" id="bb-api-key" placeholder="sk-...">
            </label>
            <label>
              <span>Model:</span>
              <input type="text" id="bb-api-model" placeholder="gpt-4o-mini">
            </label>
            <label>
              <span>自动日记触发消息数:</span>
              <input type="number" id="bb-diary-trigger" min="10" max="100" value="30">
            </label>
            <button id="bb-save-settings" class="bb-button">保存设置</button>
          </div>
        </div>
      </div>
      
      <div class="bb-panel-nav">
        <button class="bb-nav-btn bb-nav-active" data-tab="scrapbook">🌟</button>
        <button class="bb-nav-btn" data-tab="diary">📖</button>
        <button class="bb-nav-btn" data-tab="intel">📻</button>
        <button class="bb-nav-btn" data-tab="parallel">🦋</button>
        <button class="bb-nav-btn" data-tab="fate">🃏</button>
        <button class="bb-nav-btn" data-tab="settings">⚙️</button>
      </div>
    </div>
  `);
  $('body').append(mainPanel);
  
  // 3. 绑定UI事件
  bindUIEvents();
  
  // 4. 加载设置到表单
  loadSettingsToForm();
}

function bindUIEvents() {
  // 悬浮按钮点击 - 打开/关闭面板
  $('#bb-float-button').on('click', () => {
    $('#bb-panel').toggleClass('bb-panel-hidden');
  });
  
  // 关闭按钮
  $('.bb-panel-close').on('click', () => {
    $('#bb-panel').addClass('bb-panel-hidden');
  });
  
  // 导航栏切换
  $('.bb-nav-btn').on('click', function() {
    const tab = $(this).data('tab');
    
    // 更新按钮状态
    $('.bb-nav-btn').removeClass('bb-nav-active');
    $(this).addClass('bb-nav-active');
    
    // 切换内容
    $('.bb-tab-content').addClass('bb-hidden');
    $(`#bb-tab-${tab}`).removeClass('bb-hidden');
  });
  
  // 保存设置
  $('#bb-save-settings').on('click', () => {
    saveSettingsFromForm();
    alert('设置已保存！');
  });
  
  // 命运骰子
  $('#bb-roll-fate').on('click', () => {
    rollFate();
  });
}

function loadSettingsToForm() {
  const settings = getSettings();
  $('#bb-api-endpoint').val(settings.api_endpoint);
  $('#bb-api-key').val(settings.api_key);
  $('#bb-api-model').val(settings.api_model);
  $('#bb-diary-trigger').val(settings.diary_trigger_count);
}

function saveSettingsFromForm() {
  const settings = getSettings();
  settings.api_endpoint = $('#bb-api-endpoint').val();
  settings.api_key = $('#bb-api-key').val();
  settings.api_model = $('#bb-api-model').val();
  settings.diary_trigger_count = parseInt($('#bb-diary-trigger').val()) || 30;
  saveSettings();
}

// ============================================
// 事件监听
// ============================================

function registerEventListeners() {
  // 监听消息渲染完成 - 注入收藏按钮
  eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (messageId) => {
    injectMessageButtons(messageId);
    incrementMessageCounter();
  });
  
  eventSource.on(event_types.USER_MESSAGE_RENDERED, (messageId) => {
    injectMessageButtons(messageId);
  });
  
  // 监听聊天切换 - 加载对应数据
  eventSource.on(event_types.CHAT_CHANGED, () => {
    loadChatData();
    resetMessageCounter();
  });
}

// 在消息旁注入按钮
function injectMessageButtons(messageId) {
  const messageElement = $(`.mes[mesid="${messageId}"]`);
  if (messageElement.length === 0) return;
  
  // 检查是否已注入
  if (messageElement.find('.bb-msg-buttons').length > 0) return;
  
  const buttonsHtml = $(`
    <div class="bb-msg-buttons">
      <button class="bb-msg-btn bb-collect-btn" title="收藏这句话">🌟</button>
      <button class="bb-msg-btn bb-butterfly-btn" title="平行宇宙">🦋</button>
    </div>
  `);
  
  // 注入到消息操作区
  messageElement.find('.mes_buttons').prepend(buttonsHtml);
  
  // 绑定事件
  buttonsHtml.find('.bb-collect-btn').on('click', () => {
    collectMessage(messageId);
  });
  
  buttonsHtml.find('.bb-butterfly-btn').on('click', () => {
    generateParallelUniverse(messageId);
  });
}

// ============================================
// 核心功能
// ============================================

// 收藏消息
function collectMessage(messageId) {
  const context = getContext();
  const chat = context.chat;
  const message = chat[messageId];
  
  if (!message) {
    console.error('找不到消息:', messageId);
    return;
  }
  
  // 获取上下文（前一条消息）
  const prevMessage = messageId > 0 ? chat[messageId - 1] : null;
  
  const record = {
    id: `rec-${Date.now()}`,
    who: message.name,
    text: message.mes,
    context: prevMessage ? prevMessage.mes : '',
    floor: messageId,
    date: new Date().toLocaleString('zh-CN'),
    is_user: message.is_user,
  };
  
  pluginData.records_bone.push(record);
  saveChatData();
  renderScrapbook();
  
  // 视觉反馈
  const btn = $(`.mes[mesid="${messageId}"] .bb-collect-btn`);
  // ---- 追加到 collectMessage 函数末尾 ----
  btn.addClass('bb-collected');
  btn.text('✅');
  setTimeout(() => btn.text('🌟'), 1500);
  
  console.log(`[${EXTENSION_NAME}] 收藏了第 ${messageId} 条消息`);
}

// 渲染唱片机
function renderScrapbook() {
  const container = $('#bb-tab-scrapbook .bb-records-list');
  const hint = $('#bb-tab-scrapbook .bb-empty-hint');
  
  container.empty();
  
  if (pluginData.records_bone.length === 0) {
    hint.show();
    return;
  }
  
  hint.hide();
  
  // 添加导出栏
  const exportBar = $(`
    <div class="bb-export-bar">
      <button class="bb-export-btn" id="bb-export-md">📄 导出 Markdown</button>
      <button class="bb-export-btn" id="bb-export-json">📦 导出 JSON</button>
    </div>
  `);
  container.append(exportBar);
  
  $('#bb-export-md').on('click', exportAsMarkdown);
  $('#bb-export-json').on('click', exportAsJSON);
  
  // 渲染卡片（倒序，最新的在上面）
  [...pluginData.records_bone].reverse().forEach((record) => {
    const card = $(`
      <div class="bb-record-card" data-record-id="${record.id}">
        <div class="bb-card-who">${escapeHtml(record.who)}</div>
        <div class="bb-card-text">${escapeHtml(record.text)}</div>
        ${record.context ? `<div class="bb-card-context">↩ ${escapeHtml(record.context.substring(0, 100))}...</div>` : ''}
        <div class="bb-card-meta">
          <span>#${record.floor} · ${record.date}</span>
          <button class="bb-card-delete" data-id="${record.id}">🗑️ 删除</button>
        </div>
      </div>
    `);
    container.append(card);
  });
  
  // 绑定删除
  container.find('.bb-card-delete').on('click', function() {
    const id = $(this).data('id');
    deleteRecord(id);
  });
}

// 删除收藏
function deleteRecord(recordId) {
  pluginData.records_bone = pluginData.records_bone.filter(r => r.id !== recordId);
  saveChatData();
  renderScrapbook();
}

// 渲染日记本
function renderDiary() {
  const container = $('#bb-tab-diary .bb-diary-list');
  const hint = $('#bb-tab-diary .bb-empty-hint');
  
  container.empty();
  
  if (pluginData.diary_blood.length === 0) {
    hint.show();
    return;
  }
  
  hint.hide();
  
  [...pluginData.diary_blood].reverse().forEach((entry) => {
    const card = $(`
      <div class="bb-diary-entry">
        <div class="bb-diary-date">📅 ${entry.date}</div>
        <div class="bb-diary-text">${escapeHtml(entry.content)}</div>
      </div>
    `);
    container.append(card);
  });
}

// 渲染情报站
function renderIntel() {
  $('.bb-summary-content').text(
    pluginData.summaries.length > 0
      ? pluginData.summaries[pluginData.summaries.length - 1].content
      : '暂无总结'
  );
  $('.bb-weather-content').text(pluginData.weather || '未检测');
  
  // NPC 列表
  const npcContainer = $('.bb-npc-list');
  npcContainer.empty();
  
  const npcEntries = Object.entries(pluginData.npc_status);
  if (npcEntries.length === 0) {
    npcContainer.text('暂无NPC追踪');
  } else {
    npcEntries.forEach(([name, status]) => {
      npcContainer.append(`<div><strong>${escapeHtml(name)}</strong>: ${escapeHtml(status)}</div>`);
    });
  }
}

// ============================================
// 副 API 调用
// ============================================

async function callSubAPI(messages) {
  const settings = getSettings();
  
  if (!settings.api_endpoint || !settings.api_key) {
    console.warn(`[${EXTENSION_NAME}] 副API未配置`);
    return null;
  }
  
  try {
    const response = await fetch(settings.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.api_key}`,
      },
      body: JSON.stringify({
        model: settings.api_model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.8,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error(`[${EXTENSION_NAME}] API调用失败:`, error);
    return null;
  }
}

// 获取最近N条聊天记录（格式化）
function getRecentChat(count = 30) {
  const context = getContext();
  const chat = context.chat;
  
  if (!chat || chat.length === 0) return [];
  
  const recentMessages = chat.slice(-count);
  return recentMessages.map(msg => ({
    role: msg.is_user ? 'user' : 'assistant',
    name: msg.name,
    content: msg.mes,
  }));
}

// ============================================
// 功能实现：日记生成
// ============================================

async function generateDiary() {
  const context = getContext();
  const charName = context.name2 || '角色';
  const userName = context.name1 || '用户';
  const recentChat = getRecentChat(30);
  
  if (recentChat.length < 5) return; // 消息太少不生成
  
  const chatSummary = recentChat
    .map(m => `${m.name}: ${m.content}`)
    .join('\n')
    .substring(0, 3000); // 限制长度
  
  const messages = [
    {
      role: 'system',
      content: `你是一位文学助手。请以"${charName}"的第一人称视角写一篇私密日记。
日记应该总结最近发生的事件，并流露出${charName}对${userName}的真实情感（可能是隐藏的）。
风格要求：文学性强、情感细腻、150-250字。不要使用markdown格式。`
    },
    {
      role: 'user',
      content: `以下是最近的对话记录，请根据这些内容写日记：\n\n${chatSummary}`
    }
  ];
  
  const result = await callSubAPI(messages);
  
  if (result) {
    const entry = {
      id: `diary-${Date.now()}`,
      content: result,
      date: new Date().toLocaleString('zh-CN'),
    };
    pluginData.diary_blood.push(entry);
    saveChatData();
    renderDiary();
    console.log(`[${EXTENSION_NAME}] 📖 日记已生成`);
  }
}

// ============================================
// 功能实现：阿卡夏总结
// ============================================

async function generateSummary() {
  const recentChat = getRecentChat(40);
  if (recentChat.length < 10) return;
  
  const chatSummary = recentChat
    .map(m => `${m.name}: ${m.content}`)
    .join('\n')
    .substring(0, 4000);
  
  const messages = [
    {
      role: 'system',
      content: `你是一位冒险日志记录员。请用简洁的"情报简报"风格，总结以下对话中发生的重要事件、关键决策和人物关系变化。
格式：分条列出，每条不超过一句话。总计不超过200字。`
    },
    {
      role: 'user',
      content: chatSummary
    }
  ];
  
  const result = await callSubAPI(messages);
  
  if (result) {
    pluginData.summaries.push({
      id: `sum-${Date.now()}`,
      content: result,
      date: new Date().toLocaleString('zh-CN'),
    });
    saveChatData();
    renderIntel();
    console.log(`[${EXTENSION_NAME}] 📜 总结已生成`);
  }
}

// ============================================
// 功能实现：环境雷达
// ============================================

async function generateWeather() {
  const recentChat = getRecentChat(10);
  const chatSnippet = recentChat
    .map(m => `${m.name}: ${m.content}`)
    .join('\n')
    .substring(0, 1500);
  
  const messages = [
    {
      role: 'system',
      content: `根据以下对话推断当前场景的环境。用一句话描述天气、光线、声音和气味。
示例："深夜的地牢，火把噼啪作响，空气中弥漫着潮湿的石头气味，远处传来水滴回声。"
只输出描述，不要其他文字。`
    },
    {
      role: 'user',
      content: chatSnippet
    }
  ];
  
  const result = await callSubAPI(messages);
  
  if (result) {
    pluginData.weather = result;
    saveChatData();
    renderIntel();
  }
}

// ============================================
// 功能实现：蝴蝶效应（平行宇宙）
// ============================================

async function generateParallelUniverse(messageId) {
  const context = getContext();
  const message = context.chat[messageId];
  if (!message) return;
  
  // 视觉反馈
  const btn = $(`.mes[mesid="${messageId}"] .bb-butterfly-btn`);
  btn.text('⏳');
  
  const messages = [
    {
      role: 'system',
      content: `如果在这个瞬间，角色做出了截然相反、极其离谱或者遭遇了大失败的选择，会发生什么？
写一个50-80字的搞笑或暗黑平行宇宙分支。要简短有趣。不要使用markdown。`
    },
    {
      role: 'user',
      content: `原文："${message.mes.substring(0, 500)}"\n\n请写出平行宇宙版本：`
    }
  ];
  
  const result = await callSubAPI(messages);
  
  btn.text('🦋');
  
  if (result) {
    const parallel = {
      id: `par-${Date.now()}`,
      origin: message.mes.substring(0, 80),
      content: result,
      floor: messageId,
      date: new Date().toLocaleString('zh-CN'),
    };
    
    if (!pluginData.parallel_universes) {
      pluginData.parallel_universes = [];
    }
    pluginData.parallel_universes.push(parallel);
    saveChatData();
    renderParallel();
  }
}

function renderParallel() {
  const container = $('#bb-tab-parallel .bb-parallel-list');
  const hint = $('#bb-tab-parallel .bb-empty-hint');
  
  container.empty();
  
  const list = pluginData.parallel_universes || [];
  if (list.length === 0) {
    hint.show();
    return;
  }
  
  hint.hide();
  
  [...list].reverse().forEach((p) => {
    const card = $(`
      <div class="bb-parallel-card">
        <div class="bb-parallel-origin">📍 原文: "${escapeHtml(p.origin)}..."</div>
        <div class="bb-parallel-text">🦋 ${escapeHtml(p.content)}</div>
      </div>
    `

