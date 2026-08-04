import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TexturePathParser } from './lib/extractTextures.js';
import { parseProperties, wlog, ReplaceStr, CompareVersion, getGameLang } from './lib/lib.js';
import { getSMoneyConfig } from '../../SMoney/main.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BDSPath = path.join(__dirname, "..", "..", "..");
export const pluginpath = "./plugins/Planet/PShop/";
export const workpath = "./plugins/PShop/";
export const versions = "4.0.0"
export const fix = " Alpha 26.08.04-6"
export const author = "Planet工作室-星辰开发组-春风"
export const moneyname = getSMoneyConfig().moneyname ?? "金币"

export const server_properties = parseProperties(fs.readFileSync(BDSPath + "/server.properties", "utf8"))
//释放配置文件
export const config = new JsonConfigFile(pluginpath + "config.json", JSON.stringify({
    version: versions,
    commands: {
        shop: {
            cmd: "shop",
            desc: "PShop-系统商店"
        },
        pshop: {
            cmd: "pshop",
            desc: "PShop-主命令"
        }
    },
    prefix: {
        shop: "[PShop-商店]",
        chestshop: "[PShop-箱子商店]"
    },
    enable: {
        shop: true,
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
const langdata = new JsonConfigFile(pluginpath + "lang.json")
langdata.inits({
    'update.NewVersion': "检测到{name}的新版本:{version}",
    'update.Notice': "更新公告:{notice}",
    'update.Download': "下载链接:{url}",
    'log.update.error': "检查更新时出现错误:错误码:{code}错误:{result}",
    "command.ori.typeerror": "请不要在命令方块或控制台使用PShop的命令",
    "form.back": "返回",
    "form.confirm": "继续",
    "form.cancel": "取消",
    "form.tip": "提示",
    "form.action.do": "干",
    "form.action.buy": "买",
    "form.action.sell": "卖",
    "form.shop.main.title": "{prefix.shop}系统商店-主菜单",
    "form.shop.main.content": "来干点什么?",
    "form.shop.main.button.buy": "购买",
    "form.shop.main.button.sell": "出售",
    "form.item.content.shop": "该商品信息如下:",
    "form.item.content.shop.name": "{prefix.type}名称:{prefix.end}{iname}§r",
    "form.item.content.shop.price": "{prefix.type}价格:{prefix.end}{price}/个",
    "form.item.content.name": "({name}§r)",
    "form.item.content.count": " x{count}",
    "form.item.content.prefix.step": "   ",
    "form.item.content.damage": "{prefix.type}耐久:{prefix.end}{damage}/{maxdamage}",
    "form.item.name": "{prefix.type}物品名称:{prefix.end}{name}§r",
    "form.item.content.lore.step": "|{text}",
    "form.item.content.ench.step": "#{ench}",
    "form.item.potion": "{prefix.type}效果:{prefix.end}{potion}.",
    "form.item.items": "{prefix.type}含有物品:{prefix.end}",
    "form.item.items.step": "{prefix.slot}[{slot}格]{prefix.end}",
    "form.item.items.step.zb": "┗━━",
    "form.shop.buy.item.title": "{prefix.shop}购买商品:{name}",
    "form.shop.buy.item.count": "输入数量,你有{plmoney}{moneyname},可购买{count}个,留空返回",
    "form.shop.item.count.type": "应该输入正整数!可你输入了:{input}",
    "form.shop.buy.item.count.max": "你钱不够!你无法购买{input}个!你最多只能购买:{maxcount}个",
    "form.shop.buy.item.confirm": "你确定要购买{count}个{iname}吗?\n这将会花费{totalCost}{moneyname},你将会剩余{plmoney}{moneyname}",
    "form.shop.buy.item.success": "购买成功!你获得了{plcount}{iname}!\n当前余额:{plmoney}{moneyname}",
    "form.shop.sell.item.title": "{prefix.shop}出售商品:{name}",
    "form.shop.sell.item.count": "输入数量,你有{count}个{iname}§r,留空返回",
    "form.shop.sell.item.count.max": "你最多只能出售{maxcount}个",
    "form.shop.sell.item.confirm": "你确定要出售{count}个{iname}§r吗?\n这将会获得{totalgive} {moneyname},你将会剩余{plcount}个{iname}",
    "form.shop.sell.item.success": "出售成功!你获得了{totalgive}{moneyname}!\n当前余额:{plmoney}{moneyname}",
    "form.shop.buy.item.fail": "购买失败!你剩余{plmoney}{moneyname}",
    "form.shop.group.title": "{prefix.shop}{name}§r",
    "form.shop.group.content": "来{action}点什么?",
    "prefix.ench": "§d",
    "prefix.count": "§a",
    "prefix.type": "§6",
    "prefix.slot": "§s",
    "prefix.end": "§r",
    "form.chestshop.new.title": "{prefix.chestshop}创建商店",
    "form.chestshop.new.input": "请输入价格({moneyname}/个)",
    "form.chestshop.new.dropdown": "选择商店类型",
    "form.chestshop.new.dropdown.buy": "收购商店",
    "form.chestshop.new.dropdown.sell": "出售商店",
    "form.chestshop.new.money.type": "应该输入正整数!可你输入了:{input}",

    // GUI 通用配置
    "form.group.content": "第 {page}/{totalPages} 页",
    "form.button.lastpage": "上一页",
    "form.button.nextpage": "下一页",
    "form.back": "返回",
    "form.cancel": "取消",
    "form.confirm": "确认",
    // 表单分页配置
    "form.prev_page": "上一页",
    "form.next_page": "下一页",

    "log.shop.buy": "购买物品:{item.name} 数量:{quantity} 价格:{totalCost}",
    "log.shop.sell": "出售物品:{item.name} 数量:{quantity} 价格:{totalCost}",
})
export const lang = {}
export function loadlang() {
    langdata.reload()
    lang.data = JSON.parse(langdata.read())
    /**
     * 获取文本
     * @param {String} key 
     * @returns {String} 
     */
    lang.get = (key) => lang.data[key]?.replaceAll("{prefix.shop}", prefix.shop).replaceAll("{prefix.chestshop}", prefix.chestshop) || key
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
        },
        {
            name: "示例2",
            type: "group",
            image: "",
            data: [
                {
                    name: "示例(羊毛)",
                    type: "item",
                    image: "",
                    data: [{
                        id: "minecraft:white_wool",
                        aux: 0,
                        auxStrict: true,
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
export const chestshopdatajson = new JsonConfigFile(pluginpath + "chestshop.json")
export let chestshopdata = {
    
}
export function loadChestshopData() {
    chestshopdatajson.reload()
    let d = JSON.parse(chestshopdatajson.read())
    chestshopdata = d ?? {}
    return d
}
export function getChestshopIDs() {
    return Object.keys(chestshopdata)||[]
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
    chestshop: config.get("prefix").chestshop || "[PShop-箱子商店]",
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
    // Texture_Extractor.validateTextures()
}
export const gamelang = {
    get: (key) => gamelang?.data?.[key] ?? key
}
export function loadGameLang() {
    gamelang.data = getGameLang(config.get("gamelang") || "zh_CN")
}
// export const givesdata = new JsonConfigFile(pluginpath + "gives.json", JSON.stringify({
//     version: versions,
// }))
// if (givesdata.get("version") == null) {
//     let old = JSON.parse(givesdata.read())
//     let ks = Object.keys(old)
//     for (let k of ks) {
//         if (typeof k != "number" && k != "version") {
//             addgiveItems(data.name2xuid(k), [old[k].item], [''])
//             addgiveMoneys(data.name2xuid(k), [old[k].money], [''])
//             setgiveReduceMoneys(data.name2xuid(k), [])
//             givesdata.delete(k)
//         }
//     }
// }
export function loaddatas() {
    console.time('加载数据用时');
    const startMem = process.memoryUsage();
    logger.warn('正在构建所需要的表...');
    loadlang()
    loadGameLang()
    loadconstsmap();
    loadTexture();
    loadShopData();
    const endMem = process.memoryUsage();
    logger.warn('完成!使用内存: ' + ((endMem.heapUsed - startMem.heapUsed) / 1024 / 1024).toFixed(2) + ' MB');
    console.timeEnd('加载数据用时');
    return true;
}
loaddatas()