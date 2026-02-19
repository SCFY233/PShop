// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { } from "./src/network.js";
import { texture_paths } from "./src/consts.js";
var var1, var2
mc.listen("onJump", (pl) => {
    var g = mc.newSimpleForm()
    let items = Object.keys(texture_paths.data)
    items = items.slice(var1, var2)
    for (let i = 0; i < items.length; i++) {
        g.addButton(items[i], texture_paths.get(items[i], 0))
    }
    pl.sendForm(g, () => { })
})
mc.regPlayerCmd("d", "", (_pl, args) => {
    eval(args[0])
})