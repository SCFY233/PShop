// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { addSMoney, reduceSMoney, getSMoney, transferSMoney } from "../../../SMoney/main.js";
import { parseItemNbt } from "./nbt.js"
//通用函数
/**
 * 判断两个值是否类似（支持不同顺序但内容相同的数组）
 * @param {Any} a 
 * @param {Any} b 
 * @returns {Boolean}
 */
export function same(a, b) {
    try {
        if (a == b) return true;
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
        if (Object.keys(a).length !== Object.keys(b).length) return false;
        if (Array.isArray(a) && Array.isArray(b)) {
            const setA = new Set(a);
            for (const item of b) {
                if (!setA.has(item)) return false;
            }
            return true;
        } else {
            for (const key in a) {
                if (!same(a[key], b[key])) return false;
            }
            return true;
        }
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
        const logFilePath = `./logs/PShop/${formattedDate.split(' ')[0]}.log`;
        const logfile = new File(logFilePath, file.AppendMode);
        logfile.writeSync(`${formattedDate} ${pl.realName} ${msg}\n`);
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
export const moneys = {
    /**
     * 加钱
     * @param {String} xuid 玩家xuid字符串
     * @param {Number} value 值
     * @returns {Boolean} 是否成功
     */
    add: (player, value) => addSMoney(player.xuid, value),
    /**
     * 减钱
     * @param {String} xuid 玩家xuid字符串
     * @param {Number} value 值
     * @returns {Boolean} 是否成功
     */
    reduce: (player, value) => reduceSMoney(player.xuid, -value),
    /**
     * 获取钱数
     * @param {String} xuid 玩家xuid字符串
     * @returns {Number} 该玩家当前拥有的钱数
     */
    get: (player) => getSMoney(player.xuid),
    /**
     * 转账
     * @param {String} from 转出玩家xuid字符串
     * @param {String} to 转入玩家xuid字符串
     * @param {Number} value 转账金额
     * @returns {Boolean} 是否成功
     */
    transfer: (from, to, value) => transferSMoney(from.xuid, to.xuid, value)
}
//检测正整数函数
export function isPositiveInteger(number) {
    return Number.isInteger(number) && number > 0;
}
//gives相关函数
export function addgiveItem(plxuid, item, note) {
    let gives = givesdata.get(plxuid) || []
    gives.push({
        item: item,
        note: note
    })
    givesdata.set(plxuid, gives)
}
export function addgiveMoney(plxuid, money, note) {
    let gives = givesdata.get(plxuid) || []
    gives.push({
        money: money,
        note: note
    })
    givesdata.set(plxuid, gives)
}
export function addgiveReduceMoney(plxuid, money, note) {
    let gives = givesdata.get(plxuid) || []
    gives.push({
        reducetmoney: money,
        note: note
    })
    givesdata.set(plxuid, gives)
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
export function setgiveItems(plxuid, items) {
    let gives = givesdata.get(plxuid)
    gives.item = items
    givesdata.set(plxuid, gives)
}
export function setgiveMoneys(plxuid, moneys) {
    let gives = givesdata.get(plxuid)
    gives.money = moneys
    givesdata.set(plxuid, gives)
}
export function setgiveReduceMoneys(plxuid, moneys) {
    let gives = givesdata.get(plxuid)
    gives.reducemoney = moneys
    givesdata.set(plxuid, gives)
}
export function getgives(plxuid) {
    let gives = givesdata.get(plxuid)
    return gives
}
mc.listen("onJoin", (pl) => {
    const gdata = getgives(pl.xuid)
    if (gdata == null) {
        setgiveItems(pl.xuid, [])
        setgiveMoneys(pl.xuid, [])
        setgiveReduceMoneys(pl.xuid, [])
        return
    }
    if (gdata.item == null) {
        setgiveItems(pl.xuid, [])
        return
    }
    if (gdata.money == null) {
        setgiveMoneys(pl.xuid, [])
        return
    }
    if (gdata.reducemoney == null) {
        setgiveReduceMoneys(pl.xuid, [])
        return
    }
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
})
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
        const examplenbt = parseItemNbt(item)
        if (auxStrict) count = its.filter(i => i.type == example.type && i.aux == example.aux && same(parseItemNbt(i.getNbt()), examplenbt)).reduce((pre, cur) => pre + cur.count, 0)
        else count = its.filter(i => i.type == example.type && same(parseItemNbt(i.getNbt()), examplenbt)).reduce((pre, cur) => pre + cur.count, 0)
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
export function reductItembytype(player, itemtype, aux, count, strictAux) {
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

export function reductItembyNbt(player, itemsnbt, count, strictAux) {
    try {
        var inv = player.getInventory();
        var items = inv.getAllItems();
        var remainingCount = count;
        const example = mc.newItem(NBT.parseSNBT(itemsnbt));
        const examplenbt = parseItemNbt(NBT.parseSNBT(itemsnbt));
        var canReductCount = getCanReductItemCount(player, NBT.parseSNBT(itemsnbt), null, strictAux);
        if (canReductCount < count) {
            return false;
        }
        for (var i = 0; i < items.length && remainingCount > 0; i++) {
            var item = items[i];
            if (item.type === example.type && (!strictAux || item.aux === example.aux) && same(parseItemNbt(item.getNbt()), examplenbt)) {
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
JsonConfigFile.prototype.deletes = (names) => { names.forEach(name => this.delete(name)); return this }

//SimpleForm
/**
* 添加按钮(方便函数)
* @param {Array<String>} names 
* @param {Array<String>} logos 
* @returns {LLSE_SimpleForm}
*/
LLSE_SimpleForm.prototype.addButtons = (names, logos) => { names.forEach((name, index) => this.addButton(name, logos[index])); return this }
/**
* 添加文本(方便函数)
* @param {Array<String} texts 
* @returns {LLSE_SimpleForm}
*/
LLSE_SimpleForm.prototype.addLabels = (texts) => { texts.forEach(text => this.addLabel(text)); return this }

//Player
/**
* 发送更好的模式表单
* @param {String} title 
* @param {String} content 
* @param {String} confirmButton 
* @param {String} cancelButton 
* @param {String} confirmButtonImage 
* @param {String} cancelButtonImage 
* @param {Function} callback 
*/
LLSE_Player.prototype.sendBetterModalForm = function (title, content, confirmButton, cancelButton, confirmButtonImage, cancelButtonImage, callback) {
        var gui = mc.newSimpleForm().setTitle(title).setContent(content).addButtons([confirmButton, cancelButton], [confirmButtonImage, cancelButtonImage])
        this.sendForm(gui, function (player, id) {
            if (id == null) return callback(player, id); else return callback(player, !id);
        })
};
/**
* 发送一个消息框表单
* @param {String} title 
* @param {String[]|String} contents 
* @param {String} buttonName 
* @param {String} buttonImage 
* @param {Function} callback 
*/
LLSE_Player.prototype.sendMessageForm = function (title, contents, buttonName, buttonImage, callback) {
    var gui = mc.newSimpleForm().setTitle(title)
        if (contents instanceof Array) {
            gui.addLabels(contents)
        } else gui.setContent(contents)
        gui.addButton(buttonName, buttonImage)
        this.sendForm(gui, function (player, id) {
            return callback(player, id)
        })
    }


LLSE_Player.prototype.giveItems = function (items, counts) {
    try {
        for (let i = 0; i < items.length; i++) {
            counts[i] == null ? this.giveItem(items[i]) : this.giveItem(items[i], counts[i]);
        }
    } catch (e) {
        console.error(`Error at givtItems:${e}`)
    }
}

