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

function appendMessage(role, text, code) {
  const msg = document.createElement('div');
  msg.style.marginBottom = '12px';
  if (role === 'user') {
    msg.innerHTML = `<b>You:</b> ${text}`;
  } else {
    msg.innerHTML = `<b>Vibe:</b><pre style="background:#f3f4f6;padding:8px;border-radius:6px;overflow-x:auto;">${code ? code : text}</pre>`;
    if (code) {
      const runBtn = document.createElement('button');
      runBtn.className = 'vibe-chat-run-btn';
      runBtn.textContent = 'Run Code';
      runBtn.onclick = () => {
        try {
          // eslint-disable-next-line no-eval
          eval(code);
        } catch (e) {
          alert('Error running code: ' + e.message);
        }
      };
      msg.appendChild(runBtn);
    }
  }
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function mockLLMRequest(prompt, cb) {
  setTimeout(() => {
    // Return a sample JS code string
    const code = `alert('Hello from Vibe! Your prompt was: ${prompt.replace(/'/g, "\'")}');`;
    cb(code);
  }, 1200);
}

sendBtn.onclick = () => {
  const prompt = textarea.value.trim();
  if (!prompt) return;
  appendMessage('user', prompt);
  textarea.value = '';
  sendBtn.disabled = true;
  mockLLMRequest(prompt, (code) => {
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