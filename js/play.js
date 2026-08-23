/* ============================================================
 * 游戏播放页逻辑 play.js
 * 根据 index.html 传入的 ?id=xxx 参数，加载对应的 Playgama 游戏
 * 新增：全屏/横屏引导、退出全屏恢复、返回时退出全屏
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

/* ---------- DOM 引用 ---------- */
var playerBox, playMain, playBar, startOverlay, exitToast, favBtn, fullBtn, gameData;

/* ---------- 全屏管理 ---------- */
function enterFullscreen() {
  var el = playMain;
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function onFullscreenChange() {
  if (isFullscreen()) {
    // 进入全屏 → 隐藏顶栏，播放器占满全屏
    playBar.classList.add("bar-hidden");
    playMain.classList.add("fullscreen-mode");
  } else {
    // 退出全屏 → 恢复正常浏览状态
    playBar.classList.remove("bar-hidden");
    playMain.classList.remove("fullscreen-mode");
    showExitToast();
  }
}

function showExitToast() {
  exitToast.classList.remove("hidden");
  // 重置动画
  exitToast.style.animation = "none";
  void exitToast.offsetHeight;
  exitToast.style.animation = "toastIn 0.3s ease, toastOut 0.3s ease 2s forwards";
  setTimeout(function() {
    exitToast.classList.add("hidden");
  }, 2500);
}

/* ---------- 初始化 ---------- */
function init() {
  var id = Number(getParam("id"));
  var game = getGameById(id);
  gameData = game;

  document.title = (game ? game.title : "游戏") + " · 游戏乐园";

  playerBox = document.getElementById("playerBox");
  playMain  = document.getElementById("playMain");
  playBar   = document.getElementById("playBar");
  startOverlay = document.getElementById("startOverlay");
  exitToast = document.getElementById("exitToast");
  favBtn    = document.getElementById("favBtn");
  fullBtn   = document.getElementById("fullBtn");

  if (!game) {
    document.getElementById("gameTitle").textContent = "未找到该游戏";
    document.getElementById("gameTag").textContent = "";
    playerBox.innerHTML = '<div class="empty">游戏不存在或已被移除</div>';
    startOverlay.classList.add("hidden");
    return;
  }

  document.getElementById("gameTitle").textContent = game.title;
  document.getElementById("gameTag").textContent = game.category;
  favBtn.textContent = isFaved(game.id) ? "★ 已收藏" : "☆ 收藏";
  favBtn.classList.toggle("fayed", isFaved(game.id));

  // 播放区域：有 Playgama 链接则用 iframe 播放
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
    startOverlay.classList.add("hidden");
  }

  // 监听全屏变化
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);
  document.addEventListener("MSFullscreenChange", onFullscreenChange);
}

/* ---------- 事件绑定 ---------- */

/* 返回主页：先退出全屏再跳转 */
document.getElementById("backBtn").addEventListener("click", function () {
  if (isFullscreen()) {
    exitFullscreen();
    // 等全屏退出后再跳转
    setTimeout(function() {
      location.href = "index.html";
    }, 300);
  } else {
    location.href = "index.html";
  }
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

/* 全屏播放按钮（顶栏里的） */
document.getElementById("fullBtn").addEventListener("click", function () {
  enterFullscreen();
});

/* 开始全屏遮罩按钮 */
document.getElementById("startBtn").addEventListener("click", function () {
  startOverlay.classList.add("hidden");
  enterFullscreen();
});

/* 暂不全屏按钮 */
document.getElementById("skipBtn").addEventListener("click", function () {
  startOverlay.classList.add("hidden");
});

/* 浏览器后退时，退出全屏回到浏览状态 */
window.addEventListener("popstate", function () {
  if (isFullscreen()) {
    exitFullscreen();
  }
});

/* 手机端：自动弹出开始全屏遮罩 */
function showStartOverlayIfMobile() {
  // 仅手机端显示开始遮罩
  if (window.innerWidth < 768 && gameData && gameData.embedUrl) {
    startOverlay.classList.remove("hidden");
  } else {
    startOverlay.classList.add("hidden");
  }
}

/* 初始化 */
init();
showStartOverlayIfMobile();
