/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
const { versions, fix, author, path, info, info2, } = require("./consts.js");
const { imports, addlog, moneys, isPositiveInteger, same, replacestr, parseItemNbt, parseallitems, reductItembysnbt, reductItembytype } = require("./lib.js");
const { config, lang, shopdata, shopdatajson, marketdata, } = require("./config.js");
/**
 * 商店组gui
 * @param {Number} type 
 * @param {Player} player 玩家
 * @param {Object} data 商品数据
 * @param {Number} [page=0] 当前页码，默认为0
 */
function shopgroupgui(type, player, data, page = 0) {
    const groupdata = data.data;
    const ITEMS_PER_PAGE = config.get("itemsperpage"); // 每页显示的条目数
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageData = groupdata.slice(startIndex, endIndex);
    const totalPages = Math.ceil(groupdata.length / ITEMS_PER_PAGE);

    const gui = mc.newSimpleForm();
    type == 0 ? gui.setTitle(replacestr(lang.get("shop.buy.group"), { info: info, name: data.name })) : gui.setTitle(replacestr(lang.get("shop.sell.group"), { info: info, name: data.name }));
    gui.setContent(replacestr(lang.get("shop.group.content"), { page: page + 1, totalPages: totalPages }));

    currentPageData.forEach(item => {
        var str
        if (item.type == "item") {
            str = replacestr(lang.get("shop.itembuttonname"), { "item.name": item.name, "item.money": item.data[0].money, "money.name": moneys.conf.name })
        } else {
            str = replacestr(lang.get("shop.groupbuttonname"), { "item.name": item.name })
        }
        if (item.image != null && item.image != "") {
            gui.addButton(str, item.image)
        } else if (item.type == "item") {
            gui.addButton(str, imports.FinalTextures.getTextures(item.data[0].id))
        } else {
            gui.addButton(str)
        }
    });

    // 添加翻页按钮
    if (page > 0) {
        gui.addButton(lang.get("shop.button.lastpage"), config.get("logo")["shop.lastpage"]);
    }
    if (endIndex < groupdata.length) {
        gui.addButton(lang.get("shop.button.nextpage"), config.get("logo")["shop.nextpage"]);
    }
    gui.addButton(lang.get("gui.cancel"), config.get("logo")["gui.cancel"]);

    player.sendForm(gui, (pl, id) => {
        if (id == null) {
            pl.tell(info + lang.get("gui.exit"));
            return;
        }

        const lastButtonIndex = currentPageData.length + (page > 0 ? 1 : 0) + (endIndex < groupdata.length ? 1 : 0);
        if (id === lastButtonIndex) {
            pl.tell(info + lang.get("gui.exit"));
            return;
        }

        if (page > 0 && id === currentPageData.length) {
            // 上一页
            shopgroupgui(type, player, data, page - 1);
        } else if (endIndex < groupdata.length && id === currentPageData.length + (page > 0 ? 1 : 0)) {
            // 下一页
            shopgroupgui(type, player, data, page + 1);
        } else {
            const selectedData = groupdata[startIndex + id];
            type == 0 ? shop.buy(selectedData.type == "item" ? 0 : 1, pl, selectedData) : shop.sell(selectedData.type == "item" ? 0 : 1, pl, selectedData)
        }
    });
}
const shop = {
    /**
     * 购买
     * @param {Number} type 1物品 2组
     * @param {Player} player 玩家
     * @param {Object} data 商品信息
     */
    buy(type, player, data) {
        if (type == 0) {
            var _data = data
            const itemdata = data.data[0];
            const gui = mc.newCustomForm();
            const price = config.get("VIPdiscount") && imports.PVip.getplvipstatus(player.realName) ? itemdata.money * config.get("discount") : itemdata.money;
            gui.setTitle(replacestr(lang.get("shop.buy.title"), { info: info, "item.name": data.name, "item.money": itemdata.money }));
            gui.addLabel(replacestr(lang.get("shop.buy.tip"), { "item.name": data.name, "price": price, "item.id": itemdata.id, "item.aux": itemdata.aux, "original_price": itemdata.money }));
            gui.addInput(lang.get("shop.input.buycount"));
            player.sendForm(gui, (pl, data) => {
                if (data == null || data[1] == "") {
                    pl.tell(info + lang.get("gui.exit"));
                    return
                }
                const quantity = Number(data[1]);
                if (!isPositiveInteger(quantity)) {
                    pl.tell(info + lang.get("shop.mustnum"));
                    return
                }
                const totalCost = price * quantity;
                if (moneys.get(pl) < totalCost) {
                    pl.tell(info + lang.get("shop.buy.no") + moneys.get(pl));
                } else {
                    moneys.reduce(pl, totalCost) && mc.runcmdEx(`give "${pl.realName}" ${itemdata.id} ${quantity} ${itemdata.aux} `)
                    addlog(player, replacestr(lang.get("log.shop.buy"), { "item.name": _data.name, "item.id": itemdata.id, "quantity": quantity, "totalCost": totalCost }))
                }
            })
        } else {
            shopgroupgui(0, player, data)
        }
    },
    sell(type, player, data) {
        if (type == 0) {
            const itemdata = data.data[0];
            const gui = mc.newCustomForm();
            var _data = data
            gui.setTitle(replacestr(lang.get("shop.sell.title"), { info: info, "item.name": data.name }));
            gui.addLabel(replacestr(lang.get("shop.sell.tip"), { "data.name": data.name, "itemdata.id": itemdata.id, "itemdata.money": itemdata.money }));
            const itemCount = player.getInventory().getAllItems().reduce((acc, item) => item.type === itemdata.id && item.aux === itemdata.aux ? acc + item.count : acc, 0);
            gui.addInput(replacestr(lang.get("shop.input.sellcount"), { itemCount: itemCount }))
            player.sendForm(gui, (pl, data) => {
                if (data == null || data[1] == "") {
                    pl.tell(info + lang.get("gui.exit"));
                    return
                }
                const quantity = data[1] == "all" ? itemCount : Number(data[1]);
                if (!isPositiveInteger(quantity) && quantity != 0) {
                    pl.tell(info + lang.get("shop.mustnum"));
                    return
                } else if (quantity == 0) {
                    pl.tell(info + lang.get("shop.sell.no") + itemCount)
                    return
                }
                const totalgive = quantity * itemdata.money;
                if (itemCount < quantity) {
                    pl.tell(info + lang.get("shop.sell.no") + itemCount);
                } else {
                    reductItembytype(pl, itemdata.id, quantity) && moneys.add(pl, totalgive)
                    pl.tell(info + lang.get("shop.sell.ok"))
                    addlog(player, replacestr(lang.get("log.shop.sell"), { "item.name": _data.name, "item.id": itemdata.id, "quantity": quantity, "totalCost": totalgive }))
                }
            })
        } else {
            shopgroupgui(1, player, data)
        }
    }
}
module.exports = {
    shop,
}