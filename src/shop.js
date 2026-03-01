// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { config, lang, shopdata, moneys } from "./consts.js"
import { PageForm } from "./lib/form.js"
import { addgiveItem, addgiveMoney, addgiveReduceMoney, isPositiveInteger, ReplaceStr, getItemInfo, getCanPutItemCount } from "./lib/lib.js"
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
        let buyList
        if (Array.isArray(sdata)) buyList = sdata
        else if (typeof sdata == "object") buyList = sdata.data
        else buyList = []
        const list = []
        buyList.forEach(item => list.push({ text: item.name, image: item.image }))
        const form = new PageForm(lang.get("gui.shop.buy.title"), lang.get("gui.shop.buy.content"), list, function (pl, id) {
            const item = buyList[id]
            shop.buyItem(pl, item, backfunction)
        })
        form.sendTo(player, [{ text: lang.get("gui.shop.buy.back"), image: config.getIcon("gui.back") }], () => backfunction)
    },
    /**
     * 购买物品菜单
     * @param {Player} player 
     * @param {Object} item 
     * @param {Function} backfunction 
     * @param {Object} defaultconfig 
     * @returns 
     */
    buyItem: function (player, item, backfunction, defaultconfig) {
        if (item.type == "group") return shop.buyGroup(player, item, backfunction)
        const itemdata = item.data[0]
        if (item.type == "item") {
            const gui = mc.newCustomForm()
                .setTitle(ReplaceStr(lang.get("gui.shop.buy.item.title", { "item.name": item.name })))
                .addLabel(ReplaceStr(lang.get("gui.shop.buy.item.content"), {
                    "item.name": item.name, "money": item.money, "item.type": itemdata.id,
                    "item.aux": itemdata.aux//兼容性保留
                }))
            //无不忽略Aux配置
            const exampleitem = mc.newItem(itemdata.id, 1)
            exampleitem.setAux(itemdata.aux)
            const canputcount = getCanPutItemCount(player, exampleitem.getNbt(), itemdata.aux, true)
            gui.addInput(ReplaceStr(lang.get("gui.shop.buy.item.count"), {
                "canputcount": canputcount
            })
                , "", defaultconfig?.count || "", lang.get("gui.tip.count"))
            gui.setSubmitButton(lang.get("gui.shop.buy.item.submit"))
            player.sendForm(gui, (pl, datas) => {
                if (datas == null || datas?.[2] == "" || datas?.[2] == null) return backfunction(pl)
                const count = Number(datas[2])
                if (!isPositiveInteger(count)) return pl.sendMessageForm(lang.get("gui.tip"), ReplaceStr(lang.get("gui.tip.mustPositiveInteger"), { input: datas[2] }), lang.get("gui.back"), config.getIcon('gui.back'), (pl, r) => {
                    if (r) return shop.buyItem(pl, item, backfunction, { count: datas[2] || "" })
                })
                const buyInfo = getItemInfo(item)
                const totalCost = Number(item.money) * count
                const plmoney = moneys.get(pl.xuid)
                pl.sendBetterModalForm(lang.get("gui.shop.buy.item.confirm.title"), ReplaceStr(lang.get("gui.shop.buy.item.confirm.content"), {
                    
                }), lang.get("gui.comfirm"), lang.get("gui.cancel"), config.getIcon('gui.comfirm'), config.getIcon('gui.cancel'), (pl, result) => {
                    if (result != null) {
                        if (result) {
                            if (plmoney < totalCost) return pl.sendMessageForm(lang.get("gui.tip"), ReplaceStr(lang.get("gui.tip.nomoney"), {
                                totalCost: totalCost, money: plmoney
                            }), lang.get("gui.back"), config.getIcon('gui.back'), (pl, r) => {
                                if (r) return shop.buyItem(pl, item, backfunction, { count: datas[2] || "" })
                            })
                            if (canputcount < count) return pl.sendMessageForm(lang.get("gui.tip"), ReplaceStr(lang.get("gui.tip.noroom"), { count, canput }))
                            let cmd
                            if (moneys.reduce(pl, totalCost)) cmd = mc.runcmdEx(`give "${pl.realName}" ${itemdata.type} ${count} ${itemdata.aux}`)
                            pl.sendBetterModalForm(lang.get("gui.shop.buy.item.success.title"), '', `${lang.get("gui.shop.buy.item.success.content")}\n${cmd.output}`, lang.get("gui.back"), lang.get("gui.cancel"), config.getIcon("gui.back"), config.getIcon("gui.cancel"), function (pl, r) {
                                if (res) {
                                    shop.buyItem(pl, item, backfunction)
                                }
                            })
                        } else shop.buyItem(pl, item, backfunction, defaultconfig)
                    }
                })
            })
        }
    }
}
