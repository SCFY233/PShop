// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { config, lang, shopdata } from "./consts.js"
import { PageForm } from "./lib/form.js"
import { addgiveItems, addgiveMoneys, isPositiveInteger, ReplaceStr, setgiveReduceMoneys } from "./lib/lib.js"
export const shop = {
    /**
     * 主表单
     * @param {Player} player 
     * @param {Function} backfunction 
     */
    main: function (player, backfunction) {
        const gui = mc.newSimpleForm().setTitle(lang.get("gui.shop.main.title")).setContent(lang.get("gui.shop.main.content"))
        gui.addButtons([lang.get("gui.shop.main.buy"), lang.get("gui.shop.main.sell"), lang.get("gui.shop.main.back")], [config.getIcon("shop.buy"), config.getIcon("shop.sell"), config.get("gui.back")])
        player.sendForm(gui, function (player, id) {
            if (id == 0) {
                shop.buy(player)
            } else if (id == 1) {
                shop.sell(player)
            } else if (id == 2) {
                backfunction(player)
            }
        })
    },
    /**
     * 购买表单
     * @param {Player} player 
     * @param {Function} backfunction 
     */
    buyGroup: function (player, sdata, backfunction) {
        const buyList = sdata.data || sdata || []
        const list = []
        buyList.forEach(item => list.push({ text: item.name, image: item.image }))
        const form = new PageForm(lang.get("gui.shop.buy.title"), lang.get("gui.shop.buy.content"), list, function (pl, id) {
            const item = buyList[id]
            shop.buyItem(pl, item, backfunction)
        })
        form.sendTo(player, [{ text: lang.get("gui.shop.buy.back"), image: config.getIcon("gui.back") }], () => backfunction)
    },
    buyItem: function (player, item, backfunction, defaultconfig) {
        if (item.type == "group") return shop.buyGroup(player, item, backfunction)
        if (item.type == "item") {
            const gui = mc.newCustomForm()
                .setTitle(ReplaceStr(lang.get("gui.shop.buy.item.title", { "item.name": item.name })))
                .addLabel(ReplaceStr(lang.get("gui.shop.buy.item.content"), {
                    "item.name": item.name, "money": item.money, "item.id": item.id,
                    "item.aux": item.aux//兼容性保留
                }))
            //不忽略Aux配置
            if (!(item.IgnoneAux ?? config.get("shop_ignore_aux_default"))) {
                gui.addLabel(ReplaceStr(lang.get("gui.shop.buy.item.content2"), { "item.aux": item.aux }))
            }
            gui.addInput(lang.get("gui.shop.buy.item.count"), "", defaultconfig?.count || "", lang.get("gui.tip.count"))
            gui.setSubmitButton(lang.get("gui.shop.buy.item.submit"))
            player.sendForm(gui, (pl, datas) => {
                if (datas == null || datas?.[2] == "" || datas?.[2] == null) return backfunction(pl)
                const count = Number(datas[2])
                if (!isPositiveInteger(count)) return pl.sendMessageForm(lang.get("gui.tip"), ReplaceStr(lang.get("gui.tip.mustPositiveInteger"), { "input": datas[2] }), lang.get("gui.comfirm"), config.getIcon('gui.comfirm'), (pl) => {
                    return shop.buyItem(pl, item, backfunction, { count: datas[2] || "" })
                })
            })
        }
    }
}
