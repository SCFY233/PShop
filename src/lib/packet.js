import { GMLIB_BinaryStream, Minecraft } from "../../../GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.js";

//鸣谢:子沐 Gemini 千问
const writeY = mc.getServerProtocolVersion() >= 944
    ? (bs, y) => bs.writeVarInt(y)
    : (bs, y) => bs.writeUnsignedVarInt(y);
export function sendUpdateBlockPacket(player, pos, runtimeId, layer = 0, flags = 3) {
    const bs = new BinaryStream();
    bs.writeVarInt(pos.x);
    writeY(bs, pos.y);
    bs.writeVarInt(pos.z);
    bs.writeUnsignedVarInt(Number(runtimeId));
    bs.writeUnsignedVarInt(Number(layer));
    bs.writeUnsignedVarInt(Number(flags));
    return player.sendPacket(bs.createPacket(0x15));
}
/**
发送 BlockActorDataPacket (ID 56)
用于更新客户端指定坐标的方块实体 NBT 数据
*/
export function sendBlockActorDataPacket(player, pos, nbt) {
    const bs = new BinaryStream();
    bs.writeVarInt(pos.x);
    writeY(bs, pos.y);
    bs.writeVarInt(pos.z);
    bs.writeCompoundTag(nbt);
    return player.sendPacket(bs.createPacket(56));
}
// ==========================================
// NBT 构建工具
// ==========================================
/**
构建单面文本 NBT 复合标签
@param {string} text - 文本内容
@param {string} owner - 文本所有者 (用于过滤)
@param {boolean} persistFormatting - 是否保留格式化代码 (§)
@param {number} color - 文本颜色 (ARGB 整数)
@returns {NbtCompound} 木牌单面文本 NBT
*/
export function buildSignTextNBT(text, owner = "PShop", persistFormatting = true, color = -16777216) {
    const tag = new NbtCompound();
    tag.setString("FilteredText", "");
    tag.setByte("HideGlowOutline", 0);
    tag.setByte("IgnoreLighting", 0);
    tag.setByte("PersistFormatting", persistFormatting ? 1 : 0);
    tag.setInt("SignTextColor", color);
    tag.setString("Text", text);
    tag.setString("TextOwner", owner);
    return tag;
}
// ==========================================
// 核心 API
// ==========================================
/**
更新木牌文本 (支持真实修改与虚拟发包)
@param {Player|Player[]} players - 目标玩家(数组)
@param {number} x - X 坐标
@param {number} y - Y 坐标
@param {number} z - Z 坐标
@param {Object} [options] - 配置项
@param {string} [options.frontText=""] - 正面文本
@param {string} [options.backText=""] - 背面文本
@param {boolean} [options.persistFormatting=true] - 保留格式
@param {number} [options.frontColor=-16777216] - 正面颜色
@param {number} [options.backColor=-16777216] - 背面颜色
@param {boolean} [options.clientOnly=false] - true=仅客户端显示(假木牌),不修改服务端NBT
@param {number} [options.customRuntimeId] - 自定义方块RuntimeId (clientOnly为true且原位置不是木牌时必填)
@param {boolean} [options.forceRefresh=true] - 是否发送假RuntimeId打破客户端缓存
@param {number} [options.dimid] - 维度ID
@returns {boolean} 是否成功
*/
export function updateSignText(players, x, y, z, options = {}) {
    try {
        const playerList = Array.isArray(players) ? players : [players];
        if (playerList.length === 0) return false;
        // 解构默认参数
        const {
            frontText = "", backText = "",
            persistFormatting = true,
            frontColor = -16777216, backColor = -16777216,
            clientOnly = false,
            forceRefresh = true,
            dimid = playerList[0].pos.dimid
        } = options;
        const pos = { x, y, z };
        const block = mc.getBlock(x, y, z, dimid);
        // 确定正确的 RuntimeId
        const correctRuntimeId = Minecraft.getBlockRuntimeId(block.type, block.tileData);
        const ownerName = playerList[0].realName || "";
        const nbt = block?.getBlockEntity() ? block.getBlockEntity().getNbt() : new NbtCompound();
        nbt.setTag("FrontText", buildSignTextNBT(frontText, ownerName, persistFormatting, frontColor));
        nbt.setTag("BackText", buildSignTextNBT(backText, ownerName, persistFormatting, backColor));
        nbt.setString("id", "Sign");
        nbt.setByte("isMovable", 1);
        nbt.setInt("x", x);
        nbt.setInt("y", y);
        nbt.setInt("z", z);
        if (!clientOnly && block) {
            block.getBlockEntity().setNbt(nbt);
        }
        // 准备打破缓存的假 RuntimeId
        const fakeRuntimeId = forceRefresh ? correctRuntimeId + 1 : null;
        // 向每个玩家发送数据包
        for (const player of playerList) {
            try {
                // 1. 发送假 RuntimeId 打破客户端缓存
                if (fakeRuntimeId !== null) {
                    sendUpdateBlockPacket(player, pos, fakeRuntimeId, 0, 3);
                }
                // 2. 发送正确的方块状态
                sendUpdateBlockPacket(player, pos, correctRuntimeId, 0, 3);
                // 3. 发送方块实体数据 (文本 NBT)
                if (!sendBlockActorDataPacket(player, pos, nbt)) {
                    throw new Error("发送 BlockActorDataPacket 失败");
                }
            } catch (e) {
                logger.error(`[SignAPI] 向玩家 ${player.realName} 发包错误: ${e}`);
                return false;
            }
        }
        return true;
    } catch (e) {
        logger.error(`[SignAPI] 更新木牌文本错误: ${e}`);
        return false;
    }
}


