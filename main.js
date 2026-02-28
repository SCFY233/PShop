// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { author, versions, fix, shopdata } from "./src/consts.js"
import { shop } from "./src/shop.js"
import { } from "./src/market.js"
import { checkUpdate } from "./src/network.js"
mc.listen("onServerStarted", () => {
    checkUpdate()
    log(`PShop 商店系统插件---加载成功,当前版本:${versions}${fix} 作者: ${author}`);
    if (fix != "" && fix != " Release") logger.warn("你现在使用的版本为开发版,请勿用于生产环境!!!")
})
// shop.buyItem(pl, shopdata.Buy[0], function () { }
// mc.listen("onJump", (pl) => shop.buyItem(pl, shopdata.Buy[0], (pl)=> { }))