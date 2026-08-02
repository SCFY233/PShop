// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { addSMoney, reduceSMoney, getSMoney, transferSMoney } from "../../../SMoney/main.js";
import { parseItemNbt, parseItem } from "./nbt.js"
import { config, givesdata, enchs, potions, gamelang, lang, prefix } from "../consts.js"
import fs from 'fs'
import * as GMLIB from "../../../GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.js"
//通用函数
/**
 * 判断两个值是否类似（支持不同顺序但内容相同的数组）
 * @param {Any} a 
 * @param {Any} b 
 * @returns {Boolean}
 */
export function same(a, b) {
    try {
        if (a === b) return true;
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
        if (Object.keys(a).length !== Object.keys(b).length) return false;

        if (Array.isArray(a) && Array.isArray(b)) {
            for (let i = 0; i < a.length; i++) {
                if (!same(a[i], b[i])) return false;
            }
            return true;
        }

        for (const key of Object.keys(a)) {
            if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
            if (!same(a[key], b[key])) return false;
        }
        return true;
    } catch (e) {
        logger.error(`Error at Function Same: ${e}`);
        return false;
    }
}
/**
 * 比较版本
 * @param {String} version1 本地版本号
 * @param {String} version2 云端版本号
 * @returns {Number} -1 本地版本低于云端版本, 0 本地版本与云端版本相同或高于云端版本
 */
