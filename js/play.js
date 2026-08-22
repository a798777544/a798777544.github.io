/* ============================================================
 * 游戏播放页逻辑 play.js
 * 根据 index.html 传入的 ?id=xxx 参数，加载对应的 Playgama 游戏
 * ============================================================ */

var FAV_KEY = "youxiwangzhan_favs";

function getParam(name) {
  var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
}
function getFavs() { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); }
function saveFavs(list) { localStorage.setItem(FAV_KEY, JSON.stringify(list)); }

/* 根据 id 查找游戏 */
function getGameById(id) {
  for (var i = 0; i < GAME_LIST.length; i++) {
    if (GAME_LIST[i].id === id) return GAME_LIST[i];
  }
  return null;
}

/* ---------- 初始化 ---------- */
function init() {
  var id = Number(getParam("id"));
  var game = getGameById(id);

  document.title = (game ? game.title : "游戏") + " · 游戏乐园";

  var titleEl = document.getElementById("gameTitle");
  var tagEl = document.getElementById("gameTag");
  var playerBox = document.getElementById("playerBox");
  var favBtn = document.getElementById("favBtn");

  if (!game) {
    titleEl.textContent = "未找到该游戏";
    tagEl.textContent = "";
    playerBox.innerHTML = '<div class="empty">游戏不存在或已被移除</div>';
    return;
  }

  titleEl.textContent = game.title;
  tagEl.textContent = game.category;
  favBtn.textContent = isFaved(game.id) ? "★ 已收藏" : "☆ 收藏";
  favBtn.classList.toggle("fayed", isFaved(game.id));

  // 播放区域：有 Playgama 链接则用 iframe 播放，否则显示占位提示
  if (game.embedUrl) {
    playerBox.innerHTML =
      '<iframe class="game-frame" src="' + escapeHtml(game.embedUrl) +
      '" frameborder="0" allowfullscreen allow="autoplay; fullscreen; accelerometer; gyroscope; pointer-lock"></iframe>';
  } else {
    playerBox.innerHTML =
      '<div class="placeholder">' +
        "<p class=\"ph-big\">游戏尚未接入</p>" +
        "<p>去 Playgama 复制嵌入链接，填到 <code>data/games.js</code> 的 <code>" +
        game.title + "</code> 对应的 embedUrl 里即可播放。</p>" +
      "</div>";
  }
}

function isFaved(id) {
  return getFavs().indexOf(id) !== -1;
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* 返回主页 */
document.getElementById("backBtn").addEventListener("click", function () {
  location.href = "index.html";
});

/* 收藏切换 */
document.getElementById("favBtn").addEventListener("click", function () {
  var id = Number(getParam("id"));
  var favs = getFavs();
  var idx = favs.indexOf(id);
  if (idx === -1) { favs.unshift(id); } else { favs.splice(idx, 1); }
  saveFavs(favs);
  var faved = isFaved(id);
  this.textContent = faved ? "★ 已收藏" : "☆ 收藏";
  this.classList.toggle("fayed", faved);
});

/* 全屏播放 */
document.getElementById("fullBtn").addEventListener("click", function () {
  var box = document.getElementById("playerBox");
  if (box.requestFullscreen) {
    box.requestFullscreen();
  } else if (box.webkitRequestFullscreen) {
    box.webkitRequestFullscreen();
  } else if (box.msRequestFullscreen) {
    box.msRequestFullscreen();
  }
});

init();