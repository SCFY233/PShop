import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TexturePathParser } from './lib/extractTextures.js';
import { parseProperties, addgiveItems, addgiveMoneys, setgiveReduceMoneys, wlog, ReplaceStr, CompareVersion, getGameLang } from './lib/lib.js';
import { getSMoneyConfig } from '../../SMoney/main.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BDSPath = path.join(__dirname, "..", "..", "..");
export const pluginpath = "./plugins/Planet/PShop/";
export const workpath = "./plugins/PShop/";
export const versions = "3.2.0"
export const fix = " Release"
export const author = "Planet工作室-星辰开发组-春风"
export const moneyname = getSMoneyConfig().moneyname ?? "金币"

export const server_properties = parseProperties(fs.readFileSync(BDSPath + "/server.properties", "utf8"))
//释放配置文件
export const config = new JsonConfigFile(pluginpath + "config.json", JSON.stringify({
    version: versions,
    commands: {
        shop: {
            cmd: "shop",
            desc: "PShop-商店"
        },
        market: {
            cmd: "market",
            desc: "PShop-市场"
        }
    },
    prefix: {
        shop: "[PShop-商店]",
        market: "[PShop-市场]"
    },
    enable: {
        shop: true,
        market: true,
        log: true,
    },
    icon: {
        default: "textures/blocks/missing_tile"
    },
    item_per_page: 6,
    shop_ignore_aux_default: false,
    textures_path: {
        default: "textures/blocks/missing_tile"
    },
    nbt: {
        MatchBucketEntityCustomName: false,
        MatchRepairCost: false,
    },
    gamelang: "zh_CN",
    itemtranslateCode: "zh_CN",
    banitems: ["minecraft:bedrock"],
    update_url: "http://update.mcmap.top/?name=PShop"
}));
/**
 * 获取图标
 * @param {String} name 
 * @returns {String} 
 */
