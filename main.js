// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
/// <reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { author, versions, fix, shopdata, config, workpath, lang, loadMarketData, loadShopData } from "./src/consts.js"
import { getItemInfo } from "./src/lib/lib.js"
import { shop } from "./src/shop.js"
import { market, marketitemsgui } from "./src/market.js"
import { } from "./src/chestshop.js"
import { checkUpdate } from "./src/network.js"
import {  } from "./src/lib/packet.js"
mc.listen("onServerStarted", () => {
    checkUpdate()
    log(`PShop 商店系统插件---加载成功,当前版本:${versions}${fix} 作者: ${author}`);
    if (!["", " Release"].includes(fix)) logger.warn("你现在使用的版本为开发版,请勿用于生产环境!!!")
})
// shop.buyItem(pl, shopdata.Buy[0], function () { }
// mc.listen("onJump", (pl) => fakeItem(pl, mc.newItem("minecraft:apple", 1), mc.newFloatPos(1, 110, 1,0)))
// mc.regConsoleCmd("rconfig", "", (_args) => {
//     File.delete("./plugins/Planet/PShop/")
//     log("done")
// })
if (config.get('enable').shop) {
    const shopcmd = mc.newCommand(config.get("commands").shop.cmd, config.get("commands").shop.desc, PermType.Any)
    shopcmd.setEnum("action", ["buy", "sell", "gui"])
    shopcmd.optional("action", ParamType.Enum, "action", "action", 1)
    shopcmd.overload(["action"])
    shopcmd.overload([])
    shopcmd.setCallback((_cmd, ori, out, res) => {
        if (ori.type != 0) return out.error(lang.get("command.ori.typeerror"))
        if (ori.player == null) return
        switch (res.action) {
            case "buy":
                shop.buy(ori.player, () => void 0)
                break
            case "sell":
                shop.sell(ori.player, () => void 0)
                break
            case "gui":
                shop.main(ori.player, () => void 0)
                break
            case "reload":
                loadShopData()
                out.success(lang.get("command.market.reload.success"))
                break
            default:
                shop.main(ori.player, () => void 0)
                break
        }
    })
    shopcmd.setup()
}
if (config.get('enable').market) {
    const marketcmd = mc.newCommand(config.get("commands").market.cmd, config.get("commands").market.desc, PermType.Any);
    marketcmd.setEnum("type", ["buy_sell", "buy_sell_list", "search_normal", "search_better", "ctrl", "add", "edit", "del", "gui", "reload"])
    marketcmd.optional("args", ParamType.Enum, "type", "args", 1)
    marketcmd.setCallback((_cmd, ori, out, res) => {
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
                marketitemsgui(pl, lang.get("market.buy_sell.list.title"), market.data, 0, market.buy_sell_item, "market.buy_sell(pl)")
                break;
            case "search_normal":
                market.search_normal(pl)
                break;
            case "search_better":
                market.search_better(pl)
                break;
            case "add":
                market.additem(pl)
                break;
            case "edit":
                market.edit(pl)
                break;
            case "del":
                market.del(pl)
                break;
            case "ctrl":
                market.ctrl(pl)
                break;
            case "gui":
                market.main(pl)
                break;
            case "reload":
                loadMarketData()
                out.success(lang.get("command.market.reload.success"))
                break;
            default:
                market.main(pl)
                break
        }
    })
    marketcmd.overload([])
    marketcmd.overload(["args"])
    marketcmd.setup()
}