// ==========================================
// [使用示例]
// ==========================================

// mc.listen("onChat", (player, msg) => {
//     if (msg === "signtest") {
//         // 1. 获取玩家面前的坐标 (脚上一格)
//         let pos = player.blockPos;
//         let x = pos.x, y = pos.y + 1, z = pos.z;

//         // 2. 获取木牌的 RuntimeId (以橡木挂牌为例)

//         // 3. 调用虚拟发包函数
//         updateSignText(player, x, y, z, {
//             backText: "Back\n§l§b[TEST]\n§r§aHello World!",
//             frontText: "Front\n§l§b[TEST]\n§r§aBy Packet!",
//             clientOnly: true,
//         });

//         setTimeout(() => player.refreshChunks(), 2000); // 刷新区块,检测发包是否成功
//         return false; // 拦截这条聊天信息,不广播给其他人
//     }
// });


/**
 * 往 BinaryStream 中写入无符号变长 64 位整数 (VarInt64)
 * @param {BinaryStream} bs - LegacyScriptEngine 的二进制流对象
 * @param {BigInt|String|Number} uvalue - 要写入的 64 位无符号整数
 */
function writeUnsignedVarInt64ToStream(bs, uvalue) {
    let val = BigInt(uvalue);

    do {
        let next_byte = Number(val & 0x7Fn);
        val >>= 7n;
        if (val !== 0n) {
            next_byte |= 0x80;
        }
        // 调用 BinaryStream 对象的写入单字节方法
        bs.writeUnsignedChar(next_byte);

    } while (val !== 0n);
}
/**
 * 写入有符号变长 64 位整数 (VarInt64)
 * 采用 ZigZag 编码将有符号数映射为无符号数后写入
 * @param {BinaryStream} bs - LegacyScriptEngine 的二进制流对象
 * @param {BigInt|String|Number} ivalue - 要写入的 64 位有符号整数
 */
function writeVarInt64ToStream(bs, ivalue) {
    let val = BigInt(ivalue);

    // 1. 64 位有符号数的 ZigZag 编码
    // 公式: (val << 1) ^ (val >> 63)  [针对补码负数符号位扩展]
    let zigzag = (val << 1n) ^ (val >> 63n);

    // 2. 按照无符号 VarInt 逻辑写入
    do {
        let next_byte = Number(zigzag & 0x7Fn);
        zigzag >>= 7n;
        if (zigzag !== 0n) {
            next_byte |= 0x80;
        }
        bs.writeUnsignedChar(next_byte);
    } while (zigzag !== 0n);
}
export let mDecrementingID = 9223372036854775807n;
// /**
//  * 通过 物品对象 和 坐标 创建 添加掉落物实体 数据包
//  * @type {(item: Item, pos: FloatPos) => {id: bigint, pkt: Packet}}
//  * @warning 创建出来的物品最多在客户端存在 32.305833 分钟，需要每半小时发一次 SetActorData 数据包
//  * @author 子沐呀 QQ 1756150362
//  * @since 2026-07-27
//  */
// const createAddItemActorPacket = (() => {
//     return (item, pos) => {
//         const id = --mDecrementingID;
//         const stream = new GMLIB_BinaryStream();
//         stream.writePacketHeader(15)
//         writeVarInt64ToStream(stream, id.toString()); // uniqueId
//         writeUnsignedVarInt64ToStream(stream, id.toString()); // runtimeId
//         stream.writeItem(item);
//         stream.writeFloat(pos.x);
//         stream.writeFloat(pos.y);
//         stream.writeFloat(pos.z);
//         stream.writeFloat(0);
//         stream.writeFloat(0);
//         stream.writeFloat(0);
//         stream.writeUnsignedVarInt(3); // length
//         stream.writeUnsignedVarInt(/* ActorDataIDs::ClientEvent */24);
//         stream.writeUnsignedVarInt(/* DataItemType::Short */1);
//         stream.writeSignedShort(-32767);
//         stream.writeUnsignedVarInt(/* ActorDataIDs::NametagAlwaysShow */81);
//         stream.writeUnsignedVarInt(/* DataItemType::Byte */0);
//         stream.writeBool(true);
//         stream.writeUnsignedVarInt(/* ActorDataIDs::Name */4);
//         stream.writeUnsignedVarInt(/* DataItemType::String */4);
//         stream.writeString("菲露露可爱捏~");
//         stream.writeBool(false);
//         stream.sendTo(mc.getPlayer("ColdestCarp5592"))
//         return { id, }; // 开启raw，使用乱发模式OwO
//     };
// })();

