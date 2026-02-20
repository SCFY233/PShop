import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TexturePathParser } from './lib/extractTextures.js';
import { parseProperties, addgiveItems, addgiveMoneys, setgiveReduceMoneys } from './lib/lib.js';
import * as GMLIBAPI from "../../GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BDSPath = path.join(__dirname, "..", "..", "..");
export const pluginpath = "./plugins/Planet/PShop/";
export const workpath = "./plugins/PShop/";
export const versions = "3.2.0"
export const fix = " Release"
export const author = "Planet工作室-星辰开发组-春风"
export default GMLIBAPI


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
    vip: {
        enable: false,
        discount: 0.8
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
    logo: {
    },
    textures_path: {
        default: "textures/blocks/missing_tile"
    },
    nbt: {
        MatchBucketEntityCustomName: false,
        MatchRepairCost: false,
    },
    itemtranslate: {
        default: "zh_CN",
        enable: ["zh_CN", "en_US"]
    },
    banitems: ["minecraft:bedrock"],
    update_url: "http://gitee.com/SCFY233/PShop/raw/main/update/version.json"
}));
if (config.get("version") == null) {
    logger.warn("检测到旧版本配置文件,请您备份并重启服务器进行升级,插件正在自动卸载...")
}
const langdata = new JsonConfigFile(pluginpath + "lang.json", JSON.stringify({
    'update.NewVersion': "检测到{name}的新版本:{version}",
    'update.Notice': "更新公告:{notice}",
    'update.Download': "下载链接:{url}",
    'import.warn.PVip': "未检测到PVip插件,将无法使用VIP相关功能!",
}))
export let lang = {}
export function loadlang() {
    langdata.reload()
    lang = JSON.parse(langdata.read())
    lang.get = (key) => lang[key] || key
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
export const marketdatajson = new JsonConfigFile(pluginpath + "marketdata.json", JSON.stringify({ data: [] }));
const constsdata = new JsonConfigFile(workpath + "data.json")
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
function vanilla_texture_paths() { return JSON.parse(fs.readFileSync(path.join(BDSPath, "/plugins/PShop/vanilla_texture.json"), "utf8")) }
export let texture_paths = {
    get: (type, aux) => { return texture_paths.data[type]?.[aux] ?? texture_paths.data[type]?.[0] ?? config.get("texture_path")?.default; }
}
export function loadTexture() {
    texture_paths.data = { ...Texture_Extractor.run(), ...vanilla_texture_paths() }
}


export const imports = {
    PVip: {
        status: false,
        /**获取玩家VIP状态
         * @param {Player} player
         * @returns {boolean}
         */
        getVIPStatus: (player) => false,
    },
    GMLIB: {
        status: false,
    },
    SMoney: {
        status: false,
    }
}
mc.listen("onServerStarted", () => {
    const plugins = ll.listPlugins()
    if (plugins.includes("PVip")) {
        imports.PVip.status = true
        imports.PVip.getVIPStatus = ll.imports("PVip", "get_status")
    } else logger.warn(lang.get("import.warn.PVip"))
    if (plugins.includes("GMLIB-LegacyRemoteCallApi"))
        imports.GMLIB.status = true
    if (plugins.includes("SMoney"))
        imports.SMoney.status = true
})


const givesdata = new JsonConfigFile(pluginpath + "gives.json", JSON.stringify({
    version: versions,
}))
if (givesdata.version == null) {
    let old = JSON.parse(givesdata.read())
    let ks = Object.keys(old)
    for (let k of ks) {
        if (typeof k != "number" && k != "version") {
            addgiveItems(data.name2xuid(k), old[k].item, '')
            addgiveMoneys(data.name2xuid(k), old[k].money, '')
            setgiveReduceMoneys(data.name2xuid(k), [])
            givesdata.delete(k)
        }
    }
}

export function loaddatas() {
    console.time('加载数据');
    const startMem = process.memoryUsage();
    logger.warn('正在构建所需要的表...');
    loadlang()
    loadconstsmap();
    loadTexture();
    const endMem = process.memoryUsage();
    logger.warn('完成!使用内存: ' + ((endMem.heapUsed - startMem.heapUsed) / 1024 / 1024).toFixed(2) + ' MB');
    console.timeEnd('加载数据');
}
loaddatas()