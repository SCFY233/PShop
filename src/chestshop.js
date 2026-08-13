import { config, lang, moneyname, texture_paths, chestshopdata, getChestShopIDs, SignBlockMap, signtileDataMap, sideMap, saveChestShopData } from "./consts.js"
import { same, samePos, putItemToContainer, reduceItemFromContainer, giveItemF, getSameItemCount, getMaxCount, getItemDisplayName, getPosObjFromPos, getAddPos, getDirection, moneys, isPositiveInteger, ReplaceStr, getItemInfo, getCanPutItemCount, newItemWithAux, getItemContent, getCanReductItemCount, reduceItembyType, reduceItembyNbt, getPosFromPosObj, wlog } from "./lib/lib.js"
import { updateSignText, getItemChestFloatPosFromIntPos, ChestShop, playClientSound, closeChatByContainer } from "./lib/packet.js"
import { } from "./lib/form.js"
/** @type {import("../../iListenAttentively-LseExport/lib/iListenAttentively.js")} */
import iListenAttentively from "../../iListenAttentively-LseExport/lib/iListenAttentively.js"
export const chestshops = {}
export const signmaps = {}
export const chestmaps = {}
function randomID() {
    return Math.random().toString(16).substring(2, 8);
}
function generatePShopID() {
    const id = randomID()
    return getChestShopIDs().includes(id) ? generatePShopID() : id
}
export function getSound(sound) {
    return config.get("chestshop_sounds")[sound] ?? { sound: "random.orb", volume: 1.0, pitch: 1.0 }
}
function isVaildPositiveNumber(num) {
    return num == num && num > 0
}
// 新增公共函数：
export const getPosKey = (pos) => `${pos.dimid}|${pos.x}|${pos.y}|${pos.z}`;

export const getChestShopIDFromSign = (pos) => signmaps[getPosKey(pos)] ?? null;
export const getChestShopIDFromChest = (pos) => chestmaps[getPosKey(pos)] ?? null;
/**
 * 获取相连的大箱子/双箱子的另一半坐标
 * 
 * @param {IntPos} pos - 当前箱子的坐标
 * @returns {IntPos|null} 如果是双箱子，返回另一半箱子的 IntPos 坐标；如果是单箱子或非箱子，返回 null
 */
export function getLinkedChestPos(pos) {
    const block = mc.getBlock(pos);

    // 基础过滤：如果不是常规箱子或陷阱箱，直接跳过
    if (!block || (block.type != "minecraft:chest" && block.type != "minecraft:trapped_chest")) {
        return null;
    }

    // 获取方块实体 (Block Entity)
    const be = block.getBlockEntity();
    if (!be) return null;

    const nbt = be.getNbt();

    // 核心判定：基岩版的大箱子会在方块实体的 NBT 中存在 pairx 和 pairz 标签
    if (nbt.getTag("pairx") != null && nbt.getTag("pairz") != null) {
        const pairX = nbt.getData("pairx");
        const pairZ = nbt.getData("pairz");
        return new IntPos(pairX, pos.y, pairZ, pos.dimid);
    }

    return null;
}
const checkPerms = {}
//新建箱子商店函数
    /**
     * 
     * @param {Player} player 
     * @param {Block} chest 
     * @param {Item} item 
     * @param {Number} side 
     * @param {String} msg
     */
export function newChestShop(player, chest, item, side, msg) {

    const money = Number(msg)
    if (!isVaildPositiveNumber(money) || money <= 0) {
        playClientSound(player, getSound("fail"));
        return player.tell(ReplaceStr(lang.get("tell.chestshop.moneytype.decimal"), { input: msg }))
    }
    const pos = chest.pos
    const shopid = generatePShopID()
    const snbt = item.getNbt().toSNBT()
    const signpos = getAddPos(pos, SignBlockMap[sideMap[side]])
    playClientSound(player, getSound("pending"));
    player.tell(lang.get("tell.chestshop.create.checkperm"))
    checkPerms[player.uuid] = () => {
        if (mc.getBlock(signpos).type != "minecraft:air") return player.tell(ReplaceStr(lang.get("tell.chestshop.sign.notair"), { pos: signpos.toString() }))
        mc.setBlock(signpos, "minecraft:wall_sign", signtileDataMap[sideMap[side]])
        chestshopdata[shopid] = {
            pos: getPosObjFromPos(pos),
            owner: player.uuid,
            type: "sell",
            money: money,
            item: snbt,
            side,
            isSystem: false,
            allowHopperSearch: false, // 默认禁止漏斗吸出
            allowHopperPush: false,   // 默认禁止漏斗注入
        }
        saveChestShopData()
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
        wlog(player, ReplaceStr(lang.get("log.chestshop.create"), {
            pos: pos.toString(),
            "item.name": getItemDisplayName(item),
            money: money
        }));
        player.tell(lang.get("tell.chestshop.create"))
        delete checkPerms[player.uuid]
    }
    checkPerms[player.uuid].pos = pos
}

