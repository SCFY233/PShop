import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TexturePathParser } from './lib/extractTextures.js';
import { parseProperties } from './lib/lib.js';
export const BDSPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const pluginpath = "./plugins/Planet/PShop/";
export const workpath = "./plugins/PShop/";
export const versions = "2.0.0"
export const fix = " Release"
export const author = "Planet工作室-星辰开发组-春风"
export const server_properties = parseProperties(fs.readFileSync(BDSPath + "/server.properties", "utf8"))
//释放配置文件
export const config = new JsonConfigFile(pluginpath + "config.json", JSON.stringify({
    version: versions,
    money: {
        type: "llmoney",
        name: "money",
        score: "money"
    },
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
        MatchBucketEntityFallDistance: false,
        MatchBucketEntityFire: true,
        MatchBucketEntityStrength: true,
        MatchBucketEntitySheared: true,
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
    logger.warn
}
const langdata = new JsonConfigFile(pluginpath + "lang.json", JSON.stringify({
    error: {

    }
}))
export let lang = {}
export function loadlang() {
    langdata.reload()
    lang = JSON.parse(langdata.read())
}
lang.get = (key) => { return lang[key] || key }

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
loadconstsmap();
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
loadTexture()