// /**
//  * 创建 更新掉落物存在时间 数据包（也可以更新别的，自己玩）
// * @type {(id: bigint) => Packet}
// *
// * @author 子沐呀 QQ 1756150362
// * @since 2026-07-27
// */
// const createUpdateItemActorAgePacket = (() => {
//     return (id) => {
//         const stream = new BinaryStream();
//         writeUnsignedVarInt64ToStream(stream, id.toString()); // runtimeId
//         stream.writeUnsignedVarInt(3); // length
//         stream.writeUnsignedVarInt(/* ActorDataIDs::ClientEvent */24);
//         stream.writeUnsignedVarInt(/* DataItemType::Short */1);
//         stream.writeSignedShort(-32767);
//         stream.writeUnsignedVarInt(/* ActorDataIDs::NametagAlwaysShow */81);
//         stream.writeUnsignedVarInt(/* DataItemType::Byte */0);
//         stream.writeBool(true);
//         stream.writeUnsignedVarInt(/* ActorDataIDs::Name */4);
//         stream.writeUnsignedVarInt(/* DataItemType::String */4);
//         stream.writeString("真可爱呀~");
//         stream.writeUnsignedVarInt(0);
//         stream.writeUnsignedVarInt(0);
//         stream.writeUnsignedVarInt(0);
//         return stream.createPacket(/* MinecraftPacketIds::SetActorData */39, true);
//     };
// })();

// /**
//  * 创建 删除实体 数据包
// * @type {(id: bigint) => Packet}
// *
// * @author 子沐呀 QQ 1756150362
// * @since 2026-07-27
//  */
// const createRemoveItemActorPacket = (() => {
//     return (id) => {
//         const stream = new BinaryStream();
//         writeVarInt64ToStream(stream, id.toString()); // uniqueId
//         return stream.createPacket(/* MinecraftPacketIds::RemoveActor */14, true);
//     }
// })();
// const item = mc.newItem("minecraft:bedrock", 64);
// const { id } = createAddItemActorPacket(item, { x: 0, y: 104, z: 0 });
// logger.warn(id.toString());
// mc.getPlayer("ColdestCarp5592").sendPacket(createUpdateItemActorAgePacket(id));
// // mc.getPlayer("ColdestCarp5592").sendPacket(createRemoveItemActorPacket(id));

/**
 * @description 掉落物实体数据包封装（支持单玩家、玩家数组、全员发送及 5min 自动续期，使用自定义物品名称与数量）
 * @author 子沐呀 是春风呀233
 * @since 2026-07-27
 */

export class DropItemManager {
    constructor() {
        this.mDecrementingID = 9223372036854775807n;
        this.activeDrops = new Map(); // 存储掉落物的定时任务 { id: { timer, players } }
    }

    /**
     * 解析并获取玩家对象数组
     * @private
     */
    _resolvePlayers(targets) {
        if (!targets) {
            return mc.getOnlinePlayers();
        }
        const list = Array.isArray(targets) ? targets : [targets];
        return list.map(t => typeof t === 'string' ? mc.getPlayer(t) : t).filter(Boolean);
    }

    /**
     * 获取物品的自定义名称与数量字符串
     * @private
     * @param {Item} item 物品对象
     * @returns {string}
     */
    _getItemDisplayName(item) {
        const translateCode = (typeof config !== 'undefined' && config.get) ? (config.get("itemtranslateCode") ?? "zh_CN") : "zh_CN";
        const baseName = item.getTranslateName(translateCode)
        return baseName;
    }

