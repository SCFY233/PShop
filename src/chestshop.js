import { getSMoney } from "../../SMoney/main.js"
import { config, lang, moneyname, texture_paths, chestshopdata, getChestshopIDs } from "./consts.js"
import { } from "./lib/form.js"
import { moneys, isPositiveInteger, ReplaceStr, getItemInfo, getCanPutItemCount, getEnchContent, newItemWithAux, getItemContent, getCanReductItemCount, reduceItembyType, reduceItembyNbt, debounce } from "./lib/lib.js"
import { updateSignText } from "./lib/packet.js"
const SignBlockMap = {
    north: [0, -1],
    south: [0, 1],
    west: [-1, 0],
    east: [1, 0]
}

const signtileDataMap = {
    north: 2,
    south: 3,
    west: 4,
    east: 5
}
function randomID() {
    const from = "1234567890abcdef"
    const r = ""
    for (let i = 0; i < 6; i++) {
        r += from[Math.floor(Math.random() * from.length)]
    }
}
function generatePShopID() {
    const id = randomID()
    return getChestshopIDs().includes(id) ? generatePShopID() : id
}
//新建箱子商店函数
/**
 * 
 * @param {Player} player 
 * @param {Block} chest 
 * @param {Item} item 
 * @param {Number} side 
 * @param {Object} options 
 */
function newChestShop(player, chest, item, side, options = { input: "" }) {
    const gui = mc.newCustomForm()
    gui.setTitle(lang.get("form.chestshop.new.title"))
    gui.addInput(ReplaceStr(lang.get("form.chestshop.new.input"), { moneyname }), "", options.input)
    gui.addDropdown(lang.get("form.chestshop.new.dropdown"), [lang.get("form.chestshop.new.dropdown.sell"), lang.get("form.chestshop.new.dropdown.buy")])
    player.sendForm(gui, (pl, data) => {
        if (data == null || data[0] == "") return
        if (isPositiveInteger(data[0])) return pl.sendBetterModalForm(lang.get("form.chestshop.new.title"), ReplaceStr(lang.get("form.chestshop.new.money.type"), { input: data[0] }), lang.get("form.back"), lang.get("form.cancel"), config.getIcon("form:back"), config.getIcon("form:cancel"), (pl, r) => {
            if (r) return newChestShop(player, chest, item, side, { input: data[0] })
        })
        const blocknbt = chest.getNbt()
        const shopid = generatePShopID()
        blocknbt.setTag("isPShop", new NbtByte(1))
        blocknbt.setTag("PShopID")
    })
}
const hasBeenNew = {

}
mc.listen("onUseItemOn", (player, item, block, side) => {
    log(1)
    if (!player.isSneaking || block.type != "minecraft:chest" || item == null) return
    if (Object.keys(hasBeenNew).includes(player.uniqueId)) return
    newChestShop(player, block, item, side)
    hasBeenNew[player.uniqueId] = setTimeout(() => {
        hasBeenNew[player.uniqueId] = null
    })
    return false
})