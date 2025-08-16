// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
const path = "./plugins/Planet/PShop/";
const workpath = "./plugins/PShop/";
const versions = "3.0.0"
const fix = " Beta 25.08-16 开发版"
const author = "Planet工作室-星辰开发组-春风"
//释放语言文件
const lang = new JsonConfigFile(path + "lang.json", JSON.stringify({
    "money.error": "经济系统配置错误!",
    "money.error.pl": "经济系统配置错误!请上报服务器管理员!",
    "gui.exit": "表单已关闭!",
    "shop.buy.ok": "购买成功!",
    "shop.mustnum": "数量必须是整数而且不能是负数",
    "shop.sell.ok": "出售成功!",
}));
/**
 * 初始化配置项(方便函数)
 * @param {Object} obj 
 */
JsonConfigFile.prototype.inits = function (obj) {
    for (let i = 0; i < Object.keys(obj).length; i++) {
        this.init(Object.keys(obj)[i], obj[Object.keys(obj)[i]]);
    }
}
JsonConfigFile.prototype._get = JsonConfigFile.prototype.get
JsonConfigFile.prototype.get = function (name, _default = null) {
    var getdata = this._get(name, _default); return (getdata == null) ? name : getdata
}
JsonConfigFile.prototype.deletes =
    /**
    * 删除配置(方便函数)
    * @param {String} names 
    */
    function (names) {
        for (let i = 0; i < names.length; i++) {
            this.delete(names[i]);
        }
    }

LLSE_SimpleForm.prototype.addButtons =
    /**
    * 添加按钮(方便函数)
    * @param {Array<String>} names 
    * @param {Array<String>} logos 
    * @returns {LLSE_SimpleForm}
    */
    function (names, logos) {
        for (let i = 0; i < names.length; i++) {
            this.addButton(names[i], logos[i]);
        }
        return this;
    }

LLSE_SimpleForm.prototype.addLabels =
    /**
    * 添加文本(方便函数)
    * @param {Array<String} texts 
    * @returns {LLSE_SimpleForm}
    */
    function (texts) {
        var str = ""
        for (let i = 0; i < texts.length; i++) {
            str += texts[i] + "\n";
        }
        str.slice(0, -2)
        this.setContent(str);
        return this;
    }
LLSE_Player.prototype.sendBetterModalForm =
    /**
    * 发送更好的模式表单
    * @param {String} title 
    * @param {String} content 
    * @param {String} confirmButton 
    * @param {String} cancelButton 
    * @param {Function} callback 
    * @param {String} confirmButtonImage 
    * @param {String} cancelButtonImage 
    */
    function (title, content, confirmButton, cancelButton, callback, confirmButtonImage, cancelButtonImage) {
        var gui = mc.newSimpleForm()
        gui.setTitle(title).setContent(content).addButtons([confirmButton, cancelButton], [confirmButtonImage, cancelButtonImage])
        this.sendForm(gui, function (player, id) {
            if (id == null) callback(player, id); else callback(player, !id);
        })
    };

LLSE_Player.prototype.sendMessageForm =
    /**
    * 发送一个消息框表单
    * @param {String} title 
    * @param {Array<String>||String} contents 
    * @param {String} buttonName 
    * @param {String} buttonImage 
    * @param {Function} yescallback 
    * @param {Function} nocallback 
    */
    function (title, contents, buttonName, buttonImage, yescallback, nocallback) {
        var gui = mc.newSimpleForm()
        gui.setTitle(title)
        if (contents instanceof Array) {
            gui.addLabels(contents)
        } else gui.setContent(contents)
        gui.addButton(buttonName, buttonImage)
        this.sendForm(gui, function (player, id) {
            if (nocallback == null) yescallback(player)
            else if (id == 0) yescallback(player); else nocallback(player);
        })
    }
LLSE_Player.prototype.giveItems = function (items, counts) {
    for (let i = 0; i < items.length; i++) {
        if (counts[i] == null)
            this.giveItem(items[i])
        else
            this.giveItem(items[i], counts[i]);
    }
}
lang.deletes([
    "shop.sell.no2",
    "shop.buy.noroom",
    "market.error.nocount",
    "market.buy.no",
    "market.buy.no2",
    "market.add.ok",
    "market.buy.ok",
    "market.reduce.ok",
    "market.opmenu.noperm",
    "market.buy_sell.search.normal.input"])
