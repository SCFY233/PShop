import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TexturePathParser } from './lib/extractTextures.js';
import { parseProperties, wlog, ReplaceStr, CompareVersion, getGameLang } from './lib/lib.js';
import { getSMoneyConfig } from '../../SMoney/lib.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BDSPath = path.join(__dirname, "..", "..", "..");
export const pluginpath = "./plugins/Planet/PShop/";
export const workpath = "./plugins/PShop/";
export const versions = "4.0.0"
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
            desc: "PShop-系统商店"
        },
        chestshop: {
            cmd: "chestshop",
            desc: "PShop-箱子商店管理与快捷命令"
        },
        pshop: {
            cmd: "pshop",
            desc: "PShop-主命令"
        }
    },
    prefix: {
        shop: "[系统商店]",
        chestshop: "[箱子商店]"
    },
    enable: {
        shop: true,
        chestshop: true,
        log: true,
    },
    icon: {
        "default": "textures/blocks/missing_tile",
        "shop:buy": "textures/ui/MCoin",
        "shop:sell": "textures/items/emerald",
        "form:back": "textures/ui/icon_import",
        "form:confirm": "textures/ui/check",
        "form:cancel": "textures/ui/cancel",
        "form:prev": "textures/ui/arrow_left",
        "form:next": "textures/ui/arrow_right"
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
    protectChestAndSign: true,
    banitems: ["minecraft:bedrock"],
    update_url: "http://update.mcmap.top/?name=PShop",
    chestshop_sounds: {
        success: {
            sound: "random.orb",
            volume: 1.0,
            pitch: 1.0
        },
        fail: {
            sound: "mob.villager.no",
            volume: 1.0,
            pitch: 1.0
        },
        create: {
            sound: "random.levelup",
            volume: 1.0,
            pitch: 1.0
        },
        click: {
            sound: "note.hat",
            volume: 0.8,
            pitch: 1.0
        },
        pending: {
            sound: "note.pling",
            volume: 1.0,
            pitch: 1.2
        },
        timeout: {
            sound: "note.bass",
            volume: 1.0,
            pitch: 0.8
        }
    },
    "keys.cancel": ["c", "取消", "q"],
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
    // --- 系统与更新提示 ---
    'update.NewVersion': "检测到{name}的新版本:{version}",
    'update.Notice': "更新公告:{notice}",
    'update.Download': "下载链接:{url}",
    'log.update.error': "检查更新时出现错误:错误码:{code}错误:{result}",
    "command.ori.typeerror": "请不要在命令方块或控制台使用PShop的命令",
    "keys.or": "'或'",

    // --- GUI 通用按钮与文本 ---
    "form.tip": "提示",
    "form.back": "返回",
    "form.cancel": "取消",
    "form.confirm": "确认",
    "form.action.do": "干",
    "form.action.buy": "买",
    "form.action.sell": "卖",
    "form.group.content": "第 {page}/{totalPages} 页",
    "form.prev_page": "上一页",
    "form.next_page": "下一页",

    // --- 系统商店相关 ---
    "form.shop.main.title": "{prefix.shop}系统商店-主菜单",
    "form.shop.main.content": "来干点什么?",
    "form.shop.main.button.buy": "购买",
    "form.shop.main.button.sell": "出售",
    "form.shop.group.title": "{prefix.shop}{name}§r",
    "form.shop.group.content": "来{action}点什么?",

    // --- 商品物品详情解析 ---
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

    // --- 系统商店交易交互 ---
    "form.shop.buy.item.title": "{prefix.shop}购买商品:{name}",
    "form.shop.buy.item.count": "输入数量,你有{plmoney}{moneyname},可购买{count}个,留空返回",
    "form.shop.buy.item.count.max": "你钱不够!你无法购买{input}个!你最多只能购买:{maxcount}个",
    "form.shop.buy.item.confirm": "你确定要购买{count}个{iname}吗?\n这将会花费{totalCost}{moneyname},你将会剩余{plmoney}{moneyname}",
    "form.shop.buy.item.success": "购买成功!你获得了{plcount}{iname}!\n当前余额:{plmoney}{moneyname}",
    "form.shop.buy.item.fail": "购买失败!你剩余{plmoney}{moneyname}",
    "form.shop.sell.item.title": "{prefix.shop}出售商品:{name}",
    "form.shop.sell.item.count": "输入数量,你有{count}个{iname}§r,留空返回",
    "form.shop.sell.item.count.max": "你最多只能出售{maxcount}个",
    "form.shop.sell.item.confirm": "你确定要出售{count}个{iname}§r吗?\n这将会获得{totalgive} {moneyname},你将会剩余{plcount}个{iname}",
    "form.shop.sell.item.success": "出售成功!你获得了{totalgive}{moneyname}!\n当前余额:{plmoney}{moneyname}",

    // --- 日志与报错提示 ---
    "form.shop.item.count.type": "应该输入正整数!可你输入了:{input}",
    "tell.chestshop.count.type": "应该输入正整数!可你输入了:{msg}",
    "tell.chestshop.count.type2": "您现在最多能够{action} {count} 个,可你却输入了:{msg}",
    "tell.chestshop.moneytype": "{prefix.chestshop}价格应该为正整数,可你输入了:{input}",
    "tell.chestshop.moneytype.decimal": "{prefix.chestshop} §c价格必须是大于0的有效数字(支持小数),可你输入了:{input}",
    "log.shop.buy": "购买物品:{item.name} 数量:{quantity} 价格:{totalCost}",
    "log.shop.sell": "出售物品:{item.name} 数量:{quantity} 价格:{totalCost}",

    // --- 箱子商店 (ChestShop) 相关 ---
    "prefix.ench": "§d",
    "prefix.count": "§a",
    "prefix.type": "§6",
    "prefix.slot": "§s",
    "prefix.end": "§r",
    "form.chestshop.title": "{prefix.chestshop}",
    "chestshop.system": "系统商店",
    "chestshop.infinite": "无限",
    "chestshop.info": "§u┌-----------------------------\n§u| §c商店信息:\n§u| §a所有者: §r{ownername}\n§u| §a物品信息: §r{item}\n§u| {count}\n§u| §a价格: §e{money}{moneyname}§a/个\n§u└-----------------------------",
    "chestshop.info.form": "§c商店信息:\n§a所有者: §r{ownername}\n§a物品信息: §r{item}\n{count}\n§a价格: §e{money}{moneyname}§a/个",
    "chestshop.info.count": "{action} §fx{count}§r",
    "chestshop.info.count.null": "§c缺货§r",
    "chestshop.info.count.full": "§c箱子已满!§r",
    "chestshop.sign.line1": "§e{plname}§r",
    "chestshop.sign.line2": "{action} §bx{count}§r",
    "chestshop.sign.line2.null": "§c缺货§r",
    "chestshop.sign.line2.full": "§c箱子已满!§r",
    "chestshop.sign.line3": "{itemname}",
    "chestshop.sign.line4": "{money}{moneyname}/个",
    "chestshop.action.buy": "§a收购§r",
    "chestshop.action.sell": "§a出售§r",
    "chestshop.action.plbuy": "§a购买§r",
    "chestshop.action.plsell": "§a出售§r",
    "tell.chestshop.create.money": "{prefix.chestshop}在聊天栏输入价格:  \n{prefix.chestshop}输入 '{keys.cancel}' 取消",
    "tell.chestshop.exit": "{prefix.chestshop}已退出交互",
    "tell.chestshop.trade": "在聊天栏输入你想要 {action} 的数量,您现在能够{action} {count} 个,输入all{action}全部物品",
    "tell.chestshop.sign.notair": "告示牌所在位置:{pos}非空气方块,请你清除",
    "tell.chestshop.create": '{prefix.chestshop} §a商店创建成功!',
    "tell.chestshop.create.checkperm": "{prefix.chestshop} 现在请你打开箱子然后再次关闭完成创建(仅供校验权限)!",
    // --- 箱子商店交易确认表单 ---
    "form.chestshop.buy.title": "{prefix.chestshop} 确认购买: {name}",
    "form.chestshop.buy.confirm": "你确定要向该商店购买 {count}个 {iname} 吗?\n这将会花费 {totalCost} {moneyname}, 你的余额将剩余 {plmoney} {moneyname}",
    "form.chestshop.sell.title": "{prefix.chestshop} 确认出售: {name}",
    "form.chestshop.sell.confirm": "你确定要向该商店出售 {count}个 {iname} 吗?\n这将会获得 {totalgive} {moneyname}, 你的余额将变为 {plmoney} {moneyname}",

    // --- 箱子商店管理界面 ---
    "form.chestshop.manage.title": "{prefix.chestshop} §l商店配置管理",
    "form.chestshop.manage.label": "您可以在此修改您的箱子商店参数:",
    "form.chestshop.manage.input.price": "商品单价",
    "form.chestshop.manage.input.price.placeholder": "请输入有效数字(支持小数)",
    "form.chestshop.manage.dropdown.type": "商店类型",
    "form.chestshop.manage.switch.showitem": "展示悬浮物品",
    "form.chestshop.manage.switch.hopper_search": "允许漏斗/矿车吸出物品",
    "form.chestshop.manage.switch.hopper_push": "允许漏斗/矿车注入物品",
    "tell.chestshop.manage.success": "{prefix.chestshop} §a商店配置已成功更新!",
    "form.chestshop.manage.switch.delete": "§c删除该商店 (危险操作)§r",
    "tell.chestshop.manage.delete.success": "{prefix.chestshop} §a商店已成功删除!",

    // --- 离线通知与店铺状态异常提示 ---
    "notice.shop.income": "{prefix.chestshop} §a[收益通知] 您位于 §e{pos} §a的商店售出了 {count}个 {itemname}!",
    "notice.shop.empty": "{prefix.chestshop} §c[库存警告] 您位于 §e{pos} §c的商店(出售:{itemname}) 已经 §l脱销了§r§c,请及时补货!",
    "notice.shop.full": "{prefix.chestshop} §c[空间警告] 您位于 §e{pos} §c的商店(收购:{itemname}) 已经 §l没有剩余空间了§r§c,请及时清理!",
    "notice.shop.expense": "{prefix.chestshop} §e[支出通知] 您位于 §e{pos} §e的商店收购了 {count}个 {itemname},共支出 {money}{moneyname}!",

    // --- 箱子商店交易结果提示 (新增) ---
    "tell.chestshop.buy.success": "{prefix.chestshop} §a购买成功! 你花费了 {totalCost}{moneyname} 购买了 {iname}, 当前余额: {plmoney}{moneyname}",
    "tell.chestshop.buy.fail": "{prefix.chestshop} §c购买失败! 可能是商店库存不足或你的背包已满.",
    "tell.chestshop.sell.success": "{prefix.chestshop} §a出售成功! 你出售了 {iname}, 获得了 {totalgive}{moneyname}, 当前余额: {plmoney}{moneyname}",
    "tell.chestshop.sell.fail": "{prefix.chestshop} §c出售失败! 可能是商店空间已满或你的物品不足.",
    // --- 箱子商店报错相关 ---
    "tell.chestshop.error.block": "§c无法获取箱子方块(请确保商店所在区块已加载)!",
    "tell.chestshop.error.container": "§c无法访问箱子容器(该方块可能已不是箱子或被破坏)!",
    "tell.chestshop.error.system": "§c交易期间发生系统错误,请联系管理员查看控制台日志!",
    // --- 管理员专属 ---
    "form.chestshop.manage.label.op": "\n§d[OP]§r 当前所有者: §e{ownername}§r\n(UUID: {uuid})",
    "form.chestshop.manage.switch.system_shop": "§d[OP]§r 设为系统商店 (无限库存/无视所有者)",
    // --- 箱子商店日志 (ChestShop Log) ---
    "log.chestshop.create": "创建箱子商店 位置:{pos} 物品:{item.name} 价格:{money}",
    "log.chestshop.buy": "在箱子商店购买 位置:{pos} 店主:{owner} 物品:{item.name} 数量:{quantity} 总花费:{totalCost}",
    "log.chestshop.sell": "向箱子商店出售 位置:{pos} 店主:{owner} 物品:{item.name} 数量:{quantity} 总收益:{totalCost}",
    "log.chestshop.delete": "删除箱子商店 位置:{pos} ID:{shopid}",
    // --- 快捷命令 (chestshop) 提示语 ---
    "command.chestshop.reload.success": "§a[PShop] 数据重载成功!",
    "command.chestshop.reload.fail": "§c[PShop] 数据重载失败!",
    "command.chestshop.permission.denied": "§c权限不足!你没有执行此操作的权限.",
    "command.chestshop.target.invalid": "§c错误:请准心对准您的箱子商店或木牌再执行此命令!",
    "command.chestshop.target.not_shop": "§c错误:该方块不是有效的箱子商店!",
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
    lang.get = (key) => lang.data[key]?.replaceAll ? lang.data[key].replaceAll("{prefix.shop}", prefix.shop).replaceAll("{prefix.chestshop}", prefix.chestshop) : key
    lang.gets = (keys) => keys.map(key => lang.get(key))
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
export let chestshopdata = {}
export function loadChestShopData() {
    chestshopdatajson.reload()
    let d = JSON.parse(chestshopdatajson.read())
    chestshopdata = d || {}
    return d
}
export function getChestShopIDs() {
    return Object.keys(chestshopdata) || []
}
export function saveChestShopData() {
    return chestshopdatajson.write(JSON.stringify(chestshopdata))
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
export const givesdata = new JsonConfigFile(pluginpath + "gives.json", JSON.stringify({
    version: versions,
}));

// 因为你的数据结构完全变了,旧版本的复杂格式已失效
// 如果检测到没有 version,直接给它打上版本号即可,丢弃无法兼容的老格式
if (givesdata.get("version") == null) {
    givesdata.set("version", versions);
}

export const SignBlockMap = {
    north: [0, 0, -1],
    south: [0, 0, 1],
    west: [-1, 0, 0],
    east: [1, 0, 0],
}

export const signtileDataMap = {
    north: 2,
    south: 3,
    west: 4,
    east: 5
}

export const sideMap = {
    0: "up",
    1: "down",
    2: "north",
    3: "south",
    4: "west",
    5: "east"
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
    loadChestShopData();
    const endMem = process.memoryUsage();
    logger.warn('完成!使用内存: ' + ((endMem.heapUsed - startMem.heapUsed) / 1024 / 1024).toFixed(2) + ' MB');
    console.timeEnd('加载数据用时');
    return true;
}
mc.listen("onServerStarted", () => loaddatas())