config.getIcon = function (name) {
    return config.get("icon")[name] || config.get("icon").default
}
if (config.get("version") == null || CompareVersion(config.get("version"), versions) == -1) {
    logger.warn("检测到旧版本配置文件,请您手动更新!\n请您备份并使用ll reload PShop命令重新加载插件\n然后参照默认配置文件进行修改\n然后再次ll reload PShop重载插件\n建议完全修改完后重启服务器")
}
const langdata = new JsonConfigFile(pluginpath + "lang.json", JSON.stringify({
    'update.NewVersion': "检测到{name}的新版本:{version}",
    'update.Notice': "更新公告:{notice}",
    'update.Download': "下载链接:{url}",
    "form.back": "返回",
    "form.comfirm": "继续",
    "form.cancel": "取消",
    "form.tip": "提示",
    "form.action.do": "干",
    "form.action.buy": "买",
    "form.action.sell": "卖",
    "form.shop.main.title": "{prefix.shop}系统商店-主菜单",
    "form.shop.main.content": "来干点什么?",
    "form.shop.main.button.buy": "购买",
    "form.shop.main.button.sell": "出售",
    "form.item.content.shop": "该商品信息如下:\n名称:{iname}\n价格:{price}/个{item}",
    "form.item.content": "{pre_space}{prefix}{prefix.type}物品标准名称:{prefix.end}{name}{pre_space} {prefix.type}数量:{prefix.end}{count}个{enchinfo}{potioninfo}{items}",
    "form.item.name": "{prefix.type}物品名称:{prefix.end}{name}\n",
    "form.item.lore": "{prefix}{prefix.type}物品描述:{prefix.end}",
    "form.item.lore.step": "{prefix}|",
    "form.item.ench": "\n{prefix}{prefix.type}附魔属性:{prefix.end}{enchs}.",
    "form.item.ench.step": "{prefix}#",
    "form.item.potion": "\n{prefix}{prefix.type}药水效果:{prefix.end}{potion}.",
    "form.item.items": "\n{prefix}{prefix.type}含有物品:{prefix.end}",
    "form.item.items.step": "{prefix.slot}[{slot}格]{prefix.end}",
    "form.shop.buy.item.title": "{prefix.shop}购买商品:{name}",
    "form.shop.buy.item.count": "输入数量,你有{plmoney}{moneyname},可购买{count}个,留空返回",
    "form.shop.buy.item.count.type": "应该输入正整数!可你输入了:{input}",
    "form.shop.buy.item.count.max": "你钱不够!你无法购买{input}个!你最多只能购买:{maxcount}个",
    "form.tip.item.count": "请输入正整数",
    "form.shop.group.title": "{prefix.shop}{name}",
    "form.shop.group.content": "来{action}点什么?",
    "prefix.ench": "§d",
    "prefix.potion": "§w",
    "prefix.count": "§a",
    "prefix.type": "§6",
    "prefix.slot": "§s",
    "prefix.end": "§r"
}))
export const lang = {}
export function loadlang() {
    langdata.reload()
    lang.data = JSON.parse(langdata.read())
    /**
     * 获取文本
     * @param {String} key 
     * @returns {String} 
     */
    lang.get = (key) => lang.data[key]?.replaceAll("{prefix.shop}", prefix.shop).replaceAll("{prefix.market}", prefix.market) || key
}
//释放商店和市场文件
export const shopdatajson = new JsonConfigFile(pluginpath + "shopdata.json", JSON.stringify({
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
        },
        {
            name: "示例2",
            type: "group",
            image: "",
            data: [
                {
                    name: "盒子",
                    type: "item",
                    image: "",
                    data: [{
                        snbt: true,
                        snbtstr: "{\"Block\":{\"name\":\"minecraft:undyed_shulker_box\",\"states\":{},\"version\":18168865},\"Count\":1b,\"Damage\":0s,\"Name\":\"minecraft:undyed_shulker_box\",\"WasPickedUp\":0b,\"tag\":{\"Items\":[{\"Slot\":17b,\"Block\":{\"name\":\"minecraft:undyed_shulker_box\",\"states\":{},\"version\":18168865},\"Count\":1b,\"Damage\":0s,\"Name\":\"minecraft:undyed_shulker_box\",\"WasPickedUp\":0b,\"tag\":{\"Items\":[{\"Count\":1b,\"Damage\":0s,\"Name\":\"minecraft:mace\",\"Slot\":0b,\"WasPickedUp\":0b,\"tag\":{\"Damage\":0,\"RepairCost\":1,\"display\":{\"Name\":\"重锤aaa\"},\"ench\":[{\"id\":40s,\"lvl\":4s}]}},{\"Count\":64b,\"Damage\":0s,\"Name\":\"minecraft:apple\",\"Slot\":6b,\"WasPickedUp\":0b},{\"Count\":1b,\"Damage\":0s,\"Name\":\"minecraft:enchanted_book\",\"Slot\":11b,\"WasPickedUp\":0b,\"tag\":{\"RepairCost\":1,\"ench\":[{\"id\":1s,\"lvl\":1s},{\"id\":26s,\"lvl\":1s}]}},{\"Count\":1b,\"Damage\":45s,\"Name\":\"minecraft:splash_potion\",\"Slot\":13b,\"WasPickedUp\":0b},{\"Count\":1b,\"Damage\":0s,\"Name\":\"hy:smaragdus_knife\",\"Slot\":22b,\"WasPickedUp\":0b,\"tag\":{\"Damage\":0}}]}},{\"Count\":1b,\"Damage\":0s,\"Name\":\"minecraft:mace\",\"Slot\":0b,\"WasPickedUp\":0b,\"tag\":{\"Damage\":0,\"RepairCost\":1,\"display\":{\"Name\":\"重锤aaa\"},\"ench\":[{\"id\":40s,\"lvl\":4s}]}},{\"Count\":64b,\"Damage\":0s,\"Name\":\"minecraft:apple\",\"Slot\":6b,\"WasPickedUp\":0b},{\"Count\":1b,\"Damage\":0s,\"Name\":\"minecraft:enchanted_book\",\"Slot\":11b,\"WasPickedUp\":0b,\"tag\":{\"RepairCost\":1,\"ench\":[{\"id\":1s,\"lvl\":1s},{\"id\":26s,\"lvl\":1s}]}},{\"Count\":1b,\"Damage\":45s,\"Name\":\"minecraft:splash_potion\",\"Slot\":13b,\"WasPickedUp\":0b},{\"Count\":1b,\"Damage\":0s,\"Name\":\"hy:smaragdus_knife\",\"Slot\":22b,\"WasPickedUp\":0b,\"tag\":{\"Damage\":0}}]}}",
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
                        snbt: true,
                        snbtstr: "{\"Count\":64b,\"Damage\":0s,\"Name\":\"minecraft:apple\",\"WasPickedUp\":0b}",
                        money: 10,
                    }]
                }
            ]
        }
    ]
}));
export const shopdata = {
    Buy: [],
    Sell: [],
}
export function loadShopData() {
    shopdatajson.reload()
    let d = JSON.parse(shopdatajson.read())
    shopdata.Buy = d.Buy || []
    shopdata.Sell = d.Sell || []
    return d
}
export const marketdatajson = new JsonConfigFile(pluginpath + "marketdata.json", JSON.stringify({ data: [] }));
export let marketdata = []
export function loadMarketData() {
    marketdatajson.reload()
    marketdata = JSON.parse(marketdatajson.read())
    return marketdata
}
export const constsdata = new JsonConfigFile(workpath + "data.json")
if (constsdata.read() == "{}") {
    logger.error("数据文件为空,请检查文件是否损坏!")
}
export const consts = {
    version: constsdata.get("version") || -1,
    enchants: [],
    potions: [],
    effects: [],
    loaddata() {
        this.enchants = constsdata.get("enchants") || []
        this.potions = constsdata.get("potions") || []
        this.effects = constsdata.get("effects") || []
    }
}
export const enchs = {};
export const potions = {};
export const effects = {};