export function CompareVersion(version1, version2) {
    const versionarrays = [version1.split("."), version2.split(".")]
    for (let i = 0; i < versionarrays[0].length; i++) {
        if (Number(versionarrays[0][i]) < Number(versionarrays[1][i])) {
            return -1
        }
    }
    return 0
}
export function getDateForLogging() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${now.toISOString().slice(11, 19)}`;
    return formattedDate;
};

/**
 * 写入日志
 * @param {Player} pl 
 * @param {String} msg 
 */
export function wlog(pl, msg) {
    try {
        const formattedDate = getDateForLogging();
        const logFilePath = `./logs/PShop.log`;
        return File.writeLine(logFilePath, `${formattedDate} ${pl.realName} ${msg}\n`)
    } catch (e) {
        logger.error(`Error at Add Log: ${e}`);
    }
}
/**
 * 替换字符串
 * @param {String} str 
 * @param {Object{String:String}} replaceobj 
 * @returns 
 */
export function ReplaceStr(str, replaceobj) {
    for (let key in replaceobj) {
        str = str.replaceAll(`{${key}}`, replaceobj[key])
    }
    return str
}
//log方便函数
export const [warn, error] = [logger.warn, logger.error]
/**
 * 解析 Properties 文件内容
 * @param {string} text - Properties 文件内容
 * @returns {Object} 解析后的键值对对象
 */
export function parseProperties(text) {
    const lines = text.split('\n');
    const result = {};
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('#')) {
            return;
        }
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=');
        result[key.trim()] = value.trim();
    });
    return result;
}
export function Num2Roman(num) {
    const romanMap = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', "XIV", 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
    return (num <= 20 && num >= 1) ? romanMap[num] : num
}
export function duration2str(duration) {
    if (typeof duration !== 'number') {
        throw new Error(`Invalid duration: ${duration}. Expected a numeric value.`);
    }
    if (duration === 0) return "";
    let seconds = duration / 20;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
//迫不得已
export const moneys =
{
        /**
         * 加钱
         * @param {Player} player 玩家对象
         * @param {Number} value 值
         * @returns {Boolean} 是否成功
         */
    add: (player, value) => addSMoney(player.xuid, value) ? true : error(`Failed to add money for ${player.realName} (xuid: ${player.xuid})`),
        /**
         * 减钱
         * @param {Player} player 玩家对象
         * @param {Number} value 值
         * @returns {Boolean} 是否成功
         */
    reduce: (player, value) => reduceSMoney(player.xuid, value) ? true : error(`Failed to reduce money for ${player.realName} (xuid: ${player.xuid})`),
        /**
         * 获取钱数
         * @param {Player} player 玩家对象
         * @returns {Number} 该玩家当前拥有的钱数
         */
    get: (player) => getSMoney(player.xuid),
        /**
         * 转账
         * @param {Player} from 转出玩家对象
         * @param {Player} to 转入玩家对象
         * @param {Number} value 转账金额
         * @returns {Boolean} 是否成功
         */
    transfer: (from, to, value) => transferSMoney(from.xuid, to.xuid, value) ? true : error(`Failed to transfer money from ${from.realName} (xuid: ${from.xuid}) to ${to.realName} (xuid: ${to.xuid})`),
}

//检测正整数函数
export function isPositiveInteger(number) {
    return Number.isInteger(number) && number > 0;
}
//gives相关函数
export function addgiveItem(plxuid, item, note) {
    let gives = getgives(plxuid)
    gives.item.push({
        item: item,
        note: note
    })
    givesdata.set(String(plxuid), gives)
}
export function addgiveMoney(plxuid, money, note) {
    let gives = getgives(plxuid)
    gives.money.push({
        value: money,
        note: note
    })
    givesdata.set(String(plxuid), gives)
}
export function addgiveReduceMoney(plxuid, money, note) {
    let gives = getgives(plxuid)
    gives.reducemoney.push({
        value: money,
        note: note
    })
    givesdata.set(String(plxuid), gives)
}
export function addgiveItems(plxuid, items, note) {
    items.forEach(item => addgiveItem(plxuid, item, note))
}
export function addgiveMoneys(plxuid, moneys, note) {
    moneys.forEach(money => addgiveMoney(plxuid, money, note))
}
export function addgiveReduceMoneys(plxuid, moneys, note) {
    moneys.forEach(money => addgiveReduceMoney(plxuid, money, note))
}
export function setgiveItems(plxuid, items = []) {
    let gives = getgives(plxuid)
    gives.item = items
    givesdata.set(String(plxuid), gives)
}
export function setgiveMoneys(plxuid, moneys = []) {
    let gives = getgives(plxuid)
    gives.money = moneys
    givesdata.set(String(plxuid), gives)
}
export function setgiveReduceMoneys(plxuid, moneys = []) {
    let gives = getgives(plxuid)
    gives.reducemoney = moneys
    givesdata.set(String(plxuid), gives)
}
export function getgives(plxuid) {
    let gives = givesdata.get(String(plxuid)) || {}
    return gives
}
mc.listen("onJoin", (pl) => {
    let gdata = getgives(pl.xuid)
    if (!gdata?.item) setgiveItems(pl.xuid, [])
    else if (!gdata?.money) setgiveMoneys(pl.xuid, [])
    else if (!gdata?.reducemoney) setgiveReduceMoneys(pl.xuid, [])
    else {
        gdata = getgives(pl.xuid)
        gdata.item.forEach(itemsnbt => {
            pl.giveItem(mc.newItem(NBT.parseSNBT(itemsnbt.item)))
            itemsnbt.note && pl.sendLang("give.item.note", { note: itemsnbt.note })
        })
        gdata.money.forEach(money => {
            moneys.add(pl.xuid, money.money)
            money.note && pl.sendLang("give.money.note", { note: money.note })
        })
        gdata.reducemoney.forEach(money => {
            moneys.reduce(pl.xuid, money.money)
            money.note && pl.sendLang("give.reducemoney.note", { note: money.note })
        })
    }
})
/**
 * 获取可以添加的物品数量
 * @param {Player} player 
 * @param {String|NbtCompound} item 
 * @param {Number} aux 
 */
export function getCanPutItemCount(player, item, aux, auxStrict) {
    let its = player.getInventory().getAllItems()
    let count = 0
    if (typeof item === "string") {
        its.filter(i => i.isNull() || (i.type == item && (!auxStrict || i.aux == aux))).forEach(i => count += i.isNull() ? 64 : (64 - i.count))
    } else if (item instanceof NbtCompound) {
        const example = mc.newItem(item)
        const examplenbt = parseItem(item)
        if (auxStrict) its.filter(i => i.isNull() || (i.type == example.type && i.aux == example.aux && same(parseItem(i), examplenbt))).forEach(i => count += i.isNull() ? 64 : (64 - i.count))
    }
    return count
}
export function parseItemNbtForCount(item) {
    const obj = parseItem(item)
    delete obj.Slot
    delete obj.obj.Count
    return obj
}
/**
 * 获取可以被扣除的物品数量
 * @param {Player} player 
 * @param {String|NbtCompound} item 
 * @param {Number} aux 
 */
export function getCanReductItemCount(player, item, aux, auxStrict) {
    let its = player.getInventory().getAllItems()
    let count = 0
    if (typeof item === "string") {
        count = its.filter(i => i.type == item && (!auxStrict || i.aux == aux)).reduce((pre, cur) => pre + cur.count, 0)
    } else if (item instanceof NbtCompound) {
        const example = mc.newItem(item)
        const examplenbt = parseItemNbtForCount(item)
        if (auxStrict) count = its.filter(i => i.type == example.type && i.aux == example.aux && same(parseItemNbtForCount(i), examplenbt)).reduce((pre, cur) => pre + cur.count, 0)
        else count = its.filter(i => i.type == example.type && same(parseItemNbtForCount(i), examplenbt)).reduce((pre, cur) => pre + cur.count, 0)
    }
    return count
}
/**
 * 使用物品标准类型名扣除物品
 * @param {Player} player 
 * @param {String} itemtype 
 * @param {Number} aux 
 * @param {Number} count 
 * @param {Boolean} strictAux 
 * @returns {Boolean} 是否成功扣除物品
 */
export function reduceItembyType(player, itemtype, aux, count, strictAux) {
    try {
        var inv = player.getInventory();
        var items = inv.getAllItems();
        var remainingCount = count;
        var canReductCount = getCanReductItemCount(player, itemtype, aux, strictAux);
        if (canReductCount < count) {
            return false;
        }
        for (var i = 0; i < items.length && remainingCount > 0; i++) {
            var item = items[i];
            if (item.type === itemtype && (!strictAux || item.aux === aux)) {
                var removeCount = Math.min(item.count, remainingCount);
                inv.removeItem(i, removeCount);
                remainingCount -= removeCount;
            }
        }
        player.refreshItems();
        return true;
    } catch (e) {
        logger.error(`Error at reductItembytype: ${e}`);
        return false;
    }
}

export function reduceItembyNbt(player, itemsnbt, count, strictAux) {
    try {
        var inv = player.getInventory();
        var items = inv.getAllItems();
        var remainingCount = count;
        const example = mc.newItem(NBT.parseSNBT(itemsnbt));
        const examplenbt = parseItemNbtForCount(mc.newItem(NBT.parseSNBT(itemsnbt)));
        var canReductCount = getCanReductItemCount(player, NBT.parseSNBT(itemsnbt), null, strictAux);
        if (canReductCount < count) {
            return false;
        }
        for (var i = 0; i < items.length && remainingCount > 0; i++) {
            var item = items[i];
            if (item.type === example.type && (!strictAux || item.aux === example.aux) && same(parseItemNbtForCount(item), examplenbt)) {
                var removeCount = Math.min(item.count, remainingCount);
                inv.removeItem(i, removeCount);
                remainingCount -= removeCount;
            }
        }
        player.refreshItems();
        return true;
    } catch (e) {
        logger.error(`Error at reductItembyNbt: ${e}`);
        return false;
    }
}
export function getSameItemCount(items, item) {
    var count = 0;
    for (var i = 0; i < items.length; i++) {
        if (same(parseItem(items[i], ["Count"]), parseItem(item, ["Count"]))) {
            count += items[i].count;
        }
        else if (JSON.stringify(parseItem(items[i], ["Count"])) == JSON.stringify(parseItem(item, ["Count"]))) {
            count += items[i].count
        }
    }
    return count;
}
/**
 * 查找元素在数组位置(粗略查找)
 * @param {Array} arr 
 * @param {Any} item 
 */
export function getSameItemIndexInArray(arr, item) {
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        if (same(arr[i], item)) return i;
    }
    return -1;
}
/**
 * 获取物品信息
 * @param {Item|Object} item 
 */
export function getItemInfo(item) {
    const result = {
        items: [],
    }
    if (item instanceof LLSE_Item) {
        result.type = item.type
        result.name = item.getTranslateName(config.get("itemtranslateCode") ?? "zh_CN") ?? item.name
        result.count = item.count
        result.aux = item.aux
        result.lore = item.lore ?? []
        result.damage = Number(item.maxDamage) - Number(item.obj?.tag?.Damage ?? 0)
        result.maxdamage = item.maxDamage
        result.maxcount = item.maxCount ?? 1
    } else {
        const tmpItem = mc.newItem(item.obj.Name, 1)
        result.type = item.obj.Name
        result.name = tmpItem.getTranslateName(config.get("itemtranslateCode") ?? "zh_CN") ?? mc.newItem(item.obj.Name, 1).name
        result.count = item.obj.Count ?? 1
        result.aux = item.obj?.Damage ?? 0
        result.lore = item.obj?.tag?.Lore ?? []
        result.damage = Number(tmpItem.maxDamage) - Number(item.obj?.tag?.Damage ?? 0)
        result.maxdamage = tmpItem.maxDamage
        result.maxcount = tmpItem.maxCount ?? 1
    }
    const parsed_data = parseItem(item)
    if (item.chargedItem) parsed_data.chargedItem = item.chargedItem
    if (item.Items) parsed_data.Items = item.Items
    if (parsed_data?.chargedItem) {
        result.chargedItem = getItemInfo(parsed_data.chargedItem)
    } else result.chargedItem = null
    result.enchinfo = getEnchInfo(parsed_data)
    result.potioninfo = getPotionInfo(parsed_data)
    result.CustomName = parsed_data?.obj?.tag?.display?.CustomName ?? parsed_data?.obj?.tag?.display?.Name ?? null
    result.loreinfo = getLoreInfo(result.lore)
    if ((parsed_data.Items ?? []).length > 0) {
        for (let i = 0; i < parsed_data.Items.length; i++) {
            let item = parsed_data.Items[i]
            result.items[item.Slot] = getItemInfo(item)
        }
    }
    return result
}
export function getEnchInfo(parsed_data) {
    const enc = []
    const enchsarr = parsed_data?.obj?.tag?.ench ?? []
    if (enchsarr.length > 0)
        enchsarr.forEach(ench => {
            enc.push({
                id: Number(ench.id),
                langkey: enchs[ench.id].desc,
                translated: gamelang.get(enchs[ench.id].desc),
                lvl: Number(ench.lvl),
                lvlRoman: Num2Roman(Number(ench.lvl))
            })
        })
    return enc
}
export function getEnchText(ench) {
    return ench.translated + " " + ench.lvlRoman
}
export function getEnchContent(enchs) {
    let str = lang.get("prefix.ench")
    if (enchs.length == 0) return []
    return enchs.map(e => getEnchText(e))
}
export function getPotionInfo(parsed_data) {
    const id = parsed_data.obj.Name
    if (id.includes("potion")) {
        const potioninfo = {}
        potioninfo.effectname = gamelang.get(potions[parsed_data.obj?.Damage]?.effect?.desc) || "???"
        potioninfo.effectduration = duration2str(potions[parsed_data.obj?.Damage]?.effect?.duration) || "0:00"
        return potioninfo
    } else return null
}
export function getPotionContent(potion) {
    if (potion == null) return ""
    return ReplaceStr(lang.get("form.item.potion"), { "potion": potion.effectname + " " + potion.effectduration, prefix })
}
export function getLoreInfo(info) {
    return info.lore ?? null;
}
export function getItemContents(item, prefix = "") {
    const info = item instanceof LLSE_Item ? getItemInfo(item) : item
    let items = []
    if (info.items.length != 0) {
        const itemsinfos = info.items.map(i =>
            i != null ? getItemContent(i, prefix + lang.get("form.item.content.prefix.step")) : null
        );
        items = items.concat(itemsinfos.map((item, index) => {
            if (item != null) return ReplaceStr(lang.get("form.item.items.step"), { slot: index + 1 < 10 ? "0" + (index + 1) : index + 1, item: item }) + item

        }))
    }
    const replace = {
        name: info.name,
        lore: getLoreInfo(info) || [],
        enchinfo: getEnchContent(info.enchinfo) || [],
        potioninfo: getPotionContent(info.potioninfo) || [],
        customname: info.CustomName || "",
        damage: info.damage,
        maxdamage: info.maxdamage,
        aux: info.aux,
        type: info.type,
        count: info.count,
        maxcount: info.maxcount,
        items,
    }
    return replace
}

export function getItemContent(item, prefix = "") {
    const contents = getItemContents(item, prefix)
    let str
    const itemslotstep = " ".repeat(ReplaceStr(lang.get("form.item.items.step"), { slot: "00", "prefix.slot": "", "prefix.end": "", }).length - lang.get("form.item.items.step.zb").length - 1) + "┗━━"
    if (contents.customname != "") str = ReplaceStr(lang.get("form.item.name"), { name: contents.customname }) + ReplaceStr(lang.get("form.item.content.name"), { name: contents.name })
    else str = ReplaceStr(lang.get("form.item.name"), { name: contents.name })
    if (contents.damage != contents.maxdamage) str += ReplaceStr(lang.get("form.item.content.damage"), { damage: contents.damage, maxdamage: contents.maxdamage })
    if (contents.maxcount != 1) str += ReplaceStr(lang.get("form.item.content.count"), { count: contents.count })
    if (contents.lore.length != 0) {
        const lores = contents.lore.map(item => `\n${prefix}${itemslotstep}${ReplaceStr(lang.get("form.item.content.lore.step"), { lore: item })}`)
        str += lores.join("")
    }
    if (contents.enchinfo.length != 0) {
        const enchs = contents.enchinfo.map(item => `\n${prefix}${itemslotstep}${lang.get("prefix.ench")}${ReplaceStr(lang.get("form.item.content.ench.step"), { ench: item })}${lang.get("prefix.end")}`)
        str += enchs.join("")
    }
    if (contents.potioninfo != "") str += "\n" + prefix + itemslotstep + contents.potioninfo
    if (contents.items.length != 0) {
        str += "\n" + prefix + itemslotstep + lang.get("form.item.items")
        const items = contents.items.map(item => `\n${prefix}  ${item}`)
        str += items.join("")
    }
    str = ReplaceStr(str, {
        "prefix.type": lang.get("prefix.type"),
        "prefix.end": lang.get("prefix.end"),
        "prefix.slot": lang.get("prefix.slot"),
        "prefix.ench": lang.get("prefix.ench"),
    })
    return str
}
/**
 * 解析lang
 * @param {String} text 
 * @returns 
 */
export function parseLangFile(text) {
    const lines = text.split('\n');
    const result = {};
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('#')) {
            return;
        }
        // 使用正则表达式分割键值对,以第一个等号为分隔符
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=');
        result[key.trim()] = value.trim();
    });
    return result;
}
export function getGameLang(langcode) {
    return parseLangFile(File.readFrom("./resource_packs/vanilla/texts/" + langcode + ".lang"))
}
/**
 * 新建带有Aux的物品
 * @param {String} type 
 * @param {Number} count 
 * @param {Number} aux 
 * @returns {Item}
 */
export function newItemWithAux(type, count, aux) {
    const item = mc.newItem(type, count)
    item.setAux(aux);
    return item;
}

/**
 * 防抖函数
 * @param {string | number} id - 唯一标识符
 * @param {Function} fn - 需要防抖的函数体（匿名函数）
 * @param {number} delay - 延迟时间（毫秒），默认 70ms
 */
export function debounce(id, fn, delay = 70) {
    let timers = debounce.timers || (debounce.timers = {});
    clearTimeout(timers[id]);
    timers[id] = setTimeout(() => {
        fn();
        timers[id] = null;
    }, delay);
}

/**
 * 初始化配置项(方便函数)
 * @param {Object} obj 
 */
JsonConfigFile.prototype.inits = function (obj) {
    let results = []
    for (let i = 0; i < Object.keys(obj).length; i++) {
        results[i] = this.init(Object.keys(obj)[i], obj[Object.keys(obj)[i]]);
    }
    return results
}
/**
* 删除配置(方便函数)
* @param {String} names 
*/
JsonConfigFile.prototype.deletes = function (names) { names.forEach(name => this.delete(name)); return this }


LLSE_Player.prototype.giveItems = function (items, counts) {
    try {
        for (let i = 0; i < items.length; i++) {
            counts[i] == null ? this.giveItem(items[i]) : this.giveItem(items[i], counts[i]);
        }
    } catch (e) {
        console.error(`Error at givtItems:${e}`)
    }
}

