// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { config, lang, moneyname, texture_paths, marketdatajson, prefix } from "./consts.js"
import { PageForm } from "./lib/form.js"
import { moneys, isPositiveInteger, ReplaceStr, newItemWithAux, getItemContent, getCanReductItemCount, reduceItembyType, reduceItembyNbt, getSameItemIndexInArray, wlog, addgiveMoney, addgiveItem } from "./lib/lib.js"

const info2 = prefix.market + " "

/**
 * 在市场数据中查找物品的索引
 * @param {Array} arr 
 * @param {Object} item 
 * @returns {Number}
 */
function getIndexInArray(arr, item) {
    return getSameItemIndexInArray(arr, item)
}

/**
 * 获取相同物品的数量
 * @param {Item[]} items 
 * @param {Item} item 
 * @returns {Number}
 */
function getSameItemCount(items, item) {
    return items.filter(i => i.type === item.type && i.aux === item.aux).reduce((pre, cur) => pre + cur.count, 0)
}

/**
 * 添加日志
 * @param {Player} pl 
 * @param {String} msg 
 */
function addlog(pl, msg) {
    wlog(pl, msg)
}

/**
 * 设置离线玩家的给予物品/金钱
 * @param {String} playername 
 * @param {Number} type 0=金钱, 1=物品
 * @param {Any} data 
 */
function setgives(playername, type, data) {
    const player = mc.getPlayer(playername)
    if (player) {
        if (type === 0) addgiveMoney(player.xuid, data.money, data.name)
        else data.forEach(item => addgiveItem(player.xuid, item, data.name))
    } else {
        if (type === 0) addgiveMoney(playername, data.money, data.name)
        else data.forEach(item => addgiveItem(playername, item, data.name))
    }
}

/**
 * 发送市场物品列表GUI
 * @param {Player} player 
 * @param {String} title 
 * @param {Object[]} items 
 * @param {Number} page 
 * @param {Function} callback 
 * @param {String} backcmd 
 */
function marketitemsgui(player, title, items, page = 0, callback, backcmd) {
    const guiItems = items.map(item => ({
        name: item.name,
        image: market.getIcon(item.type)
    }))
    const gui = new PageForm(title, "", guiItems, (pl, index) => {
        callback(pl, items[index], [backcmd, title, items, page, callback])
    })
    gui.sendTo(player, [{ name: lang.get("gui.back"), image: config.getIcon("form:back") }], (pl) => {
        if (backcmd) eval(backcmd)
        else market.buy_sell(pl)
    })
}

/**
 * 清除不存在的数据
 * @param {Number} mode 
 * @param {Object[]} items 
 * @returns {Object[]}
 */
function clearNonexistentDataAndAddnew(mode, items) {
    var md = market.data
    for (let i = 0; i < items.length; i++) {
        if (getIndexInArray(md, items[i]) == -1) {
            items.splice(i, 1)
        }
    }
    if (mode == 1) {
        for (let i = 0; i < md.length; i++) {
            if (getIndexInArray(items, md[i]) == -1) {
                md.push(md[i])
            }
        }
    }
    return items
}

