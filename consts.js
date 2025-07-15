/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
const { addlog, moneys, isPositiveInteger, same, replacestr, parseItemNbt, parseallitems, reductItembysnbt, reductItembytype } = require("./lib.js");
const { config, lang, shopdata, shopdatajson, marketdata, } = require("./config.js");
const versions = [[3, 0, 0], "3.0.0"];
const fix = " Beta 25.07.16 开发版";
const author = "Planet工作室-星辰开发组-春风";
const path = "./plugins/Planet/PShop/";
const info = config.get("info").shop || "§l§b[Shop] §r";
const info2 = config.get("info").market || "§l§b[市场] §r";
module.exports = {
    versions,
    fix,
    author,
    path,
    addlog,
    info,
    info2,
}
mc.regConsoleCmd("d", "debug", (args) => {
    eval(args[0])
})