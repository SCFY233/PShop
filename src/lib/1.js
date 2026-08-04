// LiteLoader-AIDS automatic generated
/** @type {import("../iListenAttentively-LseExport/lib/iListenAttentively.js")} */
const ila = require('./iListenAttentively-LseExport/lib/iListenAttentively.js');
const defaultConfig = {
    showPlatform: true,
    showGmode: true,
    showDimension: true,
    showOrganization: true,
    showLatency: true,
    showTitle: true,
    badWordsFilter: true
};
const conf = new JsonConfigFile('plugins/BetterChat/config.json');
Object.keys(defaultConfig).forEach(key => conf.init(key, defaultConfig[key]));

let language = new JsonConfigFile('plugins/BetterChat/language.json', JSON.stringify({
    device: {
        "Android": "安卓",
        "iOS": "iOS",
        "Windows": "电脑",
        "PlayStation": "PlayStation",
        "Xbox": "Xbox",
        "Switch": "Switch",
        "Unknown": "未知设备"
    },
    gamemode: {
        "0": "生存",
        "1": "创造",
        "2": "冒险",
        "6": "旁观"
    },
    dimension: {
        "0": "主世界",
        "1": "地狱",
        "2": "末地"
    }
}));

const platformMap = {
    Android: "Android",
    Google: "Android",
    IOS: "iOS",
    iOS: "iOS",
    Windows10: "Windows",
    Uwp: "Windows",
    Win32: "Windows",
    PlayStation: "PlayStation",
    Sony: "PlayStation",
    Xbox: "Xbox",
    Nintendo: "Switch",
    Nx: "Switch",
    Unknow: "Unknow"
};
const getPlatform = (os) => language.get('device')[platformMap[os] || platformMap.Unknow];
let emoji = ll.import('EmojiYes', 'replacedMsg');

let check, replace, orgNameQuery, getwearch;
if (conf.get('badWordsFilter')) check = ll.imports('ProhibitedWords', 'check'), replace = ll.imports('ProhibitedWords', 'replace');
if (conf.get('showOrganization')) orgNameQuery = ll.imports('orgEX', 'orgEX_getPlayerOrgName');
if (conf.get('showTitle')) getwearch = ll.imports("PTitle", "getwearch");
ila.emplaceListener('ll::event::player::PlayerChatEvent', (ev) => {
    let pl = ila.getPlayer(ev.self), msg = ev.message;
    if (conf.get('badWordsFilter') && check(msg)) {
        pl.tell('§c§l你的消息包含敏感词汇');
        ev.message = replace(msg, '*');
    }
}, ila.EventPriority.High);
ila.emplaceListener('ll::event::player::PlayerChatEvent', (ev) => {
    let pl = ila.getPlayer(ev.self), msg = ev.message, t = [], dv = pl.getDevice(), platform, orgName, wearch;

    platform = getPlatform(dv.os);

    if (conf.get('showOrganization')) orgName = ll.hasExported('orgEX', 'orgEX_getPlayerOrgName') ? ('§d' + orgNameQuery(pl.xuid)) : null;
    if (conf.get('showTitle')) wearch = ll.hasExported("PTitle", "getwearch") ? getwearch(pl.realName) : null;

    let latency = dv.lastPing;
    if (latency <= 100) latency = '§a' + latency;
    else if (latency <= 400) latency = '§e' + latency;
    else latency = '§c' + latency;

    if (conf.get('showPlatform')) t.push(`§b${platform}`);
    if (conf.get('showDimension')) t.push(`§6${language.get('dimension')[pl.pos.dimid]}`);
    if (conf.get('showGmode')) t.push(`§b${language.get('gamemode')[pl.gameMode]}`);
    if (conf.get('showLatency')) t.push(`${latency}ms`);
    if (conf.get('showOrganization')) t.push(orgName);
    if (conf.get('showTitle')) t.push(wearch);
    mc.broadcast(`§r§f[${t.join('§r§f|')}§r§f]<${pl.name}§r§f> ${emoji(msg)}`);
    log(`<${pl.name}> ${msg}`)
    ev.cancelled = true;
}, ila.EventPriority.Low);