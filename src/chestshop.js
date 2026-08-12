import { config, lang, moneyname, texture_paths, chestshopdata, getChestShopIDs, SignBlockMap, signtileDataMap, sideMap, saveChestShopData } from "./consts.js"
import { same, samePos, getSameItemCount, getMaxCount, getPosObjFromPos, getAddPos, getDirection, moneys, isPositiveInteger, ReplaceStr, getItemInfo, getCanPutItemCount, newItemWithAux, getItemContent, getCanReductItemCount, reduceItembyType, reduceItembyNbt, getPosFromPosObj } from "./lib/lib.js"
import { updateSignText, getItemChestFloatPosFromIntPos, getItemDisplayName, ChestShop, playClientSound } from "./lib/packet.js"
import { } from "./lib/form.js"
/** @type {import("../../iListenAttentively-LseExport/lib/iListenAttentively.js")} */
import iListenAttentively from "../../iListenAttentively-LseExport/lib/iListenAttentively.js"
const chestshops = {}
const signmaps = {}
const chestmaps = {}
function randomID() {
    return Math.random().toString(16).substring(2, 8);
}
function generatePShopID() {
    const id = randomID()
    return getChestShopIDs().includes(id) ? generatePShopID() : id
}
function getSound(sound) {
    return config.get("chestshop_sounds")[sound] ?? { sound: "random.orb", volume: 1.0, pitch: 1.0 }
}
function isVaildPositiveNumber(num) {
    return num == num && num > 0
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
    if (!isVaildPositiveNumber(money) || money <= 0) {
        playClientSound(player, getSound("fail"));
        return player.tell(ReplaceStr(lang.get("tell.chestshop.moneytype.decimal"), { input: msg }))
    }
    const pos = chest.pos
    const shopid = generatePShopID()
    const snbt = item.getNbt().toSNBT()
    const signpos = getAddPos(pos, SignBlockMap[sideMap[side]])
    chestshopdata[shopid] = {
        pos: getPosObjFromPos(pos),
        owner: player.uuid,
        type: "sell",
        money: money,
        item: snbt,
        side,
        isSystem: false,
    }
    saveChestShopData()
    mc.setBlock(signpos, "minecraft:wall_sign", signtileDataMap[sideMap[side]])
    const chs = new ChestShop(pos, snbt, {
        clientOnly: false,
        money,
        side,
        owner: player.uuid,
        isSystem: false,
        showItem: true
    })
    chs.updatesign()
    chestshops[shopid] = chs
    signmaps[getPosKey(signpos)] = shopid;
    chestmaps[getPosKey(pos)] = shopid;
    playClientSound(player, getSound("create"));
}
function tradeChestShop(player, shopid, msg, count) {
    const plcount = msg == "all" ? count : Number(msg)
    const chs = chestshops[shopid]
    if (!isPositiveInteger(plcount)) return player.tell(ReplaceStr(lang.get("tell.chestshop.count.type"), { msg }))
    if (plcount > count) return player.tell(ReplaceStr(lang.get("tell.chestshop.count.type2"), {
        action: chs.type == "sell" ? lang.get("chestshop.action.plbuy") : lang.get("chestshop.action.plsell"), count, msg
    }))
    
}
/**
 * 商店配置管理表单
 * @param {Player} player 交互的玩家对象
 * @param {String} shopid 商店的唯一ID
 * @param {ChestShop} chs 商店实例对象
 */
