// Inject styles
const style = document.createElement('style');
style.textContent = `
.vibe-chat-btn {
  position: fixed;
  top: 50%;
  right: 24px;
  z-index: 999999;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.vibe-chat-panel {
  position: fixed;
  top: 50%;
  right: 84px;
  transform: translateY(-50%);
  width: 340px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  z-index: 999999;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
.vibe-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  background: #4f46e5;
  color: #fff;
  padding: 12px 16px;
  font-weight: bold;
  font-size: 16px;
}
.vibe-chat-header-title {
  flex: 1;
}
.vibe-chat-header-buttons {
  display: flex;
  align-items: center;
  gap: 0;
}
.vibe-chat-header-buttons button {
  margin-left: 0;
}
.vibe-chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-size: 14px;
  background: #f9fafb;
}
.vibe-chat-input-row {
  display: flex;
  border-top: 1px solid #e5e7eb;
  padding: 8px;
  background: #fff;
}
.vibe-chat-textarea {
  flex: 1;
  resize: none;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  margin-right: 8px;
}
.vibe-chat-send-btn {
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
}
.vibe-chat-run-btn {
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 8px;
}
.vibe-chat-header-btn {
  top: 8px;
  right: 12px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}
`;
document.head.appendChild(style);

// Create floating button
const chatBtn = document.createElement('button');
chatBtn.className = 'vibe-chat-btn';
chatBtn.title = 'Open Vibe Chat';
chatBtn.innerHTML = '💬';
document.body.appendChild(chatBtn);

// Create chat panel (hidden by default)
const chatPanel = document.createElement('div');
chatPanel.className = 'vibe-chat-panel';
chatPanel.style.display = 'none';
chatPanel.innerHTML = `
  <div class="vibe-chat-header">
    <span class="vibe-chat-header-title">Vibe Bookmarklet</span>
    <span class="vibe-chat-header-buttons">
      <button class="vibe-chat-settings-btn vibe-chat-header-btn" title="LLM Settings">⚙️</button>
      <button class="vibe-chat-close-btn vibe-chat-header-btn" title="Close">❌</button>
    </span>
  </div>
  <div class="vibe-chat-messages"></div>
  <div class="vibe-chat-input-row">
    <textarea class="vibe-chat-textarea" rows="2" placeholder="What bookmarklet do you want?"></textarea>
    <button class="vibe-chat-send-btn">Send</button>
  </div>
`;
document.body.appendChild(chatPanel);

const closeBtn = chatPanel.querySelector('.vibe-chat-close-btn');
const messagesDiv = chatPanel.querySelector('.vibe-chat-messages');
const textarea = chatPanel.querySelector('.vibe-chat-textarea');
const sendBtn = chatPanel.querySelector('.vibe-chat-send-btn');

let lastCode = '';

