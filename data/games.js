/* ============================================================
 * 游戏清单 games.js
 * ------------------------------------------------------------
 * 这是整个网站最核心的文件。以后你每上架一个游戏，
 * 只需要复制下面其中一条记录，粘贴到 GAME_LIST 数组里，
 * 然后修改这 6 个字段即可：
 *
 *   id          : 游戏唯一编号（数字，别重复）
 *   title       : 游戏名称
 *   category    : 分类（建议用：射击/冒险/竞速/益智/休闲）
 *   cover       : 封面图地址（可以填网络图片，或 Website 生成的图片链接）
 *   embedUrl    : Playgama 给你的游戏嵌入链接（iframe 地址）
 *   description : 一句话简介
 *
 * 注意：字段之间要用英文逗号隔开，引号用英文引号。
 * ============================================================ */

// 帮助生成封面图的方法（示例）：把下面的 prompt 换成你的描述，
// 替换 cover 字段即可，无需自己找图。
function coverUrl(prompt) {
  return "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
    encodeURIComponent(prompt) + "&image_size=landscape_16_9";
}

var GAME_LIST = [
  {
    id: 1,
    title: "Mech Frontline: Last Stand",
    category: "塔防",
    cover: coverUrl("mech turret defense game cover, robots and turrets defending base, dramatic battlefield lighting, landscape game thumbnail"),
    embedUrl: "https://playgama.com/export/game/mech-frontline-last-stand",
    description: "机甲 + 炮台 + 肉鸽策略的塔防玩法，每局构筑不同防线抵御敌军。"
  },
  {
    id: 2,
    title: "魔法王国",
    category: "冒险",
    cover: coverUrl("medieval fantasy adventure game cover art, lush green kingdom castle, heroic knight, colorful, game thumbnail"),
    embedUrl: "",
    description: "踏上王国冒险之旅，解开远古魔法的秘密。"
  },
  {
    id: 3,
    title: "极速狂飙",
    category: "竞速",
    cover: coverUrl("high speed racing game cover art, sports cars racing on highway at sunset, motion blur, dynamic, game thumbnail"),
    embedUrl: "",
    description: "在炫酷赛道上挑战极限时速，成为车神。"
  },
  {
    id: 4,
    title: "方块消消乐",
    category: "益智",
    cover: coverUrl("colorful block puzzle game cover art, falling candy blocks, bright cheerful colors, casual, game thumbnail"),
    embedUrl: "",
    description: "消除同色方块，挑战更高分数的脑力小游戏。"
  },
  {
    id: 5,
    title: "云端跳跃",
    category: "休闲",
    cover: coverUrl("cute platformer jumping game cover art, fluffy clouds and rainbow, small character jumping, fun, game thumbnail"),
    embedUrl: "",
    description: "在朵朵白云间跳跃前行，轻松又治愈。"
  },
  {
    id: 6,
    title: "深海寻宝",
    category: "冒险",
    cover: coverUrl("underwater treasure hunt game cover art, sunken ship and coral reef, golden treasure, mysterious, game thumbnail"),
    embedUrl: "",
    description: "潜入神秘深海，探寻沉睡的宝藏。"
  }
];