lang.inits({
    "import.error.PVip": "依赖 PVip 未安装,vip打折无法使用!",
    "import.warn.PMail": "依赖 PMail 未安装,已启用文件方式来给予玩家市场获得的经济",
    "import.error.PLib": "依赖 PLib 未安装,插件无法正常运行!插件将在3s后自动卸载!",
    "import.error.FinalTextures": "依赖 FinalTextures 未安装,插件无法正常运行!插件将在3s后自动卸载!",
    "lang.restore.success": "语言文件恢复完成!请重启服务器!!!,服务器将在10s后自动关闭!",
    "config.update.success": "检测到旧版配置文件,已经自动更新!",
    "gives.update.success.money": "检测到旧版给予(money)文件,已经自动更新!",
    "gives.update.success.item": "检测到旧版给予(item)文件,已经自动更新!",
    "shop.buy.tip": "购买物品{item.name}\n物品标准类型名:{item.id}\n物品数据值(Aux):{item.aux}\n价格:{money}/个,(原价{original_money}/个)",
    "shop.buy.title": "{info}购买物品:{item.name}",
    "log.shop.buy": "购买物品:{item.name} 物品id:{item.id} 数量:{quantity} 价格:{totalCost}",
    "log.shop.sell": "出售物品:{item.name} 物品id:{item.id} 数量:{quantity} 价格:{totalCost}",
    "log.market.buy": "购买商品:{item.name} 上架玩家:{item.player} 上架时间:{item.time} 数量:{count} 价格:{totalCost}",
    "log.market.sell": "出售商品:{item.name} 上架玩家:{item.player} 上架时间:{item.time} 数量:{count} 价格:{totalCost}",
    "gui.cancel": "取消",
    "gui.back": "返回",
    "gui.confirm": "确定",
    "command.ori.typeerror": "请不要在命令方块或控制台使用商店的命令",
    "command.shop.desc": "商店",
    "command.market.desc": "全球市场",
    "command.pshop.desc": "PShop插件主命令",
    "command.pshop.reload.success": "配置重载成功!",
    "command.pshop.version": "当前版本: {version}{fix} \n作者:{author}",
    "shop.input.buycount": "购买数量",
    "shop.sell.title": "{info}出售物品:{item.name}",
    "shop.sell.tip": "出售物品{data.name}\n物品标准类型名:{itemdata.id}\n价格:{itemdata.money}/个",
    "shop.input.sellcount": "出售数量,你当前拥有{itemCount}个,输入all出售全部",
    "shop.buy.maintitle": "{info}购买商品",
    "shop.sell.maintitle": "{info}出售商品",
    "shop.buy.group": "{info}{name}",
    "shop.sell.group": "{info}{name}",
    "shop.itembuttonname": "{item.name} {item.money}{money.name}/个",
    "shop.groupbuttonname": "{item.name}",
    "shop.buy.no": "{info}你没有那么多钱,你只有:{pl.money}",
    "shop.sell.no": "{info}你没有那么多物品,你只有:{count}",
    "gui.button.lastpage": "上一页",
    "gui.button.nextpage": "下一页",
    "gui.group.content": "第 {page} 页,共 {totalPages} 页",
    "market.title": "主菜单",
    "market.button.buy_sell": "购买/出售商品",
    "market.buy_sell.maintitle": "{info}购买/出售商品",
    "market.buy_sell.list.title": "{info}商品列表",
    "market.buy_sell.button.list": "以列表显示",
    "market.buy_sell.button.search.normal": "简易搜索",
    "market.buy_sell.button.search.better": "高级搜索",
    "market.group.item": "{item.name} {item.count}个/{item.money}{money.name}",
    "market.buy_sell_item.title": "{info2}{item.name}",
    "market.buy_sell_item.content": `商品数据如下: \n物品名称:{item.name}\n物品自定义名称{item.customname}\n物品标准类型名:{itemdata.type}\n物品数量:{itemdata.count}\n物品数据值:{itemdata.aux} \n总价格:{item.money}{money.name}\n平均价格:{avgmoney}{money.name}/个\n上架时间{item.time}\n上架玩家:{item.player}`,
    "market.buy_sell_item.item.content": " 物品名称:{item.name}\n 物品自定义名称{item.customname}\n 物品标准类型名:{itemdata.type}\n 物品数量:{itemdata.count}\n 物品数据值:{itemdata.aux}",
    "market.buy_sell_item.content.no_customname": "无",
    "market.buy_sell_item.content.enchants": "附魔:{enchants}",
    "market.buy_sell_item.content.potion": "药水效果:{potion.effect}\n持续时间:{potion.duration}",
    "market.buy_sell_item.content.includeitems": "包含物品:{items}",
    "market.buy_sell_item.slider.count": "选择数量",
    "market.buy_sell_item.buy.cantbypartial": "该物品不允许部分购买",
    "market.buy_sell_item.sell.cantbypartial": "该物品不允许部分出售",
    "market.buy_sell_item.noitem": "你没有足够的该物品",
    "market.buy_sell_item.sell.count": "出售数量:{havecount}/{count}",
    "market.buy_sell_item.sell.slider.count": "出售数量",
    "market.buy_sell_item.sell.confirm": "你确定要出售吗,你将获得{totalCost}{money.name}",
    "market.buy_sell_item.buy.count": "购买数量:{count}",
    "market.buy_sell_item.buy.nomoney": "你没有那么多钱!,需要花费:{totalCost}{money.name},你只有:{pl.money}{money.name}",
    "market.buy_sell_item.buy.confirm": "你确定要购买吗,你将花费{totalCost}{money.name}",
    "market.buy_sell_item.button.buy": "购买",
    "market.buy_sell_item.button.sell": "出售",
    "market.buy_sell_item.sell.success": "出售成功",
    "market.buy_sell_item.buy.success": "购买成功",
    "market.buy_sell_item.no": "商品不存在,可能已经被售空!",
    "item.try.reduce.fail": "扣除物品失败!",
    "market.search.normal.maintitle": "{info}简易搜索",
    "market.buy_sell.search.normal.input": "搜索名称(可带[求购]/[出售]前缀)",
    "market.search.normal.noitem": "没有找到任何商品!",
    "market.search.normal.title": "{info}搜索: {keyword}",
    "market.buy_sell_item.player.sell.success": "你成功收购了{item.name},你获得了玩家出售给你的物品",
    "market.buy_sell_item.player.buy.success": "你成功出售了{item.name},你获得了{totalCost}{money.name}",
    "market.search.better.maintitle": "{info}高级搜索",
    "market.search.betterinput": "请输入搜索关键词",
    "market.search.bettersearch.dropdown": "选择搜索方式",
    "market.search.bettersearch.dropdown.name": "按名称",
    "market.search.bettersearch.dropdown.type": "按物品标准类型名",
    "market.search.bettersearch.dropdown.player": "按玩家名称",
    "market.search.bettersort.dropdown": "选择排序方式",
    "market.search.bettersort.dropdown.nosort": "不排序",
    "market.search.bettersort.dropdown.up": "正序",
    "market.search.bettersort.dropdown.down": "降序",
    "market.search.bettersort.dropdown.money.up": "价格正序",
    "market.search.bettersort.dropdown.money.down": "价格降序",
    "market.search.betterbypartial.dropdown": "允许部分购买?",
    "market.search.betterbypartial.dropdown.all": "全部",
    "market.search.betterbypartial.dropdown.yes": "是",
    "market.search.betterbypartial.dropdown.no": "否",
    "market.search.better.noitem": "没有找到任何商品!",
    "market.search.better.title": "{info}搜索: {keyword}",
    "market.button.ctrl": "管理商品",
    "market.edit.input.money": "商品价格",
    "market.ctrl.maintitle": "{info}管理商品",
    "market.ctrl.button.add": "上架商品",
    "market.add.notenough.money": "你没有足够的钱,需要花费:{totalCost}{money.name},你只有:{pl.money}{money.name}",
    "market.add.maintitle": "{info}上架商品",
    "market.add.button.byitemtype": "根据标准类型名上架",
    "market.add.button.byhaveitem": "根据拥有物品上架",
    "market.add.button.byhand": "上架手中物品",
    "market.add.byitemtype.title": "{info}上架商品-标准类型名方式",
    "market.add.byitemtype.input.type": "物品标准类型名",
    "market.add.byitemtype.input.aux": "物品数据值(Aux)",
    "market.add.byitemtype.input.count": "物品数量",
    "market.add.byitemtype.switch.bypartial.sell": "允许部分出售,即玩家可以只出售部分物品,而不是全部",
    "market.add.byitemtype.input.money": "商品价格",
    "market.add.byitemtype.input.type.error": "物品标准类型名格式错误,请检查!",
    "market.add.byitemtype.input.aux.error": "物品数据值(Aux)必须为整数!",
    "market.add.byitemtype.input.count.error": "物品数量必须为正整数!",
    "market.add.byitemtype.input.money.error": "商品价格必须为数量的正整数倍!",
    "market.add.byhaveitem.title": "{info}上架商品-拥有物品方式",
    "market.add.byhaveitem.dropdown.item": "选择物品",
    "market.add.byhaveitem.switch.mode": "选择上架方式,关闭求购,打开出售",
    "market.add.byhaveitem.switch.bypartial": "是否允许部分购买/出售,即玩家可以只购买/出售部分物品,而不是全部",
    "market.add.byhaveitem.slider.count": "选择数量",
    "market.add.byhaveitem.input.money": "输入价格",
    "market.add.byhand.title": "{info}上架手中物品",
    "market.add.byhand.mainhand": "主手",
    "market.add.byhand.offhand": "副手",
    "market.add.byhand.empty": "手中为空,请先手持物品!",
    "market.add.byhand.switch.mode": "选择上架方式,关闭求购,打开出售",
    "market.add.byhand.switch.bypartial": "是否允许部分购买/出售,即玩家可以只购买/出售部分物品,而不是全部",
    "market.add.byhand.slider.count": "选择数量",
    "market.add.byhand.input.money": "输入价格",
    "market.add.item.prefix.buy": "[收购]",
    "market.add.item.prefix.sell": "[出售]",
    "market.ctrl.button.edit": "编辑商品",
    "market.ctrl.button.del": "下架商品",
    "market.add.success": "上架成功!",
    "market.add.byitemtype.confirm.title": "{info}上架商品确认",
    "market.add.byitemtype.confirm.desc": "你确定要使用标准类型名上架吗?标准类型名无法匹配附魔,内含有物品的物品!并且只能求购商品!",
    "market.edit.title": "{info}编辑商品",
    "market.edit.button.self": "编辑自己的商品",
    "market.edit.button.all": "编辑所有商品",
    "market.edit.noitem": "没有商品!",
    "market.edit.switch.mode": "选择商品类型,关闭求购,打开出售",
    "market.edit.switch.bypartial": "是否允许部分购买/出售,即玩家可以只购买/出售部分物品,而不是全部",
    "market.edit.switch.delete": "删除此商品",
    "market.edit.error.type": "你不能将收购商品转换为出售商品!",
    "market.edit.notenough.money": "你的钱不够!需要{totalCost}{money.name},你只有{pl.money}{money.name}",
    "market.edit.success": "编辑成功!",
    "market.del.confirm": "你确定要删除吗，此操作不可撤销!",
    "market.del.success": "删除成功!",
})
//释放配置文件
const config = new JsonConfigFile(path + "config.json", JSON.stringify({
    money: {
        type: "llmoney",
        name: "money",
        score: "money"
    },
    commands: {
        shop: "shop",
        market: "market",
    },
    vip: {
        enable: false,
        discount: 0.8
    },
    info: {
        shop: "§l§b[商店] §r",
        market: "§l§b[市场] §r"
    },
    enable: {
        shop: true,
        market: true,
        log: true,
    },
}));
//检测旧版本配置文件自动更新
mc.listen("onServerStarted", function () {
    if (config.get("log") == null) {
        var olddata = JSON.parse(config.read());
        var newconfig = {
            money: {
                type: olddata.money,
                name: olddata.moneyname,
                score: olddata.moneyscore
            },
            commands: {
                shop: "shop",
                market: "market"
            },
            vip: {
                enable: olddata.VIPdiscount,
                discount: olddata.discount
            },
            enable: {
                shop: olddata.shop,
                market: olddata.market,
                log: olddata.log
            }
        }
        File.writeTo(path + "config.json", JSON.stringify(newconfig))
        config.reload()
        logger.warn(lang.get("config.update.success"))
    }
})
config.init("nbt", {
    MatchBucketEntityCustomName: false,
    MatchBucketEntityFallDistance: false,
    MatchBucketEntityFire: true,
    MatchBucketEntityStrength: true,
    MatchBucketEntitySheared: true,
    MatchRepairCost: false,
})
config.init("minPayment", 1)
config.init("enablelang", ["zh_CN"])
config.init("defaultlang", "zh_CN")
config.init("lang", "zh_CN")
config.init("banitems", ["minecraft:bedrock"])
var initlogo = {
    "gui.cancel": "",
    "gui.back": "",
    "gui.confirm": "",
    "shop.buy": "",
    "shop.sell": "",
    "gui.lastpage": "",
    "gui.nextpage": "",
    "market.add.byitemtype": "",
    "market.add.byhaveitem": "",
    "market.buy_sell": "",
    "market.buy_sell.list": "",
    "market.buy_sell.search.normal": "",
    "market.buy_sell.search.better": "",
    "market.buy_sell_item.buy": "",
    "market.buy_sell_item.sell": "",
    "market.add.byitemtype": "",
    "market.add.byhaveitem": "",
    "market.add.byhand": "",
    "market.ctrl": "",
    "market.add": "",
    "market.ctrl.edit": "",
    "market.ctrl.del": "",
    "market.add.byhand.mainhand": "",
    "market.add.byhand.offhand": "",
    "market.edit.button.self": "",
    "market.edit.button.all": "",
}
config.init("logo", initlogo)
if (!same(config.get("logo"), initlogo)) {
    var oldlogo = config.get("logo") || {}
    for (let key in oldlogo) {
        if (!initlogo[key]) {
            initlogo[key] = oldlogo[key]
        }
    }
    config.set("logo", initlogo)
}
config.inits({ "itemsperpage": 10 })
const info = config.get("info").shop || "§l§b[Shop] §r";
const info2 = config.get("info").market || "§l§b[市场] §r";
var addlog
//日志
if (config.get("enable").log) {
    var addlog = function (pl, msg) {
        const date = system.getTimeObj();
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const logfile = new File(`./logs/PShop/${date.Y}-${date.M}-${date.D}.log`, file.AppendMode);
        logfile.writeSync(`${formattedDate} ${pl.realName} ${msg}\n`);
        return logfile
    }
} else var addlog = function () { }
//常量
var constsdata = new JsonConfigFile(workpath + "data.json")
if (constsdata.read() == "{}") {
    logger.error("数据文件为空,请检查文件是否损坏!")
}
let consts = {
    enchants: [],
    potions: [],
    effects: [],
    loaddata() {
        this.enchants = constsdata.get("enchants") || []
        this.potions = constsdata.get("potions") || []
        this.effects = constsdata.get("effects") || []
    }
}
var enchs = {}
var potions = {}
var effects = {}
function loadconstsmap() {
    consts.loaddata()
    for (let i = 0; i < consts.enchants.length; i++) {
        enchs[consts.enchants[i].id] = consts.enchants[i]
    }
    for (let i = 0; i < consts.potions.length; i++) {
        potions[consts.potions[i].id] = consts.potions[i]
    }
    for (let i = 0; i < consts.effects.length; i++) {
        effects[consts.effects[i].id] = consts.effects[i]
    }
    consts.effects = [], consts.potions = [], consts.enchants = []
}
/**
 * 解析lang
 * @param {String} text 
 * @returns 
 */
