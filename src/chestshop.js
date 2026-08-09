import { config, lang, moneyname, texture_paths, chestshopdata, getChestShopIDs, SignBlockMap, signtileDataMap, sideMap, saveChestShopData } from "./consts.js"
import { same, samePos, getPosObjFromPos, getAddPos, getDirection, moneys, isPositiveInteger, ReplaceStr, getItemInfo, getCanPutItemCount, getEnchContent, newItemWithAux, getItemContent, getCanReductItemCount, reduceItembyType, reduceItembyNbt, getPosFromPosObj } from "./lib/lib.js"
import { updateSignText, getItemChestFloatPosFromIntPos, getItemDisplayName, ChestShop } from "./lib/packet.js"
/** @type {import("../../iListenAttentively-LseExport/lib/iListenAttentively.js")} */
import iListenAttentively from "../../iListenAttentively-LseExport/lib/iListenAttentively.js"
const chestshops = {}
function randomID() {
    const from = "1234567890abcdef"
    let r = ""
    for (let i = 0; i < 6; i++) {
        r += from[Math.floor(Math.random() * from.length)]
    }
    return r
}
function generatePShopID() {
    const id = randomID()
    return getChestShopIDs().includes(id) ? generatePShopID() : id
}
//新建箱子商店函数
/**
 * 
 * @param {Player} player 
 * @param {Block} chest 
 * @param {Item} item 
 * @param {Number} side 
 * @param {Number} money 
 */
function newChestShop(player, chest, item, side, msg) {

    const money = Number(msg)
    if (!isPositiveInteger(money) || money <= 0) {
        return player.tell(ReplaceStr(lang.get("tell.chestshop.moneytype"), { input: msg }))
    }
    const pos = chest.pos
    const shopid = generatePShopID()
    const snbt = item.getNbt().toSNBT()
    const signpos = getAddPos(pos, SignBlockMap[sideMap[side]])
    mc.setBlock(signpos, "minecraft:wall_sign", signtileDataMap[sideMap[side]])
    const chs = new ChestShop(pos, snbt, {
        clientOnly: false,
        money,
        side
    })
    setTimeout(() => {
        chs.setSignText(msg)
    }, 100)

    chestshopdata[shopid] = {
        pos: getPosObjFromPos(pos),
        owner: player.uuid,
        type: "sell",
        money: money,
        item: snbt,
        side,
    }
    player.tell("Now chestshopdata:" + JSON.stringify(chestshopdata))
    saveChestShopData()
}
const pendingCreateChestShop = {}
mc.listen("onUseItemOn", (player, item, block, side) => {
    if (player.getExtraData("PShop_diasbleCreateChestShop")) return
    if (!player.isSneaking || block.type != "minecraft:chest" || item.isNull()) return
    if (pendingCreateChestShop[player.uuid] && samePos(pendingCreateChestShop[player.uuid]?.block?.pos ?? {}, block.pos)) return
    if (side == 0 || side == 1) return
    pendingCreateChestShop[player.uuid] && clearTimeout(pendingCreateChestShop[player.uuid].timeout)
    pendingCreateChestShop[player.uuid] = {
        block, item: item.clone(), side, timeout: setTimeout(() => {
            if (pendingCreateChestShop[player.uuid] == null) return
            else {
                player.tell("exit")
                pendingCreateChestShop[player.uuid] = null
            }
        }, 10000)
    }
    player.tell(`pendingpos:${block.pos} ${pendingCreateChestShop[player.uuid].block.pos}`)
    return false
})
iListenAttentively.emplaceListener("ll::event::player::PlayerChatEvent", (ev) => {
    const pl = iListenAttentively.getPlayer(ev.self)
    if (pendingCreateChestShop[pl.uuid] == null) return
    else {
        const msg = ev.message
        const { block, item, side } = pendingCreateChestShop[pl.uuid]
        delete pendingCreateChestShop[pl.uuid]
        newChestShop(pl, block, item, side, msg)
        ev.cancelled = true
    }
    // 取消消息发送
}, iListenAttentively.EventPriority.Highest)

// new Sign(new IntPos(0, 101, 0, 0), { frontText: "1111", clientOnly: false })
// new DropItem(mc.newItem("minecraft:iron_ingot", 1), getItemChestFloatPosFromIntPos(new IntPos(0, 101, 0, 0)))



mc.listen("onServerStarted", () => {
    const chestids = getChestShopIDs()
    for (const id of chestids) {
        const d = chestshopdata[id]
        if (d == null) continue
        const signpos = getAddPos(d.pos, SignBlockMap[sideMap[d.side]])
        mc.setBlock(signpos, "minecraft:wall_sign", signtileDataMap[sideMap[d.side]])
        const chs = new ChestShop(getPosFromPosObj(d.pos), d.item, {
            clientOnly: false,
            money: d.money,
            side: d.side,
            owner: d.owner,
            isSystem: d.isSystem ?? false,
            type: d.type ?? "sell"
        })
        chs.updatesign()
        chestshops[id] = chs
    }
    log(chestshops)
})
