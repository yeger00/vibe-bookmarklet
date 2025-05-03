# Vibe Chat Button Chrome Extension

A Chrome extension that adds a floating chat button to every page (like Grammarly). Click the button to open a chat panel where you can ask for JavaScript code from an LLM, see the code, and run it in the current page context.

## Features
- Floating button on the right side of every page
- Chat panel with conversation history
- Text area to send requests
- LLM (mocked) returns JavaScript code as a response
- Button to run the returned code in the current page

## Installation
1. Clone or download this repository to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.

## Usage
- The 💬 button appears on the right side of every page.
- Click it to open the chat panel.
- Type your request (e.g., "Show an alert") and click **Send**.
- The LLM (mocked) will reply with JavaScript code.
- Click **Run Code** to execute the code in the current page.

## Customizing the LLM
- The LLM call is currently mocked in `content.js` (see `mockLLMRequest`).
- To connect to a real LLM API, replace the `mockLLMRequest` function with your API call and handle the response.

---
**Security note:** Running arbitrary JavaScript can be dangerous. Only run code you trust. 