function parseLangFile(text) {
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
let gamelang = {}
function loadlang(langcode) {
    gamelang[langcode] = parseLangFile(File.readFrom("./resource_packs/vanilla/texts/" + langcode + ".lang"))
}
function loadlangs() {
    let enablelangs = config.get("enablelang")
    for (let i = 0; i < enablelangs.length; i++) {
        loadlang(enablelangs[i])
    }
}
const gives = new JsonConfigFile(path + "gives.json", JSON.stringify({}))
function setgives(playername, mode, value) {
    if (gives.get(playername) == playername) {
        if (mode == 0)
            gives.set(playername, { "money": [value], "item": [] })
        else
            if (value instanceof Array)
                gives.set(playername, { "money": [], "item": value })
            else
                gives.set(playername, { "money": [], "item": [value] })
    } else {
        let pls = gives.get(playername)
        if (mode == 0)
            pls.money.push(value)
        else
            if (value instanceof Array)
                pls.item = pls.item.concat(value)
            else
                pls.item.push(value)
        gives.set(playername, pls)
    }
    return
}
mc.listen("onServerStarted", function () {
    if (File.exists(path + "givemoney.json")) {
        const givemoney = new JsonConfigFile(path + "givemoney.json")
        const keys = Object.keys(JSON.parse(givemoney.read()))
        for (let playername of keys)
            if (givemoney.get(playername) != null && givemoney.get(playername) != 0) setgives(playername, 0, givemoney.get(playername))
        givemoney.close()
        File.rename(path + "givemoney.json", path + "givemoney.bak")
        logger.warn(lang.get("gives.update.success.money"))
    }
    if (File.exists(path + "giveitems.json")) {
        const giveitems = new JsonConfigFile(path + "giveitems.json")
        const keys = Object.keys(JSON.parse(giveitems.read()))
        for (let playername of keys)
            if (giveitems.get(playername) != null && giveitems.get(playername).length > 0) setgives(playername, 1, giveitems.get(playername))
        giveitems.close()
        File.rename(path + "giveitems.json", path + "giveitems.bak")
        logger.warn(lang.get("gives.update.success.item"))
    }
})
//检测前置插件
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
    "FinalTextures": {
        enable: false,
        getTextures: function () { },
    },
    "GMLIB": {
        enable: false,
    },
    "GMLIB-LegacyRemoteCallApi": {
        enable: false,
    }
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
            name: "FinalTextures",
            importsNames: ["getTextures"],
            importsToNames: ["getTextures"],
            loggerLevel: 1,
            loggerMsgKey: "import.error.FinalTextures",
            shouldUnload: true
        },
        {
            name: "GMLIB",
            importsNames: [],
            importsToNames: [],
            loggerLevel: 1,
            loggerMsgKey: "import.error.GMLIB",
            shouldUnload: true
        },
        {
            name: "GMLIB-LegacyRemoteCallApi",
            importsNames: [],
            importsToNames: [],
            loggerLevel: 1,
            loggerMsgKey: "import.error.GMLIB.LegacyRemoteCall",
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
require('./GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS');
//检测旧版本替换语言文件自动替换回来
mc.listen("onServerStarted", function () {
    function a() {
        if (File.exists("./resource_packs/vanilla/texts/en_US.langbackup")) {
            File.writeTo("./resource_packs/vanilla/texts/en_US.lang", File.readFrom("./resource_packs/vanilla/texts/en_US.langbackup"))
            File.delete("./resource_packs/vanilla/texts/en_US.langbackup")
            logger.warn(lang.get("lang.restore.success"))
            setTimeout(() => {
                mc.runcmd("stop")
            }, 10000)
        }
    }
    //解决部分问题
    setTimeout(a, 2000)
})
//释放商店和市场文件
const shopdatajson = new JsonConfigFile(path + "shopdata.json", JSON.stringify({
    Buy: [
        {
            name: "示例",
            type: "group",
            image: "",
            data: [
                {
                    name: "示例(苹果)",
                    type: "item",
                    image: "",
                    data: [{
                        id: "minecraft:apple",
                        aux: 0,
                        money: 10,
                    }]
                }
            ]
        }
    ],
    Sell: [
        {
            name: "示例",
            type: "group",
            image: "",
            data: [
                {
                    name: "示例(苹果)",
                    type: "item",
                    image: "",
                    data: [{
                        id: "minecraft:apple",
                        aux: 0,
                        money: 10,
                    }]
                }
            ]
        }
    ]
}));
const marketdatajson = new JsonConfigFile(path + "marketdata.json", JSON.stringify({ data: [] }));
//定义经济操作函数
const moneys = {
    get conf() {
        return config.get("money")
    },
    get minPayment() {
        return config.get("minPayment")
    },
    /**
     * 加载配置文件
     * @returns {Boolean} 是否加载成功
     */
    loadconf() {
        try {
            switch (this.conf.type) {
                case "llmoney":
                    this.get = (player) => {
                        return Number(money.get(player.xuid))
                    }
                    this.add = (player, value) => {
                        player.addMoney(Number(value));
                        return true
                    }
                    this.reduce = (player, value) => {
                        player.reduceMoney(Number(value));
                        return true
                    }
                    break
                case "score":
                    this.get = (player) => {
                        return Number(player.getScore(config.get("moneyscore")))
                    }
                    this.add = (player, value) => {
                        player.addScore(config.get("moneyscore"), Number(value));
                        return true
                    }
                    this.reduce = (player, value) => {
                        player.reduceScore(config.get("moneyscore"), Number(value));
                        return true
                    }
                    break
                default:
                    function error(player) {
                        player.tell(info + Format.Red + lang.get("money.error.pl"));
                        throw new Error(lang.get("money.error"));
                    }
                    this.get = error
                    this.add = error
                    this.reduce = error
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
    cumulativeError: 0.0,
    calculatePayment(beforemoney) {
        const originalAmount = beforemoney;
        const fractionalPart = originalAmount - Math.floor(originalAmount);
        this.cumulativeError += fractionalPart;
        let payment;
        if (this.cumulativeError >= 1.0) {
            this.cumulativeError -= 1.0;
            payment = Math.floor(originalAmount) + 1;
        }
        else if (this.cumulativeError <= -1.0) {
            this.cumulativeError += 1.0;
            payment = Math.floor(originalAmount) - 1;
        }
        else {
            const randomValue = Math.random();
            if (randomValue < Math.abs(this.cumulativeError)) {
                if (this.cumulativeError > 0) {
                    payment = Math.floor(originalAmount) + 1;
                } else {
                    payment = Math.floor(originalAmount) - 1;
                }
            } else {
                payment = Math.floor(originalAmount);
            }
        }
        return Math.max(payment, this.minPayment);
    }
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
                if (remainingcount <= 0) {
                    player.refreshItems()
                    return true
                }
            }
        }
    }
}
/**解析物品NBT !!史山来袭!!
 * @param {NbtCompound} nbt 物品NBT
 * @returns {Object} 物品信息
*/
function parseItemNbt(nbt, otherdeletes = []) {
    try {
        if (nbt == null || nbt == undefined) return
        var nbtobj = nbt instanceof NbtCompound ? NBTtoObject(nbt) : nbt;
        var nbtobjItems = []
        var chargedItem = ""
        var Slot = nbtobj.Slot || -1;
        delete nbtobj.WasPickedUp;
        delete nbtobj.Slot;
        !!nbtobj.Block && delete nbtobj.Block.version;
        if (typeof nbtobj.tag == "object") {
            if (!config.get("nbt").MatchEntityBucketCustomName) {
                const nameTags = ['CustomName', 'AppendCustomName', 'ColorID', 'ColorID2', 'BodyID', 'GroupName'];
                nameTags.forEach(tag => delete nbtobj.tag[tag]);
            }
            !config.get("nbt").MatchRepairCost && delete nbtobj.tag.RepairCost;
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
                'wasJustBrewed', "Slot"
            ];
            Tags.forEach(tag => delete nbtobj.tag[tag]);
            // 特殊处理Items和ChargedItem,Damage
            nbtobj.tag.Items != null && (nbtobjItems = nbtobj.tag.Items) && (delete nbtobj.tag.Items);
            nbtobj.tag && (chargedItem = nbtobj.tag.ChargedItem) && (delete nbtobj.tag.ChargedItem);
            (nbtobj.tag.Damage == 0) && delete nbtobj.tag.Damage;
        }
        if (nbtobj.tag == null) {
            nbtobj.tag = {}
        }
        for (let i = 0; i < otherdeletes.length; i++) {
            delete nbtobj[otherdeletes[i]];
        }
        return {
            parsednbtobj: nbtobj,
            nbtitems: nbtobjItems,
            chargedItem: chargedItem,
            Slot: Slot
        }
    } catch (e) { logger.error(e); }
};
function parseItem(item, otherdeletes = []) {
    try {
        var r = []
        var pd
        if (item instanceof LLSE_Item && !item.isNull()) {
            pd = parseItemNbt(item.getNbt(), otherdeletes)
        } else if (item instanceof NbtCompound) {
            pd = parseItemNbt(item, otherdeletes)
        } else if (item instanceof String || typeof item == "string") {
            pd = parseItemNbt(NBT.parseSNBT(item), otherdeletes)
        } else return []
        var nbtitems = pd.nbtitems
        nbtitems.forEach(item => {
            var parse = parseItemNbt(item)
            if (parse != undefined) {
                r.push(item)
            }
        })
        if (pd.chargedItem != "") r.push(parseItem(pd.chargedItem))
        r.push(pd.parsednbtobj)
        return deleteNullArrInArr(r)
    } catch (e) { logger.error(e); }
}
/**
 *
 * @param {Array} arr
 * @returns
 */
function deleteNullArrInArr(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (same(arr[i], []) || same(arr[i], {}) || arr[i] == null) {
            arr.splice(i, 1)
            i--
        }
    }
    return arr
}
/**
 * 使用物品snbt扣除物品
 * @param {Player} player 
 * @param {String} itemsnbt 
 * @param {Number} count 
 */
function reductItembysnbt(player, itemsnbt, count) {
    let reducedItemnbts = []
    var inv = player.getInventory()
    var items = inv.getAllItems()
    var offhanditem = player.getOffHand()
    var remainingcount = count
    var canremovecount = getSameItemCount(items, mc.newItem(NBT.parseSNBT(itemsnbt)))
    if (!offhanditem.isNull()) {
        if (same(parseItem(offhanditem, ["Count"]), parseItem(itemsnbt, ["Count"]))) canremovecount += offhanditem.count
    }
    log([canremovecount, itemsnbt, count])
    if (canremovecount < count) { return false } else {
        if (!offhanditem.isNull() && same(parseItem(offhanditem, ["Count"]), parseItem(itemsnbt, ["Count"]))) {
            let delcount = (remainingcount - offhanditem.count >= 0) ? offhanditem.count : remainingcount
            reducedItemnbts.push(offhanditem.getNbt().setByte("Count", delcount).toSNBT())
            var aftercount = offhanditem.count - delcount
            if (aftercount > 0) {
                offhanditem.setNbtoffhanditem.getNbt().setByte("Count", aftercount)
            } else {
                offhanditem.setNull()
            }
            remainingcount -= offhanditem.count
            player.refreshItems()
        }
        for (var i = 0; i < items.length; i++) {
            if (!items[i].isNull() && same(parseItem(items[i], ["Count"]), parseItem(itemsnbt, ["Count"]))) {
                let delcount = (remainingcount - items[i].count >= 0) ? items[i].count : remainingcount
                var aftercount = items[i].count - delcount
                reducedItemnbts.push(items[i].getNbt().setByte("Count", delcount).toSNBT())
                remainingcount -= items[i].count
                if (aftercount > 0) {
                    items[i].setNbt(items[i].getNbt().setByte("Count", aftercount))
                } else {
                    items[i].setNull()
                }
                player.refreshItems()
                if (remainingcount <= 0) break
            }
        }
    }
    return reducedItemnbts
}
/**
 * 获取相同类型物品数量
 * @param {Array<Item>} items 
 * @param {Item} item 
 * @returns 
 */
function getSameItemCount(items, item) {
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
 * 
 * @param {Any} a 
 * @param {Any} b 
 * @returns 
 */
function same(a, b) {
    if (typeof a == "object" && typeof b == "object") {
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length != b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!same(a[i], b[i])) return false;
            }
            return true;
        } else {
            const keys = Object.keys(a);
            if (keys.length != Object.keys(b).length) return false;
            for (var i = 0; i < keys.length; i++) {
                if (!same(a[keys[i]], b[keys[i]])) return false;
            }
            return true;
        }
    } else {
        return a == b;
    }
}
/**
 * 将NBT对象转换为JavaScript对象
 * @param {NbtCompound | NbtList} nbt NBT对象
 * @returns {Object | Array} 转换后的JavaScript对象或数组
 */