export function tradeChestShop(player, shopid, msg, count) {
    const plcount = msg == "all" ? count : Number(msg);
    const chs = chestshops[shopid];
    const isSell = chs.type == "sell"; // 商店出售(玩家购买)

    // 1. 输入校验
    if (!isPositiveInteger(plcount)) {
        return player.tell(ReplaceStr(lang.get("tell.chestshop.count.type"), { msg: `${msg}(${plcount})` }));
    }
    if (plcount > count) {
        return player.tell(ReplaceStr(lang.get("tell.chestshop.count.type2"), {
            action: lang.get(isSell ? "chestshop.action.plbuy" : "chestshop.action.plsell"),
            count, msg
        }));
    }

    // 2. 基础交易信息
    const totalMoney = plcount * chs.money;
    const tempItem = chs.item;
    const itemName = tempItem ? getItemDisplayName(tempItem) : "???";

    try {
        // 3. 实时余额校验
        const realTimeMoney = moneys.get(player);
        if (isSell && realTimeMoney < totalMoney) {
            return player.tell(ReplaceStr(lang.get("form.shop.buy.item.count.max"), {
                input: plcount, maxcount: Math.floor(realTimeMoney / chs.money)
            }));
        }

        // 4. 安全获取商店容器 (系统商店直接跳过)
        let ct = null;
        if (!chs.isSystem) {
            const pos = chs.chestPos;
            const block = mc.getBlock(pos.x, pos.y, pos.z, pos.dimid);
            if (!block) return player.tell(lang.get("tell.chestshop.error.block"));

            ct = block.getContainer();
            if (!ct) return player.tell(lang.get("tell.chestshop.error.container"));
        }

        // 5. 克隆物品对象，防止底层指针失效
        const safeItem = mc.newItem(tempItem.getNbt());
        let success = false;

        // 6. 执行主体交易 (买卖双方物品与发起者资金转移)
        if (isSell) {
            // 【玩家购买】
            let canTrade = chs.isSystem ? true : reduceItemFromContainer(ct, safeItem, plcount);
            if (canTrade) {
                moneys.reduce(player, totalMoney);
                giveItemF(player, safeItem, plcount);
                success = true;
            }
        } else {
            // 【玩家出售】
            if (reduceItemFromContainer(player.getInventory(), safeItem, plcount)) {
                let canTrade = chs.isSystem ? true : putItemToContainer(ct, safeItem, plcount);
                if (canTrade) {
                    moneys.add(player, totalMoney);
                    success = true;
                } else {
                    giveItemF(player, safeItem, plcount); // 箱子满，退还
                }
                player.refreshItems();
            }
        }

        // 7. 处理店主资金增减与通知 (提炼出的公共逻辑)
        if (success && !chs.isSystem) {
            const ownerData = data.fromUuid(chs.owner);
            if (ownerData && ownerData.xuid) {
                const ownerXuid = ownerData.xuid;
                const ownerPlayer = mc.getPlayer(ownerXuid);

                // 提前准备通知所需的共用数据，减少重复计算
                const posStr = chs.chestPos.toString();
                const currentCount = chs.getItemCountinChest();
                const itemSnbt = safeItem.getNbt().toSNBT();

                if (isSell) {
                    // 店主收入
                    moneys.add(ownerXuid, totalMoney);

                    if (ownerPlayer) {
                        ownerPlayer.tell(ReplaceStr(lang.get("notice.shop.income"), { pos: posStr, count: plcount, itemname: itemName }));
                        if (currentCount == 0) ownerPlayer.tell(ReplaceStr(lang.get("notice.shop.empty"), { pos: posStr, itemname: itemName }));
                    } else {
                        addgiveNotice(ownerXuid, itemSnbt, plcount, shopid);
                        if (currentCount == 0) {
                            let notices = getgives(ownerXuid);
                            notices.push({ pl: String(ownerXuid), item: itemSnbt, count: 0, shopid: shopid, type: "empty" });
                            givesdata.set(String(ownerXuid), notices);
                        }
                    }
                } else {
                    // 店主支出
                    moneys.reduce(ownerXuid, totalMoney);
                    const maxCount = getMaxCount(ct, chs.item);

                    if (ownerPlayer) {
                        ownerPlayer.tell(ReplaceStr(lang.get("notice.shop.expense"), { pos: posStr, count: plcount, itemname: itemName, money: totalMoney, moneyname: moneyname }));
                        if (currentCount >= maxCount) ownerPlayer.tell(ReplaceStr(lang.get("notice.shop.full"), { pos: posStr, itemname: itemName }));
                    } else {
                        let notices = getgives(ownerXuid);
                        notices.push({ pl: String(ownerXuid), item: itemSnbt, count: plcount, shopid: shopid, type: "expense", money: totalMoney });
                        if (currentCount >= maxCount) {
                            notices.push({ pl: String(ownerXuid), item: itemSnbt, count: 0, shopid: shopid, type: "full" });
                        }
                        givesdata.set(String(ownerXuid), notices);
                    }
                }
            }
        }
        if (success) {
            const logKey = isSell ? "log.chestshop.buy" : "log.chestshop.sell";
            const ownerName = chs.ownerName || data.fromUuid(chs.owner)?.name || chs.owner;
            wlog(player, ReplaceStr(lang.get(logKey), {
                pos: chs.chestPos.toString(),
                owner: ownerName,
                "item.name": itemName,
                quantity: plcount,
                totalCost: totalMoney
            }));
        }

        // 8. 处理最终提示语与音效
        playClientSound(player, getSound(success ? "success" : "fail"));

        const msgKey = success
            ? (isSell ? "tell.chestshop.buy.success" : "tell.chestshop.sell.success")
            : (isSell ? "tell.chestshop.buy.fail" : "tell.chestshop.sell.fail");

        player.tell(ReplaceStr(lang.get(msgKey), {
            iname: itemName, totalCost: totalMoney, totalgive: totalMoney.toFixed(5).replace(/\.?0+$/, ""),
            moneyname, plmoney: moneys.get(player).toFixed(5).replace(/\.?0+$/, "")
        }));
        chs.updatesign();
        refresh2(chs.chestPos)
    } catch (err) {
        player.tell(lang.get("tell.chestshop.error.system"));
        logger.error(`[PShop] 交易异常: ${err}\n${err.stack}`);
    }
}
export function refresh2(pos) {
    const chs2pos = getLinkedChestPos(pos);
    if (!chs2pos) return;
    const chs2id = chestmaps[getPosKey(chs2pos)];
    if (chs2id && chestshops[chs2id]) chestshops[chs2id].updatesign();
}
/**
 * 商店配置管理表单
 * @param {Player} player 交互的玩家对象
 * @param {String} shopid 商店的唯一ID
 * @param {ChestShop} chs 商店实例对象
 */
