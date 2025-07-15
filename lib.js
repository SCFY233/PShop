/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
const { config, lang, shopdata, shopdatajson, marketdata, } = require("./config.js");
const { versions, fix, author, path, info, info2, } = require("./consts.js");
const fs = require("fs")
var addlog = function () { };
//日志函数
if (config.get("enable").log) {
    addlog = function (pl, msg) {
        const date = system.getTimeObj(),
            now = new Date(),
            formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        return fs.appendFileSync(`./logs/PShop/${date.Y}-${date.M}-${date.D}.log`, `${formattedDate} ${pl.realName} ${msg}\n`)
    }
}
const imports = {
    "PMail": {
        enable: false,
        regsyssendp: function () { },
        sendmail: function () { },
    },
    "PVip": {
        enable: false,
        getplvipstatus: function () { },
    },
    "PLib": {
        enable: false,
        getItem: function () { },
    },
    "FinalTextures": {
        enable: false,
        getTextures: function () { },
    },
}
//检测插件并导入相关函数
function ChecAndImportPlugin(Plugins, PluginName, ImportsNames, ImportsToNames, LoggerLevel, LoggerMsgKey, ShouldUnload = false) {
    if (Plugins.includes(PluginName)) {
        imports[PluginName].enable = true
        ImportsNames.forEach((Name, Index) => {
            imports[PluginName][ImportsToNames[Index]] = ll.import(PluginName, Name)
        })
    } else {
        if (LoggerLevel == 0) {
            logger.warn(lang.get(LoggerMsgKey))
        } else if (LoggerLevel == 1) {
            logger.error(lang.get(LoggerMsgKey))
        }
        if (ShouldUnload) {
            setTimeout(() => {
                mc.runcmd("ll unload PShop")
            }, 3000);
        }
    }
}

//检测前置插件
mc.listen("onServerStarted", () => {
    const plus = ll.listPlugins();
    const pluginsToCheck = [
        {
            name: "PVip",
            importsNames: ["get_status"],
            importsToNames: ["getplvipstatus"],
            loggerLevel: 0,
            loggerMsgKey: "import.error.PVip",
            shouldUnload: false
        },
        {
            name: "PMail",
            importsNames: ["regsystem", "addnewmail"],
            importsToNames: ["regsyssendp", "sendmail"],
            loggerLevel: 0,
            loggerMsgKey: "import.warn.PMail",
            shouldUnload: false
        },
        {
            name: "PLib",
            importsNames: ["item"],
            importsToNames: ["getItem"],
            loggerLevel: 1,
            loggerMsgKey: "import.error.PLib",
            shouldUnload: true
        },
        {
            name: "FinalTextures",
            importsNames: ["getTextures"],
            importsToNames: ["getTextures"],
            loggerLevel: 1,
            loggerMsgKey: "import.error.FinalTextures",
            shouldUnload: true
        }
    ];
    for (let i = 0; i < pluginsToCheck.length; i++) {
        const plugin = pluginsToCheck[i];
        ChecAndImportPlugin(
            plus,
            plugin.name,
            plugin.importsNames,
            plugin.importsToNames,
            plugin.loggerLevel,
            plugin.loggerMsgKey,
            plugin.shouldUnload
        );
        if (plugin.name === "PMail" && imports.PMail.enable) {
            imports.PMail.regsyssendp(info2);
        }
    }
});
//定义经济操作函数
const moneys = {
    get conf() {
        return config.get("money")
    },
    /**
     * 加载配置文件
     * @returns {Boolean} 是否加载成功
     */
    loadconf() {
        try {
            switch (moneys.conf.type) {
                case "llmoney":
                    moneys.get = (player) => {
                        return Number(money.get(player.xuid))
                    }
                    moneys.add = (player, value) => {
                        player.addMoney(Number(value));
                        return true
                    }
                    moneys.reduce = (player, value) => {
                        player.reduceMoney(Number(value));
                        return true
                    }
                    break
                case "score":
                    moneys.get = (player) => {
                        return Number(player.getScore(config.get("moneyscore")))
                    }
                    moneys.add = (player, value) => {
                        player.addScore(config.get("moneyscore"), Number(value));
                        return true
                    }
                    moneys.reduce = (player, value) => {
                        player.reduceScore(config.get("moneyscore"), Number(value));
                        return true
                    }
                    break
                default:
                    function error(player) {
                        player.tell(info + Format.Red + lang.get("money.error.pl"));
                        throw new Error(lang.get("money.error"));
                    }
                    moneys.get = error
                    moneys.add = error
                    moneys.reduce = error
            }
        } catch (e) {
            throw e
        }
    },
    /**获取玩家的经济
     * @param {Player} player 玩家对象
     * @returns {number} 玩家的经济数量
     */
    get(player) { },
    /**
     * 减少玩家经济
     * @param {Player} player 玩家对象
     * @param {number} value 减少的数量
     * @returns {boolean} 是否成功减少
     */
    reduce(player, value) { },
    /**
     * 增加玩家经济
     * @param {Player} player 玩家对象
     * @param {Number} value 增加的数量
     * @returns {Boolean} 是否成功增加
     */
    add(player, value) { },
}
moneys.loadconf()
//检测正整数函数
function isPositiveInteger(number) {
    return Number.isInteger(number) && number > 0;
}
//定义扣除物品函数
/**
 * 使用物品标准类型名扣除物品
 * @param {Player} player 
 * @param {String} itemtype 
 * @param {Number} count 
 */
