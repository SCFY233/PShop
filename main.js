// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
/// <reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { author, versions, fix, config, workpath, lang, loadShopData, loaddatas } from "./src/consts.js"
import { shop } from "./src/shop.js"
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

const pshopcmd = mc.newCommand(config.get("commands").pshop.cmd, config.get("commands").pshop.desc, PermType.Any)
pshopcmd.setEnum("saction", ["version", "reload"])
pshopcmd.optional("action", ParamType.Enum, "saction", 1)
pshopcmd.overload(["saction"])
pshopcmd.overload([])
pshopcmd.setCallback((_cmd, _ori, out, res) => {
    switch (res.action) {
        case "reload":
            loaddatas() ? out.success("success") : out.error("error")
            break;
        default:
            out.success(`PShop ${versions}${fix} by ${author}`)
            break;
    }
})
pshopcmd.setup()