function appendMessage(role, text, code) {
  const msg = document.createElement('div');
  msg.style.marginBottom = '12px';
  if (role === 'user') {
    msg.innerHTML = `<b>You:</b> ${text}`;
  } else {
    msg.innerHTML = `<b>Vibe:</b><pre style=\"background:#f3f4f6;padding:8px;border-radius:6px;overflow-x:auto;\">${code ? code : text}</pre>`;
  }
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Settings UI


const settingsPanel = document.createElement('div');
settingsPanel.style.position = 'fixed';
settingsPanel.style.top = '50%';
settingsPanel.style.left = '50%';
settingsPanel.style.transform = 'translate(-50%, -50%)';
settingsPanel.style.background = '#fff';
settingsPanel.style.border = '1px solid #e5e7eb';
settingsPanel.style.borderRadius = '12px';
settingsPanel.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
settingsPanel.style.zIndex = '1000000';
settingsPanel.style.padding = '24px 32px';
settingsPanel.style.display = 'none';
settingsPanel.innerHTML = `
  <h2 style=\"margin-top:0\">LLM Settings</h2>
  <label>OpenAI API Key:<br><input type=\"password\" id=\"vibe-api-key\" style=\"width:100%\"></label><br><br>
  <label>Model:<br><input type=\"text\" id=\"vibe-model\" value=\"gpt-4o-mini\" style=\"width:100%\"></label><br><br>
  <button id=\"vibe-save-settings\">Save</button>
  <button id=\"vibe-cancel-settings\">Cancel</button>
`;
document.body.appendChild(settingsPanel);

const headerSettingsBtn = chatPanel.querySelector('.vibe-chat-settings-btn');

headerSettingsBtn.onclick = () => {
  settingsPanel.style.display = 'block';
};
document.getElementById('vibe-cancel-settings').onclick = () => {
  settingsPanel.style.display = 'none';
};
document.getElementById('vibe-save-settings').onclick = () => {
  const apiKey = document.getElementById('vibe-api-key').value;
  const model = document.getElementById('vibe-model').value;
  chrome.storage.local.set({ vibeApiKey: apiKey, vibeModel: model }, () => {
    settingsPanel.style.display = 'none';
  });
};

// Load settings on startup
let vibeApiKey = '';
let vibeModel = 'gpt-4o-mini';
chrome.storage.local.get(['vibeApiKey', 'vibeModel'], (result) => {
  if (result.vibeApiKey) vibeApiKey = result.vibeApiKey;
  if (result.vibeModel) vibeModel = result.vibeModel;
  document.getElementById('vibe-api-key').value = vibeApiKey;
  document.getElementById('vibe-model').value = vibeModel;
});

// LLM session state
let conversation = [];

async function callLLM(prompt, cb) {
  if (!vibeApiKey) {
    appendMessage('vibe', 'Please set your OpenAI API key in settings.');
    cb('');
    return;
  }
  // Get the full HTML of the page
  const html = document.documentElement.outerHTML;
  // Compose messages
  const system = 'You are a helpful assistant that writes only valid bookmarklets (javascript:... URLs) for the user request, and nothing else. Do not include explanations or markdown formatting. The HTML of the page is provided below.';
  const userPrompt = 'write me a javascript bookmarklet that will: ' + prompt;
  const messages = [
    { role: 'system', content: system + '\n\nHTML:\n' + html },
    ...conversation,
    { role: 'user', content: userPrompt }
  ];
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + vibeApiKey
      },
      body: JSON.stringify({
        model: vibeModel,
        messages: messages,
      })
    });
    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const code = data.choices[0].message.content.trim();
      conversation.push({ role: 'user', content: prompt });
      conversation.push({ role: 'assistant', content: code });
      cb(code);
    } else {
      appendMessage('vibe', 'No response from LLM.');
      cb('');
    }
  } catch (e) {
    appendMessage('vibe', 'Error calling LLM: ' + e.message);
    cb('');
  }
}

// Add mock/llm toggle next to Send button
const inputRow = chatPanel.querySelector('.vibe-chat-input-row');
const mockToggleLabel = document.createElement('label');
mockToggleLabel.style.display = 'flex';
mockToggleLabel.style.alignItems = 'center';
mockToggleLabel.style.marginLeft = '8px';
mockToggleLabel.style.fontSize = '13px';
const mockToggle = document.createElement('input');
mockToggle.type = 'checkbox';
mockToggle.style.marginRight = '4px';
mockToggleLabel.appendChild(mockToggle);
mockToggleLabel.appendChild(document.createTextNode('Mock'));
inputRow.appendChild(mockToggleLabel);

// Store and load mock/llm mode
let useMock = false;
chrome.storage.local.get(['vibeUseMock'], (result) => {
  if (typeof result.vibeUseMock === 'boolean') {
    useMock = result.vibeUseMock;
    mockToggle.checked = useMock;
  }
});
mockToggle.onchange = () => {
  useMock = mockToggle.checked;
  chrome.storage.local.set({ vibeUseMock: useMock });
};

