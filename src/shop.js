// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { getSMoney } from "../../SMoney/main.js"
import { config, lang, moneyname, texture_paths, shopdata } from "./consts.js"
import { PageForm } from "./lib/form.js"
import { moneys, isPositiveInteger, ReplaceStr, getItemInfo, getCanPutItemCount, getEnchContent, newItemWithAux, getItemContent, getCanReductItemCount, reduceItembyType, reduceItembyNbt } from "./lib/lib.js"
export const shop = {
    /**
     * 主表单
     * @param {Player} player 
     * @param {Function} backfunction 
     */
    main(player, backfunction) {
        const gui = mc.newSimpleForm().setTitle(lang.get("form.shop.main.title")).setContent(lang.get("form.shop.main.content"))
        gui.addButtons([lang.get("form.shop.main.button.buy"), lang.get("form.shop.main.button.sell"), lang.get("form.back")], [config.getIcon("shop:buy"), config.getIcon("shop:sell"), config.getIcon("form:back")])
        player.sendForm(gui, function (player, id) {
            if (id == 0) {
                shop.buy(player, (pl) => shop.main(pl, backfunction))
            } else if (id == 1) {
                shop.sell(player, (pl) => shop.main(pl, backfunction))
            } else if (id == 2) {
                backfunction ? backfunction(player) : void 0
            }
        })
    },
    getIcon(data) {
        if (!data.image || (data.image == "" && data.type == "item")) {
            if (data.data[0]?.snbt == true) {
                const tmpItem = mc.newItem(NBT.parseSNBT(data.data[0]?.snbtstr))
                return texture_paths.get(tmpItem.type, tmpItem.aux)
            } else if (data.data[0]?.id) {
                return texture_paths.get(data.data[0]?.id, data.data[0]?.aux)
            }
            else return config.get("texture_path")?.default
        } else return data?.image
    },
    buy(player, backfunction) {
        return shop.group(player, shopdata.Buy, shop.buyItem, { name: "", actionkey: "form.action.buy" }, backfunction)
    },
    group(player, sdata, callback, options = { name: "", actionkey: "form.action.do" }, backfunction) {
        const items = []
        sdata.forEach(element => {
            items.push({ name: element.name, image: shop.getIcon(element) })
        });
        const gui = new PageForm(ReplaceStr(lang.get("form.shop.group.title"), { "name": options.name ?? "" }),
            ReplaceStr(lang.get("form.shop.group.content"), { "action": lang.get(options.actionkey) }),
            items, function (player, index) {
            return callback(player, sdata[index], options, (pl) => shop.group(pl, sdata, callback, options, backfunction))
        })
        gui.sendTo(player, [{ name: lang.get("form.back"), image: config.getIcon("form:back") }], (player) => backfunction(player))
    },
    buyItem(player, idata, options, backfunction) {
        if (idata.type == "group") return shop.group(player, idata.data, shop.buyItem, options, backfunction)
        else {
            const data = idata.data[0]
            const tmpItem = data.snbt != true ? newItemWithAux(data.id, 1, data.aux) : mc.newItem(NBT.parseSNBT(data.snbtstr))
            const content = getItemContent(tmpItem, "")
            const icontent = ReplaceStr(`${lang.get("form.item.content.shop")}\n${ReplaceStr(lang.get("form.item.content.shop.name"), { iname: idata.name })}\n${ReplaceStr(lang.get("form.item.content.shop.price"), { price: data.money })}\n`, { "prefix.type": lang.get("prefix.type"), "prefix.end": lang.get("prefix.end") }) + content
            const gui = mc.newCustomForm()
            gui.setTitle(ReplaceStr(lang.get("form.shop.buy.item.title"), { name: idata.name }))
            gui.addLabel(icontent)
            gui.addDivider()
            const maxcount = Math.ceil(moneys.get(player) / data.money)
            gui.addInput(ReplaceStr(lang.get("form.shop.buy.item.count"), {
                plmoney: moneys.get(player),
                moneyname: moneyname,
                count: maxcount
            }), "", options.input ?? "", lang.get("form.tip.item.count"))
            player.sendForm(gui, (pl, d) => {
                if (d == null) return
                if (d[2] == "") return backfunction(pl)
                const plcount = Number(d[2])
                if (!isPositiveInteger(plcount) || plcount > maxcount) pl.sendMessageForm(ReplaceStr(lang.get("form.shop.buy.item.title"), { name: idata.name }),
                    ReplaceStr(!isPositiveInteger(plcount) ? lang.get("form.shop.item.count.type") : lang.get("form.shop.buy.item.count.max"), { input: d[2], maxcount }),
                    lang.get("form.back"), config.getIcon("form:back"), (pl, id) => {
                        if (id == null) return
                    return shop.buyItem(pl, idata, Object.assign(options, { input: d[2] }), backfunction)
                })
                else {
                    const totalCost = plcount * Number(data.money)
                    pl.sendBetterModalForm(ReplaceStr(lang.get("form.shop.buy.item.title"), { name: idata.name }),
                        ReplaceStr(lang.get("form.shop.buy.item.confirm"), { iname: idata.name, count: plcount, totalCost, moneyname: moneyname, plmoney: moneys.get(pl) - totalCost }),
                        lang.get("form.confirm"), lang.get("form.back"),
                        config.getIcon("form:confirm"), config.getIcon("form:back"), (pl, id) => {
                            if (id == null) return
                            if (id == false) return shop.buyItem(pl, idata, Object.assign(options, { input: String(plcount) }), backfunction)
                            if (moneys.reduce(pl, totalCost) == false) return
                            let r
                            if (data.snbt != true) {
                                r = pl.giveItem(newItemWithAux(data.id, 1, data.aux), plcount)
                            } else {
                                r = pl.giveItem(mc.newItem(NBT.parseSNBT(data.snbtstr)), plcount)
                            }
                            if (r) pl.sendBetterModalForm(ReplaceStr(lang.get("form.shop.buy.item.title"), { name: idata.name }),
                                ReplaceStr(lang.get("form.shop.buy.item.success"), { plcount, iname: idata.name, moneyname: moneyname, plmoney: moneys.get(pl) }),
                                lang.get("form.back"), lang.get("form.cancel"),
                                config.getIcon("form:confirm"), config.getIcon("form:back"), (pl, id) => {
                                    if (id == null || id == false) return
                                    if (id == true) return backfunction(pl)
                                })
                        })
                }
            })
        }
    },
    sell(player, backfunction) {
        return shop.group(player, shopdata.Sell, shop.sellItem, { actionkey: "form.action.sell" }, backfunction)
    },
    sellItem(player, idata, options, backfunction) {
        if (idata.type == "group") return shop.group(player, idata.data, shop.sellItem, options, backfunction)
        else {
            const data = idata.data[0]
            const tmpItem = data.snbt != true ? newItemWithAux(data.id, 1, data.aux) : mc.newItem(NBT.parseSNBT(data.snbtstr))
            const content = getItemContent(tmpItem, "")
            const icontent = ReplaceStr(`${lang.get("form.item.content.shop")}\n${ReplaceStr(lang.get("form.item.content.shop.name"), { iname: idata.name })}\n${ReplaceStr(lang.get("form.item.content.shop.price"), { price: data.money })}\n`, { "prefix.type": lang.get("prefix.type"), "prefix.end": lang.get("prefix.end") }) + content
            const gui = mc.newCustomForm()
            let maxcount
            if (data.snbt)
                maxcount = getCanReductItemCount(player, NBT.parseSNBT(data.snbtstr))
            else
                maxcount = getCanReductItemCount(player, data.id, data.aux, data.auxStrict ?? false)
            gui.setTitle(ReplaceStr(lang.get("form.shop.sell.item.title"), { name: idata.name }))
            gui.addLabel(icontent)
            gui.addDivider()
            gui.addInput(ReplaceStr(lang.get("form.shop.sell.item.count"), {
                moneyname: moneyname,
                count: maxcount,
                iname: idata.name
            }), "", options.input ?? "", lang.get("form.tip.item.count"))
            player.sendForm(gui, (pl, d) => {
                if (d == null) return
                if (d[2] == "") return backfunction(pl)
                const plcount = Number(d[2])
                if (!isPositiveInteger(plcount) || plcount > maxcount) {
                    pl.sendMessageForm(ReplaceStr(lang.get("form.shop.sell.item.title"), { name: idata.name }),
                        ReplaceStr(!isPositiveInteger(plcount) ? lang.get("form.shop.item.count.type") : lang.get("form.shop.sell.item.count.max"), { input: d[2], maxcount }),
                        lang.get("form.back"), config.getIcon("form:back"), (pl, id) => {
                            if (id == null) return
                        return shop.sellItem(pl, idata, Object.assign(options, { input: d[2] }), backfunction)
                    })
                }
                else {
                    const totalgive = plcount * Number(data.money)
                    pl.sendBetterModalForm(ReplaceStr(lang.get("form.shop.sell.item.title"), { name: idata.name }),
                        ReplaceStr(lang.get("form.shop.sell.item.confirm"), { iname: idata.name, count: plcount, totalgive, moneyname: moneyname, plcount: maxcount - plcount }),
                        lang.get("form.confirm"), lang.get("form.back"),
                        config.getIcon("form:confirm"), config.getIcon("form:back"), (pl, id) => {
                            if (id == null) return
                            if (id == false) return shop.sellItem(pl, idata, Object.assign(options, { input: String(plcount) }), backfunction)
                            let r
                            if (data.snbt != true)
                                r = reduceItembyType(player, data.id, data.aux, plcount, data.auxStrict ?? false)
                            else
                                r = reduceItembyNbt(player, data.snbtstr, plcount)
                            if (r == false) return
                            if (moneys.add(player, totalgive)) pl.sendBetterModalForm(ReplaceStr(lang.get("form.shop.sell.item.title"), { name: idata.name }),
                                ReplaceStr(lang.get("form.shop.sell.item.success"), { totalgive, moneyname: moneyname, plmoney: moneys.get(pl) }),
                                lang.get("form.back"), lang.get("form.cancel"),
                                config.getIcon("form:confirm"), config.getIcon("form:back"), (pl, id) => {
                                    if (id == null || id == false) return
                                    if (id == true) return backfunction(pl)
                                })
                        })
                }
            })
        }
    }
}