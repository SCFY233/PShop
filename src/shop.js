// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { getSMoney } from "../../SMoney/main.js"
import { config, lang, moneyname, texture_paths, shopdata } from "./consts.js"
import { PageForm } from "./lib/form.js"
import { moneys, isPositiveInteger, ReplaceStr, getItemInfo, getCanPutItemCount, getEnchContent, newItemWithAux, getItemContent } from "./lib/lib.js"
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
                shop.buy(player, shop.main)
            } else if (id == 1) {
                shop.sell(player)
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
                return callback(player, sdata[index], index, sdata, options, backfunction)
            }
        )
        gui.sendTo(player, [{ name: lang.get("form.back"), image: config.getIcon("form:back") }], (player) => backfunction(player))
    },
    buyItem(player, idata, _index, sdata, options, backfunction) {
        if (idata.type == "group") return shop.group(player, idata.data, shop.buyItem, { name: idata.name, actionkey: "form.action.buy" }, () => {
            shop.group(player, sdata, shop.buyItem, options, backfunction)
        })
        else {
            const data = idata.data[0]
            const tmpItem = data.snbt != true ? newItemWithAux(data.id, 1, data.aux) : mc.newItem(NBT.parseSNBT(data.snbtstr))
            const content = getItemContent(tmpItem, "")
            const icontent = `${lang.get("form.item.content.shop")}\n${ReplaceStr(lang.get("form.item.content.shop.name"), { iname: idata.name })}\n${ReplaceStr(lang.get("form.item.content.shop.price"), { price: data.money })}\n${content}`
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
            player.sendForm(gui, (pl, data) => {
                if (data == null) return
                if (data[2] == "") return backfunction(pl)
                const plcount = Number(data[2])
                if (!isPositiveInteger(plcount) || plcount > maxcount) pl.sendMessageForm(ReplaceStr(lang.get("form.shop.buy.item.title"), { name: idata.name }),
                    ReplaceStr(!isPositiveInteger(plcount) ? lang.get("form.shop.buy.item.count.type") : lang.get("form.shop.buy.item.count.max"), { input: data[2], maxcount }),
                    lang.get("form.back"), config.getIcon("form:back"), (pl, id) => {
                        if (id == null) return
                        return shop.buyItem(pl, idata, _index, sdata, Object.assign(options, { input: data[2] }), backfunction)
                    })
                else {
                    const totalCost = plcount * data.money
                    pl.sendMessageForm(ReplaceStr(lang.get("form.shop.buy.item.title"), { name: idata.name }),
                        ReplaceStr(lang.get("form.shop.buy.item.confirm"), { totalCost, moneyname: moneyname, }),
                        lang.get("form.back"), config.getIcon("form:back"), (pl, id) => {
                            if (id == null) return
                            return shop.buyItem(pl, idata, _index, sdata, Object.assign(options, { input: data[2] }), backfunction)
                        })
                }
            })
        }
    }
}