export function loadconstsmap() {
    try {
        consts.loaddata();
        for (const enchant of consts.enchants) {
            enchs[enchant.id] = enchant;
        }
        for (const potion of consts.potions) {
            potions[potion.id] = potion;
        }
        for (const effect of consts.effects) {
            effects[effect.id] = effect;
        }
        consts.effects = [], consts.potions = [], consts.enchants = []
        console.info("加载常量数据...")
    } catch (error) {
        console.error("加载常量数据时出错: ", error);
    }
}
//前缀
export const prefix = {
    shop: config.get("prefix").shop || "[PShop-商店]",
    market: config.get("prefix").market || "[PShop-市场]",
}
export const Texture_Extractor = new TexturePathParser({
    bdsPath: BDSPath,
    worldName: server_properties['level-name'],
    outputPath: path.join(BDSPath, "/plugins/PShop/temp/textures.json")
})
export function vanilla_texture_paths() { return JSON.parse(fs.readFileSync(path.join(BDSPath, "/plugins/PShop/vanilla_texture.json"), "utf8")) }
export const texture_paths = {
    get: (type, aux) => texture_paths.data?.[type]?.[aux] ?? texture_paths.data?.[type]?.[0] ?? config.get("texture_path")?.default
}
export function loadTexture() {
    texture_paths.data = { ...Texture_Extractor.run(), ...vanilla_texture_paths() }
}
export const gamelang = {
    get: (key) => gamelang?.data?.[key] ?? key
}
export function loadGameLang() {
    gamelang.data = getGameLang(config.get("gamelang") || "zh_CN")
}

export const imports = {
    GMLIB: {
        status: false,
    },
    SMoney: {
        status: false,
    }
}
mc.listen("onServerStarted", () => {
    const plugins = ll.listPlugins()
    if (plugins.includes("GMLIB-LegacyRemoteCallApi"))
        imports.GMLIB.status = true
    if (plugins.includes("SMoney"))
        imports.SMoney.status = true
})
export const givesdata = new JsonConfigFile(pluginpath + "gives.json", JSON.stringify({
    version: versions,
}))
if (givesdata.get("version") == null) {
    let old = JSON.parse(givesdata.read())
    let ks = Object.keys(old)
    for (let k of ks) {
        if (typeof k != "number" && k != "version") {
            addgiveItems(data.name2xuid(k), [old[k].item], [''])
            addgiveMoneys(data.name2xuid(k), [old[k].money], [''])
            setgiveReduceMoneys(data.name2xuid(k), [])
            givesdata.delete(k)
        }
    }
}
export function loaddatas() {
    console.time('加载数据用时');
    const startMem = process.memoryUsage();
    logger.warn('正在构建所需要的表...');
    loadlang()
    loadGameLang()
    loadconstsmap();
    loadTexture();
    loadShopData();
    loadMarketData();
    const endMem = process.memoryUsage();
    logger.warn('完成!使用内存: ' + ((endMem.heapUsed - startMem.heapUsed) / 1024 / 1024).toFixed(2) + ' MB');
    console.timeEnd('加载数据用时');
}
loaddatas()