// Skeleton loader CSS
const skeletonStyle = document.createElement('style');
skeletonStyle.textContent = `
.vibe-skeleton {
  background: linear-gradient(90deg, #f3f3f3 25%, #e0e0e0 37%, #f3f3f3 63%);
  background-size: 400% 100%;
  animation: vibe-skeleton-loading 1.2s ease-in-out infinite;
  border-radius: 6px;
  min-height: 32px;
  width: 100%;
  margin: 8px 0;
}
@keyframes vibe-skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
`;
document.head.appendChild(skeletonStyle);

function appendSkeletonLoader() {
  const msg = document.createElement('div');
  msg.className = 'vibe-skeleton';
  msg.setAttribute('data-skeleton', 'true');
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return msg;
}
function removeSkeletonLoader() {
  const skeleton = messagesDiv.querySelector('[data-skeleton="true"]');
  if (skeleton) skeleton.remove();
}

// Send button logic
sendBtn.onclick = () => {
  const prompt = textarea.value.trim();
  if (!prompt) return;
  appendMessage('user', prompt);
  textarea.value = '';
  sendBtn.disabled = true;
  const skeleton = appendSkeletonLoader();
  if (useMock) {
    // In mock mode, echo the user input as the code
    setTimeout(() => {
      lastCode = prompt;
      removeSkeletonLoader();
      appendMessage('vibe', '', prompt);
      sendBtn.disabled = false;
      upsertVibeBookmarklet(prompt);
    }, 400);
  } else {
    callLLM(prompt, (code) => {
      lastCode = code;
      removeSkeletonLoader();
      appendMessage('vibe', '', code);
      sendBtn.disabled = false;
      upsertVibeBookmarklet(code);
    });
  }
};

// Make the floating chat button draggable and move the chat panel with it
let chatBtnX = window.innerWidth - 72; // initial right offset
let chatBtnY = window.innerHeight / 2;
chatBtn.style.position = 'fixed';
chatBtn.style.left = chatBtnX + 'px';
chatBtn.style.top = chatBtnY + 'px';
chatBtn.style.right = '';
chatBtn.style.bottom = '';

chatPanel.style.position = 'fixed';
chatPanel.style.left = (chatBtnX - 340 - 12) + 'px';
chatPanel.style.top = (chatBtnY - chatPanel.offsetHeight / 2 + 24) + 'px';
chatPanel.style.right = '';
chatPanel.style.bottom = '';

function updateChatPanelPosition() {
  chatPanel.style.left = (chatBtnX - 340 - 12) + 'px';
  chatPanel.style.top = (chatBtnY - chatPanel.offsetHeight / 2 + 24) + 'px';
}

let isDragging = false;
let wasDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

chatBtn.addEventListener('mousedown', (e) => {
  isDragging = true;
  wasDragging = false;
  dragOffsetX = e.clientX - chatBtn.getBoundingClientRect().left;
  dragOffsetY = e.clientY - chatBtn.getBoundingClientRect().top;
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  chatBtnX = e.clientX - dragOffsetX;
  chatBtnY = e.clientY - dragOffsetY;
  chatBtn.style.left = chatBtnX + 'px';
  chatBtn.style.top = chatBtnY + 'px';
  updateChatPanelPosition();
  wasDragging = true;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.userSelect = '';
});

// When window resizes, keep button in view
window.addEventListener('resize', () => {
  chatBtnX = Math.min(chatBtnX, window.innerWidth - 48);
  chatBtnY = Math.min(chatBtnY, window.innerHeight - 48);
  chatBtn.style.left = chatBtnX + 'px';
  chatBtn.style.top = chatBtnY + 'px';
  updateChatPanelPosition();
});

// When opening chat, update position
chatBtn.onclick = (e) => {
  if (wasDragging) {
    wasDragging = false;
    return;
  }
  chatPanel.style.display = chatPanel.style.display === 'none' ? 'flex' : 'none';
  updateChatPanelPosition();
};
closeBtn.onclick = () => {
  chatPanel.style.display = 'none';
};

// Optional: close chat on Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') chatPanel.style.display = 'none';
});

function upsertVibeBookmarklet(code) {
  chrome.runtime.sendMessage({
    type: 'UPSERT_VIBE_BOOKMARKLET',
    code,
    pageTitle: document.title
  });
} 