function ManageChestShop(player, shopid, chs) {
    const gui = mc.newCustomForm();
    gui.setTitle(ReplaceStr(lang.get("form.chestshop.manage.title"), {
        "prefix.chestshop": lang.get("form.chestshop.title") ?? "§6[箱子商店]§r"
    }));

    gui.addLabel(lang.get("form.chestshop.manage.label")); // data[0]

    // 1. 修改价格 
    gui.addInput(
        lang.get("form.chestshop.manage.input.price"),
        lang.get("form.chestshop.manage.input.price.placeholder"),
        String(chs.money)
    ); // data[1]

    // 2. 商店类型: 收购/出售
    const typeOptions = [
        lang.get("chestshop.action.sell"),
        lang.get("chestshop.action.buy")
    ];
    const typeDefault = chs.type === "buy" ? 1 : 0;
    gui.addDropdown(lang.get("form.chestshop.manage.dropdown.type"), typeOptions, typeDefault); // data[2]

    // 3. 物品悬浮物展示
    const showItemDefault = chs.showItem ?? true;
    gui.addSwitch(lang.get("form.chestshop.manage.switch.showitem"), showItemDefault); // data[3]

    // 4. 删除商店开关 (默认关闭)
    gui.addSwitch(lang.get("form.chestshop.manage.switch.delete") ?? "§c删除该商店 (危险操作)§r", false); // data[4]

    // 发送表单并监听回调
    player.sendForm(gui, (pl, data) => {
        if (!data) return; // 玩家取消了表单

        const isDelete = data[4]; // 获取删除开关状态

        // ==========================
        // 分支 A：玩家选择了删除商店
        // ==========================
        if (isDelete) {
            const d = chestshopdata[shopid];
            const chestPosObj = d.pos;
            const chestPos = getPosFromPosObj(chestPosObj);
            const signPos = getAddPos(chestPos, SignBlockMap[sideMap[d.side]]);

            // 1. 销毁实例（清理悬浮物等）
            if (typeof chs.destroy === "function") {
                chs.destroy();
            }

            // 2. 清除牌子上的文字
            updateSignText(signPos, ["", "", "", ""]);

            // 3. 从内存和持久化数据中彻底移除
            delete chestshopdata[shopid];
            delete chestshops[shopid];
            delete chestmaps[getPosKey(chestPos)];
            delete signmaps[getPosKey(signPos)];
            saveChestShopData();

            playClientSound(pl, getSound("click"));
            return pl.tell(ReplaceStr(lang.get("tell.chestshop.manage.delete.success") ?? "§a商店已成功删除！", {
                "prefix.chestshop": lang.get("form.chestshop.title") ?? "§6[箱子商店]§r"
            }));
        }

        // ==========================
        // 分支 B：更新商店配置
        // ==========================
        const newPrice = Number(data[1]);
        const newType = data[2] === 1 ? "buy" : "sell";
        const newShowItem = data[3];

        // 校验价格
        if (!isVaildPositiveNumber(newPrice) || newPrice <= 0) {
            playClientSound(pl, getSound("fail"));
            return pl.tell(ReplaceStr(lang.get("tell.chestshop.moneytype.decimal"), { input: String(data[1]) }));
        }

        // 1. 更新持久化数据
        chestshopdata[shopid].money = newPrice;
        chestshopdata[shopid].type = newType;
        chestshopdata[shopid].showItem = newShowItem;
        saveChestShopData();

        // 2. 销毁旧实例
        if (typeof chs.destroy === "function") {
            chs.destroy();
        }

        // 3. 重新生成并覆盖
        const d = chestshopdata[shopid];
        const newChs = new ChestShop(getPosFromPosObj(d.pos), d.item, {
            clientOnly: false,
            money: d.money,
            side: d.side,
            owner: d.owner,
            isSystem: d.isSystem ?? false,
            type: d.type,
            showItem: d.showItem
        });

        newChs.updatesign();
        chestshops[shopid] = newChs;

        playClientSound(pl, getSound("create"));

        // 发送成功提示
        pl.tell(ReplaceStr(lang.get("tell.chestshop.manage.success"), {
            "prefix.chestshop": lang.get("form.chestshop.title") ?? "§6[箱子商店]§r"
        }));
    });
}
const pendingCreateChestShop = {}
const pendingTradeChestShop = {}
mc.listen("onUseItemOn", (player, item, block, side) => {
    if (block.type != "minecraft:chest" && block.type != "minecraft:wall_sign") return
    if (block.type == "minecraft:wall_sign" && getChestShopIDFromSign(block.pos)) {
        const shopid = getChestShopIDFromSign(block.pos)
        if (shopid == null) return
        const chs = chestshops[shopid]
        setTimeout(() => chs?.updatesign(), 0)
        if (!chs.isSystem && chs.owner == player.uuid) {
            ManageChestShop(player, shopid, chs);
        }
        return false
    }
    if (block.type == "minecraft:chest" && getChestShopIDFromChest(block.pos)) {
        const shopid = getChestShopIDFromChest(block.pos)
        const chs = chestshops[shopid]
        setTimeout(() => chs?.updatesign(), 0)
        if (!chs.isSystem && chs.owner == player.uuid) return
        return false
    }
    else {
    //创建
        if (player.getExtraData("PShop_diasbleCreateChestShop")) return
        if (!player.isSneaking || item.isNull()) return
        if (pendingCreateChestShop[player.uuid] && samePos(pendingCreateChestShop[player.uuid]?.block?.pos ?? {}, block.pos)) return
        if (side == 0 || side == 1) return
        playClientSound(player, getSound("pending"));
        player.tell(ReplaceStr(lang.get("tell.chestshop.create.money"), {
            "keys.cancel": config.get("keys.cancel").join(lang.get("keys.or"))
        }))
        pendingCreateChestShop[player.uuid] && clearTimeout(pendingCreateChestShop[player.uuid].timeout)
        pendingCreateChestShop[player.uuid] = {
            block, item: item.clone(), side, timeout: setTimeout(() => {
                if (pendingCreateChestShop[player.uuid] == null) return
                else {
                    playClientSound(player, getSound("timeout"));
                    player.tell(lang.get("tell.chestshop.exit"))
                    delete pendingCreateChestShop[player.uuid]
                }
            }, 15000)
        }
        return false
    }
})
const SHOP_BLOCK_TYPES = new Set([
    "minecraft:wall_sign",
    "minecraft:chest"
]);

