importScripts("settings.js");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    for (const [id, title] of [
      ["add_to_archive", "Submit link to archive.today"],
      ["search_in_archive", "Search for link in archive.today"]
    ]) {
      chrome.contextMenus.create({
        id, title, contexts: ["link"], targetUrlPatterns: ["http://*/*", "https://*/*"]
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (!["add_to_archive", "search_in_archive"].includes(info.menuItemId)) return;
  chrome.storage.sync.get(ArchiveSettings.defaults, (saved) => {
    if (chrome.runtime.lastError) {
      console.error("Unable to read archive settings:", chrome.runtime.lastError.message);
      return;
    }
    const url = ArchiveSettings.buildUrl(info.menuItemId, info.linkUrl, saved);
    if (url) chrome.tabs.create({ url }, () => {
      if (chrome.runtime.lastError) {
        console.error("Unable to open archive tab:", chrome.runtime.lastError.message);
      }
    });
  });
});