function reductItembytype(player, itemtype, count) {
    var inv = player.getInventory()
    var items = inv.getAllItems()
    var remainingcount = count
    var canremovecount = 0
    for (var i = 0; i < items.length; i++) {
        if (items[i].type === itemtype) {
            canremovecount += items[i].count
        }
    }
    if (canremovecount < count) { return false } else {
        for (var i = 0; i < items.length; i++) {
            if (items[i].type === itemtype) {
                inv.removeItem(i, (remainingcount - items[i].count >= 0) ? items[i].count : remainingcount)
                remainingcount -= items[i].count
                player.refreshItems()
                if (remainingcount <= 0) return true
            }
        }
    }
}
/**解析物品NBT !!史山来袭!!
 * @param {NbtCompound} nbt 物品NBT
 * @returns {Object} 物品信息
*/
function parseItemNbt(nbt) {
    try {
        var nbtobj = (Object.prototype.toString(nbt.getData).includes("function")) ? nbt : nbt.toObject();
        var nbtobjItems = null;
        var chargedItem = null;
        // 基础属性
        delete nbtobj.Damage;
        delete nbtobj.WasPickedUp;
        !!nbtobj.Block && delete nbtobj.Block.version;
        // 自定义名称相关属性
        if (typeof nbtobj.tag == "object") {
            if (!config.get("nbt").MatchEntityBucketCustomName) {
                const nameTags = ['CustomName', 'AppendCustomName', 'ColorID', 'ColorID2', 'BodyID', 'GroupName'];
                nameTags.forEach(tag => delete nbtobj.tag[tag]);
            }
            !config.get("nbt").MatchRepairCost && delete nbtobj.tag.RepairCost;
            // 实体属性
            const Tags = [
                'FallDistance', 'Fire', 'Strength', 'Sheared', 'trackingHandle',
                'definitions', 'UniqueID', 'Pos', 'Rotation', 'Motion',
                'CustomNameVisible', 'LastDimensionId', 'OnGround', 'PortalCooldown',
                'IsGlobal', 'IsAutonomous', 'LinksTag', 'LootDropped', 'StrengthMax',
                'OwnerNew', 'Sitting', 'IsOrphaned', 'IsOutOfControl', 'Saddled',
                'Chested', 'ShowBottom', 'IsGliding', 'IsSwimming', 'IsEating',
                'IsScared', 'IsStunned', 'IsRoaring', 'SkinID', 'Persistent', 'Tags',
                'Air', 'InLove', 'LoveCause', 'BreedCooldown', 'ChestItems',
                'InventoryVersion', 'LootTable', 'LootTableSeed', 'DamageTime', 'GeneArray',
                'entries', 'TimeStamp', 'HasExecuted', 'CountTime', 'TrustedPlayersAmount',
                'TrustedPlayer', 'fogCommandStack', 'properties', 'map_uuid', 'map_name_index',
                'wasJustBrewed'
            ];
            Tags.forEach(tag => delete nbtobj.tag[tag]);
            // 特殊处理Items和ChargedItem,Damage
            nbtobj.tag.Items && (nbtobjItems = nbtobj.tag.Items && delete nbtobj.tag.Items);
            nbtobj.tag && (chargedItem = nbtobj.tag.ChargedItem && delete nbtobj.tag.ChargedItem);
            (nbtobj.tag.Damage == 0) && delete nbtobj.tag.Damage;
        }
        return {
            parsednbtobj: nbtobj,
            nbtitems: nbtobjItems,
            chargedItem: chargedItem
        }
    } catch (e) { logger.error(e); }
};
function parseallitems(items) {
    var r = []
    if (items.length == 0) return r
    for (let i = 0; i < items.length; i++) {
        var pd = parseItemNbt(items[i])
        if (pd.nbtitems != null) r.push(...parseallitems(pd.nbtitems))
        if (pd.chargedItem != null) r.push(...parseallitems([pd.chargedItem]))
        r.push(pd.parsednbtobj)
    }
    return r
}

/**
 * 使用物品snbt扣除物品
 * @param {Player} player 
 * @param {String} itemsnbt 
 * @param {Number} count 
 */
function reductItembysnbt(player, itemsnbt, count) {
    var inv = player.getInventory()
    var items = inv.getAllItems()
    var remainingcount = count
    var canremovecount = 0
    var itemparsed = parseallitems([NBT.parseSNBT(itemsnbt)])
    for (var i = 0; i < items.length; i++) {
        if (same(itemparsed, parseallitems([items[i].getNbt()]))) {
            canremovecount += items[i].count
        }
    }
    if (canremovecount < count) { return false } else {
        for (var i = 0; i < items.length; i++) {
            if (same(itemparsed, parseallitems([items[i].getNbt()]))) {
                inv.removeItem(i, ((remainingcount - items[i].count) >= 0) ? items[i].count : remainingcount)
                remainingcount -= items[i].count
                player.refreshItems()
                if (remainingcount <= 0) return true
            }
        }
    }
}
//判断a,b是否相同
function same(a, b) {
    if (typeof a == "object" && typeof b == "object") {
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length != b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!same(a[i], b[i])) return false;
            }
            return true;
        } else {
            for (let key in a) {
                if (!same(a[key], b[key])) return false;
            }
            return true;
        }
    } else {
        return a == b;
    }
}
/**
 * 替换字符串
 * @param {String} str 字符串
 * @param {Object} replaceobj 替换对象
 * @returns {String} 替换后的字符串
 */
function replacestr(str, replaceobj) {
    for (let key in replaceobj) {
        str = str.replaceAll("{" + key + "}", replaceobj[key])
    }
    return str
}

module.exports = {
    imports,
    addlog,
    moneys,
    isPositiveInteger,
    same,
    replacestr,
    parseItemNbt,
    parseallitems,
    reductItembysnbt,
    reductItembytype,
}