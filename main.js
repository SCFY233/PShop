// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
const { versions, fix, author, path, imports, info, info2, } = require("./consts.js");
const { addlog, moneys, isPositiveInteger, same, replacestr, parseItemNbt, parseallitems, reductItembysnbt, reductItembytype } = require("./lib.js");
const { config, lang, shopdata, shopdatajson, marketdata, } = require("./config.js");
const { shop } = require("./shop.js");
if (config.get("enable").shop) {
    const com = mc.newCommand(config.get("commands").shop, lang.get("command.shop.desc"), PermType.Any);
    com.setEnum("action", ["gui", "buy", "sell"]);
    com.optional("action", ParamType.Enum, "action", "action", 1);
    com.overload(["action"]);
    com.setCallback((_cmd, ori, out, res) => {
        if (ori.type !== 0) {
            out.error(lang.get("command.ori.typeerror"));
            return;
        }
        const player = ori.player;
        const action = res.action || "gui";
        switch (action) {
            case "gui":
                const shopGui = mc.newSimpleForm();
                shopGui.setTitle(info);
                shopGui.addButton(replacestr(lang.get("shop.buy.maintitle"), { info: "" }), config.get("logo")["shop.buy"]);
                shopGui.addButton(replacestr(lang.get("shop.sell.maintitle"), { info: "" }), config.get("logo")["shop.sell"]);
                shopGui.addButton(lang.get("gui.cancel"), config.get("logo")["gui.cancel"]);
                player.sendForm(shopGui, (pl, id) => {
                    if (id == null || id === 2) {
                        pl.tell(info + lang.get("gui.exit"));
                        return;
                    }
                    const menuType = id === 0 ? "Buy" : "Sell";
                    const menuGui = mc.newSimpleForm();
                    menuGui.setTitle(info + (menuType === "Buy" ? replacestr(lang.get("shop.buy.maintitle"), { info: "" }) : replacestr(lang.get("shop.sell.maintitle"), { info: "" })));
                    shopdata[menuType].forEach(item => menuGui.addButton(item.name, item.image));
                    menuGui.addButton(lang.get("gui.cancel"), config.get("logo")["gui.cancel"]);
                    player.sendForm(menuGui, (pl, menuId) => {
                        if (menuId == null || menuId === shopdata[menuType].length) {
                            pl.tell(info + lang.get("gui.exit"));
                            return;
                        }
                        const selectedData = shopdata[menuType][menuId];
                        if (menuType === "Buy") {
                            shop.buy(selectedData.type == "item" ? 0 : 1, pl, selectedData)
                        } else if (menuType === "Sell") {
                            shop.sell(selectedData.type == "item" ? 0 : 1, pl, selectedData)
                        }
                    });
                });
                break;
            case "buy":
                shop.buy(1, player, { name: replacestr(lang.get("shop.buy.maintitle"), { info: "" }), data: shopdata.Buy, type: "group" });
                break;
            case "sell":
                shop.sell(1, player, { name: replacestr(lang.get("shop.sell.maintitle"), { info: "" }), data: shopdata.Sell, type: "group" });
                break;
        }
    });
    com.setup();
}


//market部分继续咕咕咕
const market = {}









//加载
mc.listen("onServerStarted", () => {
    log(`PShop 商店系统插件---加载成功,当前版本:${versions[1]}${fix} 作者: ${author}`);
    if (fix != "" && fix != " Release") logger.warn("你现在使用的版本为开发版,请勿用于生产环境!!!")
})
/* debug命令，请勿使用！！！！！
mc.regConsoleCmd("d", "debug", (args) => {
    eval(args[0])
})
mc.regPlayerCmd("d", "debug", (player, args) => {
    player.tell(JSON.stringify(eval(args[0])))
    player.tell(String(eval(args[0])))
})
var var1, var2 = null
mc.regPlayerCmd("dd", "debug", (player, args) => {
    var1 = eval(args[0])
})
mc.regPlayerCmd("ddd", "debug", (player, args) => {
    var2 = eval(args[0])
})
*/