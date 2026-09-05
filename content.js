const DEFAULTS = { shortsMode: "always", hideFeed: true };
let settings = { ...DEFAULTS };

const BUTTON_ID = "sts-open-player-btn";

function shortsIdFrom(pathname) {
  const m = pathname.match(/^\/shorts\/([\w-]+)/);
  return m ? m[1] : null;
}

// /shorts/VIDEO_ID → /watch?v=VIDEO_ID (같은 호스트 유지, 뒤로가기 오염 방지를 위해 replace)
function maybeRedirect() {
  if (settings.shortsMode !== "always") return;
  const id = shortsIdFrom(location.pathname);
  if (id) location.replace(`/watch?v=${id}`);
}

// CSS는 html[sts-hide] 셀렉터로만 동작하므로 속성 토글로 켜고 끈다
function applyHide() {
  document.documentElement.toggleAttribute("sts-hide", settings.hideFeed);
}

// 버튼 모드: 쇼츠 화면 위에 "일반 플레이어로 열기" 플로팅 버튼 표시.
// 쇼츠를 넘기면 URL이 바뀌므로, 클릭 시점의 URL에서 영상 ID를 읽는다.
function updateButton() {
  const existing = document.getElementById(BUTTON_ID);
  const wanted = settings.shortsMode === "button" && shortsIdFrom(location.pathname);
  if (!wanted) {
    existing?.remove();
    return;
  }
  if (existing || !document.body) return;

  const btn = document.createElement("button");
  btn.id = BUTTON_ID;
  btn.textContent = chrome.i18n.getMessage("openInPlayer");
  btn.style.cssText = [
    "position:fixed",
    "top:72px",
    "right:16px",
    "z-index:9999",
    "padding:10px 16px",
    "border:none",
    "border-radius:20px",
    "background:#4f46e5",
    "color:#fff",
    "font-size:13px",
    "font-weight:600",
    "cursor:pointer",
    "box-shadow:0 2px 8px rgba(0,0,0,.35)",
  ].join(";");
  btn.addEventListener("click", () => {
    const id = shortsIdFrom(location.pathname);
    if (id) location.href = `/watch?v=${id}`;
  });
  document.body.appendChild(btn);
}

function applyAll() {
  maybeRedirect();
  applyHide();
  updateButton();
}

chrome.storage.sync.get(DEFAULTS, (loaded) => {
  settings = loaded;
  applyAll();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  for (const [key, change] of Object.entries(changes)) {
    settings[key] = change.newValue;
  }
  applyAll();
});

// 유튜브는 SPA라 페이지 이동이 새로고침 없이 일어남 → 자체 내비게이션 이벤트를 감시
window.addEventListener("yt-navigate-start", applyAll, true);
window.addEventListener("yt-navigate-finish", applyAll, true);
// document_start 시점에는 body가 없어서 버튼을 못 붙이므로 DOM 준비 후 한 번 더
document.addEventListener("DOMContentLoaded", updateButton);