mc.listen("onAttackBlock", (player, bl, it) => {

    const type = bl.type;
    if (type !== "minecraft:wall_sign" && type !== "minecraft:chest") return;

    const pos = bl.pos;
    const shopid = type === "minecraft:wall_sign"
        ? getChestShopIDFromSign(pos)
        : getChestShopIDFromChest(pos);

    if (shopid == null) return;

    const chs = chestshops[shopid];
    if (chs == null) return;

    setTimeout(() => chs.updatesign?.(), 0);
    playClientSound(player, getSound("click"));

    const pUuid = player.uuid;
    const pending = pendingTradeChestShop[pUuid];

    const chestPos = chs.chestPos;
    const chestBlock = mc.getBlock(chestPos.x, chestPos.y, chestPos.z, chestPos.dimid);
    const container = chestBlock ? chestBlock.getContainer() : null;

    const count = chs.getItemCountinChest();
    const maxCount = getMaxCount(container, chs.item);

    const isBuy = chs.type === "buy";
    const isSell = chs.type === "sell";

    const action = isSell
        ? lang.get("chestshop.action.sell")
        : lang.get("chestshop.action.buy");
    const plaction = isSell
        ? lang.get("chestshop.action.plbuy")
        : lang.get("chestshop.action.plsell");
    const fcount = isSell ? count : maxCount - count
    let countstr = ReplaceStr(lang.get("chestshop.info.count"), {
        action,
        count: fcount,
    });

    if (count === 0 && isSell) {
        countstr = lang.get("chestshop.sign.line2.null");
    } else if (count === maxCount && isBuy) {
        countstr = lang.get("chestshop.sign.line2.full");
    }
    if (player.isSneaking) {
        // 解析商店物品SNBT并获取属性详情（如附魔、lore等）
        const content = getItemContent(chs.item, "");

        // 构造箱子商店基础信息（建议在lang中新增无边框的 chestshop.info.form 排版）
        const shopInfo = ReplaceStr(lang.get("chestshop.info.form") ?? lang.get("chestshop.info"), {
            ownername: chs.ownerName,
            item: chs.displayName,
            count: countstr,
            money: chs.money,
            moneyname: moneyname,
        });

        // 拼接完整文本：基础信息 + 物品具体属性内容（去除了中间的提示语和多余空行）
        // 如果 content 本身自带换行，可以直接用 shopInfo + content
        const icontent = shopInfo + "\n" + content;

        // 构造表单标题与按钮名
        const title = ReplaceStr(lang.get("form.chestshop.title"), {
            "prefix.chestshop": lang.get("prefix.chestshop") ?? "箱子商店"
        });
        const buttonName = lang.get("form.confirm");

        // 发送消息框表单
        player.sendMessageForm(title, icontent, buttonName, "", () => 0);
    } else {
        player.tell(ReplaceStr(lang.get("chestshop.info"), {
            ownername: chs.ownerName,
            item: chs.displayName,
            count: countstr,
            money: chs.money,
            moneyname: moneyname,
        }));

        const plmoney = moneys.get(player);
        let plcount = 0;

        if (isBuy) {
            const ownerXuid = data.fromUuid(chs.owner).xuid;
            const ownermoney = moneys.get(ownerXuid);
            const items = player.getInventory().getAllItems();
            plcount = Math.min(Math.floor(ownermoney / chs.money), maxCount - count, getSameItemCount(items, chs.item),);
        } else {
            plcount = Math.min(count, Math.floor(plmoney / chs.money));
        }

        player.tell(ReplaceStr(lang.get("tell.chestshop.trade"), {
            action: plaction,
            count: plcount
        }));

        if (pending?.timeout != null) {
            clearTimeout(pending.timeout);
        }

        pendingTradeChestShop[pUuid] = {
            block: bl,
            shopid,
            // ❌ 错误: count: fcount,
            // ✅ 修复: 将最高交易上限设置为真正计算出的 plcount
            count: plcount,
            timeout: setTimeout(() => {
                if (pendingTradeChestShop[pUuid] == null) return false;
                playClientSound(player, getSound("timeout"));
                player.tell(lang.get("tell.chestshop.exit"));
                pendingTradeChestShop[pUuid] = null;
            }, 15000)
        };
    }
    return false;
});
// 新增公共函数：
const getPosKey = (pos) => `${pos.dimid}|${pos.x}|${pos.y}|${pos.z}`;