export const market = {
    data: [],
    loaddata() {
        market.data = JSON.parse(marketdatajson.read()).data
    },
    getIcon(type) {
        return texture_paths.get(type) || config.get("icon")["default"]
    },
    /**
     * 购买或出售物品
     * @param {Player} player 
     * @param {Object} item 
     * @param {Array} backargs 
     */
    buy_sell_item(player, item, backargs) {
        const gui = mc.newSimpleForm()
        gui.setTitle(ReplaceStr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }))
        const itemdata = mc.newItem(NBT.parseSNBT(item.itemnbt))
        if (item.content) {
            gui.setContent(item.content)
        } else {
            gui.setContent(ReplaceStr(lang.get("market.buy_sell_item.content"), {
                "item.name": item.name,
                "itemdata.type": itemdata.type,
                "itemdata.count": itemdata.count,
                "itemdata.aux": itemdata.aux,
                "item.money": item.money,
                "avgmoney": `${(item.money / itemdata.count).toFixed(2)}(${(item.money / itemdata.count)})`,
                "money.name": moneys.conf.name,
                "item.time": item.time,
                "item.player": item.player
            }))
        }
        if (item.type == "sell") {
            gui.addButton(lang.get("market.buy_sell_item.button.buy"), config.getIcon("market:buy"))
        } else {
            gui.addButton(lang.get("market.buy_sell_item.button.sell"), config.getIcon("market:sell"))
        }
        gui.addButton(lang.get("gui.back"), config.getIcon("form:back"))
        player.sendForm(gui, (pl, id) => {
            if (getIndexInArray(market.data, item) == -1)
                pl.sendMessageForm(
                    info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.getIcon("form:back"),
                    (pl) => {
                        marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return
                    })
            if (id == null) {
                marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return
            }
            if (id == 0) {
                if (item.type == "sell") {
                    // 购买卖家出售的物品
                    const gui = mc.newCustomForm()
                    gui.setTitle(ReplaceStr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }))
                    if (item.bypartial != 1) {
                        gui.addLabel(lang.get("market.buy_sell_item.buy.cantbypartial"))
                        gui.addLabel(ReplaceStr(lang.get("market.buy_sell_item.buy.count"), { "count": itemdata.count }))
                    } else {
                        if (itemdata.count == 1) gui.addLabel(ReplaceStr(lang.get("market.buy_sell_item.buy.count"), { "count": itemdata.count }))
                        else gui.addSlider(lang.get("market.buy_sell_item.slider.count"), 0, itemdata.count, 1, itemdata.count)
                    }
                    pl.sendForm(gui, (pl, datas) => {
                        if (getIndexInArray(market.data, item) == -1) pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return })
                        if (datas == null || datas[0] == 0) {
                            market.buy_sell_item(pl, item, backargs)
                        } else {
                            const count = datas[0] || itemdata.count
                            let beforemoney
                            if (count != itemdata.count) beforemoney = count * ((item.money / itemdata.count).toFixed(2))
                            else beforemoney = item.money
                            const totalCost = Math.round(beforemoney)
                            if (moneys.get(pl) < totalCost) {
                                pl.sendBetterModalForm(
                                    ReplaceStr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }),
                                    ReplaceStr(lang.get("market.buy_sell_item.buy.nomoney"), { "totalCost": totalCost, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }),
                                    lang.get("gui.back"), lang.get("gui.cancel"),
                                    (pl, res) => {
                                        if (res == true) {
                                            market.buy_sell_item(pl, item, backargs)
                                        } else pl.tell(info2 + lang.get("gui.exit"))
                                    },
                                    config.getIcon("form:confirm"), config.getIcon("form:back")
                                )
                            } else {
                                pl.sendBetterModalForm(
                                    ReplaceStr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }),
                                    ReplaceStr(lang.get("market.buy_sell_item.buy.confirm"), { "totalCost": totalCost, "money.name": moneys.conf.name }),
                                    lang.get("gui.confirm"), lang.get("gui.back"),
                                    (pl, res) => {
                                        if (getIndexInArray(market.data, item) == -1) pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return })
                                        if (res) {
                                            var md = market.data
                                            var i = getIndexInArray(md, item)
                                            if (count != itemdata.count) {
                                                var itemd = md[i]
                                                if (itemd.money - totalCost <= 0) {
                                                    itemd.money = 1
                                                } else itemd.money -= totalCost
                                                itemd.itemnbt = itemdata.getNbt().setByte("Count", itemdata.count - count).toSNBT()
                                                md[i].content = getItemContent(md[i], config.get("lang"))
                                            } else {
                                                md.splice(i, 1)
                                            }
                                            marketdatajson.set("data", md)
                                            market.loaddata()
                                            let plns = mc.getOnlinePlayers().map(p => p.realName)
                                            if (plns.includes(item.player)) {
                                                const player = mc.getPlayer(item.player)
                                                player.tell(ReplaceStr(lang.get("market.buy_sell_item.player.buy.success"), { "item.name": item.name, "totalCost": totalCost, "money.name": moneys.conf.name }))
                                                moneys.add(player, totalCost)
                                            } else setgives(item.player, 0, { "name": item.name, "money": totalCost })
                                            moneys.reduce(pl, totalCost)
                                            pl.giveItem(itemdata, count)
                                            pl.refreshItems()
                                            pl.sendMessageForm(info2, lang.get("market.buy_sell_item.buy.success"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return }, (pl) => pl.tell(info2 + lang.get("gui.exit")))
                                            addlog(pl, ReplaceStr(lang.get("log.market.buy"), { "item.name": item.name, "count": count, "item.time": item.time, "item.player": item.player, "totalCost": totalCost }))
                                        } else {
                                            market.buy_sell_item(pl, item, backargs)
                                        }
                                    }, config.getIcon("form:confirm"), config.getIcon("form:back")
                                )
                            }
                        }
                    })
                } else {
                    // 出售给买家
                    const gui = mc.newCustomForm()
                    gui.setTitle(ReplaceStr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }))
                    var items = player.getInventory().getAllItems()
                    var havecount = getSameItemCount(items, itemdata)
                    if (havecount <= itemdata.count) {
                        pl.sendMessageForm(
                            ReplaceStr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }),
                            lang.get("market.buy_sell_item.noitem"),
                            lang.get("gui.back"), config.getIcon("form:back"), (pl) => {
                                market.buy_sell_item(pl, item, backargs)
                            }, (pl) => {
                                market.buy_sell_item(pl, item, backargs)
                            })
                    } else {
                        function sel() {
                            let sellcount
                            if (item.bypartial != 1) {
                                sellcount = itemdata.count
                                then()
                            } else {
                                const gui = mc.newCustomForm()
                                gui.setTitle(ReplaceStr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }))
                                gui.addSlider(lang.get("market.buy_sell_item.slider.count"), 0, itemdata.count, 1, itemdata.count)
                                pl.sendForm(gui, (pl, datas) => {
                                    if (getIndexInArray(market.data, item) == -1) { pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0])); return }
                                    if (datas == null || datas[0] == null || datas[0] == 0) {
                                        market.buy_sell_item(pl, item, backargs)
                                    } else if (datas[0]) {
                                        sellcount = Number(datas[0])
                                        then()
                                    }
                                })
                            }
                            function then() {
                                const totalcosts = sellcount == itemdata.count ? item.money : Math.round((item.money / itemdata.count) * sellcount)
                                pl.sendBetterModalForm(ReplaceStr(lang.get("market.buy_sell_item.title"), { "info2": info2, "item.name": item.name }),
                                    ReplaceStr(lang.get("market.buy_sell_item.sell.confirm"), { "totalCost": totalcosts, "money.name": moneys.conf.name }) + (item.bypartial == 1 ? "" : "\n" + lang.get("market.buy_sell_item.sell.cantbypartial")),
                                    lang.get("gui.confirm"), lang.get("gui.cancel"),
                                    (pl, res) => {
                                        if (res) {
                                            if (getIndexInArray(market.data, item) == -1) pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return })
                                            const reduced = reduceItembyNbt(pl, item.itemnbt, sellcount)
                                            if (reduced) {
                                                let plns = mc.getOnlinePlayers().map(p => p.realName)
                                                if (plns.includes(item.player)) {
                                                    const player = mc.getPlayer(item.player)
                                                    player.tell(ReplaceStr(lang.get("market.buy_sell_item.player.sell.success"), { "item.name": item.name }))
                                                    const sellItem = mc.newItem(NBT.parseSNBT(item.itemnbt))
                                                    sellItem.count = sellcount
                                                    player.giveItem(sellItem)
                                                    player.refreshItems()
                                                } else setgives(item.player, 1, [item.itemnbt])
                                                const md = market.data
                                                const i = getIndexInArray(md, item)
                                                if (totalcosts == item.money) {
                                                    md.splice(i, 1)
                                                } else {
                                                    md[i].money -= totalcosts
                                                    md[i].itemnbt = itemdata.getNbt().setByte("Count", itemdata.count - sellcount).toSNBT()
                                                    md[i].content = getItemContent(md[i], config.get("lang"))
                                                }
                                                marketdatajson.set("data", md)
                                                market.loaddata()
                                                moneys.add(pl, totalcosts)
                                                addlog(pl, ReplaceStr(lang.get("log.market.sell"), {
                                                    "item.name": item.name, "count": sellcount, "item.time": item.time, "item.player": item.player, "totalCost": totalcosts, "money.name": moneys.conf.name
                                                }))
                                                pl.sendMessageForm(info2, lang.get("market.buy_sell_item.sell.success"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return }, (pl) => pl.tell(info2 + lang.get("gui.exit")))
                                            } else {
                                                pl.tell(lang.get("item.try.reduce.fail"))
                                                logger.error(lang.get("item.try.reduce.fail"))
                                            }
                                        } else {
                                            if (item.bypartial != 1) {
                                                market.buy_sell_item(pl, item, backargs)
                                            } else {
                                                sel()
                                            }
                                        }
                                    }, config.getIcon("form:confirm"), config.getIcon("form:cancel"))
                            }
                        }
                        sel()
                    }
                }
            } else if (id == 1) {
                if (getIndexInArray(market.data, item) == -1) pl.sendMessageForm(info2, lang.get("market.buy_sell_item.no"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0]); return })
                marketitemsgui(pl, backargs[1], clearNonexistentDataAndAddnew(0, backargs[2]), backargs[3], market.buy_sell_item, backargs[0])
            }
        })
    },
    /**
     * 主界面
     * @param {Player} player 玩家
     */
    main(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(info2 + lang.get("market.title"))
        gui.addButtons(
            [lang.get("market.button.buy_sell"), lang.get("market.button.ctrl"), lang.get("gui.cancel")],
            [config.getIcon("market:buy_sell"), config.getIcon("market:ctrl"), config.getIcon("form:cancel")]
        )
        player.sendForm(gui, (pl, id) => {
            if (id == null || id === 2) {
                pl.tell(info2 + lang.get("gui.exit"));
                return;
            }
            if (id === 0) {
                market.buy_sell(pl)
            } else if (id === 1) {
                market.ctrl(pl)
            }
        })
    },
    /**
     * 购买和出售界面
     * @param {Player} player 玩家 
     */
    buy_sell(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(ReplaceStr(lang.get("market.buy_sell.maintitle"), { "info": info2 }))
        gui.addButtons(
            [lang.get("market.buy_sell.button.list"), lang.get("market.buy_sell.button.search.normal"), lang.get("market.buy_sell.button.search.better"), lang.get("gui.cancel")],
            [config.getIcon("market:buy_sell_list"), config.getIcon("market:search_normal"), config.getIcon("market:search_better"), config.getIcon("form:cancel")]
        )
        player.sendForm(gui, (pl, id) => {
            if (id == null) {
                pl.tell(info2 + lang.get("gui.exit"));
                return;
            }
            if (id === 3) {
                market.main(pl)
                return;
            }
            switch (id) {
                case 0:
                    marketitemsgui(pl, ReplaceStr(lang.get("market.buy_sell.list.title"), { "info": info2 }), market.data, 0, market.buy_sell_item, "market.buy_sell(pl)")
                    break;
                case 1:
                    market.search_normal(pl)
                    break;
                case 2:
                    market.search_better(pl)
                    break;
            }
        })
    },
    /**
     * 普通搜索界面
     * @param {Player} player 玩家
     */
    search_normal(player) {
        const gui = mc.newCustomForm()
        gui.setTitle(ReplaceStr(lang.get("market.search.normal.maintitle"), { "info": info2 }))
        gui.addInput(lang.get("market.buy_sell.search.normal.input"))
        player.sendForm(gui, (pl, datas) => {
            if (datas == null) {
                pl.tell(info2 + lang.get("gui.exit"))
                return;
            }
            if (datas[0] == "") {
                market.buy_sell(pl)
                return;
            }
            //筛选出符合名称的物品
            const items = market.data.filter(item => item.name.includes(datas[0]))
            if (items.length == 0) {
                pl.sendMessageForm(info2, lang.get("market.search.normal.noitem"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.search_normal(pl) })
                return;
            }
            marketitemsgui(pl, ReplaceStr(ReplaceStr(lang.get("market.search.normal.title"), { "info": info2, "keyword": datas[0] })), items, 0, market.buy_sell_item, "market.search_normal(pl)")
        })
    },
    /**
     * 精准搜索界面
     * @param {Player} player 玩家
     */
    search_better(player) {
        const gui = mc.newCustomForm()
        gui.setTitle(ReplaceStr(lang.get("market.search.better.maintitle"), { "info": info2 }))
        gui.addInput(lang.get("market.search.betterinput"))
        //搜索方式
        gui.addDropdown(lang.get("market.search.bettersearch.dropdown"), [
            lang.get("market.search.bettersearch.dropdown.name"),
            lang.get("market.search.bettersearch.dropdown.type"),
            lang.get("market.search.bettersearch.dropdown.player")
        ], 0)
        //排序方式
        gui.addDropdown(lang.get("market.search.bettersort.dropdown"), [
            lang.get("market.search.bettersort.dropdown.nosort"),
            lang.get("market.search.bettersort.dropdown.up"),
            lang.get("market.search.bettersort.dropdown.down"),
            lang.get("market.search.bettersort.dropdown.money.up"),
            lang.get("market.search.bettersort.dropdown.money.down")
        ], 0)
        //是否允许部分购买?
        gui.addDropdown(lang.get("market.search.betterbypartial.dropdown"), [
            lang.get("market.search.betterbypartial.dropdown.all"),
            lang.get("market.search.betterbypartial.dropdown.yes"),
            lang.get("market.search.betterbypartial.dropdown.no")
        ], 0)
        player.sendForm(gui, (pl, datas) => {
            if (datas == null) {
                pl.tell(info2 + lang.get("gui.exit"))
                return;
            }
            if (datas[0] == "") {
                market.buy_sell(pl)
                return
            }
            var items
            switch (Number(datas[1])) {
                case 0:
                    items = market.data.filter(item => item.name.includes(datas[0]))
                    break;
                case 1:
                    items = market.data.filter(item => mc.newItem(NBT.parseSNBT(item.itemnbt)).type.includes(datas[0]))
                    break;
                case 2:
                    items = market.data.filter(item => item.player.includes(datas[0]))
                    break;
            }
            //排序
            switch (Number(datas[2])) {
                case 1:
                    items.sort((a, b) => {
                        return b.name.localeCompare(a.name)
                    })
                    break
                case 2:
                    items.sort((a, b) => {
                        return a.name.localeCompare(b.name)
                    })
                    break
                case 3:
                    items.sort((a, b) => {
                        return a.money - b.money
                    })
                    break
                case 4:
                    items.sort((a, b) => {
                        return b.money - a.money
                    })
                    break
            }
            switch (Number(datas[3])) {
                case 1:
                    items = items.filter(item => item.bypartial == 1)
                    break;
                case 2:
                    items = items.filter(item => item.bypartial != 1)
                    break;
            }
            if (items.length == 0) {
                pl.sendMessageForm(info2, lang.get("market.search.better.noitem"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.search_better(pl) })
                return;
            } else {
                marketitemsgui(pl, ReplaceStr(ReplaceStr(lang.get("market.search.better.title"), { "info": info2, "keyword": datas[0] }), { "count": items.length }), items, 0, market.buy_sell_item, "market.search_better(pl)")
            }
        })
    },
    /**
     * 控制面板界面
     * @param {Player} player 
     */
    ctrl(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(ReplaceStr(lang.get("market.ctrl.maintitle"), { "info": info2 }))
        gui.addButtons(
            [lang.get("market.ctrl.button.add"), lang.get("market.ctrl.button.edit"), lang.get("gui.back")],
            [config.getIcon("market:add"), config.getIcon("market:edit"), config.getIcon("form:back")]
        )
        player.sendForm(gui, (pl, id) => {
            if (id == null) {
                pl.tell(info2 + lang.get("gui.exit"));
                return;
            }
            if (id === 2) {
                market.main(pl)
            } else switch (id) {
                case 0:
                    market.additem(pl)
                    break;
                case 1:
                    market.edit(pl)
                    break;
            }
        })
    },
    /**
     * 添加物品界面
     * @param {Player} player 
     */
    additem(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(ReplaceStr(lang.get("market.add.maintitle"), { "info": info2 }))
        gui.addButtons(
            [lang.get("market.add.button.byitemtype"), lang.get("market.add.button.byhaveitem"), lang.get("market.add.button.byhand"), lang.get("gui.cancel")],
            [config.getIcon("market:add_bytype"), config.getIcon("market:add_byhaveitem"), config.getIcon("market:add_byhand"), config.getIcon("form:cancel")]
        )
        player.sendForm(gui, (pl, id) => {
            if (id == null) {
                pl.tell(info2 + lang.get("gui.exit"));
                return;
            }
            if (id === 3) {
                market.ctrl(pl)
            } else if (id === 0) {
                market.additembytype(pl)
            } else if (id == 1) {
                market.additembyhaveitem(pl)
            } else if (id == 2) {
                market.additembyhand(pl)
            }
        })
    },
    /**
     * 通过物品类型添加
     * @param {Player} player 
     */
    additembytype(player) {
        player.sendBetterModalForm(
            ReplaceStr(lang.get("market.add.byitemtype.confirm.title"), { info: info2 }),
            lang.get("market.add.byitemtype.confirm.desc"),
            lang.get("gui.confirm"),
            lang.get("gui.cancel"),
            config.getIcon("form:confirm"),
            config.getIcon("form:cancel"),
            (pl, res) => {
                if (res) {
                    const gui = mc.newCustomForm()
                    gui.setTitle(ReplaceStr(lang.get("market.add.byitemtype.title"), { "info": info2 }))
                    gui.addInput(lang.get("market.add.byitemtype.input.type"))
                    gui.addInput(lang.get("market.add.byitemtype.input.aux"))
                    gui.addInput(lang.get("market.add.byitemtype.input.count"))
                    gui.addSwitch(lang.get("market.add.byitemtype.switch.bypartial.sell"), true)
                    gui.addInput(lang.get("market.add.byitemtype.input.money"))
                    pl.sendForm(gui, (pl, datas) => {
                        if (datas == null || (datas[0] == "" && datas[1] == "" && datas[2] == "" && datas[4] == "")) {
                            market.ctrl(pl)
                            return;
                        } else {
                            function sendMessage(msg) {
                                pl.sendMessageForm(info2, msg, lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) }, (pl) => market.ctrl(pl))
                            }
                            if (!/^[a-zA-Z0-9_]+:[a-zA-Z0-9_]+$/.test(datas[0])) {
                                sendMessage(lang.get("market.add.byitemtype.input.type.error"))
                                return;
                            }
                            if (isNaN(Number(datas[1])) || !Number.isInteger(Number(datas[1]))) {
                                sendMessage(lang.get("market.add.byitemtype.input.aux.error"))
                                return;
                            }
                            if (isNaN(Number(datas[2])) || !isPositiveInteger(Number(datas[2]))) {
                                sendMessage(lang.get("market.add.input.count.error"))
                                return;
                            }
                            if (isNaN(Number(datas[4])) || !isPositiveInteger(Number(datas[4]))) {
                                sendMessage(lang.get("market.add.input.money.error"))
                                return;
                            }
                            const item = newItemWithAux(datas[0], Number(datas[2]), Number(datas[1]))
                            if (item.isNull()) {
                                pl.sendMessageForm(info2, lang.get("market.add.byitemtype.input.type.error"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                                return;
                            }
                            const itemnbt = item.getNbt().toSNBT()
                            const bypartial = Number(datas[3])
                            const money = Number(datas[4])
                            var d = {
                                name: lang.get("market.add.item.prefix.buy") + item.getTranslateName(config.get("lang")),
                                itemnbt: itemnbt,
                                player: pl.realName,
                                bypartial: bypartial,
                                money: money,
                                type: "buy",
                                time: system.getTimeStr()
                            }
                            d.content = getItemContent(item)
                            pl.sendBetterModalForm(info2, d.content, lang.get("gui.confirm"), lang.get("gui.cancel"), config.getIcon("form:confirm"), config.getIcon("form:cancel"), (pl, res) => {
                                if (res) {
                                    if (config.get("banitems").includes(item.id)) pl.sendMessageForm(info2, lang.get("market.baneditem"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                                    else if (moneys.get(pl) < money) pl.sendMessageForm(info2, ReplaceStr(lang.get("market.add.notenough.money"), { "totalCost": money, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                                    else if (moneys.reduce(pl, money)) {
                                        var md = market.data
                                        md.push(d)
                                        marketdatajson.set("data", md)
                                        market.loaddata()
                                        addlog(pl, ReplaceStr(lang.get("log.market.add"), { "item.name": d.name, "count": Number(datas[2]), "totalCost": money }))
                                        pl.sendMessageForm(info2, lang.get("market.add.success"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.ctrl(pl) })
                                    }
                                } else market.additem(pl)
                            })
                        }
                    })
                } else {
                    market.additem(pl)
                }
            }
        )
    },
    /**
     * 通过背包物品添加
     * @param {Player} player 
     */
    additembyhaveitem(player) {
        const gui = mc.newCustomForm()
        const pli = player.getInventory()
        const haveitems = pli.getAllItems()
        const items = haveitems.filter(item => !item.isNull())
        gui.setTitle(ReplaceStr(lang.get("market.add.byhaveitem.title"), { "info": info2 }))
        gui.addDropdown(lang.get("market.add.byhaveitem.dropdown.item"), items.map(item => item.getTranslateName(config.get("lang"))), 0)
        player.sendForm(gui, (pl, datas) => {
            if (datas == null) {
                market.ctrl(pl)
                return;
            } else {
                const item = items[datas[0]]
                const gui = mc.newCustomForm()
                gui.setTitle(ReplaceStr(lang.get("market.add.byhaveitem.title"), { "info": info2 }))
                gui.addSwitch(lang.get("market.add.byhaveitem.switch.mode"), true)
                gui.addSwitch(lang.get("market.add.byhaveitem.switch.bypartial"), true)
                gui.addSlider(lang.get("market.add.byhaveitem.slider.count"), 0, item.count, 1, item.count)
                gui.addInput(lang.get("market.add.byhaveitem.input.money"))
                pl.sendForm(gui, (pl, datas1) => {
                    if (datas1 == null || datas1[3] == "" || datas1[2] == 0) {
                        market.ctrl(pl)
                        return;
                    } else {
                        const count = datas1[2]
                        const itemnbt = item.getNbt().setByte("Count", count).toSNBT()
                        const bypartial = datas1[1]
                        const mode = datas1[0]
                        if (!isPositiveInteger(Number(datas1[3]))) {
                            pl.sendMessageForm(info2, lang.get("market.add.input.money.error"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                            return
                        }
                        const money = Number(datas1[3])
                        var d = {
                            name: (mode ? lang.get("market.add.item.prefix.sell") : lang.get("market.add.item.prefix.buy")) + item.getTranslateName(config.get("lang")),
                            itemnbt: itemnbt,
                            player: pl.realName,
                            bypartial: bypartial,
                            money: money,
                            type: mode ? "sell" : "buy",
                            time: system.getTimeStr()
                        }
                        d.content = getItemContent(item)
                        pl.sendBetterModalForm(info2, d.content, lang.get("gui.confirm"), lang.get("gui.cancel"), config.getIcon("form:confirm"), config.getIcon("form:cancel"), (pl, res) => {
                            if (res) {
                                if (config.get("banitems").includes(item.id)) pl.sendMessageForm(info2, lang.get("market.baneditem"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                                else {
                                    function then() {
                                        var md = market.data
                                        md.push(d)
                                        marketdatajson.set("data", md)
                                        market.loaddata()
                                        addlog(pl, ReplaceStr(lang.get("log.market.add"), { "item.name": d.name, "count": count, "totalCost": money }))
                                        pl.sendMessageForm(info2, lang.get("market.add.success"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.ctrl(pl) })
                                    }
                                    if (mode == false) {
                                        if (moneys.get(pl) < money) pl.sendMessageForm(info2, ReplaceStr(lang.get("market.add.notenough.money"), { "totalCost": money, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                                        else if (moneys.reduce(pl, money))
                                            then()
                                        else market.additem(pl)
                                    } else if (mode == true) {
                                        const red = reduceItembyNbt(pl, itemnbt, count)
                                        if (red)
                                            then()
                                        else market.additem(pl)
                                    }
                                }
                            } else market.additem(pl)
                        })
                    }
                })
            }
        })
    },
    /**
     * 通过手中物品添加
     * @param {Player} player 
     */
    additembyhand(player) {
        const gui = mc.newSimpleForm()
        gui.setTitle(ReplaceStr(lang.get("market.add.byhand.title"), { "info": info2 }))
        gui.addButtons(
            [lang.get("market.add.byhand.mainhand"), lang.get("market.add.byhand.offhand"), lang.get("gui.cancel")],
            [config.getIcon("market:add_byhand_main"), config.getIcon("market:add_byhand_off"), config.getIcon("form:cancel")]
        )
        player.sendForm(gui, (pl, id) => {
            if (id == null) {
                pl.tell(info2 + lang.get("gui.exit"))
                return;
            }
            if (id === 2) {
                market.ctrl(pl)
            } else {
                let item
                if (id == 0) {
                    item = pl.getHand()
                } else item = pl.getOffHand()
                if (item.isNull()) {
                    pl.sendMessageForm(info2, lang.get("market.add.byhand.empty"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                    market.additem(pl)
                    return;
                } else {
                    const gui = mc.newCustomForm()
                    gui.setTitle(ReplaceStr(lang.get("market.add.byhand.title"), { "info": info2 }))
                    gui.addSwitch(lang.get("market.add.byhand.switch.mode"), true)
                    gui.addSwitch(lang.get("market.add.byhand.switch.bypartial"), true)
                    gui.addSlider(lang.get("market.add.byhand.slider.count"), 0, item.count, 1, item.count)
                    gui.addInput(lang.get("market.add.byhand.input.money"))
                    pl.sendForm(gui, (pl, datas) => {
                        if (datas == null || datas[2] == 0 || datas[3] == "" || datas[3] == null) {
                            market.ctrl(pl)
                            return;
                        } else {
                            const count = datas[2]
                            const itemnbt = item.getNbt().setByte("Count", count).toSNBT()
                            const bypartial = datas[1]
                            const mode = datas[0]
                            if (!isPositiveInteger(Number(datas[3]))) {
                                pl.sendMessageForm(info2, lang.get("market.add.input.money.error"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                                return
                            }
                            const money = Number(datas[3])
                            var d = {
                                name: (mode ? lang.get("market.add.item.prefix.sell") : lang.get("market.add.item.prefix.buy")) + item.getTranslateName(config.get("lang")),
                                itemnbt: itemnbt,
                                player: pl.realName,
                                bypartial: bypartial,
                                money: money,
                                type: mode ? "sell" : "buy",
                                time: system.getTimeStr()
                            }
                            d.content = getItemContent(item)
                            pl.sendBetterModalForm(info2, d.content, lang.get("gui.confirm"), lang.get("gui.cancel"), config.getIcon("form:confirm"), config.getIcon("form:cancel"), (pl, res) => {
                                if (res) {
                                    if (config.get("banitems").includes(item.id)) pl.sendMessageForm(info2, lang.get("market.baneditem"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                                    else {
                                        function then() {
                                            var md = market.data
                                            md.push(d)
                                            marketdatajson.set("data", md)
                                            market.loaddata()
                                            addlog(pl, ReplaceStr(lang.get("log.market.add"), { "item.name": d.name, "count": count, "totalCost": money }))
                                            pl.sendMessageForm(info2, lang.get("market.add.success"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.ctrl(pl) })
                                        }
                                        if (mode == false) {
                                            if (moneys.get(pl) < money) pl.sendMessageForm(info2, ReplaceStr(lang.get("market.add.notenough.money"), { "totalCost": money, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.additem(pl) })
                                            else if (moneys.reduce(pl, money))
                                                then()
                                        } else if (mode == true) {
                                            const red = reduceItembyNbt(pl, itemnbt, count)
                                            if (red)
                                                then()
                                            else market.additem(pl)
                                        }
                                    }
                                } else market.additem(pl)
                            })
                        }
                    })
                }
            }
        })
    },
    /**
     * 编辑物品界面
     * @param {Player} player 
     */
    edit(player) {
        if (player.isOP()) {
            const gui = mc.newSimpleForm()
            gui.setTitle(ReplaceStr(lang.get("market.edit.title"), { "info": info2 }))
            gui.addButtons(
                [lang.get("market.edit.button.self"), lang.get("market.edit.button.all"), lang.get("gui.cancel")],
                [config.getIcon("market:edit_self"), config.getIcon("market:edit_all"), config.getIcon("form:cancel")]
            )
            player.sendForm(gui, (pl, id) => {
                if (id == null) {
                    pl.tell(info2 + lang.get("gui.exit"))
                    return;
                }
                var items = []
                if (id === 2) {
                    market.ctrl(pl)
                    return;
                } else if (id === 0) {
                    items = market.data.filter(item => item.player == pl.realName)
                } else if (id === 1) {
                    items = market.data
                }
                market.edititem(pl, items)
            })
        } else {
            var items = market.data.filter(item => item.player == player.realName)
            market.edititem(player, items)
        }
    },
    /**
     * 编辑物品列表
     * @param {Player} player 
     * @param {Object[]} items 
     */
    edititem(player, items) {
        if (items.length == 0) {
            player.sendMessageForm(info2 + lang.get("market.edit.title"), lang.get("market.edit.noitem"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.ctrl(pl) })
        } else {
            marketitemsgui(player, ReplaceStr(lang.get("market.edit.title"), { "info": info2 }), items, 0, market.edit_item, "market.edit(pl)")
        }
    },
    /**
     * 编辑单个物品
     * @param {Player} pl 
     * @param {Object} item 
     * @param {Array} backargs 
     */
    edit_item(pl, item, backargs) {
        const gui = mc.newCustomForm()
        gui.setTitle(ReplaceStr(lang.get("market.edit.title"), { "info": info2 }))
        gui.addSwitch(lang.get("market.edit.switch.mode"), item.type == "sell")
        gui.addSwitch(lang.get("market.edit.switch.bypartial"), item.bypartial)
        gui.addInput(lang.get("market.edit.input.money"), "", String(item.money))
        gui.addSwitch(lang.get("market.edit.switch.delete"), false)
        pl.sendForm(gui, (pl, datas) => {
            if (datas == null) {
                marketitemsgui(pl, backargs[1], backargs[2], backargs[3], market.edit_item, backargs[4])
                return;
            } else {
                const mode = datas[0]
                const bypartial = datas[1]
                const money = Number(datas[2])
                const deleteitem = datas[3]
                if (deleteitem) {
                    market.delitem(pl, item)
                    return;
                } else {
                    var d = JSON.parse(JSON.stringify(item))
                    item.name = (mode ? lang.get("market.add.item.prefix.sell") : lang.get("market.add.item.prefix.buy")) + mc.newItem(NBT.parseSNBT(item.itemnbt)).getTranslateName(config.get("lang"))
                    item.type = mode ? "sell" : "buy"
                    item.bypartial = bypartial
                    item.money = money
                    item.content = getItemContent(mc.newItem(NBT.parseSNBT(item.itemnbt)))
                    pl.sendBetterModalForm(info2, item.content, lang.get("gui.confirm"), lang.get("gui.cancel"), config.getIcon("form:confirm"), config.getIcon("form:cancel"), (pl, res) => {
                        if (res) {
                            function then() {
                                var md = market.data
                                md.push(item)
                                marketdatajson.set("data", md)
                                market.loaddata()
                                addlog(pl, ReplaceStr(lang.get("log.market.edit"), { "item.name": item.name }))
                                pl.sendMessageForm(info2, lang.get("market.edit.success"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.edit(pl) })
                            }
                            var dmoney = item.money - d.money
                            if (item.type == d.type) {
                                if (item.money != d.money) {
                                    if (dmoney > 0) {
                                        if (dmoney > moneys.get(pl)) {
                                            pl.sendMessageForm(info2, ReplaceStr(lang.get("market.edit.notenough.money"), { "totalCost": dmoney, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.edit(pl) })
                                            return;
                                        } else if (moneys.reduce(pl, dmoney))
                                            then()
                                        else market.edit(pl)
                                    } else if (dmoney < 0) {
                                        moneys.add(pl, Math.abs(dmoney))
                                        then()
                                    }
                                } else {
                                    then()
                                }
                            } else {
                                if (item.type == "sell") {
                                    pl.sendMessageForm(info2, lang.get("market.edit.error.type"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.edit(pl) })
                                    return;
                                } else {
                                    if (moneys.get(pl) < item.money) {
                                        pl.sendMessageForm(info2, ReplaceStr(lang.get("market.edit.notenough.money"), { "totalCost": item.money, "pl.money": moneys.get(pl), "money.name": moneys.conf.name }), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.edit(pl) })
                                        return;
                                    } else {
                                        pl.giveItem(mc.newItem(NBT.parseSNBT(item.itemnbt)))
                                        pl.refreshItems()
                                        moneys.reduce(pl, item.money)
                                        then()
                                    }
                                }
                            }
                        } else market.edit(pl)
                    })
                }
            }
        })
    },
    /**
     * 删除物品
     * @param {Player} player 
     * @param {Object} item 
     */
    delitem(player, item) {
        player.sendBetterModalForm(
            info2,
            lang.get("market.del.confirm"),
            lang.get("gui.confirm"),
            lang.get("gui.cancel"),
            config.getIcon("form:confirm"),
            config.getIcon("form:cancel"),
            (pl, res) => {
                if (res) {
                    if (item.type == "sell") {
                        pl.giveItem(mc.newItem(NBT.parseSNBT(item.itemnbt)))
                        pl.refreshItems()
                    } else moneys.add(pl, item.money)
                    var md = market.data
                    md.splice(getIndexInArray(market.data, item), 1)
                    marketdatajson.set("data", md)
                    market.loaddata()
                    addlog(pl, ReplaceStr(lang.get("log.market.del"), { "item.name": item.name }))
                    player.sendMessageForm(info2, lang.get("market.del.success"), lang.get("gui.back"), config.getIcon("form:back"), (pl) => { market.edit(pl) })
                } else market.edit(pl)
            }
        )
    }
}