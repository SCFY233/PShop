// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { addSMoney, reduceSMoney, getSMoney, transferSMoney } from "../../../SMoney/lib.js";
import { parseItemNbt, parseItem } from "./nbt.js"
import { config, enchs, potions, gamelang, lang, prefix, givesdata } from "../consts.js"
import fs from 'fs'
import * as GMLIB from "../../../GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.js"
/**
 * 优化：移除耗时的 try-catch 块，统一 Array 与 Object 的遍历拦截逻辑。
 * 如果上层需要捕获，应在上层调用时处理，而不是在此高频基础函数内。
 */
export function same(a, b) {
    if (a === b) return true;
    if (a !== a && b !== b) return true; // 处理 NaN
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return false;
    }

    const isArrayA = Array.isArray(a);
    if (isArrayA !== Array.isArray(b)) return false;

    if (isArrayA) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!same(a[i], b[i])) return false;
        }
        return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (let i = 0; i < keysA.length; i++) {
        const key = keysA[i];
        if (!Object.prototype.hasOwnProperty.call(b, key) || !same(a[key], b[key])) {
            return false;
        }
    }
    return true;
}
export function samePos(pos1, pos2) {
    const { x, y, z, dimid } = pos1
    return x === pos2.x && y === pos2.y && z === pos2.z && dimid === pos2.dimid
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
    if (!config.get("enable").log) return
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
/**
 * 优化：使用单次正则扫描替代多次 replaceAll，极大减少字符串副本的创建和内存开销。
 */
export function ReplaceStr(str, replaceobj) {
    if (!str || !replaceobj) return str;
    return str.replace(/\{([^}]+)\}/g, (match, key) => {
        return replaceobj[key] !== undefined ? String(replaceobj[key]) : match;
    });
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
    if (duration <= 1) return "";
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
    add: (player, value) => addSMoney(player instanceof LLSE_Player ? player.xuid : player, String(value)) ? true : error(`Failed to add money for ${player?.realName ?? player} (xuid: ${player.xuid})`),
    /**
     * 减钱
     * @param {Player} player 玩家对象
     * @param {Number} value 值
     * @returns {Boolean} 是否成功
     */
    reduce: (player, value) => reduceSMoney(player instanceof LLSE_Player ? player.xuid : player, String(value)) ? true : error(`Failed to reduce money for ${player?.realName ?? player} (xuid: ${player.xuid})`),
    /**
     * 获取钱数
     * @param {Player} player 玩家对象
     * @returns {Number} 该玩家当前拥有的钱数
     */
    get: (player) => getSMoney(player instanceof LLSE_Player ? player.xuid : player),
    /**
     * 转账
     * @param {Player} from 转出玩家对象
     * @param {Player} to 转入玩家对象
     * @param {Number} value 转账金额
     * @returns {Boolean} 是否成功
     */
    transfer: (from, to, value) => transferSMoney(from instanceof LLSE_Player ? from.xuid : form, to instanceof LLSE_Player ? to.xuid : to, String(value)) ? true : error(`Failed to transfer money from ${from?.realName ?? from} (xuid: ${from.xuid}) to ${to?.realName ?? to} (xuid: ${to.xuid})`),
}

//检测正整数函数
export function isPositiveInteger(number) {
    return Number.isInteger(number) && number > 0;
}
// 获取玩家的提示列表 (加入严格数组校验)
export function getgives(plxuid) {
        let res = givesdata.get(String(plxuid));
        // 如果存在脏数据导致返回的不是 Array，强制初始化为空数组
        return Array.isArray(res) ? res : [];
    }

// 优化：添加提示记录 (统一入参)
export function addgiveNotice(plxuid, itemSnbt, count, shopid, type = "income", money = 0) {
    let notices = getgives(plxuid);
    notices.push({
        pl: String(plxuid),
        item: itemSnbt,
        count: count,
            shopid: shopid,
            type: type,
            money: money
        });
        givesdata.set(String(plxuid), notices);
    }

