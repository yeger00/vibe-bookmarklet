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
  background: #4f46e5;
  color: #fff;
  padding: 12px 16px;
  font-weight: bold;
  font-size: 16px;
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
.vibe-chat-close-btn {
  position: absolute;
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
    Vibe Chat
    <button class="vibe-chat-close-btn" title="Close">×</button>
  </div>
  <div class="vibe-chat-messages"></div>
  <div class="vibe-chat-input-row">
    <textarea class="vibe-chat-textarea" rows="2" placeholder="Ask me to write JS code..."></textarea>
    <button class="vibe-chat-send-btn">Send</button>
  </div>
`;
document.body.appendChild(chatPanel);

const closeBtn = chatPanel.querySelector('.vibe-chat-close-btn');
const messagesDiv = chatPanel.querySelector('.vibe-chat-messages');
const textarea = chatPanel.querySelector('.vibe-chat-textarea');
const sendBtn = chatPanel.querySelector('.vibe-chat-send-btn');

let lastCode = '';

function runCodeInPageContext(code) {
  chrome.runtime.sendMessage({type: 'RUN_CODE', code});
}

function appendMessage(role, text, code) {
  const msg = document.createElement('div');
  msg.style.marginBottom = '12px';
  if (role === 'user') {
    msg.innerHTML = `<b>You:</b> ${text}`;
  } else {
    msg.innerHTML = `<b>Vibe:</b><pre style=\"background:#f3f4f6;padding:8px;border-radius:6px;overflow-x:auto;\">${code ? code : text}</pre>`;
    if (code) {
      const runLink = document.createElement('a');
      runLink.className = 'vibe-chat-run-btn';
      runLink.textContent = 'Run Code';
      runLink.style.display = 'inline-block';
      runLink.style.textDecoration = 'none';
      runLink.style.marginTop = '8px';
      runLink.style.background = '#10b981';
      runLink.style.color = '#fff';
      runLink.style.borderRadius = '6px';
      runLink.style.padding = '6px 10px';
      runLink.style.fontSize = '13px';
      runLink.style.cursor = 'pointer';
      // URI encode the code for the javascript: URL
      runLink.href = 'javascript:' + encodeURIComponent(code);
      runLink.target = '_self';
      msg.appendChild(runLink);
    }
  }
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Settings UI
const settingsBtn = document.createElement('button');
settingsBtn.textContent = '⚙️';
settingsBtn.title = 'LLM Settings';
settingsBtn.style.position = 'fixed';
settingsBtn.style.top = 'calc(50% + 60px)';
settingsBtn.style.right = '24px';
settingsBtn.style.zIndex = '999999';
settingsBtn.style.background = '#fff';
settingsBtn.style.border = '1px solid #d1d5db';
settingsBtn.style.borderRadius = '50%';
settingsBtn.style.width = '40px';
settingsBtn.style.height = '40px';
settingsBtn.style.display = 'flex';
settingsBtn.style.alignItems = 'center';
settingsBtn.style.justifyContent = 'center';
settingsBtn.style.fontSize = '20px';
settingsBtn.style.cursor = 'pointer';
document.body.appendChild(settingsBtn);

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
  <label>System Prompt:<br><textarea id=\"vibe-system-prompt\" rows=\"2\" style=\"width:100%\">You are a helpful assistant that writes only valid JavaScript code for the user request, and nothing else. Do not include explanations or markdown formatting. The HTML of the page is provided below.</textarea></label><br><br>
  <button id=\"vibe-save-settings\">Save</button>
  <button id=\"vibe-cancel-settings\">Cancel</button>
`;
document.body.appendChild(settingsPanel);

settingsBtn.onclick = () => {
  settingsPanel.style.display = 'block';
};
document.getElementById('vibe-cancel-settings').onclick = () => {
  settingsPanel.style.display = 'none';
};
document.getElementById('vibe-save-settings').onclick = () => {
  const apiKey = document.getElementById('vibe-api-key').value;
  const model = document.getElementById('vibe-model').value;
  const systemPrompt = document.getElementById('vibe-system-prompt').value;
  chrome.storage.local.set({ vibeApiKey: apiKey, vibeModel: model, vibeSystemPrompt: systemPrompt }, () => {
    settingsPanel.style.display = 'none';
  });
};

// Load settings on startup
let vibeApiKey = '';
let vibeModel = 'gpt-4o-mini';
let vibeSystemPrompt = '';
chrome.storage.local.get(['vibeApiKey', 'vibeModel', 'vibeSystemPrompt'], (result) => {
  if (result.vibeApiKey) vibeApiKey = result.vibeApiKey;
  if (result.vibeModel) vibeModel = result.vibeModel;
  if (result.vibeSystemPrompt) vibeSystemPrompt = result.vibeSystemPrompt;
  document.getElementById('vibe-api-key').value = vibeApiKey;
  document.getElementById('vibe-model').value = vibeModel;
  document.getElementById('vibe-system-prompt').value = vibeSystemPrompt;
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
  const system = vibeSystemPrompt || 'You are a helpful assistant that writes only valid JavaScript code for the user request, and nothing else. Do not include explanations or markdown formatting. The HTML of the page is provided below.';
  const userPrompt = 'write me a javascript snippet that will: ' + prompt;
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

// Replace mockLLMRequest with callLLM
sendBtn.onclick = () => {
  const prompt = textarea.value.trim();
  if (!prompt) return;
  appendMessage('user', prompt);
  textarea.value = '';
  sendBtn.disabled = true;
  callLLM(prompt, (code) => {
    lastCode = code;
    appendMessage('vibe', '', code);
    sendBtn.disabled = false;
  });
};

chatBtn.onclick = () => {
  chatPanel.style.display = chatPanel.style.display === 'none' ? 'flex' : 'none';
};
closeBtn.onclick = () => {
  chatPanel.style.display = 'none';
};

// Optional: close chat on Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') chatPanel.style.display = 'none';
}); 