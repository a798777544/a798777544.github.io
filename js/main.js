/* ============================================================
 * 主页逻辑 main.js —— 游戏乐园
 * 负责：渲染游戏列表、分类筛选、搜索过滤、最近玩过、收藏
 * ============================================================ */

/* ---------- 数据存储（localStorage） ---------- */
var RECENT_KEY = "youxiwangzhan_recent"; // 最近玩过的游戏id数组
var FAV_KEY = "youxiwangzhan_favs";       // 收藏的游戏id数组
var RECENT_LIMIT = 6;                     // 最近玩过最多显示条数

function getRecent() {
  return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
}
function getFavs() {
  return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
}
function saveFavs(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

/* 记录"最近玩过"：把 id 放到数组最前面，并去重、限制长度 */
function recordRecent(id) {
  var list = getRecent().filter(function (x) { return x !== id; });
  list.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_LIMIT)));
}

/* 判断某游戏是否被收藏 */
function isFaved(id) {
  return getFavs().indexOf(id) !== -1;
}

/* ---------- 当前筛选状态 ---------- */
var state = {
  category: "全部",
  keyword: ""
};

/* ---------- DOM 引用 ---------- */
var categoryNav = document.getElementById("categoryNav");
var gameGrid = document.getElementById("gameGrid");
var recentList = document.getElementById("recentList");
var recentSection = document.getElementById("recentSection");
var favList = document.getElementById("favList");
var favSection = document.getElementById("favSection");
var sectionTitle = document.getElementById("sectionTitle");
var emptyState = document.getElementById("emptyState");
var searchInput = document.getElementById("searchInput");

/* ---------- 工具：转义特殊字符，避免注入 ---------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------- 渲染分类导航 ---------- */
function renderCategories() {
  // 统计有哪些分类
  var cats = [];
  GAME_LIST.forEach(function (g) {
    if (cats.indexOf(g.category) === -1) cats.push(g.category);
  });
  var all = ["全部"].concat(cats);

  categoryNav.innerHTML = all.map(function (c) {
    var cls = c === state.category ? "cat-btn active" : "cat-btn";
    return '<button class="' + cls + '" data-cat="' + escapeHtml(c) + '">' +
      escapeHtml(c) + "</button>";
  }).join("");
}

/* ---------- 渲染一张游戏卡片 ---------- */
function renderCard(game) {
  var faved = isFaved(game.id);
  return (
    '<div class="game-card" data-id="' + game.id + '">' +
      '<button class="fav-btn' + (faved ? " faved" : "") + '" data-fav="' + game.id +
        '" title="' + (faved ? "取消收藏" : "收藏") + '">' +
        (faved ? "★" : "☆") +
      "</button>" +
      '<img class="game-cover" src="' + escapeHtml(game.cover) + '" alt="' +
        escapeHtml(game.title) + '" loading="lazy" />' +
      '<div class="game-info">' +
        '<div class="game-title">' + escapeHtml(game.title) + "</div>" +
        '<div class="game-desc">' + escapeHtml(game.description || "") + "</div>" +
        '<span class="game-tag">' + escapeHtml(game.category) + "</span>" +
      "</div>" +
    "</div>"
  );
}

/* 根据当前筛选条件得到游戏列表 */
function filteredGames() {
  var kw = state.keyword.trim().toLowerCase();
  return GAME_LIST.filter(function (g) {
    var matchCat = state.category === "全部" || g.category === state.category;
    var matchKw = !kw ||
      g.title.toLowerCase().indexOf(kw) !== -1 ||
      (g.description || "").toLowerCase().indexOf(kw) !== -1 ||
      g.category.toLowerCase().indexOf(kw) !== -1;
    return matchCat && matchKw;
  });
}

/* ---------- 渲染全部游戏网格 ---------- */
function renderGrid() {
  var list = filteredGames();
  sectionTitle.textContent = state.keyword
    ? "搜索结果：" + state.keyword
    : state.category === "全部" ? "全部游戏" : state.category + " 游戏";

  if (list.length === 0) {
    gameGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");
  gameGrid.innerHTML = list.map(renderCard).join("");
}

/* ---------- 渲染最近玩过 ---------- */
function renderRecent() {
  var ids = getRecent();
  var games = ids
    .map(function (id) { return getGameById(id); })
    .filter(Boolean);

  if (games.length === 0) {
    recentSection.classList.add("hidden");
    return;
  }
  recentSection.classList.remove("hidden");
  recentList.innerHTML = games.map(renderCard).join("");
}

/* ---------- 渲染收藏 ---------- */
function renderFavs() {
  var ids = getFavs();
  var games = ids
    .map(function (id) { return getGameById(id); })
    .filter(Boolean);

  if (games.length === 0) {
    favSection.classList.add("hidden");
    return;
  }
  favSection.classList.remove("hidden");
  favList.innerHTML = games.map(renderCard).join("");
}

/* 根据 id 获取游戏对象 */
function getGameById(id) {
  var found = null;
  GAME_LIST.forEach(function (g) {
    if (g.id === id) found = g;
  });
  return found;
}

/* ---------- 事件：分类点击 ---------- */
categoryNav.addEventListener("click", function (e) {
  var btn = e.target.closest(".cat-btn");
  if (!btn) return;
  state.category = btn.getAttribute("data-cat");
  renderCategories();
  renderGrid();
});

/* ---------- 事件：搜索 ---------- */
searchInput.addEventListener("input", function () {
  state.keyword = searchInput.value;
  renderGrid();
});

/* ---------- 事件：收藏切换 ---------- */
document.addEventListener("click", function (e) {
  var favBtn = e.target.closest("[data-fav]");
  if (favBtn) {
    var id = Number(favBtn.getAttribute("data-fav"));
    var favs = getFavs();
    var idx = favs.indexOf(id);
    if (idx === -1) {
      favs.unshift(id); // 加入收藏
    } else {
      favs.splice(idx, 1); // 取消收藏
    }
    saveFavs(favs);
    renderGrid();
    renderFavs();
    e.stopPropagation();
  }
});

/* ---------- 事件：点击卡片进游戏 ---------- */
document.addEventListener("click", function (e) {
  // 点的是收藏按钮时不进游戏（收藏按钮也在卡片内部）
  if (e.target.closest(".fav-btn")) return;
  var card = e.target.closest(".game-card");
  if (!card) return;
  var id = Number(card.getAttribute("data-id"));
  recordRecent(id); // 记录最近玩过
  location.href = "play.html?id=" + id;
});

/* ---------- 首次加载 ---------- */
function init() {
  renderCategories();
  renderGrid();
  renderRecent();
  renderFavs();
}

init();