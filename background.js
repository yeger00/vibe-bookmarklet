chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RUN_CODE' && sender.tab && sender.tab.id) {
    chrome.scripting.executeScript({
      target: {tabId: sender.tab.id},
      func: function(code) {
        var script = document.createElement('script');
        script.textContent = code;
        document.documentElement.appendChild(script);
        script.parentNode.removeChild(script);
      },
      args: [message.code]
    });
    sendResponse({status: 'ok'});
  }
  if (message.type === 'UPSERT_VIBE_BOOKMARKLET') {
    const { code, pageTitle } = message;
    const folderTitle = 'vibe bookmarklet';
    const bookmarkletCode = `javascript:${encodeURIComponent(code)}`;

    chrome.bookmarks.search({ title: folderTitle }, (folders) => {
      let folderId;
      if (folders && folders.length > 0) {
        folderId = folders[0].id;
        addOrUpdateBookmark(folderId);
      } else {
        // parentId '1' is the bookmarks bar, index 0 is first position
        chrome.bookmarks.create({ title: folderTitle, parentId: '1', index: 0 }, (folder) => {
          folderId = folder.id;
          addOrUpdateBookmark(folderId);
        });
      }

      function addOrUpdateBookmark(folderId) {
        chrome.bookmarks.search({ title: pageTitle }, (bookmarks) => {
          const existing = bookmarks.find(b => b.parentId === folderId);
          if (existing) {
            chrome.bookmarks.update(existing.id, { url: bookmarkletCode });
          } else {
            chrome.bookmarks.create({ parentId: folderId, title: pageTitle, url: bookmarkletCode });
          }
        });
      }
    });
    sendResponse({ status: 'ok' });
    return true;
  }
}); 