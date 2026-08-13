// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
/// <reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { author, versions, fix, config, workpath, lang, loadShopData, loaddatas, chestshopdata, saveChestShopData, loadChestShopData, SignBlockMap, signtileDataMap, sideMap } from "./src/consts.js"
import { shop } from "./src/shop.js"
import { checkUpdate } from "./src/network.js"
import { ReplaceStr, getPosFromPosObj, getAddPos, wlog } from "./src/lib/lib.js"
import { ChestShop, playClientSound } from "./src/lib/packet.js"
import { getSound,chestshops, chestmaps, signmaps, getPosKey, getChestShopIDFromSign, getChestShopIDFromChest, isProtectedShopBlock, ManageChestShop, refresh2, loadChestShop } from "./src/chestshop.js"
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
const chestshopConfig = config.get("commands")?.chestshop;
if (config.get('enable')?.chestshop && chestshopConfig) {
    const chestshopcmd = mc.newCommand(chestshopConfig.cmd, chestshopConfig.desc, PermType.Any);

    chestshopcmd.setEnum("CsAction", ["mgr", "delete", "version", "reload"]);
    chestshopcmd.optional("action", ParamType.Enum, "CsAction", "action", 1);

    chestshopcmd.overload(["CsAction"]);
    chestshopcmd.overload([]);

    chestshopcmd.setCallback((_cmd, ori, out, res) => {
        if (res.action === "version" || ori.type !== 0 || ori.player == null || !res.action) {
            return out.success(`PShop ${versions}${fix} by ${author}`);
        }
        if (res.action === "reload") {
            if (ori.type === 7 || (ori.player && ori.player.isOP())) {
                (loadChestShopData() && loadChestShop()) ? out.success(lang.get("command.chestshop.reload.success")) : out.error(lang.get("command.chestshop.reload.fail"));
            } else {
                out.error(lang.get("command.chestshop.permission.denied"));
            }
            return;
        }
        const pl = ori.player;
        if (["mgr", "delete"].includes(res.action)) {
            const block = pl.getBlockFromViewVector();
            if (!block) return out.error(lang.get("command.chestshop.target.invalid"));
            const shopid = isProtectedShopBlock(block.pos, block.type);
            if (!shopid || !chestshops[shopid]) {
                return out.error(lang.get("command.chestshop.target.not_shop"));
            }
            const chs = chestshops[shopid];
            if (!pl.isOP() && (chs.isSystem || chs.owner !== pl.uuid)) {
                return out.error(lang.get("command.chestshop.permission.denied"));
            }
            if (res.action === "mgr") {
                return ManageChestShop(pl, shopid, chs);
            }
            if (res.action === "delete") {
                const d = chestshopdata[shopid];
                const chestPos = getPosFromPosObj(d.pos);
                const signPos = getAddPos(chestPos, SignBlockMap[sideMap[d.side]]);
                chs.destroy();
                delete chestshopdata[shopid];
                delete chestshops[shopid];
                delete chestmaps[getPosKey(chestPos)];
                delete signmaps[getPosKey(signPos)];
                saveChestShopData();
                mc.setBlock(signPos, "minecraft:air");
                wlog(pl, ReplaceStr(lang.get("log.chestshop.delete"), { pos: chestPos.toString(), shopid: shopid }));
                playClientSound(pl, getSound("success"));
                return out.success(lang.get("tell.chestshop.manage.delete.success"));
            }
        }
    });

    chestshopcmd.setup();
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