mc.listen("onJoin", (pl) => {
    let notices = getgives(pl.xuid);

    // 如果该玩家没有待处理的离线提示，直接结束，避免多余运算
    if (!notices.length) return;

    notices.forEach(d => {
        // 1. 解析 SNBT 临时生成物品对象，用于获取该物品的真实名称
        let tempItem = mc.newItem(NBT.parseSNBT(d.item));
        let itemName = tempItem ? getItemDisplayName(tempItem) : "???";
        let posStr = "???(?,?,?)";
        if (chestshops?.[d.shopid]?.chestPos) {
            posStr = chestshops[d.shopid].chestPos.toString();
        }
        let langKey = "notice.shop.income";
        if (d.type === "empty") {
            langKey = "notice.shop.empty";
        } else if (d.type === "full") {
            langKey = "notice.shop.full";
        }
        pl.tell(ReplaceStr(lang.get(langKey), {
            pos: posStr,
            count: d.count,
            itemname: itemName
        }));
    });
    givesdata.set(String(pl.xuid), []);
});
/**
 * 获取可以添加的物品数量
 * @param {Player} player 
 * @param {String|NbtCompound} item 
 * @param {Number} aux 
 */
export function getCanPutItemCount(player, item, aux, auxStrict) {
    let its = player.getInventory().getAllItems();
    let count = 0;

    if (typeof item === "string") {
        // 创建一个示例物品来获取该物品真实的 maxCount (比如末影珍珠是16，剑是1)
        const example = mc.newItem(item, 1);
        const maxStack = example ? example.maxCount : 64;

        for (let i of its) {
            if (i.isNull()) {
                count += maxStack;
            } else if (i.type === item && (!auxStrict || i.aux === aux)) {
                count += (i.maxCount - i.count);
            }
        }
    } else if (item instanceof NbtCompound) {
        const example = mc.newItem(item);
        const maxStack = example ? example.maxCount : 64;
        const examplenbt = parseItem(item);

        for (let i of its) {
            if (i.isNull()) {
                count += maxStack;
            } else if (i.type === example.type) {
                const isMatch = !auxStrict || (i.aux === example.aux && same(parseItem(i), examplenbt));
                if (isMatch) {
                    count += (i.maxCount - i.count);
                }
            }
        }
    }
    return count;
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
 * 优化：内部统一扣除逻辑，避免 type 和 Nbt 扣除函数各自重复写两遍遍历逻辑
 * 减少中间变量的创建，并在单次事务中完成计算与扣除操作。
 */
function _reduceItems(player, count, matchFunc) {
    try {
        const inv = player.getInventory();
        const items = inv.getAllItems();
        let remainingCount = count;

        // 第一遍扫描：确认数量是否足够 (直接使用条件匹配，避免调用外部消耗性能的函数)
        let availableCount = 0;
        for (let i = 0; i < items.length; i++) {
            if (matchFunc(items[i])) availableCount += items[i].count;
        }
        if (availableCount < count) return false;

        // 第二遍扫描：执行扣除
        for (let i = 0; i < items.length && remainingCount > 0; i++) {
            const item = items[i];
            if (matchFunc(item)) {
                const removeCount = Math.min(item.count, remainingCount);
                inv.removeItem(i, removeCount);
                remainingCount -= removeCount;
            }
        }
        player.refreshItems();
        return true;
    } catch (e) {
        logger.error(`Error at _reduceItems: ${e}`);
        return false;
    }
}

export function reduceItembyType(player, itemtype, aux, count, strictAux) {
    // 统一调用
    return _reduceItems(player, count, (item) =>
        item.type === itemtype && (!strictAux || item.aux === aux)
    );
}

export function reduceItembyNbt(player, itemsnbt, count, strictAux) {
    // 优化：将 example 的解析移出循环，避免在多次遍历比对时反复解析 SNBT 和创建实例
    const example = mc.newItem(NBT.parseSNBT(itemsnbt));
    const examplenbt = parseItemNbtForCount(example);

    // 统一调用
    return _reduceItems(player, count, (item) =>
        item.type === example.type &&
        (!strictAux || item.aux === example.aux) &&
        same(parseItemNbtForCount(item), examplenbt)
    );
}
/**
 * 优化：使用专用的 parseItemNbtForCount 替代 parseItem(item, ["Count"])。
 * 1. 将目标物品的解析移出循环体，避免 O(N) 的重复解析开销。
 * 2. 彻底剔除底层昂贵的 JSON.stringify 回退机制。
 */
export function getSameItemCount(items, item) {
    let count = 0;
    // 将目标物品的 NBT 解析提前，只执行一次
    const targetNbt = parseItemNbtForCount(item);

    for (let i = 0; i < items.length; i++) {
        // 统一使用专用的 forCount 解析并结合高效的 same 深度比较
        if (same(parseItemNbtForCount(items[i]), targetNbt)) {
            count += items[i].count;
        }
    }
    return count;
}
/**
 *
 * @param {Container} ct
 * @param {Item} item
 * @returns
 */
export function getMaxCount(ct, item) {
    const targetNbt = parseItemNbtForCount(item)
    return ct.getAllItems()
        .filter(i => i.isNull() || (i.type == item.type && same(parseItemNbtForCount(i), targetNbt)))
        .reduce(pre => pre + item.maxCount, 0)
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
        result.damage = Number(item.maxDamage ?? 1) - Number(item.obj?.tag?.Damage ?? 0)
        result.maxdamage = item.maxDamage ?? 1
        result.maxcount = item.maxCount ?? 1
    } else {
        const tmpItem = newItemWithAux(item.obj.Name, 1, item.obj?.Damage ?? 0)
        result.type = item.obj.Name
        result.name = tmpItem.getTranslateName(config.get("itemtranslateCode") ?? "zh_CN") ?? tmpItem.name
        result.count = item.obj.Count ?? 1
        result.aux = item.obj?.Damage ?? 0
        result.lore = item.obj?.tag?.Lore ?? []
        result.damage = Number(tmpItem.maxDamage ?? 1) - Number(item.obj?.tag?.Damage ?? 0)
        result.maxdamage = tmpItem.maxDamage ?? 1
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
        if (!potions[parsed_data.obj?.Damage]?.effect) return null
        potioninfo.effectname = gamelang.get(potions[parsed_data.obj?.Damage]?.effect?.desc) + Num2Roman(Number(potions[parsed_data.obj?.Damage]?.effect?.amplifier) + 1 ?? 0) || "???"
        potioninfo.effectduration = (potions[parsed_data.obj?.Damage]?.effect?.duration == 0 ? "" : duration2str(potions[parsed_data.obj?.Damage]?.effect?.duration)) ?? "0:00"
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
/**
 * 优化：剔除 filter, map, concat，直接使用 for 循环拼接文本，降低 GC 压力。
 */
export function getItemContents(item, prefix = "") {
    const info = item instanceof LLSE_Item ? getItemInfo(item) : item;
    const items = [];

    if (info.items && info.items.length !== 0) {
        const nextPrefix = prefix + lang.get("form.item.content.prefix.step");
        for (let i = 0; i < info.items.length; i++) {
            const subItem = info.items[i];
            if (subItem) {
                const content = getItemContent(subItem, nextPrefix);
                const slotStr = (i + 1 < 10 ? "0" : "") + (i + 1);
                items.push(ReplaceStr(lang.get("form.item.items.step"), { slot: slotStr, item: content }) + content);
            }
        }
    }

    return {
        name: info.name,
        lore: getLoreInfo(info) || [],
        enchinfo: getEnchContent(info.enchinfo) || [],
        potioninfo: getPotionContent(info.potioninfo) || "",
        customname: info.CustomName || "",
        damage: info.damage,
        maxdamage: info.maxdamage,
        aux: info.aux,
        type: info.type,
        count: info.count,
        maxcount: info.maxcount,
        items: items,
    };
}

export function getItemContent(item, prefix = "") {
    const contents = getItemContents(item, prefix);

    // 缓存重复计算的缩进前缀
    const stepLang = lang.get("form.item.items.step");
    const zbLangLen = lang.get("form.item.items.step.zb").length;
    const itemslotstep = " ".repeat(Math.max(0, ReplaceStr(stepLang, { slot: "00", "prefix.slot": "", "prefix.end": "" }).length - zbLangLen - 1)) + "┗━━";

    let str = contents.customname !== ""
        ? ReplaceStr(lang.get("form.item.name"), { name: contents.customname }) + ReplaceStr(lang.get("form.item.content.name"), { name: contents.name })
        : ReplaceStr(lang.get("form.item.name"), { name: contents.name });

    if (contents.damage !== contents.maxdamage) {
        str += ReplaceStr(lang.get("form.item.content.damage"), { damage: contents.damage, maxdamage: contents.maxdamage });
    }
    if (contents.maxcount !== 1) {
        str += ReplaceStr(lang.get("form.item.content.count"), { count: contents.count });
    }

    // 直接循环拼接，代替 map().join("")
    if (contents.lore.length > 0) {
        for (let i = 0; i < contents.lore.length; i++) {
            str += `\n${prefix}${itemslotstep}${ReplaceStr(lang.get("form.item.content.lore.step"), { lore: contents.lore[i] })}`;
        }
    }

    if (contents.enchinfo.length > 0) {
        for (let i = 0; i < contents.enchinfo.length; i++) {
            str += `\n${prefix}${itemslotstep}${lang.get("prefix.ench")}${ReplaceStr(lang.get("form.item.content.ench.step"), { ench: contents.enchinfo[i] })}${lang.get("prefix.end")}`;
        }
    }

    if (contents.potioninfo !== "") {
        str += `\n${prefix}${itemslotstep}${contents.potioninfo}`;
    }

    if (contents.items.length > 0) {
        str += `\n${prefix}${itemslotstep}${lang.get("form.item.items")}`;
        for (let i = 0; i < contents.items.length; i++) {
            str += `\n${prefix}  ${contents.items[i]}`;
        }
    }

    return ReplaceStr(str, {
        "prefix.type": lang.get("prefix.type"),
        "prefix.end": lang.get("prefix.end"),
        "prefix.slot": lang.get("prefix.slot"),
        "prefix.ench": lang.get("prefix.ench"),
    });
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
    item.setAux(aux)
    return item
}
/**
 * 优化：
 * 1. 使用数学运算 (除法和取余) 替代 while 循环减法，时间复杂度从 O(N) 降为 O(1)。
 * 2. 提前获取并复用 NBT 对象，避免在循环体内重复调用底层的 getNbt()。
 */
export function giveItemF(pl, item, count) {
    if (count <= 0) return true;

    const maxCount = item.maxCount;
    const baseNbt = item.getNbt();

    const fullStacks = Math.floor(count / maxCount);
    const remainder = count % maxCount;

    // 发放整组物品
    if (fullStacks > 0) {
        const fullStackItem = mc.newItem(baseNbt.setByte("Count", maxCount));
        for (let i = 0; i < fullStacks; i++) {
            pl.giveItem(fullStackItem);
        }
    }
    // 发放剩余零散物品
    if (remainder > 0) {
        pl.giveItem(mc.newItem(baseNbt.setByte("Count", remainder)));
    }
    return true;
}

/**
 * 向容器内安全放入指定数量的物品（支持超过最大堆叠数的超大数量）
 * @param {Container} ct 目标容器对象
 * @param {Item} item 待增加的物品对象
 * @param {Number} count 欲添加物品数量
 * @returns {Boolean} 是否全部放入成功
 */
export function putItemToContainer(ct, item, count) {
    if (count <= 0) return true;

    const maxCount = item.maxCount;
    const fullStacks = Math.floor(count / maxCount);
    const remainder = count % maxCount;

    // 提前获取底层 NBT，作为接下来“克隆”新物品的模板
    const baseNbt = item.getNbt();
    let isAllSuccess = true;

    // 分批放入整组物品
    for (let i = 0; i < fullStacks; i++) {
        // 关键修复：每次必须利用 NBT 实例化一个全新的物品对象，并设定好这一摞的数量
        const fullStackItem = mc.newItem(baseNbt.setByte("Count", maxCount));

        // 只传入物品对象即可，不需要传第二个参数
        if (!ct.addItem(fullStackItem)) {
            isAllSuccess = false;
            break; // 既然已经失败（通常是箱子满了），直接跳出循环，省去多余性能消耗
        }
    }

    // 如果前面的整组都放进去了，再放入剩余零散物品
    if (remainder > 0 && isAllSuccess) {
        // 同样：必须新实例化一个对象
        const remainderItem = mc.newItem(baseNbt.setByte("Count", remainder));

        if (!ct.addItem(remainderItem)) {
            isAllSuccess = false;
        }
    }

    return isAllSuccess;
}
/**
 * 从容器中减少指定数量的特定物品
 * @param {Container} ct 目标容器对象
 * @param {Item} item 欲减少的物品参考对象
 * @param {Number} count 欲减少的数量
 * @returns {Boolean} 是否完整扣除了指定数量
 */
export function reduceItemFromContainer(ct, item, count) {
    if (count <= 0) return true;

    const items = ct.getAllItems();

    // 将目标物品的 NBT 解析提前，只执行一次，避免在循环中重复开销
    const targetNbt = parseItemNbtForCount(item);

    let remainingCount = count;

    for (let i = 0; i < items.length; i++) {
        const curItem = items[i];

        if (!curItem || curItem.isNull()) continue;

        // 先通过 type 进行基础速筛（Fast-fail），再统一使用专用的 forCount 解析并结合高效的 same 深度比较
        if (curItem.type === item.type && same(parseItemNbtForCount(curItem), targetNbt)) {
            const deduct = Math.min(curItem.count, remainingCount);
            if (deduct === curItem.count) {
                // 如果需要扣除的数量等于当前格子的所有数量，直接将该物品对象置空
                curItem.setNull();
            } else {
                // 如果只扣除一部分，通过修改底层 NBT 字节来改变数量，规避 API 可能的同步异常
                const nbt = curItem.getNbt();
                nbt.setByte("Count", curItem.count - deduct);
                curItem.setNbt(nbt);
            }
            // 将修改后的物品对象强制写回容器的对应格子序号
            ct.setItem(i, curItem);

            remainingCount -= deduct;

            if (remainingCount <= 0) break;
        }
    }

    return remainingCount === 0;
}
/**
 * 判断方向
 * @param {IntPos} playerPos
 * @param {IntPos} blockPos
 * @returns
 */
export function getDirection(playerPos, blockPos) {
    if (playerPos.dimid !== blockPos.dimid) return "north";

    const dx = playerPos.x - blockPos.x;
    const dz = playerPos.z - blockPos.z;

    if (dx === 0 && dz === 0) return "north";

    if (Math.abs(dx) > Math.abs(dz))
        return dx > 0 ? "east" : "west";
    else return dz > 0 ? "south" : "north";
}
/**
 * @param {IntPos} pos1 
 * @param {[number, number, number]} [offset=[0, 0, 0]] - 偏移数组 [x, y, z]
 * @returns {IntPos}
 */
export function getAddPos(pos1, [x = 0, y = 0, z = 0] = []) {
    return new IntPos(pos1.x + x, pos1.y + y, pos1.z + z, pos1.dimid);
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


/**
 * 优化：移除循环内部及原型的滥用 try-catch，改为简单的条件分支。
 */
LLSE_Player.prototype.giveItems = function (items, counts) {
    for (let i = 0; i < items.length; i++) {
        if (!items[i]) continue;
        const count = counts && counts[i] != null ? counts[i] : null;
        count === null ? this.giveItem(items[i]) : this.giveItem(items[i], count);
    }
}


export function getPosFromPosObj(posObj) {
    if (Math.ceil(posObj.x) == posObj.x)
        return new IntPos(posObj.x, posObj.y, posObj.z, posObj.dimid);
    else return new FloatPos(posObj.x, posObj.y, posObj.z, posObj.dimid);
}
export function getPosObjFromPos(pos) {
    return { x: pos.x, y: pos.y, z: pos.z, dimid: pos.dimid };
}

/**
 * 获取物品的显示名称
 */
export function getItemDisplayName(item) {
    const translateCode = (typeof config !== 'undefined' && config.get)
        ? (config.get("itemtranslateCode") ?? "zh_CN")
        : "zh_CN";
    const baseName = item.getTranslateName(translateCode);
    const itemInfo = getItemInfo(item);
    return itemInfo.CustomName || baseName;
}