    /**
     * 创建并发送添加掉落物实体数据包
     * @param {Item} item 物品对象
     * @param {FloatPos} pos 坐标
     * @param {Player | Player[] | string | string[]} [targets] 目标玩家（单个、数组、名字或不填）
     * @returns {{id: bigint}}
     */
    spawnDropItem(item, pos, targets) {
        const id = --this.mDecrementingID;
        const playerList = this._resolvePlayers(targets);
        const displayName = this._getItemDisplayName(item);

        // 1. 组装 AddItemActor 数据包
        const stream = new GMLIB_BinaryStream();
        stream.writePacketHeader(15);
        writeVarInt64ToStream(stream, id.toString()); // uniqueId
        writeUnsignedVarInt64ToStream(stream, id.toString()); // runtimeId
        stream.writeItem(item);
        stream.writeFloat(pos.x);
        stream.writeFloat(pos.y);
        stream.writeFloat(pos.z);
        stream.writeFloat(0);
        stream.writeFloat(0);
        stream.writeFloat(0);

        stream.writeUnsignedVarInt(3); // length
        stream.writeUnsignedVarInt(24); // ActorDataIDs::ClientEvent
        stream.writeUnsignedVarInt(1);  // DataItemType::Short
        stream.writeSignedShort(-32767);
        stream.writeUnsignedVarInt(81); // ActorDataIDs::NametagAlwaysShow
        stream.writeUnsignedVarInt(0);  // DataItemType::Byte
        stream.writeBool(true);
        stream.writeUnsignedVarInt(4);  // ActorDataIDs::Name
        stream.writeUnsignedVarInt(4);  // DataItemType::String
        stream.writeString(displayName);
        stream.writeBool(false)
        // 直接发给目标玩家列表
        playerList.forEach(player => {
            if (player) stream.sendTo(player);
        });

        // 2. 每隔 5 分钟自动发送一次更新包保证存活
        const timer = setInterval(() => {
            this.refreshDropItem(id, playerList, displayName);
        }, 5 * 60 * 1000);

        this.activeDrops.set(id, { timer, players: playerList, displayName });

        return id ;
    }

    /**
     * 创建并发送更新掉落物存在时间数据包 (SetActorData)
     * @param {bigint} id 实体ID
     * @param {Player | Player[] | string | string[]} [targets] 目标玩家
     * @param {string} [customName] 自定义名称
     */
    refreshDropItem(id, targets, customName) {
        const dropInfo = this.activeDrops.get(id);
        const playerList = targets ? this._resolvePlayers(targets) : (dropInfo?.players || mc.getOnlinePlayers());
        const displayName = customName || dropInfo?.displayName || "Dropped Item";

        const stream = new BinaryStream();
        writeUnsignedVarInt64ToStream(stream, id.toString()); // runtimeId
        stream.writeUnsignedVarInt(3); // length
        stream.writeUnsignedVarInt(24); // ActorDataIDs::ClientEvent
        stream.writeUnsignedVarInt(1);  // DataItemType::Short
        stream.writeSignedShort(-32767);
        stream.writeUnsignedVarInt(81); // ActorDataIDs::NametagAlwaysShow
        stream.writeUnsignedVarInt(0);  // DataItemType::Byte
        stream.writeBool(true);
        stream.writeUnsignedVarInt(4);  // ActorDataIDs::Name
        stream.writeUnsignedVarInt(4);  // DataItemType::String
        stream.writeString(displayName);
        stream.writeBool(false)
        stream.writeUnsignedVarInt(0);
        stream.writeUnsignedVarInt(0);
        stream.writeUnsignedVarInt(0);

        const pkt = stream.createPacket(39, true); // MinecraftPacketIds::SetActorData

        playerList.forEach(player => {
            if (player) player.sendPacket(pkt);
        });
    }

    /**
     * 创建并发送删除实体数据包
     * @param {bigint} id 实体ID
     * @param {Player | Player[] | string | string[]} [targets] 目标玩家
     */
    removeDropItem(id, targets) {
        const dropInfo = this.activeDrops.get(id);
        const playerList = targets ? this._resolvePlayers(targets) : (dropInfo?.players || mc.getOnlinePlayers());

        // 清除定时器
        if (dropInfo && dropInfo.timer) {
            clearInterval(dropInfo.timer);
            this.activeDrops.delete(id);
        }

        const stream = new BinaryStream();
        writeVarInt64ToStream(stream, id.toString()); // uniqueId
        const pkt = stream.createPacket(14, true); // MinecraftPacketIds::RemoveActor

        playerList.forEach(player => {
            if (player) player.sendPacket(pkt);
        });
    }
}

export function getItemChestFloatPosFromIntPos({ x, y, z, dimid }) {
    return new FloatPos(x + 0.5, y - 0.15, z + 0.5, dimid)
}
// const testitem1 = mc.newItem("apple", 1)
// const testitem2 = mc.newItem("bedrock", 1)
export const dropManager = new DropItemManager();
// dropManager.spawnDropItem(testitem1, getItemFloatPosFromIntPos(new IntPos(0, 104, 0, 0)), "ColdestCarp5592")
// dropManager.spawnDropItem(testitem2, getItemFloatPosFromIntPos(new IntPos(1, 104, 0, 0)), "ColdestCarp5592")

