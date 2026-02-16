// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
//通用函数
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
/**
 * 判断两个值是否完全相同
 * @param {Any} a 
 * @param {Any} b 
 * @returns {Boolean}
 */
export function same(a, b) {
    try {
        if (a === b) return true;
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!same(a[i], b[i])) return false;
            }
            return true;
        }
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (let key of keysA) {
            if (!keysB.includes(key) || !same(a[key], b[key])) return false;
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
export const getDateForLogging = () => {
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
export function alog(pl, msg) {
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




JsonConfigFile.prototype.inits =
    /**
     * 初始化配置项(方便函数)
     * @param {Object} obj 
     */
    function (obj) {
        let results = []
        for (let i = 0; i < Object.keys(obj).length; i++) {
            results[i] = this.init(Object.keys(obj)[i], obj[Object.keys(obj)[i]]);
        }
        return results
    }
JsonConfigFile.prototype.deletes =
    /**
    * 删除配置(方便函数)
    * @param {String} names 
    */
    (names) => { names.forEach(name => this.delete(name)); return this }



//SimpleForm
LLSE_SimpleForm.prototype.addButtons =
    /**
    * 添加按钮(方便函数)
    * @param {Array<String>} names 
    * @param {Array<String>} logos 
    * @returns {LLSE_SimpleForm}
    */
    (names, logos) => { names.forEach((name, index) => this.addButton(name, logos[index])); return this }
LLSE_SimpleForm.prototype.addLabels =
    /**
    * 添加文本(方便函数)
    * @param {Array<String} texts 
    * @returns {LLSE_SimpleForm}
    */
    (texts) => { texts.forEach(text => this.addLabel(text)); return this }

//Player
LLSE_Player.prototype.sendBetterModalForm =
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
    function (title, content, confirmButton, cancelButton, confirmButtonImage, cancelButtonImage, callback) {
        var gui = mc.newSimpleForm().setTitle(title).setContent(content).addButtons([confirmButton, cancelButton], [confirmButtonImage, cancelButtonImage])
        this.sendForm(gui, function (player, id) {
            if (id == null) return callback(player, id); else return callback(player, !id);
        })
    };
LLSE_Player.prototype.sendMessageForm =
    /**
    * 发送一个消息框表单
    * @param {String} title 
    * @param {Array<String>||String} contents 
    * @param {String} buttonName 
    * @param {String} buttonImage 
    * @param {Function} callback 
    */
    function (title, contents, buttonName, buttonImage, callback) {
        var gui = mc.newSimpleForm()
        gui.setTitle(title)
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

