/* ============================================================
 * 游戏播放页逻辑 play.js
 * 特性：
 *   - 进入游戏自动横屏全屏（手机端自动锁定横屏）
 *   - 电脑端支持 Fullscreen API
 *   - 退出全屏自动恢复竖屏状态，显示工具栏
 *   - 返回主页时恢复原来的滚动位置
 * ============================================================ */

var FAV_KEY = "youxiwangzhan_favs";

function getParam(name) {
  var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
}
function getFavs() { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); }
function saveFavs(list) { localStorage.setItem(FAV_KEY, JSON.stringify(list)); }

function getGameById(id) {
  for (var i = 0; i < GAME_LIST.length; i++) {
    if (GAME_LIST[i].id === id) return GAME_LIST[i];
  }
  return null;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isFaved(id) {
  return getFavs().indexOf(id) !== -1;
}

/* ---------- 全屏 + 横屏锁定 ---------- */

var isFullscreen = false;

/**
 * 进入全屏模式（电脑端用 Fullscreen API，手机端也用）
 * 同时尝试锁定屏幕方向为横屏
 */
function enterFullscreen() {
  var box = document.getElementById("playerBox");

  // 请求全屏
  var p = box.requestFullscreen
    ? box.requestFullscreen()
    : box.webkitRequestFullscreen
    ? box.webkitRequestFullscreen()
    : box.msRequestFullscreen
    ? box.msRequestFullscreen()
    : null;

  // 如果返回 Promise，在成功后锁定横屏
  if (p && p.then) {
    p.then(function() { lockLandscape(); }).catch(function() {});
  } else {
    // Safari 等不返回 Promise 的浏览器，延迟尝试
    setTimeout(lockLandscape, 500);
  }
}

/**
 * 锁定屏幕方向为横屏（仅手机端有效）
 */
function lockLandscape() {
  var so = screen.orientation || screen.mozOrientation || screen.msOrientation;
  if (so && so.lock) {
    so.lock('landscape').catch(function() {
      // 部分浏览器不支持或需要全屏才能锁定，忽略错误
    });
  }
}

/**
 * 解除屏幕方向锁定
 */
function unlockOrientation() {
  var so = screen.orientation || screen.mozOrientation || screen.msOrientation;
  if (so && so.unlock) {
    try { so.unlock(); } catch(e) {}
  }
}

/**
 * 退出全屏
 */
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

/**
 * 全屏状态变化时的回调
 */
function onFullscreenChange() {
  var fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  isFullscreen = !!fsEl;

  var bar = document.querySelector(".play-bar");
  var playerBox = document.getElementById("playerBox");

  if (isFullscreen) {
    // 进入全屏：隐藏工具栏，播放区域占满
    bar.classList.add("hidden");
    playerBox.classList.add("fullscreen-active");
  } else {
    // 退出全屏：显示工具栏，解锁屏幕方向
    bar.classList.remove("hidden");
    playerBox.classList.remove("fullscreen-active");
    unlockOrientation();
  }
}

// 监听全屏变化事件
document.addEventListener("fullscreenchange", onFullscreenChange);
document.addEventListener("webkitfullscreenchange", onFullscreenChange);
document.addEventListener("msfullscreenchange", onFullscreenChange);

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

  // 播放区域：有链接则用 iframe 播放
  if (game.embedUrl) {
    playerBox.innerHTML =
      '<iframe class="game-frame" src="' + escapeHtml(game.embedUrl) +
      '" frameborder="0" allowfullscreen ' +
      'allow="autoplay; fullscreen; accelerometer; gyroscope; pointer-lock; orientation-lock"></iframe>';

    // 页面加载后自动进入全屏横屏
    setTimeout(function() { enterFullscreen(); }, 300);
  } else {
    playerBox.innerHTML =
      '<div class="placeholder">' +
        "<p class=\"ph-big\">游戏尚未接入</p>" +
        "<p>去 Playgama 复制嵌入链接，填到 <code>data/games.js</code> 的 <code>" +
        game.title + "</code> 对应的 embedUrl 里即可播放。</p>" +
      "</div>";
  }
}

/* ---------- 事件绑定 ---------- */

/* 返回主页（恢复滚动位置） */
document.getElementById("backBtn").addEventListener("click", function () {
  // 退出全屏
  if (isFullscreen) exitFullscreen();
  // sessionStorage 里的滚动位置已在 main.js 进入游戏时保存
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

/* 手动全屏按钮（如果自动全屏被浏览器阻止时使用） */
document.getElementById("fullBtn").addEventListener("click", function () {
  if (isFullscreen) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
});

init();