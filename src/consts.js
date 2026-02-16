import { parseLangFile } from "./lib/lib.js"
import { generateTexturePaths } from "./lib/texture_path_generator.js";
import path from 'path';
export const pluginpath = "./plugins/Planet/PShop/";
export const workpath = "./plugins/PShop/";
export const versions = "2.0.0"
export const fix = " Release"
export const author = "Planet工作室-星辰开发组-春风"
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
export const gamelang = {}
function loadgamelang(langcode) {
    gamelang[langcode] = parseLangFile(File.readFrom("./resource_packs/vanilla/texts/" + langcode + ".lang"))
}
export function loadgamelangs() {
    let enablelangs = config.get("enablelang")
    for (let i = 0; i < enablelangs.length; i++) {
        loadgamelang(enablelangs[i])
    }
}
loadgamelangs()

export const texture_paths = generateTexturePaths({
    bdsPath: path.join(process.cwd()),
    outputPath
})

texture_paths.get = function (name) {
    return texture_paths[name] || config.get("texture_default")
}