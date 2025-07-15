/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
const { versions, fix, author, path, addlog, info, info2, } = require("./consts.js");
const { imports, moneys, isPositiveInteger, same, replacestr, parseItemNbt, parseallitems, reductItembysnbt, reductItembytype } = require("./lib.js");
//释放语言文件
const lang = new JsonConfigFile(path + "lang.json", JSON.stringify({
    "money.error": "经济系统配置错误!",
    "money.error.pl": "经济系统配置错误!请上报服务器管理员!",
    "gui.exit": "表单已关闭,未收到操作",
    "shop.buy.ok": "购买成功!",
    "shop.buy.no": "你没有那么多钱,你只有:",
    "shop.mustnum": "数量必须是整数而且不能是负数",
    "market.mustnum": "价格必须是整数而且不能是负数",
    "shop.sell.ok": "出售成功!",
    "shop.sell.no": "你没有那么多物品,你只有:",
    "market.error.nocount": "你没有填入价格!",
    "market.buy.no": "你没有那么多钱,你只有:",
    "market.buy.no2": "请先清理背包!",
    "market.add.ok": "上架成功!",
    "market.buy.ok": "购买成功!",
    "market.reduce.ok": "下架成功!",
    "market.opmenu.noperm": "你无权操作!"
}));
lang.delete("shop.buy.noroom")
lang.delete("shop.sell.no2")
/**
* 初始化配置项组(方便函数)
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
lang.inits({
    "import.error.PVip": "依赖 PVip 未安装,vip打折无法使用!",
    "import.warn.PMail": "依赖 PMail 未安装,已启用文件方式来给予玩家市场获得的经济",
    "import.error.PLib": "依赖 PLib 未安装,插件无法正常运行!插件将在3s后自动卸载!",
    "import.error.FinalTextures": "依赖 FinalTextures 未安装,插件无法正常运行!插件将在3s后自动卸载!",
    "lang.restore.success": "语言文件恢复完成!请重启服务器!!!,服务器将在10s后自动关闭!",
    "config.update.success": "检测到旧版配置文件，已经自动更新!",
    "shop.buy.tip": "购买物品{item.name}\n物品标准类型名:{item.id}\n物品数据值(Aux):{item.aux}\n价格:{price}/个,(原价{original_price}/个)",
    "shop.buy.title": "{info}购买物品:{item.name}",
    "log.shop.buy": "购买物品:{item.name} 物品id:{item.id} 数量:{quantity} 价格:{totalCost}",
    "log.shop.sell": "出售物品:{item.name} 物品id:{item.id} 数量:{quantity} 价格:{totalCost}",
    "gui.cancel": "取消",
    "command.ori.typeerror": "请不要在命令方块或控制台使用商店的命令",
    "command.shop.desc": "商店",
    "command.market.desc": "全球市场",
    "shop.input.buycount": "购买数量",
    "shop.sell.title": "{info}出售物品:{item.name}",
    "shop.sell.tip": "出售物品{data.name}\n物品标准类型名:{itemdata.id}\n价格:{itemdata.money}/个",
    "shop.input.sellcount": "出售数量,你当前拥有{itemCount}个,输入all出售全部",
    "shop.buy.maintitle": "{info}购买商品",
    "shop.sell.maintitle": "{info}出售商品",
    "market.gui.button.buy": "购买物品",
    "shop.buy.group": "{info}{name}",
    "shop.sell.group": "{info}{name}",
    "shop.itembuttonname": "{item.name} {item.money}{money.name}/个",
    "shop.groupbuttonname": "{item.name}",
    "shop.button.lastpage": "上一页",
    "shop.button.nextpage": "下一页",
    "shop.group.content": "第 {page} 页，共 {totalPages} 页"
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
    MatchBucketEntityCustomName: true,
    MatchBucketEntityFallDistance: false,
    MatchBucketEntityFire: true,
    MatchBucketEntityStrength: true,
    MatchBucketEntitySheared: true,
    MatchRepairCost: false,
})
config.init("logo", {
    "gui.cancel": "",
    "shop.buy": "",
    "shop.sell": "",
    "shop.lastpage": "",
    "shop.nextpage": "",
    "market.add": "",
    "market.add.byitemtype": "",
    "market.add.byitemnbt": "",
    "market.buy": "",
    "market.search": "",
    "market.search.normal": "",
    "market.search.better": "",
    "market.manage": "",
    "market.reduce": "",
})
config.init("itemsperpage", 10)
//检测旧版本替换语言文件自动替换回来
mc.listen("onServerStarted", function () {
    //解决部分问题
    setTimeout(() => {
        if (File.exists("./resource_packs/vanilla/texts/en_US.langbackup")) {
            File.writeTo("./resource_packs/vanilla/texts/en_US.lang", File.readFrom("./resource_packs/vanilla/texts/en_US.langbackup"))
            File.delete("./resource_packs/vanilla/texts/en_US.langbackup")
            logger.warn(lang.get("lang.restore.success"))
            setTimeout(() => {
                mc.runcmd("stop")
            }, 10000)
        }
    }, 2000)
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
const shopdata = JSON.parse(shopdatajson.read());
const marketdata = new JsonConfigFile(path + "marketdata.json", JSON.stringify({ data: [] }));
module.exports = {
    config,
    lang,
    shopdata,
    shopdatajson,
    marketdata,
}