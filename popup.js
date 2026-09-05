const DEFAULTS = { shortsMode: "always", hideFeed: true };

const t = chrome.i18n.getMessage;
document.getElementById("title").textContent = t("extName");
document.getElementById("modeTitle").textContent = t("popupModeTitle");
document.getElementById("modeAlways").textContent = t("modeAlways");
document.getElementById("modeButton").textContent = t("modeButton");
document.getElementById("modeOff").textContent = t("modeOff");
document.getElementById("labelHideFeed").textContent = t("popupHide");
document.getElementById("hint").textContent = t("popupHint");

chrome.storage.sync.get(DEFAULTS, (settings) => {
  for (const radio of document.querySelectorAll('input[name="shortsMode"]')) {
    radio.checked = radio.value === settings.shortsMode;
    radio.addEventListener("change", () => {
      if (radio.checked) chrome.storage.sync.set({ shortsMode: radio.value });
    });
  }

  const hideFeed = document.getElementById("hideFeed");
  hideFeed.checked = settings.hideFeed;
  hideFeed.addEventListener("change", () => {
    chrome.storage.sync.set({ hideFeed: hideFeed.checked });
  });
});