const getChestShopIDFromSign = (pos) => signmaps[getPosKey(pos)] ?? null;
const getChestShopIDFromChest = (pos) => chestmaps[getPosKey(pos)] ?? null;
iListenAttentively.emplaceListener("ll::event::player::PlayerChatEvent", (ev) => {
    const msg = ev.message
    const pl = iListenAttentively.getPlayer(ev.self)
    if (pendingTradeChestShop[pl.uuid] != null) {
        const { shopid, timeout, count } = pendingTradeChestShop[pl.uuid]
        clearTimeout(timeout)
        tradeChestShop(pl, shopid, msg, count)
        ev.cancelled = true
        delete pendingTradeChestShop[pl.uuid]
    }
    if (pendingCreateChestShop[pl.uuid] != null) {
        const { block, item, side } = pendingCreateChestShop[pl.uuid]
        clearTimeout(pendingCreateChestShop[pl.uuid]?.timeout)
        if (config.get("keys.cancel").includes(msg)) {
            playClientSound(pl, getSound("timeout"));
            pl.tell(lang.get("tell.chestshop.exit"))
        }
        else {
            const i = pl.getHand()
            if (item?.isNull() || i.getNbt().toSNBT() != item.getNbt().toSNBT()) {
                if (i.isNull()) return
                else newChestShop(pl, block, i, side, msg)
            } else newChestShop(pl, block, item, side, msg)
        }
        ev.cancelled = true
        delete pendingCreateChestShop[pl.uuid]
    }
    // 取消消息发送
}, iListenAttentively.EventPriority.Highest)

// new Sign(new IntPos(0, 101, 0, 0), { frontText: "1111", clientOnly: false })
// new DropItem(mc.newItem("minecraft:iron_ingot", 1), getItemChestFloatPosFromIntPos(new IntPos(0, 101, 0, 0)))

mc.listen("onDestroyBlock", (pl, bl) => {
    if (bl.type != "minecraft:chest" && bl.type != "minecraft:wall_sign") return
    if ((bl.type == "minecraft:wall_sign" && getChestShopIDFromSign(bl.pos)) || (bl.type == "minecraft:chest" && getChestShopIDFromChest(bl.pos))) {
        const chs = chestshops[getChestShopIDFromSign(bl.pos) ?? getChestShopIDFromChest(bl.pos)]
        chs.updatesign()
    }
})
mc.listen("onCloseContainer", (pl, bl) => {
    if (bl.type != "minecraft:chest" && bl.type != "minecraft:wall_sign") return
    if (bl.type == "minecraft:chest" && getChestShopIDFromChest(bl.pos)) {
        const chs = chestshops[getChestShopIDFromChest(bl.pos)]
        chs.updatesign()
    }
})
export function loadChestShop() {
    const chestids = getChestShopIDs()
    for (const id of chestids) {
        const d = chestshopdata[id]
        if (d == null) continue
        // if (mc.getBlock(getPosFromPosObj(d.pos))?.isAir) continue
        const signpos = getAddPos(d.pos, SignBlockMap[sideMap[d.side]])
        mc.setBlock(signpos, "minecraft:wall_sign", signtileDataMap[sideMap[d.side]])
        const chs = new ChestShop(getPosFromPosObj(d.pos), d.item, {
            clientOnly: false,
            money: d.money,
            side: d.side,
            owner: d.owner,
            isSystem: d.isSystem ?? false,
            type: d.type ?? "sell",
            showItem: d.showItem ?? true,
        })
        chestshops[id] = chs
        signmaps[getPosKey(signpos)] = id;
        chestmaps[getPosKey(d.pos)] = id;
    }
}
// iListenAttentively.emplaceListener("ll::event::player::PlayerChatEvent", (ev) => {
//     const pl = iListenAttentively.getPlayer(ev.self)
//     else {

//         ev.cancelled = true
//     }
//     // 取消消息发送
// }, iListenAttentively.EventPriority.Highest)