// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { getSMoney } from "../../SMoney/main.js"
import { config, lang, moneyname, moneys, texture_paths } from "./consts.js"
import { PageForm } from "./lib/form.js"
import { isPositiveInteger, ReplaceStr, getItemInfo, getCanPutItemCount, getEnchContent } from "./lib/lib.js"
export const shop = {
    /**
     * 主表单
     * @param {Player} player 
     * @param {Function} backfunction 
     */
    main: function (player, backfunction) {
        const gui = mc.newSimpleForm().setTitle(lang.get("gui.shop.main.title")).setContent(lang.get("gui.shop.main.content"))
        gui.addButtons([lang.get("gui.shop.main.button.buy"), lang.get("gui.shop.main.button.sell"), lang.get("gui.back")], [config.getIcon("shop.buy"), config.getIcon("shop.sell"), config.get("gui.back")])
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
    getIcon(data) {
        if (!data.image) {
            return texture_paths.get(data.data?.[0].id, data.data?.[0].aux)
        } else return data?.image
    },
    /**
     * 购买表单
     * @param {Player} player 
     * @param {Function} backfunction 
     */
    buyGroup: function (player, sdata, backfunction) {
        let buyList 
        if (Array.isArray(sdata)) buyList = sdata
        else buyList = sdata.data
        const list = []
        buyList.forEach(item => list.push({ text: item.name, image: shop.getIcon(item) }))
        const form = new PageForm(ReplaceStr(lang.get("gui.shop.buy.group.title"), { "item.name": sdata.name }), lang.get("gui.shop.buy.group.content"), list, function (pl, id) {
            const item = buyList[id]
            shop.buyItem(pl, item, (pl) => shop.buyGroup(pl, sdata, backfunction))
        })
        form.sendTo(player, [{ text: lang.get("gui.back"), image: config.getIcon("gui.back") }], (pl) => backfunction(pl))
    },
    /**
     * 购买物品菜单
     * @param {Player} player 
     * @param {Object} item 
     * @param {Function} backfunction 
     * @param {Object} defaultinput 
     * @returns 
     */
    buyItem: function (player, item, backfunction, defaultinput) {
        if (item.type == "group") return shop.buyGroup(player, item, backfunction)
        const itemdata = item.data[0]
        if (item.type == "item") {
            const exampleitem = mc.newItem(itemdata.id, 1)
            const gui = mc.newCustomForm()
                .setTitle(ReplaceStr(lang.get("gui.shop.buy.item.title"), { "item.name": item.name }))
            const info = getItemInfo(exampleitem)
            gui.addLabel(ReplaceStr(lang.get("gui.shop.buy.item.content"), {
                "item.name": info.name, "item.money": itemdata.money, "item.type": info.type,
                "item.aux": info.aux, "pl.money": moneys.get(player)
            }))
            if (info.enchinfo.length > 0) {
                gui.addLabel(getEnchContent(info.enchinfo))
            }
            //无忽略Aux配置
            exampleitem.setAux(itemdata.aux)
            const canputcount = getCanPutItemCount(player, exampleitem.getNbt(), itemdata.aux, true)
            gui.addInput(ReplaceStr(lang.get("gui.shop.buy.item.count"), {
                "canputcount": canputcount
            })
                , "", defaultinput?.count || "", lang.get("gui.tip.count"))
            gui.setSubmitButton(lang.get("gui.shop.buy.item.submit"))
            player.sendForm(gui, (pl, datas) => {
                if (datas == null) return
                if (datas?.[1] == "" || datas?.[1] == null) return backfunction(pl)
                const count = Number(datas[1])
                if (!isPositiveInteger(count)) return pl.sendMessageForm(lang.get("gui.tip"), ReplaceStr(lang.get("gui.tip.mustPositiveInteger"), { input: datas?.[1] }), lang.get("gui.back"), config.getIcon('gui.back'), (pl, r) => {
                    if (r == 0) return shop.buyItem(pl, item, backfunction, { count: datas?.[1] || "" })
                })
                const totalCost = Number(itemdata.money) * count
                const plmoney = moneys.get(pl)
                if (plmoney < totalCost) return pl.sendMessageForm(lang.get("gui.tip"), ReplaceStr(lang.get("gui.tip.nomoney"), {
                    totalCost: totalCost, 'pl.money': plmoney, 'money.name': moneyname
                }), lang.get("gui.back"), config.getIcon('gui.back'), (pl, r) => {
                    if (r == 0) return shop.buyItem(pl, item, backfunction, { count: datas?.[1] || "" })
                })
                if (canputcount < count) return pl.sendMessageForm(lang.get("gui.tip"), ReplaceStr(lang.get("gui.tip.noroom"), { count, canput }))
                pl.sendBetterModalForm(lang.get("gui.shop.buy.item.confirm.title"), ReplaceStr(lang.get("gui.shop.buy.item.confirm.content"), {
                    
                }), lang.get("gui.comfirm"), lang.get("gui.cancel"), config.getIcon('gui.comfirm'), config.getIcon('gui.cancel'), (pl, result) => {
                    if (result != null) {
                        if (result) {
                            let cmd
                            if (moneys.reduce(pl, totalCost)) cmd = mc.runcmdEx(`give "${pl.realName}" ${itemdata.id} ${count} ${itemdata.aux}`)
                            if (cmd.success)
                                pl.sendBetterModalForm(lang.get("gui.shop.buy.item.success.title"), `${lang.get("gui.shop.buy.item.success.content")}\n${cmd.output}`, lang.get("gui.back"), lang.get("gui.cancel"), config.getIcon("gui.back"), config.getIcon("gui.cancel"), function (pl, res) {
                                if (res) {
                                    shop.buyItem(pl, item, backfunction)
                                }
                            })
                        } else shop.buyItem(pl, item, backfunction, defaultinput)
                    }
                })
            })
        }
    }
}