export function ManageChestShop(player, shopid, chs) {
    const gui = mc.newCustomForm();
    gui.setTitle(lang.get("form.chestshop.manage.title"));

    let labelText = lang.get("form.chestshop.manage.label");
    if (player.isOP()) {
        const ownerName = chs.ownerName || data.fromUuid(chs.owner)?.name || "未知玩家";
        labelText += ReplaceStr(lang.get("form.chestshop.manage.label.op"), {
            ownername: ownerName,
            uuid: chs.owner
        });
    }
    gui.addLabel(labelText); // data[0]
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
    const typeDefault = chs.type == "buy" ? 1 : 0;
    gui.addDropdown(lang.get("form.chestshop.manage.dropdown.type"), typeOptions, typeDefault); // data[2]

    // 3. 开关
    gui.addSwitch(lang.get("form.chestshop.manage.switch.showitem"), chs.showItem ?? true); // data[3]
    gui.addSwitch(lang.get("form.chestshop.manage.switch.hopper_search"), chs.allowHopperSearch ?? false); // data[4]
    gui.addSwitch(lang.get("form.chestshop.manage.switch.hopper_push"), chs.allowHopperPush ?? false); // data[5]
    gui.addSwitch(lang.get("form.chestshop.manage.switch.delete"), false); // data[6]
    if (player.isOP()) {
        gui.addSwitch(lang.get("form.chestshop.manage.switch.system_shop"), chs.isSystem ?? false); // data[7]
    }
    // 发送表单并监听回调
    player.sendForm(gui, (pl, data) => {
        if (!data) return; // 玩家取消了表单

        const isDelete = data[6]; // 获取删除开关状态

        // ==================
        // 分支 A：玩家选择了删除商店
        // ==================
        if (isDelete) {
            const d = chestshopdata[shopid];
            const chestPosObj = d.pos;
            const chestPos = getPosFromPosObj(chestPosObj);
            const signPos = getAddPos(chestPos, SignBlockMap[sideMap[d.side]]);

            // 1. 销毁实例（清理悬浮物等）
                chs.destroy();
            // 2. 从内存和持久化数据中彻底移除
            delete chestshopdata[shopid];
            delete chestshops[shopid];
            delete chestmaps[getPosKey(chestPos)];
            delete signmaps[getPosKey(signPos)];
            saveChestShopData();
            wlog(pl, ReplaceStr(lang.get("log.chestshop.delete"), {
                pos: chestPos.toString(),
                shopid: shopid
            }));
            playClientSound(pl, getSound("click"));
            //3. 清除牌子
            mc.setBlock(signPos, "minecraft:air");
            return pl.tell(lang.get("tell.chestshop.manage.delete.success"),);
        }

        // ==================
        // 分支 B：更新商店配置
        // ==================
        const newPrice = Number(data[1]);
        const newType = data[2] == 1 ? "buy" : "sell";
        const newShowItem = data[3];
        const newAllowHopperSearch = data[4];
        const newAllowHopperPush = data[5];
        let newIsSystem = chs.isSystem;
        if (pl.isOP() && data.length >= 7) {
            newIsSystem = data[7];
        }
        // 校验价格
        if (!isVaildPositiveNumber(newPrice) || newPrice <= 0) {
            playClientSound(pl, getSound("fail"));
            return pl.tell(ReplaceStr(lang.get("tell.chestshop.moneytype.decimal"), { input: String(data[1]) }));
        }

        // 1. 更新持久化数据
        chestshopdata[shopid].money = newPrice;
        chestshopdata[shopid].type = newType;
        chestshopdata[shopid].showItem = newShowItem;
        chestshopdata[shopid].allowHopperSearch = newAllowHopperSearch;
        chestshopdata[shopid].allowHopperPush = newAllowHopperPush;
        chestshopdata[shopid].isSystem = newIsSystem; // 【修改点】保存系统商店状态
        if (newIsSystem) {
            // 如果转为系统商店，且 uuid 还没加前缀，则在前面加一个 '_'
            if (typeof chestshopdata[shopid].owner == "string" && !chestshopdata[shopid].owner.startsWith("_")) {
                chestshopdata[shopid].owner = "_" + chestshopdata[shopid].owner;
            }
        } else {
            // 如果关停系统商店(变回普通商店)，且 uuid 带有 '_' 前缀，则去掉首个字符恢复原本的 uuid
            if (typeof chestshopdata[shopid].owner == "string" && chestshopdata[shopid].owner.startsWith("_")) {
                chestshopdata[shopid].owner = chestshopdata[shopid].owner.substring(1);
            }
        }
        saveChestShopData();
        // 2. 销毁旧实例
            chs.destroy();


        // 3. 重新生成并覆盖
        const d = chestshopdata[shopid];
        const newChs = new ChestShop(getPosFromPosObj(d.pos), d.item, {
            clientOnly: false, money: d.money, side: d.side, owner: d.owner, isSystem: d.isSystem ?? false, type: d.type,
            showItem: d.showItem, allowHopperSearch: d.allowHopperSearch, allowHopperPush: d.allowHopperPush
        });

        newChs.updatesign();
        chestshops[shopid] = newChs;
        playClientSound(pl, getSound("create"));
        pl.tell(lang.get("tell.chestshop.manage.success"));
        refresh2(chs.chestPos)
    });
}
// 商店防护机制 - 提取公共检测函数 (同时检测箱子与木牌)
export function isProtectedShopBlock(pos, blockType) {
    // 1. 优先通过坐标快速检测箱子
    const key = `${pos.dimid}|${Math.floor(pos.x)}|${Math.floor(pos.y)}|${Math.floor(pos.z)}`;
    let shopid = chestmaps[key];

    // 2. 如果不是箱子，调用原本已有的木牌查询函数检测是否为商店木牌
    if (shopid == null) {
        // 如果明确传了方块类型，做个速筛优化性能；没传则直接查
        if (!blockType || blockType == "minecraft:wall_sign") {
            shopid = getChestShopIDFromSign(pos)
        }
    }
    return shopid;
}
export function loadChestShop() {
    if (!config.get('enable').chestshop) return
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
            allowHopperSearch: d.allowHopperSearch ?? false,
            allowHopperPush: d.allowHopperPush ?? false,
        })
        chestshops[id] = chs
        signmaps[getPosKey(signpos)] = id;
        chestmaps[getPosKey(d.pos)] = id;
    }
    return true
}
const SHOP_BLOCK_TYPES = new Set([
    "minecraft:wall_sign",
    "minecraft:chest"
]);
const pendingCreateChestShop = {}
const pendingTradeChestShop = {}
const manageLockMap = new Set();