function NBTtoObject(nbt) {
    const simpleTypes = [NBT.Byte, NBT.Short, NBT.Int, NBT.Long, NBT.Float, NBT.Double, NBT.String];
    if (nbt.getType() === NBT.Compound) {
        const obj = {};
        const keys = nbt.getKeys();
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const tag = nbt.getTag(key);
            const type = tag.getType();
            if (simpleTypes.includes(type)) {
                obj[key] = tag.get();
            } else if (type === NBT.ByteArray) {
                obj[key] = tag.getData(); // 或者你可以选择将其转换为Base64字符串
            } else if (type === NBT.List) {
                obj[key] = NBTtoObject(tag);
            } else if (type === NBT.Compound) {
                obj[key] = NBTtoObject(tag);
            }
        }
        return obj;

    } else if (nbt.getType() === NBT.List) {
        const array = [];
        const size = nbt.getSize();
        for (let i = 0; i < size; i++) {
            const tag = nbt.getTag(i);
            const type = tag.getType();
            if (simpleTypes.includes(type)) {
                array.push(tag.get());
            } else if (type === NBT.ByteArray) {
                array.push(tag.getData());
            } else if (type === NBT.List) {
                array.push(NBTtoObject(tag));
            } else if (type === NBT.Compound) {
                array.push(NBTtoObject(tag));
            }
        }
        return array;
    }
    return null;
}
function Num2Roman(num) {
    const romanMap = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return (num <= 10 && num >= 1) ? romanMap[num] : num
}
function duration2str(duration) {
    let seconds = duration / 20;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    if (duration == 0) return ""
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
/**
 * 获取物品信息
 * @param {Item} item 
 * @param {String} langcode 
 */
function getItemInfo(item, langcode = config.get("defaultlang")) {
    let result = {}
    var pd = item instanceof LLSE_Item ? parseItemNbt(item.getNbt()) : parseItemNbt(item)
    var item = item instanceof LLSE_Item ? item : mc.newItem(NBT.parseSNBT(JSON.stringify(item)))
    if (pd.parsednbtobj.Name == undefined || pd.parsednbtobj.Name == "") return
    var id = pd.parsednbtobj.Name
    var otheritems = []
    var Slot = pd.Slot
    if (pd.nbtitems != undefined && pd.nbtitems != null) {
        for (let i = 0; i < pd.nbtitems.length; i++) {
            const item = pd.nbtitems[i]
            otheritems.push(getItemInfo(item, langcode))
        }
    }
    result.includeitems = !same(otheritems, []) ? otheritems : null
    var potioninfo = {}
    if (id.includes("potion")) {
        if (id == "minecraft:potion") {
            potioninfo.desc = gamelang[langcode][potions[pd.parsednbtobj.Damage].desc.Regular] || id
        } else if (id == "minecraft:splash_potion") {
            potioninfo.desc = gamelang[langcode][potions[pd.parsednbtobj.Damage].desc.Splash] || id
        } else if (id == "minecraft:lingering_potion") {
            potioninfo.desc = gamelang[langcode][potions[pd.parsednbtobj.Damage].desc.Lingering] || id
        }
        potioninfo.effectname = gamelang[langcode][potions[pd.parsednbtobj.Damage].effect.desc] || " "
        potioninfo.effectduration = duration2str(potions[pd.parsednbtobj.Damage].effect.duration) || "0:00"
    }
    var enchantinfo = []
    if (Object.keys(pd.parsednbtobj).includes("tag") && Object.keys(pd.parsednbtobj.tag).includes("ench")) {
        for (let i = 0; i < pd.parsednbtobj.tag.ench.length; i++) {
            enchantinfo.push(gamelang[langcode][enchs[pd.parsednbtobj.tag.ench[i].id].desc] + " " + Num2Roman(pd.parsednbtobj.tag.ench[i].lvl))
        }
    }
    var customname = pd.parsednbtobj.tag && pd.parsednbtobj.tag.display ? pd.parsednbtobj.tag.display.Name : "" || ""
    return { "name": item.getTranslateName(langcode), "id": id, "customname": customname || "", "enchantinfo": enchantinfo, "potioninfo": potioninfo, "includeitems": otheritems, "Slot": Slot }
}
/**
 * 获取物品描述
 * @param {Item} item 
 * @param {String} langcode 
*/
function getItemInfoStr(item, langcode, index) {
    let result = ""
    const iteminfo = item instanceof LLSE_Item ? getItemInfo(item, langcode) : item
    var item = (item instanceof LLSE_Item) ? item : mc.newItem(NBT.parseSNBT(JSON.stringify(item)))
    if (index != -1) result += `[${index}]`
    result += replacestr(lang.get("market.buy_sell_item.item.content"), {
        "item.name": iteminfo.name,
        "itemdata.type": iteminfo.id,
        "item.customname": iteminfo.customname == "" ? lang.get("market.buy_sell_item.content.no_customname") : iteminfo.customname,
        "itemdata.count": item.count,
        "itemdata.aux": item.aux,
    })
    let enchants = iteminfo.enchantinfo
    if (!same(iteminfo.enchantinfo, [])) {
        enchants = iteminfo.enchantinfo.join("|")
        result += ("\n " + replacestr(lang.get("market.buy_sell_item.content.enchants"), { "enchants": enchants }))
    }
    if (iteminfo.potioninfo.effectname != null) {
        result += ("\n " + replacestr(lang.get("market.buy_sell_item.content.potion"), { "potion.effect": iteminfo.potioninfo.effectname, "potion.duration": iteminfo.potioninfo.effectduration }))
    }
    return result
}
/**
 * 获取商品信息
 * @param {Object} item 
 * @param {Strinb} itemnbt 
 * @param {String} langcode 
 */
function getItemContent(item, langcode = config.get("defaultlang")) {
    let result = ""
    let itemdata = mc.newItem(NBT.parseSNBT(item.itemnbt))
    let iteminfo = getItemInfo(itemdata, langcode)
    result += replacestr(lang.get("market.buy_sell_item.content"), {
        "item.name": item.name,
        "itemdata.type": itemdata.type,
        "item.customname": iteminfo.customname == "" ? lang.get("market.buy_sell_item.content.no_customname") : iteminfo.customname,
        "itemdata.count": itemdata.count,
        "itemdata.aux": itemdata.aux,
        "item.money": item.money,
        "avgmoney": `${(item.money / itemdata.count).toFixed(2)}(${item.money / itemdata.count})`,
        "money.name": moneys.conf.name,
        "item.time": item.time,
        "item.player": item.player,
    })
    if (!same(iteminfo.enchantinfo, [])) {
        enchants = iteminfo.enchantinfo.join("|")
        result += ("\n" + replacestr(lang.get("market.buy_sell_item.content.enchant"), { "enchants": enchants }))
    }
    if (iteminfo.potioninfo.effectname != null) {
        result += ("\n" + replacestr(lang.get("market.buy_sell_item.content.potion"), { "potion.effect": iteminfo.potioninfo.effectname, "potion.duration": iteminfo.potioninfo.effectduration }))
    }
    if (!same(iteminfo.includeitems, [])) {
        for (let i = 0; i < iteminfo.includeitems.length; i++) {
            result += ("\n" + getItemInfoStr(iteminfo.includeitems[i], langcode, iteminfo.includeitems[i].Slot))
        }
    }
    return result
}
function test() {
    const md = market.data
    md[0].itemnbt = (mc.getPlayer("ColdestCarp5592").getHand().getNbt().toSNBT())
    marketdatajson.set("data", md)
    market.loaddata()
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
function getIndexInArray(arr, item) {
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        if (same(arr[i], item)) return i;
    }
    return -1;
}
/**
 * 商店组gui
 * @param {Number} type 
 * @param {Player} player 玩家
 * @param {Object} data 商品数据
 * @param {Number} [page=0] 当前页码,默认为0
 */
function shopgroupgui(type, player, path, page = 0, backpages) {
    const groupdata = (path != "shop.data.Buy" && path != "shop.data.Sell") ? eval(path).data : eval(path);
    const ITEMS_PER_PAGE = config.get("itemsperpage"); // 每页显示的条目数
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageData = groupdata.slice(startIndex, endIndex);
    const totalPages = Math.ceil(groupdata.length / ITEMS_PER_PAGE);
    const gui = mc.newSimpleForm();
    if (path == "shop.data.Buy" || path == "shop.data.Sell") {
        type == 0 ? gui.setTitle(replacestr(lang.get("shop.buy.maintitle"), { info: info })) : gui.setTitle(replacestr(lang.get("shop.sell.maintitle"), { info: info }));
    } else {
        type == 0 ? gui.setTitle(replacestr(lang.get("shop.buy.group"), { info: info, name: eval(path).name })) : gui.setTitle(replacestr(lang.get("shop.sell.group"), { info: info, name: eval(path).name }));
    }
    gui.setContent(replacestr(lang.get("gui.group.content"), { page: page + 1, totalPages: totalPages }));
    currentPageData.forEach(item => {
        var str = item.type == "item" ? str = replacestr(lang.get("shop.itembuttonname"), { "item.name": item.name, "item.money": item.data[0].money, "money.name": moneys.conf.name }) : str = replacestr(lang.get("shop.groupbuttonname"), { "item.name": item.name })
        if (item.image != null && item.image != "") {
            gui.addButton(str, item.image)
        } else if (item.type == "item" && item.data[0].id.includes("minecraft:")) {
            gui.addButton(str, imports.FinalTextures.getTextures(item.data[0].id))
        } else {
            gui.addButton(str)
        }
    });
    // 添加翻页按钮
    if (page > 0) {
        gui.addButton(lang.get("gui.button.lastpage"), config.get("logo")["gui.lastpage"]);
    }
    if (endIndex < groupdata.length) {
        gui.addButton(lang.get("gui.button.nextpage"), config.get("logo")["gui.nextpage"]);
    }
    if (!same(backpages, [])) {
        gui.addButton(lang.get("gui.back"), config.get("logo")["gui.back"]);
    }
    player.sendForm(gui, (pl, id) => {
        if (id == null) {
            pl.tell(info + lang.get("gui.exit"));
            return;
        }
        const lastButtonIndex = currentPageData.length + (page > 0 ? 1 : 0) + (endIndex < groupdata.length ? 1 : 0);
        if (id === lastButtonIndex) {
            var path1 = path.replace(/\./g, ' ').replace(/\[/g, ' [').trim().split(/\s+/);
            var path2 = path1.slice(0, path1.length - 1)
            if (path2.at(-1) == "data") path2.pop()
            shopgroupgui(type, player, path2.reduce((acc, cur) => { if (cur.startsWith('[')) { return acc + cur; } else { return acc + (acc ? '.' : '') + cur; } }, ''), backpages[backpages.length - 1], backpages.slice(0, backpages.length - 1));
            return;
        }
        if (page > 0 && id === currentPageData.length) {
            // 上一页
            shopgroupgui(type, player, path, page - 1, backpages);
        } else if (endIndex < groupdata.length && id === currentPageData.length + (page > 0 ? 1 : 0)) {
            // 下一页
            shopgroupgui(type, player, path, page + 1, backpages);
        } else {
            const selectedData = groupdata[startIndex + id];
            if (path != "shop.data.Buy" && path != "shop.data.Sell")
                var path1 = path + ".data[" + (startIndex + id) + "]"
            else var path1 = path + "[" + (startIndex + id) + "]"
            type == 0 ? shop.buy(selectedData.type == "item" ? 0 : 1, pl, path1, backpages.concat(page)) : shop.sell(selectedData.type == "item" ? 0 : 1, pl, path1, backpages.concat(page))
        }
    });
}
//shop部分
const shop = {
    data: { "Buy": [], "Sell": [] },
    loaddata() {
        shop.data = JSON.parse(shopdatajson.read())
    },
    /**
     * 购买
     * @param {Number} type 0物品 1组
     * @param {Player} player 玩家
     * @param {Object} data 商品信息
     */
    buy(type, player, path, backpages) {
        if (type == 0) {
            var data = eval(path);
            var _data = data
            const itemdata = data.data[0];
            const gui = mc.newCustomForm();
            const money = config.get("VIPdiscount") && imports.PVip.getplvipstatus(player.realName) ? itemdata.money * config.get("discount") : itemdata.money;
            gui.setTitle(replacestr(lang.get("shop.buy.title"), { info: info, "item.name": data.name, "item.money": itemdata.money }));
            gui.addLabel(replacestr(lang.get("shop.buy.tip"), { "item.name": data.name, "money": money, "item.id": itemdata.id, "item.aux": itemdata.aux, "original_money": itemdata.money }));
            gui.addInput(lang.get("shop.input.buycount"));
            player.sendForm(gui, (pl, data) => {
                if (data == null) {
                    pl.tell(info + lang.get("gui.exit"));
                    return
                }
                if (data[1] == "") {
                    var path1 = path.replace(/\./g, ' ').replace(/\[/g, ' [').trim().split(/\s+/);
                    var path2 = path1.slice(0, path1.length - 1)
                    if (path2.at(-1) == "data") path2.pop()
                    shopgroupgui(type, player, path2.reduce((acc, cur) => { if (cur.startsWith('[')) { return acc + cur; } else { return acc + (acc ? '.' : '') + cur; } }, ''), backpages[backpages.length - 1], backpages.slice(0, backpages.length - 1));
                    return
                }
                const quantity = Number(data[1]);
                if (!isPositiveInteger(quantity)) {
                    pl.sendMessageForm(info, lang.get("shop.mustnum"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => {
                        shop.buy(type, pl, path, backpages)
                    });
                    return
                }
                const totalCost = money * quantity;
                if (moneys.get(pl) < totalCost) {
                    pl.sendMessageForm(info, replacestr(lang.get("shop.buy.no"), { "info": info, "pl.money": moneys.get(pl) }), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => {
                        shop.buy(type, pl, path, backpages)
                    });
                } else {
                    moneys.reduce(pl, totalCost) && mc.runcmdEx(`give "${pl.realName}" ${itemdata.id} ${quantity} ${itemdata.aux} `)
                    pl.sendBetterModalForm(info, replacestr(lang.get("shop.buy.ok"), { "info": "", "item.name": data.name, "item.id": itemdata.id, "quantity": quantity, "totalCost": totalCost }), lang.get("gui.back"), lang.get("gui.cancel"), (pl, res) => {
                        if (res) {
                            shop.buy(type, pl, path, backpages)
                        } else return
                    }, config.get("logo")["gui.back"], config.get("logo")["gui.cancel"])
                    addlog(player, replacestr(lang.get("log.shop.buy"), { "item.name": _data.name, "item.id": itemdata.id, "quantity": quantity, "totalCost": totalCost }))
                }
            })
        } else {
            shopgroupgui(0, player, path, 0, backpages)
        }
    },
    sell(type, player, path, backpages) {
        if (type == 0) {
            var data = eval(path);
            var _data = data
            const itemdata = data.data[0];
            const gui = mc.newCustomForm();
            gui.setTitle(replacestr(lang.get("shop.sell.title"), { info: info, "item.name": data.name }));
            gui.addLabel(replacestr(lang.get("shop.sell.tip"), { "data.name": data.name, "itemdata.id": itemdata.id, "itemdata.money": itemdata.money }));
            const itemCount = player.getInventory().getAllItems().reduce((acc, item) => item.type === itemdata.id && item.aux === itemdata.aux ? acc + item.count : acc, 0);
            gui.addInput(replacestr(lang.get("shop.input.sellcount"), { itemCount: itemCount }))
            player.sendForm(gui, (pl, data) => {
                if (data == null) {
                    lang.tell(info + lang.get("gui.exit"));
                    return
                }
                if (data[1] == "") {
                    var path1 = path.replace(/\./g, ' ').replace(/\[/g, ' [').trim().split(/\s+/);
                    var path2 = path1.slice(0, path1.length - 1)
                    if (path2.at(-1) == "data") path2.pop()
                    shopgroupgui(1, player, path2.reduce((acc, cur) => { if (cur.startsWith('[')) { return acc + cur; } else { return acc + (acc ? '.' : '') + cur; } }, ''), backpages[backpages.length - 1], backpages.slice(0, backpages.length - 1));
                    return
                }
                const quantity = data[1] == "all" ? itemCount : Number(data[1]);
                if (!isPositiveInteger(quantity) && quantity != 0) {
                    pl.tell(info + lang.get("shop.mustnum"));
                    return
                } else if (quantity == 0) {
                    pl.sendMessageForm(info, replacestr(lang.get("shop.sell.no"), { "info": info, "count": String(itemCount) }), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => {
                        shop.sell(type, pl, path, backpages)
                    })
                }
                const totalgive = quantity * itemdata.money;
                if (itemCount < quantity) {
                    pl.sendMessageForm(info, replacestr(lang.get("shop.sell.no"), { "info": "", "count": String(itemCount) }), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => {
                        shop.sell(type, pl, path, backpages)
                    })
                } else {
                    reductItembytype(pl, itemdata.id, quantity) && moneys.add(pl, totalgive)
                    pl.sendBetterModalForm(info, replacestr(lang.get("shop.sell.ok"), { "info": "", "item.name": data.name, "item.id": itemdata.id, "quantity": quantity, "totalCost": totalgive }), lang.get("gui.back"), lang.get("gui.cancel"), (pl, res) => {
                        if (res) {
                            shop.sell(type, pl, path, backpages)
                        } else return
                    }, config.get("logo")["gui.back"], config.get("logo")["gui.cancel"])
                    addlog(player, replacestr(lang.get("log.shop.sell"), { "item.name": _data.name, "item.id": itemdata.id, "quantity": quantity, "totalCost": totalgive }))
                }
            })
        } else {
            shopgroupgui(1, player, path, 0, backpages)
        }
    }
}
if (config.get("enable").shop) {
    const com = mc.newCommand(config.get("commands").shop, lang.get("command.shop.desc"), PermType.Any);
    com.setEnum("action", ["gui", "buy", "sell"]);
    com.optional("action", ParamType.Enum, "action", "action", 1);
    com.overload(["action"]);
    com.setCallback((_cmd, ori, out, res) => {
        if (ori.type !== 0) {
            out.error(lang.get("command.ori.typeerror"));
            return;
        }
        const player = ori.player;
        const action = res.action || "gui";
        switch (action) {
            case "gui":
                const shopGui = mc.newSimpleForm();
                shopGui.setTitle(info);
                shopGui.addButtons([
                    replacestr(lang.get("shop.buy.maintitle"), { info: "" }),
                    replacestr(lang.get("shop.sell.maintitle"), { info: "" }),
                    lang.get("gui.cancel")
                ], [
                    config.get("logo")["shop.buy"],
                    config.get("logo")["shop.sell"],
                    config.get("logo")["gui.cancel"]
                ])
                player.sendForm(shopGui, (pl, id) => {
                    if (id == null || id === 2) {
                        pl.tell(info + lang.get("gui.exit"));
                        return;
                    }
                    const menuType = id === 0 ? "Buy" : "Sell";
                    shopgroupgui(id, player, "shop.data." + menuType, 0, [])
                });
                break;
            case "buy":
                shopgroupgui(0, player, "shop.data.Buy", 0, [])
                break;
            case "sell":
                shopgroupgui(1, player, "shop.data.Sell", 0, [])
                break;
        }
    });
    com.setup();
}

//市场翻页功能,类似shopgroupgui
function marketitemsgui(player, title, items, page = 0, callback, backfunceval) {
    const ITEMS_PER_PAGE = config.get("itemsperpage"); // 每页显示的条目数
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageData = items.slice(startIndex, endIndex);
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const gui = mc.newSimpleForm()
    gui.setTitle(title)
    gui.setContent(replacestr(lang.get("gui.group.content"), { page: page + 1, totalPages: totalPages }));
    currentPageData.forEach(item => {
        var itemnbt = parseItemNbt(NBT.parseSNBT(item.itemnbt))
        var str = replacestr(lang.get("market.group.item"), { "item.name": item.name, "item.count": itemnbt.parsednbtobj.Count, "item.money": item.money, "money.name": moneys.conf.name })
        if (item.image != null && item.image != "") {
            gui.addButton(str, item.image)
        } else if (mc.newItem(NBT.parseSNBT(item.itemnbt)).type.includes("minecraft:")) {
            gui.addButton(str, imports.FinalTextures.getTextures(itemnbt.parsednbtobj.Name))
        } else {
            gui.addButton(str)
        }
    })
    if (page != 0) {
        gui.addButton(lang.get("gui.button.lastpage"), config.get("logo")["gui.lastpage"])
    }
    if (endIndex < items.length) {
        gui.addButton(lang.get("gui.button.nextpage"), config.get("logo")["gui.nextpage"])
    }
    gui.addButton("gui.back", config.get("logo")["gui.back"])
    player.sendForm(gui, (pl, id) => {
        if (id == null) {
            pl.tell(info2 + lang.get("gui.exit"));
            return;
        }
        const lastButtonIndex = currentPageData.length + (page > 0 ? 1 : 0) + (endIndex < items.length ? 1 : 0);
        if (id === lastButtonIndex) {
            eval(backfunceval)
            return
        }
        if (page > 0 && id === currentPageData.length) {
            // 上一页
            marketitemsgui(player, title, items, page - 1, callback, backfunceval)
            return
        } else if (endIndex < items.length && id === currentPageData.length + (page > 0 ? 1 : 0)) {
            // 下一页
            marketitemsgui(player, title, items, page + 1, callback, backfunceval)
            return
        } else {
            const selectedData = items[startIndex + id];
            callback(pl, selectedData, [
                backfunceval,
                title,
                items,
                page
            ])
            return
        }
    })
}
//清除不存在的数据
function clearNonexistentDataAndAddnew(mode, items) {
    var md = market.data
    for (let i = 0; i < items.length; i++) {
        if (getIndexInArray(md, items[i]) == -1) {
            items.splice(i, 1)
        }
    }
    if (mode == 1) {
        for (let i = 0; i < md.length; i++) {
            if (getIndexInArray(items, md[i]) == -1) {
                md.push(md[i])
            }
        }
    }
    return items
}
const market = {
    data: [],
    loaddata() {
        market.data = JSON.parse(marketdatajson.read()).data
    },
    buy_sell_item(player, item, backargs) {
        const gui = mc.newSimpleForm()
        gui.setTitle(replacestr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }))
        const itemdata = mc.newItem(NBT.parseSNBT(item.itemnbt))
        if (item.content) {
            gui.setContent(item.content)
        } else {
            gui.setContent(replacestr(lang.get("market.buy_sell_item.content"), {
                "item.name": item.name,
                "itemdata.type": itemdata.type,
                "itemdata.count": itemdata.count,
                "itemdata.aux": itemdata.aux,
                "item.money": item.money,
                "avgmoney": `${(item.money / itemdata.count).toFixed(2)}(${(item.money / itemdata.count)})`,
                "money.name": moneys.conf.name,
                "item.time": item.time,
                "item.player": item.player
            }))
        }
        if (item.type == "sell") {
            gui.addButton(lang.get("market.buy_sell_item.button.buy"), config.get("logo")["market.buy_sell_item.buy"])
        } else {
            gui.addButton(lang.get("market.buy_sell_item.button.sell"), config.get("logo")["market.buy_sell_item.sell"])
        }
        gui.addButton(lang.get("gui.back"), config.get("logo")["gui.back"])
        player.sendForm(gui, (pl, id) => {
            if (getIndexInArray(market.data, item) == -1)
                pl.sendMessageForm(
                    info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.get("logo")["gui.back"],
                    (pl) => {
                        marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return
                    })
            if (id == null) {
                marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return
            }
            if (id == 0) {
                if (item.type == "sell") {
                    const gui = mc.newCustomForm()
                    gui.setTitle(replacestr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }))
                    if (item.bypartial != 1) {
                        gui.addLabel(lang.get("market.buy_sell_item.buy.cantbypartial"))
                        gui.addLabel(replacestr(lang.get("market.buy_sell_item.buy.count"), { "count": itemdata.count }))
                    } else {
                        if (itemdata.count == 1) gui.addLabel(replacestr(lang.get("market.buy_sell_item.buy.count"), { "count": itemdata.count }))
                        else gui.addSlider(lang.get("market.buy_sell_item.slider.count"), 0, itemdata.count, 1, itemdata.count)
                    }
                    pl.sendForm(gui, (pl, datas) => {
                        if (getIndexInArray(market.data, item) == -1) pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return })
                        if (datas == null || datas[0] == 0) {
                            market.buy_sell_item(pl, item, backargs)
                        } else {
                            const count = datas[0] || itemdata.count
                            let beforemoney
                            if (count != itemdata.count) beforemoney = count * ((item.money / itemdata.count).toFixed(2))
                            else beforemoney = item.money
                            const totalCost = moneys.calculatePayment(beforemoney)
                            if (moneys.get(pl) < totalCost) {
                                pl.sendBetterModalForm(
                                    replacestr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }),
                                    replacestr(lang.get("market.buy_sell_item.buy.nomoney"), { "totalCost": totalCost, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }),
                                    lang.get("gui.back"), lang.get("gui.cancel"),
                                    (pl, res) => {
                                        if (res == true) {
                                            market.buy_sell_item(pl, item, backargs)
                                        } else pl.tell(info2 + lang.get("gui.exit"))
                                    },
                                    config.get("logo")["gui.confirm"], config.get("logo")["gui.back"]
                                )
                            } else {
                                pl.sendBetterModalForm(
                                    replacestr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }),
                                    replacestr(lang.get("market.buy_sell_item.buy.confirm"), { "totalCost": totalCost, "money.name": moneys.conf.name }),
                                    lang.get("gui.confirm"), lang.get("gui.back"),
                                    (pl, res) => {
                                        if (getIndexInArray(market.data, item) == -1) pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return })
                                        if (res) {
                                            var md = market.data
                                            var i = getIndexInArray(md, item)
                                            if (count != itemdata.count) {
                                                var itemd = md[i]
                                                if (itemd.money - totalCost <= 0) {
                                                    itemd.money = 1
                                                } else itemd.money -= totalCost
                                                itemd.itemnbt = itemdata.getNbt().setByte("Count", itemdata.count - count).toSNBT()
                                                md[i].content = getItemContent(md[i], config.get("lang"))
                                            } else {
                                                md.splice(i, 1)
                                            }
                                            marketdatajson.set("data", md)
                                            market.loaddata()
                                            let plns = mc.getOnlinePlayers().map(p => p.realName)
                                            if (plns.includes(item.player)) {
                                                const player = mc.getPlayer(item.player)
                                                player.tell(replacestr(lang.get("market.buy_sell_item.player.buy.success"), { "item.name": item.name, "totalCost": totalCost, "money.name": moneys.conf.name }))
                                                moneys.add(player, totalCost)
                                            } else setgives(item.player, 0, { "name": item.name, "money": totalCost })
                                            moneys.reduce(pl, totalCost)
                                            pl.giveItem(itemdata, count)
                                            pl.refreshItems()
                                            pl.sendMessageForm(info2, lang.get("market.buy_sell_item.buy.success"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return }, (pl) => pl.tell(info2 + lang.get("gui.exit")))
                                            addlog(pl, replacestr(lang.get("log.market.buy"), { "item.name": item.name, "count": count, "item.time": item.time, "item.player": item.player, "totalCost": totalCost }))
                                        } else {
                                            market.buy_sell_item(pl, item, backargs)
                                        }
                                    },
                                    config.get("logo")["gui.confirm"], config.get("logo")["gui.back"]
                                )
                            }
                        }
                    })
                } else {
                    const gui = mc.newCustomForm()
                    gui.setTitle(replacestr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }))
                    var items = player.getInventory().getAllItems()
                    var havecount = getSameItemCount(items, itemdata)
                    if (havecount <= itemdata.count) {
                        pl.sendMessageForm(
                            replacestr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }),
                            lang.get("market.buy_sell_item.noitem"),
                            lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => {
                                market.buy_sell_item(pl, item, backargs)
                            }, (pl) => {
                                market.buy_sell_item(pl, item, backargs)
                            })
                    } else {
                        function sel() {
                            let sellcount
                            if (item.bypartial != 1) {
                                sellcount = itemdata.count
                                then()
                            } else {
                                const gui = mc.newCustomForm()
                                gui.setTitle(replacestr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }))
                                gui.addSlider(lang.get("market.buy_sell_item.slider.count"), 0, itemdata.count, 1, itemdata.count)
                                pl.sendForm(gui, (pl, datas) => {
                                    if (getIndexInArray(market.data, item) == -1) { pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0])); return }
                                    if (datas == null || datas[0] == null || datas[0] == 0) {
                                        market.buy_sell_item(pl, item, backargs)
                                    } else if (datas[0]) {
                                        sellcount = Number(datas[0])
                                        then()
                                    }
                                })
                            }
                            function then() {
                                const totalcosts = sellcount == itemdata.count ? item.money : moneys.calculatePayment((item.money / itemdata.count) * sellcount)
                                pl.sendBetterModalForm(replacestr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }),
                                    replacestr(lang.get("market.buy_sell_item.sell.confirm"), { "totalCost": totalcosts, "money.name": moneys.conf.name }) + (item.bypartial == 1 ? "" : "\n" + lang.get("market.buy_sell_item.sell.cantbypartial")),
                                    lang.get("gui.confirm"), lang.get("gui.cancel"),
                                    (pl, res) => {
                                        if (res) {
                                            if (getIndexInArray(market.data, item) == -1) pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return })
                                            const reduceditems = reductItembysnbt(pl, item.itemnbt, sellcount)
                                            if (reduceditems != false) {
                                                let plns = mc.getOnlinePlayers().map(p => p.realName)
                                                if (plns.includes(item.player)) {
                                                    const player = mc.getPlayer(item.player)
                                                    player.tell(replacestr(lang.get("market.buy_sell_item.player.sell.success"), { "item.name": item.name }))
                                                    let its = []
                                                    for (let i = 0; i < reduceditems.length; i++)  its.push(mc.newItem(NBT.parseSNBT(reduceditems[i])))
                                                    player.giveItems(its, [])
                                                } else setgives(item.player, 1, reduceditems)
                                                const md = market.data
                                                const i = getIndexInArray(md, item)
                                                if (totalcosts == item.money) {
                                                    md.splice(i, 1)
                                                } else {
                                                    md[i].money -= totalcosts
                                                    md[i].itemnbt = itemdata.getNbt().setByte("Count", itemdata.count - sellcount).toSNBT()
                                                    md[i].content = getItemContent(md[i], config.get("lang"))
                                                }
                                                marketdatajson.set("data", md)
                                                market.loaddata()
                                                moneys.add(pl, totalcosts)
                                                addlog(pl, replacestr(lang.get("log.market.sell"), {
                                                    "item.name": item.name, "count": sellcount, "item.time": item.time, "item.player": item.player, "totalCost": totalcosts, "money.name": moneys.conf.name
                                                }))
                                                pl.sendMessageForm(info2, lang.get("market.buy_sell_item.sell.success"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return }, (pl) => pl.tell(info2 + lang.get("gui.exit")))
                                            } else {
                                                pl.tell(lang.get("item.try.reduce.fail"))
                                                logger.error(lang.get("item.try.reduce.fail"))
                                            }
                                        } else {
                                            if (item.bypartial != 1) {
                                                market.buy_sell_item(pl, item, backargs)
                                            } else {
                                                sel()
                                            }
                                        }
                                    }, config.get("logo")["gui.confirm"], config.get("logo")["gui.cancel"])
                            }
                        }
                        sel()
                    }
                }
            } else if (id == 1) {
                if (getIndexInArray(market.data, item) == -1) pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return })
                marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0])
            }
        })
    },
    /**
     * 主界面
     * @param {Player} player 玩家
     */
    main(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(info2 + lang.get("market.title"))
        gui.addButton(lang.get("market.button.buy_sell"), config.get("logo")["market.buy_sell"])
        gui.addButton(lang.get("market.button.ctrl"), config.get("logo")["market.ctrl"])
        gui.addButton(lang.get("gui.cancel"), config.get("logo")["gui.cancel"])
        player.sendForm(gui, (pl, id) => {
            if (id == null || id === 2) {
                pl.tell(info2 + lang.get("gui.exit"));
                return;
            }
            if (id === 0) {
                market.buy_sell(pl)
            } else if (id === 1) {
                market.ctrl(pl)
            }
        })
    },
    /**
     * 购买和出售界面
     * @param {Player} player 玩家 
     */
    buy_sell(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(replacestr(lang.get("market.buy_sell.maintitle"), { "info": info2 }))
        gui.addButton(lang.get("market.buy_sell.button.list"), config.get("logo")["market.buy_sell.list"])
        gui.addButton(lang.get("market.buy_sell.button.search.normal"), config.get("logo")["market.buy_sell.search.normal"])
        gui.addButton(lang.get("market.buy_sell.button.search.better"), config.get("logo")["market.buy_sell.search.better"])
        gui.addButton(lang.get("gui.cancel"), config.get("logo")["gui.cancel"])
        player.sendForm(gui, (pl, id) => {
            if (id == null) {
                pl.tell(info2 + lang.get("gui.exit"));
                return;
            }
            if (id === 3) {
                market.main(pl)
                return;
            }
            switch (id) {
                case 0:
                    marketitemsgui(pl, replacestr(lang.get("market.buy_sell.list.title"), { "info": info2 }), market.data, 0, market.buy_sell_item, "market.buy_sell(pl)")
                    break;
                case 1:
                    market.search_normal(pl)
                    break;
                case 2:
                    market.search_better(pl)
                    break;
            }
        })
    },
    /**
     * 普通搜索界面
     * @param {Player} player 玩家
     */
    search_normal(player) {
        const gui = mc.newCustomForm()
        gui.setTitle(replacestr(lang.get("market.search.normal.maintitle"), { "info": info2 }))
        gui.addInput(lang.get("market.buy_sell.search.normal.input"))
        player.sendForm(gui, (pl, datas) => {
            if (datas == null) {
                pl.tell(info2 + lang.get("gui.exit"))
                return;
            }
            if (datas[0] == "") {
                market.buy_sell(pl)
                return;
            }
            //筛选出符合名称的物品
            const items = market.data.filter(item => item.name.includes(datas[0]))
            if (items.length == 0) {
                pl.sendMessageForm(info2, lang.get("market.search.normal.noitem"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.search_normal(pl) })
                return;
            }
            marketitemsgui(pl, replacestr(replacestr(lang.get("market.search.normal.title"), { "info": info2, "keyword": datas[0] })), items, 0, market.buy_sell_item, "market.search_normal(pl)")
        })
    },
    /**
     * 精准搜索界面
     * @param {Player} player 玩家
     */
    search_better(player) {
        const gui = mc.newCustomForm()
        gui.setTitle(replacestr(lang.get("market.search.better.maintitle"), { "info": info2 }))
        gui.addInput(lang.get("market.search.betterinput"))
        //搜索方式
        gui.addDropdown(lang.get("market.search.bettersearch.dropdown"), [
            lang.get("market.search.bettersearch.dropdown.name"),
            lang.get("market.search.bettersearch.dropdown.type"),
            lang.get("market.search.bettersearch.dropdown.player")

        ], 0)
        //排序方式
        gui.addDropdown(lang.get("market.search.bettersort.dropdown"), [
            lang.get("market.search.bettersort.dropdown.nosort"),
            lang.get("market.search.bettersort.dropdown.up"),
            lang.get("market.search.bettersort.dropdown.down"),
            lang.get("market.search.bettersort.dropdown.money.up"),
            lang.get("market.search.bettersort.dropdown.money.down")
        ], 0)
        //是否允许部分购买?
        gui.addDropdown(lang.get("market.search.betterbypartial.dropdown"), [
            lang.get("market.search.betterbypartial.dropdown.all"),
            lang.get("market.search.betterbypartial.dropdown.yes"),
            lang.get("market.search.betterbypartial.dropdown.no")
        ], 0)
        player.sendForm(gui, (pl, datas) => {
            if (datas == null) {
                pl.tell(info2 + lang.get("gui.exit"))
                return;
            }
            if (datas[0] == "") {
                market.buy_sell(pl)
                return
            }
            var items
            switch (Number(datas[1])) {
                case 0:
                    items = market.data.filter(item => item.name.includes(datas[0]))
                    break;
                case 1:
                    items = market.data.filter(item => mc.newItem(NBT.parseSNBT(item.itemnbt)).type.includes(datas[0]))
                    break;
                case 2:
                    items = market.data.filter(item => item.player.includes(datas[0]))
                    break;
            }
            //排序
            switch (Number(datas[2])) {
                case 1:
                    items.sort((a, b) => {
                        return b.name.localeCompare(a.name)
                    })
                    break
                case 2:
                    items.sort((a, b) => {
                        return a.name.localeCompare(b.name)
                    })
                    break
                case 3:
                    items.sort((a, b) => {
                        return a.money - b.money
                    })
                    break
                case 4:
                    items.sort((a, b) => {
                        return b.money - a.money
                    })
                    break
            }
            switch (Number(datas[3])) {
                case 1:
                    items = items.filter(item => item.bypartial == 1)
                    break;
                case 2:
                    items = items.filter(item => item.bypartial != 1)
                    break;
            }
            if (items.length == 0) {
                pl.sendMessageForm(info2, lang.get("market.search.better.noitem"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.search_better(pl) })
                return;
            } else {
                marketitemsgui(pl, replacestr(replacestr(lang.get("market.search.better.title"), { "info": info2, "keyword": datas[0] }), { "count": items.length }), items, 0, market.buy_sell_item, "market.search_better(pl)")
            }
        })
    },
    ctrl(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(replacestr(lang.get("market.ctrl.maintitle"), { "info": info2 }))
        gui.addButton(lang.get("market.ctrl.button.add"), config.get("logo")["market.add"])
        gui.addButton(lang.get("market.ctrl.button.edit"), config.get("logo")["market.ctrl.edit"])
        gui.addButton(lang.get("gui.back"), config.get("logo")["gui.back"])
        player.sendForm(gui, (pl, id) => {
            if (id == null) {
                pl.tell(info2 + lang.get("gui.exit"));
                return;
            }
            if (id === 2) {
                market.main(pl)
            } else switch (id) {
                case 0:
                    market.additem(pl)
                    break;
                case 1:
                    market.edit(pl)
                    break;
            }
        })
    },
    additem(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(replacestr(lang.get("market.add.maintitle"), { "info": info2 }))
        gui.addButton(lang.get("market.add.button.byitemtype"), config.get("logo")["market.add.byitemtype"])
        gui.addButton(lang.get("market.add.button.byhaveitem"), config.get("logo")["market.add.byhaveitem"])
        gui.addButton(lang.get("market.add.button.byhand"), config.get("logo")["market.add.byhand"])
        gui.addButton(lang.get("gui.cancel"), config.get("logo")["gui.cancel"])
        player.sendForm(gui, (pl, id) => {
            if (id == null) {
                pl.tell(info2 + lang.get("gui.exit"));
                return;
            }
            if (id === 3) {
                market.ctrl(pl)
            } else if (id === 0) {
                market.additembytype(pl)
            } else if (id == 1) {
                market.additembyhaveitem(pl)
            } else if (id == 2) {
                market.additembyhand(pl)
            }
        })
    },
    additembytype(player) {
        player.sendBetterModalForm(
            replacestr(lang.get("market.add.byitemtype.confirm.title"), { info: info2 }),
            lang.get("market.add.byitemtype.confirm.desc"),
            lang.get("gui.confirm"),
            lang.get("gui.cancel"),
            (pl, res) => {
                if (res) {
                    const gui = mc.newCustomForm()
                    gui.setTitle(replacestr(lang.get("market.add.byitemtype.title"), { "info": info2 }))
                    gui.addInput(lang.get("market.add.byitemtype.input.type"))
                    gui.addInput(lang.get("market.add.byitemtype.input.aux"))
                    gui.addInput(lang.get("market.add.byitemtype.input.count"))
                    gui.addSwitch(lang.get("market.add.byitemtype.switch.bypartial.sell"), true)
                    gui.addInput(lang.get("market.add.byitemtype.input.money"))
                    pl.sendForm(gui, (pl, datas) => {
                        if (datas == null || (datas[0] == "" && datas[1] == "" && datas[2] == "" && datas[4] == "")) {
                            market.ctrl(pl)
                            return;
                        } else {
                            function sendMessage(msg) {
                                pl.sendMessageForm(info2, msg, lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.additem(pl) }, (pl) => market.ctrl(pl))
                            }
                            if (!/^[a-zA-Z0-9_]+:[a-zA-Z0-9_]+$/.test(datas[0])) {
                                sendMessage(lang.get("market.add.byitemtype.input.type.error"))
                                return;
                            }
                            if (isNaN(Number(datas[1])) || !Number.isInteger(Number(datas[1]))) {
                                sendMessage(lang.get("market.add.byitemtype.input.aux.error"))
                                return;
                            }
                            if (isNaN(Number(datas[2])) || !isPositiveInteger(Number(datas[2]))) {
                                sendMessage(lang.get("market.add.byitemtype.input.count.error"))
                                return;
                            }
                            if (isNaN(Number(datas[4])) || !isPositiveInteger(Number(datas[4]))) {
                                sendMessage(lang.get("market.add.byitemtype.input.money.error"))
                                return;
                            }
                            const item = mc.newItem(datas[0], Number(datas[2]))
                            item.setAux(Number(datas[1]))
                            if (item.isNull()) {
                                pl.sendMessageForm(info2, lang.get("market.add.byitemtype.input.type.error"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.additem(pl) })
                                return;
                            }
                            const itemnbt = item.getNbt().toSNBT()
                            const bypartial = Number(datas[3])
                            const money = Number(datas[4])
                            var d = {
                                name: lang.get("market.add.item.prefix.buy") + item.getTranslateName(config.get("lang")),
                                itemnbt: itemnbt,
                                player: pl.realName,
                                bypartial: bypartial,
                                money: money,
                                type: "buy",
                                time: system.getTimeStr()
                            }
                            d.content = getItemContent(d)
                            pl.sendBetterModalForm(info2, d.content, lang.get("gui.confirm"), lang.get("gui.cancel"), (pl, res) => {
                                if (res) {
                                    if (moneys.get(pl) < money) pl.sendMessageForm(info2, replacestr(lang.get("market.add.notenough.money"), { "totalCost": money, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.additem(pl) })
                                    else if (moneys.reduce(pl, money)) {
                                        var md = market.data
                                        md.push(d)
                                        marketdatajson.set("data", md)
                                        market.loaddata()
                                        pl.sendMessageForm(info2, lang.get("market.add.success"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.ctrl(pl) })
                                    }
                                } else market.additem(pl)
                            }, config.get("logo")["gui.confirm"], config.get("logo")["gui.cancel"])
                        }
                    })
                } else {
                    market.additem(pl)
                }
            }, config.get("logo")["gui.confirm"], config.get("logo")["gui.back"]
        )
    },
    additembyhaveitem(player) {
        const gui = mc.newCustomForm()
        const pli = player.getInventory()
        const haveitems = pli.getAllItems()
        const items = haveitems.filter(item => !item.isNull())
        gui.setTitle(replacestr(lang.get("market.add.byhaveitem.title"), { "info": info2 }))
        gui.addDropdown(lang.get("market.add.byhaveitem.dropdown.item"), items.map(item => item.getTranslateName(config.get("lang"))), 0)
        player.sendForm(gui, (pl, datas) => {
            if (datas == null) {
                market.ctrl(pl)
                return;
            } else {
                const item = items[datas[0]]
                const gui = mc.newCustomForm()
                gui.setTitle(replacestr(lang.get("market.add.byhaveitem.title"), { "info": info2 }))
                gui.addSwitch(lang.get("market.add.byhaveitem.switch.mode"), true)
                gui.addSwitch(lang.get("market.add.byhaveitem.switch.bypartial"), true)
                gui.addSlider(lang.get("market.add.byhaveitem.slider.count"), 0, item.count, 1, item.count)
                gui.addInput(lang.get("market.add.byhaveitem.input.money"))
                pl.sendForm(gui, (pl, datas1) => {
                    if (datas1 == null || datas1[3] == "" || datas1[2] == 0) {
                        market.ctrl(pl)
                        return;
                    } else {
                        const count = datas1[2]
                        const itemnbt = item.getNbt().setByte("Count", count).toSNBT()
                        const bypartial = datas1[1]
                        const mode = datas1[0]
                        const money = Number(datas1[3])
                        var d = {
                            name: (mode ? lang.get("market.add.item.prefix.sell") : lang.get("market.add.item.prefix.buy")) + item.getTranslateName(config.get("lang")),
                            itemnbt: itemnbt,
                            player: pl.realName,
                            bypartial: bypartial,
                            money: money,
                            type: mode ? "sell" : "buy",
                            time: system.getTimeStr()
                        }
                        d.content = getItemContent(d, config.get("lang"))
                        pl.sendBetterModalForm(info2, d.content, lang.get("gui.confirm"), lang.get("gui.cancel"), (pl, res) => {
                            if (res) {
                                function then() {
                                    var md = market.data
                                    md.push(d)
                                    marketdatajson.set("data", md)
                                    market.loaddata()
                                    pl.sendMessageForm(info2, lang.get("market.add.success"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.ctrl(pl) })
                                }
                                if (mode == false) {
                                    if (moneys.get(pl) < money) pl.sendMessageForm(info2, replacestr(lang.get("market.add.notenough.money"), { "totalCost": money, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.additem(pl) })
                                    else if (moneys.reduce(pl, money))
                                        then()
                                    else market.additem(pl)
                                } else if (mode == true) {
                                    const red = reductItembysnbt(pl, itemnbt, count)
                                    if (red != false && red.length != 0)
                                        then()
                                    else market.additem(pl)
                                }
                            } else market.additem(pl)
                        }, config.get("logo")["gui.confirm"], config.get("logo")["gui.cancel"])
                    }
                })
            }
        })
    },
    additembyhand(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(replacestr(lang.get("market.add.byhand.title"), { "info": info2 }))
        gui.addButton(lang.get("market.add.byhand.mainhand"), config.get("logo")["market.add.byhand.mainhand"])
        gui.addButton(lang.get("market.add.byhand.offhand"), config.get("logo")["market.add.byhand.offhand"])
        gui.addButton(lang.get("gui.cancel"), config.get("logo")["gui.cancel"])
        player.sendForm(gui, (pl, id) => {
            if (id == null) {
                pl.tell(info2 + lang.get("gui.exit"))
                return;
            }
            if (id === 2) {
                market.ctrl(pl)
            } else {
                let item
                if (id == 0) {
                    item = pl.getHand()
                } else item = pl.getOffHand()
                if (item.isNull()) {
                    pl.sendMessage(lang.get("market.add.byhand.empty"))
                    market.additem(pl)
                    return;
                } else {
                    const gui = mc.newCustomForm()
                    gui.setTitle(replacestr(lang.get("market.add.byhand.title"), { "info": info2 }))
                    gui.addSwitch(lang.get("market.add.byhand.switch.mode"), true)
                    gui.addSwitch(lang.get("market.add.byhand.switch.bypartial"), true)
                    gui.addSlider(lang.get("market.add.byhand.slider.count"), 0, item.count, 1, item.count)
                    gui.addInput(lang.get("market.add.byhand.input.money"))
                    pl.sendForm(gui, (pl, datas) => {
                        if (datas == null || datas[2] == 0 || datas[3] == "" || datas[3] == null) {
                            market.ctrl(pl)
                            return;
                        } else {
                            const count = datas[2]
                            const itemnbt = item.getNbt().setByte("Count", count).toSNBT()
                            const bypartial = datas[1]
                            const mode = datas[0]
                            const money = Number(datas[3])
                            var d = {
                                name: (mode ? lang.get("market.add.item.prefix.sell") : lang.get("market.add.item.prefix.buy")) + item.getTranslateName(config.get("lang")),
                                itemnbt: itemnbt,
                                player: pl.realName,
                                bypartial: bypartial,
                                money: money,
                                type: mode ? "sell" : "buy",
                                time: system.getTimeStr()
                            }
                            d.content = getItemContent(d, config.get("lang"))
                            pl.sendBetterModalForm(info2, d.content, lang.get("gui.confirm"), lang.get("gui.cancel"), (pl, res) => {
                                if (res) {
                                    function then() {
                                        var md = market.data
                                        md.push(d)
                                        marketdatajson.set("data", md)
                                        market.loaddata()
                                        pl.sendMessageForm(info2, lang.get("market.add.success"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.ctrl(pl) })
                                    }
                                    if (mode == false) {
                                        if (moneys.get(pl) < money) pl.sendMessageForm(info2, replacestr(lang.get("market.add.notenough.money"), { "totalCost": money, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.additem(pl) })
                                        else if (moneys.reduce(pl, money))
                                            then()
                                    } else if (mode == true) {
                                        const red = reductItembysnbt(pl, itemnbt, count)
                                        if (red != false && red.length != 0)
                                            then()
                                        else market.additem(pl)
                                    }
                                } else market.additem(pl)
                            }, config.get("logo")["gui.confirm"], config.get("logo")["gui.cancel"])
                        }
                    })
                }
            }
        })
    },
    edit(player) {
        if (player.isOP()) {
            const gui = mc.newSimpleForm()
            gui.setTitle(replacestr(lang.get("market.edit.title"), { "info": info2 }))
            gui.addButtons([
                lang.get("market.edit.button.self"),
                lang.get("market.edit.button.all"),
                lang.get("gui.cancel")
            ], [
                config.get("logo")["market.edit.button.self"],
                config.get("logo")["market.edit.button.all"],
                config.get("logo")["gui.cancel"]
            ])
            player.sendForm(gui, (pl, id) => {
                if (id == null) {
                    pl.tell(info2 + lang.get("gui.exit"))
                    return;
                }
                var items = []
                if (id === 2) {
                    market.ctrl(pl)
                    return;
                } else if (id === 0) {
                    items = market.data.filter(item => item.player == pl.realName)
                } else if (id === 1) {
                    items = market.data
                }
                market.edititem(pl, items)
            })
        }
    },
    edititem(player, items) {
        if (items.length == 0) {
            player.sendMessageForm(info2 + lang.get("market.edit.title"), lang.get("market.edit.noitem"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.ctrl(pl) })
        } else {
            marketitemsgui(player, replacestr(lang.get("market.edit.title"), { "info": info2 }), items, 0, market.edit_item, "market.edit(pl)")
        }
    },
    edit_item(pl, item, backargs) {
        const gui = mc.newCustomForm()
        gui.setTitle(replacestr(lang.get("market.edit.title"), { "info": info2 }))
        gui.addSwitch(lang.get("market.edit.switch.mode"), item.type == "sell")
        gui.addSwitch(lang.get("market.edit.switch.bypartial"), item.bypartial)
        gui.addInput(lang.get("market.edit.input.money"), "", String(item.money))
        gui.addSwitch(lang.get("market.edit.switch.delete"), false)
        pl.sendForm(gui, (pl, datas) => {
            if (datas == null) {
                marketitemsgui(pl, backargs[1], backargs[2], backargs[3], market.edit_item, backargs[4])
                return;
            } else {
                const mode = datas[0]
                const bypartial = datas[1]
                const money = Number(datas[2])
                const deleteitem = datas[3]
                if (deleteitem) {
                    market.delitem(pl, item)
                    return;
                } else {
                    var d = JSON.parse(JSON.stringify(item))
                    item.name = (mode ? lang.get("market.add.item.prefix.sell") : lang.get("market.add.item.prefix.buy")) + mc.newItem(NBT.parseSNBT(item.itemnbt)).getTranslateName(config.get("lang"))
                    item.type = mode ? "sell" : "buy"
                    item.bypartial = bypartial
                    item.money = money
                    item.content = getItemContent(item, config.get("lang"))
                    pl.sendBetterModalForm(info2, item.content, lang.get("gui.confirm"), lang.get("gui.cancel"), (pl, res) => {
                        if (res) {
                            function then() {
                                var md = market.data
                                md.push(item)
                                marketdatajson.set("data", md)
                                market.loaddata()
                                pl.sendMessageForm(info2, lang.get("market.edit.success"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.edit(pl) })
                            }
                            var dmoney = item.money - d.money
                            if (item.type == d.type) {
                                if (item.money != d.money) {
                                    if (dmoney > 0) {
                                        if (dmoney > moneys.get(pl)) {
                                            pl.sendMessageForm(info2, replacestr(lang.get("market.edit.notenough.money"), { "totalCost": dmoney, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.edit(pl) })
                                            return;
                                        } else if (moneys.reduce(pl, dmoney))
                                            then()
                                        else market.edit(pl)
                                    } else if (dmoney < 0) {
                                        moneys.add(pl, Math.abs(dmoney))
                                        then()
                                    }
                                } else {
                                    then()
                                }
                            } else {
                                if (item.type == "sell") {
                                    pl.sendMessageForm(info2, lang.get("market.edit.error.type"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.edit(pl) })
                                    return;
                                } else {
                                    if (moneys.get(pl) < item.money) {
                                        pl.sendMessageForm(info2, replacestr(lang.get("market.edit.notenough.money"), { "totalCost": item.money, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.edit(pl) })
                                        return;
                                    } else {
                                        pl.giveItem(mc.newItem(NBT.parseSNBT(item.itemnbt)))
                                        pl.refreshItems()
                                        moneys.reduce(pl, item.money)
                                        then()
                                    }
                                }
                            }
                        } else market.edit(pl)
                    }, config.get("logo")["gui.confirm"], config.get("logo")["gui.cancel"])
                }
            }
        })
    },
    delitem(player, item) {
        player.sendBetterModalForm(info2, lang.get("market.del.confirm"), lang.get("gui.confirm"), lang.get("gui.cancel"), (pl, res) => {
            if (res) {
                if (item.type == "sell") {
                    pl.giveItem(mc.newItem(NBT.parseSNBT(item.itemnbt)))
                    pl.refreshItems()
                } else moneys.add(pl, item.money)
                var md = market.data
                md.splice(getIndexInArray(market.data, item), 1)
                marketdatajson.set("data", md)
                market.loaddata()
                player.sendMessageForm(info2, lang.get("market.del.success"), lang.get("gui.back"), config.get("logo")["gui.back"], (pl) => { market.edit(pl) })
            } else market.edit(pl)
        }, config.get("logo")["gui.confirm"], config.get("logo")["gui.cancel"])
    }
}
if (config.get('enable').market) {
    const com = mc.newCommand(config.get("commands").market, lang.get("command.market.desc"), PermType.Any);
    com.setEnum("type", ["buy_sell", "buy_sell_list", "buy_sell_search_normal", "buy_sell_search_better", "ctrl", "add", "edit", "del", "gui", "reload"])
    com.optional("args", ParamType.Enum, "type", "args", 1)
    com.setCallback((_cmd, ori, out, res) => {
        if (ori.type !== 0) {
            out.error(lang.get("command.ori.typeerror"));
            return;
        }
        const pl = ori.player
        switch (res.args) {
            case "buy_sell":
                market.buy_sell(pl)
                break;
            case "buy_sell_list":
                marketitemsgui(pl, replacestr(lang.get("market.buy_sell.list.title"), { "info": info2 }), market.data, 0, market.buy_sell_item, "market.buy_sell(pl)")
                break;
            case "buy_sell_search_normal":
                market.buy_sell_search_normal(pl)
                break;
            case "buy_sell_search_better":
                market.buy_sell_search_better(pl)
                break;
            case "add":
                market.additem(pl)
                break;
            case "edit":
                market.edit(pl)
                break;
            case "del":
                market.del(pl)
            case "ctrl":
                market.ctrl(pl)
                break;
            case "gui":
                market.main(pl)
                break;
            case "reload":
                market.loaddata()
                out.success(lang.get("command.market.reload.success"))
                break;
            default:
                market.main(pl)
                break
        }
    })
    com.overload([])
    com.overload(["args"])
    com.setup()
}
const cmd = mc.newCommand("pshop", lang.get("command.pshop.desc"), PermType.GameMasters)
cmd.setEnum("types", ["reload", "version"])
cmd.optional("args", ParamType.Enum, "types", "args", 1)
cmd.setCallback((_cmd, ori, out, res) => {
    switch (res.args) {
        case "reload":
            if (ori.type != 0 || ori.player.isOP()) {
                try {
                    loadlangs()
                    consts.loaddata()
                    market.loaddata()
                    shop.loaddata()
                    out.success(lang.get("command.pshop.reload.success"))
                } catch (e) {
                    out.error(e)
                    logger.error(e)
                }
            } else {
                out.error(lang.get("command.pshop.noperm"))
            }
            break;
        case "version":
            out.success(replacestr(lang.get("command.pshop.version"), { "version": versions, "fix": fix, "author": author }))
            break;
    }
})
cmd.overload([])
cmd.overload(["types"])
cmd.setup()
mc.listen("onServerStarted", () => {
    loadlangs()
    loadconstsmap()
    market.loaddata()
    shop.loaddata()
})
mc.listen("onJoin", (pl) => {
    if (gives.get(pl.realName) != pl.realName) {
        if ((gives.get(pl.realName).money.length != 0) && (gives.get(pl.realName).money != null)) {
            for (let i = 0; i < gives.get(pl.realName).money.length; i++) {
                moneys.add(pl, gives.get(pl.realName).money[i].money)
                var gd = gives.get(pl.realName)
                pl.tell(replacestr(lang.get("market.buy_sell_item.player.buy.success"), { "money.name": moneys.conf.name, "totalCost": gives.get(pl.realName).money[i].money, "item.name": gives.get(pl.realName).money[i].name }))
                gd.money.splice(i, 1)
                gives.set(pl.realName, gd)
            }
        }
        if ((gives.get(pl.realName).item.length != 0) && (gives.get(pl.realName).item != null)) {
            for (let i = 0; i < gives.get(pl.realName).item.length; i++) {
                var item = mc.newItem(NBT.parseSNBT(gives.get(pl.realName).item[i]))
                pl.giveItem(item)
                pl.refreshItems()
                var gd = gives.get(pl.realName)
                pl.tell(replacestr(lang.get("market.buy_sell_item.player.sell.success"), { "item.name": item.name }))
                gd.item.splice(i, 1)
                gives.set(pl.realName, gd)
            }
        }
    }
})
mc.listen("onServerStarted", () => {
    log(`PShop 商店系统插件---加载成功,当前版本:${versions}${fix} 作者: ${author}`);
    if (fix != "" && fix != " Release") logger.warn("你现在使用的版本为开发版,请勿用于生产环境!!!")
})
mc.regConsoleCmd("d", "debug", (args) => {
    eval(args.join(""))
})
mc.regPlayerCmd("d", "debug", (player, args) => {
    player.tell(JSON.stringify(eval(args.join(''))) || "canttojson")
    player.tell(String(eval(args.join(''))) || "canttostr")
})
var var1, var2 = null
mc.regPlayerCmd("dd", "debug", (player, args) => {
    var1 = eval(args[0])
})
mc.regPlayerCmd("ddd", "debug", (player, args) => {
    var2 = eval(args[0])
})