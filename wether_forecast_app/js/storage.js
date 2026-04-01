const SEARCH_HISTORY_COOKIE = "weatherSearchHistory";
const MAX_HISTORY = 12;

(function clearHistoryOnPageRefresh() {
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav && nav.type === "reload") {
      deleteSearchHistoryCookie();
    }
  } catch {
    /* ignore */
  }
})();

function getCookie(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + escaped + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setSessionCookie(name, value) {
  const v = encodeURIComponent(value);
  document.cookie = `${encodeURIComponent(name)}=${v}; Path=/; SameSite=Lax`;
}

function deleteSearchHistoryCookie() {
  document.cookie = `${encodeURIComponent(SEARCH_HISTORY_COOKIE)}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function getSearchHistory() {
  try {
    const raw = getCookie(SEARCH_HISTORY_COOKIE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addSearchToHistory(query) {
  const q = String(query || "").trim();
  if (!q) return;
  let list = getSearchHistory().filter(
    (item) => item.toLowerCase() !== q.toLowerCase()
  );
  list.unshift(q);
  list = list.slice(0, MAX_HISTORY);
  setSessionCookie(SEARCH_HISTORY_COOKIE, JSON.stringify(list));
}

function clearSearchHistory() {
  deleteSearchHistoryCookie();
}