if (config.get("enable").chestshop) {
    mc.listen("onCloseContainer", (pl, bl) => {
        if (checkPerms[pl.uuid] && same(checkPerms[pl.uuid].pos, bl.pos)) checkPerms[pl.uuid]() && delete checkPerms[pl.uuid]
    })
    mc.listen("onUseItemOn", (player, item, block, side) => {
        if (block.type != "minecraft:chest" && block.type != "minecraft:wall_sign") return
        if (block.type == "minecraft:wall_sign" && getChestShopIDFromSign(block.pos)) {
            const shopid = getChestShopIDFromSign(block.pos)
            if (shopid == null) return
            const chs = chestshops[shopid]
            setTimeout(() => chs?.updatesign(), 0)
            refresh2(chs.chestPos)
            if (!player.isSneaking) return false
            if (player.isOP() || (!chs.isSystem && chs.owner == player.uuid)) {
                if (!manageLockMap.has(player.uuid)) {
                    manageLockMap.add(player.uuid);
                    ManageChestShop(player, shopid, chs);

                    setTimeout(() => {
                        manageLockMap.delete(player.uuid);
                    }, 500);
                }
            }
            return false
        }
        if (block.type == "minecraft:chest" && getChestShopIDFromChest(block.pos)) {
            const shopid = getChestShopIDFromChest(block.pos)
            const chs = chestshops[shopid]
            setTimeout(() => chs?.updatesign(), 0)
            if (player.isOP() || player.isSneaking || (!chs.isSystem && chs.owner == player.uuid)) return
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
    mc.listen("onUseItem", (pl, it) => {
        if (pendingCreateChestShop[pl.uuid] || pendingTradeChestShop[pl.uuid] || manageLockMap.has(pl.uuid)) return false
    })
    mc.listen("onAttackBlock", (player, bl, it) => {

        const type = bl.type;
        if (type != "minecraft:wall_sign" && type != "minecraft:chest") return;

        const pos = bl.pos;
        const shopid = type == "minecraft:wall_sign"
            ? getChestShopIDFromSign(pos)
            : getChestShopIDFromChest(pos);

        if (shopid == null) return;

        const chs = chestshops[shopid];
        if (chs == null) return;

        setTimeout(() => chs.updatesign?.(), 0);
        refresh2(chs.chestPos)
        playClientSound(player, getSound("click"));

        const pUuid = player.uuid;
        const pending = pendingTradeChestShop[pUuid];

        const chestPos = chs.chestPos;
        const chestBlock = mc.getBlock(chestPos.x, chestPos.y, chestPos.z, chestPos.dimid);
        const container = chestBlock ? chestBlock.getContainer() : null;

        let count = 0, maxCount = 0;
        if (chs.isSystem) {
            count = Infinity;
            maxCount = Infinity;
        } else {
            if (!container) return false; // 防止箱子被秒拆导致报错
            const countRes = chs.getItemCountinChest();
            count = typeof countRes == "number" ? countRes : 0;
            maxCount = getMaxCount(container, chs.item);
        }

        const isBuy = chs.type == "buy";
        const isSell = chs.type == "sell";

        const action = isSell
            ? lang.get("chestshop.action.sell")
            : lang.get("chestshop.action.buy");
        const plaction = isSell
            ? lang.get("chestshop.action.plbuy")
            : lang.get("chestshop.action.plsell");
        let countstr = "";
        if (chs.isSystem) {
            countstr = ReplaceStr(lang.get("chestshop.info.count"), {
                action,
                count: lang.get("chestshop.infinite"), // 修复语言键名
            });
        } else {
            const fcount = isSell ? count : maxCount - count;
            countstr = ReplaceStr(lang.get("chestshop.info.count"), {
                action,
                count: fcount,
            });

            if (count == 0 && isSell) {
                countstr = lang.get("chestshop.sign.line2.null");
            } else if (count == maxCount && isBuy) {
                countstr = lang.get("chestshop.sign.line2.full");
            }
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
            const title = lang.get("form.chestshop.title")
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
                let ownerAfford = Infinity;
                if (!chs.isSystem) {
                    const ownerData = data.fromUuid(chs.owner);
                    if (ownerData && ownerData.xuid) {
                        ownerAfford = Math.floor(moneys.get(ownerData.xuid) / chs.money);
                    } else {
                        ownerAfford = 0;
                    }
                }
                const availSpace = chs.isSystem ? Infinity : maxCount - count;
                plcount = Math.min(ownerAfford, availSpace, getSameItemCount(player.getInventory().getAllItems(), chs.item));
            } else {
                const emptySpace = getCanPutItemCount(player, chs.item.getNbt());
                const availItems = chs.isSystem ? Infinity : count;
                plcount = Math.min(availItems, Math.floor(plmoney / chs.money), emptySpace);
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
                // ✅ 修复: 将最高交易上限设置为真正计算出的 plcount
                count: plcount,
                timeout: setTimeout(() => {
                    if (pendingTradeChestShop[pUuid] == null) return false;
                    if (!player) return
                    playClientSound(player, getSound("timeout"));
                    player.tell(lang.get("tell.chestshop.exit"));
                    delete pendingTradeChestShop[pUuid]
                }, 15000)
            };
        }
        return false;
    });

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
                    if (i.isNull()) newChestShop(pl, block, item, side, msg)
                    else newChestShop(pl, block, i, side, msg)
                } else newChestShop(pl, block, item, side, msg)
            }
            ev.cancelled = true
            delete pendingCreateChestShop[pl.uuid]
        }
        // 取消消息发送
    }, iListenAttentively.EventPriority.Highest)

    mc.listen("onDestroyBlock", (pl, bl) => {
        if (bl.type != "minecraft:chest" && bl.type != "minecraft:wall_sign") return
        if ((bl.type == "minecraft:wall_sign" && getChestShopIDFromSign(bl.pos)) || (bl.type == "minecraft:chest" && getChestShopIDFromChest(bl.pos))) {
            const chs = chestshops[getChestShopIDFromSign(bl.pos) ?? getChestShopIDFromChest(bl.pos)]
            chs.updatesign()
            refresh2(chs.chestPos)
            return false
        }
    })
    mc.listen("onCloseContainer", (pl, bl) => {
        if (bl.type != "minecraft:chest" && bl.type != "minecraft:wall_sign") return
        if (bl.type == "minecraft:chest" && getChestShopIDFromChest(bl.pos)) {
            const chs = chestshops[getChestShopIDFromChest(bl.pos)]
            chs.updatesign()
            refresh2(chs.chestPos)
        }
    })

    // 漏斗检测
    const HOPPER_SEARCH_OFFSETS = [[0, 1, 0], [0, 0, 0]];
    const HOPPER_PUSH_OFFSETS = [[0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];

    mc.listen("onHopperSearchItem", (pos, isMinecart, item) => {
        const x = Math.floor(pos.x); const y = Math.floor(pos.y); const z = Math.floor(pos.z); const dimid = pos.dimid;
        for (let i = 0; i < HOPPER_SEARCH_OFFSETS.length; i++) {
            const offset = HOPPER_SEARCH_OFFSETS[i];
            const shopid = chestmaps[`${dimid}|${x + offset[0]}|${y + offset[1]}|${z + offset[2]}`];
            if (shopid != null) {
                const chs = chestshops[shopid];
                if (chs && !chs.allowHopperSearch) return false;
            }
        }
    });

    mc.listen("onHopperPushOut", (pos, isMinecart, item) => {
        const x = Math.floor(pos.x); const y = Math.floor(pos.y); const z = Math.floor(pos.z); const dimid = pos.dimid;
        for (let i = 0; i < HOPPER_PUSH_OFFSETS.length; i++) {
            const offset = HOPPER_PUSH_OFFSETS[i];
            const shopid = chestmaps[`${dimid}|${x + offset[0]}|${y + offset[1]}|${z + offset[2]}`];
            if (shopid != null) {
                const chs = chestshops[shopid];
                if (chs && !chs.allowHopperPush) return false;
            }
        }
    });


    // 防活塞推拉 (包含箱子与木牌)
    mc.listen("onPistonTryPush", (pistonPos, block) => {
        if (isProtectedShopBlock(block.pos, block.type) != null) {
            return false;
        }
        return true;
    });

    // 防液体（水/岩浆）冲刷 (包含箱子与木牌)
    mc.listen("onLiquidFlow", (from, to) => {
        // to 是液体即将流向的坐标。如果是商店木牌所在格，直接拦住水流
        if (isProtectedShopBlock(to) != null) {
            return false;
        }
        return true;
    });

    // 防环境机制导致的方块更替
    mc.listen("onBlockChanged", (beforeBlock, afterBlock) => {
        if (isProtectedShopBlock(beforeBlock.pos, beforeBlock.type) != null) {
            return false;
        }
        return true;
    });

    // Hook 爆炸 by 子沐呀
    // 子沐nb666(雾)
    const protectedResistances = [];

    function registerBlockResistances(blockName, minState, maxState, defaultVal) {
        const name = iListenAttentively.alignedMallocMemory(48, 8);
        iListenAttentively.setUnsignedLongLong(name, "14916867654084188803"); // hash 
        iListenAttentively.callExportedFunction("ctorString", false, name + 8, blockName); // name 
        iListenAttentively.setUnsignedLongLong(name + 40, 0); // last match 
        const block = iListenAttentively.mallocMemory(8);
        const funcPtr = iListenAttentively.getAddressFromSymbol("LeviLamina", `?tryGetFromRegistry@Block@@SA?AV?$optional_ref@$$CBVBlock@@@@AEBVHashedString@@G@Z`);

        for (let index = minState; index <= maxState; index++) { // 遍历方块朝向状态
            iListenAttentively.dynamicCall(
                funcPtr,
                iListenAttentively.NativeType.Pointer,
                [iListenAttentively.NativeType.Pointer, iListenAttentively.NativeType.Pointer, iListenAttentively.NativeType.UnsignedShort],
                [block, name, index]
            );
            const blockPtr = iListenAttentively.getUnsignedLongLong(block);
            if (blockPtr) {
                protectedResistances.push({
                    address: blockPtr + 188, // 抗性字段偏移
                    defaultVal: defaultVal   // 原始默认抗性
                });
            }
        }

        iListenAttentively.callExportedFunction("dtorString", false, name + 8); // name 
        iListenAttentively.alignedFreeMemory(name);
    }

    mc.listen("onServerStarted", () => {
        registerBlockResistances("minecraft:chest", 2, 5, 2.5);
        registerBlockResistances("minecraft:wall_sign", 2, 5, 1.0);
        loadChestShop()
    });

    iListenAttentively.hook(
        iListenAttentively.getAddressFromSymbol(
            `?explode@Explosion@@QEAA_NAEAVIRandom@@@Z`
        ),
        (origin, self, random) => {
            for (let item of protectedResistances) {
                iListenAttentively.setFloat(item.address, 1314520);
            }
            origin(self, random);
            for (let item of protectedResistances) {
                iListenAttentively.setFloat(item.address, item.defaultVal);
            }
        },
        iListenAttentively.NativeType.Void,
        [iListenAttentively.NativeType.Pointer, iListenAttentively.NativeType.Pointer]
    );

}
